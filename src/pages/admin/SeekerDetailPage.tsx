import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBreadcrumbOverride } from '@/components/AdminLayout';
import { useState, useEffect, useCallback } from 'react';
import {
  Phone, MessageSquare, Mail, Edit, Archive, Calendar, ClipboardList, TrendingUp,
  CreditCard, Flame, ArrowLeft, UserCheck, CalendarCheck, Eye, ChevronDown, ChevronUp,
  Lock, Star, Flag, Printer, X, Target, Heart, BookOpen, Sparkles, AlertTriangle, Award, Plus, Gift, Loader2, Download, Send, FileText
} from 'lucide-react';
import LgtReport from '@/components/lgt/LgtReport';
import { generateLgtReportPdf, downloadBlob } from '@/lib/lgtPdfExport';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LGTAssessment from '@/components/LGTAssessment';
import { toast } from 'sonner';
import { usePayments } from '@/hooks/usePayments';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useDbSessions } from '@/hooks/useDbSessions';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import { useDbCourses } from '@/hooks/useDbCourses';
import { SeekerSignaturesTab } from '@/components/SeekerSignaturesTab';
import FeeStructureForm from '@/components/FeeStructureForm';
import { useAuthStore } from '@/store/authStore';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import {
  useSeekerLinkGroup, useLinkSeekers, useUnlinkSeekers,
  RELATIONSHIP_EMOJIS, RELATIONSHIP_LABELS,
  type SeekerLinkRow,
} from '@/hooks/useSeekerLinks';
import { Badge } from '@/components/ui/badge';
import { Link2, Unlink, Users } from 'lucide-react';
import AvatarUploader from '@/components/AvatarUploader';
import { useSeekerSessionCount } from '@/hooks/useSeekerSessionCount';
import { useFeeStructure } from '@/hooks/useFeeStructure';

import { formatDateDMY } from "@/lib/dateFormat";
const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const formatDate = (d: string) => { if (!d) return '—'; try { return format(new Date(d), 'dd-MMMM-yyyy'); } catch { return d; } };
const formatTime12 = (t: string) => { if (!t) return ''; const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };

const ALL_TABS = ['Overview', 'Personal Info', 'Sessions', 'Assessments', 'Assignments', 'Daily Tracking', 'Payments', 'Documents', 'LGT Application 👑', 'Private Notes 🔒'];

const moodEmoji = (score?: number | null) => {
  if (!score) return '—';
  if (score >= 9) return '😊';
  if (score >= 7) return '🙂';
  if (score >= 5) return '😐';
  if (score >= 3) return '😔';
  return '😰';
};

function SessionCountChips({ seekerId }: { seekerId: string }) {
  const { data: count } = useSeekerSessionCount(seekerId);
  const { data: fee } = useFeeStructure(seekerId);
  const total = Number((fee as any)?.fields_json?.numSessions ?? (fee as any)?.fields_json?.total_sessions ?? 0) || 0;
  const attended = count?.attended ?? 0;
  const remaining = total ? Math.max(0, total - attended) : null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
        ✅ Attended: {attended}
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-saffron/10 text-saffron border border-saffron/20">
        ⏳ Remaining: {remaining ?? '—'}
      </span>
      {total > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
          Total: {total}
        </span>
      )}
      {(count?.excused ?? 0) > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-600 border border-sky-500/20">
          Excused: {count!.excused}
        </span>
      )}
    </div>
  );
}

function LinkedPartnerStats({ partnerId }: { partnerId: string }) {
  const { data: count } = useSeekerSessionCount(partnerId);
  const { payments } = usePayments(partnerId);
  const totalPaid = (payments || []).filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + Number(p.total_amount || 0), 0);
  const lastPayment = (payments || []).find((p: any) => p.status === 'paid');
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
      <div className="rounded-lg border border-border bg-background/50 p-2 text-center">
        <p className="text-[10px] text-muted-foreground uppercase">Sessions</p>
        <p className="text-sm font-bold text-foreground">{count?.attended ?? 0}</p>
      </div>
      <div className="rounded-lg border border-border bg-background/50 p-2 text-center">
        <p className="text-[10px] text-muted-foreground uppercase">Paid</p>
        <p className="text-sm font-bold text-dharma-green">₹{totalPaid.toLocaleString('en-IN')}</p>
      </div>
      <div className="rounded-lg border border-border bg-background/50 p-2 text-center">
        <p className="text-[10px] text-muted-foreground uppercase">Last Payment</p>
        <p className="text-xs font-semibold text-foreground">{lastPayment?.payment_date ? formatDateDMY(new Date(lastPayment.payment_date)) : '—'}</p>
      </div>
      <div className="rounded-lg border border-border bg-background/50 p-2 text-center">
        <p className="text-[10px] text-muted-foreground uppercase">Excused</p>
        <p className="text-sm font-bold text-foreground">{count?.excused ?? 0}</p>
      </div>
    </div>
  );
}


const SeekerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setOverride } = useBreadcrumbOverride();
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
  const [sessionFilter, setSessionFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [showInvoice, setShowInvoice] = useState<string | null>(null);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [rpAmount, setRpAmount] = useState('');
  const [rpMethod, setRpMethod] = useState('upi');
  const [rpTransactionId, setRpTransactionId] = useState('');
  const [rpDate, setRpDate] = useState(new Date().toISOString().split('T')[0]);

  // Real data hooks
  const { payments: seekerPayments, createPayment } = usePayments(id);
  const { data: sessions = [] } = useDbSessions(id);
  const { data: assignments = [] } = useDbAssignments(id);
  const { data: courses = [] } = useDbCourses();

  // Linked profile state
  const { profile: adminProfile } = useAuthStore();
  const { data: allSeekers = [] } = useSeekerProfiles();
  const { data: linkGroup = [], refetch: refetchLink } = useSeekerLinkGroup(id);
  const linkSeekers = useLinkSeekers();
  const unlinkSeekers = useUnlinkSeekers();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkForm, setLinkForm] = useState<{
    partner_seeker_id: string;
    relationship: SeekerLinkRow['relationship'];
    relationship_label: string;
  }>({ partner_seeker_id: '', relationship: 'spouse', relationship_label: '' });

  // Signed agreement detection — gates the "Open Agreement" button so it only
  // appears once a Premium Coaching Agreement has actually been signed, and
  // points at the real signed PDF in the `signatures` bucket.
  const [signedAgreementPath, setSignedAgreementPath] = useState<string | null>(null);
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('signature_requests')
        .select('signed_at, documents(title, category), document_signatures(signed_pdf_path)')
        .eq('seeker_id', id)
        .eq('status', 'signed')
        .order('signed_at', { ascending: false });
      if (cancelled) return;
      const match = (data ?? []).find((r: any) => {
        const t = (r.documents?.title ?? '').toLowerCase();
        const c = (r.documents?.category ?? '').toLowerCase();
        return c === 'agreement' || t.includes('agreement');
      });
      const path = match?.document_signatures?.[0]?.signed_pdf_path ?? null;
      setSignedAgreementPath(path);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const openSignedAgreement = async () => {
    if (!signedAgreementPath) return;
    const { data, error } = await supabase.storage.from('signatures').createSignedUrl(signedAgreementPath, 60);
    if (error || !data?.signedUrl) { toast.error('Could not open signed agreement'); return; }
    window.open(data.signedUrl, '_blank');
  };

  const linkedPartner = linkGroup.find(r => r.seeker_id !== id);
  const linkGroupId = linkGroup[0]?.group_id;

  // Fallback: detect this seeker's own seeker_links row even if the partner
  // row failed to load. This lets us still show "already linked" UX and
  // route the submit through the replace flow.
  const [hasOwnLinkRow, setHasOwnLinkRow] = useState(false);
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('seeker_links')
        .select('id')
        .eq('seeker_id', id)
        .limit(1)
        .maybeSingle();
      if (!cancelled) setHasOwnLinkRow(!!data);
    })();
    return () => { cancelled = true; };
  }, [id, linkGroup.length]);

  const isAlreadyLinked = !!linkedPartner || hasOwnLinkRow;

  const handleLinkSubmit = async () => {
    if (!id || !linkForm.partner_seeker_id) {
      toast.error('Select a partner seeker');
      return;
    }
    if (linkForm.relationship === 'custom' && !linkForm.relationship_label.trim()) {
      toast.error('Custom label required');
      return;
    }
    try {
      await linkSeekers.mutateAsync({
        primary_seeker_id: id,
        partner_seeker_id: linkForm.partner_seeker_id,
        relationship: linkForm.relationship,
        relationship_label: linkForm.relationship === 'custom' ? linkForm.relationship_label : undefined,
        linked_by: adminProfile?.id || '',
        replace: true, // always replace any existing link from this profile page
      });
      toast.success(linkedPartner ? '✅ Link updated' : '✅ Profiles linked');
      setLinkDialogOpen(false);
      setLinkForm({ partner_seeker_id: '', relationship: 'spouse', relationship_label: '' });
      refetchLink();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to link');
    }
  };

  const openLinkDialog = () => {
    if (linkedPartner) {
      setLinkForm({
        partner_seeker_id: linkedPartner.seeker_id,
        relationship: linkedPartner.relationship,
        relationship_label: linkedPartner.relationship_label || '',
      });
    } else {
      setLinkForm({ partner_seeker_id: '', relationship: 'spouse', relationship_label: '' });
    }
    setLinkDialogOpen(true);
  };

  const handleUnlink = async () => {
    if (!linkGroupId) return;
    if (!confirm('Unlink these profiles? Existing joint payments will remain visible only to the original payer.')) return;
    try {
      await unlinkSeekers.mutateAsync(linkGroupId);
      toast.success('✅ Unlinked');
      refetchLink();
    } catch {
      toast.error('Failed to unlink');
    }
  };

  // Profile state
  const [seeker, setSeeker] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  // Worksheet tracking
  const [worksheetDays, setWorksheetDays] = useState<{ date: string; completion: number; mood: string | null }[]>([]);

  // Private notes
  const [privateNotes, setPrivateNotes] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);

  // Fetch seeker profile
  useEffect(() => {
    if (!id) return;
    const fetchSeeker = async () => {
      setLoading(true);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      if (profile) {
        setSeeker(profile);
        // Set breadcrumb to show name instead of UUID
        if (id) setOverride(id, profile.full_name);
        document.title = `${profile.full_name} — VDTS`;
        // Fetch enrollment
        const { data: enr } = await supabase.from('enrollments').select('*').eq('seeker_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle();
        setEnrollment(enr);
      }
      setLoading(false);
    };
    fetchSeeker();
  }, [id]);

  // Fetch badges
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

  // Fetch worksheet data for tracking tab
  useEffect(() => {
    if (!id) return;
    supabase.from('daily_worksheets')
      .select('worksheet_date, completion_rate_percent, morning_mood')
      .eq('seeker_id', id)
      .eq('is_submitted', true)
      .order('worksheet_date', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (data) setWorksheetDays(data.map(d => ({ date: d.worksheet_date, completion: d.completion_rate_percent || 0, mood: d.morning_mood })));
      });
  }, [id]);

  // ==== LGT Application data (for tab 8 — read-only nice visualization) ====
  const [lgtApp, setLgtApp] = useState<{
    id?: string;
    seeker_id?: string;
    status?: string;
    submitted_at?: string | null;
    filled_by_role?: string | null;
    form_data?: Record<string, any>;
    source: 'lgt_applications' | 'submissions' | 'none';
  }>({ source: 'none' });
  const [lgtLoading, setLgtLoading] = useState(false);
  const [lgtSending, setLgtSending] = useState(false);

  useEffect(() => {
    if (!id || !seeker) return;
    setLgtLoading(true);
    (async () => {
      // Prefer the modern lgt_applications row
      const { data: app } = await supabase
        .from('lgt_applications')
        .select('id, seeker_id, status, submitted_at, filled_by_role, form_data')
        .eq('seeker_id', id)
        .maybeSingle();
      if (app && app.status === 'submitted' && app.form_data) {
        setLgtApp({
          id: app.id,
          seeker_id: app.seeker_id,
          status: app.status,
          submitted_at: app.submitted_at,
          filled_by_role: app.filled_by_role,
          form_data: (app.form_data as Record<string, any>) || {},
          source: 'lgt_applications',
        });
        setLgtLoading(false);
        return;
      }
      // Fallback: legacy submissions row matched by email
      if (seeker?.email) {
        const { data: sub } = await supabase
          .from('submissions')
          .select('id, form_data, created_at')
          .eq('form_type', 'lgt_application')
          .ilike('email', seeker.email)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (sub && sub.form_data) {
          setLgtApp({
            submitted_at: sub.created_at,
            filled_by_role: 'seeker',
            form_data: (sub.form_data as Record<string, any>) || {},
            source: 'submissions',
          });
        } else {
          setLgtApp({ source: 'none' });
        }
      } else {
        setLgtApp({ source: 'none' });
      }
      setLgtLoading(false);
    })();
  }, [id, seeker]);

  const handleDownloadLgtPdf = async () => {
    try {
      const { blob, filename } = await generateLgtReportPdf({
        filename: `LGT-Report-${(seeker?.full_name || 'Seeker').replace(/\s+/g, '_')}.pdf`,
      });
      downloadBlob(blob, filename);
      toast.success('📄 LGT report downloaded');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate PDF');
    }
  };

  const handleEmailLgtReport = async () => {
    if (!id) return;
    setLgtSending(true);
    try {
      const { base64, filename } = await generateLgtReportPdf({
        filename: `LGT-Report-${(seeker?.full_name || 'Seeker').replace(/\s+/g, '_')}.pdf`,
      });
      const { data, error } = await supabase.functions.invoke('send-lgt-report', {
        body: { seekerId: id, pdfBase64: base64, filename },
      });
      if (error) throw error;
      const result = data as any;
      if (result?.warning) {
        toast.warning(result.warning);
      } else {
        toast.success(`📧 Report emailed to ${result?.recipients?.length || 0} recipient(s)`);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to email report');
    } finally {
      setLgtSending(false);
    }
};

  const handleAwardBadge = async () => {
    if (!id) return;
    setBadgeAwarding(true);
    try {
      if (isCustomBadge) {
        const { data: newDef, error: defErr } = await supabase.from('badge_definitions').insert({
          badge_key: `custom_${Date.now()}`, emoji: customEmoji, name: customBadgeName,
          description: badgeNotes || 'Custom badge awarded by coach', category: 'custom',
          condition_type: 'manual', condition_threshold: 0, condition_streak_days: 0, sort_order: 999,
        }).select('id').single();
        if (defErr) throw defErr;
        await supabase.from('seeker_badges').insert({ seeker_id: id, badge_id: newDef.id, awarded_by: 'coach', notes: badgeNotes || null });
      } else {
        if (!selectedBadgeId) { toast.error('Select a badge'); setBadgeAwarding(false); return; }
        const existing = seekerBadges.find(b => b.badge_id === selectedBadgeId);
        if (existing) { toast.error('Seeker already has this badge'); setBadgeAwarding(false); return; }
        await supabase.from('seeker_badges').insert({ seeker_id: id, badge_id: selectedBadgeId, awarded_by: 'coach', notes: badgeNotes || null });
      }
      toast.success('🏅 Badge awarded successfully!');
      setAwardBadgeOpen(false); setSelectedBadgeId(''); setCustomBadgeName(''); setBadgeNotes(''); setIsCustomBadge(false);
      await loadBadges();
    } catch (err: any) { toast.error(err.message || 'Failed to award badge'); }
    setBadgeAwarding(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

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

  const course = courses.find(c => c.id === enrollment?.course_id);
  const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'approved').length;
  const totalSessions = sessions.length || 1;
  const daysSinceJoin = Math.floor((Date.now() - new Date(seeker.created_at).getTime()) / 86400000);
  const totalCourseFee = course?.price || 0;
  const totalPaid = seekerPayments.filter(p => p.status === 'received').reduce((s, p) => s + Number(p.total_amount), 0);
  const balance = totalCourseFee - totalPaid;

  const seekerSessions = sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filteredSessions = seekerSessions.filter(s => sessionFilter === 'all' || s.status === sessionFilter);
  const filteredAssignments = assignments.filter(a => {
    if (assignmentFilter === 'all') return true;
    if (assignmentFilter === 'pending') return ['assigned', 'in_progress'].includes(a.status);
    return a.status === assignmentFilter;
  });

  const invoicePayment = seekerPayments.find(p => p.id === showInvoice);

  const handleRecordPayment = async () => {
    if (!rpAmount || !rpDate) { toast.error('Please fill Amount and Date'); return; }
    const amount = parseFloat(rpAmount);
    if (isNaN(amount) || amount <= 0) { toast.error('Enter a valid amount'); return; }
    const gst = Math.round(amount * 0.18);
    const total = amount + gst;
    try {
      await createPayment.mutateAsync({
        seeker_id: seeker.id, amount, gst_amount: gst, total_amount: total,
        payment_date: rpDate, method: rpMethod, transaction_id: rpTransactionId || undefined,
      });
      toast.success(`Payment of ${formatINR(total)} recorded`);
      setRecordPaymentOpen(false); setRpAmount(''); setRpMethod('upi'); setRpTransactionId(''); setRpDate(new Date().toISOString().split('T')[0]);
    } catch (err: any) { toast.error(err.message || 'Failed to save payment'); }
  };

  // Calculate streak from worksheet data
  const worksheetStreak = (() => {
    const dates = new Set(worksheetDays.map(d => d.date));
    let streak = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const check = new Date(today); check.setDate(check.getDate() - i);
      const ds = check.toISOString().split('T')[0];
      if (dates.has(ds)) streak++;
      else { if (i === 0) continue; break; }
    }
    return streak;
  })();

  return (
    <div className="space-y-6 animate-fade-up">
      <Link to="/seekers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Seekers
      </Link>

      {/* HEADER */}
      <div className="bg-card rounded-2xl p-6 shadow-md border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <AvatarUploader
              profileId={seeker.id}
              targetUserId={seeker.user_id}
              avatarUrl={seeker.avatar_url}
              fallbackName={seeker.full_name}
              size={80}
              onChange={(url) => setSeeker((s: any) => ({ ...s, avatar_url: url }))}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{seeker.full_name}</h1>
                {enrollment?.tier && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    {enrollment.tier === 'chakravartin' ? '✦ Chakravartin' : enrollment.tier.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{course?.name || 'No course assigned'}</p>
              <p className="text-xs text-muted-foreground">{seeker.city}{seeker.state ? `, ${seeker.state}` : ''}</p>
              <SessionCountChips seekerId={seeker.id} />
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {enrollment?.status && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                enrollment.status === 'active' ? 'bg-dharma-green/10 text-dharma-green' :
                enrollment.status === 'paused' ? 'bg-warning-amber/10 text-warning-amber' :
                enrollment.status === 'completed' ? 'bg-sky-blue/10 text-sky-blue' : 'bg-muted text-muted-foreground'
              }`}>● {enrollment.status}</span>
            )}
            <span className="text-xs text-muted-foreground">Day {daysSinceJoin} · Joined {formatDate(seeker.created_at)}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {seeker.phone && <a href={`tel:+91${seeker.phone}`} className="p-2.5 rounded-xl bg-sky-blue/10 text-sky-blue hover:bg-sky-blue/20 transition-colors" title="Call"><Phone className="w-4 h-4" /></a>}
            {seeker.phone && <a href={`https://wa.me/91${seeker.phone}`} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-dharma-green/10 text-dharma-green hover:bg-dharma-green/20 transition-colors" title="WhatsApp"><MessageSquare className="w-4 h-4" /></a>}
            <a href={`mailto:${seeker.email}`} className="p-2.5 rounded-xl bg-chakra-indigo/10 text-chakra-indigo hover:bg-chakra-indigo/20 transition-colors" title="Email"><Mail className="w-4 h-4" /></a>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-1 border-b border-border overflow-x-auto pb-px scrollbar-hide">
        {ALL_TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === i ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}>{tab}</button>
        ))}
      </div>

      {/* TAB 0: OVERVIEW */}
      {activeTab === 0 && (
        <div className="space-y-6 stagger-children">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Sessions', value: `${completedSessions} / ${totalSessions}`, icon: CalendarCheck, color: 'text-chakra-indigo' },
              { label: 'Streak', value: `${worksheetStreak} days 🔥`, icon: Flame, color: 'text-warning-amber' },
              { label: 'Assignments', value: `${assignments.filter(a => a.status === 'reviewed' || a.status === 'completed').length} / ${assignments.length}`, icon: ClipboardList, color: 'text-wisdom-purple' },
              { label: 'Payments', value: formatINR(totalPaid), icon: CreditCard, color: 'text-dharma-green' },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl p-4 shadow-sm border border-border text-center card-hover">
                <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" /> Badges & Achievements
                {seekerBadges.length > 0 && <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{seekerBadges.length}</span>}
              </h3>
              <Button size="sm" variant="outline" onClick={() => setAwardBadgeOpen(true)} className="gap-1"><Gift className="w-3.5 h-3.5" /> Award Badge</Button>
            </div>
            {seekerBadges.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {seekerBadges.map((b: any) => (
                  <div key={b.id} className="text-center p-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors" title={b.badge?.description}>
                    <span className="text-3xl block">{b.badge?.emoji}</span>
                    <p className="text-[11px] font-bold text-foreground mt-1 truncate">{b.badge?.name}</p>
                    <p className="text-[9px] text-muted-foreground">{formatDateDMY(new Date(b.earned_at))}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No badges earned yet. Award one to motivate this seeker! 🌟</p>
            )}
          </div>

          {/* Linked Profile */}
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Linked Profile
              </h3>
              <div className="flex items-center gap-2">
                {!isAlreadyLinked ? (
                  <Button size="sm" variant="outline" onClick={openLinkDialog} className="gap-1">
                    <Link2 className="w-3.5 h-3.5" /> Link Seeker
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={openLinkDialog} className="gap-1">
                    <Edit className="w-3.5 h-3.5" /> Edit Link
                  </Button>
                )}
                <Link to="/admin/linked-profiles" className="text-xs text-primary hover:underline whitespace-nowrap">
                  View all links →
                </Link>
              </div>
            </div>
            {linkedPartner ? (
              <div className="p-3 rounded-lg bg-muted/30 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{RELATIONSHIP_EMOJIS[linkedPartner.relationship]}</span>
                  <div className="flex-1 min-w-0">
                    <Link to={`/seekers/${linkedPartner.seeker_id}`} className="text-sm font-semibold text-primary hover:underline">
                      {linkedPartner.seeker?.full_name || '—'}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">{linkedPartner.seeker?.email}</p>
                  </div>
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    {linkedPartner.relationship === 'custom'
                      ? linkedPartner.relationship_label || 'Custom'
                      : RELATIONSHIP_LABELS[linkedPartner.relationship]}
                  </Badge>
                  <Button size="sm" variant="ghost" onClick={handleUnlink} disabled={unlinkSeekers.isPending}>
                    <Unlink className="w-4 h-4 mr-1" /> Unlink
                  </Button>
                </div>
                <LinkedPartnerStats partnerId={linkedPartner.seeker_id} />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-dharma-green/10 text-dharma-green border border-dharma-green/20">
                    💰 Joint payments enabled
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                    👥 Couple-session pairing active
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                    Group: {linkedPartner.group_id.slice(0, 8)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-3">
                Not linked to any other seeker. Use "Link Seeker" to connect this seeker with a spouse, parent, sibling, or other relation.
              </p>
            )}
          </div>

          {/* Next Session */}
          <div className="bg-card rounded-xl p-5 shadow-sm border-2 border-primary/20">
            <h3 className="font-semibold text-foreground mb-2">Next Session</h3>
            {sessions.find(s => s.status === 'scheduled') ? (
              <p className="text-sm text-muted-foreground">
                {formatDate(sessions.find(s => s.status === 'scheduled')!.date)} at {formatTime12(sessions.find(s => s.status === 'scheduled')!.start_time)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming sessions scheduled</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: PERSONAL INFO */}
      {activeTab === 1 && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
              <h3 className="font-semibold text-foreground mb-4">Personal Details</h3>
              <div className="space-y-3">
                {[
                  ['Full Name', seeker.full_name], ['Email', seeker.email], ['Phone', seeker.phone || '—'],
                  ['WhatsApp', seeker.whatsapp || seeker.phone || '—'], ['Date of Birth', formatDate(seeker.dob)],
                  ['Gender', seeker.gender || '—'], ['City', seeker.city || '—'], ['State', seeker.state || '—'],
                  ['Blood Group', seeker.blood_group || '—'],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm text-foreground font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
              <h3 className="font-semibold text-foreground mb-4">Professional Details</h3>
              <div className="space-y-3">
                {[
                  ['Occupation', seeker.occupation || '—'], ['Designation', seeker.designation || '—'],
                  ['Company', seeker.company || '—'], ['Industry', seeker.industry || '—'],
                  ['Experience', seeker.experience_years ? `${seeker.experience_years} years` : '—'],
                  ['Revenue Range', seeker.revenue_range || '—'], ['Team Size', seeker.team_size || '—'],
                  ['LinkedIn', seeker.linkedin_url || '—'],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm text-foreground font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
            {enrollment && (
              <div className="bg-card rounded-xl p-5 shadow-sm border border-border md:col-span-2">
                <h3 className="font-semibold text-foreground mb-4">Enrollment Details</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    ['Course', course?.name || '—'], ['Tier', enrollment.tier || '—'],
                    ['Start Date', formatDate(enrollment.start_date)], ['Status', enrollment.status],
                    ['Payment Status', enrollment.payment_status || '—'],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm text-foreground font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SESSIONS */}
      {activeTab === 2 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {[{ key: 'all', label: 'All' }, { key: 'completed', label: 'Completed ✅' }, { key: 'scheduled', label: 'Upcoming 📅' }, { key: 'cancelled', label: 'Cancelled ❌' }].map(f => (
                <button key={f.key} onClick={() => setSessionFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sessionFilter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{f.label}</button>
              ))}
            </div>
          </div>
          {filteredSessions.length > 0 ? (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Session #</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Topics</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Engagement</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                </tr></thead>
                <tbody>
                  {filteredSessions.map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="p-3 text-foreground">{formatDate(s.date)}</td>
                      <td className="p-3 text-foreground font-medium">Session {s.session_number}</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">
                        {Array.isArray(s.topics_covered) ? (s.topics_covered as string[]).join(', ') : '—'}
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        {s.engagement_score ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2"><div className={`h-2 rounded-full ${(s.engagement_score as number) >= 7 ? 'bg-dharma-green' : (s.engagement_score as number) >= 4 ? 'bg-warning-amber' : 'bg-destructive'}`} style={{ width: `${(s.engagement_score as number) * 10}%` }} /></div>
                            <span className="text-xs">{s.engagement_score}/10</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${
                        s.status === 'completed' || s.status === 'approved' ? 'bg-dharma-green/10 text-dharma-green' :
                        s.status === 'cancelled' || s.status === 'missed' ? 'bg-destructive/10 text-destructive' :
                        'bg-sky-blue/10 text-sky-blue'
                      }`}>{s.status}</span></td>
                      <td className="p-3">
                        {(s.status === 'completed' || s.status === 'approved') && s.key_insights && (
                          <button onClick={() => setExpandedSession(expandedSession === s.id ? null : s.id)} className="text-xs text-primary hover:underline flex items-center gap-1">
                            👁️ Notes {expandedSession === s.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12"><span className="text-4xl block mb-3">📅</span><p className="text-muted-foreground">No sessions found.</p></div>
          )}
        </div>
      )}

      {/* TAB 3: ASSESSMENTS (placeholder for now - data-driven) */}
      {activeTab === 3 && (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">📊</span>
          <p className="text-muted-foreground">Assessment history will be shown here from saved assessments.</p>
          <p className="text-sm text-muted-foreground mt-2">Use the Assessments page to record new assessments for this seeker.</p>
        </div>
      )}

      {/* TAB 4: ASSIGNMENTS */}
      {activeTab === 4 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {[{ key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'submitted', label: 'Submitted' }, { key: 'overdue', label: 'Overdue ⚠️' }, { key: 'reviewed', label: 'Reviewed ✅' }].map(f => (
                <button key={f.key} onClick={() => setAssignmentFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${assignmentFilter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{f.label}</button>
              ))}
            </div>
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
                      a.status === 'reviewed' || a.status === 'completed' ? 'bg-dharma-green/10 text-dharma-green' :
                      a.status === 'submitted' ? 'bg-wisdom-purple/10 text-wisdom-purple' :
                      'bg-sky-blue/10 text-sky-blue'
                    }`}>{a.status}</span>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs flex-wrap">
                    <span className="text-muted-foreground">Due: {formatDate(a.due_date)}</span>
                    {a.category && <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{a.category}</span>}
                    {a.priority && <span className={`px-1.5 py-0.5 rounded ${a.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-warning-amber/10 text-warning-amber'}`}>{a.priority}</span>}
                    {a.score && <span className="text-primary font-medium">Score: {a.score}/100 ⭐</span>}
                  </div>
                </div>
                {expandedAssignment === a.id && a.feedback && (
                  <div className="border-t border-border p-4 bg-muted/10">
                    <div className="p-3 rounded-lg bg-dharma-green/5 border border-dharma-green/20">
                      <span className="text-xs font-medium text-dharma-green">Feedback:</span>
                      <p className="text-sm text-foreground">{a.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredAssignments.length === 0 && <div className="text-center py-12"><span className="text-4xl block mb-3">📝</span><p className="text-muted-foreground">No assignments match this filter.</p></div>}
          </div>
        </div>
      )}

      {/* TAB 5: DAILY TRACKING */}
      {activeTab === 5 && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
              <Flame className="w-6 h-6 mx-auto mb-1 text-warning-amber pulse-fire" />
              <p className="text-lg font-bold text-foreground">{worksheetStreak}-day streak</p>
              <p className="text-xs text-muted-foreground">Current</p>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
              <p className="text-lg font-bold text-foreground">{worksheetDays.length}</p>
              <p className="text-xs text-muted-foreground">Worksheets submitted (last 30)</p>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
              <p className="text-lg font-bold text-foreground">
                {worksheetDays.length > 0 ? Math.round(worksheetDays.reduce((a, d) => a + d.completion, 0) / worksheetDays.length) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Avg Completion</p>
            </div>
          </div>

          {/* Calendar heatmap */}
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-3">30-Day Calendar</h3>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 30 }, (_, i) => {
                const d = new Date(); d.setDate(d.getDate() - (29 - i));
                const ds = d.toISOString().split('T')[0];
                const ws = worksheetDays.find(w => w.date === ds);
                return (
                  <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                    ws ? 'bg-dharma-green/20 text-dharma-green border border-dharma-green/30' : 'bg-muted text-muted-foreground'
                  }`} title={`${ds}: ${ws ? `${ws.completion}%` : 'No data'}`}>
                    {d.getDate()}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-dharma-green/20 border border-dharma-green/30" /> Submitted</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-muted" /> Missed</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PAYMENTS */}
      {activeTab === 6 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-4 shadow-sm border-2 border-primary/20"><p className="text-xs text-muted-foreground">Total Course Fee</p><p className="text-xl font-bold text-foreground">{formatINR(totalCourseFee)}</p></div>
            <div className="bg-card rounded-xl p-4 shadow-sm border-2 border-dharma-green/20"><p className="text-xs text-muted-foreground">Amount Paid</p><p className="text-xl font-bold text-dharma-green">{formatINR(totalPaid)}</p></div>
            <div className="bg-card rounded-xl p-4 shadow-sm border-2 border-saffron/20"><p className="text-xs text-muted-foreground">Balance</p><p className="text-xl font-bold text-saffron">{formatINR(Math.max(0, balance))}</p></div>
            <div className="bg-card rounded-xl p-4 shadow-sm border-2 border-warning-amber/20"><p className="text-xs text-muted-foreground">Payments</p><p className="text-xl font-bold text-warning-amber">{seekerPayments.length}</p></div>
          </div>
          <div className="flex justify-end"><button onClick={() => setRecordPaymentOpen(true)} className="px-4 py-2 rounded-xl gradient-chakravartin text-primary-foreground text-sm font-medium">➕ Record Payment</button></div>
          {seekerPayments.length > 0 ? (
            <div className="bg-card rounded-xl border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Amount (₹)</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Method</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Invoice</th>
                </tr></thead>
                <tbody>
                  {seekerPayments.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="p-3 text-foreground">{p.payment_date ? formatDate(p.payment_date) : p.due_date ? `Due: ${formatDate(p.due_date)}` : '—'}</td>
                      <td className="p-3 text-foreground font-medium">{formatINR(Number(p.total_amount))}</td>
                      <td className="p-3 text-muted-foreground capitalize hidden sm:table-cell">{p.method.replace('_', ' ')}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${
                        p.status === 'received' ? 'bg-dharma-green/10 text-dharma-green' :
                        p.status === 'overdue' ? 'bg-destructive/10 text-destructive' : 'bg-warning-amber/10 text-warning-amber'
                      }`}>{p.status}</span></td>
                      <td className="p-3 text-foreground">{p.invoice_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12"><span className="text-4xl block mb-3">💰</span><p className="text-muted-foreground">No payments recorded yet.</p></div>
          )}

          {/* Record Payment Dialog */}
          <Dialog open={recordPaymentOpen} onOpenChange={setRecordPaymentOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Payment for {seeker.full_name}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Amount (₹) *</Label><Input type="number" value={rpAmount} onChange={e => setRpAmount(e.target.value)} placeholder="e.g. 50000" /></div>
                <div><Label>Payment Date *</Label><Input type="date" value={rpDate} onChange={e => setRpDate(e.target.value)} /></div>
                <div><Label>Method</Label>
                  <Select value={rpMethod} onValueChange={setRpMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['upi', 'bank_transfer', 'cash', 'cheque', 'razorpay', 'emi'].map(m => <SelectItem key={m} value={m}>{m.replace('_', ' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Transaction ID</Label><Input value={rpTransactionId} onChange={e => setRpTransactionId(e.target.value)} placeholder="Optional" /></div>
                <Button onClick={handleRecordPayment} className="w-full" disabled={createPayment.isPending}>{createPayment.isPending ? 'Saving...' : 'Save Payment'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* TAB 7: DOCUMENTS & SIGNATURES */}
      {activeTab === 7 && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Fee Structure / फीस संरचना</h3>
                <p className="text-xs text-muted-foreground mt-1">Onboarding fee details. Auto-attached as page 6 (B1.2) of the Premium Coaching Agreement.</p>
              </div>
            </div>
            <FeeStructureForm seekerId={seeker.id} />
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  📜 Premium Coaching Agreement
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Full bilingual agreement. After the seeker signs, the final PDF (template + B1.1 Client Details + B1.2 Payments &amp; Fees + Signature Certificate) is available here.
                </p>
                {!signedAgreementPath && (
                  <p className="text-xs text-muted-foreground italic mt-2">
                    Will become available once the seeker signs the agreement.
                  </p>
                )}
              </div>
              {signedAgreementPath && (
                <button
                  type="button"
                  onClick={openSignedAgreement}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8B0000] text-white text-sm font-medium hover:bg-[#6B0000] transition-colors whitespace-nowrap"
                >
                  Open Signed Agreement →
                </button>
              )}
            </div>
          </div>

          <SeekerSignaturesTab seekerId={seeker.id} />
        </div>
      )}

      {/* TAB 8: LGT APPLICATION (read-only nice visualization) */}
      {activeTab === 8 && (
        <div className="space-y-4">
          {lgtLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : lgtApp.source === 'none' ? (
            <div className="bg-card rounded-xl p-10 text-center border border-dashed border-border">
              <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold text-foreground mb-1">No LGT Application on file</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This seeker hasn't completed the Life's Golden Triangle application yet.
              </p>
              <Link
                to="/admin/apply-lgt"
                className="inline-flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 font-medium"
              >
                👑 Open LGT Application Manager
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 bg-card rounded-xl border border-border p-3">
                <div className="text-xs text-muted-foreground">
                  Source: <span className="font-medium text-foreground">{lgtApp.source === 'submissions' ? 'Legacy public submission' : 'Admin / Seeker form'}</span>
                  {lgtApp.submitted_at && <> · Submitted {formatDateDMY(lgtApp.submitted_at)}</>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleDownloadLgtPdf} className="gap-1">
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </Button>
                  <Button size="sm" onClick={handleEmailLgtReport} disabled={lgtSending} className="gap-1">
                    {lgtSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Email to Admin & Seeker
                  </Button>
                </div>
              </div>
              <LgtReport
                seekerName={seeker.full_name}
                seekerEmail={seeker.email}
                submittedAt={lgtApp.submitted_at}
                filledByRole={lgtApp.filled_by_role}
                data={lgtApp.form_data || {}}
              />
            </>
          )}
        </div>
      )}

      {/* TAB 9: PRIVATE NOTES */}
      {activeTab === 9 && (
        <div className="bg-card rounded-xl p-6 shadow-sm border-2 border-warning-amber/30">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-warning-amber" /> Coach's Private Notes</h3>
          <p className="text-xs text-muted-foreground mb-3">These notes are only visible to the admin/coach. Seekers cannot see them.</p>
          <Textarea
            className="min-h-[200px]"
            placeholder="Write your private observations, patterns, breakthroughs, resistance areas, and coaching approach notes here..."
            value={privateNotes}
            onChange={e => setPrivateNotes(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-2">💡 Notes are stored locally for now. Database persistence coming soon.</p>
        </div>
      )}


      {/* Award Badge Dialog */}
      <Dialog open={awardBadgeOpen} onOpenChange={setAwardBadgeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>🏅 Award Badge to {seeker.full_name}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex gap-2">
              <Button variant={!isCustomBadge ? 'default' : 'outline'} size="sm" onClick={() => setIsCustomBadge(false)}>Existing Badge</Button>
              <Button variant={isCustomBadge ? 'default' : 'outline'} size="sm" onClick={() => setIsCustomBadge(true)}>Custom Badge</Button>
            </div>
            {isCustomBadge ? (
              <>
                <div><Label>Emoji</Label><Input value={customEmoji} onChange={e => setCustomEmoji(e.target.value)} placeholder="🏆" /></div>
                <div><Label>Badge Name *</Label><Input value={customBadgeName} onChange={e => setCustomBadgeName(e.target.value)} placeholder="e.g. Master Delegator" /></div>
              </>
            ) : (
              <div>
                <Label>Select Badge</Label>
                <Select value={selectedBadgeId} onValueChange={setSelectedBadgeId}>
                  <SelectTrigger><SelectValue placeholder="Choose a badge..." /></SelectTrigger>
                  <SelectContent>
                    {badgeDefinitions.map(b => <SelectItem key={b.id} value={b.id}>{b.emoji} {b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div><Label>Notes (optional)</Label><Textarea value={badgeNotes} onChange={e => setBadgeNotes(e.target.value)} placeholder="Why is this badge being awarded?" /></div>
            <Button onClick={handleAwardBadge} className="w-full" disabled={badgeAwarding}>{badgeAwarding ? 'Awarding...' : '🎖️ Award Badge'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Seeker Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              {linkedPartner ? `Edit link for ${seeker?.full_name || 'this seeker'}` : `Link ${seeker?.full_name || 'this seeker'} to another profile`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {linkedPartner && (
              <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
                Currently linked to <span className="font-semibold">{linkedPartner.seeker?.full_name}</span> ({RELATIONSHIP_LABELS[linkedPartner.relationship]}). Changing the partner or relationship will replace the existing link.
              </div>
            )}
            <div>
              <Label>Partner Seeker *</Label>
              <Select value={linkForm.partner_seeker_id} onValueChange={v => setLinkForm(p => ({ ...p, partner_seeker_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select partner seeker" /></SelectTrigger>
                <SelectContent>
                  {allSeekers.filter(s => s.id !== id).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.full_name} <span className="text-muted-foreground text-xs">({s.email})</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">
                {linkedPartner
                  ? 'Selecting a different seeker will remove the existing link and create a new one.'
                  : 'If the chosen partner is already linked elsewhere, that link will be replaced.'}
              </p>
            </div>
            <div>
              <Label>Relationship *</Label>
              <Select value={linkForm.relationship} onValueChange={v => setLinkForm(p => ({ ...p, relationship: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">💑 Spouse (Husband / Wife)</SelectItem>
                  <SelectItem value="parent">👨‍👧 Parent → Child</SelectItem>
                  <SelectItem value="sibling">👫 Siblings</SelectItem>
                  <SelectItem value="custom">🤝 Custom</SelectItem>
                </SelectContent>
              </Select>
              {linkForm.relationship === 'parent' && (
                <p className="text-xs text-muted-foreground mt-1">{seeker?.full_name || 'This seeker'} will be treated as the parent.</p>
              )}
            </div>
            {linkForm.relationship === 'custom' && (
              <div>
                <Label>Custom Relationship Label *</Label>
                <Input
                  placeholder="e.g. Business Partner, Co-Founder"
                  value={linkForm.relationship_label}
                  onChange={e => setLinkForm(p => ({ ...p, relationship_label: e.target.value }))}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleLinkSubmit} disabled={linkSeekers.isPending}>
              {linkSeekers.isPending ? 'Saving…' : linkedPartner ? 'Update Link' : 'Link Profiles'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeekerDetailPage;
