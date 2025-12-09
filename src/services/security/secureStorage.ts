
import { cloudflare } from '@/integrations/cloudflare/client';

export class SecureStorage {
  private static readonly ENCRYPTION_KEY_NAME = 'app_encryption_key';
  
  // Generate a secure encryption key for local storage
  private static async generateEncryptionKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt data using Web Crypto API
  private static async encryptData(data: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encoder.encode(data)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }

  // Decrypt data using Web Crypto API
  private static async decryptData(encryptedData: string, key: CryptoKey): Promise<string> {
    try {
      const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw new Error('Failed to decrypt stored data');
    }
  }

  // Get or create encryption key
  private static async getEncryptionKey(): Promise<CryptoKey> {
    const storedKey = localStorage.getItem(this.ENCRYPTION_KEY_NAME);
    
    if (storedKey) {
      try {
        const keyData = JSON.parse(storedKey);
        return await crypto.subtle.importKey(
          'jwk',
          keyData,
          {
            name: 'AES-GCM',
            length: 256,
          },
          true,
          ['encrypt', 'decrypt']
        );
      } catch (error) {
        console.warn('Failed to load existing key, generating new one');
      }
    }

    // Generate new key
    const key = await this.generateEncryptionKey();
    const exportedKey = await crypto.subtle.exportKey('jwk', key);
    localStorage.setItem(this.ENCRYPTION_KEY_NAME, JSON.stringify(exportedKey));
    
    return key;
  }

  // Store API key securely
  static async storeApiKey(keyName: string, apiKey: string): Promise<void> {
    try {
      // For production, store in Supabase secrets
      // For now, encrypt and store locally
      const encryptionKey = await this.getEncryptionKey();
      const encryptedKey = await this.encryptData(apiKey, encryptionKey);
      
      localStorage.setItem(`secure_${keyName}`, encryptedKey);
      
      // Also log the secure storage event
      console.log(`API key ${keyName} stored securely`);
    } catch (error) {
      console.error('Failed to store API key securely:', error);
      throw new Error('Failed to store API key securely');
    }
  }

  // Retrieve API key securely
  static async getApiKey(keyName: string): Promise<string | null> {
    try {
      const encryptedKey = localStorage.getItem(`secure_${keyName}`);
      if (!encryptedKey) {
        return null;
      }

      const encryptionKey = await this.getEncryptionKey();
      return await this.decryptData(encryptedKey, encryptionKey);
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      return null;
    }
  }

  // Remove API key
  static removeApiKey(keyName: string): void {
    localStorage.removeItem(`secure_${keyName}`);
    console.log(`API key ${keyName} removed`);
  }

  // Clear all secure storage
  static clearAll(): void {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('secure_') || key === this.ENCRYPTION_KEY_NAME
    );
    
    keys.forEach(key => localStorage.removeItem(key));
    console.log('All secure storage cleared');
  }
}
