/**
 * Cloudflare Client - Replaces Supabase Client
 * 
 * This client handles all interactions with Cloudflare services:
 * - Auth: Custom JWT-based authentication via Workers
 * - Database: D1 via Worker API
 * - Storage: R2 via Worker API
 * - KV: Session/cache storage via Worker API
 */

// Configuration
const WORKER_URL = import.meta.env.VITE_CLOUDFLARE_WORKER_URL || 'https://autopromptr-worker.autopromptr.workers.dev';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://autopromptr.pages.dev';

export const cloudflareConfig = {
  workerUrl: WORKER_URL,
  siteUrl: SITE_URL,
  isConfigured: Boolean(WORKER_URL),
};

export const isCloudflareConfigured = cloudflareConfig.isConfigured;

// Types
export interface CloudflareUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

export interface CloudflareSession {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  user: CloudflareUser;
}

interface ApiResponse<T> {
  data?: T;
  error?: { message: string; status?: number };
}

// Storage helper for tokens
const TOKEN_KEY = 'autopromptr_session';

const getStoredSession = (): CloudflareSession | null => {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return null;
    const session = JSON.parse(stored) as CloudflareSession;
    // Check if expired
    if (session.expires_at && Date.now() > session.expires_at * 1000) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

const storeSession = (session: CloudflareSession): void => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
};

const clearSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Auth change listeners
type AuthChangeCallback = (event: string, session: CloudflareSession | null) => void;
const authListeners: Set<AuthChangeCallback> = new Set();

const notifyAuthChange = (event: string, session: CloudflareSession | null) => {
  authListeners.forEach(callback => {
    try {
      callback(event, session);
    } catch (e) {
      console.error('Auth listener error:', e);
    }
  });
};

// API helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const session = getStoredSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (session?.access_token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  try {
    const response = await fetch(`${WORKER_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        error: {
          message: data.error || data.message || 'Request failed',
          status: response.status,
        },
      };
    }
    
    return { data };
  } catch (error: any) {
    return {
      error: {
        message: error.message || 'Network error',
      },
    };
  }
};

// Auth API
export const auth = {
  /**
   * Sign up a new user
   */
  signUp: async (options: {
    email: string;
    password: string;
    options?: {
      emailRedirectTo?: string;
      data?: Record<string, any>;
    };
  }): Promise<ApiResponse<{ user: CloudflareUser; session: CloudflareSession | null }>> => {
    const result = await apiRequest<{ user: CloudflareUser; session: CloudflareSession | null }>(
      '/api/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({
          email: options.email,
          password: options.password,
          redirectUrl: options.options?.emailRedirectTo || `${SITE_URL}/auth/callback`,
          metadata: options.options?.data,
        }),
      }
    );
    
    if (result.data?.session) {
      storeSession(result.data.session);
      notifyAuthChange('SIGNED_UP', result.data.session);
    }
    
    return result;
  },
  
  /**
   * Sign in with email and password
   */
  signInWithPassword: async (options: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: CloudflareUser; session: CloudflareSession }>> => {
    const result = await apiRequest<{ user: CloudflareUser; session: CloudflareSession }>(
      '/api/auth/signin',
      {
        method: 'POST',
        body: JSON.stringify({
          email: options.email,
          password: options.password,
        }),
      }
    );
    
    if (result.data?.session) {
      storeSession(result.data.session);
      notifyAuthChange('SIGNED_IN', result.data.session);
    }
    
    return result;
  },
  
  /**
   * Sign out the current user
   */
  signOut: async (): Promise<ApiResponse<void>> => {
    const session = getStoredSession();
    if (session) {
      await apiRequest('/api/auth/signout', {
        method: 'POST',
      });
    }
    clearSession();
    notifyAuthChange('SIGNED_OUT', null);
    return { data: undefined };
  },
  
  /**
   * Get current session
   */
  getSession: async (): Promise<ApiResponse<{ session: CloudflareSession | null }>> => {
    const session = getStoredSession();
    if (!session) {
      return { data: { session: null } };
    }
    
    // Verify session is still valid
    const result = await apiRequest<{ valid: boolean; user: CloudflareUser }>(
      '/api/auth/verify',
      { method: 'GET' }
    );
    
    if (result.error || !result.data?.valid) {
      clearSession();
      return { data: { session: null } };
    }
    
    return { data: { session } };
  },
  
  /**
   * Get current user
   */
  getUser: async (): Promise<ApiResponse<{ user: CloudflareUser | null }>> => {
    const session = getStoredSession();
    if (!session) {
      return { data: { user: null } };
    }
    return { data: { user: session.user } };
  },
  
  /**
   * Resend verification email
   */
  resend: async (options: {
    type: 'signup';
    email: string;
    options?: { emailRedirectTo?: string };
  }): Promise<ApiResponse<void>> => {
    return apiRequest('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({
        email: options.email,
        redirectUrl: options.options?.emailRedirectTo || `${SITE_URL}/auth/callback`,
      }),
    });
  },
  
  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange: (callback: AuthChangeCallback): { data: { subscription: { unsubscribe: () => void } } } => {
    authListeners.add(callback);
    
    // Immediately check current session
    const session = getStoredSession();
    if (session) {
      setTimeout(() => callback('INITIAL_SESSION', session), 0);
    }
    
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            authListeners.delete(callback);
          },
        },
      },
    };
  },
};

// Database API (D1 via Worker)
export const db = {
  /**
   * Query the database
   */
  from: (table: string) => ({
    select: (columns = '*') => ({
      _table: table,
      _columns: columns,
      _filters: [] as string[],
      _orderBy: null as string | null,
      _limit: null as number | null,
      _single: false,
      
      eq: function(column: string, value: any) {
        this._filters.push(`${column}:eq:${JSON.stringify(value)}`);
        return this;
      },
      
      neq: function(column: string, value: any) {
        this._filters.push(`${column}:neq:${JSON.stringify(value)}`);
        return this;
      },
      
      gt: function(column: string, value: any) {
        this._filters.push(`${column}:gt:${JSON.stringify(value)}`);
        return this;
      },
      
      lt: function(column: string, value: any) {
        this._filters.push(`${column}:lt:${JSON.stringify(value)}`);
        return this;
      },
      
      order: function(column: string, options?: { ascending?: boolean }) {
        this._orderBy = `${column}:${options?.ascending !== false ? 'asc' : 'desc'}`;
        return this;
      },
      
      limit: function(count: number) {
        this._limit = count;
        return this;
      },
      
      single: function() {
        this._single = true;
        this._limit = 1;
        return this;
      },
      
      then: async function(resolve: (value: any) => void, reject?: (error: any) => void) {
        try {
          const params = new URLSearchParams({
            table: this._table,
            columns: this._columns,
            filters: JSON.stringify(this._filters),
            single: String(this._single),
          });
          
          if (this._orderBy) params.set('orderBy', this._orderBy);
          if (this._limit) params.set('limit', String(this._limit));
          
          const result = await apiRequest<any>(`/api/db/query?${params}`);
          
          if (result.error) {
            resolve({ data: null, error: result.error });
          } else {
            resolve({ 
              data: this._single ? (result.data?.[0] || null) : result.data, 
              error: null 
            });
          }
        } catch (error: any) {
          if (reject) reject(error);
          else resolve({ data: null, error: { message: error.message } });
        }
      },
    }),
    
    insert: (data: any | any[]) => ({
      _table: table,
      _data: Array.isArray(data) ? data : [data],
      _returning: false,
      
      select: function() {
        this._returning = true;
        return this;
      },
      
      single: function() {
        this._returning = true;
        return this;
      },
      
      then: async function(resolve: (value: any) => void) {
        const result = await apiRequest<any>('/api/db/insert', {
          method: 'POST',
          body: JSON.stringify({
            table: this._table,
            data: this._data,
            returning: this._returning,
          }),
        });
        
        resolve({
          data: result.data,
          error: result.error || null,
        });
      },
    }),
    
    update: (data: any) => ({
      _table: table,
      _data: data,
      _filters: [] as string[],
      
      eq: function(column: string, value: any) {
        this._filters.push(`${column}:eq:${JSON.stringify(value)}`);
        return this;
      },
      
      select: function() {
        return this;
      },
      
      single: function() {
        return this;
      },
      
      then: async function(resolve: (value: any) => void) {
        const result = await apiRequest<any>('/api/db/update', {
          method: 'PUT',
          body: JSON.stringify({
            table: this._table,
            data: this._data,
            filters: this._filters,
          }),
        });
        
        resolve({
          data: result.data,
          error: result.error || null,
        });
      },
    }),
    
    delete: () => ({
      _table: table,
      _filters: [] as string[],
      
      eq: function(column: string, value: any) {
        this._filters.push(`${column}:eq:${JSON.stringify(value)}`);
        return this;
      },
      
      then: async function(resolve: (value: any) => void) {
        const result = await apiRequest<any>('/api/db/delete', {
          method: 'DELETE',
          body: JSON.stringify({
            table: this._table,
            filters: this._filters,
          }),
        });
        
        resolve({
          data: result.data,
          error: result.error || null,
        });
      },
    }),
  }),
  
  /**
   * Execute RPC function
   */
  rpc: async (functionName: string, params?: Record<string, any>): Promise<ApiResponse<any>> => {
    return apiRequest('/api/db/rpc', {
      method: 'POST',
      body: JSON.stringify({ function: functionName, params }),
    });
  },
};

// Functions API (Worker endpoints)
export const functions = {
  /**
   * Invoke a serverless function
   */
  invoke: async <T = any>(
    functionName: string,
    options?: { body?: any; headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> => {
    return apiRequest<T>(`/api/functions/${functionName}`, {
      method: 'POST',
      headers: options?.headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
  },
};

// Storage API (R2 via Worker)
export const storage = {
  from: (bucket: string) => ({
    upload: async (
      path: string,
      file: File | Blob,
      options?: { contentType?: string }
    ): Promise<ApiResponse<{ path: string; url: string }>> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
      if (options?.contentType) {
        formData.append('contentType', options.contentType);
      }
      
      const session = getStoredSession();
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      try {
        const response = await fetch(`${WORKER_URL}/api/storage/${bucket}/upload`, {
          method: 'POST',
          headers,
          body: formData,
        });
        
        const data = await response.json();
        if (!response.ok) {
          return { error: { message: data.error || 'Upload failed' } };
        }
        return { data };
      } catch (error: any) {
        return { error: { message: error.message } };
      }
    },
    
    download: async (path: string): Promise<ApiResponse<Blob>> => {
      try {
        const session = getStoredSession();
        const headers: HeadersInit = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const response = await fetch(
          `${WORKER_URL}/api/storage/${bucket}/download/${encodeURIComponent(path)}`,
          { headers }
        );
        
        if (!response.ok) {
          return { error: { message: 'Download failed' } };
        }
        
        const blob = await response.blob();
        return { data: blob };
      } catch (error: any) {
        return { error: { message: error.message } };
      }
    },
    
    remove: async (paths: string[]): Promise<ApiResponse<void>> => {
      return apiRequest('/api/storage/' + bucket + '/delete', {
        method: 'DELETE',
        body: JSON.stringify({ paths }),
      });
    },
    
    getPublicUrl: (path: string): { data: { publicUrl: string } } => {
      return {
        data: {
          publicUrl: `${WORKER_URL}/api/storage/${bucket}/public/${encodeURIComponent(path)}`,
        },
      };
    },
  }),
};

// Main cloudflare client export (drop-in replacement for supabase)
export const cloudflare = {
  auth,
  from: db.from,
  db: {
    from: db.from,
  },
  rpc: db.rpc,
  functions,
  storage,
};

// Backward compatibility aliases
export const cfAuth = auth;
export const cfDb = db;
export const cfFunctions = functions;
export const cfStorage = storage;

export default cloudflare;
