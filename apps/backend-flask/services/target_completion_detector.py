"""
Target Completion Detector - Smart waiting logic for AI platforms
Detects when a target system (lovable.dev, v0.dev, ChatGPT, etc.) has finished processing
"""
import asyncio
from typing import Dict, Any, Optional, List
from playwright.async_api import Page
import logging

logger = logging.getLogger(__name__)


class PlatformDetectionResult:
    """Results from platform detection"""
    def __init__(self, platform_type: str, selectors: Dict[str, str], wait_strategy: str):
        self.platform_type = platform_type
        self.selectors = selectors
        self.wait_strategy = wait_strategy


class TargetCompletionDetector:
    """Detects when target AI system has completed processing and is ready for next prompt"""
    
    # Platform-specific completion indicators
    PLATFORM_SIGNATURES = {
        'lovable.dev': {
            'input_selector': 'textarea[placeholder*="message"]',
            'submit_button': 'button[type="submit"]',
            'processing_indicators': [
                '.animate-pulse',
                '[data-state="loading"]',
                'button:has-text("Stop")',
                '.building-indicator'
            ],
            'completion_indicators': [
                'button:has-text("Send")',
                'textarea:not([disabled])',
                '.build-complete'
            ],
            'wait_strategy': 'button_state_change'
        },
        'v0.dev': {
            'input_selector': 'textarea[placeholder*="Describe"]',
            'submit_button': 'button[aria-label="Send"]',
            'processing_indicators': [
                '.generating',
                'button:has-text("Stop generating")',
                '[role="status"]'
            ],
            'completion_indicators': [
                'button[aria-label="Send"]:not([disabled])',
                '.generation-complete'
            ],
            'wait_strategy': 'generation_complete'
        },
        'chatgpt': {
            'input_selector': '#prompt-textarea',
            'submit_button': 'button[data-testid="send-button"]',
            'processing_indicators': [
                'button[data-testid="stop-button"]',
                '.result-streaming'
            ],
            'completion_indicators': [
                'button[data-testid="send-button"]:not([disabled])'
            ],
            'wait_strategy': 'stop_button_disappears'
        },
        'claude.ai': {
            'input_selector': 'div[contenteditable="true"]',
            'submit_button': 'button[aria-label="Send Message"]',
            'processing_indicators': [
                'button[aria-label="Stop"]',
                '.typing-indicator'
            ],
            'completion_indicators': [
                'button[aria-label="Send Message"]:not([disabled])'
            ],
            'wait_strategy': 'stop_button_disappears'
        },
        'cursor': {
            'type': 'local',
            'detection': 'electron_api'
        },
        'windsurf': {
            'type': 'local',
            'detection': 'electron_api'
        },
        'vscode': {
            'type': 'local',
            'detection': 'extension_api'
        }
    }

    def __init__(self, page: Page):
        self.page = page
        self.detected_platform: Optional[PlatformDetectionResult] = None
        self.max_wait_time = 300  # 5 minutes max wait per prompt
        self.poll_interval = 1.0  # Check every 1 second

    async def detect_platform(self) -> PlatformDetectionResult:
        """Detect which AI platform we're on based on URL and DOM structure"""
        url = self.page.url.lower()
        
        logger.info(f"Detecting platform for URL: {url}")
        
        # Check URL patterns
        for platform, config in self.PLATFORM_SIGNATURES.items():
            if config.get('type') == 'local':
                continue  # Skip local platforms for web detection
                
            if platform in url or platform.replace('.', '') in url:
                logger.info(f"Platform detected: {platform}")
                self.detected_platform = PlatformDetectionResult(
                    platform_type=platform,
                    selectors=config,
                    wait_strategy=config['wait_strategy']
                )
                return self.detected_platform
        
        # Fallback: Try to detect based on DOM structure
        logger.info("Platform not detected from URL, attempting DOM-based detection...")
        for platform, config in self.PLATFORM_SIGNATURES.items():
            if config.get('type') == 'local':
                continue
                
            try:
                input_exists = await self.page.query_selector(config['input_selector'])
                if input_exists:
                    logger.info(f"Platform detected from DOM: {platform}")
                    self.detected_platform = PlatformDetectionResult(
                        platform_type=platform,
                        selectors=config,
                        wait_strategy=config['wait_strategy']
                    )
                    return self.detected_platform
            except:
                continue
        
        # Ultimate fallback: Generic web-based AI
        logger.warning("Using generic platform detection")
        self.detected_platform = PlatformDetectionResult(
            platform_type='generic',
            selectors={
                'input_selector': 'textarea, input[type="text"], [contenteditable="true"]',
                'submit_button': 'button[type="submit"], button:has-text("Send")',
                'processing_indicators': ['.loading', '.processing', '[aria-busy="true"]'],
                'completion_indicators': ['button:not([disabled])'],
                'wait_strategy': 'network_idle'
            },
            wait_strategy='network_idle'
        )
        return self.detected_platform

    async def wait_for_processing_to_start(self, timeout: int = 10) -> bool:
        """Wait for the target to show signs of processing the prompt"""
        if not self.detected_platform:
            await self.detect_platform()
        
        selectors = self.detected_platform.selectors
        processing_indicators = selectors.get('processing_indicators', [])
        
        logger.info(f"Waiting for processing to start (max {timeout}s)...")
        
        start_time = asyncio.get_event_loop().time()
        while (asyncio.get_event_loop().time() - start_time) < timeout:
            # Check if any processing indicator is visible
            for indicator in processing_indicators:
                try:
                    element = await self.page.query_selector(indicator)
                    if element and await element.is_visible():
                        logger.info(f"Processing started - detected indicator: {indicator}")
                        return True
                except:
                    continue
            
            await asyncio.sleep(0.5)
        
        logger.warning("Processing indicators not detected, assuming processing started")
        return True

    async def wait_for_completion(self, timeout: Optional[int] = None) -> Dict[str, Any]:
        """
        THE CORE MVP #1 FUNCTION
        Intelligently waits until target system is idle and ready for next prompt
        """
        if timeout is None:
            timeout = self.max_wait_time
        
        if not self.detected_platform:
            await self.detect_platform()
        
        platform = self.detected_platform.platform_type
        strategy = self.detected_platform.wait_strategy
        selectors = self.detected_platform.selectors
        
        logger.info(f"🎯 Starting smart wait for {platform} using strategy: {strategy}")
        
        start_time = asyncio.get_event_loop().time()
        checks_performed = 0
        
        try:
            # Strategy-specific waiting logic
            if strategy == 'button_state_change':
                result = await self._wait_button_state_change(selectors, timeout)
            elif strategy == 'stop_button_disappears':
                result = await self._wait_stop_button_disappears(selectors, timeout)
            elif strategy == 'generation_complete':
                result = await self._wait_generation_complete(selectors, timeout)
            elif strategy == 'network_idle':
                result = await self._wait_network_idle(timeout)
            else:
                result = await self._wait_generic(selectors, timeout)
            
            elapsed = asyncio.get_event_loop().time() - start_time
            
            logger.info(f"✅ Target system ready after {elapsed:.2f}s")
            
            return {
                'success': True,
                'platform': platform,
                'strategy_used': strategy,
                'wait_time_seconds': elapsed,
                'checks_performed': checks_performed,
                'ready_for_next': True
            }
            
        except asyncio.TimeoutError:
            logger.error(f"⏱️ Timeout waiting for completion after {timeout}s")
            return {
                'success': False,
                'error': 'Timeout waiting for target to complete',
                'platform': platform,
                'wait_time_seconds': timeout,
                'ready_for_next': False
            }
        except Exception as e:
            logger.error(f"❌ Error during wait: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'platform': platform,
                'ready_for_next': False
            }

    async def _wait_button_state_change(self, selectors: Dict, timeout: int) -> bool:
        """Wait for submit button to change from disabled/processing to enabled"""
        submit_selector = selectors.get('submit_button')
        processing_indicators = selectors.get('processing_indicators', [])
        
        logger.info("Waiting for button state change...")
        
        end_time = asyncio.get_event_loop().time() + timeout
        
        while asyncio.get_event_loop().time() < end_time:
            # Check if processing indicators are gone
            all_processing_done = True
            for indicator in processing_indicators:
                try:
                    element = await self.page.query_selector(indicator)
                    if element and await element.is_visible():
                        all_processing_done = False
                        break
                except:
                    continue
            
            # Check if submit button is enabled
            if all_processing_done and submit_selector:
                try:
                    button = await self.page.query_selector(submit_selector)
                    if button:
                        is_disabled = await button.get_attribute('disabled')
                        is_visible = await button.is_visible()
                        if not is_disabled and is_visible:
                            logger.info("Submit button is enabled - system ready")
                            return True
                except:
                    pass
            
            await asyncio.sleep(self.poll_interval)
        
        raise asyncio.TimeoutError()

    async def _wait_stop_button_disappears(self, selectors: Dict, timeout: int) -> bool:
        """Wait for 'Stop' button to disappear (ChatGPT, Claude style)"""
        processing_indicators = selectors.get('processing_indicators', [])
        
        logger.info("Waiting for stop button to disappear...")
        
        end_time = asyncio.get_event_loop().time() + timeout
        
        while asyncio.get_event_loop().time() < end_time:
            # Check if all processing indicators are gone
            all_gone = True
            for indicator in processing_indicators:
                try:
                    element = await self.page.query_selector(indicator)
                    if element and await element.is_visible():
                        all_gone = False
                        break
                except:
                    continue
            
            if all_gone:
                # Wait an additional 2 seconds to ensure completion
                await asyncio.sleep(2)
                logger.info("Stop button disappeared - system ready")
                return True
            
            await asyncio.sleep(self.poll_interval)
        
        raise asyncio.TimeoutError()

    async def _wait_generation_complete(self, selectors: Dict, timeout: int) -> bool:
        """Wait for generation complete indicator (v0.dev style)"""
        completion_indicators = selectors.get('completion_indicators', [])
        
        logger.info("Waiting for generation complete...")
        
        end_time = asyncio.get_event_loop().time() + timeout
        
        while asyncio.get_event_loop().time() < end_time:
            # Check for completion indicators
            for indicator in completion_indicators:
                try:
                    element = await self.page.query_selector(indicator)
                    if element and await element.is_visible():
                        # Additional check: wait for network idle
                        await self.page.wait_for_load_state('networkidle', timeout=5000)
                        logger.info("Generation complete indicator found - system ready")
                        return True
                except:
                    continue
            
            await asyncio.sleep(self.poll_interval)
        
        raise asyncio.TimeoutError()

    async def _wait_network_idle(self, timeout: int) -> bool:
        """Wait for network to be idle (generic fallback)"""
        logger.info("Waiting for network idle...")
        
        try:
            await self.page.wait_for_load_state('networkidle', timeout=timeout * 1000)
            # Additional buffer to ensure UI updates
            await asyncio.sleep(2)
            logger.info("Network idle - system ready")
            return True
        except:
            raise asyncio.TimeoutError()

    async def _wait_generic(self, selectors: Dict, timeout: int) -> bool:
        """Generic waiting strategy combining multiple approaches"""
        logger.info("Using generic wait strategy...")
        
        # Try network idle first
        try:
            await self.page.wait_for_load_state('networkidle', timeout=10000)
        except:
            pass
        
        # Then check for completion indicators
        completion_indicators = selectors.get('completion_indicators', [])
        end_time = asyncio.get_event_loop().time() + timeout
        
        while asyncio.get_event_loop().time() < end_time:
            for indicator in completion_indicators:
                try:
                    element = await self.page.query_selector(indicator)
                    if element and await element.is_visible():
                        await asyncio.sleep(2)  # Buffer
                        logger.info("Generic completion detected - system ready")
                        return True
                except:
                    continue
            
            await asyncio.sleep(self.poll_interval)
        
        # If nothing worked, just wait and hope
        await asyncio.sleep(5)
        return True

    async def take_diagnostic_screenshot(self) -> str:
        """Take a screenshot for debugging purposes"""
        try:
            screenshot = await self.page.screenshot(type='png', full_page=False)
            return screenshot.hex()
        except Exception as e:
            logger.error(f"Failed to take screenshot: {str(e)}")
            return ""
