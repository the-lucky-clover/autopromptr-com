"""
Playwright service for web automation
"""
import asyncio
from typing import Dict, Any, Optional, List
from playwright.async_api import async_playwright, Browser, BrowserContext, Page

class PlaywrightService:
    def __init__(self):
        self.playwright = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self._initialized = False

    async def initialize(self):
        """Initialize Playwright browser"""
        if self._initialized:
            return
        
        try:
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-dev-shm-usage']
            )
            self.context = await self.browser.new_context(
                viewport={'width': 1280, 'height': 720},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            )
            self.page = await self.context.new_page()
            self._initialized = True
        except Exception as e:
            raise Exception(f"Failed to initialize Playwright: {str(e)}")

    async def cleanup(self):
        """Clean up Playwright resources"""
        try:
            if self.page:
                await self.page.close()
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
            if self.playwright:
                await self.playwright.stop()
            self._initialized = False
        except Exception as e:
            print(f"Warning: Error during cleanup: {str(e)}")

    async def navigate_and_submit(self, url: str, prompt: str, selector: Optional[str] = None) -> Dict[str, Any]:
        """Navigate to URL and submit prompt"""
        try:
            if not self._initialized:
                await self.initialize()

            # Navigate to the target URL
            await self.page.goto(url, wait_until='networkidle', timeout=30000)
            
            # Find input field if selector not provided
            if not selector:
                # Try common selectors for input fields
                selectors = [
                    'textarea[placeholder*="prompt"]',
                    'textarea[placeholder*="message"]', 
                    'input[type="text"]',
                    'textarea',
                    '[contenteditable="true"]'
                ]
                
                for sel in selectors:
                    try:
                        await self.page.wait_for_selector(sel, timeout=5000)
                        selector = sel
                        break
                    except:
                        continue
                
                if not selector:
                    return {
                        'success': False,
                        'error': 'Could not find input field on the page'
                    }

            # Fill the prompt
            await self.page.fill(selector, prompt)
            
            # Try to submit - look for submit button or press Enter
            submit_selectors = [
                'button[type="submit"]',
                'button:has-text("Send")',
                'button:has-text("Submit")',
                '[data-testid="send-button"]'
            ]
            
            submitted = False
            for submit_sel in submit_selectors:
                try:
                    if await self.page.is_visible(submit_sel):
                        await self.page.click(submit_sel)
                        submitted = True
                        break
                except:
                    continue
            
            if not submitted:
                # Try pressing Enter as fallback
                await self.page.press(selector, 'Enter')
            
            # Take screenshot for verification
            screenshot = await self.page.screenshot(type='png')
            screenshot_b64 = screenshot.hex()
            
            return {
                'success': True,
                'message': f'Successfully submitted prompt to {url}',
                'screenshot': screenshot_b64,
                'selector_used': selector
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Automation failed: {str(e)}'
            }

    async def health_check(self) -> Dict[str, Any]:
        """Check if Playwright service is healthy"""
        try:
            if not self._initialized:
                await self.initialize()
            
            # Simple test - navigate to a basic page
            await self.page.goto('data:text/html,<html><body><h1>Test</h1></body></html>')
            title = await self.page.title()
            
            return {
                'status': 'healthy',
                'service': 'playwright',
                'test_result': 'passed',
                'message': 'Playwright browser is working correctly'
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'service': 'playwright', 
                'error': str(e)
            }

# Global service instance
playwright_service = PlaywrightService()