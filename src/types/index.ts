export type UserRole = 'admin' | 'seeker';
export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'dropped';
export type CourseTier = 'standard' | 'premium' | 'platinum' | 'chakravartin';
export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
export type AssignmentStatus = 'assigned' | 'in_progress' | 'submitted' | 'under_review' | 'reviewed' | 'overdue' | 'revision_requested';
export type LeadStage = 'new' | 'contacted' | 'discovery' | 'proposal' | 'negotiating' | 'converted' | 'lost';
export type LeadPriority = 'hot' | 'warm' | 'cold';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'upi' | 'razorpay' | 'cheque' | 'emi';
export type PaymentStatus = 'received' | 'pending' | 'overdue' | 'refunded' | 'void';
export type HealthStatus = 'green' | 'yellow' | 'red';
export type FollowUpStatus = 'pending' | 'completed' | 'overdue' | 'rescheduled';

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
