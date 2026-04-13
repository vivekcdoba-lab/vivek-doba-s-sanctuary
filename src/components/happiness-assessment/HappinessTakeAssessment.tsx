import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { HappinessScores, HAPPINESS_DIMENSIONS } from './happinessData';

interface Props {
  scores: HappinessScores;
  notes: Record<string, string>;
  onUpdateScore: (dim: keyof HappinessScores, value: number) => void;
  onUpdateNote: (dim: string, value: string) => void;
  onAnalyze: () => void;
}

const HappinessTakeAssessment = ({ scores, notes, onUpdateScore, onUpdateNote, onAnalyze }: Props) => {
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const values = Object.values(scores);
  const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  const filled = values.filter(v => v !== 5).length;

  return (
    <div className="space-y-4">
      <Card className="p-4 text-center bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">Live Happiness Index</p>
        <p className="text-3xl font-bold text-primary">{avg}<span className="text-lg text-muted-foreground">/10</span></p>
        <p className="text-xs text-muted-foreground mt-1">{filled}/8 dimensions rated</p>
      </Card>

      {HAPPINESS_DIMENSIONS.map((dim) => (
        <Card key={dim.id} className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{dim.emoji}</span>
              <div>
                <h3 className="font-semibold text-sm text-foreground">{dim.name}</h3>
                <p className="text-xs text-muted-foreground">{dim.description}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-lg font-bold" style={{ color: dim.color }}>{scores[dim.id]}/10</Badge>
          </div>
          <Slider min={1} max={10} step={1} value={[scores[dim.id]]} onValueChange={([v]) => onUpdateScore(dim.id, v)} className="py-2" />
          <div className="flex justify-between text-xs text-muted-foreground"><span>1 — Very Low</span><span>10 — Flourishing</span></div>
          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setExpandedDim(expandedDim === dim.id ? null : dim.id)}>
            {expandedDim === dim.id ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />} Guiding Questions
          </Button>
          {expandedDim === dim.id && (
            <div className="space-y-2 pt-2 border-t border-border">
              {dim.guidingQuestions.map((q, i) => <p key={i} className="text-xs text-muted-foreground italic ml-2">• {q}</p>)}
              <Textarea placeholder={`Notes about ${dim.name}...`} value={notes[dim.id] || ''} onChange={(e) => onUpdateNote(dim.id, e.target.value)} className="text-xs" rows={2} />
            </div>
          )}
        </Card>
      ))}
      <Button className="w-full" size="lg" onClick={onAnalyze}>😊 Calculate My Happiness Index</Button>
    </div>
  );
};

export default HappinessTakeAssessment;
