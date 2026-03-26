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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      banned_users: {
        Row: {
          banned_by: string
          created_at: string
          email: string
          id: string
          reason: string | null
        }
        Insert: {
          banned_by: string
          created_at?: string
          email: string
          id?: string
          reason?: string | null
        }
        Update: {
          banned_by?: string
          created_at?: string
          email?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          blocked: boolean
          created_at: string
          customer_last_seen_at: string | null
          hidden_from_admin: boolean
          id: string
          status: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          blocked?: boolean
          created_at?: string
          customer_last_seen_at?: string | null
          hidden_from_admin?: boolean
          id?: string
          status?: string
          updated_at?: string
          user_email: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          blocked?: boolean
          created_at?: string
          customer_last_seen_at?: string | null
          hidden_from_admin?: boolean
          id?: string
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message: string
          read: boolean
          sender_type: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message: string
          read?: boolean
          sender_type?: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_otps: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Relationships: []
      }
      fake_chat_auto_state: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          next_question_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          next_question_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          next_question_at?: string
        }
        Relationships: []
      }
      fake_chat_conversations: {
        Row: {
          auto_reply_due_at: string | null
          created_at: string
          fake_name: string
          hidden: boolean
          id: string
          is_auto: boolean
          next_auto_question_at: string | null
          updated_at: string
        }
        Insert: {
          auto_reply_due_at?: string | null
          created_at?: string
          fake_name: string
          hidden?: boolean
          id?: string
          is_auto?: boolean
          next_auto_question_at?: string | null
          updated_at?: string
        }
        Update: {
          auto_reply_due_at?: string | null
          created_at?: string
          fake_name?: string
          hidden?: boolean
          id?: string
          is_auto?: boolean
          next_auto_question_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fake_chat_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message: string
          read: boolean
          sender_type: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message: string
          read?: boolean
          sender_type?: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fake_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "fake_chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          approval_token: string | null
          checkout_reference: string
          created_at: string
          customer_email: string
          customer_name: string
          discount_code: string | null
          discount_percent: number | null
          email_sent: boolean
          gift_card_code: string | null
          id: string
          order_items: Json
          order_number: number | null
          proof_url: string | null
          rejection_notes: string | null
          rejection_seen: boolean
          shipping_address: Json | null
          status: string
          sumup_checkout_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          approval_token?: string | null
          checkout_reference: string
          created_at?: string
          customer_email: string
          customer_name: string
          discount_code?: string | null
          discount_percent?: number | null
          email_sent?: boolean
          gift_card_code?: string | null
          id?: string
          order_items: Json
          order_number?: number | null
          proof_url?: string | null
          rejection_notes?: string | null
          rejection_seen?: boolean
          shipping_address?: Json | null
          status?: string
          sumup_checkout_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          approval_token?: string | null
          checkout_reference?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          discount_code?: string | null
          discount_percent?: number | null
          email_sent?: boolean
          gift_card_code?: string | null
          id?: string
          order_items?: Json
          order_number?: number | null
          proof_url?: string | null
          rejection_notes?: string | null
          rejection_seen?: boolean
          shipping_address?: Json | null
          status?: string
          sumup_checkout_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_padding_overrides: {
        Row: {
          id: string
          padding_bottom: number
          padding_left: number
          padding_right: number
          padding_top: number
          product_id: string
          scale: number
          updated_at: string
        }
        Insert: {
          id?: string
          padding_bottom?: number
          padding_left?: number
          padding_right?: number
          padding_top?: number
          product_id: string
          scale?: number
          updated_at?: string
        }
        Update: {
          id?: string
          padding_bottom?: number
          padding_left?: number
          padding_right?: number
          padding_top?: number
          product_id?: string
          scale?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      visitor_sessions: {
        Row: {
          browser: string | null
          cart_items: Json | null
          cart_total: number | null
          city: string | null
          country: string | null
          created_at: string
          current_page: string
          device_type: string | null
          id: string
          is_in_checkout: boolean | null
          last_seen_at: string
          os: string | null
          pages_viewed: Json | null
          referrer: string | null
          region: string | null
          screen_width: number | null
          session_id: string
          user_email: string | null
        }
        Insert: {
          browser?: string | null
          cart_items?: Json | null
          cart_total?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          current_page?: string
          device_type?: string | null
          id?: string
          is_in_checkout?: boolean | null
          last_seen_at?: string
          os?: string | null
          pages_viewed?: Json | null
          referrer?: string | null
          region?: string | null
          screen_width?: number | null
          session_id: string
          user_email?: string | null
        }
        Update: {
          browser?: string | null
          cart_items?: Json | null
          cart_total?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          current_page?: string
          device_type?: string | null
          id?: string
          is_in_checkout?: boolean | null
          last_seen_at?: string
          os?: string | null
          pages_viewed?: Json | null
          referrer?: string | null
          region?: string | null
          screen_width?: number | null
          session_id?: string
          user_email?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
