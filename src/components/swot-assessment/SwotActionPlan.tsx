import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { SwotScores, STRATEGY_MATRIX } from './swotData';
import type { AssessmentAction } from '@/hooks/useSwotAssessment';

interface Props {
  scores: SwotScores;
  actions: AssessmentAction[];
  onSaveAction: (action: { action_text: string; category: string; priority: number }) => void;
  onToggleAction: (id: string, completed: boolean) => void;
  isSaving: boolean;
}

const SwotActionPlan = ({ scores, actions, onSaveAction, onToggleAction, isSaving }: Props) => {
  const [newActions, setNewActions] = useState<Record<string, string>>({});

  const handleAdd = (strategyId: string) => {
    const text = newActions[strategyId]?.trim();
    if (!text) return;
    onSaveAction({ action_text: text, category: strategyId, priority: actions.length + 1 });
    setNewActions((prev) => ({ ...prev, [strategyId]: '' }));
  };

  // Auto-generate recommendations
  const recommendations: Record<string, string[]> = {
    leverage: scores.strengths.slice(0, 2).flatMap((s) =>
      scores.opportunities.slice(0, 1).map((o) => `Use "${s.text}" to pursue "${o.text}"`)
    ),
    defend: scores.strengths.slice(0, 1).flatMap((s) =>
      scores.threats.slice(0, 1).map((t) => `Leverage "${s.text}" to counter "${t.text}"`)
    ),
    improve: scores.weaknesses.slice(0, 1).flatMap((w) =>
      scores.opportunities.slice(0, 1).map((o) => `Improve "${w.text}" to capture "${o.text}"`)
    ),
    mitigate: scores.weaknesses.slice(0, 1).flatMap((w) =>
      scores.threats.slice(0, 1).map((t) => `Address "${w.text}" before "${t.text}" impacts you`)
    ),
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Create strategic actions using the TOWS matrix — combining your SWOT factors into actionable strategies.
      </p>

      {STRATEGY_MATRIX.map((strategy) => {
        const strategyActions = actions.filter((a) => a.category === strategy.id);
        const recs = recommendations[strategy.id] || [];

        return (
          <Card key={strategy.id} className={`border ${strategy.colorClass}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{strategy.label}</CardTitle>
              <p className="text-xs text-muted-foreground">{strategy.description}</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Auto-recommendations */}
              {recs.length > 0 && strategyActions.length === 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">💡 Suggestions:</p>
                  {recs.map((rec, i) => (
                    <p key={i} className="text-xs text-muted-foreground italic">• {rec}</p>
                  ))}
                </div>
              )}

              {/* Saved actions */}
              {strategyActions.map((action) => (
                <div key={action.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={action.status === 'completed'}
                    onCheckedChange={(checked) => onToggleAction(action.id, !!checked)}
                  />
                  <span className={`text-sm flex-1 ${action.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {action.action_text}
                  </span>
                  {action.status === 'completed' && (
                    <Badge variant="outline" className="text-[10px] text-green-600">Done</Badge>
                  )}
                </div>
              ))}

              {/* Add new */}
              <div className="flex gap-1.5">
                <Input
                  placeholder="Add action item..."
                  value={newActions[strategy.id] || ''}
                  onChange={(e) => setNewActions((prev) => ({ ...prev, [strategy.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd(strategy.id)}
                  className="text-sm h-8"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  onClick={() => handleAdd(strategy.id)}
                  disabled={isSaving}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SwotActionPlan;
