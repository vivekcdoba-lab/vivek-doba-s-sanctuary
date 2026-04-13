import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { MoochScores, MOOCH_PATTERNS, TRANSFORMATION_STRATEGIES } from './moochData';

interface Props { scores: MoochScores; actions: any[]; onSaveAction: (a: { action_text: string; category: string; priority: number }) => void; onToggleAction: (id: string, completed: boolean) => void; isSaving: boolean; }

const MoochActionPlan = ({ scores, actions, onSaveAction, onToggleAction, isSaving }: Props) => {
  const [newAction, setNewAction] = useState('');
  const critical = MOOCH_PATTERNS.filter(p => scores[p.id] >= 7);
  const moderate = MOOCH_PATTERNS.filter(p => scores[p.id] >= 4 && scores[p.id] <= 6);
  const healthy = MOOCH_PATTERNS.filter(p => scores[p.id] <= 3);
  const strongestPattern = MOOCH_PATTERNS.reduce((a, b) => scores[a.id] > scores[b.id] ? a : b);

  const getRecs = (id: string, score: number) => {
    const s = TRANSFORMATION_STRATEGIES[id]; if (!s) return [];
    return score >= 7 ? s.high : score >= 4 ? s.mid : s.low;
  };

  return (
    <div className="space-y-4">
      {critical.length > 0 && <Card className="p-4 border-destructive/30 bg-destructive/5"><h3 className="font-semibold text-sm text-destructive mb-2">🔴 Transform Now (Intensity 7-10)</h3>{critical.map(p => (<div key={p.id} className="mb-3"><p className="text-xs font-medium">{p.emoji} {p.name}: {scores[p.id]}/10</p>{getRecs(p.id, scores[p.id]).map((r, i) => <p key={i} className="text-xs text-muted-foreground ml-4">• {r}</p>)}</div>))}</Card>}
      {moderate.length > 0 && <Card className="p-4 border-yellow-500/30 bg-yellow-500/5"><h3 className="font-semibold text-sm text-yellow-600 mb-2">🟡 Watch & Improve (Intensity 4-6)</h3>{moderate.map(p => (<div key={p.id} className="mb-3"><p className="text-xs font-medium">{p.emoji} {p.name}: {scores[p.id]}/10</p>{getRecs(p.id, scores[p.id]).map((r, i) => <p key={i} className="text-xs text-muted-foreground ml-4">• {r}</p>)}</div>))}</Card>}
      {healthy.length > 0 && <Card className="p-4 border-green-500/30 bg-green-500/5"><h3 className="font-semibold text-sm text-green-600 mb-2">🟢 Healthy (Intensity 1-3)</h3>{healthy.map(p => (<div key={p.id} className="mb-3"><p className="text-xs font-medium">{p.emoji} {p.name}: {scores[p.id]}/10</p>{getRecs(p.id, scores[p.id]).map((r, i) => <p key={i} className="text-xs text-muted-foreground ml-4">• {r}</p>)}</div>))}</Card>}

      <Card className="p-4 bg-primary/5 border-primary/20">
        <h3 className="font-semibold text-sm mb-2">🎯 21-Day {strongestPattern.name} Transformation</h3>
        <p className="text-xs text-muted-foreground">Focus: {strongestPattern.emoji} {strongestPattern.name} (intensity {scores[strongestPattern.id]}/10)</p>
        {getRecs(strongestPattern.id, scores[strongestPattern.id]).map((r, i) => <p key={i} className="text-xs text-muted-foreground ml-2 mt-1">Week {i + 1}: {r}</p>)}
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">📝 My Action Items</h3>
        <div className="flex gap-2 mb-3"><Input placeholder="Add action..." value={newAction} onChange={(e) => setNewAction(e.target.value)} className="text-xs" /><Button size="sm" disabled={!newAction.trim() || isSaving} onClick={() => { onSaveAction({ action_text: newAction, category: 'custom', priority: actions.length + 1 }); setNewAction(''); }}>Add</Button></div>
        {actions.map(a => (<div key={a.id} className="flex items-center gap-2 py-1"><Checkbox checked={a.status === 'completed'} onCheckedChange={(c) => onToggleAction(a.id, !!c)} /><span className={`text-xs ${a.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{a.action_text}</span></div>))}
      </Card>
    </div>
  );
};

export default MoochActionPlan;
