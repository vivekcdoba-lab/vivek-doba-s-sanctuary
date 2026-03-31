import { Course, SeekerWithDetails, Session, Assignment, Lead, Payment } from '@/types';

export const COURSES: Course[] = [
  { id: 'c1', name: 'Laws of Attraction through Ramayana', tagline: 'Manifest your destiny through ancient wisdom', duration: '1 Day', format: 'Workshop', tier: 'standard', price: 5000, max_participants: 50, gradient_colors: ['#0288D1', '#009688'], is_active: true },
  { id: 'c2', name: 'Team Building', tagline: 'Build unshakeable teams through dharmic principles', duration: '1 Day', format: 'Workshop', tier: 'standard', price: 7000, max_participants: 40, gradient_colors: ['#2E7D32', '#43A047'], is_active: true },
  { id: 'c3', name: 'Leadership through Mahabharata', tagline: 'Lead like Arjuna, strategize like Krishna', duration: '3 Days', format: 'Intensive', tier: 'premium', price: 25000, max_participants: 25, gradient_colors: ['#800020', '#7B1FA2'], is_active: true },
  { id: 'c4', name: "Life's Golden Triangle — Business Owners", tagline: 'Transform personal, professional & spiritual dimensions', duration: '6 Months', format: '1-on-1', tier: 'platinum', price: 250000, max_participants: 10, gradient_colors: ['#9E9E9E', '#FFD700'], is_active: true },
  { id: 'c5', name: 'Train the Trainer', tagline: 'Become a certified transformation coach', duration: '6 Months', format: 'Group + 1-on-1', tier: 'platinum', price: 300000, max_participants: 8, gradient_colors: ['#FFD700', '#CD7F32'], is_active: true },
  { id: 'c6', name: 'NLP in Marathi', tagline: 'न्यूरो-लिंग्विस्टिक प्रोग्रामिंग मराठीत', duration: '6 Months', format: 'Group', tier: 'premium', price: 150000, max_participants: 20, gradient_colors: ['#FF9933', '#FF6F00'], is_active: true },
  { id: 'c7', name: 'LGT Leaders Edition', tagline: 'Exclusive leadership transformation program', duration: '6 Months', format: 'Group + 1-on-1', tier: 'platinum', price: 350000, max_participants: 6, gradient_colors: ['#E0E0E0', '#FAFAFA'], is_active: true },
  { id: 'c8', name: 'Chakravartin — Sovereign Leadership', tagline: 'The ultimate transformation for empire builders', duration: '12 Months', format: 'Ultra 1-on-1', tier: 'chakravartin', price: 1000000, max_participants: 3, gradient_colors: ['#FFD700', '#7B1FA2'], is_active: true },
];

export const SEEKERS: SeekerWithDetails[] = [
  { id: 's1', full_name: 'Rahul Patil', email: 'rahul.patil@email.com', phone: '9876543210', city: 'Pune', state: 'Maharashtra', role: 'seeker', created_at: '2024-09-15', occupation: 'Entrepreneur', company: 'Patil Industries', revenue_range: '₹1Cr-₹5Cr', enrollment: { id: 'e1', seeker_id: 's1', course_id: 'c4', tier: 'platinum', start_date: '2024-09-15', status: 'active', payment_status: 'received' }, course: COURSES[3], health: 'green', sessions_completed: 12, total_sessions: 24, growth_score: 78, streak: 15, last_session_date: '2025-03-28', last_log_date: '2025-03-31', overdue_assignments: 0 },
  { id: 's2', full_name: 'Meera Shah', email: 'meera.shah@email.com', phone: '9876543211', city: 'Mumbai', state: 'Maharashtra', role: 'seeker', created_at: '2024-10-01', occupation: 'Corporate Trainer', company: 'Shah Consulting', enrollment: { id: 'e2', seeker_id: 's2', course_id: 'c6', tier: 'premium', start_date: '2024-10-01', status: 'active', payment_status: 'received' }, course: COURSES[5], health: 'green', sessions_completed: 10, total_sessions: 24, growth_score: 72, streak: 8, last_session_date: '2025-03-27', last_log_date: '2025-03-30', overdue_assignments: 0 },
  { id: 's3', full_name: 'Amit Joshi', email: 'amit.joshi@email.com', phone: '9876543212', city: 'Delhi', state: 'Delhi', role: 'seeker', created_at: '2024-08-01', occupation: 'CEO', company: 'Joshi Enterprises', revenue_range: '₹10Cr+', enrollment: { id: 'e3', seeker_id: 's3', course_id: 'c8', tier: 'chakravartin', start_date: '2024-08-01', status: 'active', payment_status: 'received' }, course: COURSES[7], health: 'green', sessions_completed: 18, total_sessions: 48, growth_score: 85, streak: 30, last_session_date: '2025-03-29', last_log_date: '2025-03-31', overdue_assignments: 0 },
  { id: 's4', full_name: 'Sneha Kulkarni', email: 'sneha.k@email.com', phone: '9876543213', city: 'Pune', state: 'Maharashtra', role: 'seeker', created_at: '2024-11-01', occupation: 'Business Owner', company: 'Sneha Fashions', enrollment: { id: 'e4', seeker_id: 's4', course_id: 'c4', tier: 'platinum', start_date: '2024-11-01', status: 'active', payment_status: 'received' }, course: COURSES[3], health: 'yellow', sessions_completed: 8, total_sessions: 24, growth_score: 65, streak: 3, last_session_date: '2025-03-20', last_log_date: '2025-03-28', overdue_assignments: 1 },
  { id: 's5', full_name: 'Vikram Deshmukh', email: 'vikram.d@email.com', phone: '9876543214', city: 'Nagpur', state: 'Maharashtra', role: 'seeker', created_at: '2024-07-15', occupation: 'Manager', company: 'Deshmukh Corp', enrollment: { id: 'e5', seeker_id: 's5', course_id: 'c3', tier: 'premium', start_date: '2024-07-15', status: 'paused', payment_status: 'pending' }, course: COURSES[2], health: 'red', sessions_completed: 4, total_sessions: 12, growth_score: 42, streak: 0, last_session_date: '2025-02-10', last_log_date: '2025-02-15', overdue_assignments: 3 },
  { id: 's6', full_name: 'Pooja Sharma', email: 'pooja.s@email.com', phone: '9876543215', city: 'Pune', state: 'Maharashtra', role: 'seeker', created_at: '2025-01-10', occupation: 'Homemaker', enrollment: { id: 'e6', seeker_id: 's6', course_id: 'c1', tier: 'standard', start_date: '2025-01-10', status: 'active', payment_status: 'received' }, course: COURSES[0], health: 'green', sessions_completed: 1, total_sessions: 1, growth_score: 55, streak: 7, last_session_date: '2025-03-30', last_log_date: '2025-03-31', overdue_assignments: 0 },
  { id: 's7', full_name: 'Priya Nair', email: 'priya.n@email.com', phone: '9876543216', city: 'Bangalore', state: 'Karnataka', role: 'seeker', created_at: '2024-06-01', occupation: 'HR Director', company: 'TechNova', enrollment: { id: 'e7', seeker_id: 's7', course_id: 'c5', tier: 'platinum', start_date: '2024-06-01', status: 'active', payment_status: 'received' }, course: COURSES[4], health: 'red', sessions_completed: 15, total_sessions: 24, growth_score: 68, streak: 0, last_session_date: '2025-02-28', last_log_date: '2025-03-01', overdue_assignments: 2 },
  { id: 's8', full_name: 'Sanjay Gupta', email: 'sanjay.g@email.com', phone: '9876543217', city: 'Hyderabad', state: 'Telangana', role: 'seeker', created_at: '2025-02-01', occupation: 'Sales Director', company: 'Gupta Traders', enrollment: { id: 'e8', seeker_id: 's8', course_id: 'c2', tier: 'standard', start_date: '2025-02-01', status: 'active', payment_status: 'received' }, course: COURSES[1], health: 'yellow', sessions_completed: 1, total_sessions: 1, growth_score: 48, streak: 2, last_session_date: '2025-03-22', last_log_date: '2025-03-29', overdue_assignments: 0 },
  { id: 's9', full_name: 'Kavita Bhosle', email: 'kavita.b@email.com', phone: '9876543218', city: 'Pune', state: 'Maharashtra', role: 'seeker', created_at: '2024-03-01', occupation: 'Counselor', company: 'Bhosle Wellness', enrollment: { id: 'e9', seeker_id: 's9', course_id: 'c6', tier: 'premium', start_date: '2024-03-01', end_date: '2024-09-01', status: 'completed', payment_status: 'received' }, course: COURSES[5], health: 'green', sessions_completed: 24, total_sessions: 24, growth_score: 91, streak: 0, last_session_date: '2024-08-30', last_log_date: '2024-08-30', overdue_assignments: 0 },
  { id: 's10', full_name: 'Suresh Reddy', email: 'suresh.r@email.com', phone: '9876543219', city: 'Chennai', state: 'Tamil Nadu', role: 'seeker', created_at: '2024-10-15', occupation: 'Founder', company: 'Reddy Tech', revenue_range: '₹5Cr-₹10Cr', enrollment: { id: 'e10', seeker_id: 's10', course_id: 'c7', tier: 'platinum', start_date: '2024-10-15', status: 'active', payment_status: 'received' }, course: COURSES[6], health: 'green', sessions_completed: 11, total_sessions: 24, growth_score: 74, streak: 12, last_session_date: '2025-03-29', last_log_date: '2025-03-31', overdue_assignments: 0 },
];

export const SESSIONS: Session[] = [
  { id: 'ss1', seeker_id: 's1', course_id: 'c4', session_number: 12, date: '2025-03-28', start_time: '10:00', end_time: '11:30', duration_minutes: 90, location_type: 'online', meeting_link: 'https://zoom.us/j/123', status: 'completed', attendance: 'present', topics_covered: ['Dharma alignment', 'Business strategy'], key_insights: 'Major breakthrough in understanding purpose', engagement_score: 9 },
  { id: 'ss2', seeker_id: 's2', course_id: 'c6', session_number: 10, date: '2025-03-27', start_time: '14:00', end_time: '15:30', duration_minutes: 90, location_type: 'online', status: 'completed', attendance: 'present', engagement_score: 8 },
  { id: 'ss3', seeker_id: 's3', course_id: 'c8', session_number: 18, date: '2025-03-29', start_time: '09:00', end_time: '11:00', duration_minutes: 120, location_type: 'in_person', status: 'completed', attendance: 'present', engagement_score: 10 },
  { id: 'ss4', seeker_id: 's1', course_id: 'c4', session_number: 13, date: '2025-03-31', start_time: '10:00', end_time: '11:30', duration_minutes: 90, location_type: 'online', meeting_link: 'https://zoom.us/j/123', status: 'scheduled' },
  { id: 'ss5', seeker_id: 's4', course_id: 'c4', session_number: 9, date: '2025-03-31', start_time: '15:00', end_time: '16:30', duration_minutes: 90, location_type: 'online', status: 'scheduled' },
  { id: 'ss6', seeker_id: 's10', course_id: 'c7', session_number: 12, date: '2025-04-01', start_time: '11:00', end_time: '12:30', duration_minutes: 90, location_type: 'online', status: 'scheduled' },
  { id: 'ss7', seeker_id: 's6', course_id: 'c1', session_number: 1, date: '2025-03-30', start_time: '16:00', end_time: '17:00', duration_minutes: 60, location_type: 'in_person', status: 'completed', attendance: 'present', engagement_score: 7 },
];

export const ASSIGNMENTS: Assignment[] = [
  { id: 'a1', seeker_id: 's1', course_id: 'c4', title: 'Vision Board Creation', description: 'Create a comprehensive vision board for next 5 years', type: 'one_time', due_date: '2025-04-05', priority: 'high', status: 'assigned', category: 'Personal Growth' },
  { id: 'a2', seeker_id: 's1', course_id: 'c4', title: 'Morning Meditation 20min', description: 'Practice 20-minute morning meditation daily', type: 'daily', due_date: '2025-04-15', priority: 'high', status: 'in_progress', category: 'Spiritual' },
  { id: 'a3', seeker_id: 's2', course_id: 'c6', title: 'NLP Anchoring Exercise', description: 'Practice anchoring technique with 3 different states', type: 'weekly', due_date: '2025-04-02', priority: 'medium', status: 'submitted', category: 'NLP' },
  { id: 'a4', seeker_id: 's3', course_id: 'c8', title: 'Sovereign Leadership Journal', description: 'Daily journal entry on leadership decisions', type: 'daily', due_date: '2025-04-30', priority: 'high', status: 'in_progress', category: 'Leadership' },
  { id: 'a5', seeker_id: 's4', course_id: 'c4', title: 'Gratitude Letter', description: 'Write gratitude letters to 5 important people', type: 'one_time', due_date: '2025-03-25', priority: 'medium', status: 'overdue', category: 'Personal Growth' },
  { id: 'a6', seeker_id: 's5', course_id: 'c3', title: 'Team Assessment Report', description: 'Complete team dynamics assessment', type: 'one_time', due_date: '2025-03-10', priority: 'high', status: 'overdue', category: 'Professional' },
  { id: 'a7', seeker_id: 's5', course_id: 'c3', title: 'Bhagavad Gita Chapter Reading', description: 'Read and reflect on Chapter 2', type: 'one_time', due_date: '2025-03-15', priority: 'medium', status: 'overdue', category: 'Spiritual' },
  { id: 'a8', seeker_id: 's7', course_id: 'c5', title: 'Training Module Design', description: 'Design a 2-hour training module on communication', type: 'one_time', due_date: '2025-03-20', priority: 'high', status: 'overdue', category: 'Professional' },
  { id: 'a9', seeker_id: 's7', course_id: 'c5', title: 'Peer Coaching Session', description: 'Conduct a practice coaching session with peer', type: 'one_time', due_date: '2025-03-28', priority: 'medium', status: 'overdue', category: 'Professional' },
  { id: 'a10', seeker_id: 's10', course_id: 'c7', title: 'Weekly Reflection Essay', description: 'Write a reflection essay on the week\'s learnings', type: 'weekly', due_date: '2025-04-01', priority: 'medium', status: 'assigned', category: 'Personal Growth' },
];

export const LEADS: Lead[] = [
  { id: 'l1', name: 'Rajesh Mehta', phone: '9871234567', email: 'rajesh.m@email.com', source: 'LinkedIn', interested_course_id: 'c4', priority: 'hot', stage: 'proposal', current_challenge: 'Scaling business beyond ₹10Cr', days_in_pipeline: 5, created_at: '2025-03-26' },
  { id: 'l2', name: 'Anita Desai', phone: '9871234568', source: 'Referral', interested_course_id: 'c8', priority: 'hot', stage: 'discovery', current_challenge: 'Work-life balance as CEO', days_in_pipeline: 3, created_at: '2025-03-28' },
  { id: 'l3', name: 'Kiran Patel', phone: '9871234569', email: 'kiran.p@email.com', source: 'Website', interested_course_id: 'c6', priority: 'warm', stage: 'contacted', days_in_pipeline: 8, created_at: '2025-03-23' },
  { id: 'l4', name: 'Deepak Sharma', phone: '9871234570', source: 'Live Event', interested_course_id: 'c3', priority: 'warm', stage: 'new', days_in_pipeline: 1, created_at: '2025-03-30' },
  { id: 'l5', name: 'Sonal Jain', phone: '9871234571', email: 'sonal.j@email.com', source: 'Social Media', interested_course_id: 'c1', priority: 'cold', stage: 'new', days_in_pipeline: 2, created_at: '2025-03-29' },
  { id: 'l6', name: 'Manish Agarwal', phone: '9871234572', source: 'Referral', interested_course_id: 'c4', priority: 'hot', stage: 'negotiating', current_challenge: 'Team leadership gaps', days_in_pipeline: 12, created_at: '2025-03-19' },
  { id: 'l7', name: 'Rekha Iyer', phone: '9871234573', email: 'rekha.i@email.com', source: 'Website', interested_course_id: 'c5', priority: 'warm', stage: 'discovery', days_in_pipeline: 7, created_at: '2025-03-24' },
  { id: 'l8', name: 'Nitin Kulkarni', phone: '9871234574', source: 'Live Event', interested_course_id: 'c7', priority: 'hot', stage: 'contacted', current_challenge: 'Succession planning', days_in_pipeline: 4, created_at: '2025-03-27' },
  { id: 'l9', name: 'Swati Gaikwad', phone: '9871234575', source: 'Social Media', interested_course_id: 'c6', priority: 'cold', stage: 'new', days_in_pipeline: 1, created_at: '2025-03-30' },
  { id: 'l10', name: 'Ramesh Verma', phone: '9871234576', email: 'ramesh.v@email.com', source: 'LinkedIn', interested_course_id: 'c3', priority: 'warm', stage: 'proposal', days_in_pipeline: 15, created_at: '2025-03-16' },
  { id: 'l11', name: 'Prachi Deshpande', phone: '9871234577', source: 'Referral', interested_course_id: 'c4', priority: 'hot', stage: 'converted', days_in_pipeline: 20, created_at: '2025-03-11' },
  { id: 'l12', name: 'Gopal Krishnan', phone: '9871234578', source: 'Website', interested_course_id: 'c1', priority: 'cold', stage: 'lost', notes: 'Budget constraints', days_in_pipeline: 30, created_at: '2025-03-01' },
  { id: 'l13', name: 'Madhuri Thakur', phone: '9871234579', email: 'madhuri.t@email.com', source: 'Live Event', interested_course_id: 'c8', priority: 'hot', stage: 'negotiating', current_challenge: 'Spiritual awakening while managing empire', days_in_pipeline: 10, created_at: '2025-03-21' },
  { id: 'l14', name: 'Prakash Bhatt', phone: '9871234580', source: 'Social Media', interested_course_id: 'c2', priority: 'warm', stage: 'contacted', days_in_pipeline: 6, created_at: '2025-03-25' },
  { id: 'l15', name: 'Nandini Rao', phone: '9871234581', source: 'Referral', interested_course_id: 'c5', priority: 'warm', stage: 'discovery', current_challenge: 'Transitioning from corporate to coaching', days_in_pipeline: 9, created_at: '2025-03-22' },
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
  { id: 'p15', seeker_id: 's8', invoice_number: 'VDTS-INV-1015', amount: 5000, gst_amount: 900, total_amount: 5900, payment_date: '2025-03-15', method: 'upi', transaction_id: 'TXN015', status: 'received' },
];

export const MOTIVATIONAL_QUOTES = [
  { text: "The soul is neither born, and nor does it die.", author: "Bhagavad Gita" },
  { text: "You have the right to work, but never to the fruit of work.", author: "Bhagavad Gita" },
  { text: "Change is the law of the universe.", author: "Lord Krishna" },
  { text: "When you transform yourself, you transform the world around you.", author: "Vivek Doba" },
  { text: "Life's Golden Triangle is not a concept — it is your compass.", author: "Vivek Doba" },
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
    case 'green': return 'bg-dharma-green';
    case 'yellow': return 'bg-warning-amber';
    case 'red': return 'bg-destructive';
    default: return 'bg-muted';
  }
}

export function getTierBadgeClass(tier: string): string {
  switch (tier) {
    case 'standard': return 'bg-sky-blue text-primary-foreground';
    case 'premium': return 'gradient-sacred text-primary-foreground';
    case 'platinum': return 'bg-gradient-to-r from-gray-400 to-gray-200 text-foreground';
    case 'chakravartin': return 'shimmer-gold text-primary-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}
