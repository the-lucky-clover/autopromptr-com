const handleRunBatch = async (batch: Batch) => {
  const targetUrl = batch.targetUrl?.trim();
  const detectedPlatform = detectPlatformFromUrl(targetUrl);
  const platformName = getPlatformName(detectedPlatform);

  if (!targetUrl || !detectedPlatform) {
    toast({
      title: 'Cannot detect platform',
      description: 'Unable to determine automation platform from the target URL. Please check the URL format.',
      variant: 'destructive',
    });
    return;
  }

  setSelectedBatchId(batch.id);

  const apiKey = getApiKey('openai_api_key');
  if (!apiKey) {
    toast({
      title: 'API Key Required',
      description: 'OpenAI API key required for LangChain processing. Please configure it in the secure API key manager.',
      variant: 'destructive',
    });
    return;
  }

  try {
    console.log('🔗 Attempting LangChain processing...');
    await handleRunBatchWithLangChain(batch, setBatches, apiKey);

    toast({
      title: 'LangChain Batch Started',
      description: `"${batch.name}" has started via LangChain.`,
      variant: 'default',
    });
  } catch (langChainErr) {
    console.warn('⚠️ LangChain failed, falling back:', langChainErr);

    try {
      const { waitForIdle, maxRetries } = batch.settings || {};

      const fallbackBatch: Batch = {
        ...batch,
        platform: detectedPlatform,
        settings: {
          ...batch.settings,
          waitForIdle: waitForIdle ?? true,
          maxRetries: Math.min(maxRetries ?? 3, 3),
        },
      };

      await runBatch(fallbackBatch, detectedPlatform, fallbackBatch.settings);

      setBatches(prev =>
        prev.map(b => b.id === batch.id
          ? { ...b, status: 'running', platform: detectedPlatform }
          : b)
      );

      toast({
        title: 'Fallback Batch Started',
        description: `"${batch.name}" started using fallback automation with ${platformName}.`,
        variant: 'success',
      });
    } catch (fallbackErr) {
      let errorTitle = 'All batch processing methods failed';
      let errorDescription = fallbackErr instanceof Error
        ? fallbackErr.message
        : 'Unknown error during fallback.';

      if (fallbackErr instanceof Error && fallbackErr.message.toLowerCase().includes('automation_endpoints_not_configured')) {
        errorTitle = 'Automation Endpoints Not Configured';
        errorDescription = 'Neither LangChain nor backend automation endpoints are properly set.';
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
      });
    }
  }
};
