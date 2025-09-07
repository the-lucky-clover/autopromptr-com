"""
Enhanced AI Orchestrator with Human-in-the-Loop capabilities
"""
import asyncio
import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import logging
from datetime import datetime
import uuid

from .gemini_service import GeminiService, GeminiConfig
from .playwright_service import PlaywrightService
from .human_approval_service import HumanApprovalService, ApprovalStatus, human_approval_service

logger = logging.getLogger(__name__)

@dataclass
class EnhancedBatchTask:
    id: str
    prompt: str
    target_platform: str
    status: str = 'pending'
    result: Optional[Dict] = None
    error: Optional[str] = None
    created_at: str = None
    completed_at: Optional[str] = None
    approval_requests: List[str] = None  # List of approval request IDs
    human_interventions: List[Dict] = None  # List of human interventions
    confidence_scores: Dict[str, float] = None  # Confidence scores for different actions
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow().isoformat()
        if self.approval_requests is None:
            self.approval_requests = []
        if self.human_interventions is None:
            self.human_interventions = []
        if self.confidence_scores is None:
            self.confidence_scores = {}

@dataclass
class EnhancedBatchJob:
    id: str
    name: str
    description: str
    tasks: List[EnhancedBatchTask]
    status: str = 'queued'
    created_at: str = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    human_oversight_enabled: bool = True
    auto_approval_threshold: float = 0.8
    step_by_step_mode: bool = False
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow().isoformat()

class EnhancedAIOrchestrator:
    def __init__(self, gemini_config: GeminiConfig):
        self.gemini_service = GeminiService(gemini_config)
        self.playwright_service = PlaywrightService()
        self.approval_service = human_approval_service
        self.active_jobs: Dict[str, EnhancedBatchJob] = {}
        self.job_history: List[EnhancedBatchJob] = []
        self.websocket_callbacks: List = []
        
    def register_websocket_callback(self, callback):
        """Register WebSocket callback for real-time updates"""
        self.websocket_callbacks.append(callback)
        self.approval_service.register_websocket_callback(callback)
    
    async def create_batch_job(
        self, 
        name: str, 
        description: str, 
        prompts: List[Dict[str, Any]],
        human_oversight_enabled: bool = True,
        step_by_step_mode: bool = False,
        auto_approval_threshold: float = 0.8
    ) -> EnhancedBatchJob:
        """Create a new enhanced batch job with human oversight options"""
        job_id = str(uuid.uuid4())
        
        tasks = []
        for i, prompt_data in enumerate(prompts):
            task = EnhancedBatchTask(
                id=f"{job_id}-task-{i}",
                prompt=prompt_data.get('text', ''),
                target_platform=prompt_data.get('platform', 'lovable')
            )
            tasks.append(task)
        
        job = EnhancedBatchJob(
            id=job_id,
            name=name,
            description=description,
            tasks=tasks,
            human_oversight_enabled=human_oversight_enabled,
            step_by_step_mode=step_by_step_mode,
            auto_approval_threshold=auto_approval_threshold
        )
        
        self.active_jobs[job_id] = job
        logger.info(f"Created enhanced batch job {job_id} with {len(tasks)} tasks")
        
        await self._notify_websockets('job_created', job)
        
        return job
    
    async def run_batch_job(self, job_id: str) -> Dict[str, Any]:
        """Execute enhanced batch job with human-in-the-loop capabilities"""
        if job_id not in self.active_jobs:
            raise ValueError(f"Job {job_id} not found")
        
        job = self.active_jobs[job_id]
        job.status = 'running'
        job.started_at = datetime.utcnow().isoformat()
        
        logger.info(f"Starting enhanced batch job {job_id} with human oversight: {job.human_oversight_enabled}")
        
        await self._notify_websockets('job_started', job)
        
        try:
            if job.step_by_step_mode:
                # Process tasks one by one with approval for each
                for task in job.tasks:
                    await self._process_single_task_with_oversight(task, job)
            else:
                # Process in batches but with approval checkpoints
                batch_size = 3
                for i in range(0, len(job.tasks), batch_size):
                    batch_tasks = job.tasks[i:i + batch_size]
                    await self._process_task_batch_with_oversight(batch_tasks, job)
            
            # Calculate final job status
            failed_tasks = [t for t in job.tasks if t.status == 'failed']
            completed_tasks = [t for t in job.tasks if t.status == 'completed']
            
            if len(failed_tasks) == 0:
                job.status = 'completed'
            elif len(completed_tasks) > 0:
                job.status = 'partial_success'
            else:
                job.status = 'failed'
            
            job.completed_at = datetime.utcnow().isoformat()
            
            # Move to history
            self.job_history.append(job)
            del self.active_jobs[job_id]
            
            await self._notify_websockets('job_completed', job)
            
            return {
                'job_id': job_id,
                'status': job.status,
                'total_tasks': len(job.tasks),
                'completed_tasks': len(completed_tasks),
                'failed_tasks': len(failed_tasks),
                'human_interventions': sum(len(t.human_interventions) for t in job.tasks),
                'approval_requests': sum(len(t.approval_requests) for t in job.tasks)
            }
            
        except Exception as e:
            job.status = 'error'
            job.completed_at = datetime.utcnow().isoformat()
            logger.error(f"Enhanced batch job {job_id} failed: {str(e)}")
            await self._notify_websockets('job_error', {'job': job, 'error': str(e)})
            raise
    
    async def _process_single_task_with_oversight(self, task: EnhancedBatchTask, job: EnhancedBatchJob):
        """Process a single task with human oversight"""
        try:
            task.status = 'processing'
            await self._notify_websockets('task_started', {'task': task, 'job_id': job.id})
            
            # Step 1: Analyze task with AI to determine confidence and approach
            analysis_result = await self._analyze_task_with_ai(task, job)
            task.confidence_scores.update(analysis_result['confidence_scores'])
            
            # Step 2: Request approval if needed
            if job.human_oversight_enabled:
                approval_needed = self._requires_approval(task, job, analysis_result)
                
                if approval_needed:
                    approval_request = await self.approval_service.request_approval(
                        task_id=task.id,
                        agent_id='enhanced-orchestrator',
                        action_type='execute_task',
                        description=f"Execute task: {task.prompt[:100]}...",
                        context={
                            'task': asdict(task),
                            'analysis': analysis_result,
                            'job_config': {
                                'step_by_step_mode': job.step_by_step_mode,
                                'auto_approval_threshold': job.auto_approval_threshold
                            }
                        },
                        confidence=analysis_result['overall_confidence']
                    )
                    
                    task.approval_requests.append(approval_request.id)
                    
                    # Wait for approval
                    approval_response = await self.approval_service.wait_for_approval(
                        approval_request.id, 
                        timeout_seconds=300
                    )
                    
                    if approval_response.status != ApprovalStatus.APPROVED:
                        task.status = 'failed'
                        task.error = f"Task rejected or timed out: {approval_response.status.value}"
                        
                        if approval_response.response_data and approval_response.response_data.get('reasoning'):
                            task.error += f" - {approval_response.response_data['reasoning']}"
                        
                        return
                    
                    # Apply any modifications from human approval
                    if approval_response.response_data and approval_response.response_data.get('modifications'):
                        modifications = approval_response.response_data['modifications']
                        task.human_interventions.append({
                            'type': 'modification',
                            'changes': modifications,
                            'timestamp': datetime.utcnow().isoformat()
                        })
                        # Apply modifications to task
                        if 'prompt' in modifications:
                            task.prompt = modifications['prompt']
            
            # Step 3: Execute the task
            await self._execute_enhanced_task(task, job)
            
        except Exception as e:
            task.status = 'failed'
            task.error = str(e)
            logger.error(f"Enhanced task {task.id} failed: {str(e)}")
            await self._notify_websockets('task_failed', {'task': task, 'job_id': job.id, 'error': str(e)})
    
    async def _process_task_batch_with_oversight(self, tasks: List[EnhancedBatchTask], job: EnhancedBatchJob):
        """Process a batch of tasks with oversight"""
        # For batch mode, we still check each task but can run them in parallel after approval
        approved_tasks = []
        
        for task in tasks:
            task.status = 'analyzing'
            analysis_result = await self._analyze_task_with_ai(task, job)
            task.confidence_scores.update(analysis_result['confidence_scores'])
            
            if job.human_oversight_enabled and self._requires_approval(task, job, analysis_result):
                # Request approval for this task
                approval_request = await self.approval_service.request_approval(
                    task_id=task.id,
                    agent_id='enhanced-orchestrator',
                    action_type='execute_task_batch',
                    description=f"Execute batch task: {task.prompt[:100]}...",
                    context={
                        'task': asdict(task),
                        'analysis': analysis_result,
                        'batch_size': len(tasks)
                    },
                    confidence=analysis_result['overall_confidence']
                )
                
                task.approval_requests.append(approval_request.id)
                
                # For batch mode, we can continue with other tasks while waiting
                # but we'll check approvals before execution
        
        # Wait for all approvals and execute approved tasks
        execution_tasks = []
        for task in tasks:
            if task.approval_requests:
                # Check approval status
                for approval_id in task.approval_requests:
                    try:
                        approval_response = await self.approval_service.wait_for_approval(approval_id, 60)
                        if approval_response.status == ApprovalStatus.APPROVED:
                            approved_tasks.append(task)
                    except:
                        task.status = 'failed'
                        task.error = 'Approval timeout or error'
            else:
                # No approval needed
                approved_tasks.append(task)
        
        # Execute approved tasks in parallel
        execution_tasks = [self._execute_enhanced_task(task, job) for task in approved_tasks]
        if execution_tasks:
            await asyncio.gather(*execution_tasks, return_exceptions=True)
    
    async def _analyze_task_with_ai(self, task: EnhancedBatchTask, job: EnhancedBatchJob) -> Dict[str, Any]:
        """Use AI to analyze task and determine confidence levels"""
        try:
            # Enhanced analysis using Gemini
            analysis_prompt = f"""
            Analyze this automation task and provide confidence scores:
            
            Task: {task.prompt}
            Target Platform: {task.target_platform}
            
            Please analyze:
            1. Complexity of the task (0.0-1.0)
            2. Risk level (0.0-1.0, where 1.0 is highest risk)
            3. Success probability (0.0-1.0)
            4. Required human oversight (0.0-1.0)
            
            Return JSON format with confidence scores and reasoning.
            """
            
            gemini_result = await self.gemini_service.process_prompt(
                analysis_prompt,
                context={'task_analysis': True}
            )
            
            if gemini_result['success']:
                # Parse AI response for confidence scores
                ai_analysis = gemini_result['response']
                
                # Extract confidence scores (simplified for demo)
                confidence_scores = {
                    'complexity': 0.5,  # Would parse from AI response
                    'risk': 0.3,
                    'success_probability': 0.8,
                    'oversight_needed': 0.4
                }
                
                # Calculate overall confidence
                overall_confidence = (
                    confidence_scores['success_probability'] * 0.4 +
                    (1 - confidence_scores['risk']) * 0.3 +
                    (1 - confidence_scores['complexity']) * 0.2 +
                    (1 - confidence_scores['oversight_needed']) * 0.1
                )
                
                return {
                    'confidence_scores': confidence_scores,
                    'overall_confidence': overall_confidence,
                    'ai_analysis': ai_analysis,
                    'recommendation': 'proceed' if overall_confidence > 0.7 else 'review_needed'
                }
            
        except Exception as e:
            logger.error(f"Task analysis failed: {str(e)}")
        
        # Fallback if AI analysis fails
        return {
            'confidence_scores': {
                'complexity': 0.5,
                'risk': 0.5,
                'success_probability': 0.5,
                'oversight_needed': 0.8
            },
            'overall_confidence': 0.4,
            'ai_analysis': 'Analysis failed - using conservative defaults',
            'recommendation': 'review_needed'
        }
    
    def _requires_approval(self, task: EnhancedBatchTask, job: EnhancedBatchJob, analysis: Dict[str, Any]) -> bool:
        """Determine if task requires human approval"""
        overall_confidence = analysis['overall_confidence']
        
        # Always require approval in step-by-step mode
        if job.step_by_step_mode:
            return True
        
        # Require approval if confidence is below threshold
        if overall_confidence < job.auto_approval_threshold:
            return True
        
        # High-risk actions always need approval
        if analysis['confidence_scores']['risk'] > 0.7:
            return True
        
        return False
    
    async def _execute_enhanced_task(self, task: EnhancedBatchTask, job: EnhancedBatchJob):
        """Execute task with enhanced monitoring and screenshots"""
        try:
            task.status = 'processing'
            
            # Step 1: Enhance prompt with Gemini
            gemini_result = await self.gemini_service.process_prompt(
                task.prompt,
                context={'target_platform': task.target_platform}
            )
            
            if not gemini_result['success']:
                raise Exception(f"Gemini processing failed: {gemini_result['error']}")
            
            enhanced_prompt = gemini_result['response']
            
            # Step 2: Take screenshot before automation
            await self.playwright_service.initialize()
            
            # Step 3: Execute with Playwright with enhanced monitoring
            automation_result = await self.playwright_service.navigate_and_submit(
                url=f"https://{task.target_platform}.dev",  # Simplified URL logic
                prompt=enhanced_prompt
            )
            
            task.result = {
                'gemini_response': gemini_result,
                'automation_result': automation_result,
                'screenshots': {
                    'final': automation_result.get('screenshot', '')
                }
            }
            task.status = 'completed'
            task.completed_at = datetime.utcnow().isoformat()
            
            await self._notify_websockets('task_completed', {'task': task, 'job_id': job.id})
            
        except Exception as e:
            task.status = 'failed'
            task.error = str(e)
            task.completed_at = datetime.utcnow().isoformat()
            logger.error(f"Enhanced task {task.id} failed: {str(e)}")
            await self._notify_websockets('task_failed', {'task': task, 'job_id': job.id, 'error': str(e)})
    
    async def pause_job(self, job_id: str) -> Dict[str, Any]:
        """Pause a running job for human intervention"""
        if job_id not in self.active_jobs:
            raise ValueError(f"Job {job_id} not found or not running")
        
        job = self.active_jobs[job_id]
        job.status = 'paused'
        
        await self._notify_websockets('job_paused', job)
        
        return {'status': 'paused', 'job_id': job_id}
    
    async def resume_job(self, job_id: str) -> Dict[str, Any]:
        """Resume a paused job"""
        if job_id not in self.active_jobs:
            raise ValueError(f"Job {job_id} not found")
        
        job = self.active_jobs[job_id]
        if job.status != 'paused':
            raise ValueError(f"Job {job_id} is not paused")
        
        job.status = 'running'
        
        await self._notify_websockets('job_resumed', job)
        
        return {'status': 'resumed', 'job_id': job_id}
    
    async def get_pending_approvals(self) -> List[Dict]:
        """Get all pending approval requests"""
        return [asdict(approval) for approval in self.approval_service.get_pending_approvals()]
    
    async def respond_to_approval(
        self, 
        approval_id: str, 
        decision: str, 
        reasoning: str = "",
        modifications: Optional[Dict] = None
    ) -> bool:
        """Respond to an approval request"""
        status_map = {
            'approve': ApprovalStatus.APPROVED,
            'reject': ApprovalStatus.REJECTED
        }
        
        if decision not in status_map:
            raise ValueError(f"Invalid decision: {decision}")
        
        return await self.approval_service.respond_to_approval(
            approval_id=approval_id,
            decision=status_map[decision],
            reasoning=reasoning,
            modifications=modifications
        )
    
    async def _notify_websockets(self, event_type: str, data: Any):
        """Notify WebSocket clients"""
        message = {
            'type': event_type,
            'data': asdict(data) if hasattr(data, '__dict__') else data,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        for callback in self.websocket_callbacks:
            try:
                await callback(message)
            except Exception as e:
                logger.error(f"WebSocket notification failed: {str(e)}")
    
    # All existing methods from original orchestrator
    async def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get enhanced job status"""
        # Check active jobs first
        if job_id in self.active_jobs:
            job = self.active_jobs[job_id]
        else:
            # Check history
            job = next((j for j in self.job_history if j.id == job_id), None)
            if not job:
                raise ValueError(f"Job {job_id} not found")
        
        return {
            'job': asdict(job),
            'progress': {
                'total': len(job.tasks),
                'completed': len([t for t in job.tasks if t.status == 'completed']),
                'failed': len([t for t in job.tasks if t.status == 'failed']),
                'processing': len([t for t in job.tasks if t.status == 'processing']),
                'pending': len([t for t in job.tasks if t.status == 'pending'])
            },
            'approval_stats': {
                'total_approvals': sum(len(t.approval_requests) for t in job.tasks),
                'human_interventions': sum(len(t.human_interventions) for t in job.tasks),
                'average_confidence': sum(max(t.confidence_scores.values()) if t.confidence_scores else 0 for t in job.tasks) / len(job.tasks) if job.tasks else 0
            }
        }
    
    async def stop_job(self, job_id: str) -> Dict[str, Any]:
        """Stop an enhanced job"""
        if job_id not in self.active_jobs:
            raise ValueError(f"Job {job_id} not found or not running")
        
        job = self.active_jobs[job_id]
        
        # Stop playwright operations
        await self.playwright_service.cleanup()
        
        # Update job status
        job.status = 'stopped'
        job.completed_at = datetime.utcnow().isoformat()
        
        # Move to history
        self.job_history.append(job)
        del self.active_jobs[job_id]
        
        await self._notify_websockets('job_stopped', job)
        
        return {'status': 'stopped', 'job_id': job_id}
    
    async def list_jobs(self) -> Dict[str, Any]:
        """List all enhanced jobs"""
        return {
            'active_jobs': [asdict(job) for job in self.active_jobs.values()],
            'job_history': [asdict(job) for job in self.job_history[-10:]]
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Enhanced health check"""
        gemini_health = await self.gemini_service.health_check()
        playwright_health = await self.playwright_service.health_check()
        approval_stats = self.approval_service.get_approval_stats()
        
        return {
            'orchestrator': 'healthy',
            'enhanced_features': 'enabled',
            'gemini_service': gemini_health,
            'playwright_service': playwright_health,
            'approval_service': {
                'status': 'healthy',
                'pending_approvals': len(self.approval_service.get_pending_approvals()),
                'stats': approval_stats
            },
            'active_jobs': len(self.active_jobs),
            'websocket_callbacks': len(self.websocket_callbacks)
        }