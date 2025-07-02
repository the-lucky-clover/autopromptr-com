export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffFactor = 2,
    loggerContext = {}
  } = options;

  let attempt = 0;
  let delay = retryDelay;

  while (attempt < maxRetries) {
    try {
      const result = await fn(attempt);
      if (result.success) return result;
    } catch (err) {
      console.error(`[Retry] Attempt ${attempt + 1} failed: ${err.message}`, loggerContext);
    }

    attempt++;
    if (attempt < maxRetries) {
      await new Promise((res) => setTimeout(res, delay));
      delay *= backoffFactor;
    }
  }

  return { success: false, error: `Max retry attempts (${maxRetries}) reached.` };
}
