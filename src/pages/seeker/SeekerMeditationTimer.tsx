import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

const PRESETS = [5, 10, 15, 20];
const MED_TYPES = ['🕉️ Om Chanting', '🌬️ Breath', '💜 Loving-Kindness', '🎯 Focus', '📿 Mantra', '🧘 Body Scan', '🌌 Visualization', '🤫 Silent'];

export default function SeekerMeditationTimer() {
  const { profile } = useAuthStore();
  const profileId = profile?.id;
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState(10);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [selectedType, setSelectedType] = useState('🧘 Body Scan');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['meditation-stats', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      const { data } = await supabase
        .from('daily_worksheets')
        .select('workout_duration_minutes, workout_done')
        .eq('seeker_id', profileId)
        .order('worksheet_date', { ascending: false })
        .limit(90);
      return {
        totalSessions: data?.filter(d => d.workout_done).length || 0,
        totalMinutes: data?.reduce((acc, d) => acc + (d.workout_duration_minutes || 0), 0) || 0,
      };
    },
    enabled: !!profileId,
  });

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0 && running) {
      setRunning(false);
      toast({ title: '🧘 Meditation complete! Well done!' });
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, timeLeft]);

  const startMeditation = () => {
    setTimeLeft(duration * 60);
    setRunning(true);
  };

  const stopMeditation = () => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="p-4 space-y-5 max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 text-white">
        <h1 className="text-xl font-bold">🧘 ध्यान साधना (Meditation Practice)</h1>
        <p className="text-sm text-white/80 mt-1">"शांति भीतर से आती है" - Peace comes from within</p>
      </div>

      {/* Timer */}
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <div className="w-48 h-48 mx-auto rounded-full border-4 border-primary/30 flex items-center justify-center mb-6 relative">
          {running && (
            <div className="absolute inset-0 rounded-full border-4 border-primary animate-pulse" />
          )}
          <div>
            <p className="text-4xl font-mono font-bold text-foreground">
              {running ? formatTime(timeLeft) : `${duration}:00`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">minutes</p>
          </div>
        </div>

        {!running && (
          <div className="flex justify-center gap-2 mb-4">
            {PRESETS.map(p => (
              <button key={p} onClick={() => setDuration(p)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${duration === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {p} min
              </button>
            ))}
          </div>
        )}

        <button
          onClick={running ? stopMeditation : startMeditation}
          className={`px-8 py-3 rounded-xl text-sm font-semibold transition-colors ${running ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
          {running ? '⏹️ Stop' : '▶️ Start Meditation'}
        </button>
      </div>

      {/* Meditation Types */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Meditation Type:</h3>
        <div className="flex flex-wrap gap-2">
          {MED_TYPES.map(t => (
            <button key={t} onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">📊 My Meditation Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Sessions', value: stats?.totalSessions || 0, emoji: '📅' },
            { label: 'Total Minutes', value: stats?.totalMinutes || 0, emoji: '⏱️' },
            { label: 'Avg Duration', value: stats?.totalSessions ? Math.round((stats.totalMinutes || 0) / stats.totalSessions) + ' min' : '0 min', emoji: '⭐' },
            { label: 'Current Type', value: selectedType.split(' ')[1] || 'Body Scan', emoji: '🧘' },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-xl bg-muted/30 text-center">
              <span className="text-lg">{s.emoji}</span>
              <p className="text-lg font-bold text-foreground mt-1">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
