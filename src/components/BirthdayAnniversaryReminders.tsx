import { useEffect, useState } from 'react';
import { Cake, Heart, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReminderItem {
  id: string;
  full_name: string;
  type: 'birthday' | 'anniversary';
  date: string;
  daysUntil: number;
}

const getDaysUntilNextOccurrence = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (next < today) next.setFullYear(next.getFullYear() + 1);
  return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const BirthdayAnniversaryReminders = () => {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, dob, marriage_anniversary')
        .eq('role', 'seeker');

      if (!data) { setLoading(false); return; }

      const items: ReminderItem[] = [];
      for (const p of data) {
        if (p.dob) {
          const days = getDaysUntilNextOccurrence(p.dob);
          if (days <= 30) items.push({ id: p.id, full_name: p.full_name, type: 'birthday', date: p.dob, daysUntil: days });
        }
        if ((p as any).marriage_anniversary) {
          const days = getDaysUntilNextOccurrence((p as any).marriage_anniversary);
          if (days <= 30) items.push({ id: p.id + '-ann', full_name: p.full_name, type: 'anniversary', date: (p as any).marriage_anniversary, daysUntil: days });
        }
      }
      items.sort((a, b) => a.daysUntil - b.daysUntil);
      setReminders(items);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return null;
  if (reminders.length === 0) return null;

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <Gift className="w-4 h-4 text-primary" /> 🎉 Upcoming Celebrations
      </h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {reminders.map((r) => (
          <div
            key={r.id}
            className={`flex items-center gap-3 p-2.5 rounded-lg border-l-[3px] ${
              r.daysUntil === 0
                ? 'bg-primary/10 border-primary'
                : r.daysUntil <= 7
                ? 'bg-warning-amber/5 border-warning-amber'
                : 'bg-muted/30 border-muted-foreground/20'
            }`}
          >
            <span className="text-lg">
              {r.type === 'birthday' ? <Cake className="w-4 h-4 text-lotus-pink" /> : <Heart className="w-4 h-4 text-destructive" />}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{r.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {r.type === 'birthday' ? '🎂 Birthday' : '💍 Anniversary'} ·{' '}
                {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                r.daysUntil === 0
                  ? 'bg-primary text-primary-foreground'
                  : r.daysUntil <= 7
                  ? 'bg-warning-amber/20 text-warning-amber'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {r.daysUntil === 0 ? 'Today! 🎉' : `${r.daysUntil}d`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BirthdayAnniversaryReminders;
