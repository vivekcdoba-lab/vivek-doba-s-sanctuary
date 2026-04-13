import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { HappinessScores, HAPPINESS_DIMENSIONS, ACTION_RECOMMENDATIONS } from './happinessData';

interface Props {
  scores: HappinessScores;
  actions: any[];
  onSaveAction: (action: { action_text: string; category: string; priority: number }) => void;
  onToggleAction: (id: string, completed: boolean) => void;
  isSaving: boolean;
}

const HappinessActionPlan = ({ scores, actions, onSaveAction, onToggleAction, isSaving }: Props) => {
  const [newAction, setNewAction] = useState('');
  const dims = HAPPINESS_DIMENSIONS;
  const fixFirst = dims.filter(d => scores[d.id] <= 4);
  const improve = dims.filter(d => scores[d.id] >= 5 && scores[d.id] <= 6);
  const maintain = dims.filter(d => scores[d.id] >= 7);
  const lowestDim = dims.reduce((a, b) => scores[a.id] < scores[b.id] ? a : b);

  const getRecs = (id: string, score: number) => {
    const r = ACTION_RECOMMENDATIONS[id]; if (!r) return [];
    return score <= 4 ? r.low : score <= 6 ? r.mid : r.high;
  };

  return (
    <div className="space-y-4">
      {fixFirst.length > 0 && <Card className="p-4 border-destructive/30 bg-destructive/5"><h3 className="font-semibold text-sm text-destructive mb-2">🔴 Fix First (Score 1-4)</h3>{fixFirst.map(d => (<div key={d.id} className="mb-3"><p className="text-xs font-medium">{d.emoji} {d.name}: {scores[d.id]}/10</p>{getRecs(d.id, scores[d.id]).map((r, i) => <p key={i} className="text-xs text-muted-foreground ml-4">• {r}</p>)}</div>))}</Card>}
      {improve.length > 0 && <Card className="p-4 border-yellow-500/30 bg-yellow-500/5"><h3 className="font-semibold text-sm text-yellow-600 mb-2">🟡 Improve (Score 5-6)</h3>{improve.map(d => (<div key={d.id} className="mb-3"><p className="text-xs font-medium">{d.emoji} {d.name}: {scores[d.id]}/10</p>{getRecs(d.id, scores[d.id]).map((r, i) => <p key={i} className="text-xs text-muted-foreground ml-4">• {r}</p>)}</div>))}</Card>}
      {maintain.length > 0 && <Card className="p-4 border-green-500/30 bg-green-500/5"><h3 className="font-semibold text-sm text-green-600 mb-2">🟢 Maintain (Score 7-10)</h3>{maintain.map(d => (<div key={d.id} className="mb-3"><p className="text-xs font-medium">{d.emoji} {d.name}: {scores[d.id]}/10</p>{getRecs(d.id, scores[d.id]).map((r, i) => <p key={i} className="text-xs text-muted-foreground ml-4">• {r}</p>)}</div>))}</Card>}

      <Card className="p-4 bg-primary/5 border-primary/20">
        <h3 className="font-semibold text-sm mb-2">🎯 30-Day {lowestDim.name} Boost</h3>
        <p className="text-xs text-muted-foreground">Focus: {lowestDim.emoji} {lowestDim.name} ({scores[lowestDim.id]}/10)</p>
        {getRecs(lowestDim.id, scores[lowestDim.id]).map((r, i) => <p key={i} className="text-xs text-muted-foreground ml-2 mt-1">Week {i + 1}: {r}</p>)}
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">📝 My Action Items</h3>
        <div className="flex gap-2 mb-3">
          <Input placeholder="Add a custom action..." value={newAction} onChange={(e) => setNewAction(e.target.value)} className="text-xs" />
          <Button size="sm" disabled={!newAction.trim() || isSaving} onClick={() => { onSaveAction({ action_text: newAction, category: 'custom', priority: actions.length + 1 }); setNewAction(''); }}>Add</Button>
        </div>
        {actions.map(a => (<div key={a.id} className="flex items-center gap-2 py-1"><Checkbox checked={a.status === 'completed'} onCheckedChange={(c) => onToggleAction(a.id, !!c)} /><span className={`text-xs ${a.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{a.action_text}</span></div>))}
      </Card>
    </div>
  );
};

export default HappinessActionPlan;
