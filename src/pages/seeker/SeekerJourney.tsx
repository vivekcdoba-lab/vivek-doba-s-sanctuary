import { useAuthStore } from '@/store/authStore';
import { useDbSessions } from '@/hooks/useDbSessions';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import { useStreakCount } from '@/hooks/useStreakCount';
import { JOURNEY_STAGES } from '@/types';
import type { JourneyStage } from '@/types';

const SeekerJourney = () => {
  const { profile } = useAuthStore();
  const profileId = profile?.id;
  const { data: sessions = [] } = useDbSessions(profileId ?? undefined);
  const { data: assignments = [] } = useDbAssignments(profileId ?? undefined);
  const { data: streak = 0 } = useStreakCount(profileId ?? null);

  const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'approved').length;
  const totalSessions = sessions.length;
  const completedAssignments = assignments.filter(a => a.status === 'reviewed' || a.status === 'completed').length;

  // Determine journey stage based on progress
  let currentStageIndex = 0;
  if (completedSessions >= 20) currentStageIndex = 4;
  else if (completedSessions >= 12) currentStageIndex = 3;
  else if (completedSessions >= 6) currentStageIndex = 2;
  else if (completedSessions >= 2) currentStageIndex = 1;

  const transformationProgress = totalSessions > 0 ? Math.round((completedSessions / Math.max(totalSessions, 24)) * 100) : 0;

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-foreground">My Journey</h1>

      {/* Journey Stage Progress */}
      <div className="bg-card rounded-xl p-5 border-2 border-primary/20 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4">🧭 Transformation Path</h3>
        
        <div className="flex items-center justify-between mb-4 px-2">
          {JOURNEY_STAGES.map((stage, i) => (
            <div key={stage.key} className="flex flex-col items-center relative">
              {i > 0 && (
                <div className={`absolute right-full top-3 w-full h-0.5 ${i <= currentStageIndex ? 'bg-primary' : 'bg-border'}`} style={{ width: '100%', transform: 'translateX(50%)' }} />
              )}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs z-10 ${
                i < currentStageIndex ? 'bg-primary text-primary-foreground' :
                i === currentStageIndex ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse' :
                'bg-muted text-muted-foreground'
              }`}>
                {i < currentStageIndex ? '✓' : stage.emoji}
              </div>
              <p className={`text-[8px] mt-1 text-center ${i === currentStageIndex ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                {stage.name}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
          <p className="text-xs text-primary font-semibold">
            {JOURNEY_STAGES[currentStageIndex]?.emoji} YOU ARE HERE: {JOURNEY_STAGES[currentStageIndex]?.name} ({JOURNEY_STAGES[currentStageIndex]?.sanskrit})
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">"{JOURNEY_STAGES[currentStageIndex]?.metaphor}"</p>
          <p className="text-[10px] text-muted-foreground mt-1">{JOURNEY_STAGES[currentStageIndex]?.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold text-foreground">{completedSessions}</p>
          <p className="text-[10px] text-muted-foreground">Sessions Done</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold text-foreground">{completedAssignments}</p>
          <p className="text-[10px] text-muted-foreground">Tasks Done</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold text-foreground">{streak}🔥</p>
          <p className="text-[10px] text-muted-foreground">Day Streak</p>
        </div>
      </div>

      {/* Transformation Progress */}
      <div className="bg-card rounded-xl p-5 border border-border shadow-sm text-center">
        <p className="text-xs text-muted-foreground mb-1">Transformation Progress</p>
        <div className="w-full bg-muted rounded-full h-3 relative overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-muted-foreground to-primary transition-all" style={{ width: `${transformationProgress}%` }} />
        </div>
        <p className="text-lg font-bold text-primary mt-1">{transformationProgress}%</p>
        <p className="text-xs text-muted-foreground">{completedSessions} of {Math.max(totalSessions, 24)} sessions completed</p>
      </div>

      {/* Session Timeline */}
      {sessions.length > 0 ? (
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">📅 Recent Sessions</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            {sessions.slice(0, 8).map((s, i) => (
              <div key={s.id} className="relative flex items-start gap-4 pb-4 last:pb-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 flex-shrink-0 ${
                  s.status === 'completed' || s.status === 'approved' ? 'bg-dharma-green text-primary-foreground' :
                  s.status === 'scheduled' ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>#{s.session_number}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.session_name || `Session #${s.session_number}`}</p>
                  <p className="text-[10px] text-muted-foreground">{s.date}</p>
                </div>
                {(s.status === 'completed' || s.status === 'approved') && <span className="text-dharma-green text-xs">✅</span>}
                {s.status === 'scheduled' && <span className="text-primary text-xs">📅</span>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl p-8 text-center border border-border">
          <p className="text-4xl mb-3">🧘</p>
          <p className="text-muted-foreground">No sessions yet. Your journey will begin soon!</p>
        </div>
      )}

      {/* Certificate Preview */}
      <div className="bg-card rounded-xl p-6 border-2 border-primary/20 shadow-sm text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Certificate of Transformation</p>
        <div className="mt-3 p-4 border border-dashed border-primary/30 rounded-lg">
          <span className="text-4xl">🔒</span>
          <p className="text-sm text-muted-foreground mt-2">Complete all sessions to unlock your certificate</p>
          <div className="w-full bg-muted rounded-full h-2 mt-3">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${transformationProgress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{transformationProgress}% complete</p>
        </div>
      </div>

      <footer className="text-center py-6 border-t border-border">
        <p className="text-xs text-muted-foreground">Vivek Doba Training Solutions</p>
        <p className="text-[10px] text-muted-foreground mt-1">Made with 🙏 for seekers of transformation</p>
      </footer>
    </div>
  );
};

export default SeekerJourney;
