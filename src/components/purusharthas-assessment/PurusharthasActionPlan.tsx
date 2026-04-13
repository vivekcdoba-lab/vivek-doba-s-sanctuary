import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { PurusharthasScores, PURUSHARTHAS_DIMENSIONS, ACTION_RECOMMENDATIONS, getScoreZone } from './purusharthasData';

interface Props {
  scores: PurusharthasScores;
  actions: any[];
  onSaveAction: (action: { action_text: string; category: string; priority: number }) => void;
  onToggleAction: (id: string, completed: boolean) => void;
  isSaving: boolean;
}

const PurusharthasActionPlan = ({ scores, actions, onSaveAction, onToggleAction, isSaving }: Props) => {
  const [newAction, setNewAction] = useState('');

  const fixFirst = PURUSHARTHAS_DIMENSIONS.filter(d => scores[d.id] <= 4);
  const improve = PURUSHARTHAS_DIMENSIONS.filter(d => scores[d.id] >= 5 && scores[d.id] <= 6);
  const maintain = PURUSHARTHAS_DIMENSIONS.filter(d => scores[d.id] >= 7);

  const lowestDim = PURUSHARTHAS_DIMENSIONS.reduce((a, b) => scores[a.id] < scores[b.id] ? a : b);

  const getRecommendations = (dimId: string, score: number) => {
    const recs = ACTION_RECOMMENDATIONS[dimId];
    if (!recs) return [];
    if (score <= 4) return recs.low;
    if (score <= 6) return recs.mid;
    return recs.high;
  };

  return (
    <div className="space-y-4">
      {/* Priority Matrix */}
      {fixFirst.length > 0 && (
        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <h3 className="font-semibold text-sm text-destructive mb-2">🔴 Fix First (Score 1-4)</h3>
          {fixFirst.map(d => (
            <div key={d.id} className="mb-3">
              <p className="text-xs font-medium">{d.emoji} {d.name}: {scores[d.id]}/10</p>
              {getRecommendations(d.id, scores[d.id]).map((r, i) => (
                <p key={i} className="text-xs text-muted-foreground ml-4">• {r}</p>
              ))}
            </div>
          ))}
        </Card>
      )}

      {improve.length > 0 && (
        <Card className="p-4 border-yellow-500/30 bg-yellow-500/5">
          <h3 className="font-semibold text-sm text-yellow-600 mb-2">🟡 Improve (Score 5-6)</h3>
          {improve.map(d => (
            <div key={d.id} className="mb-3">
              <p className="text-xs font-medium">{d.emoji} {d.name}: {scores[d.id]}/10</p>
              {getRecommendations(d.id, scores[d.id]).map((r, i) => (
                <p key={i} className="text-xs text-muted-foreground ml-4">• {r}</p>
              ))}
            </div>
          ))}
        </Card>
      )}

      {maintain.length > 0 && (
        <Card className="p-4 border-green-500/30 bg-green-500/5">
          <h3 className="font-semibold text-sm text-green-600 mb-2">🟢 Maintain (Score 7-10)</h3>
          {maintain.map(d => (
            <div key={d.id} className="mb-3">
              <p className="text-xs font-medium">{d.emoji} {d.name}: {scores[d.id]}/10</p>
              {getRecommendations(d.id, scores[d.id]).map((r, i) => (
                <p key={i} className="text-xs text-muted-foreground ml-4">• {r}</p>
              ))}
            </div>
          ))}
        </Card>
      )}

      {/* 30-Day Challenge */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <h3 className="font-semibold text-sm mb-2">🎯 30-Day {lowestDim.name} Challenge</h3>
        <p className="text-xs text-muted-foreground">Focus on your lowest pillar: {lowestDim.emoji} {lowestDim.name} ({scores[lowestDim.id]}/10)</p>
        {getRecommendations(lowestDim.id, scores[lowestDim.id]).map((r, i) => (
          <p key={i} className="text-xs text-muted-foreground ml-2 mt-1">Week {i + 1}: {r}</p>
        ))}
      </Card>

      {/* Saved Actions */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">📝 My Action Items</h3>
        <div className="flex gap-2 mb-3">
          <Input placeholder="Add a custom action..." value={newAction} onChange={(e) => setNewAction(e.target.value)} className="text-xs" />
          <Button size="sm" disabled={!newAction.trim() || isSaving} onClick={() => { onSaveAction({ action_text: newAction, category: 'custom', priority: actions.length + 1 }); setNewAction(''); }}>
            Add
          </Button>
        </div>
        {actions.map((a) => (
          <div key={a.id} className="flex items-center gap-2 py-1">
            <Checkbox checked={a.status === 'completed'} onCheckedChange={(checked) => onToggleAction(a.id, !!checked)} />
            <span className={`text-xs ${a.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{a.action_text}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default PurusharthasActionPlan;
