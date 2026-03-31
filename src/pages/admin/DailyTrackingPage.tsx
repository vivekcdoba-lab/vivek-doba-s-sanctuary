import { useState } from 'react';
import { SEEKERS } from '@/data/mockData';
import { Eye, MessageSquare, Bell, Flame, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SendReminderModal from '@/components/SendReminderModal';

const trackingData = [
  { seeker_id: 's1', submitted: true, completion: 92, mood: 8, energy: 7, moodEmoji: '😊' },
  { seeker_id: 's2', submitted: true, completion: 85, mood: 7, energy: 6, moodEmoji: '🙂' },
  { seeker_id: 's3', submitted: true, completion: 95, mood: 9, energy: 9, moodEmoji: '😊' },
  { seeker_id: 's4', submitted: false, completion: 0, mood: 0, energy: 0, moodEmoji: '—' },
  { seeker_id: 's5', submitted: false, completion: 0, mood: 0, energy: 0, moodEmoji: '—' },
  { seeker_id: 's6', submitted: true, completion: 60, mood: 6, energy: 5, moodEmoji: '😐' },
  { seeker_id: 's7', submitted: false, completion: 0, mood: 0, energy: 0, moodEmoji: '—' },
  { seeker_id: 's8', submitted: true, completion: 78, mood: 7, energy: 7, moodEmoji: '🙂' },
  { seeker_id: 's9', submitted: true, completion: 98, mood: 9, energy: 8, moodEmoji: '😊' },
  { seeker_id: 's10', submitted: true, completion: 88, mood: 8, energy: 7, moodEmoji: '😊' },
];

const DailyTrackingPage = () => {
  const [filter, setFilter] = useState<'all' | 'submitted' | 'partial' | 'not_submitted'>('all');
  const [viewEntry, setViewEntry] = useState<string | null>(null);
  const [commentEntry, setCommentEntry] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [reminderSeeker, setReminderSeeker] = useState<any>(null);
  const { toast } = useToast();

  const submitted = trackingData.filter(t => t.submitted).length;
  const total = trackingData.length;
  const longestStreak = SEEKERS.reduce((max, s) => s.streak > max.streak ? s : max, SEEKERS[0]);
  const needsAttention = SEEKERS.filter(s => s.health === 'red').length;

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
          <p className="text-sm text-muted-foreground">31/03/2025 — Today</p>
        </div>
        {unsubmitted.length > 0 && (
          <button onClick={() => {
            toast({ title: `📢 Reminding ${unsubmitted.length} seekers`, description: 'Opening WhatsApp for each...' });
            unsubmitted.forEach((t, i) => {
              const s = SEEKERS.find(s => s.id === t.seeker_id);
              if (s) setTimeout(() => window.open(`https://wa.me/91${s.phone}?text=${encodeURIComponent(`🙏 Namaste ${s.full_name.split(' ')[0]} ji,\n\nYour daily transformation log hasn't been submitted today. Remember — consistency is the bridge between goals and achievements.\n\n🙏 Vivek Doba`)}`, '_blank'), i * 1000);
            });
          }} className="px-4 py-2 rounded-xl bg-destructive/10 text-destructive font-medium text-sm">
            📢 Remind All Unsubmitted ({unsubmitted.length})
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Submitted Today', value: `${submitted} of ${total} (${Math.round(submitted / total * 100)}%)`, color: submitted / total > 0.8 ? 'border-green-500' : submitted / total > 0.5 ? 'border-yellow-500' : 'border-red-500' },
          { label: 'Avg Completion', value: `${Math.round(trackingData.filter(t => t.submitted).reduce((s, t) => s + t.completion, 0) / submitted)}%`, color: 'border-blue-500' },
          { label: 'Longest Streak', value: `${longestStreak.full_name.split(' ')[0]} — ${longestStreak.streak} days 🔥`, color: 'border-primary' },
          { label: 'Needs Attention', value: `${needsAttention} seekers`, color: 'border-destructive' },
        ].map(c => (
          <div key={c.label} className={`bg-card rounded-xl p-4 border-l-4 ${c.color} shadow-sm`}>
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="text-sm font-bold text-foreground mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {([['all', 'All'], ['submitted', '✅ Submitted'], ['partial', '⏳ Partial'], ['not_submitted', '❌ Not Submitted']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{label}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            {['Seeker', 'Today', 'Completion', 'Streak', 'Mood', 'Energy', 'Actions'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(t => {
              const seeker = SEEKERS.find(s => s.id === t.seeker_id);
              if (!seeker) return null;
              return (
                <tr key={t.seeker_id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{seeker.full_name.split(' ').map(n => n[0]).join('')}</div>
                      <span className="font-medium text-foreground">{seeker.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{t.submitted ? <span className="text-green-500 font-medium">✅ Submitted</span> : <span className="text-red-500">❌ Not Submitted</span>}</td>
                  <td className="px-4 py-3">{t.submitted ? <span className={t.completion >= 80 ? 'text-green-500' : 'text-yellow-500'}>{t.completion}%</span> : '—'}</td>
                  <td className="px-4 py-3"><Flame className="w-3 h-3 inline text-orange-500" /> {seeker.streak}</td>
                  <td className="px-4 py-3">{t.submitted ? `${t.moodEmoji} ${t.mood}` : '—'}</td>
                  <td className="px-4 py-3">{t.submitted ? t.energy : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {t.submitted ? (
                        <>
                          <button onClick={() => setViewEntry(viewEntry === t.seeker_id ? null : t.seeker_id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setCommentEntry(commentEntry === t.seeker_id ? null : t.seeker_id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><MessageSquare className="w-3.5 h-3.5" /></button>
                        </>
                      ) : (
                        <button onClick={() => setReminderSeeker(seeker)} className="p-1.5 rounded-lg hover:bg-muted text-destructive"><Bell className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* View Entry Modal */}
      {viewEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={() => setViewEntry(null)}>
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-lg p-6 m-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-3">{SEEKERS.find(s => s.id === viewEntry)?.full_name}'s Daily Log</h3>
            {['🌅 Morning Sadhana — Wake: 5:30 AM, Meditation ✅, Prayer ✅, Exercise ✅', '✨ Affirmations — Repeated 3 times', '📚 Assignment — Business Plan Review in progress', '🏆 Wins — Closed new client deal, Completed 20min meditation, Read 15 pages', '🧘 Body-Mind-Soul — Health: 8, Clarity: 7, Peace: 8', '🌙 Evening — Day rating: ⭐⭐⭐⭐', '🕉️ Purusharthas — Dharma: Aligned, Kama: Joyful'].map(s => (
              <div key={s} className="py-2 border-b border-border last:border-0 text-sm text-foreground">{s}</div>
            ))}
            <button onClick={() => setViewEntry(null)} className="mt-4 w-full py-2 rounded-xl bg-muted text-foreground text-sm">Close</button>
          </div>
        </div>
      )}

      {/* Comment Section */}
      {commentEntry && (
        <div className="bg-card rounded-xl border border-border p-4 mt-2">
          <h4 className="text-sm font-semibold text-foreground mb-2">💬 Comment on {SEEKERS.find(s => s.id === commentEntry)?.full_name}'s entry</h4>
          <div className="flex gap-2 mb-2 flex-wrap">
            {[{ label: '💪 Encouragement', color: 'bg-green-500/10 text-green-600' }, { label: '💡 Suggestion', color: 'bg-blue-500/10 text-blue-500' }, { label: '⚠️ Concern', color: 'bg-red-500/10 text-red-500' }, { label: '🎉 Celebration', color: 'bg-primary/10 text-primary' }].map(t => (
              <button key={t.label} className={`px-2.5 py-1 rounded-full text-xs font-medium ${t.color}`}>{t.label}</button>
            ))}
          </div>
          <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write your comment..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm mb-2" rows={2} />
          <div className="flex gap-2">
            <button onClick={() => { toast({ title: '✅ Comment sent!' }); setCommentEntry(null); setCommentText(''); }} className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1"><Send className="w-3 h-3" /> Submit</button>
            <button onClick={() => setCommentEntry(null)} className="px-4 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm">Cancel</button>
          </div>
        </div>
      )}

      {reminderSeeker && (
        <SendReminderModal
          isOpen={!!reminderSeeker}
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
