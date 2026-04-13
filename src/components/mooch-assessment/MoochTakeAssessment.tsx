import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MoochScores, MOOCH_PATTERNS, getIntensityZone, getIntensityColor } from './moochData';

interface Props {
  scores: MoochScores;
  notes: Record<string, string>;
  onUpdateScore: (dim: keyof MoochScores, value: number) => void;
  onUpdateNote: (dim: string, value: string) => void;
  onAnalyze: () => void;
}

const MoochTakeAssessment = ({ scores, notes, onUpdateScore, onUpdateNote, onAnalyze }: Props) => {
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const values = Object.values(scores);
  const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);

  return (
    <div className="space-y-4">
      <Card className="p-4 text-center bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">Average Pattern Intensity</p>
        <p className="text-3xl font-bold text-primary">{avg}<span className="text-lg text-muted-foreground">/10</span></p>
        <p className="text-xs text-muted-foreground mt-1">Lower is healthier — high scores indicate strong mind patterns needing attention</p>
      </Card>

      {MOOCH_PATTERNS.map((pat) => {
        const zone = getIntensityZone(scores[pat.id]);
        return (
          <Card key={pat.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{pat.emoji}</span>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{pat.name}</h3>
                  <p className="text-xs text-muted-foreground">{pat.description}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-lg font-bold" style={{ color: getIntensityColor(zone) }}>{scores[pat.id]}/10</Badge>
            </div>
            <Slider min={1} max={10} step={1} value={[scores[pat.id]]} onValueChange={([v]) => onUpdateScore(pat.id, v)} className="py-2" />
            <div className="flex justify-between text-xs text-muted-foreground"><span>1 — Rarely Present</span><span>10 — Very Intense</span></div>
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setExpandedDim(expandedDim === pat.id ? null : pat.id)}>
              {expandedDim === pat.id ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />} Awareness Prompts
            </Button>
            {expandedDim === pat.id && (
              <div className="space-y-2 pt-2 border-t border-border">
                {pat.guidingQuestions.map((q, i) => <p key={i} className="text-xs text-muted-foreground italic ml-2">• {q}</p>)}
                <Textarea placeholder={`Notes about ${pat.name}...`} value={notes[pat.id] || ''} onChange={(e) => onUpdateNote(pat.id, e.target.value)} className="text-xs" rows={2} />
              </div>
            )}
          </Card>
        );
      })}
      <Button className="w-full" size="lg" onClick={onAnalyze}>🧠 Analyze My Mind Patterns</Button>
    </div>
  );
};

export default MoochTakeAssessment;
