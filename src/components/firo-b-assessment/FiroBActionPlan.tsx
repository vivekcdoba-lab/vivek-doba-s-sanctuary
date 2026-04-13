import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { FiroBScores, FIRO_B_DIMENSIONS, ACTION_RECOMMENDATIONS, getLevel } from './firoBData';

interface Props { scores: FiroBScores; actions: any[]; onSaveAction: (a: { action_text: string; category: string; priority: number }) => void; onToggleAction: (id: string, completed: boolean) => void; isSaving: boolean; }

const FiroBActionPlan = ({ scores, actions, onSaveAction, onToggleAction, isSaving }: Props) => {
  const [newAction, setNewAction] = useState('');

  return (
    <div className="space-y-4">
      {FIRO_B_DIMENSIONS.map(d => {
        const recs = ACTION_RECOMMENDATIONS[d.code] || [];
        return (
          <Card key={d.code} className="p-4">
            <h3 className="font-semibold text-sm mb-2">{d.emoji} {d.label} — {getLevel(scores[d.code])} ({scores[d.code]}/9)</h3>
            {recs.map((r, i) => <p key={i} className="text-xs text-muted-foreground ml-2">• {r}</p>)}
          </Card>
        );
      })}

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">📝 My Action Items</h3>
        <div className="flex gap-2 mb-3"><Input placeholder="Add action..." value={newAction} onChange={(e) => setNewAction(e.target.value)} className="text-xs" /><Button size="sm" disabled={!newAction.trim() || isSaving} onClick={() => { onSaveAction({ action_text: newAction, category: 'custom', priority: actions.length + 1 }); setNewAction(''); }}>Add</Button></div>
        {actions.map(a => (<div key={a.id} className="flex items-center gap-2 py-1"><Checkbox checked={a.status === 'completed'} onCheckedChange={(c) => onToggleAction(a.id, !!c)} /><span className={`text-xs ${a.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{a.action_text}</span></div>))}
      </Card>
    </div>
  );
};

export default FiroBActionPlan;
