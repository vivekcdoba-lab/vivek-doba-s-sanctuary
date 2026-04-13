import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PurusharthasScores, PURUSHARTHAS_DIMENSIONS } from './purusharthasData';

interface Props {
  scores: PurusharthasScores;
  notes: Record<string, string>;
  onUpdateScore: (dim: keyof PurusharthasScores, value: number) => void;
  onUpdateNote: (dim: string, value: string) => void;
  onAnalyze: () => void;
}

const PurusharthasTakeAssessment = ({ scores, notes, onUpdateScore, onUpdateNote, onAnalyze }: Props) => {
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const values = Object.values(scores);
  const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  const filled = values.filter(v => v !== 5).length;

  return (
    <div className="space-y-4">
      <Card className="p-4 text-center bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">Live Balance Score</p>
        <p className="text-3xl font-bold text-primary">{avg}<span className="text-lg text-muted-foreground">/10</span></p>
        <p className="text-xs text-muted-foreground mt-1">{filled}/4 pillars rated</p>
      </Card>

      {PURUSHARTHAS_DIMENSIONS.map((dim) => (
        <Card key={dim.id} className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{dim.emoji}</span>
              <div>
                <h3 className="font-semibold text-sm text-foreground">{dim.name}</h3>
                <p className="text-xs text-muted-foreground">{dim.hindi} — {dim.description}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-lg font-bold" style={{ color: dim.color }}>{scores[dim.id]}/10</Badge>
          </div>

          <Slider min={1} max={10} step={1} value={[scores[dim.id]]} onValueChange={([v]) => onUpdateScore(dim.id, v)} className="py-2" />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 — Needs Work</span>
            <span>10 — Thriving</span>
          </div>

          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setExpandedDim(expandedDim === dim.id ? null : dim.id)}>
            {expandedDim === dim.id ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
            Guiding Questions & Sub-Dimensions
          </Button>

          {expandedDim === dim.id && (
            <div className="space-y-3 pt-2 border-t border-border">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Sub-Dimensions:</p>
                {dim.subDimensions.map(sub => (
                  <p key={sub.id} className="text-xs text-muted-foreground ml-2">• {sub.name}: {sub.description}</p>
                ))}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Guiding Questions:</p>
                {dim.guidingQuestions.map((q, i) => (
                  <p key={i} className="text-xs text-muted-foreground ml-2 italic">• {q}</p>
                ))}
              </div>
              <Textarea placeholder={`Notes about your ${dim.name}...`} value={notes[dim.id] || ''} onChange={(e) => onUpdateNote(dim.id, e.target.value)} className="text-xs" rows={2} />
            </div>
          )}
        </Card>
      ))}

      <Button className="w-full" size="lg" onClick={onAnalyze}>
        🕉️ Analyze My Purusharthas Balance
      </Button>
    </div>
  );
};

export default PurusharthasTakeAssessment;
