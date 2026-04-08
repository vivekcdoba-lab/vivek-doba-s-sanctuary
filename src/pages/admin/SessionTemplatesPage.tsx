import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Plus, Trash2, Loader2, BookOpen, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  default_topic_ids: string[];
  default_assignments: any[];
  created_at: string;
}

const SessionTemplatesPage = () => {
  const { profile } = useAuthStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [assignments, setAssignments] = useState<{ title: string; description: string; priority: string }[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('session_templates')
      .select('*')
      .order('created_at', { ascending: false });
    setTemplates((data || []).map(t => ({
      ...t,
      default_topic_ids: (t.default_topic_ids as string[]) || [],
      default_assignments: (t.default_assignments as any[]) || [],
    })));
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!name.trim() || !profile?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('session_templates').insert({
        coach_id: profile.id,
        name: name.trim(),
        default_assignments: assignments.filter(a => a.title.trim()),
      });
      if (error) throw error;
      toast.success('Template created');
      setShowCreate(false);
      setName('');
      setAssignments([]);
      loadTemplates();
    } catch (err) {
      toast.error('Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('session_templates').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Template deleted');
      setShowDelete(null);
      loadTemplates();
    }
  };

  const addAssignment = () => {
    setAssignments([...assignments, { title: '', description: '', priority: 'medium' }]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Session Templates</h1>
          <p className="text-sm text-muted-foreground">Save reusable session structures with default assignments</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <h3 className="text-foreground font-semibold">No templates yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Create a template to speed up session setup</p>
          <Button onClick={() => setShowCreate(true)} className="mt-4 gap-2">
            <Plus className="w-4 h-4" /> Create Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">{t.name}</h3>
                </div>
                <button
                  onClick={() => setShowDelete(t.id)}
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  aria-label="Delete template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>{t.default_assignments.length} default assignment{t.default_assignments.length !== 1 ? 's' : ''}</p>
                <p>Created {new Date(t.created_at).toLocaleDateString()}</p>
              </div>
              {t.default_assignments.length > 0 && (
                <div className="mt-3 space-y-1">
                  {t.default_assignments.slice(0, 3).map((a: any, i: number) => (
                    <div key={i} className="text-xs bg-muted/50 rounded px-2 py-1 text-foreground/70">
                      • {a.title}
                    </div>
                  ))}
                  {t.default_assignments.length > 3 && (
                    <p className="text-[10px] text-muted-foreground">+{t.default_assignments.length - 3} more</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="template-name">Template Name</label>
              <input
                id="template-name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="e.g., Leadership Deep Dive"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Default Assignments</label>
                <button onClick={addAssignment} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              {assignments.map((a, i) => (
                <div key={i} className="space-y-2 mb-3 p-3 bg-muted/30 rounded-lg">
                  <input
                    value={a.title}
                    onChange={e => {
                      const updated = [...assignments];
                      updated[i].title = e.target.value;
                      setAssignments(updated);
                    }}
                    className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs"
                    placeholder="Assignment title"
                    aria-label={`Assignment ${i + 1} title`}
                  />
                  <input
                    value={a.description}
                    onChange={e => {
                      const updated = [...assignments];
                      updated[i].description = e.target.value;
                      setAssignments(updated);
                    }}
                    className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs"
                    placeholder="Description (optional)"
                    aria-label={`Assignment ${i + 1} description`}
                  />
                  <select
                    value={a.priority}
                    onChange={e => {
                      const updated = [...assignments];
                      updated[i].priority = e.target.value;
                      setAssignments(updated);
                    }}
                    className="rounded border border-input bg-background px-2 py-1 text-xs"
                    aria-label={`Assignment ${i + 1} priority`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !name.trim()} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently delete this template. Are you sure?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)} className="gap-2">
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionTemplatesPage;
