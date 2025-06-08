
// Page readiness utilities for enhanced automation
export class PageReadinessChecker {
  static async waitForLovablePageReady(page: any): Promise<void> {
    console.log('🔄 Waiting for Lovable page to be ready...');
    
    try {
      // Wait for basic page load
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      console.log('✅ Network idle achieved');
      
      // Wait for Lovable-specific elements
      await page.waitForSelector('body', { timeout: 30000 });
      console.log('✅ Body element loaded');
      
      // Additional wait for dynamic content
      await page.waitForTimeout(3000);
      console.log('✅ Dynamic content wait completed');
      
      // Check if Lovable editor is loaded
      const isEditorLoaded = await page.evaluate(() => {
        return document.querySelector('.lovable-editor, .editor-container, [data-testid="editor"]') !== null;
      });
      
      if (isEditorLoaded) {
        console.log('✅ Lovable editor detected');
        await page.waitForTimeout(2000); // Extra wait for editor initialization
      }
      
    } catch (err) {
      console.warn('⚠️ Page readiness check failed:', err.message);
      // Continue anyway with a basic wait
      await page.waitForTimeout(5000);
    }
  }
}
