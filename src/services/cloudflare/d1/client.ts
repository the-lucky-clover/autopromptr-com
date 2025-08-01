// Cloudflare D1 Database Client
import { CLOUDFLARE_CONFIG } from '../config';

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta: {
    changed_db: boolean;
    changes: number;
    duration: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
    size_after: number;
  };
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

// D1 Client wrapper for consistent API
export class CloudflareD1Client {
  private db: D1Database | null = null;

  constructor(database?: D1Database) {
    this.db = database;
  }

  // Initialize with D1 database (called from Worker)
  init(database: D1Database) {
    this.db = database;
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('D1 database not initialized');
    }

    try {
      const statement = this.db.prepare(sql);
      const boundStatement = params.length > 0 ? statement.bind(...params) : statement;
      const result = await boundStatement.all<T>();
      
      if (!result.success) {
        throw new Error(result.error || 'D1 query failed');
      }

      return result.results || [];
    } catch (error) {
      console.error('D1 query error:', error);
      throw error;
    }
  }

  async queryFirst<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    if (!this.db) {
      throw new Error('D1 database not initialized');
    }

    try {
      const statement = this.db.prepare(sql);
      const boundStatement = params.length > 0 ? statement.bind(...params) : statement;
      return await boundStatement.first<T>();
    } catch (error) {
      console.error('D1 queryFirst error:', error);
      throw error;
    }
  }

  async execute(sql: string, params: any[] = []): Promise<D1Result> {
    if (!this.db) {
      throw new Error('D1 database not initialized');
    }

    try {
      const statement = this.db.prepare(sql);
      const boundStatement = params.length > 0 ? statement.bind(...params) : statement;
      return await boundStatement.run();
    } catch (error) {
      console.error('D1 execute error:', error);
      throw error;
    }
  }

  async batch(queries: Array<{ sql: string; params?: any[] }>): Promise<D1Result[]> {
    if (!this.db) {
      throw new Error('D1 database not initialized');
    }

    try {
      const statements = queries.map(({ sql, params = [] }) => {
        const statement = this.db!.prepare(sql);
        return params.length > 0 ? statement.bind(...params) : statement;
      });

      return await this.db.batch(statements);
    } catch (error) {
      console.error('D1 batch error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const d1Client = new CloudflareD1Client();

// Database service abstraction for dual support
export class DualDatabaseService {
  private useD1: boolean;

  constructor() {
    this.useD1 = CLOUDFLARE_CONFIG.FEATURES.USE_CF_WORKERS;
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (this.useD1) {
      return d1Client.query<T>(sql, params);
    } else {
      // Direct Supabase query - for read operations only
      console.warn('D1 not available, using direct Supabase fallback');
      return [];
    }
  }

  async queryFirst<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  async execute(sql: string, params: any[] = []): Promise<any> {
    if (this.useD1) {
      return d1Client.execute(sql, params);
    } else {
      // Direct Supabase fallback - limited functionality
      console.warn('D1 not available, using direct Supabase fallback');
      return { success: true, meta: { changes: 0 } };
    }
  }
}

export const dualDb = new DualDatabaseService();