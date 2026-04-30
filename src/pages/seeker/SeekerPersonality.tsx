import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import BackToHome from '@/components/BackToHome';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Brain, Users, Lightbulb, Shield, Heart, Target, RotateCcw, Share2, Triangle, Square, Circle, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { format, differenceInMonths } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { formatDateDMY } from "@/lib/dateFormat";

interface FiroBScores {
  eI: number; wI: number;
  eC: number; wC: number;
  eA: number; wA: number;
}

function getPersonalityType(s: FiroBScores) {
  const totalE = s.eI + s.eC + s.eA;
  const totalW = s.wI + s.wC + s.wA;
  if (totalE >= 18 && totalW >= 18) return { type: 'The Connector', emoji: '🤝', color: 'bg-[hsl(var(--dharma-green))] text-white', desc: 'You actively engage with others and welcome their engagement. You are a natural bridge-builder.' };
  if (totalE >= 18 && totalW < 12) return { type: 'The Leader', emoji: '👑', color: 'bg-[hsl(var(--gold))] text-white', desc: 'You take initiative in relationships but prefer independence. You naturally guide others.' };
  if (totalE < 12 && totalW >= 18) return { type: 'The Observer', emoji: '🔍', color: 'bg-[hsl(var(--chakra-indigo))] text-white', desc: 'You prefer others to take the lead but deeply value being included. You are perceptive and reflective.' };
  if (totalE < 12 && totalW < 12) return { type: 'The Sage', emoji: '🧘', color: 'bg-[hsl(var(--wisdom-purple))] text-white', desc: 'You are self-contained and introspective. You value deep over wide connections.' };
  return { type: 'The Harmonizer', emoji: '⚖️', color: 'bg-[hsl(var(--saffron))] text-white', desc: 'You balance giving and receiving in relationships. You adapt fluidly to different social contexts.' };
}

function getStrengths(s: FiroBScores): string[] {
  const strengths: string[] = [];
  if (s.eI >= 6) strengths.push('Inclusive & socially proactive');
  if (s.wI >= 6) strengths.push('Open to collaboration');
  if (s.eC >= 6) strengths.push('Decisive leadership');
  if (s.wC >= 6) strengths.push('Coachable & receptive');
  if (s.eA >= 6) strengths.push('Warm & emotionally expressive');
  if (s.wA >= 6) strengths.push('Values deep relationships');
  if (strengths.length === 0) strengths.push('Self-reliant', 'Independent thinker');
  return strengths;
}

function getGrowthAreas(s: FiroBScores): string[] {
  const areas: string[] = [];
  if (s.eI <= 3) areas.push('Reaching out to include others more');
  if (s.wI <= 3) areas.push('Allowing others to include you');
  if (s.eC <= 3) areas.push('Taking charge when needed');
  if (s.wC <= 3) areas.push('Accepting guidance from others');
  if (s.eA <= 3) areas.push('Expressing warmth openly');
  if (s.wA <= 3) areas.push('Being open to receiving affection');
  if (areas.length === 0) areas.push('Maintaining balance across all dimensions');
  return areas;
}

function getLGTInsights(s: FiroBScores) {
  return [
    { pillar: 'Dharma', icon: '🙏', color: 'hsl(var(--dharma-green))', insight: s.eC >= 6 ? 'Your leadership drive aligns with living your purpose boldly.' : 'Cultivating assertiveness will help you live your dharma more fully.' },
    { pillar: 'Artha', icon: '💰', color: 'hsl(var(--gold-bright))', insight: s.eI >= 6 ? 'Your social initiative is an asset for building professional networks.' : 'Expanding your professional outreach can accelerate growth.' },
    { pillar: 'Kama', icon: '❤️', color: 'hsl(var(--lotus-pink))', insight: s.eA >= 6 ? 'Your warmth strengthens family bonds and personal relationships.' : 'Expressing affection more openly can deepen your personal connections.' },
    { pillar: 'Moksha', icon: '🧘', color: 'hsl(var(--chakra-indigo))', insight: s.wC <= 3 ? 'Your independence supports self-directed spiritual practice.' : 'Your openness to guidance makes you receptive to spiritual mentorship.' },
  ];
}

function getPsychoShape(s: FiroBScores) {
  const scores = [
    { shape: 'Triangle', icon: '△', label: 'Leader', score: s.eC * 2 + s.eI, color: 'hsl(var(--gold))', traits: 'Decisive, ambitious, competitive' },
    { shape: 'Square', icon: '□', label: 'Organizer', score: s.wC * 2 + (9 - s.eA), color: 'hsl(var(--sky-blue))', traits: 'Structured, detail-oriented, reliable' },
    { shape: 'Circle', icon: '○', label: 'Nurturer', score: s.eA * 2 + s.wA, color: 'hsl(var(--lotus-pink))', traits: 'Empathetic, harmonious, team-focused' },
    { shape: 'Squiggle', icon: '~', label: 'Innovator', score: (9 - s.wC) * 2 + s.eI, color: 'hsl(var(--wisdom-purple))', traits: 'Creative, spontaneous, visionary' },
  ];
  scores.sort((a, b) => b.score - a.score);
  return scores;
}

function getLevel(v: number): string {
  if (v <= 3) return 'Low';
  if (v <= 6) return 'Medium';
  return 'High';
}

function levelColor(v: number): string {
  if (v <= 3) return 'bg-[hsl(var(--sky-blue))]/20 text-[hsl(var(--sky-blue))]';
  if (v <= 6) return 'bg-[hsl(var(--warning-amber))]/20 text-[hsl(var(--warning-amber))]';
  return 'bg-[hsl(var(--dharma-green))]/20 text-[hsl(var(--dharma-green))]';
}

export default function SeekerPersonality() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [view, setView] = useState<'firo-b' | 'psycho'>('firo-b');

  const { data: assessment, isLoading } = useQuery({
    queryKey: ['personality-firo-b', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seeker_assessments')
        .select('*')
        .eq('seeker_id', profile!.id)
        .eq('type', 'firo-b')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const scores: FiroBScores | null = useMemo(() => {
    if (!assessment?.scores_json) return null;
    const s = assessment.scores_json as any;
    if (typeof s.eI === 'number') return s as FiroBScores;
    if (s.dimensions) {
      return { eI: s.dimensions.eI ?? 0, wI: s.dimensions.wI ?? 0, eC: s.dimensions.eC ?? 0, wC: s.dimensions.wC ?? 0, eA: s.dimensions.eA ?? 0, wA: s.dimensions.wA ?? 0 };
    }
    return null;
  }, [assessment]);

  const isOlderThan6Months = assessment?.created_at
    ? differenceInMonths(new Date(), new Date(assessment.created_at)) >= 6
    : false;

  const personality = scores ? getPersonalityType(scores) : null;
  const strengths = scores ? getStrengths(scores) : [];
  const growthAreas = scores ? getGrowthAreas(scores) : [];
  const lgtInsights = scores ? getLGTInsights(scores) : [];
  const psychoShapes = scores ? getPsychoShape(scores) : [];

  const barData = scores ? [
    { name: 'Inclusion', Expressed: scores.eI, Wanted: scores.wI },
    { name: 'Control', Expressed: scores.eC, Wanted: scores.wC },
    { name: 'Affection', Expressed: scores.eA, Wanted: scores.wA },
  ] : [];

  const radarData = scores ? [
    { dim: 'Expressed Inclusion', value: scores.eI },
    { dim: 'Wanted Inclusion', value: scores.wI },
    { dim: 'Expressed Control', value: scores.eC },
    { dim: 'Wanted Control', value: scores.wC },
    { dim: 'Expressed Affection', value: scores.eA },
    { dim: 'Wanted Affection', value: scores.wA },
  ] : [];

  const handleShare = () => {
    if (!personality || !scores) return;
    const text = `My FIRO-B Personality: ${personality.emoji} ${personality.type}\nInclusion: E${scores.eI}/W${scores.wI} | Control: E${scores.eC}/W${scores.wC} | Affection: E${scores.eA}/W${scores.wA}`;
    if (navigator.share) {
      navigator.share({ title: 'My Personality Profile', text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <BackToHome />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!scores) {
    return (
      <div className="space-y-6">
        <BackToHome />
        <Card className="text-center py-16">
          <CardContent>
            <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Discover Your Personality</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Take the FIRO-B assessment to understand your interpersonal style, communication preferences, and how you relate to others.
            </p>
            <Button onClick={() => navigate('/seeker/assessments')} className="bg-primary text-primary-foreground">
              Take FIRO-B Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <BackToHome />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" /> Personality Insights
          </h1>
          <p className="text-sm text-muted-foreground">
            Based on FIRO-B taken {formatDateDMY(new Date(assessment!.created_at))}
            {isOlderThan6Months && <span className="text-destructive ml-2">• Over 6 months old</span>}
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
          {isOlderThan6Months && (
            <Button size="sm" onClick={() => navigate('/seeker/assessments')}>
              <RotateCcw className="h-4 w-4 mr-1" /> Retake
            </Button>
          )}
        </div>
      </div>

      {/* Personality Type Hero */}
      <Card className="rounded-2xl overflow-hidden border-2 border-primary/20" style={{ background: 'var(--gradient-saffron)' }}>
        <CardContent className="p-6 sm:p-8 text-center">
          <span className="text-5xl">{personality!.emoji}</span>
          <h2 className="text-2xl font-bold mt-3 text-foreground">{personality!.type}</h2>
          <Badge className={`${personality!.color} mt-2`}>Your Interpersonal Style</Badge>
          <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">{personality!.desc}</p>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <Tabs value={view} onValueChange={v => setView(v as any)} className="print:hidden">
        <TabsList>
          <TabsTrigger value="firo-b">🧠 FIRO-B Profile</TabsTrigger>
          <TabsTrigger value="psycho">🔷 Psychogeometry</TabsTrigger>
        </TabsList>
      </Tabs>

      {view === 'firo-b' && (
        <>
          {/* Score Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { code: 'eI', label: 'Expressed Inclusion', icon: Users, val: scores.eI },
              { code: 'wI', label: 'Wanted Inclusion', icon: Users, val: scores.wI },
              { code: 'eC', label: 'Expressed Control', icon: Shield, val: scores.eC },
              { code: 'wC', label: 'Wanted Control', icon: Shield, val: scores.wC },
              { code: 'eA', label: 'Expressed Affection', icon: Heart, val: scores.eA },
              { code: 'wA', label: 'Wanted Affection', icon: Heart, val: scores.wA },
            ].map(d => (
              <Card key={d.code} className="rounded-xl">
                <CardContent className="p-4 text-center">
                  <d.icon className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">{d.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{d.val}<span className="text-sm text-muted-foreground">/9</span></p>
                  <div className="mt-2">
                    <Progress value={(d.val / 9) * 100} className="h-2" />
                  </div>
                  <Badge className={`${levelColor(d.val)} mt-2 text-[10px]`}>{getLevel(d.val)}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Expressed vs Wanted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 9]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="Expressed" fill="hsl(var(--dharma-green))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Wanted" fill="hsl(var(--sky-blue))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Interpersonal Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="dim" tick={{ fontSize: 8 }} />
                      <PolarRadiusAxis domain={[0, 9]} tick={{ fontSize: 9 }} />
                      <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strengths & Growth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[hsl(var(--gold-bright))]" /> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {strengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-[hsl(var(--dharma-green))]">✓</span>
                    <span className="text-foreground">{s}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-[hsl(var(--lotus-pink))]" /> Growth Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {growthAreas.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-[hsl(var(--warning-amber))]">→</span>
                    <span className="text-foreground">{g}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Communication & Compatibility */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Compatibility & Team Dynamics
              </CardTitle>
              <CardDescription>How your personality works with others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-muted/50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-foreground mb-1">Communication Style</h4>
                  <p className="text-xs text-muted-foreground">
                    {scores.eI >= 6 ? 'You initiate conversations easily and enjoy group discussions.' : 'You prefer one-on-one or small group settings for meaningful exchanges.'}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-foreground mb-1">Leadership Tendency</h4>
                  <p className="text-xs text-muted-foreground">
                    {scores.eC >= 6 ? 'You naturally take charge and enjoy guiding teams toward goals.' : 'You lead by example and prefer collaborative decision-making.'}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-foreground mb-1">Relationship Building</h4>
                  <p className="text-xs text-muted-foreground">
                    {scores.eA >= 6 ? 'You build warm, emotionally rich relationships quickly.' : 'You value trust-building and develop deep bonds over time.'}
                  </p>
                </div>
              </div>
              <div className="bg-primary/5 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-foreground mb-2">💡 Team Tip</h4>
                <p className="text-xs text-muted-foreground">
                  {scores.eC > scores.wC
                    ? 'You work best when given autonomy and leadership responsibilities. Pair with team members who appreciate clear direction.'
                    : 'You thrive in collaborative environments with shared leadership. Pair with decisive leaders who value input.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {view === 'psycho' && (
        <>
          {/* Psychogeometry Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {psychoShapes.map((shape, i) => (
              <Card key={shape.shape} className={`rounded-2xl transition-all ${i === 0 ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                <CardContent className="p-5 text-center">
                  <div className="text-4xl mb-2" style={{ color: shape.color }}>{shape.icon}</div>
                  <h3 className="font-bold text-foreground">{shape.shape}</h3>
                  <p className="text-xs text-primary font-medium">{shape.label}</p>
                  <div className="mt-3">
                    <Progress value={(shape.score / 27) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{Math.round((shape.score / 27) * 100)}% match</p>
                  </div>
                  {i === 0 && <Badge className="bg-primary text-primary-foreground mt-2 text-[10px]">Dominant</Badge>}
                  <p className="text-[10px] text-muted-foreground mt-2">{shape.traits}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Workplace Predictions */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-[hsl(var(--gold-bright))]" /> Workplace Behavior Predictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {psychoShapes.slice(0, 2).map(shape => (
                <div key={shape.shape} className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: shape.color }} className="text-lg">{shape.icon}</span>
                    <h4 className="text-sm font-semibold text-foreground">{shape.shape} ({shape.label})</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{shape.traits}. This shapes how you approach tasks, collaborate, and make decisions at work.</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* LGT Integration - always visible */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> Personality × LGT Pillars
          </CardTitle>
          <CardDescription>How your interpersonal style affects each life dimension</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lgtInsights.map(item => (
              <div key={item.pillar} className="rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{item.icon}</span>
                  <h4 className="text-sm font-bold" style={{ color: item.color }}>{item.pillar}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{item.insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Text */}
      {assessment?.analysis_text && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm">Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{assessment.analysis_text}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
