import { Prompt, InjectionSettings } from '@/types';

export class InjectionEngine {
  private static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async injectPrompts(
    prompts: Prompt[],
    settings: InjectionSettings,
    onProgress?: (index: number, total: number) => void
  ): Promise<void> {
    const { target, delayBetweenPrompts, confirmBefore } = settings;

    for (let i = 0; i < prompts.length; i++) {
      if (confirmBefore && i > 0) {
        const proceed = confirm(
          `Ready to inject prompt ${i + 1} of ${prompts.length}: "${prompts[i].title}"?`
        );
        if (!proceed) break;
      }

      onProgress?.(i, prompts.length);

      await this.injectSinglePrompt(prompts[i], target);

      if (i < prompts.length - 1) {
        await this.delay(delayBetweenPrompts);
      }
    }

    onProgress?.(prompts.length, prompts.length);
  }

  private static async injectSinglePrompt(
    prompt: Prompt,
    target: InjectionSettings['target']
  ): Promise<void> {
    switch (target.type) {
      case 'clipboard':
        await this.injectToClipboard(prompt.content);
        break;
      case 'local':
        await this.injectToLocal(prompt.content, target);
        break;
      case 'remote':
        await this.injectToRemote(prompt.content, target);
        break;
      default:
        throw new Error(`Unsupported target type: ${target.type}`);
    }
  }

  private static async injectToClipboard(content: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(content);
      console.log('✓ Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw error;
    }
  }

  private static async injectToLocal(
    content: string,
    target: InjectionSettings['target']
  ): Promise<void> {
    if (!target.selector) {
      throw new Error('Local target requires a selector');
    }

    const element = document.querySelector(target.selector) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;

    if (!element) {
      throw new Error(`Element not found: ${target.selector}`);
    }

    switch (target.method) {
      case 'paste':
        // Simulate paste event
        element.focus();
        await this.injectToClipboard(content);
        document.execCommand('paste');
        break;
      case 'type':
        // Simulate typing
        element.value = content;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        break;
      default:
        element.value = content;
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  private static async injectToRemote(
    content: string,
    target: InjectionSettings['target']
  ): Promise<void> {
    if (!target.url) {
      throw new Error('Remote target requires a URL');
    }

    try {
      const response = await fetch(target.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✓ Injected to remote target');
    } catch (error) {
      console.error('Failed to inject to remote target:', error);
      throw error;
    }
  }

  // Browser extension helper - opens a new tab and waits for injection
  static async injectToBrowserTarget(
    url: string,
    selector: string,
    content: string
  ): Promise<void> {
    // This would require a browser extension or bookmarklet
    console.log('Opening target:', url);
    window.open(url, '_blank');
    
    // Store for retrieval by injector script
    localStorage.setItem('autopromptr-pending-injection', JSON.stringify({
      selector,
      content,
      timestamp: Date.now()
    }));
  }
}
