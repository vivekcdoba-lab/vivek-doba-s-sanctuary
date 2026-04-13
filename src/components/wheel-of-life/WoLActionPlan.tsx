import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { WOL_SPOKES, WoLScores, getActionsForScore } from './wolData';
import type { AssessmentAction } from '@/hooks/useWheelOfLife';
import { toast } from 'sonner';
import { Target, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

interface Props {
  scores: WoLScores;
  actions: AssessmentAction[];
  onSaveAction: (action: { action_text: string; category: string; priority: number; assessment_id?: string }) => void;
  onToggleAction: (id: string, completed: boolean) => void;
  isSaving: boolean;
}

const WoLActionPlan = ({ scores, actions, onSaveAction, onToggleAction, isSaving }: Props) => {
  const [acceptedChallenge, setAcceptedChallenge] = useState(false);

  const categorized = useMemo(() => {
    const urgent = WOL_SPOKES.filter(s => scores[s.id] <= 4).map(s => ({ spoke: s, score: scores[s.id] }));
    const improve = WOL_SPOKES.filter(s => scores[s.id] >= 5 && scores[s.id] <= 6).map(s => ({ spoke: s, score: scores[s.id] }));
    const maintain = WOL_SPOKES.filter(s => scores[s.id] >= 7).map(s => ({ spoke: s, score: scores[s.id] }));
    return { urgent, improve, maintain };
  }, [scores]);

  const lowestSpoke = useMemo(() => {
    let minSpoke = WOL_SPOKES[0] as typeof WOL_SPOKES[number];
    let minScore = scores[WOL_SPOKES[0].id];
    WOL_SPOKES.forEach(s => {
      if (scores[s.id] < minScore) {
        minSpoke = s;
        minScore = scores[s.id];
      }
    });
    return { spoke: minSpoke, score: minScore };
  }, [scores]);

  const handleAcceptChallenge = () => {
    const challengeActions = getActionsForScore(lowestSpoke.spoke.name, lowestSpoke.score);
    challengeActions.forEach((text, idx) => {
      onSaveAction({
        action_text: text,
        category: lowestSpoke.spoke.name,
        priority: idx + 1,
      });
    });
    setAcceptedChallenge(true);
    toast.success(`🏆 30-Day Challenge accepted for ${lowestSpoke.spoke.name}!`);
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
        <h2 className="text-lg font-bold text-foreground flex items-center justify-center gap-2">
          <Target className="h-5 w-5" /> Your Personalized Action Plan
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Based on your assessment, here's your transformation roadmap</p>
      </div>

      {/* Priority Matrix */}
      <div className="space-y-3">
        {categorized.urgent.length > 0 && (
          <Card className="border-red-500/30">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> 🔴 Fix First (Score 1-4)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {categorized.urgent.map(({ spoke, score }) => (
                <div key={spoke.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{spoke.emoji} {spoke.name}</span>
                    <Badge variant="destructive">{score}/10</Badge>
                  </div>
                  <ul className="space-y-1">
                    {getActionsForScore(spoke.name, score).map((action, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span> {action}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {categorized.improve.length > 0 && (
          <Card className="border-yellow-500/30">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm text-yellow-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> 🟡 Improve (Score 5-6)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {categorized.improve.map(({ spoke, score }) => (
                <div key={spoke.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{spoke.emoji} {spoke.name}</span>
                    <Badge className="bg-yellow-500/15 text-yellow-600 border-yellow-500/30">{score}/10</Badge>
                  </div>
                  <ul className="space-y-1">
                    {getActionsForScore(spoke.name, score).map((action, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">•</span> {action}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {categorized.maintain.length > 0 && (
          <Card className="border-green-500/30">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> 🟢 Maintain (Score 7-10)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {categorized.maintain.map(({ spoke, score }) => (
                <div key={spoke.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{spoke.emoji} {spoke.name}</span>
                    <Badge className="bg-green-500/15 text-green-600 border-green-500/30">{score}/10</Badge>
                  </div>
                  <ul className="space-y-1">
                    {getActionsForScore(spoke.name, score).map((action, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span> {action}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 30-Day Challenge */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/30">
        <CardContent className="p-5">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-2">
            🏆 Your 30-Day Balance Challenge
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Focus on your lowest scoring area: <strong>{lowestSpoke.spoke.emoji} {lowestSpoke.spoke.name} ({lowestSpoke.score}/10)</strong>
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {['Week 1: Awareness', 'Week 2: Action', 'Week 3: Acceleration', 'Week 4: Integration'].map((week, i) => (
              <div key={i} className="p-3 rounded-lg bg-card border border-border">
                <p className="text-xs font-semibold text-foreground">{week}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {i === 0 && 'Observe patterns & set baseline'}
                  {i === 1 && 'Implement daily actions'}
                  {i === 2 && 'Double down on what works'}
                  {i === 3 && 'Build lasting habits'}
                </p>
              </div>
            ))}
          </div>

          {!acceptedChallenge ? (
            <Button onClick={handleAcceptChallenge} disabled={isSaving} className="w-full">
              🎯 Accept 30-Day Challenge
            </Button>
          ) : (
            <div className="text-center text-sm text-green-600 font-semibold p-2 bg-green-500/10 rounded-lg">
              ✅ Challenge Accepted! Actions saved to your plan.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Action Items */}
      {actions.length > 0 && (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">📋 My Action Items ({actions.filter(a => a.status === 'completed').length}/{actions.length} completed)</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {actions.map(action => (
              <div key={action.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30">
                <Checkbox
                  checked={action.status === 'completed'}
                  onCheckedChange={(checked) => onToggleAction(action.id, !!checked)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className={`text-sm ${action.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {action.action_text}
                  </p>
                  {action.category && (
                    <p className="text-[10px] text-muted-foreground">{action.category}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WoLActionPlan;
