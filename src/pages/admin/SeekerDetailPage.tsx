import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { SEEKERS, SESSIONS, ASSIGNMENTS, formatINR, formatDate, formatTime12, getHealthColor, getTierBadgeClass } from '@/data/mockData';
import {
  Phone, MessageSquare, Mail, Edit, Archive, Calendar, ClipboardList, TrendingUp,
  CreditCard, Flame, ArrowLeft, UserCheck, CalendarCheck, Eye, ChevronDown, ChevronUp,
  Lock, Star, Flag, Printer, X, Target, Heart, BookOpen, Sparkles, AlertTriangle, Award, Plus, Gift
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LGTAssessment, { LGT_SECTIONS, LGT_ZONES, PILLAR_COLORS, getZone, getPillarZone } from '@/components/LGTAssessment';
import { toast } from 'sonner';
import { usePayments } from '@/hooks/usePayments';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const ALL_TABS = ['Overview', 'Personal Info', 'Sessions', 'Assessments', 'Growth Matrix', 'Assignments', 'Daily Tracking', 'Payments', 'Goals & Vision', 'Private Notes 🔒', 'Timeline'];

// --- Mock extended data ---
const WHEEL_DATA_RAHUL = {
  initial: { career: 5, finance: 3, health: 6, family: 5, relationships: 4, growth: 5, fun: 2, environment: 5, spirituality: 7, service: 4 },
  month3: { career: 7, finance: 4, health: 8, family: 6, relationships: 5, growth: 7, fun: 3, environment: 7, spirituality: 9, service: 6 },
  self: { career: 5, finance: 3, health: 7, family: 8, relationships: 4, growth: 6, fun: 5, environment: 6, spirituality: 8, service: 5 },
};

const GROWTH_MATRIX_DATA = [
  { month: 'Month 1', personal: 5.0, professional: 5.5, spiritual: 5.0, relationships: 4.5, health: 5.0, overall: 45 },
  { month: 'Month 2', personal: 6.2, professional: 6.0, spiritual: 6.5, relationships: 5.2, health: 6.0, overall: 55 },
  { month: 'Month 3', personal: 7.5, professional: 6.8, spiritual: 8.2, relationships: 6.0, health: 7.0, overall: 72 },
];

const DAILY_TRACKING_RAHUL = Array.from({ length: 30 }, (_, i) => {
  const day = 30 - i;
  const date = new Date(2026, 2, day);
  if (day > 26) return { day, date: date.toISOString().split('T')[0], status: 'submitted' as const, completion: 80 + Math.floor(Math.random() * 15), mood: 6 + Math.floor(Math.random() * 4), energy: 5 + Math.floor(Math.random() * 4) };
  if (day > 20) return { day, date: date.toISOString().split('T')[0], status: (day % 3 === 0 ? 'missed' : 'submitted') as 'missed' | 'submitted', completion: day % 3 === 0 ? 0 : 70 + Math.floor(Math.random() * 20), mood: day % 3 === 0 ? 0 : 5 + Math.floor(Math.random() * 5), energy: day % 3 === 0 ? 0 : 5 + Math.floor(Math.random() * 4) };
  return { day, date: date.toISOString().split('T')[0], status: (Math.random() > 0.15 ? 'submitted' : 'missed') as 'submitted' | 'missed', completion: Math.random() > 0.15 ? 65 + Math.floor(Math.random() * 30) : 0, mood: Math.random() > 0.15 ? 5 + Math.floor(Math.random() * 5) : 0, energy: Math.random() > 0.15 ? 4 + Math.floor(Math.random() * 5) : 0 };
});

const PRIVATE_NOTES = {
  personality: "Rahul is highly driven but sometimes struggles with patience. Responds well to stories from Ramayana. Competitive nature — use it as motivation.",
  patterns: "Consistently engaged in first 60 minutes, energy drops after. Best sessions are morning slots. Homework completion is improving.",
  resistance: "Resists delegation — believes no one can do things as well as him. Gets defensive when discussing work-life balance. Avoids financial discussions.",
  breakthroughs: "Session 5: First time he admitted fear of failure. Session 7: Connected his father's work ethic to his own burnout pattern. Session 8: Set boundaries with a difficult client for the first time.",
  approach: "Use Mahabharata references — he connects deeply with Arjuna's dilemmas. Keep pushing on delegation gently. Next focus: Artha-Kama balance.",
};

const GOALS = {
  vision: "To become India's leading spiritual business coach, running a world-class ashram that transforms 1 million lives through ancient wisdom and modern leadership.",
  mantra: { en: "I am the architect of my destiny", mr: "मी माझ्या नशिबाचा शिल्पकार आहे" },
  why: "To break free from limiting beliefs, build a legacy business, and achieve soul satisfaction through balanced living.",
  yearly: [
    { text: 'Achieve ₹1 Cr revenue', deadline: '31/12/2026', status: 'in_progress', note: 'On track — Q1 was ₹28L' },
    { text: 'Read 24 books', deadline: '31/12/2026', status: 'in_progress', note: 'Already 8 done! Great pace' },
    { text: 'Complete LGT program', deadline: '15/07/2026', status: 'in_progress', note: '' },
    { text: 'Build team of 10', deadline: '31/12/2026', status: 'not_started', note: "Let's discuss strategy in next session" },
  ],
  quarterly: [
    { text: 'Run first public workshop', deadline: '30/06/2026', status: 'in_progress', note: '' },
    { text: 'Hire 2 team members', deadline: '30/06/2026', status: 'not_started', note: '' },
  ],
  monthly: [
    { text: 'Complete Module 4 assignments', deadline: '30/04/2026', status: 'not_started', note: '' },
    { text: 'Maintain 30-day meditation streak', deadline: '30/04/2026', status: 'in_progress', note: '' },
  ],
};

const ONBOARDING = [
  { text: 'Welcome message sent', done: true, date: '15/09/2024' },
  { text: 'Intro call completed', done: true, date: '16/09/2024' },
  { text: 'App access provided', done: true, date: '16/09/2024' },
  { text: 'Course orientation done', done: true, date: '18/09/2024' },
  { text: 'Initial SWOT completed', done: true, date: '20/09/2024' },
  { text: 'Initial Wheel of Life done', done: true, date: '20/09/2024' },
  { text: 'Goals discussed', done: true, date: '22/09/2024' },
  { text: 'First session scheduled', done: false },
  { text: 'Resources shared', done: false },
  { text: 'Accountability agreement signed', done: false },
];

// Mock LGT scores for Rahul (28 questions, 1-5 each)
const LGT_SCORES_RAHUL = [4, 3, 3, 2, 4, 3, 4, 3, 2, 4, 3, 2, 3, 4, 3, 2, 2, 4, 3, 3, 2, 3, 2, 3, 2, 3, 3, 2];

const TIMELINE_ENTRIES = [
  { icon: '🌅', text: 'Daily log submitted — Completion: 92%, Mood: 8/10', time: '2 hours ago', color: 'bg-dharma-green', type: 'daily_log' },
  { icon: '📅', text: 'Session #8 completed — Leadership Principles, Engagement: 8/10', time: '2 days ago', color: 'bg-chakra-indigo', type: 'session' },
  { icon: '📝', text: 'Assignment submitted: Morning Routine Design', time: '3 days ago', color: 'bg-saffron', type: 'assignment' },
  { icon: '💰', text: 'Payment ₹41,667 received (EMI 3 of 6) — UPI', time: '5 days ago', color: 'bg-dharma-green', type: 'payment' },
  { icon: '📊', text: 'Wheel of Life assessment — Overall: 6.2/10', time: '1 week ago', color: 'bg-wisdom-purple', type: 'assessment' },
  { icon: '🏆', text: 'Achievement earned: 7-Day Streak! 🔥', time: '10 days ago', color: 'bg-primary', type: 'achievement' },
  { icon: '🎯', text: 'Goal marked in progress: Read 24 books', time: '2 weeks ago', color: 'bg-sky-blue', type: 'goal' },
  { icon: '📅', text: 'Session #7 completed — Goal Setting, Engagement: 6/10', time: '2 weeks ago', color: 'bg-chakra-indigo', type: 'session' },
  { icon: '💬', text: 'Message sent: Shared assignment clarification', time: '2 weeks ago', color: 'bg-sky-blue', type: 'message' },
  { icon: '🌅', text: 'Daily log submitted — Completion: 85%, Mood: 7/10', time: '15 days ago', color: 'bg-dharma-green', type: 'daily_log' },
  { icon: '📝', text: 'Assignment reviewed: SWOT Analysis — Score: 90/100', time: '3 weeks ago', color: 'bg-saffron', type: 'assignment' },
  { icon: '📊', text: 'Growth Matrix Month 2 recorded — Overall: 55%', time: '1 month ago', color: 'bg-wisdom-purple', type: 'assessment' },
  { icon: '💰', text: 'Payment ₹41,667 received (EMI 2 of 6)', time: '1 month ago', color: 'bg-dharma-green', type: 'payment' },
];

const moodEmoji = (score?: number) => {
  if (!score) return '—';
  if (score >= 9) return '😊';
  if (score >= 7) return '🙂';
  if (score >= 5) return '😐';
  if (score >= 3) return '😔';
  return '😰';
};

const statusGoalBadge = (s: string) => {
  if (s === 'achieved') return 'bg-dharma-green/10 text-dharma-green';
  if (s === 'in_progress') return 'bg-warning-amber/10 text-warning-amber';
  return 'bg-destructive/10 text-destructive';
};

const SeekerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
  const [sessionFilter, setSessionFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [showInvoice, setShowInvoice] = useState<string | null>(null);
  const [wheelModal, setWheelModal] = useState(false);
  const [lgtModal, setLgtModal] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [rpAmount, setRpAmount] = useState('');
  const [rpMethod, setRpMethod] = useState('upi');
  const [rpTransactionId, setRpTransactionId] = useState('');
  const [rpDate, setRpDate] = useState(new Date().toISOString().split('T')[0]);
  const { payments: seekerPayments, createPayment } = usePayments(id);

  // Badge state
  const [awardBadgeOpen, setAwardBadgeOpen] = useState(false);
  const [badgeDefinitions, setBadgeDefinitions] = useState<any[]>([]);
  const [seekerBadges, setSeekerBadges] = useState<any[]>([]);
  const [selectedBadgeId, setSelectedBadgeId] = useState('');
  const [customEmoji, setCustomEmoji] = useState('🏆');
  const [customBadgeName, setCustomBadgeName] = useState('');
  const [badgeNotes, setBadgeNotes] = useState('');
  const [isCustomBadge, setIsCustomBadge] = useState(false);
  const [badgeAwarding, setBadgeAwarding] = useState(false);

  // Fetch badge definitions and seeker's earned badges
  const loadBadges = useCallback(async () => {
    const [{ data: defs }, { data: earned }] = await Promise.all([
      supabase.from('badge_definitions').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('seeker_badges').select('*').eq('seeker_id', id || ''),
    ]);
    if (defs) setBadgeDefinitions(defs);
    if (earned && defs) {
      const defMap = new Map(defs.map((d: any) => [d.id, d]));
      setSeekerBadges(earned.map((b: any) => ({ ...b, badge: defMap.get(b.badge_id) })).filter((b: any) => b.badge));
    }
  }, [id]);

  useEffect(() => { loadBadges(); }, [loadBadges]);

  const handleAwardBadge = async () => {
    if (!id) return;
    setBadgeAwarding(true);
    try {
      if (isCustomBadge) {
        // Create custom badge definition first
        const { data: newDef, error: defErr } = await supabase.from('badge_definitions').insert({
          badge_key: `custom_${Date.now()}`,
          emoji: customEmoji,
          name: customBadgeName,
          description: badgeNotes || `Custom badge awarded by coach`,
          category: 'custom',
          condition_type: 'manual',
          condition_threshold: 0,
          condition_streak_days: 0,
          sort_order: 999,
        }).select('id').single();
        if (defErr) throw defErr;
        await supabase.from('seeker_badges').insert({
          seeker_id: id,
          badge_id: newDef.id,
          awarded_by: 'coach',
          notes: badgeNotes || null,
        });
      } else {
        if (!selectedBadgeId) { toast.error('Select a badge'); setBadgeAwarding(false); return; }
        // Check not already earned
        const existing = seekerBadges.find(b => b.badge_id === selectedBadgeId);
        if (existing) { toast.error('Seeker already has this badge'); setBadgeAwarding(false); return; }
        await supabase.from('seeker_badges').insert({
          seeker_id: id,
          badge_id: selectedBadgeId,
          awarded_by: 'coach',
          notes: badgeNotes || null,
        });
      }
      toast.success('🏅 Badge awarded successfully!');
      setAwardBadgeOpen(false);
      setSelectedBadgeId('');
      setCustomBadgeName('');
      setBadgeNotes('');
      setIsCustomBadge(false);
      await loadBadges();
    } catch (err: any) {
      toast.error(err.message || 'Failed to award badge');
    }
    setBadgeAwarding(false);
  };

  const seeker = SEEKERS.find((s) => s.id === id);
  if (!seeker) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-5xl mb-4">🧘</span>
        <h2 className="text-xl font-bold text-foreground mb-2">Seeker Not Found</h2>
        <p className="text-muted-foreground mb-4">This seeker profile doesn't exist.</p>
        <Link to="/seekers" className="text-primary hover:underline">← Back to Seekers</Link>
      </div>
    );
  }

  const seekerSessions = SESSIONS.filter((s) => s.seeker_id === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const seekerAssignments = ASSIGNMENTS.filter((a) => a.seeker_id === id);
  const daysSinceJoin = Math.floor((Date.now() - new Date(seeker.created_at).getTime()) / 86400000);
  const totalCourseFee = seeker.course?.price || 0;
  const totalPaid = seekerPayments.filter(p => p.status === 'received').reduce((s, p) => s + Number(p.total_amount), 0);
  const balance = totalCourseFee - totalPaid;

  const filteredSessions = seekerSessions.filter(s => sessionFilter === 'all' || s.status === sessionFilter);
  const filteredAssignments = seekerAssignments.filter(a => {
    if (assignmentFilter === 'all') return true;
    if (assignmentFilter === 'pending') return ['assigned', 'in_progress'].includes(a.status);
    return a.status === assignmentFilter;
  });
  const filteredTimeline = TIMELINE_ENTRIES.filter(e => timelineFilter === 'all' || e.type === timelineFilter);

  // Wheel of Life chart data
  const wheelDimensions = ['Career', 'Finance', 'Health', 'Family', 'Relationships', 'Growth', 'Fun', 'Environment', 'Spirituality', 'Service'];
  const wheelKeys = ['career', 'finance', 'health', 'family', 'relationships', 'growth', 'fun', 'environment', 'spirituality', 'service'] as const;
  const wheelChartData = wheelDimensions.map((dim, i) => ({
    dimension: dim,
    coach: WHEEL_DATA_RAHUL.month3[wheelKeys[i]],
    self: WHEEL_DATA_RAHUL.self[wheelKeys[i]],
  }));
  const wheelOverall = Object.values(WHEEL_DATA_RAHUL.month3).reduce((a, b) => a + b, 0) / 10;

  const invoicePayment = seekerPayments.find(p => p.id === showInvoice);

  const resetRecordPaymentForm = () => {
    setRpAmount('');
    setRpMethod('upi');
    setRpTransactionId('');
    setRpDate(new Date().toISOString().split('T')[0]);
  };

  const handleRecordPayment = async () => {
    if (!rpAmount || !rpDate) {
      toast.error('Please fill Amount and Date');
      return;
    }

    const amount = parseFloat(rpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    const gst = Math.round(amount * 0.18);
    const total = amount + gst;

    try {
      await createPayment.mutateAsync({
        seeker_id: seeker.id,
        amount,
        gst_amount: gst,
        total_amount: total,
        payment_date: rpDate,
        method: rpMethod,
        transaction_id: rpTransactionId || undefined,
      });
      toast.success(`Payment of ${formatINR(total)} recorded for ${seeker.full_name}`);
      setRecordPaymentOpen(false);
      resetRecordPaymentForm();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save payment');
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <Link to="/seekers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Seekers
      </Link>

      {/* ===== HEADER ===== */}
      <div className="bg-card rounded-2xl p-6 shadow-md border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground flex-shrink-0 ring-4 ring-primary/30 ${
              seeker.enrollment?.tier === 'chakravartin' ? 'shimmer-gold' :
              seeker.enrollment?.tier === 'platinum' ? 'bg-gradient-to-br from-gray-400 to-gray-200 text-foreground' :
              seeker.enrollment?.tier === 'premium' ? 'gradient-sacred' : 'gradient-chakravartin'
            }`}>
              {seeker.full_name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{seeker.full_name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTierBadgeClass(seeker.enrollment?.tier || '')}`}>
                  {seeker.enrollment?.tier === 'chakravartin' ? '✦ Chakravartin' : seeker.enrollment?.tier?.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{seeker.course?.name}</p>
              <p className="text-xs text-muted-foreground">{seeker.city}, {seeker.state}</p>
            </div>
          </div>

          {/* Center info */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              seeker.enrollment?.status === 'active' ? 'bg-dharma-green/10 text-dharma-green' :
              seeker.enrollment?.status === 'paused' ? 'bg-warning-amber/10 text-warning-amber' :
              seeker.enrollment?.status === 'completed' ? 'bg-sky-blue/10 text-sky-blue' :
              'bg-muted text-muted-foreground'
            }`}>● {seeker.enrollment?.status}</span>
            <div className={`w-3 h-3 rounded-full ${getHealthColor(seeker.health)}`} title={`Health: ${seeker.health}`} />
            <span className="text-xs text-muted-foreground">Day {daysSinceJoin} · Joined {formatDate(seeker.created_at)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <a href={`tel:+91${seeker.phone}`} className="p-2.5 rounded-xl bg-sky-blue/10 text-sky-blue hover:bg-sky-blue/20 transition-colors" title="Call"><Phone className="w-4 h-4" /></a>
            <a href={`https://wa.me/91${seeker.phone}`} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-dharma-green/10 text-dharma-green hover:bg-dharma-green/20 transition-colors" title="WhatsApp"><MessageSquare className="w-4 h-4" /></a>
            <a href={`mailto:${seeker.email}`} className="p-2.5 rounded-xl bg-chakra-indigo/10 text-chakra-indigo hover:bg-chakra-indigo/20 transition-colors" title="Email"><Mail className="w-4 h-4" /></a>
            <button onClick={() => { setActiveTab(1); setEditMode(true); }} className="p-2.5 rounded-xl border border-primary text-primary hover:bg-primary/5 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
            <button className="p-2.5 rounded-xl border border-destructive text-destructive hover:bg-destructive/5 transition-colors" title="Archive"><Archive className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="flex gap-1 border-b border-border overflow-x-auto pb-px scrollbar-hide">
        {ALL_TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === i ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}>{tab}</button>
        ))}
      </div>

      {/* ===== TAB 0: OVERVIEW ===== */}
      {activeTab === 0 && (
        <div className="space-y-6 stagger-children">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Sessions', value: `${seeker.sessions_completed} / ${seeker.total_sessions}`, icon: CalendarCheck, color: 'text-chakra-indigo', pct: Math.round(seeker.sessions_completed / seeker.total_sessions * 100) },
              { label: 'Attendance', value: '87%', icon: UserCheck, color: 'text-dharma-green' },
              { label: 'Growth Score', value: `${seeker.growth_score}%`, icon: TrendingUp, color: 'text-saffron', trend: '↑8%' },
              { label: 'Streak', value: `${seeker.streak} days 🔥`, icon: Flame, color: 'text-warning-amber' },
              { label: 'Assignments', value: `${seekerAssignments.filter(a => a.status === 'reviewed').length} / ${seekerAssignments.length}`, icon: ClipboardList, color: 'text-wisdom-purple' },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl p-4 shadow-sm border border-border text-center card-hover">
                <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                {stat.trend && <span className="text-xs text-dharma-green font-medium">{stat.trend}</span>}
                {stat.pct !== undefined && (
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2"><div className="bg-chakra-indigo rounded-full h-1.5 transition-all" style={{ width: `${stat.pct}%` }} /></div>
                )}
              </div>
            ))}
          </div>

          {/* Badges & Achievements */}
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" /> Badges & Achievements
                {seekerBadges.length > 0 && (
                  <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{seekerBadges.length}</span>
                )}
              </h3>
              <Button size="sm" variant="outline" onClick={() => setAwardBadgeOpen(true)} className="gap-1">
                <Gift className="w-3.5 h-3.5" /> Award Badge
              </Button>
            </div>
            {seekerBadges.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {seekerBadges.map((b: any) => (
                  <div key={b.id} className="text-center p-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors" title={b.badge?.description}>
                    <span className="text-3xl block">{b.badge?.emoji}</span>
                    <p className="text-[11px] font-bold text-foreground mt-1 truncate">{b.badge?.name}</p>
                    <p className="text-[9px] text-muted-foreground">{format(new Date(b.earned_at), 'dd MMM yyyy')}</p>
                    <p className="text-[9px] text-muted-foreground capitalize">{b.awarded_by}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No badges earned yet. Award one to motivate this seeker! 🌟</p>
            )}
          </div>

          {/* Next Session */}
          <div className="bg-card rounded-xl p-5 shadow-sm border-2 border-primary/20">
            <h3 className="font-semibold text-foreground mb-2">Next Session</h3>
            <p className="text-sm text-muted-foreground">Session #{seeker.sessions_completed + 1} — {seeker.course?.name} — Scheduled</p>
            <button className="mt-3 px-4 py-2 rounded-xl gradient-chakravartin text-primary-foreground text-sm font-medium hover:opacity-90">Prepare for Session</button>
          </div>

          {/* Onboarding */}
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Seeker Onboarding Progress</h3>
              <span className="text-xs text-muted-foreground">{ONBOARDING.filter(o => o.done).length} of {ONBOARDING.length} ({Math.round(ONBOARDING.filter(o => o.done).length / ONBOARDING.length * 100)}%)</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-4"><div className="bg-primary rounded-full h-2" style={{ width: `${ONBOARDING.filter(o => o.done).length / ONBOARDING.length * 100}%` }} /></div>
            <div className="grid md:grid-cols-2 gap-2">
              {ONBOARDING.map((item, i) => (
                <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={item.done} readOnly className="rounded border-primary text-primary" />
                  <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.text}</span>
                  {item.date && <span className="text-xs text-muted-foreground ml-auto">{item.date}</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-2.5 top-0 bottom-0 w-px bg-border" />
              {TIMELINE_ENTRIES.slice(0, 6).map((entry, i) => (
                <div key={i} className="relative flex items-start gap-3">
                  <div className={`absolute -left-3.5 w-3 h-3 rounded-full ${entry.color} ring-2 ring-card`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{entry.icon} {entry.text}</p>
                    <p className="text-xs text-muted-foreground">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB 1: PERSONAL INFO ===== */}
      {activeTab === 1 && (
        <div className="space-y-6">
          <div className="flex justify-end">
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="px-4 py-2 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/5">✏️ Edit Profile</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">💾 Save Changes</button>
                <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium">Cancel</button>
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal */}
            <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
              <h3 className="font-semibold text-foreground mb-4">Personal Details</h3>
              <div className="space-y-3">
                {[
                  ['Full Name', seeker.full_name], ['Email', seeker.email], ['Phone', seeker.phone],
                  ['WhatsApp', seeker.whatsapp || seeker.phone], ['Date of Birth', seeker.dob || '15/05/1985'],
                  ['Gender', seeker.gender || 'Male'], ['City', seeker.city], ['State', seeker.state || ''],
                  ['Pincode', seeker.pincode || '411001'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    {editMode ? (
                      <input defaultValue={value} className="text-sm text-foreground font-medium bg-background border border-input rounded-lg px-2 py-1 w-48 text-right" />
                    ) : (
                      <span className="text-sm text-foreground font-medium">{value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Professional */}
            <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
              <h3 className="font-semibold text-foreground mb-4">Professional Details</h3>
              <div className="space-y-3">
                {[
                  ['Occupation', seeker.occupation || ''], ['Designation', seeker.designation || 'Founder & CEO'],
                  ['Company', seeker.company || ''], ['Industry', seeker.industry || 'Manufacturing'],
                  ['Experience', `${seeker.experience_years || 12} years`], ['Revenue Range', seeker.revenue_range || ''],
                  ['Team Size', `${seeker.team_size || 25}`], ['LinkedIn', seeker.linkedin_url || 'linkedin.com/in/rahulpatil'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    {editMode ? (
                      <input defaultValue={value} className="text-sm text-foreground font-medium bg-background border border-input rounded-lg px-2 py-1 w-48 text-right" />
                    ) : (
                      <span className="text-sm text-foreground font-medium">{value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Enrollment */}
            <div className="bg-card rounded-xl p-5 shadow-sm border border-border md:col-span-2">
              <h3 className="font-semibold text-foreground mb-4">Enrollment Details</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  ['Course', seeker.course?.name || ''], ['Tier', seeker.enrollment?.tier || ''],
                  ['Start Date', formatDate(seeker.enrollment?.start_date || '')],
                  ['Payment Status', seeker.enrollment?.payment_status || ''],
                  ['Referral Source', 'Live Event'], ['Referred By', 'N/A'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm text-foreground font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB 2: SESSIONS ===== */}
      {activeTab === 2 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {[{ key: 'all', label: 'All' }, { key: 'completed', label: 'Completed ✅' }, { key: 'scheduled', label: 'Upcoming 📅' }, { key: 'cancelled', label: 'Cancelled ❌' }].map(f => (
                <button key={f.key} onClick={() => setSessionFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sessionFilter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{f.label}</button>
              ))}
            </div>
            <button className="px-4 py-2 rounded-xl gradient-chakravartin text-primary-foreground text-sm font-medium">📅 Schedule Next Session</button>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Session #</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Topic</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Mood</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Engagement</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {filteredSessions.map((s) => (
                  <>
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="p-3 text-foreground">{formatDate(s.date)}</td>
                      <td className="p-3 text-foreground font-medium">Session {s.session_number}</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{s.topics_covered?.join(', ') || '—'}</td>
                      <td className="p-3 hidden sm:table-cell">{moodEmoji(s.engagement_score)}</td>
                      <td className="p-3 hidden sm:table-cell">
                        {s.engagement_score ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2"><div className={`h-2 rounded-full ${s.engagement_score >= 7 ? 'bg-dharma-green' : s.engagement_score >= 4 ? 'bg-warning-amber' : 'bg-destructive'}`} style={{ width: `${s.engagement_score * 10}%` }} /></div>
                            <span className="text-xs">{s.engagement_score}/10</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${s.status === 'completed' ? 'bg-dharma-green/10 text-dharma-green' : s.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : 'bg-sky-blue/10 text-sky-blue'}`}>{s.status === 'completed' ? '✅' : s.status === 'scheduled' ? '🔵' : '❌'} {s.status}</span></td>
                      <td className="p-3">
                        {s.status === 'completed' && (
                          <button onClick={() => setExpandedSession(expandedSession === s.id ? null : s.id)} className="text-xs text-primary hover:underline flex items-center gap-1">
                            👁️ Notes {expandedSession === s.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedSession === s.id && (
                      <tr key={`${s.id}-detail`}><td colSpan={7} className="p-4 bg-muted/10">
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div><span className="font-medium text-foreground">Topics:</span> <span className="text-muted-foreground">{s.topics_covered?.map(t => <span key={t} className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs mr-1">{t}</span>) || 'Not recorded'}</span></div>
                          <div><span className="font-medium text-foreground">Key Insights:</span> <span className="text-muted-foreground">{s.key_insights || 'Not recorded'}</span></div>
                          <div><span className="font-medium text-foreground">Attendance:</span> <span className="text-muted-foreground capitalize">{s.attendance || '—'}</span></div>
                          <div className="flex items-center gap-1 text-muted-foreground italic"><Lock className="w-3 h-3" /> Coach's private notes available</div>
                        </div>
                        <button onClick={() => setExpandedSession(null)} className="mt-3 text-xs text-muted-foreground hover:text-foreground">Collapse ↑</button>
                      </td></tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== TAB 3: ASSESSMENTS ===== */}
      {activeTab === 3 && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* SWOT */}
            <div className="bg-card rounded-xl p-5 shadow-sm border-l-4 border-l-dharma-green border border-border card-hover">
              <div className="flex items-center gap-2 mb-2"><span className="w-8 h-8 rounded-full bg-dharma-green/10 flex items-center justify-center text-sm">📋</span><h4 className="font-semibold text-foreground">SWOT Analysis</h4></div>
              <p className="text-xs text-muted-foreground mb-1">Strengths: 5 | Weaknesses: 3</p>
              <p className="text-xs text-muted-foreground mb-3">Last assessed: 15/02/2026</p>
              <div className="flex gap-2"><button className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">View</button><button className="text-xs px-3 py-1.5 rounded-lg gradient-chakravartin text-primary-foreground">New Assessment</button></div>
            </div>
            {/* Wheel of Life */}
            <div className="bg-card rounded-xl p-5 shadow-sm border-l-4 border-l-primary border border-border card-hover md:row-span-1">
              <div className="flex items-center gap-2 mb-2"><span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">⭐</span><h4 className="font-semibold text-foreground">Wheel of Life</h4></div>
              <div className="h-32 mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={wheelChartData}><PolarGrid stroke="hsl(var(--border))" /><PolarAngleAxis dataKey="dimension" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} /><Radar dataKey="coach" stroke="#B8860B" fill="#B8860B" fillOpacity={0.2} /></RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-lg font-bold text-foreground">Overall: {wheelOverall.toFixed(1)} / 10 <span className="text-xs text-dharma-green">↑0.8</span></p>
              <p className="text-xs text-destructive">Focus: Fun (3), Finance (4), Health (5)</p>
              <p className="text-xs text-muted-foreground mb-3">Last assessed: 01/03/2026</p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setWheelModal(true)} className="text-xs px-3 py-1.5 rounded-lg gradient-chakravartin text-primary-foreground">View Full Wheel</button>
                <button className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">Compare</button>
              </div>
            </div>
            {/* LGT */}
            <div className="bg-card rounded-xl p-5 shadow-sm border-l-4 border-l-saffron border border-border card-hover">
              <div className="flex items-center gap-2 mb-2"><span className="w-8 h-8 rounded-full bg-saffron/10 flex items-center justify-center text-sm">🔺</span><h4 className="font-semibold text-foreground">Life's Golden Triangle</h4></div>
              {(() => {
                const lgtSectionScores: Record<string, number> = {};
                LGT_SECTIONS.forEach((sec, si) => { lgtSectionScores[sec.key] = LGT_SCORES_RAHUL.slice(si * 7, si * 7 + 7).reduce((a, b) => a + b, 0); });
                const lgtTotal = Object.values(lgtSectionScores).reduce((a, b) => a + b, 0);
                const lgtZone = getZone(lgtTotal);
                const balance = Math.round(100 - (Math.max(...Object.values(lgtSectionScores)) - Math.min(...Object.values(lgtSectionScores))) / 35 * 100);
                return (
                  <>
                    <p className="text-lg font-bold text-foreground mb-1">{lgtTotal}/140 <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: lgtZone.color }}>{lgtZone.rank}</span></p>
                    <p className="text-xs text-muted-foreground">D: {lgtSectionScores.dharma} | K: {lgtSectionScores.kama} | A: {lgtSectionScores.artha} | S: {lgtSectionScores.soul}</p>
                    <p className="text-xs text-muted-foreground mb-3">Balance: {balance}% · Zone: {lgtZone.name}</p>
                  </>
                );
              })()}
              <div className="flex gap-2"><button onClick={() => setLgtModal(true)} className="text-xs px-3 py-1.5 rounded-lg gradient-chakravartin text-primary-foreground">View Full LGT</button><button className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">New Assessment</button></div>
            </div>
            {/* Purusharthas */}
            <div className="bg-card rounded-xl p-5 shadow-sm border-l-4 border-l-wisdom-purple border border-border card-hover">
              <div className="flex items-center gap-2 mb-2"><span className="w-8 h-8 rounded-full bg-wisdom-purple/10 flex items-center justify-center text-sm">🕉️</span><h4 className="font-semibold text-foreground">Purusharthas (DAKM)</h4></div>
              <div className="flex gap-1 mb-2">{['bg-saffron', 'bg-primary', 'bg-lotus-pink', 'bg-wisdom-purple'].map(c => <div key={c} className={`h-2 flex-1 rounded-full ${c}`} />)}</div>
              <p className="text-xs text-foreground">Dominant: Dharma (8/10)</p>
              <p className="text-xs text-destructive mb-3">Neglected: Kama (4/10)</p>
              <div className="flex gap-2"><button className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">View</button><button className="text-xs px-3 py-1.5 rounded-lg gradient-chakravartin text-primary-foreground">New</button></div>
            </div>
            {/* Happiness */}
            <div className="bg-card rounded-xl p-5 shadow-sm border-l-4 border-l-dharma-green border border-border card-hover">
              <div className="flex items-center gap-2 mb-2"><span className="w-8 h-8 rounded-full bg-dharma-green/10 flex items-center justify-center text-lg">😊</span><h4 className="font-semibold text-foreground">Real Happiness</h4></div>
              <p className="text-lg font-bold text-foreground mb-1">7.2 / 10 <span className="text-xs text-dharma-green">↑0.5</span></p>
              <p className="text-xs text-muted-foreground mb-3">Last assessed: 01/03/2026</p>
              <div className="flex gap-2"><button className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">View</button><button className="text-xs px-3 py-1.5 rounded-lg gradient-chakravartin text-primary-foreground">New</button></div>
            </div>
            {/* MOOCH */}
            <div className="bg-card rounded-xl p-5 shadow-sm border-l-4 border-l-chakra-indigo border border-border card-hover">
              <div className="flex items-center gap-2 mb-2"><span className="w-8 h-8 rounded-full bg-chakra-indigo/10 flex items-center justify-center text-sm">🧠</span><h4 className="font-semibold text-foreground">MOOCH (मूच्छ)</h4></div>
              <p className="text-xs text-foreground">Patterns: 5 identified</p>
              <p className="text-xs text-foreground">Awareness: 6.5 / 10</p>
              <p className="text-xs text-muted-foreground mb-3">2 transformed, 3 in progress</p>
              <div className="flex gap-2"><button className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted">View</button><button className="text-xs px-3 py-1.5 rounded-lg gradient-chakravartin text-primary-foreground">New</button></div>
            </div>
          </div>

          {/* Wheel of Life Modal */}
          <Dialog open={wheelModal} onOpenChange={setWheelModal}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-xl">⭐ Wheel of Life — {seeker.full_name}</DialogTitle></DialogHeader>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={wheelChartData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Radar name="Coach Assessment" dataKey="coach" stroke="#B8860B" fill="#B8860B" fillOpacity={0.25} />
                    <Radar name="Self Assessment" dataKey="self" stroke="#3F51B5" fill="#3F51B5" fillOpacity={0.15} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">
                    <th className="text-left p-2 font-medium text-muted-foreground">Dimension</th>
                    <th className="text-center p-2 font-medium text-muted-foreground">Coach</th>
                    <th className="text-center p-2 font-medium text-muted-foreground">Self</th>
                    <th className="text-center p-2 font-medium text-muted-foreground">Gap</th>
                    <th className="text-center p-2 font-medium text-muted-foreground">Priority</th>
                  </tr></thead>
                  <tbody>
                    {wheelChartData.sort((a, b) => Math.abs(b.coach - b.self) - Math.abs(a.coach - a.self)).map(d => {
                      const gap = Math.abs(d.coach - d.self);
                      return (
                        <tr key={d.dimension} className="border-b border-border">
                          <td className="p-2 text-foreground">{d.dimension}</td>
                          <td className="p-2 text-center font-medium">{d.coach}</td>
                          <td className="p-2 text-center font-medium">{d.self}</td>
                          <td className="p-2 text-center"><span className={gap >= 3 ? 'text-destructive' : gap >= 2 ? 'text-warning-amber' : 'text-dharma-green'}>{gap >= 2 && '⚠️ '}{gap}</span></td>
                          <td className="p-2 text-center"><span className={`text-xs px-2 py-0.5 rounded-full ${d.coach <= 4 ? 'bg-destructive/10 text-destructive' : d.coach <= 6 ? 'bg-warning-amber/10 text-warning-amber' : 'bg-dharma-green/10 text-dharma-green'}`}>{d.coach <= 4 ? '🔴 High' : d.coach <= 6 ? 'Medium' : 'Low'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="p-3 rounded-xl bg-dharma-green/5 border border-dharma-green/20">
                  <h4 className="text-sm font-semibold text-dharma-green mb-1">Top Strengths</h4>
                  <p className="text-xs text-foreground">Spirituality (9), Health (8), Career (7)</p>
                </div>
                <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                  <h4 className="text-sm font-semibold text-destructive mb-1">Focus Areas</h4>
                  <p className="text-xs text-foreground">Fun (3), Finance (4), Relationships (5)</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-center mt-4">Overall: <span className="text-primary">{wheelOverall.toFixed(1)}</span> / 10</p>
            </DialogContent>
          </Dialog>

          {/* LGT Modal */}
          <Dialog open={lgtModal} onOpenChange={setLgtModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-xl">🔺 Life's Golden Triangle — {seeker.full_name}</DialogTitle></DialogHeader>
              <LGTAssessment
                onClose={() => setLgtModal(false)}
                readOnly={true}
                initialScores={LGT_SCORES_RAHUL}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ===== TAB 4: GROWTH MATRIX ===== */}
      {activeTab === 4 && (
        <div className="space-y-6">
          <div className="flex justify-end"><button className="px-4 py-2 rounded-xl gradient-chakravartin text-primary-foreground text-sm font-medium">📊 Record New Month</button></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
              <h3 className="font-semibold text-foreground mb-3">Overall Growth Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={GROWTH_MATRIX_DATA}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis domain={[0, 100]} /><Tooltip /><Line type="monotone" dataKey="overall" stroke="#B8860B" strokeWidth={3} dot={{ fill: '#B8860B', r: 5 }} /></LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
              <h3 className="font-semibold text-foreground mb-3">Category Breakdown (Month 3)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={[
                  { cat: 'Personal', score: 7.5 }, { cat: 'Professional', score: 6.8 },
                  { cat: 'Spiritual', score: 8.2 }, { cat: 'Relationships', score: 6.0 }, { cat: 'Health', score: 7.0 },
                ]}><PolarGrid stroke="hsl(var(--border))" /><PolarAngleAxis dataKey="cat" tick={{ fontSize: 11 }} /><Radar dataKey="score" stroke="#B8860B" fill="#B8860B" fillOpacity={0.25} /></RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-dharma-green/5 border border-dharma-green/20"><h4 className="font-semibold text-dharma-green">🌟 Best Growth In</h4><p className="text-sm text-foreground">Spiritual Wellbeing (+3.2 since Month 1)</p></div>
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20"><h4 className="font-semibold text-destructive">⚠️ Needs Work In</h4><p className="text-sm text-foreground">Relationships (6.0 — lowest area)</p></div>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                {GROWTH_MATRIX_DATA.map(m => <th key={m.month} className="text-center p-3 font-medium text-muted-foreground">{m.month}</th>)}
                <th className="text-center p-3 font-medium text-muted-foreground">Change</th>
              </tr></thead>
              <tbody>
                {(['personal', 'professional', 'spiritual', 'relationships', 'health'] as const).map(cat => (
                  <tr key={cat} className="border-b border-border">
                    <td className="p-3 text-foreground font-medium capitalize">{cat}</td>
                    {GROWTH_MATRIX_DATA.map(m => <td key={m.month} className="p-3 text-center">{m[cat]}</td>)}
                    <td className="p-3 text-center text-dharma-green font-medium">↑ +{(GROWTH_MATRIX_DATA[2][cat] - GROWTH_MATRIX_DATA[0][cat]).toFixed(1)}</td>
                  </tr>
                ))}
                <tr className="bg-muted/20 font-bold">
                  <td className="p-3 text-foreground">Overall</td>
                  {GROWTH_MATRIX_DATA.map(m => <td key={m.month} className="p-3 text-center">{m.overall}%</td>)}
                  <td className="p-3 text-center text-dharma-green">↑ +{GROWTH_MATRIX_DATA[2].overall - GROWTH_MATRIX_DATA[0].overall}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== TAB 5: ASSIGNMENTS ===== */}
      {activeTab === 5 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {[{ key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'submitted', label: 'Submitted' }, { key: 'overdue', label: 'Overdue ⚠️' }, { key: 'reviewed', label: 'Reviewed ✅' }].map(f => (
                <button key={f.key} onClick={() => setAssignmentFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${assignmentFilter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{f.label}</button>
              ))}
            </div>
            <button className="px-4 py-2 rounded-xl gradient-chakravartin text-primary-foreground text-sm font-medium">📝 Give New Assignment</button>
          </div>
          <div className="space-y-3">
            {filteredAssignments.map((a) => (
              <div key={a.id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden card-hover">
                <div className="p-4 cursor-pointer" onClick={() => setExpandedAssignment(expandedAssignment === a.id ? null : a.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">{a.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                      a.status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                      a.status === 'reviewed' ? 'bg-dharma-green/10 text-dharma-green' :
                      a.status === 'submitted' ? 'bg-wisdom-purple/10 text-wisdom-purple' :
                      a.status === 'in_progress' ? 'bg-warning-amber/10 text-warning-amber' :
                      'bg-sky-blue/10 text-sky-blue'
                    }`}>{a.status === 'overdue' ? '🔴' : a.status === 'reviewed' ? '✅' : a.status === 'submitted' ? '🟣' : a.status === 'in_progress' ? '🟠' : '🔵'} {a.status}</span>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs flex-wrap">
                    <span className={`${new Date(a.due_date) < new Date() && a.status !== 'reviewed' ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      {new Date(a.due_date) < new Date() && a.status !== 'reviewed' ? `⚠️ ${Math.floor((Date.now() - new Date(a.due_date).getTime()) / 86400000)} days overdue` : `Due: ${formatDate(a.due_date)}`}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{a.category}</span>
                    <span className={`px-1.5 py-0.5 rounded ${a.priority === 'high' ? 'bg-destructive/10 text-destructive' : a.priority === 'medium' ? 'bg-warning-amber/10 text-warning-amber' : 'bg-dharma-green/10 text-dharma-green'}`}>{a.priority}</span>
                    {a.score && <span className="text-primary font-medium">Score: {a.score}/100 ⭐</span>}
                  </div>
                </div>
                {expandedAssignment === a.id && (
                  <div className="border-t border-border p-4 bg-muted/10 space-y-3">
                    <p className="text-sm text-foreground">{a.description}</p>
                    {a.feedback && <div className="p-3 rounded-lg bg-dharma-green/5 border border-dharma-green/20"><span className="text-xs font-medium text-dharma-green">Feedback:</span><p className="text-sm text-foreground">{a.feedback}</p></div>}
                    <div className="flex gap-2 flex-wrap">
                      <button className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground">✅ Mark Reviewed</button>
                      <button className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground">🔄 Request Revision</button>
                      <button className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground">Extend Deadline</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredAssignments.length === 0 && <div className="text-center py-12"><span className="text-4xl block mb-3">📝</span><p className="text-muted-foreground">No assignments match this filter.</p></div>}
          </div>
        </div>
      )}

      {/* ===== TAB 6: DAILY TRACKING ===== */}
      {activeTab === 6 && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
              <Flame className="w-6 h-6 mx-auto mb-1 text-warning-amber pulse-fire" />
              <p className="text-lg font-bold text-foreground">{seeker.streak}-day streak</p>
              <p className="text-xs text-muted-foreground">Current</p>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
              <p className="text-lg font-bold text-foreground">85%</p>
              <p className="text-xs text-muted-foreground">26 of 30 days this month</p>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
              <p className="text-lg font-bold text-foreground">7.2 😊</p>
              <p className="text-xs text-muted-foreground">Average Mood</p>
            </div>
          </div>

          {/* Heatmap */}
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-3">30-Day Calendar</h3>
            <div className="grid grid-cols-7 gap-1.5">
              {DAILY_TRACKING_RAHUL.map((d) => (
                <div key={d.day} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer transition-all hover:scale-110 ${
                  d.status === 'submitted' ? 'bg-dharma-green/20 text-dharma-green border border-dharma-green/30' :
                  'bg-muted text-muted-foreground'
                } ${d.day === 31 ? 'ring-2 ring-primary' : ''}`} title={`Day ${d.day}: ${d.status} ${d.completion ? `(${d.completion}%)` : ''}`}>
                  {d.day}
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-dharma-green/20 border border-dharma-green/30" /> Submitted</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-muted" /> Missed</span>
            </div>
          </div>

          {/* Coach Comment */}
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-3">Add Comment on Today's Entry</h3>
            <div className="flex gap-2 mb-3 flex-wrap">
              {['💪 Encouragement', '💡 Suggestion', '⚠️ Concern', '🎉 Celebration'].map(type => (
                <button key={type} className="text-xs px-3 py-1.5 rounded-full border border-border text-foreground hover:bg-muted">{type}</button>
              ))}
            </div>
            <textarea className="w-full bg-background border border-input rounded-xl p-3 text-sm min-h-[80px]" placeholder="Write your comment..." />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer"><Flag className="w-3 h-3" /> <input type="checkbox" className="rounded" /> Flag for Next Session</label>
                <button className="text-xs px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary/5">⭐ Mark Exceptional</button>
              </div>
              <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Submit Comment</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB 7: PAYMENTS ===== */}
      {activeTab === 7 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-4 shadow-sm border-2 border-primary/20"><p className="text-xs text-muted-foreground">Total Course Fee</p><p className="text-xl font-bold text-foreground">{formatINR(totalCourseFee)}</p></div>
            <div className="bg-card rounded-xl p-4 shadow-sm border-2 border-dharma-green/20"><p className="text-xs text-muted-foreground">Amount Paid</p><p className="text-xl font-bold text-dharma-green">{formatINR(totalPaid)}</p></div>
            <div className="bg-card rounded-xl p-4 shadow-sm border-2 border-saffron/20"><p className="text-xs text-muted-foreground">Balance</p><p className="text-xl font-bold text-saffron">{formatINR(balance)}</p></div>
            <div className="bg-card rounded-xl p-4 shadow-sm border-2 border-warning-amber/20"><p className="text-xs text-muted-foreground">Next Due</p><p className="text-lg font-bold text-warning-amber">₹41,667</p><p className="text-xs text-muted-foreground">25/04/2026</p></div>
          </div>
          <div className="flex justify-end"><button onClick={() => setRecordPaymentOpen(true)} className="px-4 py-2 rounded-xl gradient-chakravartin text-primary-foreground text-sm font-medium">➕ Record Payment</button></div>
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Amount (₹)</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Method</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Invoice</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {seekerPayments.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="p-3 text-foreground">{p.payment_date ? formatDate(p.payment_date) : p.due_date ? `Due: ${formatDate(p.due_date)}` : '—'}</td>
                    <td className="p-3 text-foreground font-medium">{formatINR(p.total_amount)}</td>
                    <td className="p-3 text-muted-foreground capitalize hidden sm:table-cell">{p.method.replace('_', ' ')}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${
                      p.status === 'received' ? 'bg-dharma-green/10 text-dharma-green' :
                      p.status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                      'bg-warning-amber/10 text-warning-amber'
                    }`}>{p.status === 'received' ? '✅' : p.status === 'overdue' ? '🔴' : '⏳'} {p.status}</span></td>
                    <td className="p-3 text-foreground">{p.invoice_number}</td>
                    <td className="p-3">
                      {p.status === 'received' && <button onClick={() => setShowInvoice(p.id)} className="text-xs text-primary hover:underline">📄 Invoice</button>}
                      {p.status === 'pending' && <button className="text-xs text-warning-amber hover:underline">🔔 Remind</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Modal */}
          <Dialog open={!!showInvoice} onOpenChange={() => setShowInvoice(null)}>
            <DialogContent className="max-w-lg">
              <div className="space-y-4 print:shadow-none" id="invoice-print">
                <div className="gradient-chakravartin rounded-t-xl p-4 -mx-6 -mt-6">
                  <h2 className="text-white font-bold text-lg">🪷 VIVEK DOBA TRAINING SOLUTIONS</h2>
                  <p className="text-white/80 text-xs">Spiritual Business Coach</p>
                  <p className="text-white/80 text-xs">Contact: 9607050111 | vivekdoba.com</p>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-muted-foreground">Invoice #</p>
                    <p className="font-semibold text-foreground">{invoicePayment?.invoice_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">{invoicePayment?.payment_date ? formatDate(invoicePayment.payment_date) : '—'}</p>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-dharma-green/10 text-dharma-green">✅ PAID</span>
                  </div>
                </div>
                <div className="gold-divider" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">BILL TO</p>
                  <p className="font-medium text-foreground">{seeker.full_name}</p>
                  <p className="text-sm text-muted-foreground">{seeker.city}, {seeker.state}</p>
                  <p className="text-sm text-muted-foreground">Phone: {seeker.phone}</p>
                  <p className="text-sm text-muted-foreground">Email: {seeker.email}</p>
                </div>
                <div className="gold-divider" />
                <div>
                  <p className="font-medium text-foreground">{seeker.course?.name}</p>
                  <p className="text-sm text-muted-foreground">{seeker.enrollment?.tier?.toUpperCase()} Tier</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">{formatINR(invoicePayment?.amount || 0)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST (18%)</span><span className="text-foreground">{formatINR(invoicePayment?.gst_amount || 0)}</span></div>
                  <div className="gold-divider my-2" />
                  <div className="flex justify-between font-bold"><span className="text-foreground">TOTAL</span><span className="text-primary text-lg">{formatINR(invoicePayment?.total_amount || 0)}</span></div>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>Payment Method: {invoicePayment?.method?.replace('_', ' ')}</p>
                  {invoicePayment?.transaction_id && <p>Transaction ID: {invoicePayment.transaction_id}</p>}
                </div>
                <div className="gold-divider" />
                <div className="text-xs text-muted-foreground">
                  <p>Bank: State Bank of India | A/C: XXXXXXXXXXXX</p>
                  <p>IFSC: SBIN0001234 | UPI: vivekdoba@sbi</p>
                  <p className="mt-1">GSTIN: 27XXXXXXXXXXXZX | PAN: XXXXX1234X</p>
                </div>
                <p className="text-center text-xs text-muted-foreground italic mt-2">Made with 🙏 for seekers of transformation</p>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => window.print()} className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">🖨️ Print</button>
                <button onClick={() => window.open(`mailto:${seeker.email}?subject=Invoice ${invoicePayment?.invoice_number} — Vivek Doba Training Solutions`)} className="flex-1 px-4 py-2 rounded-xl border border-border text-foreground text-sm font-medium">📧 Email</button>
                <button onClick={() => setShowInvoice(null)} className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium">Close</button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={recordPaymentOpen} onOpenChange={setRecordPaymentOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Seeker</Label>
                  <Input value={seeker.full_name} disabled />
                </div>
                <div>
                  <Label>Amount (₹) *</Label>
                  <Input type="number" placeholder="e.g. 25000" value={rpAmount} onChange={(e) => setRpAmount(e.target.value)} />
                  {rpAmount && !isNaN(parseFloat(rpAmount)) && parseFloat(rpAmount) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      + GST 18%: {formatINR(Math.round(parseFloat(rpAmount) * 0.18))} → Total: {formatINR(parseFloat(rpAmount) + Math.round(parseFloat(rpAmount) * 0.18))}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Payment Date *</Label>
                  <Input type="date" value={rpDate} onChange={(e) => setRpDate(e.target.value)} />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select value={rpMethod} onValueChange={(value) => setRpMethod(value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                      <SelectItem value="emi">EMI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Transaction ID</Label>
                  <Input placeholder="Optional" value={rpTransactionId} onChange={(e) => setRpTransactionId(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setRecordPaymentOpen(false)}>Cancel</Button>
                  <Button type="button" onClick={handleRecordPayment} className="gradient-chakravartin text-primary-foreground">Record Payment</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ===== TAB 8: GOALS & VISION ===== */}
      {activeTab === 8 && (
        <div className="space-y-6">
          {/* Vision */}
          <div className="bg-card rounded-xl p-6 shadow-sm border-2 border-primary/30">
            <h3 className="text-lg font-bold text-foreground mb-2">🔭 My 10-Year Vision</h3>
            <p className="text-foreground italic">{GOALS.vision}</p>
          </div>
          {/* Mantra */}
          <div className="bg-card rounded-xl p-6 shadow-sm border-2 border-primary/20 text-center">
            <p className="text-xs text-primary font-medium mb-2">ॐ My Sankalpa (संकल्प)</p>
            <p className="text-xl font-bold text-foreground font-devanagari mb-1">{GOALS.mantra.mr}</p>
            <p className="text-sm text-muted-foreground italic">"{GOALS.mantra.en}"</p>
          </div>
          {/* Why */}
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-2">❓ Why am I on this journey?</h3>
            <p className="text-sm text-foreground">{GOALS.why}</p>
          </div>
          {/* Goals */}
          {([
            { title: '🎯 Yearly Goals (2026)', goals: GOALS.yearly },
            { title: '📅 Quarterly Goals (Q2 2026)', goals: GOALS.quarterly },
            { title: '📋 Monthly Goals (April 2026)', goals: GOALS.monthly },
          ] as const).map(section => (
            <div key={section.title} className="bg-card rounded-xl p-5 shadow-sm border border-border">
              <h3 className="font-semibold text-foreground mb-3">{section.title}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">
                    <th className="text-left p-2 font-medium text-muted-foreground">Goal</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Deadline</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Coach Note</th>
                  </tr></thead>
                  <tbody>
                    {section.goals.map((g, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="p-2 text-foreground">{g.text}</td>
                        <td className="p-2 text-muted-foreground">{g.deadline}</td>
                        <td className="p-2"><span className={`px-2 py-0.5 rounded-full text-xs ${statusGoalBadge(g.status)}`}>{g.status === 'achieved' ? '🟢' : g.status === 'in_progress' ? '🟡' : '🔴'} {g.status.replace('_', ' ')}</span></td>
                        <td className="p-2 text-muted-foreground text-xs italic">{g.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== TAB 9: PRIVATE NOTES ===== */}
      {activeTab === 9 && (
        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive font-medium">🔒 PRIVATE COACH NOTES — Only you can see this tab. Seekers do NOT have access.</p>
          </div>
          {([
            { title: 'Personality Observations', key: 'personality', border: 'border-l-primary' },
            { title: 'Session Patterns', key: 'patterns', border: 'border-l-chakra-indigo' },
            { title: 'Resistance Points', key: 'resistance', border: 'border-l-destructive' },
            { title: 'Breakthrough Moments', key: 'breakthroughs', border: 'border-l-dharma-green' },
            { title: 'Recommended Approach', key: 'approach', border: 'border-l-saffron' },
          ] as const).map(section => (
            <div key={section.key} className={`bg-card rounded-xl p-5 shadow-sm border border-border ${section.border} border-l-4`}>
              <h3 className="font-semibold text-foreground mb-3">{section.title}</h3>
              <textarea defaultValue={PRIVATE_NOTES[section.key]} className="w-full bg-background border border-input rounded-xl p-3 text-sm min-h-[100px]" />
              <p className="text-xs text-muted-foreground mt-2 italic">Auto-saved ✓ 2 min ago</p>
            </div>
          ))}
        </div>
      )}

      {/* ===== TAB 10: TIMELINE ===== */}
      {activeTab === 10 && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {[{ key: 'all', label: 'All' }, { key: 'session', label: 'Sessions' }, { key: 'assignment', label: 'Assignments' }, { key: 'daily_log', label: 'Daily Logs' }, { key: 'payment', label: 'Payments' }, { key: 'assessment', label: 'Assessments' }].map(f => (
              <button key={f.key} onClick={() => setTimelineFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${timelineFilter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{f.label}</button>
            ))}
          </div>
          <div className="relative pl-8 space-y-4">
            <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />
            {filteredTimeline.map((entry, i) => (
              <div key={i} className="relative">
                <div className={`absolute left-[-20px] w-4 h-4 rounded-full ${entry.color} ring-2 ring-card flex items-center justify-center`} />
                <div className="bg-card rounded-xl p-4 shadow-sm border border-border ml-2 card-hover">
                  <p className="text-sm text-foreground">{entry.icon} {entry.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{entry.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== AWARD BADGE DIALOG ===== */}
      <Dialog open={awardBadgeOpen} onOpenChange={setAwardBadgeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" /> Award Badge to {seeker.full_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Toggle: Existing vs Custom */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={!isCustomBadge ? 'default' : 'outline'}
                onClick={() => setIsCustomBadge(false)}
                className="flex-1"
              >
                🏅 Existing Badge
              </Button>
              <Button
                size="sm"
                variant={isCustomBadge ? 'default' : 'outline'}
                onClick={() => setIsCustomBadge(true)}
                className="flex-1"
              >
                ✨ Custom Badge
              </Button>
            </div>

            {!isCustomBadge ? (
              <div className="space-y-3">
                <Label>Select Badge</Label>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                  {badgeDefinitions.map((def: any) => {
                    const alreadyEarned = seekerBadges.some((b: any) => b.badge_id === def.id);
                    return (
                      <button
                        key={def.id}
                        disabled={alreadyEarned}
                        onClick={() => setSelectedBadgeId(def.id)}
                        className={`p-2 rounded-lg border text-center transition-colors ${
                          selectedBadgeId === def.id
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                            : alreadyEarned
                            ? 'border-border bg-muted opacity-50 cursor-not-allowed'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="text-xl block">{def.emoji}</span>
                        <p className="text-[10px] font-semibold text-foreground mt-0.5">{def.name}</p>
                        {alreadyEarned && <p className="text-[9px] text-muted-foreground">✅ Earned</p>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label>Badge Emoji</Label>
                  <div className="flex gap-2 mt-1">
                    {['🏆', '⭐', '🎖️', '💎', '🦁', '🔥', '🌟', '👑'].map(e => (
                      <button
                        key={e}
                        onClick={() => setCustomEmoji(e)}
                        className={`text-xl p-1.5 rounded-lg border transition-colors ${
                          customEmoji === e ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Badge Name</Label>
                  <Input
                    placeholder="e.g. Breakthrough Champion"
                    value={customBadgeName}
                    onChange={e => setCustomBadgeName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Why is this badge being awarded?"
                value={badgeNotes}
                onChange={e => setBadgeNotes(e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>

            <Button
              onClick={handleAwardBadge}
              disabled={badgeAwarding || (!isCustomBadge && !selectedBadgeId) || (isCustomBadge && !customBadgeName)}
              className="w-full"
            >
              {badgeAwarding ? 'Awarding...' : '🏅 Award Badge'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeekerDetailPage;
