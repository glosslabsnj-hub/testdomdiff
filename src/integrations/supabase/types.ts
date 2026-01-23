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
      chat_leads: {
        Row: {
          conversion_action: string | null
          converted_at: string | null
          created_at: string
          experience_level: string | null
          first_message: string | null
          goal: string | null
          id: string
          interested_program: string | null
          message_count: number | null
          pain_points: string[] | null
          recommended_program: string | null
          session_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          conversion_action?: string | null
          converted_at?: string | null
          created_at?: string
          experience_level?: string | null
          first_message?: string | null
          goal?: string | null
          id?: string
          interested_program?: string | null
          message_count?: number | null
          pain_points?: string[] | null
          recommended_program?: string | null
          session_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          conversion_action?: string | null
          converted_at?: string | null
          created_at?: string
          experience_level?: string | null
          first_message?: string | null
          goal?: string | null
          id?: string
          interested_program?: string | null
          message_count?: number | null
          pain_points?: string[] | null
          recommended_program?: string | null
          session_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          changes: string | null
          created_at: string
          faith_reflection: string | null
          id: string
          steps_avg: number | null
          struggles: string | null
          submitted_at: string
          updated_at: string
          user_id: string
          waist: number | null
          week_number: number
          weight: number | null
          wins: string | null
          workouts_completed: number | null
        }
        Insert: {
          changes?: string | null
          created_at?: string
          faith_reflection?: string | null
          id?: string
          steps_avg?: number | null
          struggles?: string | null
          submitted_at?: string
          updated_at?: string
          user_id: string
          waist?: number | null
          week_number: number
          weight?: number | null
          wins?: string | null
          workouts_completed?: number | null
        }
        Update: {
          changes?: string | null
          created_at?: string
          faith_reflection?: string | null
          id?: string
          steps_avg?: number | null
          struggles?: string | null
          submitted_at?: string
          updated_at?: string
          user_id?: string
          waist?: number | null
          week_number?: number
          weight?: number | null
          wins?: string | null
          workouts_completed?: number | null
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          completed: boolean
          created_at: string
          habit_name: string
          id: string
          log_date: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          habit_name: string
          id?: string
          log_date: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          habit_name?: string
          id?: string
          log_date?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          size: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity?: number
          size?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          size?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          notes: string | null
          shipping_address: Json
          shipping_cost: number
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subtotal: number
          tax: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          shipping_address?: Json
          shipping_cost?: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal: number
          tax?: number
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          shipping_address?: Json
          shipping_cost?: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          sizes: string[] | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          sizes?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          sizes?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          email: string
          equipment: string | null
          experience: string | null
          faith_commitment: boolean | null
          first_name: string | null
          goal: string | null
          height: string | null
          id: string
          injuries: string | null
          intake_completed_at: string | null
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
          weight: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          email: string
          equipment?: string | null
          experience?: string | null
          faith_commitment?: boolean | null
          first_name?: string | null
          goal?: string | null
          height?: string | null
          id?: string
          injuries?: string | null
          intake_completed_at?: string | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          weight?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          equipment?: string | null
          experience?: string | null
          faith_commitment?: boolean | null
          first_name?: string | null
          goal?: string | null
          height?: string | null
          id?: string
          injuries?: string | null
          intake_completed_at?: string | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          weight?: string | null
        }
        Relationships: []
      }
      progress_entries: {
        Row: {
          compliance_pct: number | null
          created_at: string
          id: string
          notes: string | null
          steps_avg: number | null
          updated_at: string
          user_id: string
          waist: number | null
          week_number: number
          weight: number | null
          workouts: number | null
        }
        Insert: {
          compliance_pct?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          steps_avg?: number | null
          updated_at?: string
          user_id: string
          waist?: number | null
          week_number: number
          weight?: number | null
          workouts?: number | null
        }
        Update: {
          compliance_pct?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          steps_avg?: number | null
          updated_at?: string
          user_id?: string
          waist?: number | null
          week_number?: number
          weight?: number | null
          workouts?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_checklist: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      plan_type: "membership" | "transformation" | "coaching"
      subscription_status: "active" | "cancelled" | "expired"
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
      app_role: ["admin", "moderator", "user"],
      plan_type: ["membership", "transformation", "coaching"],
      subscription_status: ["active", "cancelled", "expired"],
    },
  },
} as const
