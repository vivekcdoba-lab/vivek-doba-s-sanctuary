import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Star, Trophy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TopicWithCount {
  id: string;
  name: string;
  icon_emoji: string | null;
  category: string | null;
  session_count: number;
}

const SeekerTopics = () => {
  const { profile } = useAuthStore();
  const [topics, setTopics] = useState<TopicWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const MASTERY_THRESHOLD = 3;

  useEffect(() => {
    if (profile?.id) loadTopics();
  }, [profile?.id]);

  const loadTopics = async () => {
    setLoading(true);
    try {
      // Get all session_topics for this seeker's approved/completed sessions
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id, status')
        .eq('seeker_id', profile!.id)
        .in('status', ['completed', 'approved']);

      if (!sessions || sessions.length === 0) {
        setTopics([]);
        setLoading(false);
        return;
      }

      const sessionIds = sessions.map(s => s.id);
      const { data: sessionTopics } = await supabase
        .from('session_topics')
        .select('topic_id')
        .in('session_id', sessionIds);

      if (!sessionTopics || sessionTopics.length === 0) {
        setTopics([]);
        setLoading(false);
        return;
      }

      // Count per topic
      const countMap = new Map<string, number>();
      sessionTopics.forEach(st => {
        countMap.set(st.topic_id, (countMap.get(st.topic_id) || 0) + 1);
      });

      const topicIds = [...countMap.keys()];
      const { data: topicData } = await supabase
        .from('topics')
        .select('*')
        .in('id', topicIds);

      if (topicData) {
        setTopics(
          topicData.map(t => ({
            id: t.id,
            name: t.name,
            icon_emoji: t.icon_emoji,
            category: t.category,
            session_count: countMap.get(t.id) || 0,
          })).sort((a, b) => b.session_count - a.session_count)
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const mastered = topics.filter(t => t.session_count >= MASTERY_THRESHOLD);
  const exploring = topics.filter(t => t.session_count < MASTERY_THRESHOLD);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Topics & Mastery</h1>
        <p className="text-sm text-muted-foreground">Track your progress across coaching topics. Master a topic by covering it in {MASTERY_THRESHOLD}+ approved sessions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{topics.length}</p>
          <p className="text-xs text-muted-foreground">Topics Explored</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Trophy className="w-5 h-5 text-warning-amber mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{mastered.length}</p>
          <p className="text-xs text-muted-foreground">Mastered</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Star className="w-5 h-5 text-dharma-green mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{exploring.length}</p>
          <p className="text-xs text-muted-foreground">In Progress</p>
        </div>
      </div>

      {/* Mastered Topics */}
      {mastered.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            🏆 Mastered Topics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mastered.map(t => (
              <div key={t.id} className="bg-card rounded-xl border-2 border-warning-amber/30 p-4 flex items-center gap-3">
                <span className="text-xl">{t.icon_emoji || '📚'}</span>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.session_count} sessions</p>
                </div>
                <span className="text-warning-amber text-lg">🏆</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Topics */}
      {exploring.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            📖 In Progress
          </h2>
          <div className="space-y-2">
            {exploring.map(t => {
              const progress = Math.round((t.session_count / MASTERY_THRESHOLD) * 100);
              return (
                <div key={t.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{t.icon_emoji || '📚'}</span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.session_count} / {MASTERY_THRESHOLD} sessions</p>
                    </div>
                    <span className="text-xs font-semibold text-primary">{progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {topics.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <h3 className="text-foreground font-semibold">No topics yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Topics will appear here as your coach assigns sessions with specific topics.</p>
        </div>
      )}
    </div>
  );
};

export default SeekerTopics;
