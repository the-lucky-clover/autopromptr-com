
// Submission methods for enhanced automation
export interface SubmissionMethod {
  name: string;
  action: (page: any) => Promise<void>;
}

export class SubmissionHandler {
  private static readonly methods: SubmissionMethod[] = [
    {
      name: 'Enter Key',
      action: async (page: any) => await page.keyboard.press('Enter')
    },
    {
      name: 'Submit Button Click',
      action: async (page: any) => {
        const submitBtn = await page.$('button[type="submit"], .submit-btn, [aria-label*="send"]');
        if (submitBtn) await submitBtn.click();
        else throw new Error('Submit button not found');
      }
    },
    {
      name: 'Send Icon Click',
      action: async (page: any) => {
        const sendIcon = await page.$('[data-testid="send"], .send-icon, svg[aria-label*="send"]');
        if (sendIcon) await sendIcon.click();
        else throw new Error('Send icon not found');
      }
    },
    {
      name: 'Ctrl+Enter Combination',
      action: async (page: any) => await page.keyboard.press('Control+Enter')
    }
  ];

  static async tryMultipleSubmissions(page: any): Promise<boolean> {
    for (const method of this.methods) {
      try {
        console.log(`🔄 Trying submission method: ${method.name}`);
        await method.action(page);
        
        // Wait to see if submission was successful
        await page.waitForTimeout(2000);
        
        // Check if message was sent (input should be cleared or new message appears)
        const isCleared = await page.evaluate(() => {
          const inputs = Array.from(document.querySelectorAll('textarea, input, [contenteditable="true"]'));
          return inputs.some(input => (input as HTMLInputElement).value === '' || input.textContent === '');
        });
        
        if (isCleared) {
          console.log(`✅ Submission successful with: ${method.name}`);
          return true;
        }
        
      } catch (err) {
        console.log(`❌ ${method.name} failed:`, err.message);
      }
    }
    
    return false;
  }
}
