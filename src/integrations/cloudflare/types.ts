/**
 * Cloudflare Types - Database Schema Types
 * Mirrors the D1 schema for type safety
 */

export interface Database {
  public: {
    Tables: {
      batches: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          platform: string;
          target_url: string;
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'stopped';
          created_at: string;
          updated_at: string;
          started_at: string | null;
          completed_at: string | null;
          error_message: string | null;
          settings_json: string | null;
        };
        Insert: Omit<Database['public']['Tables']['batches']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['batches']['Insert']>;
      };
      prompts: {
        Row: {
          id: string;
          batch_id: string;
          prompt_text: string;
          order_index: number;
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
          created_at: string;
          started_at: string | null;
          completed_at: string | null;
          result_json: string | null;
          error_message: string | null;
          retry_count: number;
        };
        Insert: Omit<Database['public']['Tables']['prompts']['Row'], 'created_at' | 'retry_count'> & {
          created_at?: string;
          retry_count?: number;
        };
        Update: Partial<Database['public']['Tables']['prompts']['Insert']>;
      };
      prompt_library: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          tags_json: string | null;
          created_at: string;
          updated_at: string;
          use_count: number;
        };
        Insert: Omit<Database['public']['Tables']['prompt_library']['Row'], 'created_at' | 'updated_at' | 'use_count'> & {
          created_at?: string;
          updated_at?: string;
          use_count?: number;
        };
        Update: Partial<Database['public']['Tables']['prompt_library']['Insert']>;
      };
      execution_logs: {
        Row: {
          id: number;
          batch_id: string;
          prompt_id: string | null;
          log_level: 'info' | 'warning' | 'error' | 'debug';
          message: string;
          metadata_json: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['execution_logs']['Row'], 'id' | 'created_at'> & {
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['execution_logs']['Insert']>;
      };
      user_settings: {
        Row: {
          user_id: string;
          settings_json: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_settings']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_settings']['Insert']>;
      };
      platform_configs: {
        Row: {
          id: string;
          platform_id: string;
          user_id: string;
          config_name: string;
          selectors_json: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['platform_configs']['Row'], 'created_at' | 'updated_at' | 'is_default'> & {
          created_at?: string;
          updated_at?: string;
          is_default?: boolean;
        };
        Update: Partial<Database['public']['Tables']['platform_configs']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          email_confirmed_at: string | null;
          created_at: string;
          updated_at: string;
          user_metadata: string | null;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          video_background_enabled: boolean;
          video_background_url: string | null;
          video_background_opacity: number;
          video_background_blend_mode: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          author: string;
          published: boolean;
          featured_image: string | null;
          tags_json: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blog_posts']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>;
      };
    };
    Views: {};
    Functions: {
      get_user_role: {
        Args: { user_id_param: string };
        Returns: string;
      };
    };
    Enums: {};
  };
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
