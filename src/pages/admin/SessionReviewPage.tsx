import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import SessionComments from '@/components/SessionComments';
import SessionReviewStatus from '@/components/SessionReviewStatus';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft, Check, RotateCcw, Trash2, Pencil, Save, X,
  Loader2, Shield, BookOpen, Clock, User, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SessionData {
  id: string;
  session_number: number;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  session_notes: string | null;
  key_insights: string | null;
  breakthroughs: string | null;
  topics_covered: string[] | null;
  seeker_id: string;
  course_id: string | null;
  revision_note: string | null;
  updated_at: string;
  couple_group_id?: string | null;
  couple_role?: string | null;
}

interface AuditEntry {
  id: string;
  action: string;
  diff: any;
  created_at: string;
  actor_name?: string;
}

const ACTION_LABELS: Record<string, { emoji: string; label: string }> = {
  created: { emoji: '📝', label: 'Created' },
  edited: { emoji: '✏️', label: 'Edited' },
  submitted: { emoji: '📤', label: 'Submitted' },
  approved: { emoji: '✅', label: 'Approved' },
  revision_requested: { emoji: '🔄', label: 'Revision Requested' },
  signed: { emoji: '🖊️', label: 'Signed' },
  commented: { emoji: '💬', label: 'Commented' },
  deleted: { emoji: '🗑️', label: 'Deleted' },
};

const SessionReviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [session, setSession] = useState<SessionData | null>(null);
  const [seekerName, setSeekerName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Couple session: list of all rows in this couple_group, ordered primary first.
  const [coupleTabs, setCoupleTabs] = useState<Array<{ id: string; seeker_name: string; role: string; status: string }>>([]);

  // Inline editing
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Audit log
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    if (id) loadAll();
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data: s, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      
      setSession({
        ...s,
        topics_covered: s.topics_covered as string[] | null,
        revision_note: (s as any).revision_note ?? null,
      } as SessionData);

      const { data: seeker } = await supabase.from('profiles').select('full_name').eq('id', s.seeker_id).single();
      setSeekerName(seeker?.full_name || '');

      if (s.course_id) {
        const { data: course } = await supabase.from('courses').select('name').eq('id', s.course_id).single();
        setCourseName(course?.name || '');
      }

      // Couple-session: discover sibling rows sharing the same couple_group_id
      const coupleGroupId = (s as any).couple_group_id as string | null;
      if (coupleGroupId) {
        const { data: siblings } = await supabase
          .from('sessions')
          .select('id, seeker_id, couple_role, status')
          .eq('couple_group_id', coupleGroupId);
        if (siblings && siblings.length) {
          const seekerIds = siblings.map((r: any) => r.seeker_id);
          const { data: sProfiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', seekerIds);
          const nameMap = new Map((sProfiles || []).map((p: any) => [p.id, p.full_name]));
          const tabs = siblings
            .map((r: any) => ({
              id: r.id,
              seeker_name: nameMap.get(r.seeker_id) || 'Seeker',
              role: r.couple_role || 'primary',
              status: r.status,
            }))
            .sort((a, b) => (a.role === 'primary' ? -1 : 1));
          setCoupleTabs(tabs);
        } else {
          setCoupleTabs([]);
        }
      } else {
        setCoupleTabs([]);
      }

      // Load audit log
      const { data: audit } = await supabase
        .from('session_audit_log')
        .select('*')
        .eq('session_id', id!)
        .order('created_at', { ascending: false });

      if (audit) {
        const actorIds = [...new Set(audit.map(a => a.actor_id).filter(Boolean))];
        const { data: actors } = await supabase.from('profiles').select('id, full_name').in('id', actorIds);
        const actorMap = new Map(actors?.map(a => [a.id, a.full_name]) || []);
        setAuditLog(audit.map(a => ({ ...a, actor_name: actorMap.get(a.actor_id) || 'System' })));
      }
    } catch (err) {
      toast.error('Failed to load session');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (section: string, currentValue: string) => {
    setEditingSection(section);
    setEditValues({ ...editValues, [section]: currentValue });
  };

  const cancelEdit = () => {
    setEditingSection(null);
  };

  const saveEdit = async (section: string) => {
    if (!session) return;
    setSaving(true);
    try {
      const oldValue = (session as any)[section] || '';
      const newValue = editValues[section] || '';
      
      const updatePayload: Record<string, string> = {};
      updatePayload[section] = newValue;
      const { error } = await supabase
        .from('sessions')
        .update(updatePayload as any)
        .eq('id', session.id);
      if (error) throw error;

      await supabase.from('session_audit_log').insert({
        session_id: session.id,
        actor_id: profile?.id,
        action: 'edited',
        diff: { field: section, old: oldValue, new: newValue },
      });

      setSession({ ...session, [section]: newValue });
      setEditingSection(null);
      toast.success('Saved');
    } catch (err) {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!session) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ status: 'approved' })
        .eq('id', session.id);
      if (error) throw error;

      await supabase.from('session_audit_log').insert({
        session_id: session.id,
        actor_id: profile?.id,
        action: 'approved',
      });

      // Send notification to seeker
      await supabase.from('session_notifications').insert({
        recipient_id: session.seeker_id,
        type: 'session_approved',
        title: `Session #${session.session_number} Approved ✅`,
        body: 'Your session has been approved and certified by your coach.',
        session_id: session.id,
      });

      setSession({ ...session, status: 'approved' });
      setShowApproveModal(false);
      toast.success('Session approved ✅');
    } catch (err) {
      toast.error('Failed to approve');
    } finally {
      setSaving(false);
    }
  };

  const handleRevisionRequest = async () => {
    if (!session || revisionNote.length < 20) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ status: 'revision_requested', revision_note: revisionNote } as any)
        .eq('id', session.id);
      if (error) throw error;

      await supabase.from('session_audit_log').insert({
        session_id: session.id,
        actor_id: profile?.id,
        action: 'revision_requested',
        diff: { revision_note: revisionNote },
      });

      // Send notification to seeker
      await supabase.from('session_notifications').insert({
        recipient_id: session.seeker_id,
        type: 'revision_requested',
        title: `Session #${session.session_number} — Revision Requested`,
        body: revisionNote,
        session_id: session.id,
      });

      setSession({ ...session, status: 'revision_requested', revision_note: revisionNote });
      setShowRevisionModal(false);
      setRevisionNote('');
      toast.success('Revision requested');
    } catch (err) {
      toast.error('Failed to request revision');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!session) return;
    setSaving(true);
    try {
      await supabase.from('session_audit_log').insert({
        session_id: session.id,
        actor_id: profile?.id,
        action: 'deleted',
      });

      const { error } = await supabase.from('sessions').delete().eq('id', session.id);
      if (error) throw error;

      toast.success('Session deleted');
      navigate('/sessions');
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Session not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline text-sm">Go back</button>
      </div>
    );
  }

  const s: any = session;
  const seekerHasReflection =
    (s.seeker_what_learned && String(s.seeker_what_learned).trim()) ||
    !!s.seeker_what_learned_audio;
  const approveLocked =
    !s.session_notes || !String(s.session_notes).trim() ||
    !seekerHasReflection ||
    !s.seeker_accepted_at;
  const canApprove = ['completed', 'submitted', 'reviewing'].includes(session.status) && !approveLocked;
  const canRequestRevision = ['completed', 'submitted', 'reviewing'].includes(session.status);

  const renderSection = (
    sectionKey: string,
    label: string,
    emoji: string,
    value: string | null,
  ) => (
    <div className="bg-card rounded-xl border border-border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span>{emoji}</span> {label}
        </h3>
        <div className="flex items-center gap-1">
          <SessionComments sessionId={session.id} sectionName={sectionKey} sectionLabel={label} />
          {editingSection !== sectionKey ? (
            <button
              onClick={() => startEdit(sectionKey, value || '')}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              aria-label={`Edit ${label}`}
            >
              <Pencil className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex gap-1">
              <button onClick={() => saveEdit(sectionKey)} disabled={saving} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20" aria-label="Save">
                <Save className="w-4 h-4" />
              </button>
              <button onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" aria-label="Cancel">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      {editingSection === sectionKey ? (
        <textarea
          value={editValues[sectionKey] || ''}
          onChange={e => setEditValues({ ...editValues, [sectionKey]: e.target.value })}
          className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
          aria-label={`${label} content`}
        />
      ) : (
        <p className="text-sm text-foreground/80 whitespace-pre-wrap">
          {value || <span className="text-muted-foreground italic">No content yet</span>}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted" aria-label="Go back">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">
            Session #{session.session_number} Review
          </h1>
          <p className="text-sm text-muted-foreground">{seekerName} · {session.date}</p>
        </div>
      </div>

      {/* Couple Session — per-seeker tabs */}
      {coupleTabs.length > 1 && (
        <div className="bg-card rounded-xl border-2 border-primary/30 p-3">
          <p className="text-xs text-muted-foreground mb-2 px-1">
            💑 Couple session — fill each seeker's reflection separately. Each tab is approved independently.
          </p>
          <Tabs value={session.id} onValueChange={(v) => navigate(`/sessions/${v}/review`)}>
            <TabsList className="w-full grid grid-cols-2">
              {coupleTabs.map((t, i) => (
                <TabsTrigger key={t.id} value={t.id} className="flex flex-col gap-0.5 h-auto py-2">
                  <span className="text-xs font-semibold">
                    Seeker {i + 1} ({t.role === 'primary' ? 'Primary' : 'Partner'})
                  </span>
                  <span className="text-sm">{t.seeker_name}</span>
                  <span className="text-[10px] text-muted-foreground capitalize">{t.status.replace(/_/g, ' ')}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Status Stepper */}
      <div className="bg-card rounded-xl border border-border p-5">
        <SessionReviewStatus status={session.status} revisionNote={session.revision_note} />
      </div>

      {/* Session Meta */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-primary" /> Session Info
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Seeker</p>
            <p className="font-medium text-foreground">{seekerName}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Date</p>
            <p className="font-medium text-foreground">{session.date}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Duration</p>
            <p className="font-medium text-foreground">{session.duration_minutes} min</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Course</p>
            <p className="font-medium text-foreground">{courseName || 'N/A'}</p>
          </div>
        </div>
        {session.topics_covered && (session.topics_covered as string[]).length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-1">Topics</p>
            <div className="flex flex-wrap gap-1.5">
              {(session.topics_covered as string[]).map((t, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Sections with Inline Edit + Comments */}
      {renderSection('session_notes', 'Session Notes', '📝', session.session_notes)}
      {renderSection('key_insights', 'Key Insights', '💡', session.key_insights)}
      {renderSection('breakthroughs', 'Breakthroughs', '🚀', session.breakthroughs)}
      {renderSection('therapy_given', 'Therapy Given', '🧘', (session as any).therapy_given)}
      {renderSection('major_win', 'Major Win This Week', '🏆', (session as any).major_win)}
      {renderSection('pending_assignments_review', 'Pending Assignments Review', '📝', (session as any).pending_assignments_review)}
      {renderSection('next_week_assignments', 'Next Week Assignments', '📋', (session as any).next_week_assignments)}
      {renderSection('targets', 'Targets', '🎯', (session as any).targets)}
      {renderSection('rewards', 'Rewards', '🏆', (session as any).rewards)}
      {renderSection('punishments', 'Consequences', '⚡', (session as any).punishments)}

      {/* Seeker Reflection (read-only for coach) */}
      {((session as any).seeker_what_learned || (session as any).seeker_where_to_apply || (session as any).seeker_how_to_apply) && (
        <div className="bg-card rounded-xl border-2 border-chakra-indigo/20 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">💭 Seeker's Reflection</h3>
          {(session as any).seeker_what_learned && (
            <div><p className="text-xs font-medium text-muted-foreground">What I Learned</p><p className="text-sm text-foreground/80 whitespace-pre-wrap">{(session as any).seeker_what_learned}</p></div>
          )}
          {(session as any).seeker_where_to_apply && (
            <div><p className="text-xs font-medium text-muted-foreground">Where to Apply</p><p className="text-sm text-foreground/80 whitespace-pre-wrap">{(session as any).seeker_where_to_apply}</p></div>
          )}
          {(session as any).seeker_how_to_apply && (
            <div><p className="text-xs font-medium text-muted-foreground">How to Apply</p><p className="text-sm text-foreground/80 whitespace-pre-wrap">{(session as any).seeker_how_to_apply}</p></div>
          )}
          {(session as any).seeker_accepted_at && (
            <p className="text-xs text-dharma-green font-medium">✅ Accepted on {new Date((session as any).seeker_accepted_at).toLocaleDateString()}</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {canApprove ? (
          <Button onClick={() => setShowApproveModal(true)} className="bg-dharma-green hover:bg-dharma-green/90 text-white gap-2">
            <Check className="w-4 h-4" /> Approve Session
          </Button>
        ) : approveLocked && ['completed', 'submitted', 'reviewing'].includes(session.status) ? (
          <Button disabled variant="outline" className="gap-2 opacity-60 cursor-not-allowed" title="Waiting for seeker to complete Session Notes + Post-Session Reflection and click Save Reflection">
            <Check className="w-4 h-4" /> Approve (locked — waiting on seeker reflection)
          </Button>
        ) : null}
        {canRequestRevision && (
          <Button onClick={() => setShowRevisionModal(true)} variant="outline" className="border-warning-amber text-warning-amber hover:bg-warning-amber/10 gap-2">
            <RotateCcw className="w-4 h-4" /> Request Revision
          </Button>
        )}
        <button
          onClick={() => navigate(`/sessions/${session.id}/certify`)}
          className="px-4 py-2 rounded-xl text-sm font-medium border border-primary text-primary hover:bg-primary/5 flex items-center gap-2"
        >
          <Shield className="w-4 h-4" /> Certify & Sign
        </button>
        <button onClick={() => setShowDeleteModal(true)} className="text-sm text-destructive hover:underline ml-auto">
          Delete Session
        </button>
      </div>

      {/* Audit Log */}
      <div className="bg-card rounded-xl border border-border">
        <button
          onClick={() => setShowAudit(!showAudit)}
          className="w-full flex items-center justify-between p-4 text-sm font-semibold text-foreground"
          aria-label="Toggle audit log"
        >
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" /> Session History
          </span>
          {showAudit ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showAudit && (
          <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
            {auditLog.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">No history yet</p>
            ) : (
              auditLog.map(entry => {
                const cfg = ACTION_LABELS[entry.action] || { emoji: '📋', label: entry.action };
                return (
                  <div key={entry.id} className="flex items-start gap-2 text-xs">
                    <span>{cfg.emoji}</span>
                    <div className="flex-1">
                      <span className="font-medium text-foreground">{entry.actor_name}</span>
                      <span className="text-muted-foreground"> {cfg.label}</span>
                      {entry.diff?.field && (
                        <span className="text-muted-foreground"> ({entry.diff.field})</span>
                      )}
                    </div>
                    <span className="text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Session</DialogTitle>
            <DialogDescription>
              Approve this session? This will notify the seeker and lock the content.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={saving} className="bg-dharma-green hover:bg-dharma-green/90 text-white gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revision Modal */}
      <Dialog open={showRevisionModal} onOpenChange={setShowRevisionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
            <DialogDescription>
              Explain what needs to be revised. The seeker will be notified and can edit the session.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={revisionNote}
            onChange={e => setRevisionNote(e.target.value)}
            placeholder="Describe what needs revision (min 20 characters)..."
            className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
            aria-label="Revision note"
          />
          <p className="text-xs text-muted-foreground">{revisionNote.length}/20 min characters</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevisionModal(false)}>Cancel</Button>
            <Button
              onClick={handleRevisionRequest}
              disabled={saving || revisionNote.length < 20}
              className="bg-warning-amber hover:bg-warning-amber/90 text-white gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Request Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              This cannot be undone. All session data, comments, and signatures will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.checked)}
              className="rounded"
            />
            I understand this cannot be undone
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteConfirm(false); }}>Cancel</Button>
            <Button
              onClick={handleDelete}
              disabled={saving || !deleteConfirm}
              variant="destructive"
              className="gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionReviewPage;
