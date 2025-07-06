const handleRunBatch = async (batch: Batch) => {
  const detectedPlatform = detectPlatformFromUrl(batch.targetUrl);
  const platformName = getPlatformName(detectedPlatform);

  if (!detectedPlatform) {
    toast({
      title: "Cannot detect platform",
      description: "Unable to determine automation platform from the target URL. Please check the URL format.",
      variant: "destructive",
    });
    return;
  }

  setSelectedBatchId(batch.id);

  try {
    console.log('🔗 Using LangChain as primary batch processor');
    const apiKey = getApiKey('openai_api_key');

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "OpenAI API key required for LangChain processing. Please configure it in the secure API key manager.",
        variant: "destructive",
      });
      return;
    }

    await handleRunBatchWithLangChain(batch, setBatches, apiKey);

  } catch (err) {
    console.error('LangChain processing failed, falling back to legacy methods:', err);

    try {
      const { waitForIdle, maxRetries } = batch.settings || {};
      const batchWithPlatform = {
        ...batch,
        platform: detectedPlatform,
        settings: {
          waitForIdle: waitForIdle ?? true,
          maxRetries: Math.min(maxRetries ?? 3, 3),
        },
      };

      await runBatch(batchWithPlatform, detectedPlatform, batchWithPlatform.settings);

      setBatches(prev => prev.map(b =>
        b.id === batch.id ? { ...b, status: 'running', platform: detectedPlatform } : b
      ));

      toast({
        title: "Fallback batch started",
        description: `LangChain failed, using fallback automation for "${batch.name}" with ${platformName}.`,
        variant: "success",
      });
    } catch (fallbackErr) {
      let errorTitle = "All batch processing methods failed";
      let errorDescription = fallbackErr instanceof Error ? fallbackErr.message : 'Unknown error';

      if (fallbackErr instanceof Error) {
        const msg = fallbackErr.message.toLowerCase();
        if (msg.includes('automation_endpoints_not_configured')) {
          errorTitle = "Backend not configured for automation";
          errorDescription = "Both LangChain and backend automation services failed. Please check configuration.";
        }
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    }
  }
};
