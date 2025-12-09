export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_metrics: {
        Row: {
          api_cost_usd: number | null
          captured_at: string | null
          id: string
          total_revenue_usd: number | null
          total_summaries: number | null
          total_users: number | null
        }
        Insert: {
          api_cost_usd?: number | null
          captured_at?: string | null
          id?: string
          total_revenue_usd?: number | null
          total_summaries?: number | null
          total_users?: number | null
        }
        Update: {
          api_cost_usd?: number | null
          captured_at?: string | null
          id?: string
          total_revenue_usd?: number | null
          total_summaries?: number | null
          total_users?: number | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string | null
          event_type: string | null
          id: string
          message: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          pdf_id: string
          sender: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          pdf_id: string
          sender: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          pdf_id?: string
          sender?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          created_at: string
          document_id: string | null
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      credits: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          created_at: string | null
          extracted_text: string | null
          id: string
          ocr_used: boolean | null
          pdf_url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          extracted_text?: string | null
          id?: string
          ocr_used?: boolean | null
          pdf_url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          extracted_text?: string | null
          id?: string
          ocr_used?: boolean | null
          pdf_url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_session_id: string
          content: string
          cost_usd: number | null
          created_at: string
          id: string
          role: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          chat_session_id: string
          content: string
          cost_usd?: number | null
          created_at?: string
          id?: string
          role: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          chat_session_id?: string
          content?: string
          cost_usd?: number | null
          created_at?: string
          id?: string
          role?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_session_id_fkey"
            columns: ["chat_session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          credits: number | null
          currency: string
          id: string
          interval: string
          paystack_data: Json | null
          plan: string
          reference: string
          status: string
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          credits?: number | null
          currency?: string
          id?: string
          interval: string
          paystack_data?: Json | null
          plan: string
          reference: string
          status?: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          credits?: number | null
          currency?: string
          id?: string
          interval?: string
          paystack_data?: Json | null
          plan?: string
          reference?: string
          status?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      pdf_chunks: {
        Row: {
          chunk_text: string
          created_at: string | null
          embedding: string | null
          id: string
          page_number: number | null
          pdf_id: string
          user_id: string
        }
        Insert: {
          chunk_text: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          page_number?: number | null
          pdf_id: string
          user_id: string
        }
        Update: {
          chunk_text?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          page_number?: number | null
          pdf_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          daily_usage: number
          display_name: string | null
          id: string
          plan: string
          updated_at: string
          usage_reset_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          daily_usage?: number
          display_name?: string | null
          id?: string
          plan?: string
          updated_at?: string
          usage_reset_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          daily_usage?: number
          display_name?: string | null
          id?: string
          plan?: string
          updated_at?: string
          usage_reset_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          paystack_customer_code: string | null
          paystack_email_token: string | null
          paystack_subscription_code: string | null
          plan: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paystack_customer_code?: string | null
          paystack_email_token?: string | null
          paystack_subscription_code?: string | null
          plan?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paystack_customer_code?: string | null
          paystack_email_token?: string | null
          paystack_subscription_code?: string | null
          plan?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      summaries: {
        Row: {
          chunk_count: number | null
          cost_usd: number | null
          created_at: string | null
          credits_used: number | null
          document_id: string | null
          domain: string | null
          id: string
          langchain_metadata: Json | null
          model_used: string | null
          pdf_name: string | null
          pdf_size_mb: number | null
          processing_method: string | null
          summary_length: string | null
          summary_text: string | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          chunk_count?: number | null
          cost_usd?: number | null
          created_at?: string | null
          credits_used?: number | null
          document_id?: string | null
          domain?: string | null
          id?: string
          langchain_metadata?: Json | null
          model_used?: string | null
          pdf_name?: string | null
          pdf_size_mb?: number | null
          processing_method?: string | null
          summary_length?: string | null
          summary_text?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          chunk_count?: number | null
          cost_usd?: number | null
          created_at?: string | null
          credits_used?: number | null
          document_id?: string | null
          domain?: string | null
          id?: string
          langchain_metadata?: Json | null
          model_used?: string | null
          pdf_name?: string | null
          pdf_size_mb?: number | null
          processing_method?: string | null
          summary_length?: string | null
          summary_text?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "summaries_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_analytics: {
        Row: {
          created_at: string | null
          credits_used: number | null
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credits_used?: number | null
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credits_used?: number | null
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          daily_usage: number
          email: string | null
          extra_credits: number | null
          full_name: string | null
          id: string
          monthly_credits: number | null
          plan: string
          subscription_renews_at: string | null
          updated_at: string | null
          usage_reset_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          daily_usage?: number
          email?: string | null
          extra_credits?: number | null
          full_name?: string | null
          id: string
          monthly_credits?: number | null
          plan?: string
          subscription_renews_at?: string | null
          updated_at?: string | null
          usage_reset_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          daily_usage?: number
          email?: string | null
          extra_credits?: number | null
          full_name?: string | null
          id?: string
          monthly_credits?: number | null
          plan?: string
          subscription_renews_at?: string | null
          updated_at?: string | null
          usage_reset_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_extra_credits: {
        Args: { p_amount: number; p_description?: string; p_user_id: string }
        Returns: undefined
      }
      deduct_credits: {
        Args: { p_cost: number; p_user_id: string }
        Returns: string
      }
      get_daily_usage: {
        Args: { p_days?: number; p_user_id: string }
        Returns: {
          date: string
          total_credits: number
          total_events: number
        }[]
      }
      get_top_documents: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          document_id: string
          document_name: string
          total_credits: number
          total_interactions: number
        }[]
      }
      get_total_credits: { Args: { p_user_id: string }; Returns: number }
      get_user_analytics: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: {
          event_type: string
          total_credits: number
          total_events: number
        }[]
      }
      increment_daily_usage: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      match_chunks: {
        Args: {
          filter_user_id: string
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          chunk_text: string
          id: string
          similarity: number
        }[]
      }
      reset_daily_usage: { Args: never; Returns: undefined }
      reset_monthly_credits: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
