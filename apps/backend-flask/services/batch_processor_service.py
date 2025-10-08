"""
Batch Processor Service - Handles sequential batch processing with smart waiting
"""
import asyncio
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime
import logging

from services.playwright_service import PlaywrightService

logger = logging.getLogger(__name__)


class BatchProcessorService:
    """
    Processes batches of prompts sequentially with intelligent waiting
    This is the core MVP #1 orchestration service
    """
    
    def __init__(self):
        self.playwright_service = PlaywrightService()
        self.active_batches: Dict[str, Dict[str, Any]] = {}
        self.status_callbacks: Dict[str, Callable] = {}
    
    def register_status_callback(self, batch_id: str, callback: Callable):
        """Register a callback for batch status updates"""
        self.status_callbacks[batch_id] = callback
    
    async def _emit_status(self, batch_id: str, status_data: Dict[str, Any]):
        """Emit status update via callback if registered"""
        if batch_id in self.status_callbacks:
            try:
                await self.status_callbacks[batch_id](status_data)
            except Exception as e:
                logger.error(f"Status callback error: {str(e)}")
    
    async def process_batch(
        self,
        batch_id: str,
        target_url: str,
        prompts: List[Dict[str, Any]],
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a batch of prompts sequentially with smart waiting
        
        THE CORE MVP #1 IMPLEMENTATION
        
        Args:
            batch_id: Unique batch identifier
            target_url: Target URL (lovable.dev, v0.dev, etc.)
            prompts: List of prompt objects with 'text' field
            options: Optional configuration (wait_for_completion, max_retries, etc.)
        
        Returns:
            Dict with batch results
        """
        options = options or {}
        wait_for_completion = options.get('wait_for_completion', True)
        max_retries = options.get('max_retries', 3)
        
        logger.info(f"🚀 Starting batch processing: {batch_id}")
        logger.info(f"📊 Target: {target_url}")
        logger.info(f"📝 Total prompts: {len(prompts)}")
        logger.info(f"⏳ Wait for completion: {wait_for_completion}")
        
        # Initialize batch status
        self.active_batches[batch_id] = {
            'status': 'processing',
            'total_prompts': len(prompts),
            'completed': 0,
            'failed': 0,
            'current_prompt_index': 0,
            'started_at': datetime.now().isoformat(),
            'results': []
        }
        
        try:
            # Initialize Playwright
            await self.playwright_service.initialize()
            
            # Navigate to target once
            logger.info(f"🌐 Navigating to {target_url}")
            await self.playwright_service.page.goto(target_url, wait_until='networkidle')
            
            # Process each prompt in sequence
            for index, prompt_obj in enumerate(prompts):
                prompt_text = prompt_obj.get('text', '')
                prompt_id = prompt_obj.get('id', f'prompt_{index}')
                
                logger.info(f"\n{'='*60}")
                logger.info(f"📍 Processing prompt {index + 1}/{len(prompts)}")
                logger.info(f"🆔 Prompt ID: {prompt_id}")
                logger.info(f"📝 Prompt text: {prompt_text[:100]}...")
                logger.info(f"{'='*60}\n")
                
                # Update status
                self.active_batches[batch_id]['current_prompt_index'] = index
                await self._emit_status(batch_id, {
                    'batch_id': batch_id,
                    'status': 'processing',
                    'current_prompt': index + 1,
                    'total_prompts': len(prompts),
                    'prompt_text': prompt_text[:100]
                })
                
                # Process with retries
                retry_count = 0
                success = False
                result = None
                
                while retry_count < max_retries and not success:
                    try:
                        # THE MAGIC: navigate_and_submit with wait_for_completion=True
                        result = await self.playwright_service.navigate_and_submit(
                            url=target_url,
                            prompt=prompt_text,
                            wait_for_completion=wait_for_completion
                        )
                        
                        if result['success']:
                            success = True
                            logger.info(f"✅ Prompt {index + 1} completed successfully")
                            logger.info(f"⏱️ Wait time: {result.get('wait_time_seconds', 0):.2f}s")
                            
                            self.active_batches[batch_id]['completed'] += 1
                            self.active_batches[batch_id]['results'].append({
                                'prompt_id': prompt_id,
                                'prompt_text': prompt_text,
                                'status': 'completed',
                                'result': result,
                                'retry_count': retry_count
                            })
                        else:
                            raise Exception(result.get('error', 'Unknown error'))
                            
                    except Exception as e:
                        retry_count += 1
                        logger.warning(f"⚠️ Attempt {retry_count}/{max_retries} failed: {str(e)}")
                        
                        if retry_count < max_retries:
                            logger.info(f"🔄 Retrying in 3 seconds...")
                            await asyncio.sleep(3)
                        else:
                            logger.error(f"❌ Prompt {index + 1} failed after {max_retries} attempts")
                            self.active_batches[batch_id]['failed'] += 1
                            self.active_batches[batch_id]['results'].append({
                                'prompt_id': prompt_id,
                                'prompt_text': prompt_text,
                                'status': 'failed',
                                'error': str(e),
                                'retry_count': retry_count
                            })
                
                # Emit progress update
                await self._emit_status(batch_id, {
                    'batch_id': batch_id,
                    'status': 'processing',
                    'completed': self.active_batches[batch_id]['completed'],
                    'failed': self.active_batches[batch_id]['failed'],
                    'progress_percentage': ((index + 1) / len(prompts)) * 100
                })
                
                logger.info(f"✅ Prompt {index + 1}/{len(prompts)} complete")
                logger.info(f"📊 Success: {self.active_batches[batch_id]['completed']} | Failed: {self.active_batches[batch_id]['failed']}")
            
            # Batch complete
            final_status = {
                'batch_id': batch_id,
                'status': 'completed',
                'total_prompts': len(prompts),
                'completed': self.active_batches[batch_id]['completed'],
                'failed': self.active_batches[batch_id]['failed'],
                'results': self.active_batches[batch_id]['results'],
                'started_at': self.active_batches[batch_id]['started_at'],
                'completed_at': datetime.now().isoformat()
            }
            
            self.active_batches[batch_id]['status'] = 'completed'
            self.active_batches[batch_id]['completed_at'] = datetime.now().isoformat()
            
            await self._emit_status(batch_id, final_status)
            
            logger.info(f"\n🎉 Batch {batch_id} completed!")
            logger.info(f"✅ Success: {final_status['completed']}/{len(prompts)}")
            logger.info(f"❌ Failed: {final_status['failed']}/{len(prompts)}")
            
            return final_status
            
        except Exception as e:
            logger.error(f"❌ Batch processing error: {str(e)}")
            
            error_status = {
                'batch_id': batch_id,
                'status': 'failed',
                'error': str(e),
                'completed': self.active_batches[batch_id]['completed'],
                'failed': self.active_batches[batch_id]['failed']
            }
            
            self.active_batches[batch_id]['status'] = 'failed'
            self.active_batches[batch_id]['error'] = str(e)
            
            await self._emit_status(batch_id, error_status)
            
            return error_status
            
        finally:
            # Cleanup
            await self.playwright_service.cleanup()
            if batch_id in self.status_callbacks:
                del self.status_callbacks[batch_id]
    
    def get_batch_status(self, batch_id: str) -> Optional[Dict[str, Any]]:
        """Get current status of a batch"""
        return self.active_batches.get(batch_id)
    
    async def stop_batch(self, batch_id: str) -> bool:
        """Stop a running batch"""
        if batch_id in self.active_batches:
            self.active_batches[batch_id]['status'] = 'stopped'
            await self.playwright_service.cleanup()
            return True
        return False


# Global service instance
batch_processor_service = BatchProcessorService()
