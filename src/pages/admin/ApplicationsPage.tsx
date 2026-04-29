import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageSquare, Mail, Check, X, RefreshCw, ChevronDown, ChevronUp, Loader2, Send, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';


type FormType = 'discovery_call' | 'workshop' | 'lgt_application' | 'registration';
type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'info_requested';

interface Submission {
  id: string;
  form_type: string;
  status: string;
  full_name: string;
  email: string;
  mobile: string | null;
  country_code: string | null;
  form_data: Record<string, any>;
  admin_notes: string | null;
  created_at: string;
}

const typeBadge = (t: string) => {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    discovery_call: { label: '📞 Discovery Call', bg: '#DBEAFE', color: '#1D4ED8' },
    workshop: { label: '🎯 Workshop', bg: '#FFF3CD', color: '#B8860B' },
    lgt_application: { label: '👑 LGT Application', bg: '#FEF3C7', color: '#92400E' },
    registration: { label: '📝 Registration', bg: '#E0E7FF', color: '#3730A3' },
  };
  const s = map[t] || { label: t, bg: '#eee', color: '#333' };
  return <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>;
};

const statusBadge = (s: string) => {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending: { label: '⏳ Pending Review', bg: '#FEF3C7', color: '#92400E' },
    approved: { label: '✅ Approved', bg: '#D1FAE5', color: '#065F46' },
    rejected: { label: '❌ Rejected', bg: '#FEE2E2', color: '#991B1B' },
    info_requested: { label: '📋 Info Requested', bg: '#DBEAFE', color: '#1D4ED8' },
  };
  const st = map[s] || { label: s, bg: '#eee', color: '#333' };
  return <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: st.bg, color: st.color }}>{st.label}</span>;
};

const timeAgo = (d: string) => {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  return diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : `${diff} days ago`;
};

const SKIP_KEYS = new Set(['consent', 'consent1', 'consent2', 'consent3', 'consent4', 'sameWhatsapp', 'coursesOpen', 'interestedCourses', 'commitments', 'countryCode', 'whatsappCountryCode', 'loading', 'password']);

const formatKey = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace(/_/g, ' ');

const ApplicationsPage = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | FormType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | SubmissionStatus>('pending');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'reject' | 'info' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState<{ id: string; name: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [approveProgress, setApproveProgress] = useState(0);
  const [approvingName, setApprovingName] = useState<string | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  const startProgress = () => {
    setApproveProgress(8);
    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    progressTimerRef.current = window.setInterval(() => {
      setApproveProgress(p => (p < 90 ? p + Math.max(1, Math.round((92 - p) / 12)) : p));
    }, 250);
  };

  const stopProgress = () => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setApproveProgress(100);
    window.setTimeout(() => { setApprovingName(null); setApproveProgress(0); }, 500);
  };

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Failed to load submissions', variant: 'destructive' });
    } else {
      setSubmissions((data || []) as unknown as Submission[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
    // Realtime subscription
    const channel = supabase
      .channel('submissions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => {
        fetchSubmissions();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = submissions.filter(
    a => (filter === 'all' || a.form_type === filter) && (statusFilter === 'all' || a.status === statusFilter)
  );

  const pendingCount = (t: FormType) => submissions.filter(a => a.form_type === t && a.status === 'pending').length;

  const updateStatus = async (id: string, status: SubmissionStatus, notes?: string) => {
    setActionLoading(true);
    const sub = submissions.find(s => s.id === id);
    if (!sub) { setActionLoading(false); return; }
    if (status === 'approved') { setApprovingName(sub.full_name); startProgress(); }

    // If approving, use the edge function to create auth user + profile
    if (status === 'approved') {
      const { data, error: fnError } = await supabase.functions.invoke('approve-application', {
        body: { submission_id: id },
      });

      if (fnError || !data?.success) {
        toast({ title: `Failed to approve: ${data?.error || fnError?.message || 'Unknown error'}`, variant: 'destructive' });
        stopProgress();
        setActionLoading(false);
        return;
      }
    } else {
      // For reject / info_requested, just update the submission
      const { error } = await supabase
        .from('submissions')
        .update({ status, admin_notes: notes || null } as any)
        .eq('id', id);

      if (error) {
        toast({ title: 'Failed to update', variant: 'destructive' });
        setActionLoading(false);
        return;
      }
    }

    // Send email to applicant
    try {
      await supabase.functions.invoke('send-notification', {
        body: {
          type: 'status_update',
          form_type: sub.form_type,
          applicant_name: sub.full_name,
          applicant_email: sub.email,
          applicant_mobile: sub.mobile ? `${sub.country_code || '+91'}${sub.mobile}` : undefined,
          status,
          admin_notes: notes,
          submission_id: id,
        },
      });
    } catch (e) {
      console.error('Email notification error:', e);
    }

    const labels: Record<string, string> = {
      approved: `✅ ${sub.full_name} approved & added to Seekers!`,
      rejected: `❌ ${sub.full_name} rejected. Email sent.`,
      info_requested: `📋 Info requested from ${sub.full_name}. Email sent.`,
    };
    toast({ title: labels[status] });

    setActionId(null);
    setActionType(null);
    setActionNotes('');
    setActionLoading(false);
    if (status === 'approved') stopProgress();
    fetchSubmissions();
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmDelete({ id, name });
  };

  const performDelete = async () => {
    if (!confirmDelete) return;
    const { id, name } = confirmDelete;
    const { error, count } = await supabase.from('submissions').delete({ count: 'exact' }).eq('id', id);
    setConfirmDelete(null);
    if (error) {
      toast({ title: 'Failed to delete', description: error.message, variant: 'destructive' });
      return;
    }
    if (count === 0) {
      toast({ title: 'Delete blocked', description: 'No rows were deleted (permission denied).', variant: 'destructive' });
      return;
    }
    toast({ title: `🗑️ Application from ${name} deleted` });
    fetchSubmissions();
  };

  const handleQuickApprove = (id: string, name: string) => {
    setConfirmApprove({ id, name });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📥 Incoming Applications</h1>
          <p className="text-sm text-muted-foreground">Review and manage all incoming registrations</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            {submissions.filter(a => a.status === 'pending').length} Pending
          </span>
          <button onClick={fetchSubmissions} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: 'all' as const, label: 'All', count: submissions.length },
          { key: 'discovery_call' as const, label: '📞 Discovery Calls', count: pendingCount('discovery_call') },
          { key: 'workshop' as const, label: '🎯 Workshops', count: pendingCount('workshop') },
          { key: 'lgt_application' as const, label: '👑 LGT Applications', count: pendingCount('lgt_application') },
          { key: 'registration' as const, label: '📝 Registrations', count: pendingCount('registration') },
        ]).map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${filter === t.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}>
            {t.label} {t.count > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-destructive/20 text-destructive">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected', 'info_requested'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground'}`}>
            {s === 'all' ? 'All' : s === 'pending' ? '⏳ Pending' : s === 'approved' ? '✅ Approved' : s === 'rejected' ? '❌ Rejected' : '📋 Info Requested'}
          </button>
        ))}
      </div>

      {/* Application Cards */}
      <div className="space-y-3">
        {filtered.map(sub => {
          const fd = sub.form_data || {};
          return (
            <div key={sub.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <button onClick={() => setExpanded(expanded === sub.id ? null : sub.id)} className="w-full p-4 text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{sub.full_name}</span>
                      {typeBadge(sub.form_type)}
                      {statusBadge(sub.status)}
                      {fd.source === 'tell_us_about_yourself' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#FCE7F3', color: '#9D174D' }}>
                          🌱 New Seeker — Pending Review
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {fd.city || '—'} · {fd.profession || fd.designation || '—'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {timeAgo(sub.created_at)} · {sub.country_code || '+91'}{sub.mobile} · {sub.email}
                    </p>
                    {sub.form_type === 'discovery_call' && fd.selectedSlot && (
                      <p className="text-xs text-primary mt-1">📅 Requested: {fd.selectedDate ? new Date(fd.selectedDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : ''} at {fd.selectedSlot}</p>
                    )}
                    {sub.form_type === 'workshop' && <p className="text-xs text-primary mt-1">🎯 {fd.workshopName || fd.workshopId}</p>}
                    {sub.form_type === 'lgt_application' && <p className="text-xs text-primary mt-1">👑 {fd.programName || fd.programId}</p>}
                  </div>
                  {expanded === sub.id ? <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
                </div>
              </button>
              <div className="px-4 pb-3 flex flex-wrap justify-end gap-2 -mt-1">
                {(sub.status === 'pending' || sub.status === 'info_requested') && (
                  <>
                    <Link
                      to={`/applications/${sub.id}/detailed-intake`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-primary border border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors"
                      title="Open detailed intake form to capture full seeker information"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {fd.detailed_intake_completed_at ? 'Edit Detailed Intake' : 'Fill Detailed Intake'}
                    </Link>
                    {fd.detailed_intake_completed_at && (
                      <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ Detailed info captured
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleQuickApprove(sub.id, sub.full_name); }}
                      disabled={actionLoading}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      title="Approve & create seeker"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpanded(sub.id); setActionId(sub.id); setActionType('reject'); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-destructive hover:bg-destructive/90 transition-colors"
                      title="Reject with reason"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpanded(sub.id); setActionId(sub.id); setActionType('info'); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-primary border border-primary/30 hover:bg-primary/5 transition-colors"
                      title="Ask applicant for more info"
                    >
                      <Send className="w-3.5 h-3.5" /> Ask Info
                    </button>
                  </>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(sub.id, sub.full_name); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs text-destructive hover:bg-destructive/10 border border-destructive/20 transition-colors"
                  title="Delete application"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>

              {expanded === sub.id && (
                <div className="border-t border-border p-4 space-y-4">
                  {/* Full form data */}
                  <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1.5 max-h-96 overflow-y-auto">
                    {Object.entries(fd)
                      .filter(([k, v]) => !SKIP_KEYS.has(k) && v !== '' && v !== null && v !== undefined && v !== false)
                      .map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="font-medium text-foreground whitespace-nowrap">{formatKey(k)}:</span>
                          <span className="text-muted-foreground break-all">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                        </div>
                      ))}
                  </div>

                  {sub.admin_notes && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-sm"><strong>Admin Notes:</strong> {sub.admin_notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {(sub.status === 'pending' || sub.status === 'info_requested') && (
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => updateStatus(sub.id, 'approved')} disabled={actionLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50">
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => { setActionId(sub.id); setActionType('reject'); }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-destructive hover:bg-destructive/90 transition-colors">
                        <X className="w-4 h-4" /> Reject
                      </button>
                      <button onClick={() => { setActionId(sub.id); setActionType('info'); }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-primary border border-primary/30 hover:bg-primary/5 transition-colors">
                        <Send className="w-4 h-4" /> Request Info
                      </button>
                      <a href={`tel:${sub.country_code || '+91'}${sub.mobile}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border"><Phone className="w-4 h-4" /></a>
                      <a href={`https://wa.me/${(sub.country_code || '+91').replace('+', '')}${sub.mobile}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border"><MessageSquare className="w-4 h-4" /></a>
                      <a href={`mailto:${sub.email}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border"><Mail className="w-4 h-4" /></a>
                    </div>
                  )}

                  {/* Reject / Info Request Inline */}
                  {actionId === sub.id && actionType && (
                    <div className={`border rounded-lg p-4 space-y-3 ${actionType === 'reject' ? 'bg-destructive/5 border-destructive/20' : 'bg-primary/5 border-primary/20'}`}>
                      <p className="text-sm font-medium text-foreground">
                        {actionType === 'reject' ? 'Reason for rejection:' : 'What information do you need?'}
                      </p>
                      <textarea
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm min-h-[80px]"
                        value={actionNotes}
                        onChange={e => setActionNotes(e.target.value)}
                        placeholder={actionType === 'reject' ? 'Explain why this application is being rejected...' : 'Describe what additional information you need...'}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(sub.id, actionType === 'reject' ? 'rejected' : 'info_requested', actionNotes)}
                          disabled={actionLoading || !actionNotes.trim()}
                          className={`px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${actionType === 'reject' ? 'bg-destructive' : 'bg-primary'}`}
                        >
                          {actionLoading ? '⏳ Sending...' : actionType === 'reject' ? 'Confirm Reject & Send Email' : 'Request Info & Send Email'}
                        </button>
                        <button onClick={() => { setActionId(null); setActionType(null); setActionNotes(''); }} className="px-4 py-2 rounded-lg text-sm text-muted-foreground border border-border">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-3xl mb-2">📭</p>
            <p>{submissions.length === 0 ? 'No applications received yet. Submissions from the website forms will appear here.' : 'No applications match your filters.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsPage;
