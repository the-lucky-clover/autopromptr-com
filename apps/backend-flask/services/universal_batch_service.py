import asyncio
import logging
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from playwright_service import PlaywrightService
from enhanced_orchestrator_service import EnhancedOrchestratorService
from human_approval_service import HumanApprovalService

logger = logging.getLogger(__name__)

@dataclass
class BatchRequest:
    """Universal batch processing request"""
    batch_id: str
    batch_name: str
    target_url: str
    prompts: List[Dict[str, Any]]
    platform_type: str = 'auto-detect'
    automation_mode: str = 'hybrid'  # 'autonomous', 'supervised', 'hybrid'
    confidence_threshold: float = 0.8
    options: Dict[str, Any] = None

@dataclass
class BatchProgress:
    """Batch processing progress tracking"""
    batch_id: str
    status: str  # 'pending', 'running', 'paused', 'completed', 'failed', 'cancelled'
    current_prompt: int
    total_prompts: int
    completed_prompts: int
    failed_prompts: int
    progress_percentage: float
    current_action: str
    last_updated: str

class UniversalBatchService:
    """Universal batch processing service for all AI chatbot platforms"""
    
    def __init__(self):
        self.playwright_service = PlaywrightService()
        self.orchestrator = EnhancedOrchestratorService()
        self.approval_service = HumanApprovalService()
        self.active_batches: Dict[str, Dict] = {}
        self.batch_progress: Dict[str, BatchProgress] = {}
        
    async def initialize(self):
        """Initialize all services"""
        await self.playwright_service.initialize()
        logger.info("Universal Batch Service initialized")
        
    async def detect_platform(self, url: str) -> Dict[str, Any]:
        """Detect the platform type and chat interface"""
        try:
            await self.playwright_service.navigate_and_submit(url, "", None)
            
            # Platform detection logic
            page_title = await self.playwright_service.page.title()
            page_url = url.lower()
            
            platform_info = {
                'platform': 'unknown',
                'confidence': 0.5,
                'chat_selectors': [],
                'submit_methods': []
            }
            
            # ChatGPT detection
            if 'openai' in page_url or 'chatgpt' in page_url or 'chat.openai' in page_url:
                platform_info.update({
                    'platform': 'chatgpt',
                    'confidence': 0.95,
                    'chat_selectors': ['#prompt-textarea', 'textarea[data-id]', '[data-testid="textbox"]'],
                    'submit_methods': ['Enter', 'button[data-testid="send-button"]']
                })
            
            # Claude detection
            elif 'anthropic' in page_url or 'claude' in page_url:
                platform_info.update({
                    'platform': 'claude',
                    'confidence': 0.95,
                    'chat_selectors': ['div[contenteditable="true"]', 'textarea'],
                    'submit_methods': ['Enter', 'button[type="submit"]']
                })
            
            # Lovable detection
            elif 'lovable' in page_url or 'lovableproject' in page_url:
                platform_info.update({
                    'platform': 'lovable',
                    'confidence': 0.95,
                    'chat_selectors': ['textarea[placeholder*="Message"]', 'textarea[placeholder*="Chat"]'],
                    'submit_methods': ['Enter', '.send-button']
                })
            
            # Generic detection for other platforms
            else:
                # Look for common chat elements
                chat_elements = await self.playwright_service.page.query_selector_all(
                    'textarea, input[type="text"], div[contenteditable="true"]'
                )
                if chat_elements:
                    platform_info.update({
                        'platform': 'generic-chat',
                        'confidence': 0.7,
                        'chat_selectors': ['textarea', 'input[type="text"]', 'div[contenteditable="true"]'],
                        'submit_methods': ['Enter', 'button[type="submit"]']
                    })
            
            return platform_info
            
        except Exception as e:
            logger.error(f"Platform detection failed: {str(e)}")
            return {
                'platform': 'unknown',
                'confidence': 0.1,
                'error': str(e)
            }
    
    async def start_batch(self, batch_request: BatchRequest) -> Dict[str, Any]:
        """Start processing a batch of prompts"""
        try:
            batch_id = batch_request.batch_id
            
            # Initialize progress tracking
            self.batch_progress[batch_id] = BatchProgress(
                batch_id=batch_id,
                status='running',
                current_prompt=0,
                total_prompts=len(batch_request.prompts),
                completed_prompts=0,
                failed_prompts=0,
                progress_percentage=0.0,
                current_action='Starting batch processing',
                last_updated=str(asyncio.get_event_loop().time())
            )
            
            # Store batch info
            self.active_batches[batch_id] = {
                'request': batch_request,
                'task': None,
                'cancelled': False
            }
            
            # Detect platform if not specified
            if batch_request.platform_type == 'auto-detect':
                platform_info = await self.detect_platform(batch_request.target_url)
                batch_request.platform_type = platform_info['platform']
            
            # Start processing task
            task = asyncio.create_task(self._process_batch(batch_request))
            self.active_batches[batch_id]['task'] = task
            
            return {
                'success': True,
                'batch_id': batch_id,
                'status': 'started',
                'message': f'Batch processing started for {len(batch_request.prompts)} prompts'
            }
            
        except Exception as e:
            logger.error(f"Failed to start batch {batch_request.batch_id}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _process_batch(self, batch_request: BatchRequest):
        """Internal batch processing logic"""
        batch_id = batch_request.batch_id
        
        try:
            # Navigate to target URL
            await self.playwright_service.navigate_and_submit(
                batch_request.target_url, "", None
            )
            
            for i, prompt in enumerate(batch_request.prompts):
                if self.active_batches[batch_id]['cancelled']:
                    break
                
                # Update progress
                self.batch_progress[batch_id].current_prompt = i
                self.batch_progress[batch_id].current_action = f"Processing prompt {i+1}"
                
                try:
                    # Check if human approval needed
                    if batch_request.automation_mode in ['supervised', 'hybrid']:
                        confidence = prompt.get('confidence', 0.5)
                        if confidence < batch_request.confidence_threshold:
                            # Request human approval
                            approval_result = await self.approval_service.request_approval(
                                batch_id, f"prompt_{i}", prompt['text']
                            )
                            if not approval_result.get('approved'):
                                continue
                    
                    # Submit prompt
                    result = await self.playwright_service.navigate_and_submit(
                        batch_request.target_url, prompt['text']
                    )
                    
                    if result.get('success'):
                        self.batch_progress[batch_id].completed_prompts += 1
                    else:
                        self.batch_progress[batch_id].failed_prompts += 1
                        
                    # Update progress percentage
                    progress = ((i + 1) / len(batch_request.prompts)) * 100
                    self.batch_progress[batch_id].progress_percentage = progress
                    
                    # Delay between prompts
                    await asyncio.sleep(2)
                    
                except Exception as prompt_error:
                    logger.error(f"Prompt {i} failed: {str(prompt_error)}")
                    self.batch_progress[batch_id].failed_prompts += 1
            
            # Mark as completed
            self.batch_progress[batch_id].status = 'completed'
            self.batch_progress[batch_id].current_action = 'Batch completed'
            
        except Exception as e:
            logger.error(f"Batch processing failed: {str(e)}")
            self.batch_progress[batch_id].status = 'failed'
            self.batch_progress[batch_id].current_action = f'Failed: {str(e)}'
        
        finally:
            # Cleanup
            if batch_id in self.active_batches:
                del self.active_batches[batch_id]
    
    async def pause_batch(self, batch_id: str) -> Dict[str, Any]:
        """Pause an active batch"""
        if batch_id not in self.active_batches:
            return {'success': False, 'error': 'Batch not found'}
        
        self.batch_progress[batch_id].status = 'paused'
        return {'success': True, 'status': 'paused'}
    
    async def resume_batch(self, batch_id: str) -> Dict[str, Any]:
        """Resume a paused batch"""
        if batch_id not in self.batch_progress:
            return {'success': False, 'error': 'Batch not found'}
        
        if self.batch_progress[batch_id].status == 'paused':
            self.batch_progress[batch_id].status = 'running'
            return {'success': True, 'status': 'resumed'}
        
        return {'success': False, 'error': 'Batch is not paused'}
    
    async def cancel_batch(self, batch_id: str) -> Dict[str, Any]:
        """Cancel an active batch"""
        if batch_id not in self.active_batches:
            return {'success': False, 'error': 'Batch not found'}
        
        # Mark as cancelled
        self.active_batches[batch_id]['cancelled'] = True
        
        # Cancel the task
        task = self.active_batches[batch_id].get('task')
        if task and not task.done():
            task.cancel()
        
        # Update progress
        self.batch_progress[batch_id].status = 'cancelled'
        self.batch_progress[batch_id].current_action = 'Batch cancelled by user'
        
        return {'success': True, 'status': 'cancelled'}
    
    def get_batch_status(self, batch_id: str) -> Optional[BatchProgress]:
        """Get current status of a batch"""
        return self.batch_progress.get(batch_id)
    
    def get_all_batches(self) -> Dict[str, BatchProgress]:
        """Get status of all batches"""
        return self.batch_progress.copy()
    
    async def cleanup(self):
        """Cleanup all resources"""
        # Cancel all active batches
        for batch_id in list(self.active_batches.keys()):
            await self.cancel_batch(batch_id)
        
        # Cleanup playwright
        await self.playwright_service.cleanup()
        logger.info("Universal Batch Service cleaned up")