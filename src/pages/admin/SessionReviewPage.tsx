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
      
      const { error } = await supabase
        .from('sessions')
        .update({ [section]: newValue })
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

  const canApprove = ['completed', 'submitted', 'reviewing'].includes(session.status);
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {canApprove && (
          <Button onClick={() => setShowApproveModal(true)} className="bg-dharma-green hover:bg-dharma-green/90 text-white gap-2">
            <Check className="w-4 h-4" /> Approve Session
          </Button>
        )}
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
