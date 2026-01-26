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
          coach_notes: string | null
          coach_reviewed_at: string | null
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
          coach_notes?: string | null
          coach_reviewed_at?: string | null
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
          coach_notes?: string | null
          coach_reviewed_at?: string | null
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
      client_custom_programs: {
        Row: {
          client_id: string
          created_at: string | null
          description: string | null
          display_order: number | null
          file_type: string
          file_url: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          file_type: string
          file_url: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coaching_action_items: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          session_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          session_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          session_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_action_items_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "coaching_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_goals: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          id: string
          progress_pct: number | null
          status: string
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          progress_pct?: number | null
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          progress_pct?: number | null
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      coaching_sessions: {
        Row: {
          client_id: string
          coach_id: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          notes_visible_to_client: boolean | null
          scheduled_at: string
          session_type: string
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          notes_visible_to_client?: boolean | null
          scheduled_at: string
          session_type?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          notes_visible_to_client?: boolean | null
          scheduled_at?: string
          session_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      coaching_spots: {
        Row: {
          id: string
          max_spots: number
          updated_at: string
        }
        Insert: {
          id?: string
          max_spots?: number
          updated_at?: string
        }
        Update: {
          id?: string
          max_spots?: number
          updated_at?: string
        }
        Relationships: []
      }
      coaching_waitlist: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          notes: string | null
          phone: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
        }
        Relationships: []
      }
      community_channels: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          min_tier: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          min_tier?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          min_tier?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          mentioned_user_ids: string[] | null
          reply_to_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          mentioned_user_ids?: string[] | null
          reply_to_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          mentioned_user_ids?: string[] | null
          reply_to_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "community_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "community_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      community_wins: {
        Row: {
          caption: string
          channel_id: string | null
          comments_count: number | null
          created_at: string | null
          id: string
          is_featured: boolean | null
          likes_count: number | null
          media_type: string
          media_url: string
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          caption: string
          channel_id?: string | null
          comments_count?: number | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          media_type: string
          media_url: string
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          caption?: string
          channel_id?: string | null
          comments_count?: number | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          media_type?: string
          media_url?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_wins_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "community_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      community_wins_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          user_id: string
          win_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          user_id: string
          win_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string
          win_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_wins_comments_win_id_fkey"
            columns: ["win_id"]
            isOneToOne: false
            referencedRelation: "community_wins"
            referencedColumns: ["id"]
          },
        ]
      }
      community_wins_likes: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          win_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          win_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          win_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_wins_likes_win_id_fkey"
            columns: ["win_id"]
            isOneToOne: false
            referencedRelation: "community_wins"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_devotionals: {
        Row: {
          challenge: string
          created_at: string | null
          devotional_date: string
          generated_at: string | null
          id: string
          message: string
          prayer_focus: string
          scripture_reference: string
          scripture_text: string
          theme: string | null
          user_id: string
        }
        Insert: {
          challenge: string
          created_at?: string | null
          devotional_date?: string
          generated_at?: string | null
          id?: string
          message: string
          prayer_focus: string
          scripture_reference: string
          scripture_text: string
          theme?: string | null
          user_id: string
        }
        Update: {
          challenge?: string
          created_at?: string | null
          devotional_date?: string
          generated_at?: string | null
          id?: string
          message?: string
          prayer_focus?: string
          scripture_reference?: string
          scripture_text?: string
          theme?: string | null
          user_id?: string
        }
        Relationships: []
      }
      day_completions: {
        Row: {
          completed_at: string
          created_at: string
          day_workout_id: string
          id: string
          user_id: string
          week_number: number
        }
        Insert: {
          completed_at?: string
          created_at?: string
          day_workout_id: string
          id?: string
          user_id: string
          week_number: number
        }
        Update: {
          completed_at?: string
          created_at?: string
          day_workout_id?: string
          id?: string
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "day_completions_day_workout_id_fkey"
            columns: ["day_workout_id"]
            isOneToOne: false
            referencedRelation: "program_day_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      discipline_journals: {
        Row: {
          created_at: string | null
          id: string
          journal_date: string
          prompt: string
          response: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          journal_date?: string
          prompt: string
          response: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          journal_date?: string
          prompt?: string
          response?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      discipline_routines: {
        Row: {
          action_text: string
          created_at: string | null
          description: string | null
          display_order: number | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          routine_type: string
          time_slot: string
          updated_at: string | null
        }
        Insert: {
          action_text: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          routine_type: string
          time_slot: string
          updated_at?: string | null
        }
        Update: {
          action_text?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          routine_type?: string
          time_slot?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      discipline_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean
          name: string
          routines: Json
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          name: string
          routines?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          name?: string
          routines?: Json
          updated_at?: string
        }
        Relationships: []
      }
      email_notification_logs: {
        Row: {
          created_at: string
          email_to: string
          error_message: string | null
          id: string
          metadata: Json | null
          notification_type: string
          sent_at: string | null
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_to: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type: string
          sent_at?: string | null
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_to?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          sent_at?: string | null
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      faith_lessons: {
        Row: {
          action_steps: string | null
          big_idea: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          reflection_questions: string | null
          scripture: string | null
          teaching_content: string | null
          title: string | null
          updated_at: string | null
          week_number: number
          weekly_challenge: string | null
        }
        Insert: {
          action_steps?: string | null
          big_idea?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          reflection_questions?: string | null
          scripture?: string | null
          teaching_content?: string | null
          title?: string | null
          updated_at?: string | null
          week_number: number
          weekly_challenge?: string | null
        }
        Update: {
          action_steps?: string | null
          big_idea?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          reflection_questions?: string | null
          scripture?: string | null
          teaching_content?: string | null
          title?: string | null
          updated_at?: string | null
          week_number?: number
          weekly_challenge?: string | null
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
      meal_feedback: {
        Row: {
          created_at: string
          feedback_date: string
          feedback_type: string
          id: string
          meal_id: string
          notes: string | null
          rating: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_date?: string
          feedback_type: string
          id?: string
          meal_id: string
          notes?: string | null
          rating?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_date?: string
          feedback_type?: string
          id?: string
          meal_id?: string
          notes?: string | null
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_feedback_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_days: {
        Row: {
          created_at: string | null
          day_name: string
          day_number: number
          id: string
          template_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_name: string
          day_number: number
          id?: string
          template_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_name?: string
          day_number?: number
          id?: string
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_days_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_meals: {
        Row: {
          calories: number
          carbs_g: number
          cook_time_min: number | null
          created_at: string | null
          day_id: string
          display_order: number | null
          fats_g: number
          id: string
          image_url: string | null
          ingredients: Json | null
          instructions: string | null
          meal_name: string
          meal_type: string
          notes: string | null
          prep_time_min: number | null
          protein_g: number
          servings: number | null
          updated_at: string | null
        }
        Insert: {
          calories: number
          carbs_g: number
          cook_time_min?: number | null
          created_at?: string | null
          day_id: string
          display_order?: number | null
          fats_g: number
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: string | null
          meal_name: string
          meal_type: string
          notes?: string | null
          prep_time_min?: number | null
          protein_g: number
          servings?: number | null
          updated_at?: string | null
        }
        Update: {
          calories?: number
          carbs_g?: number
          cook_time_min?: number | null
          created_at?: string | null
          day_id?: string
          display_order?: number | null
          fats_g?: number
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: string | null
          meal_name?: string
          meal_type?: string
          notes?: string | null
          prep_time_min?: number | null
          protein_g?: number
          servings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_meals_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_days"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_templates: {
        Row: {
          calorie_range_max: number
          calorie_range_min: number
          created_at: string | null
          daily_carbs_g: number
          daily_fats_g: number
          daily_protein_g: number
          description: string | null
          display_order: number | null
          goal_type: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          calorie_range_max: number
          calorie_range_min: number
          created_at?: string | null
          daily_carbs_g: number
          daily_fats_g: number
          daily_protein_g: number
          description?: string | null
          display_order?: number | null
          goal_type: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          calorie_range_max?: number
          calorie_range_min?: number
          created_at?: string | null
          daily_carbs_g?: number
          daily_fats_g?: number
          daily_protein_g?: number
          description?: string | null
          display_order?: number | null
          goal_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      nutrition_guidelines: {
        Row: {
          content: Json | null
          content_type: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          content_type: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          content_type?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
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
          images: string[] | null
          in_stock: boolean | null
          is_active: boolean | null
          name: string
          price: number
          sizes: string[] | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          is_active?: boolean | null
          name: string
          price: number
          sizes?: string[] | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          is_active?: boolean | null
          name?: string
          price?: number
          sizes?: string[] | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          dashboard_video_watched: boolean | null
          discipline_template_id: string | null
          display_name: string | null
          display_name_preference: string | null
          email: string
          equipment: string | null
          experience: string | null
          faith_commitment: boolean | null
          first_login_video_watched: boolean | null
          first_name: string | null
          goal: string | null
          height: string | null
          id: string
          injuries: string | null
          intake_completed_at: string | null
          last_name: string | null
          onboarding_video_watched: boolean | null
          orientation_dismissed: boolean | null
          phone: string | null
          setup_wizard_completed: boolean | null
          setup_wizard_step: number | null
          sleep_time: string | null
          updated_at: string
          user_id: string
          wake_time: string | null
          weight: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          dashboard_video_watched?: boolean | null
          discipline_template_id?: string | null
          display_name?: string | null
          display_name_preference?: string | null
          email: string
          equipment?: string | null
          experience?: string | null
          faith_commitment?: boolean | null
          first_login_video_watched?: boolean | null
          first_name?: string | null
          goal?: string | null
          height?: string | null
          id?: string
          injuries?: string | null
          intake_completed_at?: string | null
          last_name?: string | null
          onboarding_video_watched?: boolean | null
          orientation_dismissed?: boolean | null
          phone?: string | null
          setup_wizard_completed?: boolean | null
          setup_wizard_step?: number | null
          sleep_time?: string | null
          updated_at?: string
          user_id: string
          wake_time?: string | null
          weight?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          dashboard_video_watched?: boolean | null
          discipline_template_id?: string | null
          display_name?: string | null
          display_name_preference?: string | null
          email?: string
          equipment?: string | null
          experience?: string | null
          faith_commitment?: boolean | null
          first_login_video_watched?: boolean | null
          first_name?: string | null
          goal?: string | null
          height?: string | null
          id?: string
          injuries?: string | null
          intake_completed_at?: string | null
          last_name?: string | null
          onboarding_video_watched?: boolean | null
          orientation_dismissed?: boolean | null
          phone?: string | null
          setup_wizard_completed?: boolean | null
          setup_wizard_step?: number | null
          sleep_time?: string | null
          updated_at?: string
          user_id?: string
          wake_time?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_discipline_template_id_fkey"
            columns: ["discipline_template_id"]
            isOneToOne: false
            referencedRelation: "discipline_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      program_day_exercises: {
        Row: {
          created_at: string | null
          day_workout_id: string
          demo_url: string | null
          display_order: number | null
          exercise_name: string
          form_tips: string | null
          id: string
          instructions: string | null
          muscles_targeted: string | null
          notes: string | null
          reps_or_time: string | null
          rest: string | null
          scaling_options: string | null
          section_type: string
          sets: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_workout_id: string
          demo_url?: string | null
          display_order?: number | null
          exercise_name: string
          form_tips?: string | null
          id?: string
          instructions?: string | null
          muscles_targeted?: string | null
          notes?: string | null
          reps_or_time?: string | null
          rest?: string | null
          scaling_options?: string | null
          section_type: string
          sets?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_workout_id?: string
          demo_url?: string | null
          display_order?: number | null
          exercise_name?: string
          form_tips?: string | null
          id?: string
          instructions?: string | null
          muscles_targeted?: string | null
          notes?: string | null
          reps_or_time?: string | null
          rest?: string | null
          scaling_options?: string | null
          section_type?: string
          sets?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_day_exercises_day_workout_id_fkey"
            columns: ["day_workout_id"]
            isOneToOne: false
            referencedRelation: "program_day_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      program_day_workouts: {
        Row: {
          created_at: string | null
          day_of_week: string
          display_order: number | null
          id: string
          is_rest_day: boolean | null
          updated_at: string | null
          week_id: string
          workout_description: string | null
          workout_name: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: string
          display_order?: number | null
          id?: string
          is_rest_day?: boolean | null
          updated_at?: string | null
          week_id: string
          workout_description?: string | null
          workout_name: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: string
          display_order?: number | null
          id?: string
          is_rest_day?: boolean | null
          updated_at?: string | null
          week_id?: string
          workout_description?: string | null
          workout_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_day_workouts_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "program_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      program_tracks: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          goal_match: string
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          goal_match: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          goal_match?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      program_weeks: {
        Row: {
          conditioning_notes: string | null
          created_at: string | null
          focus_description: string | null
          id: string
          phase: string
          recovery_notes: string | null
          scripture_reference: string | null
          title: string | null
          track_id: string | null
          updated_at: string | null
          video_description: string | null
          video_title: string | null
          video_url: string | null
          week_number: number
          workout_friday: string | null
          workout_monday: string | null
          workout_saturday: string | null
          workout_thursday: string | null
          workout_tuesday: string | null
          workout_wednesday: string | null
        }
        Insert: {
          conditioning_notes?: string | null
          created_at?: string | null
          focus_description?: string | null
          id?: string
          phase: string
          recovery_notes?: string | null
          scripture_reference?: string | null
          title?: string | null
          track_id?: string | null
          updated_at?: string | null
          video_description?: string | null
          video_title?: string | null
          video_url?: string | null
          week_number: number
          workout_friday?: string | null
          workout_monday?: string | null
          workout_saturday?: string | null
          workout_thursday?: string | null
          workout_tuesday?: string | null
          workout_wednesday?: string | null
        }
        Update: {
          conditioning_notes?: string | null
          created_at?: string | null
          focus_description?: string | null
          id?: string
          phase?: string
          recovery_notes?: string | null
          scripture_reference?: string | null
          title?: string | null
          track_id?: string | null
          updated_at?: string | null
          video_description?: string | null
          video_title?: string | null
          video_url?: string | null
          week_number?: number
          workout_friday?: string | null
          workout_monday?: string | null
          workout_saturday?: string | null
          workout_thursday?: string | null
          workout_tuesday?: string | null
          workout_wednesday?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_weeks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "program_tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_weeks_workout_friday_fkey"
            columns: ["workout_friday"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_weeks_workout_monday_fkey"
            columns: ["workout_monday"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_weeks_workout_saturday_fkey"
            columns: ["workout_saturday"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_weeks_workout_thursday_fkey"
            columns: ["workout_thursday"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_weeks_workout_tuesday_fkey"
            columns: ["workout_tuesday"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_weeks_workout_wednesday_fkey"
            columns: ["workout_wednesday"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      program_welcome_videos: {
        Row: {
          created_at: string | null
          id: string
          plan_type: string
          updated_at: string | null
          video_description: string | null
          video_title: string | null
          video_url: string | null
          walkthrough_audio_url: string | null
          walkthrough_video_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          plan_type: string
          updated_at?: string | null
          video_description?: string | null
          video_title?: string | null
          video_url?: string | null
          walkthrough_audio_url?: string | null
          walkthrough_video_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          plan_type?: string
          updated_at?: string | null
          video_description?: string | null
          video_title?: string | null
          video_url?: string | null
          walkthrough_audio_url?: string | null
          walkthrough_video_url?: string | null
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
      progress_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          photo_type: string
          privacy_level: string
          storage_path: string
          taken_at: string | null
          updated_at: string
          user_id: string
          week_number: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_type: string
          privacy_level?: string
          storage_path: string
          taken_at?: string | null
          updated_at?: string
          user_id: string
          week_number?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_type?: string
          privacy_level?: string
          storage_path?: string
          taken_at?: string | null
          updated_at?: string
          user_id?: string
          week_number?: number | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      routine_substeps: {
        Row: {
          action_text: string
          created_at: string
          duration_seconds: number | null
          id: string
          routine_index: number
          step_order: number
          template_id: string
          updated_at: string
        }
        Insert: {
          action_text: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          routine_index: number
          step_order?: number
          template_id: string
          updated_at?: string
        }
        Update: {
          action_text?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          routine_index?: number
          step_order?: number
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_substeps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "discipline_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      scripture_library: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          reference: string
          text: string
          theme: string
          week_max: number | null
          week_min: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          reference: string
          text: string
          theme: string
          week_max?: number | null
          week_min?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          reference?: string
          text?: string
          theme?: string
          week_max?: number | null
          week_min?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      skill_lessons: {
        Row: {
          action_steps: string | null
          content: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_advanced: boolean | null
          is_published: boolean | null
          resources: Json | null
          title: string
          updated_at: string | null
          video_url: string | null
          week_number: number
        }
        Insert: {
          action_steps?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_advanced?: boolean | null
          is_published?: boolean | null
          resources?: Json | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          week_number: number
        }
        Update: {
          action_steps?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_advanced?: boolean | null
          is_published?: boolean | null
          resources?: Json | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          week_number?: number
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
      tier_onboarding_videos: {
        Row: {
          audio_url: string | null
          caption_lines: Json | null
          captions_srt_url: string | null
          created_at: string
          duration_seconds: number | null
          error: string | null
          id: string
          mp4_url: string | null
          screen_slides: Json | null
          script_text: string | null
          slides: Json | null
          status: string
          thumbnail_url: string | null
          tier_config_version: number
          tier_key: string
          updated_at: string
          voice_id: string | null
        }
        Insert: {
          audio_url?: string | null
          caption_lines?: Json | null
          captions_srt_url?: string | null
          created_at?: string
          duration_seconds?: number | null
          error?: string | null
          id?: string
          mp4_url?: string | null
          screen_slides?: Json | null
          script_text?: string | null
          slides?: Json | null
          status?: string
          thumbnail_url?: string | null
          tier_config_version?: number
          tier_key: string
          updated_at?: string
          voice_id?: string | null
        }
        Update: {
          audio_url?: string | null
          caption_lines?: Json | null
          captions_srt_url?: string | null
          created_at?: string
          duration_seconds?: number | null
          error?: string | null
          id?: string
          mp4_url?: string | null
          screen_slides?: Json | null
          script_text?: string | null
          slides?: Json | null
          status?: string
          thumbnail_url?: string | null
          tier_config_version?: number
          tier_key?: string
          updated_at?: string
          voice_id?: string | null
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
      user_custom_routines: {
        Row: {
          action_text: string
          created_at: string
          description: string | null
          display_order: number | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          routine_type: string
          time_slot: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_text: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          routine_type: string
          time_slot: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_text?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          routine_type?: string
          time_slot?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_meal_swaps: {
        Row: {
          created_at: string
          day_number: number
          id: string
          original_meal_id: string
          swap_date: string
          swapped_meal_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_number: number
          id?: string
          original_meal_id: string
          swap_date?: string
          swapped_meal_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_number?: number
          id?: string
          original_meal_id?: string
          swap_date?: string
          swapped_meal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_meal_swaps_original_meal_id_fkey"
            columns: ["original_meal_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_meal_swaps_swapped_meal_id_fkey"
            columns: ["swapped_meal_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_milestones: {
        Row: {
          badge_icon: string | null
          created_at: string | null
          description: string | null
          earned_at: string | null
          id: string
          milestone_key: string
          milestone_name: string
          milestone_type: string
          user_id: string
        }
        Insert: {
          badge_icon?: string | null
          created_at?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          milestone_key: string
          milestone_name: string
          milestone_type: string
          user_id: string
        }
        Update: {
          badge_icon?: string | null
          created_at?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          milestone_key?: string
          milestone_name?: string
          milestone_type?: string
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
      user_routine_durations: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          routine_index: number
          template_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          routine_index: number
          template_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          routine_index?: number
          template_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_routine_durations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "discipline_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_routine_substeps: {
        Row: {
          action_text: string
          created_at: string
          id: string
          is_deleted: boolean
          is_override: boolean
          original_substep_id: string | null
          routine_index: number
          step_order: number
          template_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_text: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_override?: boolean
          original_substep_id?: string | null
          routine_index: number
          step_order?: number
          template_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_text?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_override?: boolean
          original_substep_id?: string | null
          routine_index?: number
          step_order?: number
          template_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_routine_substeps_original_substep_id_fkey"
            columns: ["original_substep_id"]
            isOneToOne: false
            referencedRelation: "routine_substeps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_routine_substeps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "discipline_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_routine_times: {
        Row: {
          created_at: string | null
          custom_time: string
          id: string
          routine_index: number
          template_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custom_time: string
          id?: string
          routine_index: number
          template_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          custom_time?: string
          id?: string
          routine_index?: number
          template_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_routine_times_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "discipline_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_substep_completions: {
        Row: {
          completed_at: string
          completion_date: string
          id: string
          substep_id: string | null
          user_id: string
          user_substep_id: string | null
        }
        Insert: {
          completed_at?: string
          completion_date?: string
          id?: string
          substep_id?: string | null
          user_id: string
          user_substep_id?: string | null
        }
        Update: {
          completed_at?: string
          completion_date?: string
          id?: string
          substep_id?: string | null
          user_id?: string
          user_substep_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_substep_completions_substep_id_fkey"
            columns: ["substep_id"]
            isOneToOne: false
            referencedRelation: "routine_substeps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_substep_completions_user_substep_id_fkey"
            columns: ["user_substep_id"]
            isOneToOne: false
            referencedRelation: "user_routine_substeps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_week_plans: {
        Row: {
          created_at: string
          generated_from_intake: boolean | null
          id: string
          plan_data: Json
          updated_at: string
          user_id: string
          week_number: number
        }
        Insert: {
          created_at?: string
          generated_from_intake?: boolean | null
          id?: string
          plan_data?: Json
          updated_at?: string
          user_id: string
          week_number: number
        }
        Update: {
          created_at?: string
          generated_from_intake?: boolean | null
          id?: string
          plan_data?: Json
          updated_at?: string
          user_id?: string
          week_number?: number
        }
        Relationships: []
      }
      warden_conversations: {
        Row: {
          created_at: string | null
          id: string
          messages: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      warden_messages: {
        Row: {
          created_at: string | null
          focus_area: string | null
          generated_at: string | null
          id: string
          message: string
          message_type: string
          scripture_reference: string | null
          scripture_text: string | null
          updated_at: string | null
          user_id: string
          week_number: number
        }
        Insert: {
          created_at?: string | null
          focus_area?: string | null
          generated_at?: string | null
          id?: string
          message: string
          message_type?: string
          scripture_reference?: string | null
          scripture_text?: string | null
          updated_at?: string | null
          user_id: string
          week_number: number
        }
        Update: {
          created_at?: string | null
          focus_area?: string | null
          generated_at?: string | null
          id?: string
          message?: string
          message_type?: string
          scripture_reference?: string | null
          scripture_text?: string | null
          updated_at?: string | null
          user_id?: string
          week_number?: number
        }
        Relationships: []
      }
      workout_completions: {
        Row: {
          completed_at: string
          created_at: string
          day_of_week: string
          exercise_id: string
          id: string
          user_id: string
          week_number: number
        }
        Insert: {
          completed_at?: string
          created_at?: string
          day_of_week: string
          exercise_id: string
          id?: string
          user_id: string
          week_number: number
        }
        Update: {
          completed_at?: string
          created_at?: string
          day_of_week?: string
          exercise_id?: string
          id?: string
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_completions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "program_day_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          display_order: number | null
          exercise_name: string
          id: string
          notes: string | null
          reps_or_time: string | null
          rest: string | null
          scaling_options: string | null
          section_type: string
          sets: string | null
          template_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          exercise_name: string
          id?: string
          notes?: string | null
          reps_or_time?: string | null
          rest?: string | null
          scaling_options?: string | null
          section_type: string
          sets?: string | null
          template_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          exercise_name?: string
          id?: string
          notes?: string | null
          reps_or_time?: string | null
          rest?: string | null
          scaling_options?: string | null
          section_type?: string
          sets?: string | null
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          focus: string | null
          id: string
          is_active: boolean | null
          is_bodyweight: boolean | null
          name: string
          template_slug: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          focus?: string | null
          id?: string
          is_active?: boolean | null
          is_bodyweight?: boolean | null
          name: string
          template_slug: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          focus?: string | null
          id?: string
          is_active?: boolean | null
          is_bodyweight?: boolean | null
          name?: string
          template_slug?: string
          updated_at?: string | null
          video_url?: string | null
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
