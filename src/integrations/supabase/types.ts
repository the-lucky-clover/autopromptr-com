export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      automation_logs: {
        Row: {
          ai_assistant_type: string | null
          batch_id: string | null
          id: string
          level: string
          message: string
          metadata: Json | null
          prompt_sent_at: string | null
          prompt_text: string | null
          response_received_at: string | null
          response_text: string | null
          success_status: string | null
          target_url: string | null
          time_saved_seconds: number | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          ai_assistant_type?: string | null
          batch_id?: string | null
          id?: string
          level: string
          message: string
          metadata?: Json | null
          prompt_sent_at?: string | null
          prompt_text?: string | null
          response_received_at?: string | null
          response_text?: string | null
          success_status?: string | null
          target_url?: string | null
          time_saved_seconds?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          ai_assistant_type?: string | null
          batch_id?: string | null
          id?: string
          level?: string
          message?: string
          metadata?: Json | null
          prompt_sent_at?: string | null
          prompt_text?: string | null
          response_received_at?: string | null
          response_text?: string | null
          success_status?: string | null
          target_url?: string | null
          time_saved_seconds?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          platform: string
          settings: Json | null
          started_at: string | null
          status: string | null
          stopped_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          platform: string
          settings?: Json | null
          started_at?: string | null
          status?: string | null
          stopped_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          platform?: string
          settings?: Json | null
          started_at?: string | null
          status?: string | null
          stopped_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published: boolean | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          subscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
        }
        Relationships: []
      }
      platform_sessions: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          session_data: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          session_data?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          session_data?: Json | null
        }
        Relationships: []
      }
      productivity_metrics: {
        Row: {
          created_at: string | null
          date: string
          failed_prompts: number | null
          id: string
          platforms_used: Json | null
          successful_prompts: number | null
          total_prompts_processed: number | null
          total_time_saved_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          failed_prompts?: number | null
          id?: string
          platforms_used?: Json | null
          successful_prompts?: number | null
          total_prompts_processed?: number | null
          total_time_saved_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          failed_prompts?: number | null
          id?: string
          platforms_used?: Json | null
          successful_prompts?: number | null
          total_prompts_processed?: number | null
          total_time_saved_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_super_user: boolean | null
          name: string | null
          preferred_language: string | null
          role: string | null
          subscription: string | null
          updated_at: string
          video_background_blend_mode: string | null
          video_background_enabled: boolean | null
          video_background_opacity: number | null
          video_background_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          is_super_user?: boolean | null
          name?: string | null
          preferred_language?: string | null
          role?: string | null
          subscription?: string | null
          updated_at?: string
          video_background_blend_mode?: string | null
          video_background_enabled?: boolean | null
          video_background_opacity?: number | null
          video_background_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_super_user?: boolean | null
          name?: string | null
          preferred_language?: string | null
          role?: string | null
          subscription?: string | null
          updated_at?: string
          video_background_blend_mode?: string | null
          video_background_enabled?: boolean | null
          video_background_opacity?: number | null
          video_background_url?: string | null
        }
        Relationships: []
      }
      prompts: {
        Row: {
          batch_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          order_index: number
          processed_at: string | null
          processing_started_at: string | null
          processing_time_ms: number | null
          prompt_text: string
          result: string | null
          status: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          order_index: number
          processed_at?: string | null
          processing_started_at?: string | null
          processing_time_ms?: number | null
          prompt_text: string
          result?: string | null
          status?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          order_index?: number
          processed_at?: string | null
          processing_started_at?: string | null
          processing_time_ms?: number | null
          prompt_text?: string
          result?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      render_syslog: {
        Row: {
          app_name: string | null
          batch_id: string | null
          created_at: string
          facility: number
          hostname: string | null
          id: string
          message: string
          msg_id: string | null
          proc_id: string | null
          raw_message: string | null
          severity: number
          structured_data: Json | null
          timestamp: string
        }
        Insert: {
          app_name?: string | null
          batch_id?: string | null
          created_at?: string
          facility?: number
          hostname?: string | null
          id?: string
          message: string
          msg_id?: string | null
          proc_id?: string | null
          raw_message?: string | null
          severity?: number
          structured_data?: Json | null
          timestamp?: string
        }
        Update: {
          app_name?: string | null
          batch_id?: string | null
          created_at?: string
          facility?: number
          hostname?: string | null
          id?: string
          message?: string
          msg_id?: string | null
          proc_id?: string | null
          raw_message?: string | null
          severity?: number
          structured_data?: Json | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "render_syslog_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      screenshots: {
        Row: {
          created_at: string
          file_path: string
          file_size: number | null
          filename: string
          id: string
          metadata: Json | null
          prompt: string | null
          session_id: string
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          metadata?: Json | null
          prompt?: string | null
          session_id: string
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          metadata?: Json | null
          prompt?: string | null
          session_id?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_verification_status: {
        Row: {
          created_at: string | null
          email_verified: boolean | null
          id: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_verified?: boolean | null
          id?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_verified?: boolean | null
          id?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_logs: {
        Args: Record<PropertyKey, never> | { days_to_keep: number }
        Returns: undefined
      }
      get_batch_stats: {
        Args: Record<PropertyKey, never> | { batch_id: string }
        Returns: Json
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args:
          | { _user_id: string; _role: Database["public"]["Enums"]["app_role"] }
          | { role_name: string }
          | { user_id: string; roles: string[] }
        Returns: boolean
      }
      set_super_user: {
        Args: { _user_id: string; _is_super: boolean }
        Returns: undefined
      }
      update_batch_status: {
        Args: { batch_id: string; new_status: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "user" | "admin" | "sysop"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin", "sysop"],
    },
  },
} as const
