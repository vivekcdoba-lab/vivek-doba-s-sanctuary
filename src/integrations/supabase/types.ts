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
      otp_codes: {
        Row: {
          attempts: number
          created_at: string
          expires_at: string
          id: string
          identifier: string
          is_used: boolean
          otp_code: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          expires_at: string
          id?: string
          identifier: string
          is_used?: boolean
          otp_code: string
        }
        Update: {
          attempts?: number
          created_at?: string
          expires_at?: string
          id?: string
          identifier?: string
          is_used?: boolean
          otp_code?: string
        }
        Relationships: []
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
          marriage_anniversary: string | null
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
          marriage_anniversary?: string | null
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
          marriage_anniversary?: string | null
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
          revision_note: string | null
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
          revision_note?: string | null
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
          revision_note?: string | null
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
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
