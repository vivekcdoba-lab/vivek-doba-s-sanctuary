import { Course, SeekerWithDetails, Session, Assignment, Lead, Payment, Resource, FollowUp, Message, CalendarEvent, JourneyStage } from '@/types';
import { formatDateDMY } from "@/lib/dateFormat";

export const COURSES: Course[] = [
  { id: 'c1', name: 'Laws of Attraction through Ramayana', tagline: 'Manifest your destiny through ancient wisdom', duration: '1 Day', format: 'Workshop', tier: 'standard', price: 5000, max_participants: 50, gradient_colors: ['#2196F3', '#00BCD4'], is_active: true },
  { id: 'c2', name: 'Team Building', tagline: 'Build unshakeable teams through dharmic principles', duration: '1 Day', format: 'Workshop', tier: 'standard', price: 7000, max_participants: 40, gradient_colors: ['#4CAF50', '#009688'], is_active: true },
  { id: 'c3', name: 'Leadership through Mahabharata', tagline: 'Lead like Arjuna, strategize like Krishna', duration: '3 Days', format: 'Intensive', tier: 'premium', price: 25000, max_participants: 25, gradient_colors: ['#800020', '#7B1FA2'], is_active: true },
  { id: 'c4', name: "Life's Golden Triangle — Business Owners", tagline: 'Transform personal, professional & spiritual dimensions', duration: '6 Months', format: '1-on-1', tier: 'platinum', price: 250000, max_participants: 10, gradient_colors: ['#9E9E9E', '#FFD700'], is_active: true },
  { id: 'c5', name: 'Train the Trainer', tagline: 'Become a certified transformation coach', duration: '6 Months', format: 'Group + 1-on-1', tier: 'platinum', price: 300000, max_participants: 8, gradient_colors: ['#FFD700', '#CD7F32'], is_active: true },
  { id: 'c6', name: 'NLP in Marathi', tagline: 'न्यूरो-लिंग्विस्टिक प्रोग्रामिंग मराठीत', duration: '6 Months', format: 'Group', tier: 'premium', price: 150000, max_participants: 20, gradient_colors: ['#FF9800', '#FF9933'], is_active: true },
  { id: 'c7', name: 'LGT Leaders Edition', tagline: 'Exclusive leadership transformation program', duration: '6 Months', format: 'Group + 1-on-1', tier: 'platinum', price: 350000, max_participants: 6, gradient_colors: ['#E0E0E0', '#FAFAFA'], is_active: true },
  { id: 'c8', name: 'Chakravartin — Sovereign Leadership', tagline: 'The ultimate transformation for empire builders', duration: '12 Months', format: 'Ultra 1-on-1', tier: 'chakravartin', price: 1000000, max_participants: 3, gradient_colors: ['#FFD700', '#7B1FA2'], is_active: true },
];

export const SEEKERS: SeekerWithDetails[] = [
  { id: 's1', full_name: 'Rahul Patil', email: 'rahul.patil@email.com', phone: '9876543210', city: 'Pune', state: 'Maharashtra', role: 'seeker', created_at: '2024-09-15', occupation: 'Entrepreneur', company: 'Patil Industries', revenue_range: '₹1Cr-₹5Cr', enrollment: { id: 'e1', seeker_id: 's1', course_id: 'c4', tier: 'platinum', start_date: '2024-09-15', status: 'active', payment_status: 'received' }, course: COURSES[3], health: 'green', sessions_completed: 8, total_sessions: 24, growth_score: 72, streak: 12, last_session_date: '2025-03-28', last_log_date: '2025-03-31', overdue_assignments: 0, journey_stage: 'tapasya', journey_stage_date: '2025-01-15', identity_old: { story: "I'm a hard-working but burnt-out businessman who can't delegate", beliefs: ["Nobody can do it like me", "Rest is lazy", "Money = worth"], habits: ["Working 16hr days", "Skipping health", "Avoiding family"], results: "₹50L revenue but no peace, strained marriage, health issues" }, identity_new: { story: "I am a conscious leader who builds through teams and lives with purpose", beliefs: ["Delegation is growth", "Rest is productive", "I am enough"], habits: ["Morning meditation", "Delegating daily", "Family dinner every night"], results: "₹80L revenue, team handling 70% work, sleeping 7 hours" }, transformation_progress: 45 },
  { id: 's2', full_name: 'Meera Shah', email: 'meera.shah@email.com', phone: '9876543211', city: 'Mumbai', state: 'Maharashtra', role: 'seeker', created_at: '2024-10-01', occupation: 'Corporate Trainer', company: 'Shah Consulting', enrollment: { id: 'e2', seeker_id: 's2', course_id: 'c6', tier: 'premium', start_date: '2024-10-01', status: 'active', payment_status: 'received' }, course: COURSES[5], health: 'green', sessions_completed: 12, total_sessions: 20, growth_score: 68, streak: 8, last_session_date: '2025-03-27', last_log_date: '2025-03-30', overdue_assignments: 0, journey_stage: 'sangharsh', journey_stage_date: '2025-02-01' },
  { id: 's3', full_name: 'Amit Joshi', email: 'amit.joshi@email.com', phone: '9876543212', city: 'Delhi', state: 'Delhi', role: 'seeker', created_at: '2024-08-01', occupation: 'CEO', company: 'Joshi Enterprises', revenue_range: '₹10Cr+', enrollment: { id: 'e3', seeker_id: 's3', course_id: 'c8', tier: 'chakravartin', start_date: '2024-08-01', status: 'active', payment_status: 'received' }, course: COURSES[7], health: 'green', sessions_completed: 12, total_sessions: 48, growth_score: 85, streak: 30, last_session_date: '2025-03-29', last_log_date: '2025-03-31', overdue_assignments: 0, journey_stage: 'bodh', journey_stage_date: '2025-03-01' },
  { id: 's4', full_name: 'Sneha Kulkarni', email: 'sneha.k@email.com', phone: '9876543213', city: 'Pune', state: 'Maharashtra', role: 'seeker', created_at: '2024-11-01', occupation: 'Business Owner', company: 'Sneha Fashions', enrollment: { id: 'e4', seeker_id: 's4', course_id: 'c4', tier: 'platinum', start_date: '2024-11-01', status: 'active', payment_status: 'pending' }, course: COURSES[3], health: 'yellow', sessions_completed: 6, total_sessions: 24, growth_score: 58, streak: 5, last_session_date: '2025-03-20', last_log_date: '2025-03-28', overdue_assignments: 1, journey_stage: 'tapasya', journey_stage_date: '2025-01-01' },
  { id: 's5', full_name: 'Vikram Deshmukh', email: 'vikram.d@email.com', phone: '9876543214', city: 'Nagpur', state: 'Maharashtra', role: 'seeker', created_at: '2024-07-15', occupation: 'Manager', company: 'Deshmukh Corp', enrollment: { id: 'e5', seeker_id: 's5', course_id: 'c3', tier: 'premium', start_date: '2024-07-15', status: 'paused', payment_status: 'pending' }, course: COURSES[2], health: 'red', sessions_completed: 2, total_sessions: 3, growth_score: 45, streak: 0, last_session_date: '2025-02-10', last_log_date: '2025-02-15', overdue_assignments: 3, journey_stage: 'awakening', journey_stage_date: '2024-07-15' },
  { id: 's6', full_name: 'Pooja Sharma', email: 'pooja.s@email.com', phone: '9876543215', city: 'Pune', state: 'Maharashtra', role: 'seeker', created_at: '2025-01-10', occupation: 'Homemaker', enrollment: { id: 'e6', seeker_id: 's6', course_id: 'c1', tier: 'standard', start_date: '2025-01-10', status: 'active', payment_status: 'received' }, course: COURSES[0], health: 'green', sessions_completed: 1, total_sessions: 1, growth_score: 55, streak: 3, last_session_date: '2025-03-30', last_log_date: '2025-03-31', overdue_assignments: 0, journey_stage: 'awakening', journey_stage_date: '2025-01-10' },
  { id: 's7', full_name: 'Priya Nair', email: 'priya.n@email.com', phone: '9876543216', city: 'Bangalore', state: 'Karnataka', role: 'seeker', created_at: '2024-06-01', occupation: 'HR Director', company: 'TechNova', enrollment: { id: 'e7', seeker_id: 's7', course_id: 'c5', tier: 'platinum', start_date: '2024-06-01', status: 'active', payment_status: 'received' }, course: COURSES[4], health: 'red', sessions_completed: 10, total_sessions: 24, growth_score: 62, streak: 0, last_session_date: '2025-02-28', last_log_date: '2025-03-01', overdue_assignments: 2, journey_stage: 'sangharsh', journey_stage_date: '2024-12-01' },
  { id: 's8', full_name: 'Sanjay Gupta', email: 'sanjay.g@email.com', phone: '9876543217', city: 'Hyderabad', state: 'Telangana', role: 'seeker', created_at: '2025-02-01', occupation: 'Sales Director', company: 'Gupta Traders', enrollment: { id: 'e8', seeker_id: 's8', course_id: 'c2', tier: 'standard', start_date: '2025-02-01', status: 'active', payment_status: 'received' }, course: COURSES[1], health: 'green', sessions_completed: 1, total_sessions: 1, growth_score: 50, streak: 7, last_session_date: '2025-03-22', last_log_date: '2025-03-29', overdue_assignments: 0, journey_stage: 'awakening', journey_stage_date: '2025-02-01' },
  { id: 's9', full_name: 'Kavita Bhosle', email: 'kavita.b@email.com', phone: '9876543218', city: 'Pune', state: 'Maharashtra', role: 'seeker', created_at: '2024-03-01', occupation: 'Counselor', company: 'Bhosle Wellness', enrollment: { id: 'e9', seeker_id: 's9', course_id: 'c6', tier: 'premium', start_date: '2024-03-01', end_date: '2024-09-01', status: 'completed', payment_status: 'received' }, course: COURSES[5], health: 'green', sessions_completed: 20, total_sessions: 20, growth_score: 88, streak: 45, last_session_date: '2024-08-30', last_log_date: '2024-08-30', overdue_assignments: 0, journey_stage: 'siddhi', journey_stage_date: '2024-08-15' },
  { id: 's10', full_name: 'Suresh Reddy', email: 'suresh.r@email.com', phone: '9876543219', city: 'Chennai', state: 'Tamil Nadu', role: 'seeker', created_at: '2024-10-15', occupation: 'Founder', company: 'Reddy Tech', revenue_range: '₹5Cr-₹10Cr', enrollment: { id: 'e10', seeker_id: 's10', course_id: 'c7', tier: 'platinum', start_date: '2024-10-15', status: 'active', payment_status: 'received' }, course: COURSES[6], health: 'yellow', sessions_completed: 15, total_sessions: 24, growth_score: 76, streak: 20, last_session_date: '2025-03-29', last_log_date: '2025-03-31', overdue_assignments: 0, journey_stage: 'vistar', journey_stage_date: '2025-03-01' },
];

export const SESSIONS: Session[] = [
  // Today's sessions
  { id: 'ss1', seeker_id: 's1', course_id: 'c4', session_number: 9, date: '2025-03-31', start_time: '10:00', end_time: '11:30', duration_minutes: 90, location_type: 'online', meeting_link: 'https://zoom.us/j/123', status: 'scheduled' },
  { id: 'ss2', seeker_id: 's2', course_id: 'c6', session_number: 13, date: '2025-03-31', start_time: '14:00', end_time: '15:30', duration_minutes: 90, location_type: 'online', status: 'scheduled' },
  { id: 'ss3', seeker_id: 's3', course_id: 'c8', session_number: 13, date: '2025-03-31', start_time: '16:30', end_time: '18:00', duration_minutes: 90, location_type: 'in_person', status: 'scheduled' },
  // Tomorrow
  { id: 'ss4', seeker_id: 's4', course_id: 'c4', session_number: 7, date: '2025-04-01', start_time: '10:00', end_time: '11:30', duration_minutes: 90, location_type: 'online', status: 'scheduled' },
  // Day after
  { id: 'ss5', seeker_id: 's10', course_id: 'c7', session_number: 16, date: '2025-04-02', start_time: '15:00', end_time: '16:30', duration_minutes: 90, location_type: 'online', status: 'scheduled' },
  // Past completed sessions
  { id: 'ss6', seeker_id: 's1', course_id: 'c4', session_number: 8, date: '2025-03-24', start_time: '10:00', end_time: '11:30', duration_minutes: 90, location_type: 'online', status: 'completed', attendance: 'present', topics_covered: ['Dharma alignment', 'Business strategy'], key_insights: 'Major breakthrough in understanding purpose', engagement_score: 9 },
  { id: 'ss7', seeker_id: 's2', course_id: 'c6', session_number: 12, date: '2025-03-20', start_time: '14:00', end_time: '15:30', duration_minutes: 90, location_type: 'online', status: 'completed', attendance: 'present', engagement_score: 8 },
  { id: 'ss8', seeker_id: 's3', course_id: 'c8', session_number: 12, date: '2025-03-22', start_time: '09:00', end_time: '11:00', duration_minutes: 120, location_type: 'in_person', status: 'completed', attendance: 'present', engagement_score: 10 },
  { id: 'ss9', seeker_id: 's6', course_id: 'c1', session_number: 1, date: '2025-03-15', start_time: '16:00', end_time: '17:00', duration_minutes: 60, location_type: 'in_person', status: 'completed', attendance: 'present', engagement_score: 7 },
  { id: 'ss10', seeker_id: 's1', course_id: 'c4', session_number: 7, date: '2025-03-17', start_time: '10:00', end_time: '11:30', duration_minutes: 90, location_type: 'online', status: 'completed', attendance: 'present', engagement_score: 8 },
  { id: 'ss11', seeker_id: 's4', course_id: 'c4', session_number: 6, date: '2025-03-10', start_time: '15:00', end_time: '16:30', duration_minutes: 90, location_type: 'online', status: 'completed', attendance: 'late', engagement_score: 6 },
  { id: 'ss12', seeker_id: 's10', course_id: 'c7', session_number: 15, date: '2025-03-18', start_time: '11:00', end_time: '12:30', duration_minutes: 90, location_type: 'online', status: 'completed', attendance: 'present', engagement_score: 9 },
  { id: 'ss13', seeker_id: 's8', course_id: 'c2', session_number: 1, date: '2025-03-08', start_time: '10:00', end_time: '17:00', duration_minutes: 420, location_type: 'in_person', status: 'completed', attendance: 'present', engagement_score: 8 },
  { id: 'ss14', seeker_id: 's7', course_id: 'c5', session_number: 10, date: '2025-02-28', start_time: '14:00', end_time: '15:30', duration_minutes: 90, location_type: 'online', status: 'completed', attendance: 'present', engagement_score: 7 },
  { id: 'ss15', seeker_id: 's5', course_id: 'c3', session_number: 2, date: '2025-02-10', start_time: '10:00', end_time: '17:00', duration_minutes: 420, location_type: 'in_person', status: 'completed', attendance: 'present', engagement_score: 5 },
  { id: 'ss16', seeker_id: 's1', course_id: 'c4', session_number: 6, date: '2025-03-10', start_time: '10:00', end_time: '11:30', duration_minutes: 90, location_type: 'online', status: 'completed', attendance: 'present', engagement_score: 9 },
  { id: 'ss17', seeker_id: 's3', course_id: 'c8', session_number: 11, date: '2025-03-15', start_time: '09:00', end_time: '11:00', duration_minutes: 120, location_type: 'in_person', status: 'completed', attendance: 'present', engagement_score: 10 },
  { id: 'ss18', seeker_id: 's2', course_id: 'c6', session_number: 11, date: '2025-03-13', start_time: '14:00', end_time: '15:30', duration_minutes: 90, location_type: 'online', status: 'completed', attendance: 'present', engagement_score: 9 },
  { id: 'ss19', seeker_id: 's10', course_id: 'c7', session_number: 14, date: '2025-03-11', start_time: '11:00', end_time: '12:30', duration_minutes: 90, location_type: 'online', status: 'completed', attendance: 'present', engagement_score: 8 },
  { id: 'ss20', seeker_id: 's9', course_id: 'c6', session_number: 20, date: '2024-08-30', start_time: '14:00', end_time: '15:30', duration_minutes: 90, location_type: 'online', status: 'completed', attendance: 'present', engagement_score: 9 },
];

export const ASSIGNMENTS: Assignment[] = [
  { id: 'a1', seeker_id: 's1', course_id: 'c4', title: 'Vision Board Creation', description: 'Create a comprehensive vision board for next 5 years', type: 'one_time', due_date: '2025-04-05', priority: 'high', status: 'assigned', category: 'Personal Growth' },
  { id: 'a2', seeker_id: 's1', course_id: 'c4', title: 'Morning Meditation 20min', description: 'Practice 20-minute morning meditation daily', type: 'daily', due_date: '2025-04-15', priority: 'high', status: 'in_progress', category: 'Spiritual' },
  { id: 'a3', seeker_id: 's2', course_id: 'c6', title: 'NLP Anchoring Exercise', description: 'Practice anchoring technique with 3 different states', type: 'weekly', due_date: '2025-04-02', priority: 'medium', status: 'submitted', category: 'NLP' },
  { id: 'a4', seeker_id: 's3', course_id: 'c8', title: 'Sovereign Leadership Journal', description: 'Daily journal entry on leadership decisions', type: 'daily', due_date: '2025-04-30', priority: 'high', status: 'in_progress', category: 'Leadership' },
  { id: 'a5', seeker_id: 's4', course_id: 'c4', title: 'Gratitude Letter', description: 'Write gratitude letters to 5 important people', type: 'one_time', due_date: '2025-03-25', priority: 'medium', status: 'overdue', category: 'Personal Growth' },
  { id: 'a6', seeker_id: 's5', course_id: 'c3', title: 'Leadership Essay', description: 'Write essay on leadership lessons from Mahabharata', type: 'one_time', due_date: '2025-03-10', priority: 'high', status: 'overdue', category: 'Professional' },
  { id: 'a7', seeker_id: 's5', course_id: 'c3', title: 'Bhagavad Gita Chapter Reading', description: 'Read and reflect on Chapter 2', type: 'one_time', due_date: '2025-03-15', priority: 'medium', status: 'overdue', category: 'Spiritual' },
  { id: 'a8', seeker_id: 's7', course_id: 'c5', title: 'Training Module Design', description: 'Design a 2-hour training module on communication', type: 'one_time', due_date: '2025-03-20', priority: 'high', status: 'overdue', category: 'Professional' },
  { id: 'a9', seeker_id: 's7', course_id: 'c5', title: 'Peer Coaching Session', description: 'Conduct a practice coaching session with peer', type: 'one_time', due_date: '2025-03-28', priority: 'medium', status: 'overdue', category: 'Professional' },
  { id: 'a10', seeker_id: 's10', course_id: 'c7', title: 'Weekly Reflection Essay', description: "Write a reflection essay on the week's learnings", type: 'weekly', due_date: '2025-04-01', priority: 'medium', status: 'assigned', category: 'Personal Growth' },
  { id: 'a11', seeker_id: 's2', course_id: 'c6', title: 'Submodality Mapping', description: 'Map submodalities for 3 limiting beliefs', type: 'one_time', due_date: '2025-04-10', priority: 'high', status: 'assigned', category: 'NLP' },
  { id: 'a12', seeker_id: 's1', course_id: 'c4', title: 'Business Plan Review', description: 'Align business plan with dharmic purpose', type: 'one_time', due_date: '2025-03-20', priority: 'high', status: 'reviewed', score: 88, feedback: 'Excellent alignment of purpose with strategy', category: 'Professional' },
  { id: 'a13', seeker_id: 's3', course_id: 'c8', title: 'Empire Vision Document', description: 'Create 10-year empire building vision', type: 'one_time', due_date: '2025-03-15', priority: 'high', status: 'reviewed', score: 95, feedback: 'Visionary and deeply aligned with sovereign leadership principles', category: 'Leadership' },
  { id: 'a14', seeker_id: 's6', course_id: 'c1', title: 'Attraction Journal', description: 'Daily journaling on what you want to attract', type: 'daily', due_date: '2025-04-10', priority: 'medium', status: 'in_progress', category: 'Personal Growth' },
  { id: 'a15', seeker_id: 's10', course_id: 'c7', title: 'Team Culture Assessment', description: 'Assess current team culture using LGT framework', type: 'one_time', due_date: '2025-04-05', priority: 'high', status: 'submitted', category: 'Leadership' },
];

export const LEADS: Lead[] = [
  // New (3)
  { id: 'l1', name: 'Anil Bhosle', phone: '9871234567', email: 'anil.b@email.com', source: 'LinkedIn', interested_course_id: 'c4', priority: 'hot', stage: 'new', current_challenge: 'Scaling business beyond ₹10Cr', days_in_pipeline: 1, created_at: '2025-03-30' },
  { id: 'l2', name: 'Deepa Mankar', phone: '9871234568', source: 'Referral', interested_course_id: 'c6', priority: 'warm', stage: 'new', days_in_pipeline: 2, created_at: '2025-03-29' },
  { id: 'l3', name: 'Rajesh Patel', phone: '9871234569', email: 'rajesh.p@email.com', source: 'Live Event', interested_course_id: 'c2', priority: 'cold', stage: 'new', days_in_pipeline: 1, created_at: '2025-03-30' },
  // Contacted (3)
  { id: 'l4', name: 'Shalini Iyer', phone: '9871234570', email: 'shalini.i@email.com', source: 'Website', interested_course_id: 'c7', priority: 'hot', stage: 'contacted', current_challenge: 'Succession planning', days_in_pipeline: 4, created_at: '2025-03-27' },
  { id: 'l5', name: 'Mahesh Kale', phone: '9871234571', source: 'Social Media', interested_course_id: 'c3', priority: 'warm', stage: 'contacted', days_in_pipeline: 6, created_at: '2025-03-25' },
  { id: 'l6', name: 'Priyanka Desai', phone: '9871234572', email: 'priyanka.d@email.com', source: 'Referral', interested_course_id: 'c1', priority: 'warm', stage: 'contacted', days_in_pipeline: 3, created_at: '2025-03-28' },
  // Discovery (2)
  { id: 'l7', name: 'Nikhil Joshi', phone: '9871234573', email: 'nikhil.j@email.com', source: 'LinkedIn', interested_course_id: 'c8', priority: 'hot', stage: 'discovery', current_challenge: 'Spiritual awakening while managing empire', days_in_pipeline: 8, created_at: '2025-03-23' },
  { id: 'l8', name: 'Aarti Sharma', phone: '9871234574', source: 'Live Event', interested_course_id: 'c4', priority: 'warm', stage: 'discovery', days_in_pipeline: 7, created_at: '2025-03-24' },
  // Proposal (2)
  { id: 'l9', name: 'Manish Gupta', phone: '9871234575', email: 'manish.g@email.com', source: 'Referral', interested_course_id: 'c4', priority: 'hot', stage: 'proposal', current_challenge: 'Work-life balance as CEO', days_in_pipeline: 12, created_at: '2025-03-19' },
  { id: 'l10', name: 'Sunita Patil', phone: '9871234576', source: 'Website', interested_course_id: 'c5', priority: 'warm', stage: 'proposal', days_in_pipeline: 10, created_at: '2025-03-21' },
  // Negotiating (2)
  { id: 'l11', name: 'Rohit Kulkarni', phone: '9871234577', email: 'rohit.k@email.com', source: 'LinkedIn', interested_course_id: 'c7', priority: 'hot', stage: 'negotiating', current_challenge: 'Team leadership gaps', days_in_pipeline: 15, created_at: '2025-03-16' },
  { id: 'l12', name: 'Anita Shah', phone: '9871234578', source: 'Referral', interested_course_id: 'c6', priority: 'warm', stage: 'negotiating', days_in_pipeline: 14, created_at: '2025-03-17' },
  // Converted (2)
  { id: 'l13', name: 'Rahul Patil', phone: '9876543210', email: 'rahul.patil@email.com', source: 'Live Event', interested_course_id: 'c4', priority: 'hot', stage: 'converted', days_in_pipeline: 20, created_at: '2024-08-26' },
  { id: 'l14', name: 'Meera Shah', phone: '9876543211', email: 'meera.shah@email.com', source: 'Referral', interested_course_id: 'c6', priority: 'hot', stage: 'converted', days_in_pipeline: 15, created_at: '2024-09-16' },
  // Lost (1)
  { id: 'l15', name: 'Vinod Kumar', phone: '9871234581', source: 'Website', interested_course_id: 'c4', priority: 'cold', stage: 'lost', notes: 'Too Expensive — budget constraints', days_in_pipeline: 30, created_at: '2025-03-01' },
];

export const PAYMENTS: Payment[] = [
  { id: 'p1', seeker_id: 's1', invoice_number: 'VDTS-INV-1001', amount: 211864, gst_amount: 38136, total_amount: 250000, payment_date: '2024-09-15', method: 'bank_transfer', transaction_id: 'TXN001', status: 'received' },
  { id: 'p2', seeker_id: 's2', invoice_number: 'VDTS-INV-1002', amount: 127119, gst_amount: 22881, total_amount: 150000, payment_date: '2024-10-01', method: 'upi', transaction_id: 'TXN002', status: 'received' },
  { id: 'p3', seeker_id: 's3', invoice_number: 'VDTS-INV-1003', amount: 500000, gst_amount: 90000, total_amount: 590000, payment_date: '2024-08-01', method: 'bank_transfer', transaction_id: 'TXN003', status: 'received' },
  { id: 'p4', seeker_id: 's3', invoice_number: 'VDTS-INV-1004', amount: 347458, gst_amount: 62542, total_amount: 410000, payment_date: '2025-02-01', method: 'bank_transfer', transaction_id: 'TXN004', status: 'received' },
  { id: 'p5', seeker_id: 's4', invoice_number: 'VDTS-INV-1005', amount: 211864, gst_amount: 38136, total_amount: 250000, payment_date: '2024-11-01', method: 'razorpay', transaction_id: 'TXN005', status: 'received' },
  { id: 'p6', seeker_id: 's5', invoice_number: 'VDTS-INV-1006', amount: 12500, gst_amount: 2250, total_amount: 14750, payment_date: '2024-07-15', method: 'upi', transaction_id: 'TXN006', status: 'received' },
  { id: 'p7', seeker_id: 's5', invoice_number: 'VDTS-INV-1007', amount: 12500, gst_amount: 2250, total_amount: 14750, due_date: '2025-01-15', method: 'upi', status: 'overdue', payment_date: '' },
  { id: 'p8', seeker_id: 's6', invoice_number: 'VDTS-INV-1008', amount: 4237, gst_amount: 763, total_amount: 5000, payment_date: '2025-01-10', method: 'cash', status: 'received' },
  { id: 'p9', seeker_id: 's7', invoice_number: 'VDTS-INV-1009', amount: 254237, gst_amount: 45763, total_amount: 300000, payment_date: '2024-06-01', method: 'bank_transfer', transaction_id: 'TXN009', status: 'received' },
  { id: 'p10', seeker_id: 's8', invoice_number: 'VDTS-INV-1010', amount: 5932, gst_amount: 1068, total_amount: 7000, payment_date: '2025-02-01', method: 'upi', transaction_id: 'TXN010', status: 'received' },
  { id: 'p11', seeker_id: 's9', invoice_number: 'VDTS-INV-1011', amount: 127119, gst_amount: 22881, total_amount: 150000, payment_date: '2024-03-01', method: 'bank_transfer', transaction_id: 'TXN011', status: 'received' },
  { id: 'p12', seeker_id: 's10', invoice_number: 'VDTS-INV-1012', amount: 175000, gst_amount: 31500, total_amount: 206500, payment_date: '2024-10-15', method: 'bank_transfer', transaction_id: 'TXN012', status: 'received' },
  { id: 'p13', seeker_id: 's10', invoice_number: 'VDTS-INV-1013', amount: 175000, gst_amount: 31500, total_amount: 206500, due_date: '2025-04-15', method: 'bank_transfer', status: 'pending', payment_date: '' },
  { id: 'p14', seeker_id: 's4', invoice_number: 'VDTS-INV-1014', amount: 50000, gst_amount: 9000, total_amount: 59000, due_date: '2025-04-01', method: 'emi', status: 'pending', payment_date: '' },
  { id: 'p15', seeker_id: 's8', invoice_number: 'VDTS-INV-1015', amount: 5000, gst_amount: 900, total_amount: 5900, payment_date: '2025-03-15', method: 'cheque', transaction_id: 'CHQ-8834', status: 'received' },
];

export const RESOURCES: Resource[] = [
  { id: 'r1', title: 'Ramayana Leadership Lessons', description: 'Key leadership lessons from Ramayana for modern entrepreneurs', type: 'pdf', category: 'Course Materials', course_id: 'c1', language: 'EN', tags: ['leadership', 'ramayana'], view_count: 124, download_count: 89 },
  { id: 'r2', title: 'Morning Meditation Guide', description: 'Step-by-step 20-minute morning meditation practice', type: 'audio', category: 'Meditation', language: 'EN', tags: ['meditation', 'morning'], view_count: 256, download_count: 198 },
  { id: 'r3', title: 'Wheel of Life Worksheet', description: 'Self-assessment worksheet for 10 life dimensions', type: 'worksheet', category: 'Worksheets', course_id: 'c4', language: 'EN', tags: ['assessment', 'wheel'], view_count: 187, download_count: 145 },
  { id: 'r4', title: 'Mahabharata Strategy Framework', description: 'Strategic thinking framework inspired by Mahabharata', type: 'pdf', category: 'Course Materials', course_id: 'c3', language: 'EN', tags: ['strategy', 'mahabharata'], view_count: 98, download_count: 67 },
  { id: 'r5', title: 'NLP Techniques in Marathi', description: 'एनएलपी तंत्र मराठीमध्ये - सर्व प्रमुख तंत्रांचे स्पष्टीकरण', type: 'pdf', category: 'Course Materials', course_id: 'c6', language: 'MR', tags: ['nlp', 'marathi'], view_count: 156, download_count: 112 },
  { id: 'r6', title: 'Daily Affirmation Collection — 365 Days', description: 'One affirmation for each day of the year in English and Marathi', type: 'pdf', category: 'Affirmations', language: 'EN', tags: ['affirmations', 'daily'], view_count: 312, download_count: 267 },
  { id: 'r7', title: "Life's Golden Triangle Workbook", description: 'Complete workbook for the LGT transformation program', type: 'worksheet', category: 'Course Materials', course_id: 'c4', language: 'EN', tags: ['lgt', 'workbook'], view_count: 145, download_count: 123 },
  { id: 'r8', title: 'Vision Board Template', description: 'Printable vision board template with guided sections', type: 'worksheet', category: 'Templates', language: 'EN', tags: ['vision', 'template'], view_count: 201, download_count: 178 },
  { id: 'r9', title: 'Guided Dharma Meditation', description: '15-minute guided meditation on discovering your dharma', type: 'audio', category: 'Meditation', language: 'HI', tags: ['meditation', 'dharma'], view_count: 189, download_count: 134 },
  { id: 'r10', title: 'Business Growth Action Plan', description: 'Template for creating a dharma-aligned business growth plan', type: 'pdf', category: 'Templates', course_id: 'c4', language: 'EN', tags: ['business', 'growth'], view_count: 134, download_count: 98 },
  { id: 'r11', title: 'Train the Trainer Handbook', description: 'Complete handbook for aspiring transformation coaches', type: 'pdf', category: 'Course Materials', course_id: 'c5', language: 'EN', tags: ['trainer', 'handbook'], view_count: 87, download_count: 65 },
  { id: 'r12', title: 'Chakravartin Leadership Secrets', description: 'Exclusive material for sovereign leadership development', type: 'pdf', category: 'Course Materials', course_id: 'c8', language: 'EN', tags: ['chakravartin', 'leadership'], view_count: 45, download_count: 32 },
  { id: 'r13', title: 'Evening Reflection Journal', description: 'Guided evening reflection journal template', type: 'worksheet', category: 'Worksheets', language: 'EN', tags: ['reflection', 'journal'], view_count: 223, download_count: 189 },
  { id: 'r14', title: 'Fear Elimination Workbook', description: 'NLP-based workbook for overcoming limiting fears', type: 'worksheet', category: 'Worksheets', course_id: 'c6', language: 'EN', tags: ['fear', 'nlp'], view_count: 167, download_count: 134 },
  { id: 'r15', title: 'Gratitude Practice 21-Day Guide', description: '21-day guided gratitude practice for deep transformation', type: 'pdf', category: 'Books', language: 'EN', tags: ['gratitude', 'practice'], view_count: 278, download_count: 234 },
];

export const FOLLOW_UPS: FollowUp[] = [
  { id: 'f1', seeker_id: 's5', type: 'call', due_date: '2025-03-28', priority: 'high', notes: 'Check on paused status — motivate to resume', status: 'overdue' },
  { id: 'f2', seeker_id: 's7', type: 'whatsapp', due_date: '2025-03-29', priority: 'high', notes: 'Follow up on 12 days of inactivity', status: 'overdue' },
  { id: 'f3', seeker_id: 's4', type: 'call', due_date: '2025-03-31', priority: 'medium', notes: 'Discuss pending payment of ₹59,000', status: 'pending' },
  { id: 'f4', seeker_id: 's1', type: 'whatsapp', due_date: '2025-03-31', priority: 'low', notes: 'Send session 9 prep materials', status: 'pending' },
  { id: 'f5', seeker_id: 's10', type: 'email', due_date: '2025-04-02', priority: 'medium', notes: 'Share growth matrix for month 5', status: 'pending' },
  { id: 'f6', seeker_id: 's3', type: 'call', due_date: '2025-04-03', priority: 'low', notes: 'Monthly check-in on sovereign leadership goals', status: 'pending' },
  { id: 'f7', seeker_id: 's6', type: 'whatsapp', due_date: '2025-04-05', priority: 'medium', notes: 'Post-workshop feedback collection', status: 'pending' },
  { id: 'f8', seeker_id: 's1', type: 'call', due_date: '2025-03-25', priority: 'medium', notes: 'Pre-session check-in completed', status: 'completed', completion_notes: 'Great energy, ready for session 8' },
  { id: 'f9', seeker_id: 's2', type: 'email', due_date: '2025-03-20', priority: 'low', notes: 'Share NLP resources', status: 'completed', completion_notes: 'Resources shared via email' },
  { id: 'f10', seeker_id: 's3', type: 'whatsapp', due_date: '2025-03-22', priority: 'medium', notes: 'Meditation streak celebration', status: 'completed', completion_notes: 'Celebrated 30-day streak!' },
];

export const MESSAGES: Message[] = [
  // Conversation with Rahul Patil
  { id: 'm1', sender_id: 'admin-1', receiver_id: 's1', content: 'Rahul, please review the dharma alignment framework before our next session.', is_read: true, created_at: '2025-03-28T10:00:00' },
  { id: 'm2', sender_id: 's1', receiver_id: 'admin-1', content: 'Yes sir, I have been reading it. The connection between purpose and profit is fascinating!', is_read: true, created_at: '2025-03-28T10:15:00' },
  { id: 'm3', sender_id: 'admin-1', receiver_id: 's1', content: 'Excellent! Also complete your vision board before session 9.', is_read: true, created_at: '2025-03-28T10:20:00' },
  { id: 'm4', sender_id: 's1', receiver_id: 'admin-1', content: 'Will do, sir. Should I include my team growth vision as well?', is_read: true, created_at: '2025-03-28T11:00:00' },
  { id: 'm5', sender_id: 'admin-1', receiver_id: 's1', content: 'Absolutely! Include personal, professional and spiritual visions.', is_read: true, created_at: '2025-03-28T11:05:00' },
  { id: 'm6', sender_id: 's1', receiver_id: 'admin-1', content: 'Thank you Vivek sir 🙏 Looking forward to the session!', is_read: false, created_at: '2025-03-29T09:00:00' },
  // Conversation with Meera Shah
  { id: 'm7', sender_id: 's2', receiver_id: 'admin-1', content: 'Sir, I completed the NLP anchoring exercise. It was transformative!', is_read: true, created_at: '2025-03-27T14:00:00' },
  { id: 'm8', sender_id: 'admin-1', receiver_id: 's2', content: 'Wonderful Meera! Document your experience in the assignment submission.', is_read: true, created_at: '2025-03-27T14:30:00' },
  { id: 'm9', sender_id: 's2', receiver_id: 'admin-1', content: 'Done! I also tried the submodality technique with a client. Amazing results.', is_read: true, created_at: '2025-03-28T09:00:00' },
  { id: 'm10', sender_id: 'admin-1', receiver_id: 's2', content: 'That\'s the spirit! We\'ll discuss advanced techniques in session 13.', is_read: false, created_at: '2025-03-28T09:15:00' },
  // Conversation with Amit Joshi
  { id: 'm11', sender_id: 's3', receiver_id: 'admin-1', content: 'Vivek sir, can we move session 13 from 4:30 PM to 5:00 PM?', is_read: true, created_at: '2025-03-30T16:00:00' },
  { id: 'm12', sender_id: 'admin-1', receiver_id: 's3', content: 'Let me check my calendar. I\'ll confirm by evening.', is_read: true, created_at: '2025-03-30T16:30:00' },
  { id: 'm13', sender_id: 'admin-1', receiver_id: 's3', content: '4:30 PM works better for me. Let\'s keep the original time.', is_read: false, created_at: '2025-03-30T19:00:00' },
  // Conversation with Sneha Kulkarni
  { id: 'm14', sender_id: 's4', receiver_id: 'admin-1', content: 'Sir, I\'m having trouble with the payment. Can I pay in 2 installments?', is_read: true, created_at: '2025-03-29T11:00:00' },
  { id: 'm15', sender_id: 'admin-1', receiver_id: 's4', content: 'Of course Sneha. Let\'s discuss the EMI plan in our next session.', is_read: false, created_at: '2025-03-29T11:30:00' },
];

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'ce1', title: 'Rahul Patil - LGT Session 9', type: 'session', seeker_id: 's1', date: '2025-03-31', start_time: '10:00', end_time: '11:30', color: '#B8860B' },
  { id: 'ce2', title: 'Meera Shah - NLP Session 13', type: 'session', seeker_id: 's2', date: '2025-03-31', start_time: '14:00', end_time: '15:30', color: '#3F51B5' },
  { id: 'ce3', title: 'Amit Joshi - Chakravartin Session 13', type: 'session', seeker_id: 's3', date: '2025-03-31', start_time: '16:30', end_time: '18:00', color: '#7B1FA2' },
  { id: 'ce4', title: 'Sneha Kulkarni - LGT Session 7', type: 'session', seeker_id: 's4', date: '2025-04-01', start_time: '10:00', end_time: '11:30', color: '#B8860B' },
  { id: 'ce5', title: 'Suresh Reddy - LGT Leaders Session 16', type: 'session', seeker_id: 's10', date: '2025-04-02', start_time: '15:00', end_time: '16:30', color: '#B8860B' },
  { id: 'ce6', title: 'Follow-up: Vikram Deshmukh', type: 'follow_up', seeker_id: 's5', date: '2025-03-31', start_time: '12:00', end_time: '12:30', color: '#FF9933' },
  { id: 'ce7', title: 'Discovery Call: Nikhil Joshi', type: 'discovery', date: '2025-04-01', start_time: '11:30', end_time: '12:30', color: '#E91E63' },
  { id: 'ce8', title: 'Blocked: Personal Sadhana', type: 'blocked', date: '2025-03-31', start_time: '06:00', end_time: '07:00', color: '#9E9E9E' },
  { id: 'ce9', title: 'Discovery Call: Aarti Sharma', type: 'discovery', date: '2025-04-03', start_time: '14:00', end_time: '15:00', color: '#E91E63' },
  { id: 'ce10', title: 'Follow-up: Priya Nair', type: 'follow_up', seeker_id: 's7', date: '2025-04-02', start_time: '10:00', end_time: '10:30', color: '#FF9933' },
  { id: 'ce11', title: 'Rahul Patil - LGT Session 10', type: 'session', seeker_id: 's1', date: '2025-04-07', start_time: '10:00', end_time: '11:30', color: '#B8860B' },
  { id: 'ce12', title: 'Meera Shah - NLP Session 14', type: 'session', seeker_id: 's2', date: '2025-04-07', start_time: '14:00', end_time: '15:30', color: '#3F51B5' },
  { id: 'ce13', title: 'Blocked: Content Creation', type: 'blocked', date: '2025-04-04', start_time: '09:00', end_time: '12:00', color: '#9E9E9E' },
  { id: 'ce14', title: 'Workshop: Laws of Attraction', type: 'event', date: '2025-04-05', start_time: '09:00', end_time: '17:00', color: '#2196F3' },
  { id: 'ce15', title: 'Amit Joshi - Chakravartin Session 14', type: 'session', seeker_id: 's3', date: '2025-04-08', start_time: '16:30', end_time: '18:00', color: '#7B1FA2' },
  { id: 'ce16', title: 'Follow-up: Sneha Kulkarni (Payment)', type: 'follow_up', seeker_id: 's4', date: '2025-04-01', start_time: '09:00', end_time: '09:30', color: '#FF9933' },
  { id: 'ce17', title: 'Discovery Call: Manish Gupta', type: 'discovery', date: '2025-04-03', start_time: '11:00', end_time: '12:00', color: '#E91E63' },
  { id: 'ce18', title: 'Suresh Reddy - LGT Leaders Session 17', type: 'session', seeker_id: 's10', date: '2025-04-09', start_time: '15:00', end_time: '16:30', color: '#B8860B' },
  { id: 'ce19', title: 'Blocked: Evening Meditation', type: 'blocked', date: '2025-04-01', start_time: '18:00', end_time: '18:30', color: '#9E9E9E' },
  { id: 'ce20', title: 'Sneha Kulkarni - LGT Session 8', type: 'session', seeker_id: 's4', date: '2025-04-08', start_time: '10:00', end_time: '11:30', color: '#B8860B' },
];

export const NOTIFICATIONS = [
  { id: 'n1', text: 'Rahul Patil submitted daily log', icon: '✅', time: '2 min ago' },
  { id: 'n2', text: 'Payment ₹25,000 received from Meera Shah', icon: '💰', time: '1 hr ago' },
  { id: 'n3', text: 'Assignment overdue: Vikram Deshmukh', icon: '⚠️', time: '3 hrs ago' },
  { id: 'n4', text: 'New lead: Anil Bhosle', icon: '🎯', time: 'Today' },
  { id: 'n5', text: 'Priya Nair inactive 12 days', icon: '🔴', time: 'Yesterday' },
];

export const MOTIVATIONAL_QUOTES = [
  { text: "The soul is neither born, and nor does it die.", author: "Bhagavad Gita" },
  { text: "You have the right to work, but never to the fruit of work.", author: "Bhagavad Gita" },
  { text: "Change is the law of the universe.", author: "Lord Krishna" },
  { text: "When you transform yourself, you transform the world around you.", author: "Vivek Doba" },
  { text: "Life's Golden Triangle is not a concept — it is your compass.", author: "Vivek Doba" },
  { text: "Success without spiritual alignment is like a tree without roots.", author: "Vivek Doba" },
  { text: "Your dharma is not something you choose — it chooses you.", author: "Vivek Doba" },
  { text: "In the Mahabharata of business, strategy without integrity leads to defeat.", author: "Vivek Doba" },
];

export const AFFIRMATIONS = [
  { en: "I am a divine being on a sacred journey of transformation.", mr: "मी एक दिव्य व्यक्ती आहे, परिवर्तनाच्या पवित्र प्रवासावर." },
  { en: "My dharma guides every decision I make today.", mr: "माझा धर्म आज माझ्या प्रत्येक निर्णयाला मार्गदर्शन करतो." },
  { en: "I attract abundance in all dimensions of life.", mr: "मी जीवनाच्या सर्व आयामांमध्ये विपुलता आकर्षित करतो." },
];

export function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function getHealthColor(health: string): string {
  switch (health) {
    case 'green': return 'bg-dharma-green shadow-[0_0_8px_rgba(34,197,94,0.5)]';
    case 'yellow': return 'bg-warning-amber shadow-[0_0_8px_rgba(234,179,8,0.5)]';
    case 'red': return 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]';
    default: return 'bg-muted';
  }
}

export function getHealthDotOnly(health: string): string {
  switch (health) {
    case 'green': return 'bg-dharma-green';
    case 'yellow': return 'bg-warning-amber';
    case 'red': return 'bg-destructive';
    default: return 'bg-muted';
  }
}

export function getTierBadgeClass(tier: string): string {
  switch (tier) {
    case 'standard': return 'bg-sky-blue/10 text-sky-blue border border-sky-blue/20';
    case 'premium': return 'bg-wisdom-purple/10 text-wisdom-purple border border-wisdom-purple/20';
    case 'platinum': return 'bg-gradient-to-r from-gray-200 to-gray-100 text-gray-700 border border-gray-300';
    case 'chakravartin': return 'shimmer-gold text-primary-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return formatDateDMY(d);
}

export function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}
