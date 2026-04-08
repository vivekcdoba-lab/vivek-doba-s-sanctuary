import { useState } from 'react';
import { Phone, MessageSquare, Mail, Bell, Send, Plus } from 'lucide-react';
import SendReminderModal from '@/components/SendReminderModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useDbFollowUps, useCreateFollowUp } from '@/hooks/useDbFollowUps';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { Loader2 } from 'lucide-react';

const filterTabs = ['All', 'Overdue', 'Due Today', 'Upcoming', 'Completed'];
const typeIcons: Record<string, any> = { call: Phone, whatsapp: MessageSquare, email: Mail, in_app: Bell };

const FollowUpsPage = () => {
  const { data: followUps = [], isLoading } = useDbFollowUps();
  const { data: seekers = [] } = useSeekerProfiles();
  const createFollowUp = useCreateFollowUp();
  const [activeFilter, setActiveFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState({ seeker_id: '', type: 'call', due_date: '', priority: 'medium', notes: '' });

  const today = new Date().toISOString().split('T')[0];
  const filtered = followUps.filter(f => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Overdue') return f.status === 'overdue' || (f.due_date < today && f.status === 'pending');
    if (activeFilter === 'Due Today') return f.due_date === today && f.status === 'pending';
    if (activeFilter === 'Upcoming') return f.due_date > today && f.status === 'pending';
    if (activeFilter === 'Completed') return f.status === 'completed';
    return true;
  });

  const handleCreate = async () => {
    if (!newFollowUp.seeker_id || !newFollowUp.due_date) { toast.error('Please select Seeker and Due Date'); return; }
    try {
      await createFollowUp.mutateAsync({ seeker_id: newFollowUp.seeker_id, type: newFollowUp.type, due_date: newFollowUp.due_date, priority: newFollowUp.priority, notes: newFollowUp.notes });
      toast.success('Follow-up created!');
      setShowCreate(false);
      setNewFollowUp({ seeker_id: '', type: 'call', due_date: '', priority: 'medium', notes: '' });
    } catch (e: any) { toast.error(e.message); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Follow-ups</h1>
          <p className="text-sm text-muted-foreground">{followUps.filter(f => f.status !== 'completed').length} pending</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="gradient-chakravartin text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm hover:opacity-90 flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New Follow-up
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map(t => (
          <button key={t} onClick={() => setActiveFilter(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-3 stagger-children">
        {filtered.map(f => {
          const seeker = seekers.find(s => s.id === f.seeker_id);
          const Icon = typeIcons[f.type] || Bell;
          const isOverdue = f.status === 'overdue' || (f.due_date < today && f.status === 'pending');
          return (
            <div key={f.id} className={`bg-card rounded-xl p-4 shadow-sm border card-hover ${isOverdue ? 'border-destructive/30' : 'border-border'}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{seeker?.full_name || 'Unknown'}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${isOverdue ? 'bg-destructive/10 text-destructive' : f.status === 'completed' ? 'bg-dharma-green/10 text-dharma-green' : 'bg-warning-amber/10 text-warning-amber'}`}>{isOverdue ? 'overdue' : f.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{f.notes}</p>
                  <p className="text-xs text-muted-foreground mt-1">Due: {f.due_date} · {f.type}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <div className="text-center py-16"><span className="text-5xl block mb-4">🔄</span><p className="text-muted-foreground">No follow-ups in this category.</p></div>}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>📞 New Follow-up</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Seeker *</label>
              <select value={newFollowUp.seeker_id} onChange={e => setNewFollowUp(p => ({ ...p, seeker_id: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                <option value="">Select Seeker</option>
                {seekers.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Due Date *</label>
              <input type="date" value={newFollowUp.due_date} onChange={e => setNewFollowUp(p => ({ ...p, due_date: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Notes</label>
              <textarea value={newFollowUp.notes} onChange={e => setNewFollowUp(p => ({ ...p, notes: e.target.value }))} className="mt-1 w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <button onClick={handleCreate} disabled={createFollowUp.isPending} className="w-full py-2.5 rounded-xl gradient-chakravartin text-primary-foreground font-medium text-sm">
              {createFollowUp.isPending ? 'Creating...' : 'Create Follow-up'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FollowUpsPage;
