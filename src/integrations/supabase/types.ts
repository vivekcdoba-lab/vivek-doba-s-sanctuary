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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agreements: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          fields_json: Json | null
          id: string
          pdf_url: string | null
          signed_at: string | null
          type: string
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          fields_json?: Json | null
          id?: string
          pdf_url?: string | null
          signed_at?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          fields_json?: Json | null
          id?: string
          pdf_url?: string | null
          signed_at?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agreements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          analysis_text: string | null
          client_id: string
          coach_id: string
          created_at: string
          id: string
          language: string | null
          scores_json: Json | null
          taken_at: string
        }
        Insert: {
          analysis_text?: string | null
          client_id: string
          coach_id: string
          created_at?: string
          id?: string
          language?: string | null
          scores_json?: Json | null
          taken_at?: string
        }
        Update: {
          analysis_text?: string | null
          client_id?: string
          coach_id?: string
          created_at?: string
          id?: string
          language?: string | null
          scores_json?: Json | null
          taken_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          category: string | null
          course_id: string | null
          created_at: string
          description: string | null
          due_date: string
          feedback: string | null
          id: string
          priority: string | null
          score: number | null
          seeker_id: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          feedback?: string | null
          id?: string
          priority?: string | null
          score?: number | null
          seeker_id: string
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          feedback?: string | null
          id?: string
          priority?: string | null
          score?: number | null
          seeker_id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          color: string | null
          created_at: string
          date: string
          end_time: string
          id: string
          notes: string | null
          seeker_id: string | null
          start_time: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          date: string
          end_time: string
          id?: string
          notes?: string | null
          seeker_id?: string | null
          start_time: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          notes?: string | null
          seeker_id?: string | null
          start_time?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          coach_id: string
          course: string | null
          created_at: string
          dob: string | null
          education: string | null
          email: string | null
          gender: string | null
          id: string
          income: string | null
          mobile: string | null
          name: string
          personal_history_json: Json | null
          sessions_committed: number | null
          signature_data: string | null
          updated_at: string
        }
        Insert: {
          coach_id: string
          course?: string | null
          created_at?: string
          dob?: string | null
          education?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          income?: string | null
          mobile?: string | null
          name: string
          personal_history_json?: Json | null
          sessions_committed?: number | null
          signature_data?: string | null
          updated_at?: string
        }
        Update: {
          coach_id?: string
          course?: string | null
          created_at?: string
          dob?: string | null
          education?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          income?: string | null
          mobile?: string | null
          name?: string
          personal_history_json?: Json | null
          sessions_committed?: number | null
          signature_data?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          duration: string | null
          format: string | null
          gradient_colors: Json | null
          id: string
          is_active: boolean | null
          max_participants: number | null
          name: string
          price: number
          tagline: string | null
          tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: string | null
          format?: string | null
          gradient_colors?: Json | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          name: string
          price?: number
          tagline?: string | null
          tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string | null
          format?: string | null
          gradient_colors?: Json | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          name?: string
          price?: number
          tagline?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          affirmation: string | null
          challenges: string | null
          created_at: string
          energy_level: number | null
          exercise_done: boolean | null
          gratitude_entries: Json | null
          id: string
          journaling_done: boolean | null
          log_date: string
          meditation_done: boolean | null
          meditation_minutes: number | null
          mood: string | null
          notes: string | null
          seeker_id: string
          wins: Json | null
        }
        Insert: {
          affirmation?: string | null
          challenges?: string | null
          created_at?: string
          energy_level?: number | null
          exercise_done?: boolean | null
          gratitude_entries?: Json | null
          id?: string
          journaling_done?: boolean | null
          log_date?: string
          meditation_done?: boolean | null
          meditation_minutes?: number | null
          mood?: string | null
          notes?: string | null
          seeker_id: string
          wins?: Json | null
        }
        Update: {
          affirmation?: string | null
          challenges?: string | null
          created_at?: string
          energy_level?: number | null
          exercise_done?: boolean | null
          gratitude_entries?: Json | null
          id?: string
          journaling_done?: boolean | null
          log_date?: string
          meditation_done?: boolean | null
          meditation_minutes?: number | null
          mood?: string | null
          notes?: string | null
          seeker_id?: string
          wins?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string
          created_at: string
          end_date: string | null
          id: string
          payment_status: string
          seeker_id: string
          start_date: string
          status: string
          tier: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          payment_status?: string
          seeker_id: string
          start_date?: string
          status?: string
          tier?: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          payment_status?: string
          seeker_id?: string
          start_date?: string
          status?: string
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          completion_notes: string | null
          created_at: string
          due_date: string
          id: string
          notes: string | null
          priority: string | null
          seeker_id: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          completion_notes?: string | null
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          priority?: string | null
          seeker_id: string
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          completion_notes?: string | null
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          priority?: string | null
          seeker_id?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          current_challenge: string | null
          days_in_pipeline: number | null
          email: string | null
          id: string
          interested_course_id: string | null
          name: string
          next_followup_date: string | null
          notes: string | null
          phone: string | null
          priority: string | null
          source: string | null
          stage: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_challenge?: string | null
          days_in_pipeline?: number | null
          email?: string | null
          id?: string
          interested_course_id?: string | null
          name: string
          next_followup_date?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string | null
          source?: string | null
          stage?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_challenge?: string | null
          days_in_pipeline?: number | null
          email?: string | null
          id?: string
          interested_course_id?: string | null
          name?: string
          next_followup_date?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string | null
          source?: string | null
          stage?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_interested_course_id_fkey"
            columns: ["interested_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          gst_amount: number
          id: string
          invoice_number: string
          method: string
          notes: string | null
          payment_date: string | null
          seeker_id: string
          status: string
          total_amount: number
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          gst_amount?: number
          id?: string
          invoice_number: string
          method?: string
          notes?: string | null
          payment_date?: string | null
          seeker_id: string
          status?: string
          total_amount: number
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          gst_amount?: number
          id?: string
          invoice_number?: string
          method?: string
          notes?: string | null
          payment_date?: string | null
          seeker_id?: string
          status?: string
          total_amount?: number
          transaction_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          blood_group: string | null
          city: string | null
          company: string | null
          created_at: string
          designation: string | null
          dob: string | null
          email: string
          experience_years: number | null
          full_name: string
          gender: string | null
          hometown: string | null
          id: string
          industry: string | null
          linkedin_url: string | null
          occupation: string | null
          phone: string | null
          pincode: string | null
          revenue_range: string | null
          role: string
          state: string | null
          team_size: number | null
          updated_at: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          blood_group?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          designation?: string | null
          dob?: string | null
          email: string
          experience_years?: number | null
          full_name: string
          gender?: string | null
          hometown?: string | null
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          occupation?: string | null
          phone?: string | null
          pincode?: string | null
          revenue_range?: string | null
          role?: string
          state?: string | null
          team_size?: number | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          blood_group?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          designation?: string | null
          dob?: string | null
          email?: string
          experience_years?: number | null
          full_name?: string
          gender?: string | null
          hometown?: string | null
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          occupation?: string | null
          phone?: string | null
          pincode?: string | null
          revenue_range?: string | null
          role?: string
          state?: string | null
          team_size?: number | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string | null
          course_id: string | null
          created_at: string
          description: string | null
          download_count: number | null
          file_url: string | null
          id: string
          language: string | null
          tags: Json | null
          title: string
          type: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          category?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_url?: string | null
          id?: string
          language?: string | null
          tags?: Json | null
          title: string
          type?: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          category?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_url?: string | null
          id?: string
          language?: string | null
          tags?: Json | null
          title?: string
          type?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      seeker_assessments: {
        Row: {
          analysis_text: string | null
          created_at: string
          id: string
          notes: string | null
          period: string | null
          scores_json: Json | null
          seeker_id: string
          type: string
          updated_at: string
        }
        Insert: {
          analysis_text?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          period?: string | null
          scores_json?: Json | null
          seeker_id: string
          type: string
          updated_at?: string
        }
        Update: {
          analysis_text?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          period?: string | null
          scores_json?: Json | null
          seeker_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seeker_assessments_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          attendance: string | null
          breakthroughs: string | null
          coach_private_notes: string | null
          course_id: string | null
          created_at: string
          date: string
          duration_minutes: number | null
          end_time: string
          engagement_score: number | null
          id: string
          key_insights: string | null
          location_type: string | null
          meeting_link: string | null
          missed_reason: string | null
          post_session_feedback: Json | null
          reschedule_reason: string | null
          seeker_id: string
          seeker_mood: string | null
          session_notes: string | null
          session_number: number
          start_time: string
          status: string
          topics_covered: Json | null
          updated_at: string
        }
        Insert: {
          attendance?: string | null
          breakthroughs?: string | null
          coach_private_notes?: string | null
          course_id?: string | null
          created_at?: string
          date: string
          duration_minutes?: number | null
          end_time: string
          engagement_score?: number | null
          id?: string
          key_insights?: string | null
          location_type?: string | null
          meeting_link?: string | null
          missed_reason?: string | null
          post_session_feedback?: Json | null
          reschedule_reason?: string | null
          seeker_id: string
          seeker_mood?: string | null
          session_notes?: string | null
          session_number?: number
          start_time: string
          status?: string
          topics_covered?: Json | null
          updated_at?: string
        }
        Update: {
          attendance?: string | null
          breakthroughs?: string | null
          coach_private_notes?: string | null
          course_id?: string | null
          created_at?: string
          date?: string
          duration_minutes?: number | null
          end_time?: string
          engagement_score?: number | null
          id?: string
          key_insights?: string | null
          location_type?: string | null
          meeting_link?: string | null
          missed_reason?: string | null
          post_session_feedback?: Json | null
          reschedule_reason?: string | null
          seeker_id?: string
          seeker_mood?: string | null
          session_notes?: string | null
          session_number?: number
          start_time?: string
          status?: string
          topics_covered?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          admin_notes: string | null
          country_code: string | null
          created_at: string
          email: string
          form_data: Json
          form_type: string
          full_name: string
          id: string
          mobile: string | null
          status: Database["public"]["Enums"]["submission_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          country_code?: string | null
          created_at?: string
          email: string
          form_data?: Json
          form_type: string
          full_name: string
          id?: string
          mobile?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          country_code?: string | null
          created_at?: string
          email?: string
          form_data?: Json
          form_type?: string
          full_name?: string
          id?: string
          mobile?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
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
      submission_status: "pending" | "approved" | "rejected" | "info_requested"
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
      submission_status: ["pending", "approved", "rejected", "info_requested"],
    },
  },
} as const
