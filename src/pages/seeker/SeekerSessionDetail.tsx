import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import DigitalSignature from '@/components/DigitalSignature';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Shield, BookOpen, Target, Award, Zap, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionData {
  id: string;
  session_number: number;
  session_name: string | null;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  pillar: string | null;
  session_notes: string | null;
  key_insights: string | null;
  breakthroughs: string | null;
  therapy_given: string | null;
  topics_covered: string[] | null;
  client_good_things: string[] | null;
  client_growth_json: Record<string, string> | null;
  major_win: string | null;
  stories_used: string[] | null;
  pending_assignments_review: string | null;
  next_session_time: string | null;
  next_week_assignments: string | null;
  punishments: string | null;
  rewards: string | null;
  targets: string | null;
  seeker_what_learned: string | null;
  seeker_where_to_apply: string | null;
  seeker_how_to_apply: string | null;
  seeker_accepted_at: string | null;
  seeker_id: string;
  course_id: string | null;
}

const PILLAR_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  dharma: { emoji: '🙏', label: 'Dharma', color: 'bg-green-500/10 text-green-600' },
  artha: { emoji: '💰', label: 'Artha', color: 'bg-yellow-500/10 text-yellow-600' },
  kama: { emoji: '❤️', label: 'Kama', color: 'bg-pink-500/10 text-pink-600' },
  moksha: { emoji: '🕉️', label: 'Moksha', color: 'bg-purple-500/10 text-purple-600' },
  all: { emoji: '✨', label: 'All Pillars', color: 'bg-primary/10 text-primary' },
};

const SeekerSessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [session, setSession] = useState<SessionData | null>(null);
  const [courseName, setCourseName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signatures, setSignatures] = useState<any[]>([]);

  // Seeker reflection form
  const [whatLearned, setWhatLearned] = useState('');
  const [whereToApply, setWhereToApply] = useState('');
  const [howToApply, setHowToApply] = useState('');

  useEffect(() => {
    if (id) loadSession();
  }, [id]);

  const loadSession = async () => {
    setLoading(true);
    try {
      // Verify seeker owns this session (data isolation)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      
      const { data: myProfile } = await supabase.from('profiles').select('id').eq('user_id', user.id).maybeSingle();
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      
      // Check seeker owns this session (unless admin)
      const isAdmin = profile?.role === 'admin';
      if (!isAdmin && data.seeker_id !== myProfile?.id) {
        toast.error('You do not have access to this session');
        navigate('/seeker/home');
        return;
      }

      const s = {
        ...data,
        topics_covered: data.topics_covered as string[] | null,
        client_good_things: (data as any).client_good_things as string[] | null,
        client_growth_json: (data as any).client_growth_json as Record<string, string> | null,
        stories_used: (data as any).stories_used as string[] | null,
        session_name: (data as any).session_name,
        pillar: (data as any).pillar,
        therapy_given: (data as any).therapy_given,
        major_win: (data as any).major_win,
        pending_assignments_review: (data as any).pending_assignments_review,
        next_session_time: (data as any).next_session_time,
        next_week_assignments: (data as any).next_week_assignments,
        punishments: (data as any).punishments,
        rewards: (data as any).rewards,
        targets: (data as any).targets,
        seeker_what_learned: (data as any).seeker_what_learned,
        seeker_where_to_apply: (data as any).seeker_where_to_apply,
        seeker_how_to_apply: (data as any).seeker_how_to_apply,
        seeker_accepted_at: (data as any).seeker_accepted_at,
      } as SessionData;

      setSession(s);
      setWhatLearned(s.seeker_what_learned || '');
      setWhereToApply(s.seeker_where_to_apply || '');
      setHowToApply(s.seeker_how_to_apply || '');

      if (data.course_id) {
        const { data: course } = await supabase.from('courses').select('name').eq('id', data.course_id).single();
        setCourseName(course?.name || '');
      }

      const { data: sigs } = await supabase.from('session_signatures').select('*').eq('session_id', id!);
      setSignatures(sigs || []);
    } catch (err) {
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReflection = async () => {
    if (!session || !whatLearned.trim()) {
      toast.error('Please fill "What I Learned Today"');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          seeker_what_learned: whatLearned,
          seeker_where_to_apply: whereToApply,
          seeker_how_to_apply: howToApply,
        } as any)
        .eq('id', session.id);
      if (error) throw error;

      setSession({ ...session, seeker_what_learned: whatLearned, seeker_where_to_apply: whereToApply, seeker_how_to_apply: howToApply });
      toast.success('Reflection saved! ✨');
    } catch (err) {
      toast.error('Failed to save reflection');
    } finally {
      setSaving(false);
    }
  };

  const handleAcceptSession = async () => {
    if (!session) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ seeker_accepted_at: new Date().toISOString() } as any)
        .eq('id', session.id);
      if (error) throw error;

      setSession({ ...session, seeker_accepted_at: new Date().toISOString() });
      toast.success('Session accepted! Now please sign below.');
    } catch (err) {
      toast.error('Failed to accept');
    } finally {
      setSaving(false);
    }
  };

  const seekerSig = signatures.find((s: any) => s.signer_role === 'seeker');
  const coachSig = signatures.find((s: any) => s.signer_role === 'coach');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Session not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline text-sm">Go back</button>
      </div>
    );
  }

  const pillarCfg = PILLAR_CONFIG[session.pillar || 'all'];
  const contentForHash = JSON.stringify({
    session_id: session.id,
    notes: session.session_notes,
    insights: session.key_insights,
    breakthroughs: session.breakthroughs,
  });

  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{session.session_name || `Session #${session.session_number}`}</h1>
          <p className="text-sm text-muted-foreground">Session #{session.session_number} · {session.date}</p>
        </div>
        {pillarCfg && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${pillarCfg.color}`}>
            {pillarCfg.emoji} {pillarCfg.label}
          </span>
        )}
      </div>

      {/* Session Info Card */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-primary" /> Session Details
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-muted-foreground text-xs">Date</p><p className="font-medium text-foreground">{session.date}</p></div>
          <div><p className="text-muted-foreground text-xs">Duration</p><p className="font-medium text-foreground">{session.duration_minutes} min</p></div>
          <div><p className="text-muted-foreground text-xs">Course</p><p className="font-medium text-foreground">{courseName || 'N/A'}</p></div>
          <div><p className="text-muted-foreground text-xs">Status</p><p className="font-medium text-foreground capitalize">{session.status}</p></div>
        </div>
        {session.topics_covered && (session.topics_covered as string[]).length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-1">Topics Covered</p>
            <div className="flex flex-wrap gap-1.5">
              {(session.topics_covered as string[]).map((t, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Coach Notes */}
      {session.key_insights && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">💡 Key Insights</h3>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{session.key_insights}</p>
        </div>
      )}

      {session.breakthroughs && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">🚀 Breakthroughs</h3>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{session.breakthroughs}</p>
        </div>
      )}

      {/* Therapy Given */}
      {session.therapy_given && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">🧘 Therapy / Technique Used</h3>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{session.therapy_given}</p>
        </div>
      )}

      {/* Stories Used */}
      {session.stories_used && (session.stories_used as string[]).length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">📖 Stories Shared</h3>
          <div className="flex flex-wrap gap-1.5">
            {(session.stories_used as string[]).map((s, i) => (
              <span key={i} className="px-2 py-1 rounded-lg text-xs bg-saffron/10 text-saffron font-medium">📖 {s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Client Good Things */}
      {session.client_good_things && (session.client_good_things as string[]).some(Boolean) && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">🌟 Your 3 Good Things</h3>
          <div className="space-y-1">
            {(session.client_good_things as string[]).filter(Boolean).map((t, i) => (
              <p key={i} className="text-sm text-foreground/80 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-dharma-green" /> {t}</p>
            ))}
          </div>
        </div>
      )}

      {/* Growth Across Pillars */}
      {session.client_growth_json && Object.values(session.client_growth_json).some(Boolean) && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">📈 Your Growth Across 4 Pillars</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(session.client_growth_json).filter(([, v]) => v).map(([key, value]) => {
              const cfg = PILLAR_CONFIG[key];
              return (
                <div key={key} className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground">{cfg?.emoji} {cfg?.label}</p>
                  <p className="text-sm text-foreground mt-1">{value}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Major Win */}
      {session.major_win && (
        <div className="bg-gradient-to-r from-saffron/10 to-primary/10 rounded-xl border border-saffron/20 p-5 space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Award className="w-4 h-4 text-saffron" /> Major Win This Week
          </h3>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{session.major_win}</p>
        </div>
      )}

      {/* Next Week Plan */}
      {(session.next_session_time || session.next_week_assignments || session.targets || session.rewards || session.punishments) && (
        <div className="bg-card rounded-xl border-2 border-primary/20 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Next Week Plan
          </h3>
          {session.next_session_time && (
            <div><p className="text-xs text-muted-foreground">📅 Next Session</p><p className="text-sm font-medium text-foreground">{session.next_session_time}</p></div>
          )}
          {session.next_week_assignments && (
            <div><p className="text-xs text-muted-foreground">📋 Assignments</p><p className="text-sm text-foreground/80 whitespace-pre-wrap">{session.next_week_assignments}</p></div>
          )}
          {session.targets && (
            <div><p className="text-xs text-muted-foreground">🎯 Targets</p><p className="text-sm text-foreground/80 whitespace-pre-wrap">{session.targets}</p></div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {session.rewards && (
              <div className="bg-dharma-green/10 rounded-lg p-3">
                <p className="text-xs font-medium text-dharma-green">🏆 Rewards</p>
                <p className="text-sm text-foreground mt-1">{session.rewards}</p>
              </div>
            )}
            {session.punishments && (
              <div className="bg-destructive/10 rounded-lg p-3">
                <p className="text-xs font-medium text-destructive">⚡ Consequences</p>
                <p className="text-sm text-foreground mt-1">{session.punishments}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Assignments Review */}
      {session.pending_assignments_review && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">📝 Last Week Assignment Review</h3>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{session.pending_assignments_review}</p>
        </div>
      )}

      {/* Seeker Reflection Section */}
      <div className="bg-card rounded-xl border-2 border-chakra-indigo/20 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-chakra-indigo" /> Your Post-Session Reflection
        </h3>
        <p className="text-xs text-muted-foreground">Share what you learned and how you plan to apply it</p>

        <div>
          <label className="text-sm font-medium text-foreground">What I Learned Today *</label>
          <textarea
            value={whatLearned}
            onChange={e => setWhatLearned(e.target.value)}
            className="mt-1 w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
            placeholder="What was the biggest learning from today's session?"
            disabled={!!session.seeker_accepted_at}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Where to Apply</label>
          <textarea
            value={whereToApply}
            onChange={e => setWhereToApply(e.target.value)}
            className="mt-1 w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
            placeholder="In which areas of your life will you apply this?"
            disabled={!!session.seeker_accepted_at}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">How to Apply</label>
          <textarea
            value={howToApply}
            onChange={e => setHowToApply(e.target.value)}
            className="mt-1 w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
            placeholder="What specific steps will you take?"
            disabled={!!session.seeker_accepted_at}
          />
        </div>

        {!session.seeker_accepted_at && (
          <div className="flex gap-3">
            <Button onClick={handleSubmitReflection} disabled={saving} className="gap-2">
              <Send className="w-4 h-4" /> Save Reflection
            </Button>
            {session.seeker_what_learned && (
              <Button onClick={handleAcceptSession} disabled={saving} variant="outline" className="border-dharma-green text-dharma-green hover:bg-dharma-green/10 gap-2">
                <CheckCircle2 className="w-4 h-4" /> Accept & Proceed to Sign
              </Button>
            )}
          </div>
        )}

        {session.seeker_accepted_at && (
          <div className="bg-dharma-green/10 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-dharma-green">✅ Accepted on {new Date(session.seeker_accepted_at).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {/* Digital Signature */}
      {session.seeker_accepted_at && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Digital Signature
          </h3>
          <p className="text-xs text-muted-foreground">Your signature certifies that you have read and understood the session details.</p>
          <DigitalSignature
            sessionId={session.id}
            signerId={profile?.id || ''}
            signerRole="seeker"
            signerName={profile?.full_name || 'Seeker'}
            contentToHash={contentForHash}
            existingSignature={seekerSig ? {
              storage_path: seekerSig.storage_path,
              signed_at: seekerSig.signed_at,
              content_hash: seekerSig.content_hash || '',
              typed_name: seekerSig.typed_name || undefined,
            } : null}
            disabled={false}
            onSigned={() => loadSession()}
          />
          {coachSig && (
            <div className="bg-dharma-green/10 rounded-lg p-3 text-center mt-3">
              <p className="text-sm font-medium text-dharma-green">✅ Coach has also signed this session</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeekerSessionDetail;
