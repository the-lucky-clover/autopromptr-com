// Cloudflare R2 Storage Client
import { CLOUDFLARE_CONFIG } from '../config';

export interface R2Object {
  key: string;
  size: number;
  etag: string;
  uploaded: Date;
  checksums: Record<string, string>;
  httpEtag: string;
  customMetadata?: Record<string, string>;
  range?: R2Range;
}

export interface R2Range {
  offset?: number;
  length?: number;
  suffix?: number;
}

export interface R2Bucket {
  head(key: string): Promise<R2Object | null>;
  get(key: string, options?: R2GetOptions): Promise<R2ObjectBody | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob, options?: R2PutOptions): Promise<R2Object>;
  delete(keys: string | string[]): Promise<void>;
  list(options?: R2ListOptions): Promise<R2Objects>;
}

export interface R2GetOptions {
  onlyIf?: R2Conditional;
  range?: R2Range;
}

export interface R2PutOptions {
  onlyIf?: R2Conditional;
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
  md5?: ArrayBuffer;
  sha1?: ArrayBuffer;
  sha256?: ArrayBuffer;
  sha384?: ArrayBuffer;
  sha512?: ArrayBuffer;
}

export interface R2Conditional {
  etagMatches?: string;
  etagDoesNotMatch?: string;
  uploadedBefore?: Date;
  uploadedAfter?: Date;
}

export interface R2HTTPMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

export interface R2ListOptions {
  limit?: number;
  prefix?: string;
  cursor?: string;
  delimiter?: string;
  include?: ('httpMetadata' | 'customMetadata')[];
}

export interface R2Objects {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes: string[];
}

export interface R2ObjectBody extends R2Object {
  body: ReadableStream;
  bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T = unknown>(): Promise<T>;
  blob(): Promise<Blob>;
}

// R2 Client wrapper for consistent API
export class CloudflareR2Client {
  private bucket: R2Bucket | null = null;

  constructor(bucket?: R2Bucket) {
    this.bucket = bucket;
  }

  // Initialize with R2 bucket (called from Worker)
  init(bucket: R2Bucket) {
    this.bucket = bucket;
  }

  async uploadFile(
    key: string, 
    data: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
    options?: {
      contentType?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<R2Object> {
    if (!this.bucket) {
      throw new Error('R2 bucket not initialized');
    }

    try {
      const putOptions: R2PutOptions = {
        httpMetadata: {
          contentType: options?.contentType || 'application/octet-stream'
        },
        customMetadata: options?.metadata
      };

      return await this.bucket.put(key, data, putOptions);
    } catch (error) {
      console.error('R2 upload error:', error);
      throw error;
    }
  }

  async downloadFile(key: string): Promise<R2ObjectBody | null> {
    if (!this.bucket) {
      throw new Error('R2 bucket not initialized');
    }

    try {
      return await this.bucket.get(key);
    } catch (error) {
      console.error('R2 download error:', error);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.bucket) {
      throw new Error('R2 bucket not initialized');
    }

    try {
      await this.bucket.delete(key);
    } catch (error) {
      console.error('R2 delete error:', error);
      throw error;
    }
  }

  async listFiles(options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<R2Objects> {
    if (!this.bucket) {
      throw new Error('R2 bucket not initialized');
    }

    try {
      return await this.bucket.list({
        prefix: options?.prefix,
        limit: options?.limit || 100,
        cursor: options?.cursor
      });
    } catch (error) {
      console.error('R2 list error:', error);
      throw error;
    }
  }

  async getFileInfo(key: string): Promise<R2Object | null> {
    if (!this.bucket) {
      throw new Error('R2 bucket not initialized');
    }

    try {
      return await this.bucket.head(key);
    } catch (error) {
      console.error('R2 head error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const r2Client = new CloudflareR2Client();

// Dual storage service for parallel compatibility
export class DualStorageService {
  private useR2: boolean;

  constructor() {
    this.useR2 = CLOUDFLARE_CONFIG.FEATURES.USE_CF_WORKERS;
  }

  async uploadFile(
    path: string, 
    file: File | Blob,
    options?: {
      contentType?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<string> {
    if (this.useR2) {
      // Upload to R2
      const result = await r2Client.uploadFile(path, file, options);
      return `r2://${result.key}`;
    } else {
      // Fallback to Supabase Storage
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.storage
        .from('screenshots')
        .upload(path, file, {
          contentType: options?.contentType,
          metadata: options?.metadata
        });
      
      if (error) throw error;
      return data.path;
    }
  }

  async downloadFile(path: string): Promise<Blob> {
    if (this.useR2 && path.startsWith('r2://')) {
      // Download from R2
      const key = path.replace('r2://', '');
      const object = await r2Client.downloadFile(key);
      if (!object) throw new Error('File not found in R2');
      return await object.blob();
    } else {
      // Fallback to Supabase Storage
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.storage
        .from('screenshots')
        .download(path);
      
      if (error) throw error;
      return data;
    }
  }

  async deleteFile(path: string): Promise<void> {
    if (this.useR2 && path.startsWith('r2://')) {
      // Delete from R2
      const key = path.replace('r2://', '');
      await r2Client.deleteFile(key);
    } else {
      // Fallback to Supabase Storage
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.storage
        .from('screenshots')
        .remove([path]);
      
      if (error) throw error;
    }
  }
}

export const dualStorage = new DualStorageService();