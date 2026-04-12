import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { format, subDays, startOfWeek, addDays } from 'date-fns';
import { Clock, Droplets, Utensils, Footprints, Zap, Brain, Save } from 'lucide-react';

const energyEmojis = ['😫', '😴', '😐', '🙂', '😊', '😄', '💪', '🔥', '⚡', '🚀'];

const SeekerTimeSheet = () => {
  const { profile } = useAuthStore();
  const profileId = profile?.id;
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: existing, isLoading } = useQuery({
    queryKey: ['timesheet', profileId, today],
    queryFn: async () => {
      if (!profileId) return null;
      const { data } = await supabase
        .from('time_sheets')
        .select('*')
        .eq('seeker_id', profileId)
        .eq('date', today)
        .maybeSingle();
      return data;
    },
    enabled: !!profileId,
  });

  const [form, setForm] = useState({
    wake_up_time: existing?.wake_up_time || '05:45',
    sleep_time: existing?.sleep_time || '22:30',
    meditation_minutes: existing?.meditation_minutes || 0,
    exercise_minutes: existing?.exercise_minutes || 0,
    reading_minutes: existing?.reading_minutes || 0,
    work_hours: existing?.work_hours || 8,
    family_hours: existing?.family_hours || 2,
    learning_hours: existing?.learning_hours || 1,
    spiritual_practice_minutes: existing?.spiritual_practice_minutes || 0,
    screen_time_hours: existing?.screen_time_hours || 2,
    water_glasses: existing?.water_glasses || 8,
    meals_count: existing?.meals_count || 3,
    productivity_score: existing?.productivity_score || 7,
    energy_level: existing?.energy_level || 7,
    notes: existing?.notes || '',
  });

  // Sync form when data loads
  useState(() => {
    if (existing) {
      setForm(prev => ({ ...prev, ...existing }));
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profileId) throw new Error('No profile');
      const payload = { seeker_id: profileId, date: today, ...form };
      if (existing) {
        const { error } = await supabase.from('time_sheets').update(payload).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('time_sheets').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet'] });
      toast({ title: '✅ Time Sheet Saved!' });
    },
    onError: () => toast({ title: '❌ Error saving', variant: 'destructive' }),
  });

  // Weekly summary
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const { data: weekData = [] } = useQuery({
    queryKey: ['timesheet-week', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const { data } = await supabase
        .from('time_sheets')
        .select('date, energy_level, meditation_minutes, sleep_hours')
        .eq('seeker_id', profileId)
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(addDays(weekStart, 6), 'yyyy-MM-dd'));
      return data || [];
    },
    enabled: !!profileId,
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const entry = weekData.find(w => w.date === dateStr);
    const isToday = dateStr === today;
    return { day: format(d, 'EEE'), date: dateStr, entry, isToday };
  });

  const sleepHours = (() => {
    try {
      const [wh, wm] = form.wake_up_time.split(':').map(Number);
      const [sh, sm] = form.sleep_time.split(':').map(Number);
      const wake = wh + wm / 60;
      const sleep = sh + sm / 60;
      return wake < sleep ? 24 - sleep + wake : wake - sleep;
    } catch { return 0; }
  })();

  const timeAllocations = [
    { label: 'Meditation', emoji: '🧘', value: form.meditation_minutes, max: 120, unit: 'min', key: 'meditation_minutes' },
    { label: 'Exercise', emoji: '🏃', value: form.exercise_minutes, max: 120, unit: 'min', key: 'exercise_minutes' },
    { label: 'Reading', emoji: '📖', value: form.reading_minutes, max: 180, unit: 'min', key: 'reading_minutes' },
    { label: 'Work', emoji: '💼', value: form.work_hours, max: 16, unit: 'hrs', key: 'work_hours' },
    { label: 'Family', emoji: '👨‍👩‍👧', value: form.family_hours, max: 8, unit: 'hrs', key: 'family_hours' },
    { label: 'Learning', emoji: '📚', value: form.learning_hours, max: 8, unit: 'hrs', key: 'learning_hours' },
    { label: 'Spiritual', emoji: '🕉️', value: form.spiritual_practice_minutes, max: 120, unit: 'min', key: 'spiritual_practice_minutes' },
    { label: 'Screen Time', emoji: '📱', value: form.screen_time_hours, max: 12, unit: 'hrs', key: 'screen_time_hours' },
  ];

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="p-4 space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">⏰ Daily Time Sheet</h1>
          <p className="text-sm text-muted-foreground">"Track Your Time, Transform Your Life"</p>
        </div>
        <span className="text-sm text-muted-foreground">📅 {format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
      </div>

      {/* Wake & Sleep */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">🌅 Wake & Sleep</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Wake Up:</span>
              <Input type="time" className="w-32" value={form.wake_up_time} onChange={e => setForm(p => ({ ...p, wake_up_time: e.target.value }))} />
            </div>
            <div className="flex-1 h-1 bg-muted rounded-full relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-indigo-500 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sleep:</span>
              <Input type="time" className="w-32" value={form.sleep_time} onChange={e => setForm(p => ({ ...p, sleep_time: e.target.value }))} />
            </div>
          </div>
          <p className="text-center text-sm mt-2 text-muted-foreground">
            Hours Slept: <span className="font-semibold text-foreground">{sleepHours.toFixed(1)} hrs</span> {sleepHours >= 7 ? '✅' : '⚠️'}
          </p>
        </CardContent>
      </Card>

      {/* Time Allocation */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">⏱️ Time Allocation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {timeAllocations.map(t => (
            <div key={t.key} className="flex items-center gap-3">
              <span className="text-lg w-6">{t.emoji}</span>
              <span className="text-sm w-24 text-muted-foreground">{t.label}</span>
              <div className="flex-1">
                <Slider
                  value={[Number(t.value)]}
                  max={t.max}
                  step={t.unit === 'min' ? 5 : 0.5}
                  onValueChange={([v]) => setForm(p => ({ ...p, [t.key]: v }))}
                  className="flex-1"
                />
              </div>
              <span className="text-sm font-semibold w-16 text-right text-foreground">{t.value} {t.unit}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Health Trackers */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">💧 Health Trackers</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-blue-500" />
            <span className="text-sm w-16 text-muted-foreground">Water:</span>
            <div className="flex gap-1 flex-1">
              {Array.from({ length: 10 }, (_, i) => (
                <button key={i} onClick={() => setForm(p => ({ ...p, water_glasses: i + 1 }))}
                  className={`text-lg transition-transform hover:scale-110 ${i < (form.water_glasses || 0) ? '' : 'opacity-30'}`}>
                  💧
                </button>
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">{form.water_glasses}/10</span>
          </div>
          <div className="flex items-center gap-3">
            <Utensils className="w-5 h-5 text-amber-600" />
            <span className="text-sm w-16 text-muted-foreground">Meals:</span>
            <div className="flex gap-1 flex-1">
              {Array.from({ length: 4 }, (_, i) => (
                <button key={i} onClick={() => setForm(p => ({ ...p, meals_count: i + 1 }))}
                  className={`text-lg transition-transform hover:scale-110 ${i < (form.meals_count || 0) ? '' : 'opacity-30'}`}>
                  🍽️
                </button>
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">{form.meals_count}/4</span>
          </div>
        </CardContent>
      </Card>

      {/* Energy & Productivity */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">⚡ Energy & Productivity</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Energy Level:</p>
            <div className="flex items-center gap-1">
              {energyEmojis.map((e, i) => (
                <button key={i} onClick={() => setForm(p => ({ ...p, energy_level: i + 1 }))}
                  className={`text-2xl transition-transform hover:scale-125 ${i < (form.energy_level || 0) ? 'scale-110' : 'opacity-30 scale-90'}`}>
                  {e}
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-foreground">[{form.energy_level}/10]</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Productivity:</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 10 }, (_, i) => (
                <button key={i} onClick={() => setForm(p => ({ ...p, productivity_score: i + 1 }))}
                  className={`text-2xl transition-transform hover:scale-125 ${i < (form.productivity_score || 0) ? '' : 'opacity-30'}`}>
                  ⭐
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-foreground">[{form.productivity_score}/10]</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">📝 Notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            placeholder="Additional observations for today..."
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            rows={3}
          />
        </CardContent>
      </Card>

      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full gradient-saffron text-primary-foreground h-12 text-base">
        <Save className="w-5 h-5 mr-2" />
        {saveMutation.isPending ? 'Saving...' : '💾 Save Time Sheet'}
      </Button>

      {/* Weekly Summary */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">📊 Weekly Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-around mb-3">
            {weekDays.map(d => (
              <div key={d.date} className="flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">{d.day}</span>
                <span className="text-lg">
                  {d.isToday ? '🔵' : d.entry ? '✅' : '⚪'}
                </span>
              </div>
            ))}
          </div>
          {weekData.length > 0 && (
            <div className="text-xs text-muted-foreground text-center">
              This Week: Avg Energy {(weekData.reduce((s, w) => s + (w.energy_level || 0), 0) / weekData.length).toFixed(1)} |
              Meditation {weekData.filter(w => (w.meditation_minutes || 0) > 0).length}/{weekData.length} days
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SeekerTimeSheet;
