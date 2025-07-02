
import { Batch } from '@/types/batch';
import { AutoPromptr } from './client';
import { AutoPromtprError } from './errors';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';

export class SecureAutoPromptr extends AutoPromptr {
  private secureKeys: any;

  constructor(baseUrl?: string) {
    super(baseUrl);
    // Note: This will be a hook in actual component usage
    this.secureKeys = null;
  }

  // Override methods to include security headers
  async runBatch(batch: Batch, platform: string, options?: any) {
    if (!this.secureKeys) {
      throw new AutoPromtprError(
        'Secure keys not initialized',
        'SECURITY_ERROR',
        401,
        false
      );
    }

    return super.runBatch(batch, platform, {
      ...options,
      headers: {
        ...options?.headers,
        'X-API-Key': this.secureKeys.getKey('automation'),
        'X-Request-ID': crypto.randomUUID(),
      }
    });
  }

  // Initialize with secure keys
  initializeWithKeys(secureKeys: any) {
    this.secureKeys = secureKeys;
  }
}
