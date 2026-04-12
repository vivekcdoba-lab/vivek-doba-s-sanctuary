import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { Star, Send, Loader2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const SeekerFeedback = () => {
  const { profile } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [whatWentWell, setWhatWentWell] = useState('');
  const [improvements, setImprovements] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('seeker_id', profile.id)
        .in('status', ['completed', 'approved'])
        .order('date', { ascending: false })
        .limit(20);
      setSessions(data || []);
      setLoading(false);
    };
    fetch();
  }, [profile?.id]);

  const handleSubmit = async () => {
    if (!selectedSession || rating === 0) {
      toast.error('Please select a session and provide a rating');
      return;
    }
    setSubmitting(true);
    const feedback = {
      rating, takeaway: whatWentWell, commitment: rating,
      clarity: rating, feelings: [], comments: `${whatWentWell}\n\nImprovements: ${improvements}\n\n${comments}`,
    };
    const { error } = await supabase.from('sessions').update({ post_session_feedback: feedback } as any).eq('id', selectedSession);
    if (error) { toast.error('Failed to submit feedback'); }
    else {
      toast.success('Feedback submitted successfully! 🙏');
      setSelectedSession(null); setRating(0); setWhatWentWell(''); setImprovements(''); setComments('');
    }
    setSubmitting(false);
  };

  const activeRating = hoverRating || rating;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Session Feedback</h1>
        <p className="text-muted-foreground">Share your experience to help improve coaching</p>
      </div>

      {/* Select Session */}
      <Card>
        <CardHeader><CardTitle className="text-base">Select a Session</CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-60 overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No completed sessions yet</p>
          ) : sessions.map(s => (
            <button key={s.id} onClick={() => setSelectedSession(s.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedSession === s.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{s.session_name || `Session #${s.session_number}`}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(s.date), 'MMM d, yyyy')}</p>
                </div>
                {s.post_session_feedback && <Badge variant="secondary" className="text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Reviewed</Badge>}
                {selectedSession === s.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {selectedSession && (
        <>
          {/* Star Rating */}
          <Card>
            <CardHeader><CardTitle className="text-base">Overall Rating</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i} onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(i)}
                    className="transition-transform hover:scale-110">
                    <Star className={`h-10 w-10 ${i <= activeRating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />
                  </button>
                ))}
              </div>
              {rating > 0 && <p className="text-center text-sm text-muted-foreground mt-2">
                {['', 'Needs improvement', 'Below average', 'Good', 'Very good', 'Excellent'][rating]}
              </p>}
            </CardContent>
          </Card>

          {/* Feedback Form */}
          <Card>
            <CardHeader><CardTitle className="text-base"><MessageSquare className="h-5 w-5 inline mr-2 text-primary" />Your Feedback</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">What went well? ✨</label>
                <Textarea placeholder="Share what you found valuable..." value={whatWentWell} onChange={e => setWhatWentWell(e.target.value)} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Areas for improvement 🎯</label>
                <Textarea placeholder="What could be better..." value={improvements} onChange={e => setImprovements(e.target.value)} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Additional comments 💬</label>
                <Textarea placeholder="Any other thoughts..." value={comments} onChange={e => setComments(e.target.value)} rows={2} />
              </div>
              <Button onClick={handleSubmit} disabled={submitting || rating === 0} className="w-full gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit Feedback
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SeekerFeedback;
