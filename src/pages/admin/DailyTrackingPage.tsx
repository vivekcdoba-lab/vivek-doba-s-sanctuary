import { useState } from 'react';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Eye, MessageSquare, Bell, Flame, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SendReminderModal from '@/components/SendReminderModal';

const DailyTrackingPage = () => {
  const [filter, setFilter] = useState<'all' | 'submitted' | 'partial' | 'not_submitted'>('all');
  const [viewEntry, setViewEntry] = useState<string | null>(null);
  const [commentEntry, setCommentEntry] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [reminderSeeker, setReminderSeeker] = useState<any>(null);
  const { toast } = useToast();

  const { data: seekers = [], isLoading: seekersLoading } = useSeekerProfiles();

  const todayStr = new Date().toISOString().split('T')[0];

  const { data: todaysWorksheets = [], isLoading: wsLoading } = useQuery({
    queryKey: ['today-worksheets', todayStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_worksheets')
        .select('seeker_id, is_submitted, completion_rate_percent, morning_mood, morning_energy_score')
        .eq('worksheet_date', todayStr);
      if (error) throw error;
      return data || [];
    },
  });

  if (seekersLoading || wsLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const trackingData = seekers.map(s => {
    const ws = todaysWorksheets.find((w: any) => w.seeker_id === s.id);
    return {
      seeker_id: s.id,
      seeker_name: s.full_name,
      phone: s.phone,
      email: s.email,
      submitted: !!ws?.is_submitted,
      completion: ws?.completion_rate_percent || 0,
      mood: ws?.morning_mood || '—',
      energy: ws?.morning_energy_score || 0,
    };
  });

  const submitted = trackingData.filter(t => t.submitted).length;
  const total = trackingData.length;

  const filtered = trackingData.filter(t => {
    if (filter === 'submitted') return t.submitted && t.completion >= 80;
    if (filter === 'partial') return t.submitted && t.completion < 80;
    if (filter === 'not_submitted') return !t.submitted;
    return true;
  });

  const unsubmitted = trackingData.filter(t => !t.submitted);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Tracking Monitor</h1>
          <p className="text-sm text-muted-foreground">{todayStr} — Today</p>
        </div>
        {unsubmitted.length > 0 && (
          <button onClick={() => {
            toast({ title: `📢 Reminding ${unsubmitted.length} seekers` });
          }} className="px-4 py-2 rounded-xl bg-destructive/10 text-destructive font-medium text-sm">
            📢 Remind All ({unsubmitted.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className={`bg-card rounded-xl p-4 border-l-4 shadow-sm ${total > 0 && submitted / total > 0.8 ? 'border-green-500' : submitted / total > 0.5 ? 'border-yellow-500' : 'border-red-500'}`}>
          <p className="text-xs text-muted-foreground">Submitted Today</p>
          <p className="text-sm font-bold text-foreground mt-1">{submitted} of {total} ({total > 0 ? Math.round(submitted / total * 100) : 0}%)</p>
        </div>
        <div className="bg-card rounded-xl p-4 border-l-4 border-blue-500 shadow-sm">
          <p className="text-xs text-muted-foreground">Avg Completion</p>
          <p className="text-sm font-bold text-foreground mt-1">{submitted > 0 ? Math.round(trackingData.filter(t => t.submitted).reduce((s, t) => s + t.completion, 0) / submitted) : 0}%</p>
        </div>
        <div className="bg-card rounded-xl p-4 border-l-4 border-destructive shadow-sm">
          <p className="text-xs text-muted-foreground">Not Submitted</p>
          <p className="text-sm font-bold text-foreground mt-1">{unsubmitted.length} seekers</p>
        </div>
      </div>

      <div className="flex gap-2">
        {([['all', 'All'], ['submitted', '✅ Submitted'], ['partial', '⏳ Partial'], ['not_submitted', '❌ Not Submitted']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{label}</button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            {['Seeker', 'Today', 'Completion', 'Mood', 'Energy', 'Actions'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No data for this filter.</td></tr>
            )}
            {filtered.map(t => (
              <tr key={t.seeker_id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{t.seeker_name.split(' ').map(n => n[0]).join('')}</div>
                    <span className="font-medium text-foreground">{t.seeker_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{t.submitted ? <span className="text-green-500 font-medium">✅ Submitted</span> : <span className="text-red-500">❌ Not Submitted</span>}</td>
                <td className="px-4 py-3">{t.submitted ? <span className={t.completion >= 80 ? 'text-green-500' : 'text-yellow-500'}>{t.completion}%</span> : '—'}</td>
                <td className="px-4 py-3">{t.submitted ? t.mood : '—'}</td>
                <td className="px-4 py-3">{t.submitted ? t.energy : '—'}</td>
                <td className="px-4 py-3">
                  {!t.submitted && (
                    <button onClick={() => setReminderSeeker({ full_name: t.seeker_name, phone: t.phone, email: t.email })} className="p-1.5 rounded-lg hover:bg-muted text-destructive"><Bell className="w-3.5 h-3.5" /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reminderSeeker && (
        <SendReminderModal
          open={!!reminderSeeker}
          onClose={() => setReminderSeeker(null)}
          seekerName={reminderSeeker.full_name}
          seekerPhone={reminderSeeker.phone}
          seekerEmail={reminderSeeker.email}
          context="tracking"
        />
      )}
    </div>
  );
};

export default DailyTrackingPage;
