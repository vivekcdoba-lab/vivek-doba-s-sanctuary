export type UserRole = 'admin' | 'seeker';
export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'dropped';
export type CourseTier = 'standard' | 'premium' | 'platinum' | 'chakravartin';
export type SessionStatus = 'requested' | 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'missed' | 'rescheduled' | 'cancelled';
export type AssignmentStatus = 'assigned' | 'in_progress' | 'submitted' | 'under_review' | 'reviewed' | 'overdue' | 'revision_requested';
export type LeadStage = 'new' | 'contacted' | 'discovery' | 'proposal' | 'negotiating' | 'converted' | 'lost';
export type LeadPriority = 'hot' | 'warm' | 'cold';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'upi' | 'razorpay' | 'cheque' | 'emi';
export type PaymentStatus = 'received' | 'pending' | 'overdue' | 'refunded' | 'void';
export type HealthStatus = 'green' | 'yellow' | 'red';
export type FollowUpStatus = 'pending' | 'completed' | 'overdue' | 'rescheduled';
export type JourneyStage = 'awakening' | 'tapasya' | 'sangharsh' | 'bodh' | 'vistar' | 'siddhi';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  dob?: string;
  gender?: string;
  city: string;
  state?: string;
  pincode?: string;
  occupation?: string;
  designation?: string;
  company?: string;
  industry?: string;
  experience_years?: number;
  revenue_range?: string;
  team_size?: number;
  linkedin_url?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  tagline: string;
  description?: string;
  duration: string;
  format: string;
  tier: CourseTier;
  price: number;
  max_participants: number;
  gradient_colors: [string, string];
  is_active: boolean;
}

export interface Enrollment {
  id: string;
  seeker_id: string;
  course_id: string;
  tier: CourseTier;
  start_date: string;
  end_date?: string;
  status: EnrollmentStatus;
  payment_status: PaymentStatus;
}

export interface Session {
  id: string;
  seeker_id: string;
  course_id: string;
  session_number: number;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  location_type: 'online' | 'in_person';
  meeting_link?: string;
  status: SessionStatus;
  attendance?: 'present' | 'absent' | 'late' | null;
  topics_covered?: string[];
  key_insights?: string;
  seeker_mood?: string;
  engagement_score?: number;
  reschedule_reason?: string;
  reschedule_details?: string;
  preferred_date?: string;
  preferred_time?: string;
  alt_date?: string;
  alt_time?: string;
  missed_reason?: string;
  missed_contact_attempted?: boolean;
  session_notes?: string;
  breakthroughs?: string;
  stories_used?: string[];
  coach_private_notes?: string;
  post_session_feedback?: {
    rating: number;
    takeaway: string;
    commitment: number;
    clarity: number;
    feelings: string[];
    comments: string;
  };
}

export interface Assignment {
  id: string;
  seeker_id: string;
  course_id: string;
  title: string;
  description: string;
  category?: string;
  type: 'one_time' | 'daily' | 'weekly' | 'ongoing';
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: AssignmentStatus;
  score?: number;
  feedback?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: string;
  interested_course_id?: string;
  priority: LeadPriority;
  stage: LeadStage;
  current_challenge?: string;
  notes?: string;
  next_followup_date?: string;
  days_in_pipeline: number;
  created_at: string;
}

export interface Payment {
  id: string;
  seeker_id: string;
  invoice_number: string;
  amount: number;
  gst_amount: number;
  total_amount: number;
  payment_date: string;
  due_date?: string;
  method: PaymentMethod;
  transaction_id?: string;
  status: PaymentStatus;
  notes?: string;
}

export interface SeekerWithDetails extends Profile {
  enrollment?: Enrollment;
  course?: Course;
  health: HealthStatus;
  sessions_completed: number;
  total_sessions: number;
  growth_score: number;
  streak: number;
  last_session_date?: string;
  last_log_date?: string;
  overdue_assignments: number;
  journey_stage?: JourneyStage;
  journey_stage_date?: string;
  risk_score?: number;
  risk_level?: RiskLevel;
  identity_old?: {
    story: string;
    beliefs: string[];
    habits: string[];
    results: string;
  };
  identity_new?: {
    story: string;
    beliefs: string[];
    habits: string[];
    results: string;
  };
  transformation_progress?: number;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'audio' | 'video' | 'worksheet';
  category: string;
  course_id?: string;
  language: 'EN' | 'MR' | 'HI';
  tags: string[];
  view_count: number;
  download_count: number;
}

export interface FollowUp {
  id: string;
  seeker_id: string;
  type: 'call' | 'whatsapp' | 'email' | 'in_app';
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  notes: string;
  status: FollowUpStatus;
  completion_notes?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'session' | 'follow_up' | 'discovery' | 'blocked' | 'event';
  seeker_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  color: string;
}

export interface Story {
  id: string;
  title: string;
  source: 'ramayana' | 'mahabharata' | 'other';
  theme: string;
  description?: string;
  times_used: number;
  effective_with?: string;
  last_used_seeker?: string;
  last_used_session?: string;
}

export interface AutomationRule {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  trigger: string;
  channel: 'whatsapp' | 'email' | 'sms' | 'in_app' | 'dashboard';
  message_template?: string;
}

export const JOURNEY_STAGES: { key: JourneyStage; emoji: string; name: string; sanskrit: string; metaphor: string; description: string }[] = [
  { key: 'awakening', emoji: '🌅', name: 'Awakening', sanskrit: 'जागृति', metaphor: "Rama Leaves the Palace", description: 'Initial assessments, first 1-3 sessions, onboarding' },
  { key: 'tapasya', emoji: '🔥', name: 'Tapasya', sanskrit: 'तपस्या', metaphor: "Building the Bridge", description: 'Regular practice established, daily tracking >60%' },
  { key: 'sangharsh', emoji: '⚡', name: 'Sangharsh', sanskrit: 'संघर्ष', metaphor: "The Battle of Lanka", description: 'Deep resistance surfacing, limiting beliefs confronted' },
  { key: 'bodh', emoji: '🌟', name: 'Bodh', sanskrit: 'बोध', metaphor: "The Moment of Truth", description: 'Major breakthrough, identity shift beginning' },
  { key: 'vistar', emoji: '🦅', name: 'Vistar', sanskrit: 'विस्तार', metaphor: "Expanding the Kingdom", description: 'New habits solidified, real-life results showing' },
  { key: 'siddhi', emoji: '👑', name: 'Siddhi', sanskrit: 'सिद्धि', metaphor: "The Return Home", description: 'Transformation complete, ready for alumni/mentor' },
];
