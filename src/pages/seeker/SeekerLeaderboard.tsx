import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BackToHome from '@/components/BackToHome';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Trophy, Flame, Medal, Target, TrendingUp, Eye, EyeOff, Crown, Star, Award } from 'lucide-react';
import { toast } from 'sonner';

interface LeaderboardEntry {
  rank: number;
  profile_id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  streak_days: number;
  badge_count: number;
  worksheet_count: number;
  session_count: number;
}

const PERIOD_MAP: Record<string, string> = {
  weekly: 'week',
  monthly: 'month',
  alltime: 'all_time',
  batch: 'batch',
};

export default function SeekerLeaderboard() {
  const { profile, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('weekly');
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-active'],
    queryFn: async () => {
      const { data } = await supabase.from('courses').select('id, name').eq('is_active', true).order('name');
      return data || [];
    },
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['seeker-cities'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('city').eq('role', 'seeker').not('city', 'is', null);
      const unique = [...new Set((data || []).map((d: any) => d.city).filter(Boolean))].sort();
      return unique as string[];
    },
  });

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard', tab, courseFilter, cityFilter, user?.id],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const { data, error } = await supabase.rpc('get_leaderboard_data', {
        _period: PERIOD_MAP[tab] || 'all_time',
        _course_id: courseFilter || null,
        _city: cityFilter || null,
        _batch_user_id: tab === 'batch' ? (user?.id || null) : null,
      });
      if (error) throw error;
      return (data || []) as LeaderboardEntry[];
    },
  });

  const { data: myVisibility } = useQuery({
    queryKey: ['my-leaderboard-visible', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('leaderboard_visible').eq('id', profile!.id).single();
      return data?.leaderboard_visible ?? true;
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async (visible: boolean) => {
      const { error } = await supabase.from('profiles').update({ leaderboard_visible: visible } as any).eq('id', profile!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-leaderboard-visible'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast.success('Leaderboard visibility updated');
    },
  });

  const myRank = useMemo(() => leaderboard.find(e => e.profile_id === profile?.id), [leaderboard, profile?.id]);
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const nextAbove = myRank && myRank.rank > 1
    ? leaderboard.find(e => e.rank === myRank.rank - 1)
    : null;
  const pointsToNext = nextAbove ? nextAbove.total_points - (myRank?.total_points || 0) : 0;

  const podiumEmoji = ['👑', '🥈', '🥉'];
  const podiumBg = [
    'bg-gradient-to-b from-[hsl(45,100%,60%)] to-[hsl(35,90%,50%)]',
    'bg-gradient-to-b from-[hsl(0,0%,75%)] to-[hsl(0,0%,60%)]',
    'bg-gradient-to-b from-[hsl(30,60%,55%)] to-[hsl(25,50%,40%)]',
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <BackToHome />

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Trophy className="w-7 h-7 text-[hsl(var(--saffron))]" /> Sampoorna Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">Celebrate growth. Inspire each other. Rise together.</p>
      </div>

      {/* Privacy Toggle */}
      <Card className="rounded-2xl border-border">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {myVisibility ? <Eye className="w-4 h-4 text-[hsl(var(--saffron))]" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
            <span className="text-foreground">Show me on the leaderboard</span>
          </div>
          <Switch
            checked={myVisibility ?? true}
            onCheckedChange={(v) => toggleVisibility.mutate(v)}
          />
        </CardContent>
      </Card>

      {/* Point System */}
      <Card className="rounded-2xl border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Star className="w-4 h-4 text-[hsl(var(--saffron))]" /> Sampoorna Points System
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px]">
          {[
            { label: 'Worksheet', pts: '10 pts', icon: '📝' },
            { label: '100% Bonus', pts: '+5 pts', icon: '✅' },
            { label: 'Streak ×2', pts: 'per day', icon: '🔥' },
            { label: 'Session', pts: '25 pts', icon: '🎯' },
            { label: 'Badge', pts: '15 pts', icon: '🏅' },
          ].map(i => (
            <div key={i.label} className="bg-muted/50 rounded-lg p-2 text-center">
              <span className="text-lg">{i.icon}</span>
              <p className="font-semibold text-foreground">{i.pts}</p>
              <p className="text-muted-foreground">{i.label}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={courseFilter}
          onChange={e => setCourseFilter(e.target.value)}
          className="text-xs bg-card border border-border rounded-lg px-3 py-1.5 text-foreground"
        >
          <option value="">All Programs</option>
          {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={cityFilter}
          onChange={e => setCityFilter(e.target.value)}
          className="text-xs bg-card border border-border rounded-lg px-3 py-1.5 text-foreground"
        >
          <option value="">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="alltime">All-Time</TabsTrigger>
          <TabsTrigger value="batch">My Batch</TabsTrigger>
        </TabsList>

        {['weekly', 'monthly', 'alltime', 'batch'].map(t => (
          <TabsContent key={t} value={t} className="space-y-4 mt-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Loading rankings…</div>
            ) : leaderboard.length === 0 ? (
              <Card className="rounded-2xl border-border p-8 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No rankings yet. Start filling worksheets to earn points!</p>
              </Card>
            ) : (
              <>
                {/* Podium */}
                <div className="flex items-end justify-center gap-3 pt-4">
                  {[1, 0, 2].map(idx => {
                    const entry = top3[idx];
                    if (!entry) return <div key={idx} className="w-24" />;
                    const height = idx === 0 ? 'h-32' : idx === 1 ? 'h-24' : 'h-20';
                    return (
                      <div key={entry.profile_id} className="flex flex-col items-center w-24">
                        <div className="relative mb-1">
                          {entry.avatar_url ? (
                            <img src={entry.avatar_url} alt="" className={`w-12 h-12 rounded-full border-2 ${idx === 0 ? 'border-[hsl(45,100%,50%)]' : 'border-border'}`} />
                          ) : (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-muted text-foreground border-2 ${idx === 0 ? 'border-[hsl(45,100%,50%)]' : 'border-border'}`}>
                              {entry.display_name[0]}
                            </div>
                          )}
                          {idx === 0 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</span>}
                        </div>
                        <p className="text-xs font-semibold text-foreground text-center truncate w-full">{entry.display_name}</p>
                        <p className="text-[10px] text-[hsl(var(--saffron))] font-bold">{entry.total_points} pts</p>
                        <div className={`${podiumBg[idx]} ${height} w-full rounded-t-lg mt-1 flex items-center justify-center`}>
                          <span className="text-2xl">{podiumEmoji[idx]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Motivational bar */}
                {myRank && pointsToNext > 0 && (
                  <div className="bg-[hsl(var(--saffron))]/10 rounded-xl p-3 text-center text-sm">
                    <TrendingUp className="w-4 h-4 inline mr-1 text-[hsl(var(--saffron))]" />
                    <span className="text-foreground font-medium">{pointsToNext} points</span>
                    <span className="text-muted-foreground"> to reach rank #{myRank.rank - 1}</span>
                  </div>
                )}

                {/* Rankings Table */}
                {rest.length > 0 && (
                  <Card className="rounded-2xl border-border overflow-hidden">
                    <div className="divide-y divide-border">
                      {rest.map(entry => {
                        const isMe = entry.profile_id === profile?.id;
                        return (
                          <div
                            key={entry.profile_id}
                            className={`flex items-center gap-3 px-4 py-3 ${isMe ? 'bg-[hsl(var(--saffron))]/10 border-l-4 border-[hsl(var(--saffron))]' : ''}`}
                          >
                            <span className="text-sm font-bold text-muted-foreground w-8 text-center">#{entry.rank}</span>
                            {entry.avatar_url ? (
                              <img src={entry.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground">
                                {entry.display_name[0]}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {entry.display_name} {isMe && <span className="text-[hsl(var(--saffron))]">(You)</span>}
                              </p>
                              <div className="flex gap-3 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-0.5"><Flame className="w-3 h-3" />{entry.streak_days}d</span>
                                <span className="flex items-center gap-0.5"><Medal className="w-3 h-3" />{entry.badge_count}</span>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-[hsl(var(--saffron))]">{entry.total_points}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* My rank if not in visible list */}
                {myRank && myRank.rank > 3 + rest.length && (
                  <Card className="rounded-2xl border-[hsl(var(--saffron))]/30 bg-[hsl(var(--saffron))]/5">
                    <CardContent className="p-4 flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground">#{myRank.rank}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{myRank.display_name} (You)</p>
                      </div>
                      <span className="text-sm font-bold text-[hsl(var(--saffron))]">{myRank.total_points} pts</span>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
