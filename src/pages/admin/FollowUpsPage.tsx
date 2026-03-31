import { useState } from 'react';
import { FOLLOW_UPS, SEEKERS } from '@/data/mockData';
import { Phone, MessageSquare, Mail, Bell, CheckCircle, Clock, AlertTriangle, Send } from 'lucide-react';
import SendReminderModal from '@/components/SendReminderModal';

const filterTabs = ['All', 'Overdue', 'Due Today', 'Upcoming', 'Completed'];
const typeIcons: Record<string, any> = { call: Phone, whatsapp: MessageSquare, email: Mail, in_app: Bell };

const FollowUpsPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [reminder, setReminder] = useState<typeof SEEKERS[0] | null>(null);

  const today = '2025-03-31';
  const filtered = FOLLOW_UPS.filter((f) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Overdue') return f.status === 'overdue';
    if (activeFilter === 'Due Today') return f.due_date === today && f.status === 'pending';
    if (activeFilter === 'Upcoming') return f.due_date > today && f.status === 'pending';
    if (activeFilter === 'Completed') return f.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Follow-ups</h1>
          <p className="text-sm text-muted-foreground">{FOLLOW_UPS.filter(f => f.status !== 'completed').length} pending follow-ups</p>
        </div>
        <button className="gradient-chakravartin text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm hover:opacity-90">
          + New Follow-up
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map((t) => (
          <button key={t} onClick={() => setActiveFilter(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-3 stagger-children">
        {filtered.map((f) => {
          const seeker = SEEKERS.find(s => s.id === f.seeker_id);
          const Icon = typeIcons[f.type] || Bell;
          const isOverdue = f.status === 'overdue';
          const isDueToday = f.due_date === today && f.status === 'pending';
          return (
            <div key={f.id} className={`bg-card rounded-xl p-4 shadow-sm border card-hover ${
              isOverdue ? 'border-destructive/30' : isDueToday ? 'border-warning-amber/30' : 'border-border'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  f.type === 'call' ? 'bg-dharma-green/10' : f.type === 'whatsapp' ? 'bg-dharma-green/10' : f.type === 'email' ? 'bg-sky-blue/10' : 'bg-primary/10'
                }`}>
                  <Icon className={`w-5 h-5 ${f.type === 'call' || f.type === 'whatsapp' ? 'text-dharma-green' : f.type === 'email' ? 'text-sky-blue' : 'text-primary'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{seeker?.full_name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                      isOverdue ? 'bg-destructive/10 text-destructive' :
                      f.status === 'completed' ? 'bg-dharma-green/10 text-dharma-green' :
                      'bg-warning-amber/10 text-warning-amber'
                    }`}>{f.status}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      f.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                      f.priority === 'medium' ? 'bg-warning-amber/10 text-warning-amber' :
                      'bg-muted text-muted-foreground'
                    }`}>{f.priority}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{f.notes}</p>
                  {f.completion_notes && <p className="text-xs text-dharma-green mt-1">✓ {f.completion_notes}</p>}
                  <p className="text-xs text-muted-foreground mt-1">Due: {f.due_date} · {f.type}</p>
                </div>
                {f.status !== 'completed' && (
                  <div className="flex gap-1">
                    {seeker && (
                      <button onClick={() => setReminder(seeker)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1">
                        <Send className="w-3 h-3" /> Message
                      </button>
                    )}
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-dharma-green/10 text-dharma-green hover:bg-dharma-green/20">Complete</button>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80">Reschedule</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">🔄</span>
          <p className="text-muted-foreground">No follow-ups in this category.</p>
        </div>
      )}

      {reminder && (
        <SendReminderModal
          open={!!reminder}
          onClose={() => setReminder(null)}
          seekerName={reminder.full_name}
          seekerPhone={reminder.phone}
          seekerEmail={reminder.email}
          context="general"
        />
      )}
    </div>
  );
};

export default FollowUpsPage;
