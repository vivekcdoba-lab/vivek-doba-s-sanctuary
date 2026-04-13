import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { SWOT_QUADRANTS, SwotScores, SwotItem } from './swotData';

interface Props {
  scores: SwotScores;
  onUpdateScores: (scores: SwotScores) => void;
  onAnalyze: () => void;
}

const ImportanceSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        onClick={() => onChange(n)}
        className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
          n <= value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}
      >
        {n}
      </button>
    ))}
  </div>
);

const SwotTakeAssessment = ({ scores, onUpdateScores, onAnalyze }: Props) => {
  const [newTexts, setNewTexts] = useState<Record<string, string>>({});
  const [newCategories, setNewCategories] = useState<Record<string, string>>({});
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null);

  const addItem = (quadrantId: keyof SwotScores) => {
    const text = newTexts[quadrantId]?.trim();
    if (!text) return;
    const item: SwotItem = {
      text,
      importance: 3,
      category: newCategories[quadrantId] || '',
    };
    onUpdateScores({
      ...scores,
      [quadrantId]: [...scores[quadrantId], item],
    });
    setNewTexts((prev) => ({ ...prev, [quadrantId]: '' }));
    setNewCategories((prev) => ({ ...prev, [quadrantId]: '' }));
  };

  const removeItem = (quadrantId: keyof SwotScores, index: number) => {
    onUpdateScores({
      ...scores,
      [quadrantId]: scores[quadrantId].filter((_, i) => i !== index),
    });
  };

  const updateImportance = (quadrantId: keyof SwotScores, index: number, importance: number) => {
    const updated = [...scores[quadrantId]];
    updated[index] = { ...updated[index], importance };
    onUpdateScores({ ...scores, [quadrantId]: updated });
  };

  const totalItems = scores.strengths.length + scores.weaknesses.length + scores.opportunities.length + scores.threats.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SWOT_QUADRANTS.map((q) => (
          <Card key={q.id} className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className={q.colorClass}>
                  {q.emoji} {q.name} ({scores[q.id].length})
                </span>
                <button
                  onClick={() => setExpandedHelp(expandedHelp === q.id ? null : q.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {expandedHelp === q.id ? <ChevronUp className="h-4 w-4" /> : <HelpCircle className="h-4 w-4" />}
                </button>
              </CardTitle>
              <p className="text-xs text-muted-foreground">{q.description}</p>
              {expandedHelp === q.id && (
                <div className="bg-muted/50 rounded-md p-2 text-xs space-y-1 mt-1">
                  <p className="font-medium">Guiding Questions:</p>
                  {q.guidingQuestions.map((gq, i) => (
                    <p key={i} className="text-muted-foreground">• {gq}</p>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {scores[q.id].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-muted/30 rounded-md p-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.text}</p>
                    {item.category && (
                      <Badge variant="outline" className="text-[10px] mt-0.5">{item.category}</Badge>
                    )}
                  </div>
                  <ImportanceSelector
                    value={item.importance}
                    onChange={(v) => updateImportance(q.id, idx, v)}
                  />
                  <button onClick={() => removeItem(q.id, idx)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <div className="space-y-1.5">
                <div className="flex gap-1.5">
                  <Input
                    placeholder={`Add ${q.name.toLowerCase()}...`}
                    value={newTexts[q.id] || ''}
                    onChange={(e) => setNewTexts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addItem(q.id)}
                    className="text-sm h-8"
                  />
                  <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => addItem(q.id)}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {q.categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewCategories((prev) => ({ ...prev, [q.id]: prev[q.id] === cat ? '' : cat }))}
                      className={`text-[10px] px-1.5 py-0.5 rounded-full border transition-colors ${
                        newCategories[q.id] === cat
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-muted-foreground">
          {totalItems} item{totalItems !== 1 ? 's' : ''} added across all quadrants
        </p>
        <Button onClick={onAnalyze} disabled={totalItems < 4} size="lg">
          📊 Analyze My SWOT ({totalItems})
        </Button>
      </div>
    </div>
  );
};

export default SwotTakeAssessment;
