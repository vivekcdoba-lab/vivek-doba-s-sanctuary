import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { BackToHome } from '@/components/BackToHome';
import { BookOpen, CalendarDays, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

export default function SeekerSessionHistory() {
  const { profile } = useAuthStore();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['seeker-session-history', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*, courses(name)')
        .eq('seeker_id', profile!.id)
        .in('status', ['completed', 'approved', 'submitted', 'reviewing', 'missed'])
        .order('date', { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; icon: any }> = {
      completed: { cls: 'bg-[hsl(var(--dharma-green))]/10 text-[hsl(var(--dharma-green))]', icon: CheckCircle },
      approved: { cls: 'bg-primary/10 text-primary', icon: CheckCircle },
      missed: { cls: 'bg-destructive/10 text-destructive', icon: XCircle },
      submitted: { cls: 'bg-[hsl(var(--sky-blue))]/10 text-[hsl(var(--sky-blue))]', icon: BookOpen },
      reviewing: { cls: 'bg-[hsl(var(--warning-amber))]/10 text-[hsl(var(--warning-amber))]', icon: BookOpen },
    };
    const s = map[status] || map.submitted;
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.cls}`}>
        <Icon className="w-3 h-3" />{status}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground">🕐 Session History</h1>
      <p className="text-sm text-muted-foreground">Your past coaching sessions</p>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : sessions.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No session history yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s: any) => (
            <Link key={s.id} to={`/seeker/sessions/${s.id}`}
              className="flex items-center gap-4 bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all">
              <div className="w-12 h-12 rounded-lg bg-muted flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground">{format(parseISO(s.date), 'MMM')}</span>
                <span className="text-lg font-bold text-foreground leading-none">{format(parseISO(s.date), 'dd')}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm truncate">{s.session_name || `Session #${s.session_number}`}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{s.start_time}</span>
                  {s.duration_minutes && <span className="text-[10px] text-muted-foreground">{s.duration_minutes}min</span>}
                  {statusBadge(s.status)}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
