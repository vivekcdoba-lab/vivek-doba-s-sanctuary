import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Lock, Eye, FileText, CheckCircle2, Lightbulb, ClipboardList, GraduationCap, Edit2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface SessionNotesPanelProps {
  sessionId: string;
  sessionTitle?: string;
  sessionDate?: string;
  coachName?: string;
  viewMode: 'seeker' | 'coach';
}

interface SessionNote {
  id: string;
  session_id: string;
  author_id: string;
  author_role: string | null;
  note_type: string | null;
  content: string;
  is_private: boolean | null;
  attachments_json: any;
  created_at: string;
  updated_at: string;
}

const NOTE_TYPES = [
  { value: 'preparation', label: 'Preparation', icon: FileText, emoji: '📋', color: 'bg-blue-500/10 text-blue-600' },
  { value: 'during', label: 'Key Insights', icon: Lightbulb, emoji: '💡', color: 'bg-yellow-500/10 text-yellow-600' },
  { value: 'reflection', label: 'Reflection', icon: Edit2, emoji: '🪞', color: 'bg-purple-500/10 text-purple-600' },
  { value: 'action_items', label: 'Action Items', icon: CheckCircle2, emoji: '✅', color: 'bg-green-500/10 text-green-600' },
];

const SessionNotesPanel = ({ sessionId, sessionTitle, sessionDate, coachName, viewMode }: SessionNotesPanelProps) => {
  const { profile } = useAuthStore();
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // New note form
  const [newNoteType, setNewNoteType] = useState('during');
  const [newContent, setNewContent] = useState('');
  const [newIsPrivate, setNewIsPrivate] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [sessionId, profile?.id]);

  const loadNotes = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('session_notes')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      if (error) throw error;

      // Filter: seekers only see non-private coach notes + their own notes
      const filtered = (data || []).filter((n: any) => {
        if (viewMode === 'coach') return true;
        if (n.author_id === profile?.id) return true;
        if (n.author_role === 'coach' && !n.is_private) return true;
        return false;
      }) as SessionNote[];

      setNotes(filtered);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newContent.trim() || !profile?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('session_notes').insert({
        session_id: sessionId,
        author_id: profile.id,
        author_role: viewMode,
        note_type: newNoteType,
        content: newContent.trim(),
        is_private: newIsPrivate,
      });
      if (error) throw error;
      toast.success('Note saved! ✨');
      setNewContent('');
      setShowNewForm(false);
      setNewIsPrivate(false);
      loadNotes();
    } catch {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('session_notes')
        .update({ content: editContent.trim() })
        .eq('id', noteId);
      if (error) throw error;
      toast.success('Updated!');
      setEditingId(null);
      loadNotes();
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePrivacy = async (noteId: string, currentPrivate: boolean) => {
    try {
      const { error } = await supabase.from('session_notes')
        .update({ is_private: !currentPrivate })
        .eq('id', noteId);
      if (error) throw error;
      toast.success(currentPrivate ? 'Now shared with seeker' : 'Made private');
      loadNotes();
    } catch {
      toast.error('Failed to update privacy');
    }
  };

  // Group notes by type
  const notesByType = NOTE_TYPES.map(type => ({
    ...type,
    notes: notes.filter(n => n.note_type === type.value),
  }));

  // Parse action items from content
  const parseActionItems = (content: string) => {
    return content.split('\n').filter(line => line.trim()).map(line => {
      const cleaned = line.replace(/^[\d]+\.\s*/, '').replace(/^[-•]\s*/, '').trim();
      return { text: cleaned, checked: false };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            📝 Session Notes
          </h2>
          {sessionTitle && (
            <p className="text-sm text-muted-foreground">
              "{sessionTitle}" {coachName && `with ${coachName}`}
              {sessionDate && ` • ${format(parseISO(sessionDate), 'MMM d, yyyy')}`}
            </p>
          )}
        </div>
        <Button
          onClick={() => setShowNewForm(!showNewForm)}
          size="sm"
          variant={showNewForm ? 'secondary' : 'default'}
        >
          {showNewForm ? 'Cancel' : '+ Add Note'}
        </Button>
      </div>

      {/* New Note Form */}
      {showNewForm && (
        <Card className="border-primary/30 shadow-lg animate-in slide-in-from-top-2">
          <CardContent className="p-4 space-y-3">
            {/* Note Type Selector */}
            <div className="flex flex-wrap gap-2">
              {NOTE_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setNewNoteType(type.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    newNoteType === type.value
                      ? 'bg-primary text-primary-foreground shadow-md scale-105'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {type.emoji} {type.label}
                </button>
              ))}
            </div>

            <Textarea
              placeholder={
                newNoteType === 'preparation' ? 'What do you want to discuss or prepare for this session?'
                : newNoteType === 'action_items' ? 'List action items (one per line)...'
                : newNoteType === 'reflection' ? 'What insights or realizations came from this session?'
                : 'Write your key insights and observations...'
              }
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              rows={4}
              className="resize-none"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="private-toggle"
                  checked={newIsPrivate}
                  onCheckedChange={setNewIsPrivate}
                />
                <Label htmlFor="private-toggle" className="text-xs text-muted-foreground flex items-center gap-1">
                  {newIsPrivate ? <><Lock className="h-3 w-3" /> Private (only you)</> : <><Eye className="h-3 w-3" /> Shared</>}
                </Label>
              </div>
              <Button onClick={handleSaveNote} disabled={!newContent.trim() || saving} size="sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                Save Note
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes Display by Type */}
      {notesByType.map(type => {
        if (type.notes.length === 0) return null;
        return (
          <Card key={type.value} className="overflow-hidden">
            <CardHeader className="py-3 px-4 bg-muted/30">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                {type.emoji} {type.label.toUpperCase()}
                <Badge variant="secondary" className="text-xs">{type.notes.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {type.notes.map(note => (
                <div
                  key={note.id}
                  className={`rounded-lg p-3 border transition-all ${
                    note.author_role === 'coach'
                      ? 'bg-accent/30 border-accent/50'
                      : 'bg-card border-border'
                  }`}
                >
                  {/* Note Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {note.author_role === 'coach' && (
                        <Badge variant="secondary" className="text-xs">
                          <GraduationCap className="h-3 w-3 mr-1" /> Coach
                        </Badge>
                      )}
                      {note.is_private && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          <Lock className="h-3 w-3 mr-1" /> Private
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(note.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Edit & Privacy toggles for note owner */}
                      {note.author_id === profile?.id && (
                        <>
                          {viewMode === 'coach' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => handleTogglePrivacy(note.id, !!note.is_private)}
                            >
                              {note.is_private ? <Eye className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              setEditingId(note.id);
                              setEditContent(note.content);
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Note Content or Edit Mode */}
                  {editingId === note.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                        <Button size="sm" onClick={() => handleUpdateNote(note.id)} disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {type.value === 'action_items' ? (
                        <div className="space-y-1.5">
                          {parseActionItems(note.content).map((item, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Checkbox className="mt-0.5" />
                              <span className="text-sm text-foreground">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                          {note.content}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Empty state */}
      {notes.length === 0 && !showNewForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">No notes yet for this session</p>
            <p className="text-sm text-muted-foreground mt-1">
              {viewMode === 'seeker'
                ? 'Add preparation notes before your session or reflections after'
                : 'Add coaching notes, insights, and action items'}
            </p>
            <Button className="mt-4" onClick={() => setShowNewForm(true)}>
              + Add First Note
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SessionNotesPanel;
