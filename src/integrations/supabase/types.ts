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
      accounting_records: {
        Row: {
          business_id: string
          created_at: string
          expenses: number | null
          expenses_enc: string | null
          id: string
          month: number
          notes: string | null
          notes_enc: string | null
          payables: number | null
          profit: number | null
          receivables: number | null
          revenue: number | null
          revenue_enc: string | null
          taxes: number | null
          taxes_enc: string | null
          year: number
        }
        Insert: {
          business_id: string
          created_at?: string
          expenses?: number | null
          expenses_enc?: string | null
          id?: string
          month: number
          notes?: string | null
          notes_enc?: string | null
          payables?: number | null
          profit?: number | null
          receivables?: number | null
          revenue?: number | null
          revenue_enc?: string | null
          taxes?: number | null
          taxes_enc?: string | null
          year: number
        }
        Update: {
          business_id?: string
          created_at?: string
          expenses?: number | null
          expenses_enc?: string | null
          id?: string
          month?: number
          notes?: string | null
          notes_enc?: string | null
          payables?: number | null
          profit?: number | null
          receivables?: number | null
          revenue?: number | null
          revenue_enc?: string | null
          taxes?: number | null
          taxes_enc?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "accounting_records_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          audience: string[]
          content: string
          course_id: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_pinned: boolean
          priority: string
          starts_at: string | null
          title: string
          type: string
        }
        Insert: {
          audience?: string[]
          content: string
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_pinned?: boolean
          priority?: string
          starts_at?: string | null
          title: string
          type?: string
        }
        Update: {
          audience?: string[]
          content?: string
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_pinned?: boolean
          priority?: string
          starts_at?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      assessment_actions: {
        Row: {
          action_text: string
          assessment_id: string | null
          assessment_type: string
          category: string | null
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          priority: number | null
          seeker_id: string
          status: string
        }
        Insert: {
          action_text: string
          assessment_id?: string | null
          assessment_type?: string
          category?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          priority?: number | null
          seeker_id: string
          status?: string
        }
        Update: {
          action_text?: string
          assessment_id?: string | null
          assessment_type?: string
          category?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          priority?: number | null
          seeker_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_actions_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_config: {
        Row: {
          assessment_type: string
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          assessment_type: string
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          assessment_type?: string
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
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
      badge_definitions: {
        Row: {
          badge_key: string
          category: string
          condition_field: string | null
          condition_streak_days: number
          condition_threshold: number
          condition_type: string
          created_at: string
          description: string
          emoji: string
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          badge_key: string
          category?: string
          condition_field?: string | null
          condition_streak_days?: number
          condition_threshold?: number
          condition_type: string
          created_at?: string
          description: string
          emoji: string
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          badge_key?: string
          category?: string
          condition_field?: string | null
          condition_streak_days?: number
          condition_threshold?: number
          condition_type?: string
          created_at?: string
          description?: string
          emoji?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      batches: {
        Row: {
          capacity: number
          course_id: string | null
          created_at: string
          id: string
          name: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          course_id?: string | null
          created_at?: string
          id?: string
          name: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          course_id?: string | null
          created_at?: string
          id?: string
          name?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      branding_strategy: {
        Row: {
          brand_colors: Json | null
          brand_personality: string | null
          brand_story: string | null
          brand_voice: string | null
          business_id: string
          created_at: string
          id: string
          logo_description: string | null
          positioning_statement: string | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          brand_colors?: Json | null
          brand_personality?: string | null
          brand_story?: string | null
          brand_voice?: string | null
          business_id: string
          created_at?: string
          id?: string
          logo_description?: string | null
          positioning_statement?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          brand_colors?: Json | null
          brand_personality?: string | null
          brand_story?: string | null
          brand_voice?: string | null
          business_id?: string
          created_at?: string
          id?: string
          logo_description?: string | null
          positioning_statement?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branding_strategy_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_competitors: {
        Row: {
          business_id: string
          competitor_name: string
          created_at: string
          id: string
          notes: string | null
          pricing: string | null
          strengths: string | null
          threat_level: string | null
          weaknesses: string | null
          website: string | null
        }
        Insert: {
          business_id: string
          competitor_name: string
          created_at?: string
          id?: string
          notes?: string | null
          pricing?: string | null
          strengths?: string | null
          threat_level?: string | null
          weaknesses?: string | null
          website?: string | null
        }
        Update: {
          business_id?: string
          competitor_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          pricing?: string | null
          strengths?: string | null
          threat_level?: string | null
          weaknesses?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_competitors_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_mission_vision: {
        Row: {
          business_id: string
          created_at: string
          id: string
          mission_statement: string | null
          purpose_statement: string | null
          updated_at: string
          vision_statement: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          mission_statement?: string | null
          purpose_statement?: string | null
          updated_at?: string
          vision_statement?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          mission_statement?: string | null
          purpose_statement?: string | null
          updated_at?: string
          vision_statement?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_mission_vision_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          bank_account_enc: string | null
          business_name: string
          created_at: string
          founded_year: number | null
          gst_hash: string | null
          gst_number_enc: string | null
          id: string
          ifsc_enc: string | null
          industry: string | null
          logo_url: string | null
          pan_enc: string | null
          pan_hash: string | null
          revenue_enc: string | null
          revenue_range: string | null
          seeker_id: string
          tagline: string | null
          team_size: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          bank_account_enc?: string | null
          business_name: string
          created_at?: string
          founded_year?: number | null
          gst_hash?: string | null
          gst_number_enc?: string | null
          id?: string
          ifsc_enc?: string | null
          industry?: string | null
          logo_url?: string | null
          pan_enc?: string | null
          pan_hash?: string | null
          revenue_enc?: string | null
          revenue_range?: string | null
          seeker_id: string
          tagline?: string | null
          team_size?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          bank_account_enc?: string | null
          business_name?: string
          created_at?: string
          founded_year?: number | null
          gst_hash?: string | null
          gst_number_enc?: string | null
          id?: string
          ifsc_enc?: string | null
          industry?: string | null
          logo_url?: string | null
          pan_enc?: string | null
          pan_hash?: string | null
          revenue_enc?: string | null
          revenue_range?: string | null
          seeker_id?: string
          tagline?: string | null
          team_size?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_swot_items: {
        Row: {
          action_plan: string | null
          business_id: string
          created_at: string
          description: string | null
          id: string
          importance: number | null
          title: string
          type: string
        }
        Insert: {
          action_plan?: string | null
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          importance?: number | null
          title: string
          type: string
        }
        Update: {
          action_plan?: string | null
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          importance?: number | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_swot_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_values: {
        Row: {
          business_id: string
          created_at: string
          icon_emoji: string | null
          id: string
          priority_order: number
          value_description: string | null
          value_name: string
        }
        Insert: {
          business_id: string
          created_at?: string
          icon_emoji?: string | null
          id?: string
          priority_order?: number
          value_description?: string | null
          value_name: string
        }
        Update: {
          business_id?: string
          created_at?: string
          icon_emoji?: string | null
          id?: string
          priority_order?: number
          value_description?: string | null
          value_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_values_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
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
      cashflow_records: {
        Row: {
          amount: number
          amount_enc: string | null
          balance_after: number | null
          business_id: string
          category: string | null
          created_at: string
          date: string
          description: string | null
          description_enc: string | null
          id: string
          type: string
        }
        Insert: {
          amount?: number
          amount_enc?: string | null
          balance_after?: number | null
          business_id: string
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          description_enc?: string | null
          id?: string
          type: string
        }
        Update: {
          amount?: number
          amount_enc?: string | null
          balance_after?: number | null
          business_id?: string
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          description_enc?: string | null
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "cashflow_records_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_feedback: {
        Row: {
          business_id: string
          category: string | null
          client_name: string
          created_at: string
          feedback_date: string
          feedback_text: string | null
          id: string
          rating: number
          resolved: boolean | null
          response_action: string | null
        }
        Insert: {
          business_id: string
          category?: string | null
          client_name: string
          created_at?: string
          feedback_date?: string
          feedback_text?: string | null
          id?: string
          rating: number
          resolved?: boolean | null
          response_action?: string | null
        }
        Update: {
          business_id?: string
          category?: string | null
          client_name?: string
          created_at?: string
          feedback_date?: string
          feedback_text?: string | null
          id?: string
          rating?: number
          resolved?: boolean | null
          response_action?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_feedback_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          children_details_enc: string | null
          coach_id: string
          course: string | null
          created_at: string
          dob: string | null
          education: string | null
          email: string | null
          family_details_enc: string | null
          gender: string | null
          id: string
          income: string | null
          medical_history_enc: string | null
          mobile: string | null
          name: string
          parents_details_enc: string | null
          personal_history_enc: string | null
          personal_history_json: Json | null
          relationship_status_enc: string | null
          sessions_committed: number | null
          signature_data: string | null
          updated_at: string
        }
        Insert: {
          children_details_enc?: string | null
          coach_id: string
          course?: string | null
          created_at?: string
          dob?: string | null
          education?: string | null
          email?: string | null
          family_details_enc?: string | null
          gender?: string | null
          id?: string
          income?: string | null
          medical_history_enc?: string | null
          mobile?: string | null
          name: string
          parents_details_enc?: string | null
          personal_history_enc?: string | null
          personal_history_json?: Json | null
          relationship_status_enc?: string | null
          sessions_committed?: number | null
          signature_data?: string | null
          updated_at?: string
        }
        Update: {
          children_details_enc?: string | null
          coach_id?: string
          course?: string | null
          created_at?: string
          dob?: string | null
          education?: string | null
          email?: string | null
          family_details_enc?: string | null
          gender?: string | null
          id?: string
          income?: string | null
          medical_history_enc?: string | null
          mobile?: string | null
          name?: string
          parents_details_enc?: string | null
          personal_history_enc?: string | null
          personal_history_json?: Json | null
          relationship_status_enc?: string | null
          sessions_committed?: number | null
          signature_data?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coach_assessment_feedback: {
        Row: {
          action_items: Json | null
          assessment_id: string | null
          assessment_type: string
          coach_id: string
          created_at: string
          general_notes: string | null
          id: string
          seeker_id: string
          shared_with_seeker: boolean | null
          spoke_feedback: Json | null
          updated_at: string
        }
        Insert: {
          action_items?: Json | null
          assessment_id?: string | null
          assessment_type?: string
          coach_id: string
          created_at?: string
          general_notes?: string | null
          id?: string
          seeker_id: string
          shared_with_seeker?: boolean | null
          spoke_feedback?: Json | null
          updated_at?: string
        }
        Update: {
          action_items?: Json | null
          assessment_id?: string | null
          assessment_type?: string
          coach_id?: string
          created_at?: string
          general_notes?: string | null
          id?: string
          seeker_id?: string
          shared_with_seeker?: boolean | null
          spoke_feedback?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_assessment_feedback_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_assessment_feedback_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_seekers: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          coach_id: string
          id: string
          is_primary: boolean
          seeker_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          coach_id: string
          id?: string
          is_primary?: boolean
          seeker_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          coach_id?: string
          id?: string
          is_primary?: boolean
          seeker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_seekers_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_seekers_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_seekers_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_weekly_challenges: {
        Row: {
          challenge_description: string | null
          challenge_text: string
          coach_id: string
          created_at: string
          id: string
          is_active: boolean | null
          lgt_pillar: string | null
          seeker_id: string | null
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          challenge_description?: string | null
          challenge_text: string
          coach_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          lgt_pillar?: string | null
          seeker_id?: string | null
          week_end_date: string
          week_start_date: string
        }
        Update: {
          challenge_description?: string | null
          challenge_text?: string
          coach_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          lgt_pillar?: string | null
          seeker_id?: string | null
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_weekly_challenges_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          duration: string | null
          event_date: string | null
          format: string | null
          gradient_colors: Json | null
          id: string
          is_active: boolean | null
          location: string | null
          location_type: string | null
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
          event_date?: string | null
          format?: string | null
          gradient_colors?: Json | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          location_type?: string | null
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
          event_date?: string | null
          format?: string | null
          gradient_colors?: Json | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          location_type?: string | null
          max_participants?: number | null
          name?: string
          price?: number
          tagline?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_affirmations: {
        Row: {
          affirmation_hindi: string | null
          affirmation_text: string
          author: string | null
          category: string | null
          created_at: string
          display_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          source: string | null
        }
        Insert: {
          affirmation_hindi?: string | null
          affirmation_text: string
          author?: string | null
          category?: string | null
          created_at?: string
          display_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          source?: string | null
        }
        Update: {
          affirmation_hindi?: string | null
          affirmation_text?: string
          author?: string | null
          category?: string | null
          created_at?: string
          display_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          source?: string | null
        }
        Relationships: []
      }
      daily_financial_log: {
        Row: {
          amount_inr: number | null
          category: string | null
          created_at: string
          entry_type: string
          id: string
          source_description: string | null
          worksheet_id: string
        }
        Insert: {
          amount_inr?: number | null
          category?: string | null
          created_at?: string
          entry_type: string
          id?: string
          source_description?: string | null
          worksheet_id: string
        }
        Update: {
          amount_inr?: number | null
          category?: string | null
          created_at?: string
          entry_type?: string
          id?: string
          source_description?: string | null
          worksheet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_financial_log_worksheet_id_fkey"
            columns: ["worksheet_id"]
            isOneToOne: false
            referencedRelation: "daily_worksheets"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_lgt_checkins: {
        Row: {
          artha_score: number
          checkin_date: string
          created_at: string
          dharma_score: number
          focus_recommendation: string | null
          id: string
          kama_score: number
          moksha_score: number
          overall_balance: number | null
          seeker_id: string
        }
        Insert: {
          artha_score?: number
          checkin_date?: string
          created_at?: string
          dharma_score?: number
          focus_recommendation?: string | null
          id?: string
          kama_score?: number
          moksha_score?: number
          overall_balance?: number | null
          seeker_id: string
        }
        Update: {
          artha_score?: number
          checkin_date?: string
          created_at?: string
          dharma_score?: number
          focus_recommendation?: string | null
          id?: string
          kama_score?: number
          moksha_score?: number
          overall_balance?: number | null
          seeker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_lgt_checkins_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      daily_non_negotiable_log: {
        Row: {
          id: string
          is_completed: boolean | null
          logged_at: string | null
          non_negotiable_id: string
          worksheet_id: string
        }
        Insert: {
          id?: string
          is_completed?: boolean | null
          logged_at?: string | null
          non_negotiable_id: string
          worksheet_id: string
        }
        Update: {
          id?: string
          is_completed?: boolean | null
          logged_at?: string | null
          non_negotiable_id?: string
          worksheet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_non_negotiable_log_non_negotiable_id_fkey"
            columns: ["non_negotiable_id"]
            isOneToOne: false
            referencedRelation: "seeker_non_negotiables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_non_negotiable_log_worksheet_id_fkey"
            columns: ["worksheet_id"]
            isOneToOne: false
            referencedRelation: "daily_worksheets"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_priorities: {
        Row: {
          id: string
          is_completed: boolean | null
          lgt_pillar: string | null
          priority_number: number
          task_description: string | null
          time_estimate_minutes: number | null
          worksheet_id: string
        }
        Insert: {
          id?: string
          is_completed?: boolean | null
          lgt_pillar?: string | null
          priority_number: number
          task_description?: string | null
          time_estimate_minutes?: number | null
          worksheet_id: string
        }
        Update: {
          id?: string
          is_completed?: boolean | null
          lgt_pillar?: string | null
          priority_number?: number
          task_description?: string | null
          time_estimate_minutes?: number | null
          worksheet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_priorities_worksheet_id_fkey"
            columns: ["worksheet_id"]
            isOneToOne: false
            referencedRelation: "daily_worksheets"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_time_slots: {
        Row: {
          activity_category: string | null
          activity_name: string | null
          actual_status: string | null
          created_at: string
          energy_level: string | null
          id: string
          is_completed: boolean | null
          is_planned: boolean | null
          lgt_pillar: string | null
          modified_activity_name: string | null
          notes: string | null
          skip_reason: string | null
          slot_end_time: string
          slot_start_time: string
          worksheet_id: string
        }
        Insert: {
          activity_category?: string | null
          activity_name?: string | null
          actual_status?: string | null
          created_at?: string
          energy_level?: string | null
          id?: string
          is_completed?: boolean | null
          is_planned?: boolean | null
          lgt_pillar?: string | null
          modified_activity_name?: string | null
          notes?: string | null
          skip_reason?: string | null
          slot_end_time: string
          slot_start_time: string
          worksheet_id: string
        }
        Update: {
          activity_category?: string | null
          activity_name?: string | null
          actual_status?: string | null
          created_at?: string
          energy_level?: string | null
          id?: string
          is_completed?: boolean | null
          is_planned?: boolean | null
          lgt_pillar?: string | null
          modified_activity_name?: string | null
          notes?: string | null
          skip_reason?: string | null
          slot_end_time?: string
          slot_start_time?: string
          worksheet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_time_slots_worksheet_id_fkey"
            columns: ["worksheet_id"]
            isOneToOne: false
            referencedRelation: "daily_worksheets"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_worksheets: {
        Row: {
          aha_moment: string | null
          artha_score: number | null
          body_weight_kg: number | null
          coach_weekly_challenge_done: boolean | null
          completion_rate_percent: number | null
          created_at: string
          dharma_score: number | null
          do_differently: string | null
          end_energy_level: number | null
          evening_emotional_satisfaction: number | null
          evening_fulfillment: number | null
          evening_fulfillment_score: number | null
          evening_mental_peace: number | null
          evening_mood: string | null
          gratitude_1: string | null
          gratitude_2: string | null
          gratitude_3: string | null
          gratitude_4: string | null
          gratitude_5: string | null
          id: string
          is_draft: boolean | null
          is_submitted: boolean | null
          kama_score: number | null
          lgt_balance_score: number | null
          moksha_score: number | null
          morning_clarity_score: number | null
          morning_energy_score: number | null
          morning_intention: string | null
          morning_mood: string | null
          morning_peace_score: number | null
          morning_readiness_score: number | null
          non_negotiables_completed: number | null
          non_negotiables_total: number | null
          sampoorna_din_score: number | null
          screen_time_hours: number | null
          seeker_id: string
          share_with_buddy: boolean | null
          sleep_hours: number | null
          sleep_quality: string | null
          steps_taken: number | null
          supplements_taken: boolean | null
          todays_win_1: string | null
          todays_win_2: string | null
          todays_win_3: string | null
          tomorrow_prep_score: number | null
          tomorrow_sankalp: string | null
          updated_at: string
          water_intake_glasses: number | null
          what_i_learned: string | null
          what_went_well: string | null
          workout_done: boolean | null
          workout_duration_minutes: number | null
          workout_type: string | null
          worksheet_date: string
        }
        Insert: {
          aha_moment?: string | null
          artha_score?: number | null
          body_weight_kg?: number | null
          coach_weekly_challenge_done?: boolean | null
          completion_rate_percent?: number | null
          created_at?: string
          dharma_score?: number | null
          do_differently?: string | null
          end_energy_level?: number | null
          evening_emotional_satisfaction?: number | null
          evening_fulfillment?: number | null
          evening_fulfillment_score?: number | null
          evening_mental_peace?: number | null
          evening_mood?: string | null
          gratitude_1?: string | null
          gratitude_2?: string | null
          gratitude_3?: string | null
          gratitude_4?: string | null
          gratitude_5?: string | null
          id?: string
          is_draft?: boolean | null
          is_submitted?: boolean | null
          kama_score?: number | null
          lgt_balance_score?: number | null
          moksha_score?: number | null
          morning_clarity_score?: number | null
          morning_energy_score?: number | null
          morning_intention?: string | null
          morning_mood?: string | null
          morning_peace_score?: number | null
          morning_readiness_score?: number | null
          non_negotiables_completed?: number | null
          non_negotiables_total?: number | null
          sampoorna_din_score?: number | null
          screen_time_hours?: number | null
          seeker_id: string
          share_with_buddy?: boolean | null
          sleep_hours?: number | null
          sleep_quality?: string | null
          steps_taken?: number | null
          supplements_taken?: boolean | null
          todays_win_1?: string | null
          todays_win_2?: string | null
          todays_win_3?: string | null
          tomorrow_prep_score?: number | null
          tomorrow_sankalp?: string | null
          updated_at?: string
          water_intake_glasses?: number | null
          what_i_learned?: string | null
          what_went_well?: string | null
          workout_done?: boolean | null
          workout_duration_minutes?: number | null
          workout_type?: string | null
          worksheet_date: string
        }
        Update: {
          aha_moment?: string | null
          artha_score?: number | null
          body_weight_kg?: number | null
          coach_weekly_challenge_done?: boolean | null
          completion_rate_percent?: number | null
          created_at?: string
          dharma_score?: number | null
          do_differently?: string | null
          end_energy_level?: number | null
          evening_emotional_satisfaction?: number | null
          evening_fulfillment?: number | null
          evening_fulfillment_score?: number | null
          evening_mental_peace?: number | null
          evening_mood?: string | null
          gratitude_1?: string | null
          gratitude_2?: string | null
          gratitude_3?: string | null
          gratitude_4?: string | null
          gratitude_5?: string | null
          id?: string
          is_draft?: boolean | null
          is_submitted?: boolean | null
          kama_score?: number | null
          lgt_balance_score?: number | null
          moksha_score?: number | null
          morning_clarity_score?: number | null
          morning_energy_score?: number | null
          morning_intention?: string | null
          morning_mood?: string | null
          morning_peace_score?: number | null
          morning_readiness_score?: number | null
          non_negotiables_completed?: number | null
          non_negotiables_total?: number | null
          sampoorna_din_score?: number | null
          screen_time_hours?: number | null
          seeker_id?: string
          share_with_buddy?: boolean | null
          sleep_hours?: number | null
          sleep_quality?: string | null
          steps_taken?: number | null
          supplements_taken?: boolean | null
          todays_win_1?: string | null
          todays_win_2?: string | null
          todays_win_3?: string | null
          tomorrow_prep_score?: number | null
          tomorrow_sankalp?: string | null
          updated_at?: string
          water_intake_glasses?: number | null
          what_i_learned?: string | null
          what_went_well?: string | null
          workout_done?: boolean | null
          workout_duration_minutes?: number | null
          workout_type?: string | null
          worksheet_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_worksheets_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      department_health: {
        Row: {
          action_plan: string | null
          business_id: string
          challenges: string | null
          created_at: string
          department_name: string
          health_score: number
          id: string
          key_metrics: Json | null
          month: number
          year: number
        }
        Insert: {
          action_plan?: string | null
          business_id: string
          challenges?: string | null
          created_at?: string
          department_name: string
          health_score?: number
          id?: string
          key_metrics?: Json | null
          month: number
          year: number
        }
        Update: {
          action_plan?: string | null
          business_id?: string
          challenges?: string | null
          created_at?: string
          department_name?: string
          health_score?: number
          id?: string
          key_metrics?: Json | null
          month?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "department_health_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_signatures: {
        Row: {
          document_id: string
          file_size_bytes: number | null
          id: string
          ip_address: unknown
          place: string
          request_id: string
          seeker_id: string
          signature_date: string
          signed_at: string
          signed_pdf_path: string
          typed_full_name: string
          user_agent: string | null
          verification_id: string
        }
        Insert: {
          document_id: string
          file_size_bytes?: number | null
          id?: string
          ip_address?: unknown
          place: string
          request_id: string
          seeker_id: string
          signature_date?: string
          signed_at?: string
          signed_pdf_path: string
          typed_full_name: string
          user_agent?: string | null
          verification_id: string
        }
        Update: {
          document_id?: string
          file_size_bytes?: number | null
          id?: string
          ip_address?: unknown
          place?: string
          request_id?: string
          seeker_id?: string
          signature_date?: string
          signed_at?: string
          signed_pdf_path?: string
          typed_full_name?: string
          user_agent?: string | null
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_signatures_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "signature_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_signatures_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          storage_path: string
          title: string
          updated_at: string
          uploaded_by: string | null
          version: number
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          storage_path: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
          version?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          storage_path?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          version?: number
        }
        Relationships: []
      }
      email_log: {
        Row: {
          error_message: string | null
          id: string
          recipients: string[]
          resend_message_id: string | null
          seed_run_id: string | null
          sent_at: string
          status: string
          subject: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          recipients: string[]
          resend_message_id?: string | null
          seed_run_id?: string | null
          sent_at?: string
          status: string
          subject: string
        }
        Update: {
          error_message?: string | null
          id?: string
          recipients?: string[]
          resend_message_id?: string | null
          seed_run_id?: string | null
          sent_at?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      encryption_keys: {
        Row: {
          algorithm: string
          created_at: string
          dek: string
          id: string
          is_current: boolean
          rotated_at: string | null
          version: string
        }
        Insert: {
          algorithm?: string
          created_at?: string
          dek: string
          id?: string
          is_current?: boolean
          rotated_at?: string | null
          version: string
        }
        Update: {
          algorithm?: string
          created_at?: string
          dek?: string
          id?: string
          is_current?: boolean
          rotated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          course_id: string
          created_at: string
          end_date: string | null
          id: string
          notes: string | null
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
          notes?: string | null
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
          notes?: string | null
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
      favorite_affirmations: {
        Row: {
          affirmation_id: string
          id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          affirmation_id: string
          id?: string
          saved_at?: string
          user_id: string
        }
        Update: {
          affirmation_id?: string
          id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_affirmations_affirmation_id_fkey"
            columns: ["affirmation_id"]
            isOneToOne: false
            referencedRelation: "daily_affirmations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_affirmations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      firo_b_assessments: {
        Row: {
          created_at: string
          expressed_affection: number
          expressed_control: number
          expressed_inclusion: number
          id: string
          notes: Json | null
          seeker_id: string
          total_expressed: number | null
          total_wanted: number | null
          wanted_affection: number
          wanted_control: number
          wanted_inclusion: number
        }
        Insert: {
          created_at?: string
          expressed_affection?: number
          expressed_control?: number
          expressed_inclusion?: number
          id?: string
          notes?: Json | null
          seeker_id: string
          total_expressed?: number | null
          total_wanted?: number | null
          wanted_affection?: number
          wanted_control?: number
          wanted_inclusion?: number
        }
        Update: {
          created_at?: string
          expressed_affection?: number
          expressed_control?: number
          expressed_inclusion?: number
          id?: string
          notes?: Json | null
          seeker_id?: string
          total_expressed?: number | null
          total_wanted?: number | null
          wanted_affection?: number
          wanted_control?: number
          wanted_inclusion?: number
        }
        Relationships: [
          {
            foreignKeyName: "firo_b_assessments_seeker_id_fkey"
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
      happiness_assessments: {
        Row: {
          accomplishment_score: number
          average_score: number | null
          created_at: string
          engagement_score: number
          gratitude_score: number
          health_score: number
          id: string
          life_satisfaction_score: number
          meaning_score: number
          notes: Json | null
          positive_emotions_score: number
          relationships_score: number
          seeker_id: string
        }
        Insert: {
          accomplishment_score?: number
          average_score?: number | null
          created_at?: string
          engagement_score?: number
          gratitude_score?: number
          health_score?: number
          id?: string
          life_satisfaction_score?: number
          meaning_score?: number
          notes?: Json | null
          positive_emotions_score?: number
          relationships_score?: number
          seeker_id: string
        }
        Update: {
          accomplishment_score?: number
          average_score?: number | null
          created_at?: string
          engagement_score?: number
          gratitude_score?: number
          health_score?: number
          id?: string
          life_satisfaction_score?: number
          meaning_score?: number
          notes?: Json | null
          positive_emotions_score?: number
          relationships_score?: number
          seeker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "happiness_assessments_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      japa_log: {
        Row: {
          created_at: string
          id: string
          log_date: string
          mala_count: number
          mantra_text: string
          seeker_id: string
          total_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          log_date?: string
          mala_count?: number
          mantra_text?: string
          seeker_id: string
          total_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          mala_count?: number
          mantra_text?: string
          seeker_id?: string
          total_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "japa_log_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      key_rotation_log: {
        Row: {
          from_version: string | null
          id: string
          notes: string | null
          rotated_at: string
          rotated_by: string | null
          to_version: string
          trigger_source: string
        }
        Insert: {
          from_version?: string | null
          id?: string
          notes?: string | null
          rotated_at?: string
          rotated_by?: string | null
          to_version: string
          trigger_source?: string
        }
        Update: {
          from_version?: string | null
          id?: string
          notes?: string | null
          rotated_at?: string
          rotated_by?: string | null
          to_version?: string
          trigger_source?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          country: string | null
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
          country?: string | null
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
          country?: string | null
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
      learning_content: {
        Row: {
          category: string | null
          course_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean
          language: string
          tags: string[] | null
          thumbnail_url: string | null
          tier: string
          title: string
          type: string
          updated_at: string
          url: string
          view_count: number
        }
        Insert: {
          category?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          language?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          tier?: string
          title: string
          type?: string
          updated_at?: string
          url: string
          view_count?: number
        }
        Update: {
          category?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          language?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          tier?: string
          title?: string
          type?: string
          updated_at?: string
          url?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_content_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lgt_applications: {
        Row: {
          created_at: string
          filled_by_role: string | null
          form_data: Json | null
          id: string
          invite_email_sent_at: string | null
          invite_token: string | null
          invite_token_expires_at: string | null
          invited_at: string | null
          invited_by: string | null
          seeker_id: string
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          filled_by_role?: string | null
          form_data?: Json | null
          id?: string
          invite_email_sent_at?: string | null
          invite_token?: string | null
          invite_token_expires_at?: string | null
          invited_at?: string | null
          invited_by?: string | null
          seeker_id: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          filled_by_role?: string | null
          form_data?: Json | null
          id?: string
          invite_email_sent_at?: string | null
          invite_token?: string | null
          invite_token_expires_at?: string | null
          invited_at?: string | null
          invited_by?: string | null
          seeker_id?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lgt_applications_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lgt_assessments: {
        Row: {
          artha_score: number
          average_score: number | null
          created_at: string
          dharma_score: number
          id: string
          kama_score: number
          moksha_score: number
          notes: Json | null
          seeker_id: string
        }
        Insert: {
          artha_score?: number
          average_score?: number | null
          created_at?: string
          dharma_score?: number
          id?: string
          kama_score?: number
          moksha_score?: number
          notes?: Json | null
          seeker_id: string
        }
        Update: {
          artha_score?: number
          average_score?: number | null
          created_at?: string
          dharma_score?: number
          id?: string
          kama_score?: number
          moksha_score?: number
          notes?: Json | null
          seeker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lgt_assessments_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_strategy: {
        Row: {
          budget_monthly: number | null
          business_id: string
          content_strategy: string | null
          created_at: string
          goals_quarterly: string | null
          id: string
          marketing_channels: Json | null
          metrics_tracked: Json | null
          target_audience: string | null
          unique_selling_proposition: string | null
          updated_at: string
        }
        Insert: {
          budget_monthly?: number | null
          business_id: string
          content_strategy?: string | null
          created_at?: string
          goals_quarterly?: string | null
          id?: string
          marketing_channels?: Json | null
          metrics_tracked?: Json | null
          target_audience?: string | null
          unique_selling_proposition?: string | null
          updated_at?: string
        }
        Update: {
          budget_monthly?: number | null
          business_id?: string
          content_strategy?: string | null
          created_at?: string
          goals_quarterly?: string | null
          id?: string
          marketing_channels?: Json | null
          metrics_tracked?: Json | null
          target_audience?: string | null
          unique_selling_proposition?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_strategy_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          content_enc: string | null
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          content_enc?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          content_enc?: string | null
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
      mooch_assessments: {
        Row: {
          attachment_score: number
          average_score: number | null
          comparison_score: number
          created_at: string
          fear_score: number
          id: string
          negativity_score: number
          notes: Json | null
          overthinking_score: number
          resistance_score: number
          seeker_id: string
        }
        Insert: {
          attachment_score?: number
          average_score?: number | null
          comparison_score?: number
          created_at?: string
          fear_score?: number
          id?: string
          negativity_score?: number
          notes?: Json | null
          overthinking_score?: number
          resistance_score?: number
          seeker_id: string
        }
        Update: {
          attachment_score?: number
          average_score?: number | null
          comparison_score?: number
          created_at?: string
          fear_score?: number
          id?: string
          negativity_score?: number
          notes?: Json | null
          overthinking_score?: number
          resistance_score?: number
          seeker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mooch_assessments_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          attempts: number
          code_enc: string | null
          created_at: string
          expires_at: string
          id: string
          identifier: string
          is_used: boolean
        }
        Insert: {
          attempts?: number
          code_enc?: string | null
          created_at?: string
          expires_at: string
          id?: string
          identifier: string
          is_used?: boolean
        }
        Update: {
          attempts?: number
          code_enc?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          identifier?: string
          is_used?: boolean
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          amount_enc: string | null
          bank_ref_enc: string | null
          created_at: string
          due_date: string | null
          gst_amount: number
          id: string
          invoice_number: string
          is_joint: boolean
          joint_group_id: string | null
          method: string
          notes: string | null
          notes_enc: string | null
          payer_gst_enc: string | null
          payer_pan_enc: string | null
          payment_date: string | null
          seeker_id: string
          status: string
          total_amount: number
          total_amount_enc: string | null
          transaction_id: string | null
          transaction_id_enc: string | null
        }
        Insert: {
          amount: number
          amount_enc?: string | null
          bank_ref_enc?: string | null
          created_at?: string
          due_date?: string | null
          gst_amount?: number
          id?: string
          invoice_number: string
          is_joint?: boolean
          joint_group_id?: string | null
          method?: string
          notes?: string | null
          notes_enc?: string | null
          payer_gst_enc?: string | null
          payer_pan_enc?: string | null
          payment_date?: string | null
          seeker_id: string
          status?: string
          total_amount: number
          total_amount_enc?: string | null
          transaction_id?: string | null
          transaction_id_enc?: string | null
        }
        Update: {
          amount?: number
          amount_enc?: string | null
          bank_ref_enc?: string | null
          created_at?: string
          due_date?: string | null
          gst_amount?: number
          id?: string
          invoice_number?: string
          is_joint?: boolean
          joint_group_id?: string | null
          method?: string
          notes?: string | null
          notes_enc?: string | null
          payer_gst_enc?: string | null
          payer_pan_enc?: string | null
          payment_date?: string | null
          seeker_id?: string
          status?: string
          total_amount?: number
          total_amount_enc?: string | null
          transaction_id?: string | null
          transaction_id_enc?: string | null
        }
        Relationships: []
      }
      personal_swot_assessments: {
        Row: {
          balance_score: number | null
          created_at: string
          id: string
          opportunities: Json | null
          opportunity_count: number | null
          overall_notes: string | null
          seeker_id: string
          strength_count: number | null
          strengths: Json | null
          threat_count: number | null
          threats: Json | null
          weakness_count: number | null
          weaknesses: Json | null
        }
        Insert: {
          balance_score?: number | null
          created_at?: string
          id?: string
          opportunities?: Json | null
          opportunity_count?: number | null
          overall_notes?: string | null
          seeker_id: string
          strength_count?: number | null
          strengths?: Json | null
          threat_count?: number | null
          threats?: Json | null
          weakness_count?: number | null
          weaknesses?: Json | null
        }
        Update: {
          balance_score?: number | null
          created_at?: string
          id?: string
          opportunities?: Json | null
          opportunity_count?: number | null
          overall_notes?: string | null
          seeker_id?: string
          strength_count?: number | null
          strengths?: Json | null
          threat_count?: number | null
          threats?: Json | null
          weakness_count?: number | null
          weaknesses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_swot_assessments_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      points_ledger: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          points: number
          seeker_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          seeker_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          seeker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aadhaar_enc: string | null
          aadhaar_hash: string | null
          access_end_date: string | null
          address_enc: string | null
          admin_level: string | null
          admin_permissions: Json
          avatar_url: string | null
          blood_group: string | null
          blood_group_enc: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          designation: string | null
          dob: string | null
          dob_enc: string | null
          email: string
          email_hash: string | null
          emergency_contact_enc: string | null
          experience_years: number | null
          full_name: string
          gender: string | null
          gender_enc: string | null
          hometown: string | null
          hometown_enc: string | null
          id: string
          industry: string | null
          is_also_coach: boolean
          leaderboard_visible: boolean
          linkedin_url: string | null
          linkedin_url_enc: string | null
          marriage_anniversary: string | null
          marriage_anniversary_enc: string | null
          must_change_password: boolean
          occupation: string | null
          pan_enc: string | null
          pan_hash: string | null
          password_change_prompted: boolean
          password_changed_at: string | null
          phone: string | null
          phone_hash: string | null
          pincode: string | null
          pincode_enc: string | null
          revenue_range: string | null
          role: string
          state: string | null
          team_size: number | null
          updated_at: string
          user_id: string
          whatsapp: string | null
          whatsapp_enc: string | null
          whatsapp_hash: string | null
        }
        Insert: {
          aadhaar_enc?: string | null
          aadhaar_hash?: string | null
          access_end_date?: string | null
          address_enc?: string | null
          admin_level?: string | null
          admin_permissions?: Json
          avatar_url?: string | null
          blood_group?: string | null
          blood_group_enc?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          designation?: string | null
          dob?: string | null
          dob_enc?: string | null
          email: string
          email_hash?: string | null
          emergency_contact_enc?: string | null
          experience_years?: number | null
          full_name: string
          gender?: string | null
          gender_enc?: string | null
          hometown?: string | null
          hometown_enc?: string | null
          id?: string
          industry?: string | null
          is_also_coach?: boolean
          leaderboard_visible?: boolean
          linkedin_url?: string | null
          linkedin_url_enc?: string | null
          marriage_anniversary?: string | null
          marriage_anniversary_enc?: string | null
          must_change_password?: boolean
          occupation?: string | null
          pan_enc?: string | null
          pan_hash?: string | null
          password_change_prompted?: boolean
          password_changed_at?: string | null
          phone?: string | null
          phone_hash?: string | null
          pincode?: string | null
          pincode_enc?: string | null
          revenue_range?: string | null
          role?: string
          state?: string | null
          team_size?: number | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
          whatsapp_enc?: string | null
          whatsapp_hash?: string | null
        }
        Update: {
          aadhaar_enc?: string | null
          aadhaar_hash?: string | null
          access_end_date?: string | null
          address_enc?: string | null
          admin_level?: string | null
          admin_permissions?: Json
          avatar_url?: string | null
          blood_group?: string | null
          blood_group_enc?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          designation?: string | null
          dob?: string | null
          dob_enc?: string | null
          email?: string
          email_hash?: string | null
          emergency_contact_enc?: string | null
          experience_years?: number | null
          full_name?: string
          gender?: string | null
          gender_enc?: string | null
          hometown?: string | null
          hometown_enc?: string | null
          id?: string
          industry?: string | null
          is_also_coach?: boolean
          leaderboard_visible?: boolean
          linkedin_url?: string | null
          linkedin_url_enc?: string | null
          marriage_anniversary?: string | null
          marriage_anniversary_enc?: string | null
          must_change_password?: boolean
          occupation?: string | null
          pan_enc?: string | null
          pan_hash?: string | null
          password_change_prompted?: boolean
          password_changed_at?: string | null
          phone?: string | null
          phone_hash?: string | null
          pincode?: string | null
          pincode_enc?: string | null
          revenue_range?: string | null
          role?: string
          state?: string | null
          team_size?: number | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
          whatsapp_enc?: string | null
          whatsapp_hash?: string | null
        }
        Relationships: []
      }
      program_trainers: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          program_id: string
          role: string | null
          trainer_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          program_id: string
          role?: string | null
          trainer_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          program_id?: string
          role?: string | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_trainers_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_trainers_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purusharthas_assessments: {
        Row: {
          artha_score: number
          average_score: number | null
          created_at: string
          dharma_score: number
          id: string
          kama_score: number
          moksha_score: number
          notes: Json | null
          seeker_id: string
          sub_dimensions: Json | null
        }
        Insert: {
          artha_score?: number
          average_score?: number | null
          created_at?: string
          dharma_score?: number
          id?: string
          kama_score?: number
          moksha_score?: number
          notes?: Json | null
          seeker_id: string
          sub_dimensions?: Json | null
        }
        Update: {
          artha_score?: number
          average_score?: number | null
          created_at?: string
          dharma_score?: number
          id?: string
          kama_score?: number
          moksha_score?: number
          notes?: Json | null
          seeker_id?: string
          sub_dimensions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "purusharthas_assessments_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      rnd_projects: {
        Row: {
          budget: number | null
          business_id: string
          created_at: string
          description: string | null
          id: string
          outcomes: string | null
          progress_percent: number | null
          project_name: string
          start_date: string | null
          status: string
          target_completion: string | null
        }
        Insert: {
          budget?: number | null
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          outcomes?: string | null
          progress_percent?: number | null
          project_name: string
          start_date?: string | null
          status?: string
          target_completion?: string | null
        }
        Update: {
          budget?: number | null
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          outcomes?: string | null
          progress_percent?: number | null
          project_name?: string
          start_date?: string | null
          status?: string
          target_completion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rnd_projects_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_strategy: {
        Row: {
          business_id: string
          conversion_goals: string | null
          created_at: string
          id: string
          key_objections: Json | null
          pricing_strategy: string | null
          sales_channels: string | null
          sales_process: Json | null
          sales_scripts: string | null
          sales_targets_monthly: number | null
          updated_at: string
        }
        Insert: {
          business_id: string
          conversion_goals?: string | null
          created_at?: string
          id?: string
          key_objections?: Json | null
          pricing_strategy?: string | null
          sales_channels?: string | null
          sales_process?: Json | null
          sales_scripts?: string | null
          sales_targets_monthly?: number | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          conversion_goals?: string | null
          created_at?: string
          id?: string
          key_objections?: Json | null
          pricing_strategy?: string | null
          sales_channels?: string | null
          sales_process?: Json | null
          sales_scripts?: string | null
          sales_targets_monthly?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_strategy_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "business_profiles"
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
      seeker_badge_progress: {
        Row: {
          badge_id: string
          best_streak: number
          current_streak: number
          id: string
          last_qualifying_date: string | null
          seeker_id: string
          updated_at: string
        }
        Insert: {
          badge_id: string
          best_streak?: number
          current_streak?: number
          id?: string
          last_qualifying_date?: string | null
          seeker_id: string
          updated_at?: string
        }
        Update: {
          badge_id?: string
          best_streak?: number
          current_streak?: number
          id?: string
          last_qualifying_date?: string | null
          seeker_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seeker_badge_progress_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seeker_badge_progress_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seeker_badges: {
        Row: {
          awarded_by: string
          badge_id: string
          earned_at: string
          id: string
          notes: string | null
          seeker_id: string
        }
        Insert: {
          awarded_by?: string
          badge_id: string
          earned_at?: string
          id?: string
          notes?: string | null
          seeker_id: string
        }
        Update: {
          awarded_by?: string
          badge_id?: string
          earned_at?: string
          id?: string
          notes?: string | null
          seeker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seeker_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seeker_badges_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seeker_links: {
        Row: {
          created_at: string
          group_id: string
          id: string
          linked_by: string | null
          relationship: string
          relationship_label: string | null
          seeker_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          linked_by?: string | null
          relationship: string
          relationship_label?: string | null
          seeker_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          linked_by?: string | null
          relationship?: string
          relationship_label?: string | null
          seeker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seeker_links_linked_by_fkey"
            columns: ["linked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seeker_links_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seeker_non_negotiables: {
        Row: {
          added_by: string
          created_at: string
          habit_name: string
          id: string
          is_active: boolean | null
          lgt_pillar: string | null
          seeker_id: string
        }
        Insert: {
          added_by?: string
          created_at?: string
          habit_name: string
          id?: string
          is_active?: boolean | null
          lgt_pillar?: string | null
          seeker_id: string
        }
        Update: {
          added_by?: string
          created_at?: string
          habit_name?: string
          id?: string
          is_active?: boolean | null
          lgt_pillar?: string | null
          seeker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seeker_non_negotiables_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_attendees: {
        Row: {
          attendance_status: string
          created_at: string
          feedback_rating: number | null
          feedback_text: string | null
          id: string
          seeker_id: string
          session_id: string
        }
        Insert: {
          attendance_status?: string
          created_at?: string
          feedback_rating?: number | null
          feedback_text?: string | null
          id?: string
          seeker_id: string
          session_id: string
        }
        Update: {
          attendance_status?: string
          created_at?: string
          feedback_rating?: number | null
          feedback_text?: string | null
          id?: string
          seeker_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_attendees_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_attendees_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          diff: Json | null
          id: string
          session_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          diff?: Json | null
          id?: string
          session_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          diff?: Json | null
          id?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_audit_log_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          section_name: string
          session_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          section_name: string
          session_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          section_name?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_comments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_notes: {
        Row: {
          attachments_json: Json | null
          author_id: string
          author_role: string | null
          content: string
          created_at: string
          id: string
          is_private: boolean | null
          note_type: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          attachments_json?: Json | null
          author_id: string
          author_role?: string | null
          content: string
          created_at?: string
          id?: string
          is_private?: boolean | null
          note_type?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          attachments_json?: Json | null
          author_id?: string
          author_role?: string | null
          content?: string
          created_at?: string
          id?: string
          is_private?: boolean | null
          note_type?: string | null
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          recipient_id: string
          session_id: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id: string
          session_id?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          session_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_notifications_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_participants: {
        Row: {
          added_at: string
          attendance: string | null
          id: string
          role: string
          seeker_id: string
          session_id: string
        }
        Insert: {
          added_at?: string
          attendance?: string | null
          id?: string
          role?: string
          seeker_id: string
          session_id: string
        }
        Update: {
          added_at?: string
          attendance?: string | null
          id?: string
          role?: string
          seeker_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_private_notes: {
        Row: {
          created_at: string
          notes: string | null
          session_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          notes?: string | null
          session_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          notes?: string | null
          session_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_private_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_signatures: {
        Row: {
          content_hash: string | null
          id: string
          ip_address: string | null
          session_id: string
          signed_at: string
          signer_id: string
          signer_role: string
          storage_path: string
          typed_name: string | null
          user_agent: string | null
        }
        Insert: {
          content_hash?: string | null
          id?: string
          ip_address?: string | null
          session_id: string
          signed_at?: string
          signer_id: string
          signer_role: string
          storage_path: string
          typed_name?: string | null
          user_agent?: string | null
        }
        Update: {
          content_hash?: string | null
          id?: string
          ip_address?: string | null
          session_id?: string
          signed_at?: string
          signer_id?: string
          signer_role?: string
          storage_path?: string
          typed_name?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_signatures_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_signatures_signer_id_fkey"
            columns: ["signer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_templates: {
        Row: {
          coach_id: string
          created_at: string | null
          default_assignments: Json | null
          default_topic_ids: string[] | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          default_assignments?: Json | null
          default_topic_ids?: string[] | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          default_assignments?: Json | null
          default_topic_ids?: string[] | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_templates_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_topics: {
        Row: {
          session_id: string
          topic_id: string
        }
        Insert: {
          session_id: string
          topic_id: string
        }
        Update: {
          session_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_topics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          attendance: string | null
          breakthroughs: string | null
          client_good_things: Json | null
          client_growth_json: Json | null
          coach_id: string | null
          course_id: string | null
          created_at: string
          date: string
          duration_minutes: number | null
          end_time: string
          engagement_score: number | null
          id: string
          key_insights: string | null
          location_type: string | null
          major_win: string | null
          meeting_link: string | null
          missed_reason: string | null
          next_session_time: string | null
          next_week_assignments: string | null
          pending_assignments_review: string | null
          pillar: string | null
          post_session_feedback: Json | null
          punishments: string | null
          reschedule_reason: string | null
          revision_note: string | null
          rewards: string | null
          seeker_accepted_at: string | null
          seeker_feedback_json: Json | null
          seeker_how_to_apply: string | null
          seeker_id: string
          seeker_mood: string | null
          seeker_what_learned: string | null
          seeker_where_to_apply: string | null
          session_name: string | null
          session_notes: string | null
          session_number: number
          session_type: string | null
          start_time: string
          status: string
          stories_used: Json | null
          targets: string | null
          therapy_given: string | null
          topics_covered: Json | null
          updated_at: string
        }
        Insert: {
          attendance?: string | null
          breakthroughs?: string | null
          client_good_things?: Json | null
          client_growth_json?: Json | null
          coach_id?: string | null
          course_id?: string | null
          created_at?: string
          date: string
          duration_minutes?: number | null
          end_time: string
          engagement_score?: number | null
          id?: string
          key_insights?: string | null
          location_type?: string | null
          major_win?: string | null
          meeting_link?: string | null
          missed_reason?: string | null
          next_session_time?: string | null
          next_week_assignments?: string | null
          pending_assignments_review?: string | null
          pillar?: string | null
          post_session_feedback?: Json | null
          punishments?: string | null
          reschedule_reason?: string | null
          revision_note?: string | null
          rewards?: string | null
          seeker_accepted_at?: string | null
          seeker_feedback_json?: Json | null
          seeker_how_to_apply?: string | null
          seeker_id: string
          seeker_mood?: string | null
          seeker_what_learned?: string | null
          seeker_where_to_apply?: string | null
          session_name?: string | null
          session_notes?: string | null
          session_number?: number
          session_type?: string | null
          start_time: string
          status?: string
          stories_used?: Json | null
          targets?: string | null
          therapy_given?: string | null
          topics_covered?: Json | null
          updated_at?: string
        }
        Update: {
          attendance?: string | null
          breakthroughs?: string | null
          client_good_things?: Json | null
          client_growth_json?: Json | null
          coach_id?: string | null
          course_id?: string | null
          created_at?: string
          date?: string
          duration_minutes?: number | null
          end_time?: string
          engagement_score?: number | null
          id?: string
          key_insights?: string | null
          location_type?: string | null
          major_win?: string | null
          meeting_link?: string | null
          missed_reason?: string | null
          next_session_time?: string | null
          next_week_assignments?: string | null
          pending_assignments_review?: string | null
          pillar?: string | null
          post_session_feedback?: Json | null
          punishments?: string | null
          reschedule_reason?: string | null
          revision_note?: string | null
          rewards?: string | null
          seeker_accepted_at?: string | null
          seeker_feedback_json?: Json | null
          seeker_how_to_apply?: string | null
          seeker_id?: string
          seeker_mood?: string | null
          seeker_what_learned?: string | null
          seeker_where_to_apply?: string | null
          session_name?: string | null
          session_notes?: string | null
          session_number?: number
          session_type?: string | null
          start_time?: string
          status?: string
          stories_used?: Json | null
          targets?: string | null
          therapy_given?: string | null
          topics_covered?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      signature_requests: {
        Row: {
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          custom_message: string | null
          document_id: string
          expires_at: string
          id: string
          seeker_id: string
          sent_at: string
          session_id: string | null
          sign_method: string | null
          signed_at: string | null
          signer_email_encrypted: string | null
          signer_name: string | null
          status: string
          token_hash: string
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          custom_message?: string | null
          document_id: string
          expires_at?: string
          id?: string
          seeker_id: string
          sent_at?: string
          session_id?: string | null
          sign_method?: string | null
          signed_at?: string | null
          signer_email_encrypted?: string | null
          signer_name?: string | null
          status?: string
          token_hash: string
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          custom_message?: string | null
          document_id?: string
          expires_at?: string
          id?: string
          seeker_id?: string
          sent_at?: string
          session_id?: string | null
          sign_method?: string | null
          signed_at?: string | null
          signer_email_encrypted?: string | null
          signer_name?: string | null
          status?: string
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "signature_requests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_requests_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          current_streak: number
          id: string
          last_completed_date: string | null
          longest_streak: number
          seeker_id: string
          updated_at: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_completed_date?: string | null
          longest_streak?: number
          seeker_id: string
          updated_at?: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_completed_date?: string | null
          longest_streak?: number
          seeker_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaks_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: true
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
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      swot_competitors: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          opportunity_for_vdts: Json
          sort_order: number
          strengths: Json
          threat_level: string
          updated_at: string
          weaknesses: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          opportunity_for_vdts?: Json
          sort_order?: number
          strengths?: Json
          threat_level?: string
          updated_at?: string
          weaknesses?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          opportunity_for_vdts?: Json
          sort_order?: number
          strengths?: Json
          threat_level?: string
          updated_at?: string
          weaknesses?: Json
        }
        Relationships: []
      }
      swot_entries: {
        Row: {
          category: string
          created_at: string
          id: string
          sort_order: number
          text: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          sort_order?: number
          text: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          sort_order?: number
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          id: string
          settings: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: string
          id?: string
          settings?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          id?: string
          settings?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          business_id: string
          created_at: string
          department: string | null
          hire_date: string | null
          id: string
          name: string
          notes: string | null
          performance_rating: number | null
          role: string | null
          skills: Json | null
        }
        Insert: {
          business_id: string
          created_at?: string
          department?: string | null
          hire_date?: string | null
          id?: string
          name: string
          notes?: string | null
          performance_rating?: number | null
          role?: string | null
          skills?: Json | null
        }
        Update: {
          business_id?: string
          created_at?: string
          department?: string | null
          hire_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          performance_rating?: number | null
          role?: string | null
          skills?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      time_sheets: {
        Row: {
          created_at: string
          date: string
          energy_level: number | null
          exercise_minutes: number | null
          family_hours: number | null
          id: string
          learning_hours: number | null
          meals_count: number | null
          meditation_minutes: number | null
          notes: string | null
          productivity_score: number | null
          reading_minutes: number | null
          screen_time_hours: number | null
          seeker_id: string
          sleep_time: string | null
          spiritual_practice_minutes: number | null
          wake_up_time: string | null
          water_glasses: number | null
          work_hours: number | null
        }
        Insert: {
          created_at?: string
          date: string
          energy_level?: number | null
          exercise_minutes?: number | null
          family_hours?: number | null
          id?: string
          learning_hours?: number | null
          meals_count?: number | null
          meditation_minutes?: number | null
          notes?: string | null
          productivity_score?: number | null
          reading_minutes?: number | null
          screen_time_hours?: number | null
          seeker_id: string
          sleep_time?: string | null
          spiritual_practice_minutes?: number | null
          wake_up_time?: string | null
          water_glasses?: number | null
          work_hours?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          energy_level?: number | null
          exercise_minutes?: number | null
          family_hours?: number | null
          id?: string
          learning_hours?: number | null
          meals_count?: number | null
          meditation_minutes?: number | null
          notes?: string | null
          productivity_score?: number | null
          reading_minutes?: number | null
          screen_time_hours?: number | null
          seeker_id?: string
          sleep_time?: string | null
          spiritual_practice_minutes?: number | null
          wake_up_time?: string | null
          water_glasses?: number | null
          work_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "time_sheets_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          icon_emoji: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          icon_emoji?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          icon_emoji?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bookmarks: {
        Row: {
          content_id: string | null
          content_title: string
          content_type: string
          content_url: string | null
          created_at: string
          id: string
          notes: string | null
          seeker_id: string
          tags: string[] | null
        }
        Insert: {
          content_id?: string | null
          content_title: string
          content_type: string
          content_url?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          seeker_id: string
          tags?: string[] | null
        }
        Update: {
          content_id?: string | null
          content_title?: string
          content_type?: string
          content_url?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          seeker_id?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_content_progress: {
        Row: {
          content_id: string
          created_at: string
          id: string
          is_bookmarked: boolean
          is_completed: boolean
          last_position_seconds: number
          last_watched_at: string
          progress_percent: number
          seeker_id: string
          updated_at: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          is_bookmarked?: boolean
          is_completed?: boolean
          last_position_seconds?: number
          last_watched_at?: string
          progress_percent?: number
          seeker_id: string
          updated_at?: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          is_bookmarked?: boolean
          is_completed?: boolean
          last_position_seconds?: number
          last_watched_at?: string
          progress_percent?: number
          seeker_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_content_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_content_progress_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          duration_seconds: number | null
          id: string
          ip_address: string | null
          last_activity_at: string
          login_at: string
          logout_at: string | null
          logout_reason: string | null
          profile_id: string | null
          role: string | null
          status: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          duration_seconds?: number | null
          id?: string
          ip_address?: string | null
          last_activity_at?: string
          login_at?: string
          logout_at?: string | null
          logout_reason?: string | null
          profile_id?: string | null
          role?: string | null
          status?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          duration_seconds?: number | null
          id?: string
          ip_address?: string | null
          last_activity_at?: string
          login_at?: string
          logout_at?: string | null
          logout_reason?: string | null
          profile_id?: string | null
          role?: string | null
          status?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          day_number: number
          id: string
          notes: string | null
          seeker_id: string
          task_completed: boolean | null
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          day_number: number
          id?: string
          notes?: string | null
          seeker_id: string
          task_completed?: boolean | null
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          day_number?: number
          id?: string
          notes?: string | null
          seeker_id?: string
          task_completed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_challenge_progress_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_challenges: {
        Row: {
          badge_id: string | null
          challenge_type: string | null
          created_at: string
          description: string | null
          dimension: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          points_reward: number | null
          program_id: string | null
          start_date: string | null
          tasks_json: Json | null
          title: string
        }
        Insert: {
          badge_id?: string | null
          challenge_type?: string | null
          created_at?: string
          description?: string | null
          dimension?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          points_reward?: number | null
          program_id?: string | null
          start_date?: string | null
          tasks_json?: Json | null
          title: string
        }
        Update: {
          badge_id?: string | null
          challenge_type?: string | null
          created_at?: string
          description?: string | null
          dimension?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          points_reward?: number | null
          program_id?: string | null
          start_date?: string | null
          tasks_json?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_challenges_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      wheel_of_life_assessments: {
        Row: {
          average_score: number | null
          career_score: number
          created_at: string
          environment_score: number
          family_score: number
          finance_score: number
          fun_score: number
          growth_score: number
          health_score: number
          id: string
          notes: Json | null
          romance_score: number
          seeker_id: string
        }
        Insert: {
          average_score?: number | null
          career_score?: number
          created_at?: string
          environment_score?: number
          family_score?: number
          finance_score?: number
          fun_score?: number
          growth_score?: number
          health_score?: number
          id?: string
          notes?: Json | null
          romance_score?: number
          seeker_id: string
        }
        Update: {
          average_score?: number | null
          career_score?: number
          created_at?: string
          environment_score?: number
          family_score?: number
          finance_score?: number
          fun_score?: number
          growth_score?: number
          health_score?: number
          id?: string
          notes?: Json | null
          romance_score?: number
          seeker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wheel_of_life_assessments_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      worksheet_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          seeker_id: string
          triggered_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          seeker_id: string
          triggered_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          seeker_id?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "worksheet_notifications_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _current_dek: {
        Args: never
        Returns: {
          dek: string
          version: string
        }[]
      }
      _dek_for_version: { Args: { _version: string }; Returns: string }
      check_profile_duplicate: {
        Args: { _email: string; _phone: string }
        Returns: string
      }
      cleanup_old_sessions: { Args: never; Returns: number }
      close_inactive_sessions: { Args: never; Returns: number }
      decrypt_field: { Args: { _payload: string }; Returns: string }
      decrypt_many: { Args: { _payloads: string[] }; Returns: string[] }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      encrypt_field: { Args: { _plaintext: string }; Returns: string }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_daily_session_report: { Args: never; Returns: Json }
      get_encryption_status: { Args: never; Returns: Json }
      get_leaderboard_data: {
        Args: {
          _batch_user_id?: string
          _city?: string
          _course_id?: string
          _period?: string
        }
        Returns: {
          avatar_url: string
          badge_count: number
          display_name: string
          profile_id: string
          rank: number
          session_count: number
          streak_days: number
          total_points: number
          worksheet_count: number
        }[]
      }
      get_lgt_application_by_token: { Args: { _token: string }; Returns: Json }
      get_seeker_link_group: { Args: { _seeker_id: string }; Returns: string }
      get_session_signatures: {
        Args: { _session_id: string }
        Returns: {
          content_hash: string
          id: string
          session_id: string
          signed_at: string
          signer_id: string
          signer_role: string
          storage_path: string
          typed_name: string
        }[]
      }
      hash_for_lookup: { Args: { _value: string }; Returns: string }
      hash_token: { Args: { _token: string }; Returns: string }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_assigned_coach: {
        Args: { _seeker_profile_id: string; _user_id: string }
        Returns: boolean
      }
      is_coach: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      purge_email_queue: { Args: { queue_name: string }; Returns: number }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      rotate_encryption_keys: {
        Args: { _trigger_source?: string }
        Returns: Json
      }
      submit_lgt_application_by_token: {
        Args: { _form_data: Json; _token: string }
        Returns: Json
      }
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
