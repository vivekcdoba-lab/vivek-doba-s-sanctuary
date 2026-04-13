import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { LGT_DIMENSIONS, LgtScores, DIMENSION_ACTIONS, getScoreZone } from './lgtData';
import type { AssessmentAction } from '@/hooks/useLgtAssessment';

interface Props {
  scores: LgtScores;
  actions: AssessmentAction[];
  onSaveAction: (action: { action_text: string; category: string; priority: number }) => void;
  onToggleAction: (id: string, completed: boolean) => void;
  isSaving: boolean;
}

const LgtActionPlan = ({ scores, actions, onSaveAction, onToggleAction, isSaving }: Props) => {
  const [newAction, setNewAction] = useState('');
  const [selectedDim, setSelectedDim] = useState('dharma');

  const fixFirst = LGT_DIMENSIONS.filter(d => scores[d.id] <= 4);
  const improve = LGT_DIMENSIONS.filter(d => scores[d.id] >= 5 && scores[d.id] <= 6);
  const maintain = LGT_DIMENSIONS.filter(d => scores[d.id] >= 7);

  const lowest = LGT_DIMENSIONS.reduce((a, b) => scores[a.id] < scores[b.id] ? a : b);

  const handleAdd = () => {
    if (!newAction.trim()) return;
    onSaveAction({ action_text: newAction, category: selectedDim, priority: actions.length + 1 });
    setNewAction('');
  };

  const renderGroup = (title: string, emoji: string, dims: typeof LGT_DIMENSIONS, color: string) => {
    if (dims.length === 0) return null;
    return (
      <Card key={title}>
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm" style={{ color }}>{emoji} {title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-3">
          {dims.map(d => {
            const score = scores[d.id];
            const tier = score <= 4 ? 'low' : score <= 6 ? 'mid' : 'high';
            const recs = DIMENSION_ACTIONS[d.id][tier];
            return (
              <div key={d.id} className="space-y-1">
                <p className="text-sm font-medium">{d.emoji} {d.name} <Badge variant="outline" className="text-xs ml-1">{score}/10</Badge></p>
                <ul className="text-xs text-muted-foreground space-y-0.5 pl-4 list-disc">
                  {recs.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {renderGroup('Fix First (1-4)', '🔴', fixFirst, 'hsl(0, 69%, 50%)')}
      {renderGroup('Improve (5-6)', '🟡', improve, 'hsl(33, 100%, 50%)')}
      {renderGroup('Maintain (7-10)', '🟢', maintain, 'hsl(122, 46%, 33%)')}

      {/* 30-Day Challenge */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm">🏆 30-Day Challenge: Elevate {lowest.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 text-xs text-muted-foreground space-y-1">
          <p>Your lowest dimension is <strong>{lowest.emoji} {lowest.name}</strong> at {scores[lowest.id]}/10.</p>
          <p>Focus the next 30 days on these actions:</p>
          <ul className="pl-4 list-disc space-y-0.5">
            {DIMENSION_ACTIONS[lowest.id].low.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </CardContent>
      </Card>

      {/* Saved Actions */}
      <Card>
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm">✅ My Action Items ({actions.filter(a => a.status === 'completed').length}/{actions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {actions.map(a => (
            <div key={a.id} className="flex items-center gap-2">
              <Checkbox
                checked={a.status === 'completed'}
                onCheckedChange={checked => onToggleAction(a.id, !!checked)}
              />
              <span className={`text-sm flex-1 ${a.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{a.action_text}</span>
              {a.category && <Badge variant="outline" className="text-xs">{a.category}</Badge>}
            </div>
          ))}

          <div className="flex gap-2 mt-2">
            <select
              className="text-xs border rounded px-2 py-1 bg-background"
              value={selectedDim}
              onChange={e => setSelectedDim(e.target.value)}
            >
              {LGT_DIMENSIONS.map(d => <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>)}
            </select>
            <Input
              placeholder="Add action item..."
              value={newAction}
              onChange={e => setNewAction(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="text-sm flex-1"
            />
            <Button size="sm" onClick={handleAdd} disabled={isSaving || !newAction.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LgtActionPlan;
