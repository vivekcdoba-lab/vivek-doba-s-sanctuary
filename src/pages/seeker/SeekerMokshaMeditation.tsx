import { useState, useEffect } from 'react';
import BackToHome from '@/components/BackToHome';
import { Sunrise, Clock, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export default function SeekerMokshaMeditation() {
  const { profile } = useAuthStore();
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [targetMinutes, setTargetMinutes] = useState(10);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const { data: logs = [] } = useQuery({
    queryKey: ['japa-logs', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('japa_log')
        .select('*')
        .eq('seeker_id', profile!.id)
        .order('log_date', { ascending: false })
        .limit(7);
      return data || [];
    },
  });

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pct = Math.min((seconds / (targetMinutes * 60)) * 100, 100);

  const handleReset = () => { setRunning(false); setSeconds(0); };
  const handleComplete = () => {
    setRunning(false);
    toast({ title: `🧘 ${mins} minute${mins !== 1 ? 's' : ''} meditation complete!` });
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <BackToHome />
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--wisdom-purple))]/10 flex items-center justify-center mx-auto">
          <Sunrise className="w-8 h-8 text-[hsl(var(--wisdom-purple))]" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">🧘 Meditation Practice</h1>
        <p className="text-sm text-muted-foreground">Find your inner stillness</p>
      </div>

      {/* Timer */}
      <div className="bg-card rounded-xl border border-border p-6 text-center">
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="hsl(var(--muted))" strokeWidth="2" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="hsl(var(--wisdom-purple))" strokeWidth="2"
              strokeDasharray={`${pct}, 100`} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground font-mono">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
            <span className="text-[10px] text-muted-foreground">/ {targetMinutes} min</span>
          </div>
        </div>

        {/* Target selector */}
        <div className="flex justify-center gap-2 mb-4">
          {[5, 10, 15, 20, 30].map(m => (
            <button key={m} onClick={() => !running && setTargetMinutes(m)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${targetMinutes === m ? 'bg-[hsl(var(--wisdom-purple))] text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {m}m
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <button onClick={() => setRunning(!running)}
            className="w-14 h-14 rounded-full bg-[hsl(var(--wisdom-purple))] text-primary-foreground flex items-center justify-center hover:opacity-90">
            {running ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
          <button onClick={handleReset}
            className="w-14 h-14 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80">
            <RotateCcw className="w-5 h-5" />
          </button>
          {seconds > 60 && (
            <button onClick={handleComplete}
              className="w-14 h-14 rounded-full bg-[hsl(var(--dharma-green))] text-primary-foreground flex items-center justify-center hover:opacity-90">
              <CheckCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Recent Japa logs */}
      {logs.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3">📿 Recent Japa Practice</h3>
          <div className="space-y-2">
            {logs.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{format(new Date(l.log_date), 'MMM dd')}</span>
                <span className="text-foreground font-medium">{l.mala_count} malas ({l.total_count} counts)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
