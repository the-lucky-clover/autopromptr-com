
// Element detection strategies for enhanced automation
export interface ElementDetectionStrategy {
  name: string;
  selectors: string[];
}

export class ElementDetector {
  private static readonly strategies: ElementDetectionStrategy[] = [
    {
      name: 'Direct Lovable Selectors',
      selectors: [
        'textarea[placeholder*="Message"]',
        'textarea[placeholder*="Chat"]',
        'textarea[placeholder*="Ask"]',
        'div[contenteditable="true"]',
        '.chat-input textarea',
        '[data-testid="chat-input"]',
        '[aria-label*="chat"]',
        '[aria-label*="message"]'
      ]
    },
    {
      name: 'Visible Input Detection',
      selectors: [
        'textarea:visible',
        'input[type="text"]:visible',
        'div[contenteditable="true"]:visible'
      ]
    },
    {
      name: 'Focus-based Detection',
      selectors: [
        'textarea:focus',
        'input:focus',
        '[contenteditable="true"]:focus'
      ]
    }
  ];

  static async findChatInput(page: any): Promise<any> {
    for (const strategy of this.strategies) {
      console.log(`Trying strategy: ${strategy.name}`);
      
      for (const selector of strategy.selectors) {
        try {
          const element = await page.$(selector);
          if (element && await element.isVisible()) {
            console.log(`✅ Found chat input with selector: ${selector}`);
            return element;
          }
        } catch (err) {
          console.log(`❌ Selector failed: ${selector}`, err.message);
        }
      }
    }

    throw new Error('No chat input found after trying all strategies');
  }
}
