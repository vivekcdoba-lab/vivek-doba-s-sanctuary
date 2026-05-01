import { useEffect, useMemo, useState } from 'react';
import { Star, Send, Lock, CalendarCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { differenceInCalendarDays, parseISO, format } from 'date-fns';

const wheelDims = ['💼 Career', '💰 Finance', '❤️ Health', '🏠 Family', '💕 Relations', '📚 Growth', '🎯 Fun', '🌿 Environ', '🕉️ Spiritual', '🙏 Service'];
const DEFAULT_WHEEL = [7, 4, 8, 6, 5, 7, 3, 7, 9, 6];

const toIsoDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const SeekerWeeklyReview = () => {
  const { toast } = useToast();
  const { profile } = useAuthStore();
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(4);
  const [wins, setWins] = useState(['', '', '']);
  const [challenge, setChallenge] = useState('');
  const [learning, setLearning] = useState('');
  const [wheelScores, setWheelScores] = useState<number[]>(DEFAULT_WHEEL);
  const [nextGoals, setNextGoals] = useState('');
  const [needFromCoach, setNeedFromCoach] = useState('');
  const [gratitude, setGratitude] = useState('');

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const todayIso = toIsoDate(today);

  // Compute current week range (Mon–Sun)
  const { weekStart, weekEnd, weekLabel } = useMemo(() => {
    const d = new Date(today);
    const day = d.getDay(); // 0 Sun .. 6 Sat
    const diffToMon = (day + 6) % 7;
    const start = new Date(d);
    start.setDate(d.getDate() - diffToMon);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      weekStart: toIsoDate(start),
      weekEnd: toIsoDate(end),
      weekLabel: `${start.getDate()}/${start.getMonth() + 1} — ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`,
    };
  }, [today]);

  // Next upcoming session
  const { data: nextSession } = useQuery({
    queryKey: ['weekly-review-next-session', profile?.id, todayIso],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('sessions')
        .select('id, date, start_time, session_name')
        .eq('seeker_id', profile!.id)
        .in('status', ['scheduled', 'confirmed', 'in_progress'])
        .gte('date', todayIso)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  // Existing review for current week
  const { data: existingReview } = useQuery({
    queryKey: ['weekly-review-current', profile?.id, weekStart],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('weekly_reviews')
        .select('*')
        .eq('seeker_id', profile!.id)
        .eq('week_start', weekStart)
        .maybeSingle();
      return data;
    },
  });

  // Prefill from existing
  useEffect(() => {
    if (!existingReview) return;
    const r: any = existingReview;
    if (typeof r.rating === 'number') setRating(r.rating);
    if (Array.isArray(r.wins)) setWins([r.wins[0] ?? '', r.wins[1] ?? '', r.wins[2] ?? '']);
    setChallenge(r.challenge ?? '');
    setLearning(r.learning ?? '');
    if (Array.isArray(r.wheel_scores) && r.wheel_scores.length === wheelDims.length) {
      setWheelScores(r.wheel_scores.map((n: any) => Number(n) || 0));
    }
    setNextGoals(r.next_goals ?? '');
    setNeedFromCoach(r.need_from_coach ?? '');
    setGratitude(r.gratitude ?? '');
  }, [existingReview]);

  // Editable only on the day BEFORE next session
  const sessionDate = nextSession?.date ? parseISO(nextSession.date as string) : null;
  const daysUntilSession = sessionDate ? differenceInCalendarDays(sessionDate, today) : null;
  const isEditable = daysUntilSession === 1;

  const sessionDateLabel = sessionDate ? format(sessionDate, 'EEE, MMM dd') : null;
  const unlockDateLabel = sessionDate
    ? format(new Date(sessionDate.getTime() - 86400000), 'EEE, MMM dd')
    : null;

  const handleSubmit = async () => {
    if (!profile?.id || !isEditable) return;
    setSubmitting(true);
    const payload = {
      seeker_id: profile.id,
      session_id: nextSession?.id ?? null,
      week_start: weekStart,
      week_end: weekEnd,
      rating,
      wins,
      challenge: challenge.trim() || null,
      learning: learning.trim() || null,
      wheel_scores: wheelScores,
      next_goals: nextGoals.trim() || null,
      need_from_coach: needFromCoach.trim() || null,
      gratitude: gratitude.trim() || null,
      submitted_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('weekly_reviews')
      .upsert(payload, { onConflict: 'seeker_id,week_start' });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Could not submit', description: error.message, variant: 'destructive' });
      return;
    }
    qc.invalidateQueries({ queryKey: ['weekly-review-current', profile.id, weekStart] });
    toast({ title: '✅ Weekly review submitted!', description: 'Coach will review your reflections.' });
  };

  const ro = !isEditable;

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-foreground">Weekly Review</h1>
      <p className="text-sm text-muted-foreground">Week: {weekLabel}</p>

      {/* Status banner */}
      {isEditable ? (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 flex items-start gap-2">
          <CalendarCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-foreground">
            <span className="font-semibold">Open today.</span> Your next session is tomorrow{sessionDateLabel ? ` (${sessionDateLabel})` : ''}. Submit your review before then.
          </p>
        </div>
      ) : !nextSession ? (
        <div className="rounded-xl border border-border bg-muted/40 p-3 flex items-start gap-2">
          <Lock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Read-only.</span> No upcoming session scheduled. Weekly Review unlocks the day before your next session.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-muted/40 p-3 flex items-start gap-2">
          <Lock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Read-only.</span> Unlocks on {unlockDateLabel} (one day before your next session on {sessionDateLabel}).
          </p>
        </div>
      )}

      <fieldset disabled={ro} className={ro ? 'opacity-90 space-y-5 [&_*]:cursor-not-allowed' : 'space-y-5'}>
        {/* Rating */}
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm text-center">
          <p className="text-sm font-semibold text-foreground mb-2">How was your week?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} type="button" disabled={ro} onClick={() => setRating(s)}>
                <Star className={`w-8 h-8 transition-colors ${s <= rating ? 'fill-primary text-primary' : 'text-muted'}`} />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{rating}/5 stars</p>
        </div>

        {/* Top 3 Wins */}
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm space-y-2">
          <h3 className="text-sm font-semibold text-foreground">🏆 Top 3 Wins This Week</h3>
          {wins.map((w, i) => (
            <input key={i} value={w} readOnly={ro} onChange={e => { const n = [...wins]; n[i] = e.target.value; setWins(n); }}
              placeholder={`Win #${i + 1}`} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
          ))}
        </div>

        {/* Challenge */}
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-2">😤 Biggest Challenge</h3>
          <textarea value={challenge} readOnly={ro} onChange={e => setChallenge(e.target.value)} placeholder="What challenged you most?" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" rows={2} />
        </div>

        {/* Learning */}
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-2">📚 Key Learning</h3>
          <textarea value={learning} readOnly={ro} onChange={e => setLearning(e.target.value)} placeholder="What did you learn?" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" rows={2} />
        </div>

        {/* Wheel of Life Quick Check */}
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">📊 Wheel of Life — Quick Check</h3>
          <div className="space-y-2">
            {wheelDims.map((dim, i) => (
              <div key={dim} className="flex items-center gap-2">
                <span className="text-xs w-24 text-foreground">{dim}</span>
                <input type="range" min="1" max="10" value={wheelScores[i]} disabled={ro} onChange={e => { const n = [...wheelScores]; n[i] = +e.target.value; setWheelScores(n); }} className="flex-1 accent-primary" />
                <span className="text-xs font-semibold text-primary w-6 text-right">{wheelScores[i]}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Average: {(wheelScores.reduce((a, b) => a + b, 0) / wheelScores.length).toFixed(1)}/10</p>
        </div>

        {/* Next Week Goals */}
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-2">🎯 Next Week Goals</h3>
          <textarea value={nextGoals} readOnly={ro} onChange={e => setNextGoals(e.target.value)} placeholder="What do you want to achieve?" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" rows={2} />
        </div>

        {/* Coach Request */}
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-2">🙏 What I Need From Coach</h3>
          <textarea value={needFromCoach} readOnly={ro} onChange={e => setNeedFromCoach(e.target.value)} placeholder="Any guidance, resources, or support needed?" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" rows={2} />
        </div>

        {/* Gratitude */}
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-2">🙏 Gratitude</h3>
          <textarea value={gratitude} readOnly={ro} onChange={e => setGratitude(e.target.value)} placeholder="What are you grateful for this week?" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" rows={2} />
        </div>
      </fieldset>

      {/* Submit (only when editable) */}
      {isEditable ? (
        <button onClick={handleSubmit} disabled={submitting} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          <Send className="w-4 h-4" /> {submitting ? 'Submitting…' : (existingReview ? 'Update Weekly Review' : 'Submit Weekly Review')}
        </button>
      ) : (
        <button disabled className="w-full py-3 rounded-xl bg-muted text-muted-foreground font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed">
          <Lock className="w-4 h-4" /> Locked
        </button>
      )}

      <footer className="text-center py-6 border-t border-border">
        <p className="text-xs text-muted-foreground">Vivek Doba Training Solutions</p>
        <p className="text-[10px] text-muted-foreground mt-1">Made with 🙏 for seekers of transformation</p>
      </footer>
    </div>
  );
};

export default SeekerWeeklyReview;
