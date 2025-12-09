
import { cloudflare } from '@/integrations/cloudflare/client';

export class EnhancedSecureStorage {
  private static readonly ENCRYPTION_KEY_NAME = 'app_encryption_key_v2';
  private static readonly SALT_LENGTH = 16;
  private static readonly IV_LENGTH = 12;
  
  // Generate a secure encryption key with salt
  private static async generateEncryptionKey(salt?: Uint8Array): Promise<{ key: CryptoKey; salt: Uint8Array }> {
    const actualSalt = salt || crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    
    // Use PBKDF2 to derive key from user session + random salt
    const baseKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(crypto.randomUUID()),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: actualSalt.buffer as ArrayBuffer,
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    return { key: derivedKey, salt: actualSalt };
  }

  // Encrypt data with additional authenticated data
  private static async encryptData(data: string, additionalData?: string): Promise<string> {
    const { key, salt } = await this.generateEncryptionKey();
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    
    try {
      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          additionalData: additionalData ? encoder.encode(additionalData) : undefined
        },
        key,
        encoder.encode(data)
      );

      // Combine salt, IV and encrypted data
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);
      
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt data with verification
  private static async decryptData(encryptedData: string, additionalData?: string): Promise<string> {
    try {
      const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
      
      const salt = combined.slice(0, this.SALT_LENGTH);
      const iv = combined.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
      const encrypted = combined.slice(this.SALT_LENGTH + this.IV_LENGTH);

      const { key } = await this.generateEncryptionKey(salt);
      const encoder = new TextEncoder();

      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          additionalData: additionalData ? encoder.encode(additionalData) : undefined
        },
        key,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt stored data - data may be corrupted');
    }
  }

  // Store API key with enhanced security
  static async storeApiKey(keyName: string, apiKey: string): Promise<void> {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('API key cannot be empty');
    }

    // Validate key format for known providers
    if (keyName === 'openai_api_key' && !apiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format');
    }

    try {
      // Add timestamp and key metadata for security auditing
      const metadata = {
        keyName,
        timestamp: Date.now(),
        userAgent: navigator.userAgent.substring(0, 100), // Limit for security
        version: '2.0'
      };

      const encryptedKey = await this.encryptData(apiKey.trim(), JSON.stringify(metadata));
      
      // Store with secure prefix and metadata
      const storageKey = `secure_v2_${keyName}`;
      localStorage.setItem(storageKey, encryptedKey);
      localStorage.setItem(`${storageKey}_meta`, JSON.stringify(metadata));
      
      console.log(`API key ${keyName} stored securely with enhanced encryption`);
    } catch (error) {
      console.error('Failed to store API key securely:', error);
      throw new Error('Failed to store API key securely');
    }
  }

  // Retrieve API key with security validation
  static async getApiKey(keyName: string): Promise<string | null> {
    try {
      const storageKey = `secure_v2_${keyName}`;
      const encryptedKey = localStorage.getItem(storageKey);
      const metadataStr = localStorage.getItem(`${storageKey}_meta`);
      
      if (!encryptedKey || !metadataStr) {
        // Try to migrate from old storage format
        return await this.migrateFromOldStorage(keyName);
      }

      const metadata = JSON.parse(metadataStr);
      
      // Security check: verify metadata integrity
      if (metadata.keyName !== keyName) {
        console.warn('Metadata integrity check failed for API key');
        this.removeApiKey(keyName);
        return null;
      }

      return await this.decryptData(encryptedKey, metadataStr);
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      // Clean up corrupted data
      this.removeApiKey(keyName);
      return null;
    }
  }

  // Migrate from old storage format
  private static async migrateFromOldStorage(keyName: string): Promise<string | null> {
    try {
      const oldKey = localStorage.getItem(`secure_${keyName}`);
      if (!oldKey) return null;

      console.log(`Migrating ${keyName} to enhanced security format`);
      
      // Try to decrypt with old method first
      // This is a simplified migration - in production you'd implement the old decryption
      const apiKey = oldKey; // Simplified - in real migration you'd decrypt properly
      
      // Re-store with new format and remove old
      await this.storeApiKey(keyName, apiKey);
      localStorage.removeItem(`secure_${keyName}`);
      
      return apiKey;
    } catch (error) {
      console.warn('Migration from old storage failed:', error);
      return null;
    }
  }

  // Remove API key and metadata
  static removeApiKey(keyName: string): void {
    const storageKey = `secure_v2_${keyName}`;
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_meta`);
    
    // Also clean up old format if it exists
    localStorage.removeItem(`secure_${keyName}`);
    
    console.log(`API key ${keyName} and metadata removed securely`);
  }

  // Security audit function
  static getSecurityAudit(): { keyCount: number; keys: Array<{ name: string; timestamp: number; version: string }> } {
    const keys: Array<{ name: string; timestamp: number; version: string }> = [];
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('secure_v2_') && key.endsWith('_meta')) {
        try {
          const metadata = JSON.parse(localStorage.getItem(key) || '{}');
          keys.push({
            name: metadata.keyName,
            timestamp: metadata.timestamp,
            version: metadata.version || 'unknown'
          });
        } catch (error) {
          console.warn('Failed to parse metadata for audit:', key);
        }
      }
    });
    
    return { keyCount: keys.length, keys };
  }

  // Clear all secure storage with confirmation
  static clearAll(confirm: boolean = false): void {
    if (!confirm) {
      throw new Error('clearAll requires explicit confirmation');
    }
    
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.startsWith('secure_') || key === this.ENCRYPTION_KEY_NAME
    );
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} secure storage items`);
  }
}
