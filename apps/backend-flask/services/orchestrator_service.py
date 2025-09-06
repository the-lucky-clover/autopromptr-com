import asyncio
import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import logging
from datetime import datetime
import uuid

from .gemini_service import GeminiService, GeminiConfig
from .playwright_service import PlaywrightService

logger = logging.getLogger(__name__)

@dataclass
class BatchTask:
    id: str
    prompt: str
    target_platform: str
    status: str = 'pending'
    result: Optional[Dict] = None
    error: Optional[str] = None
    created_at: str = None
    completed_at: Optional[str] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow().isoformat()

@dataclass
class BatchJob:
    id: str
    name: str
    description: str
    tasks: List[BatchTask]
    status: str = 'queued'
    created_at: str = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow().isoformat()

class AIOrchestrator:
    def __init__(self, gemini_config: GeminiConfig):
        self.gemini_service = GeminiService(gemini_config)
        self.playwright_service = PlaywrightService()
        self.active_jobs: Dict[str, BatchJob] = {}
        self.job_history: List[BatchJob] = []
        
    async def create_batch_job(self, name: str, description: str, prompts: List[Dict[str, Any]]) -> BatchJob:
        """Create a new batch job from prompts"""
        job_id = str(uuid.uuid4())
        
        tasks = []
        for i, prompt_data in enumerate(prompts):
            task = BatchTask(
                id=f"{job_id}-task-{i}",
                prompt=prompt_data.get('text', ''),
                target_platform=prompt_data.get('platform', 'lovable')
            )
            tasks.append(task)
        
        job = BatchJob(
            id=job_id,
            name=name,
            description=description,
            tasks=tasks
        )
        
        self.active_jobs[job_id] = job
        logger.info(f"Created batch job {job_id} with {len(tasks)} tasks")
        
        return job
    
    async def run_batch_job(self, job_id: str) -> Dict[str, Any]:
        """Execute a batch job"""
        if job_id not in self.active_jobs:
            raise ValueError(f"Job {job_id} not found")
        
        job = self.active_jobs[job_id]
        job.status = 'running'
        job.started_at = datetime.utcnow().isoformat()
        
        logger.info(f"Starting batch job {job_id}")
        
        try:
            # Process tasks in parallel batches
            batch_size = 3  # Process 3 tasks at a time
            for i in range(0, len(job.tasks), batch_size):
                batch_tasks = job.tasks[i:i + batch_size]
                await self._process_task_batch(batch_tasks)
            
            # Check overall job status
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
            
            return {
                'job_id': job_id,
                'status': job.status,
                'total_tasks': len(job.tasks),
                'completed_tasks': len(completed_tasks),
                'failed_tasks': len(failed_tasks)
            }
            
        except Exception as e:
            job.status = 'error'
            job.completed_at = datetime.utcnow().isoformat()
            logger.error(f"Batch job {job_id} failed: {str(e)}")
            raise
    
    async def _process_task_batch(self, tasks: List[BatchTask]):
        """Process a batch of tasks in parallel"""
        async def process_single_task(task: BatchTask):
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
                
                # Step 2: Execute with Playwright
                automation_result = await self.playwright_service.execute_prompt(
                    enhanced_prompt, 
                    task.target_platform
                )
                
                task.result = {
                    'gemini_response': gemini_result,
                    'automation_result': automation_result
                }
                task.status = 'completed'
                task.completed_at = datetime.utcnow().isoformat()
                
            except Exception as e:
                task.status = 'failed'
                task.error = str(e)
                task.completed_at = datetime.utcnow().isoformat()
                logger.error(f"Task {task.id} failed: {str(e)}")
        
        # Run tasks in parallel
        await asyncio.gather(*[process_single_task(task) for task in tasks])
    
    async def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get status of a batch job"""
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
            }
        }
    
    async def stop_job(self, job_id: str) -> Dict[str, Any]:
        """Stop a running batch job"""
        if job_id not in self.active_jobs:
            raise ValueError(f"Job {job_id} not found or not running")
        
        job = self.active_jobs[job_id]
        
        # Stop playwright operations
        await self.playwright_service.stop_all_operations()
        
        # Update job status
        job.status = 'stopped'
        job.completed_at = datetime.utcnow().isoformat()
        
        # Move to history
        self.job_history.append(job)
        del self.active_jobs[job_id]
        
        return {'status': 'stopped', 'job_id': job_id}
    
    async def list_jobs(self) -> Dict[str, Any]:
        """List all jobs (active and historical)"""
        return {
            'active_jobs': [asdict(job) for job in self.active_jobs.values()],
            'job_history': [asdict(job) for job in self.job_history[-10:]]  # Last 10 jobs
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Check health of all services"""
        gemini_health = await self.gemini_service.health_check()
        playwright_health = await self.playwright_service.health_check()
        
        return {
            'orchestrator': 'healthy',
            'gemini_service': gemini_health,
            'playwright_service': playwright_health,
            'active_jobs': len(self.active_jobs)
        }