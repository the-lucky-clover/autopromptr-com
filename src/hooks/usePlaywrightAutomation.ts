import { useState, useCallback } from 'react';
import { playwrightService, AutomationResult } from '@/services/automation/playwrightAutomation';
import { usePsychologicalEffects } from './usePsychologicalEffects';
import { toast } from 'sonner';

export interface PlaywrightAutomationState {
  isRunning: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
  result: AutomationResult | null;
  screenshots: string[];
}

export const usePlaywrightAutomation = () => {
  const [state, setState] = useState<PlaywrightAutomationState>({
    isRunning: false,
    progress: 0,
    currentStep: 'idle',
    error: null,
    result: null,
    screenshots: []
  });

  const { celebrateSuccess, handleErrorGracefully, celebrateMilestone } = usePsychologicalEffects();

  const updateState = useCallback((updates: Partial<PlaywrightAutomationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateProgress = useCallback((progress: number, step: string) => {
    updateState({ progress, currentStep: step });
    
    // Celebrate milestones
    if (progress === 25) celebrateMilestone('Navigation', progress);
    if (progress === 50) celebrateMilestone('Input Detection', progress);
    if (progress === 75) celebrateMilestone('Prompt Injection', progress);
    if (progress === 100) celebrateMilestone('Automation Complete', progress);
  }, [celebrateMilestone, updateState]);

  const runAutomation = useCallback(async (
    url: string,
    prompt: string,
    options: {
      inputSelector?: string;
      submitSelector?: string;
      waitForResponse?: boolean;
      takeScreenshots?: boolean;
    } = {}
  ) => {
    try {
      updateState({
        isRunning: true,
        progress: 0,
        currentStep: 'Initializing Playwright...',
        error: null,
        result: null,
        screenshots: []
      });

      // Initialize Playwright
      await playwrightService.initialize({
        headless: true,
        viewport: { width: 1920, height: 1080 },
        timeout: 30000
      });

      updateProgress(10, 'Navigating to target...');

      // Navigate to target URL
      const navResult = await playwrightService.navigateToTarget(url);
      if (!navResult.success) {
        throw new Error(navResult.error);
      }

      updateProgress(25, 'Detecting input fields...');

      // Detect input fields if not provided
      let inputSelector = options.inputSelector;
      if (!inputSelector) {
        const inputs = await playwrightService.detectTextInputFields();
        if (inputs.length === 0) {
          throw new Error('No text input fields found on the page');
        }
        inputSelector = inputs[0];
        toast.success(`🎯 Found ${inputs.length} input field(s)`, {
          description: 'AutoPromptr is ready to inject your prompt!',
          duration: 2000
        });
      }

      updateProgress(50, 'Injecting prompt...');

      // Inject the prompt
      const injectResult = await playwrightService.injectPrompt(inputSelector, prompt);
      if (!injectResult.success) {
        throw new Error(injectResult.error);
      }

      // Collect screenshot if injection was successful
      if (options.takeScreenshots && injectResult.screenshot) {
        const newScreenshots = [...state.screenshots, injectResult.screenshot];
        updateState({ screenshots: newScreenshots });
      }

      updateProgress(75, 'Submitting form...');

      // Submit the form
      const submitResult = await playwrightService.submitForm(options.submitSelector);
      if (!submitResult.success) {
        throw new Error(submitResult.error);
      }

      updateProgress(90, 'Waiting for response...');

      // Wait for response if requested
      if (options.waitForResponse) {
        const response = await playwrightService.waitForResponse(30000);
        if (!response.success) {
          console.warn('Response timeout, but continuing...', response.error);
        }
      }

      // Take final screenshot
      if (options.takeScreenshots) {
        const finalScreenshot = await playwrightService.takeScreenshot(true);
        if (finalScreenshot) {
          const newScreenshots = [...state.screenshots, finalScreenshot];
          updateState({ screenshots: newScreenshots });
        }
      }

      updateProgress(100, 'Automation completed!');

      const finalResult: AutomationResult = {
        success: true,
        message: 'Playwright automation completed successfully',
        data: {
          url,
          inputSelector,
          promptLength: prompt.length,
          screenshots: state.screenshots.length,
          responseDetected: false,
          completedAt: new Date().toISOString()
        }
      };

      updateState({
        result: finalResult,
        isRunning: false,
        currentStep: 'Complete'
      });

      celebrateSuccess('Automation completed successfully! 🎉', 'high');

      return finalResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      updateState({
        isRunning: false,
        error: errorMessage,
        currentStep: 'Failed'
      });

      handleErrorGracefully(
        errorMessage,
        'The automation encountered an issue. Our AI agents are learning from this experience!'
      );

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      // Always cleanup
      await playwrightService.cleanup();
    }
  }, [celebrateSuccess, handleErrorGracefully, celebrateMilestone, updateState, updateProgress, state.screenshots.length]);

  const stopAutomation = useCallback(async () => {
    await playwrightService.cleanup();
    updateState({
      isRunning: false,
      currentStep: 'Stopped',
      progress: 0
    });
    
    toast.info('🛑 Automation stopped', {
      description: 'The automation has been safely terminated.',
      duration: 2000
    });
  }, [updateState]);

  const resetAutomation = useCallback(() => {
    setState({
      isRunning: false,
      progress: 0,
      currentStep: 'idle',
      error: null,
      result: null,
      screenshots: []
    });
  }, []);

  const retryAutomation = useCallback(async (
    url: string,
    prompt: string,
    options?: any
  ) => {
    resetAutomation();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
    return runAutomation(url, prompt, options);
  }, [resetAutomation, runAutomation]);

  return {
    state,
    runAutomation,
    stopAutomation,
    resetAutomation,
    retryAutomation,
    isRunning: state.isRunning,
    progress: state.progress,
    currentStep: state.currentStep,
    error: state.error,
    result: state.result,
    screenshots: state.screenshots
  };
};