import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BackToHome from '@/components/BackToHome';
import { BookOpen, Clock, CheckCircle, XCircle, ChevronRight, Star, Filter, Send } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function SeekerSessionHistory() {
  const { profile } = useAuthStore();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedbackSession, setFeedbackSession] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [wentWell, setWentWell] = useState('');
  const [couldImprove, setCouldImprove] = useState('');
  const [comments, setComments] = useState('');

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

  const submitFeedback = useMutation({
    mutationFn: async () => {
      if (!feedbackSession) return;
      const feedbackJson = { rating, went_well: wentWell, could_improve: couldImprove, comments, submitted_at: new Date().toISOString() };
      const { error } = await supabase.from('sessions')
        .update({ seeker_feedback_json: feedbackJson } as any)
        .eq('id', feedbackSession.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seeker-session-history'] });
      toast({ title: '⭐ Feedback submitted! Thank you.' });
      setFeedbackSession(null);
      setRating(5); setWentWell(''); setCouldImprove(''); setComments('');
    },
    onError: () => toast({ title: 'Failed to submit feedback', variant: 'destructive' }),
  });

  const statusFilters = ['all', 'completed', 'approved', 'submitted', 'reviewing', 'missed'];
  const filtered = statusFilter === 'all' ? sessions : sessions.filter((s: any) => s.status === statusFilter);

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; icon: any; label: string }> = {
      completed: { cls: 'bg-[hsl(var(--dharma-green))]/10 text-[hsl(var(--dharma-green))]', icon: CheckCircle, label: '✅ Completed' },
      approved: { cls: 'bg-primary/10 text-primary', icon: CheckCircle, label: '🏆 Approved' },
      missed: { cls: 'bg-destructive/10 text-destructive', icon: XCircle, label: '❌ Missed' },
      submitted: { cls: 'bg-[hsl(var(--sky-blue))]/10 text-[hsl(var(--sky-blue))]', icon: BookOpen, label: '📤 Submitted' },
      reviewing: { cls: 'bg-[hsl(var(--warning-amber))]/10 text-[hsl(var(--warning-amber))]', icon: BookOpen, label: '👁️ Reviewing' },
    };
    const s = map[status] || map.submitted;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.cls}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground">🕐 Session History</h1>
      <p className="text-sm text-muted-foreground">Your past coaching sessions</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total', value: sessions.length, emoji: '📋' },
          { label: 'Completed', value: sessions.filter((s: any) => s.status === 'completed' || s.status === 'approved').length, emoji: '✅' },
          { label: 'Reviewing', value: sessions.filter((s: any) => s.status === 'reviewing' || s.status === 'submitted').length, emoji: '👁️' },
          { label: 'Missed', value: sessions.filter((s: any) => s.status === 'missed').length, emoji: '❌' },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-lg border border-border p-2 text-center">
            <p className="text-lg font-bold text-foreground">{stat.emoji} {stat.value}</p>
            <p className="text-[9px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {statusFilters.map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${statusFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No sessions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s: any) => (
            <div key={s.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <Link to={`/seeker/sessions/${s.id}`}
                className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-muted flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground">{format(parseISO(s.date), 'MMM')}</span>
                  <span className="text-lg font-bold text-foreground leading-none">{format(parseISO(s.date), 'dd')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm truncate">{s.session_name || `Session #${s.session_number}`}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{s.start_time}</span>
                    {s.duration_minutes && <span className="text-[10px] text-muted-foreground">{s.duration_minutes}min</span>}
                    {s.pillar && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{s.pillar}</span>}
                    {statusBadge(s.status)}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Link>
              
              {/* Feedback button for completed sessions */}
              {['completed', 'approved'].includes(s.status) && !(s as any).seeker_feedback_json && (
                <div className="px-4 pb-3 border-t border-border pt-2">
                  <button onClick={(e) => { e.preventDefault(); setFeedbackSession(s); }}
                    className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                    <Star className="w-3 h-3" /> Give Feedback
                  </button>
                </div>
              )}
              {(s as any).seeker_feedback_json && (
                <div className="px-4 pb-3 border-t border-border pt-2">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-[hsl(var(--dharma-green))]" /> Feedback submitted
                    {'⭐'.repeat((s as any).seeker_feedback_json?.rating || 0)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Feedback Dialog */}
      <Dialog open={!!feedbackSession} onOpenChange={() => setFeedbackSession(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>⭐ Session Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">How was this session?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setRating(n)}
                    className={`text-2xl transition-transform ${n <= rating ? 'scale-110' : 'opacity-30'}`}>
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">What went well?</label>
              <Textarea value={wentWell} onChange={e => setWentWell(e.target.value)}
                placeholder="What was valuable about this session?" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">What could improve?</label>
              <Textarea value={couldImprove} onChange={e => setCouldImprove(e.target.value)}
                placeholder="Any suggestions?" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Additional comments</label>
              <Textarea value={comments} onChange={e => setComments(e.target.value)}
                placeholder="Anything else..." className="mt-1" />
            </div>
            <button onClick={() => submitFeedback.mutate()}
              disabled={submitFeedback.isPending}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> {submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
