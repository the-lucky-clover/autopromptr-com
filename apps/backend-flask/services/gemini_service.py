import asyncio
import json
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class GeminiConfig:
    api_key: str
    model: str = "gemini-1.5-flash"
    temperature: float = 0.7
    max_tokens: int = 1000

class GeminiService:
    def __init__(self, config: GeminiConfig):
        self.config = config
        genai.configure(api_key=config.api_key)
        self.model = genai.GenerativeModel(config.model)
    
    async def process_prompt(self, prompt: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process a single prompt through Gemini"""
        try:
            # Enhance prompt with context if provided
            enhanced_prompt = self._enhance_prompt(prompt, context)
            
            # Generate response
            response = await asyncio.get_event_loop().run_in_executor(
                None, 
                lambda: self.model.generate_content(enhanced_prompt)
            )
            
            return {
                'success': True,
                'response': response.text,
                'usage': {
                    'prompt_tokens': len(enhanced_prompt.split()),
                    'completion_tokens': len(response.text.split()) if response.text else 0
                }
            }
        except Exception as e:
            logger.error(f"Gemini processing failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'response': None
            }
    
    async def process_batch(self, prompts: List[str], context: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Process multiple prompts in parallel"""
        tasks = [
            self.process_prompt(prompt, context) 
            for prompt in prompts
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append({
                    'success': False,
                    'error': str(result),
                    'prompt_index': i
                })
            else:
                processed_results.append({
                    **result,
                    'prompt_index': i
                })
        
        return processed_results
    
    def _enhance_prompt(self, prompt: str, context: Dict[str, Any] = None) -> str:
        """Enhance prompt with context and formatting"""
        if not context:
            return prompt
        
        enhanced = f"""
Context: {json.dumps(context, indent=2)}

Task: {prompt}

Please provide a clear, actionable response that considers the given context.
"""
        return enhanced
    
    async def health_check(self) -> Dict[str, Any]:
        """Check if Gemini API is accessible"""
        try:
            test_response = await self.process_prompt("Hello, this is a test.")
            return {
                'status': 'healthy',
                'api_accessible': test_response['success'],
                'model': self.config.model
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e),
                'api_accessible': False
            }