import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LGT_DIMENSIONS, LgtScores, getScoreZone } from './lgtData';

interface Props {
  scores: LgtScores;
  notes: Record<string, string>;
  onUpdateScore: (dim: keyof LgtScores, value: number) => void;
  onUpdateNote: (dim: string, value: string) => void;
  onAnalyze: () => void;
}

const LgtTakeAssessment = ({ scores, notes, onUpdateScore, onUpdateNote, onAnalyze }: Props) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const avg = (Object.values(scores).reduce((a, b) => a + b, 0) / 4).toFixed(1);

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Current Average</p>
          <p className="text-3xl font-bold text-primary">{avg}<span className="text-lg text-muted-foreground">/10</span></p>
        </CardContent>
      </Card>

      {LGT_DIMENSIONS.map(dim => {
        const score = scores[dim.id];
        const zone = getScoreZone(score);
        const isExpanded = expandedId === dim.id;

        return (
          <Card key={dim.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>{dim.emoji}</span> {dim.name}
                  <span className="text-xs text-muted-foreground">({dim.hindi})</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" style={{ borderColor: zone.color, color: zone.color }}>
                    {zone.emoji} {score}/10
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{dim.description}</p>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <Slider
                value={[score]}
                min={1}
                max={10}
                step={1}
                onValueChange={([v]) => onUpdateScore(dim.id, v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 — Neglected</span>
                <span>10 — Thriving</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setExpandedId(isExpanded ? null : dim.id)}
              >
                {isExpanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                {isExpanded ? 'Hide' : 'Guiding Questions & Notes'}
              </Button>

              {isExpanded && (
                <div className="space-y-2 animate-fade-up">
                  <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
                    {dim.questions.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
                  <Textarea
                    placeholder={`Reflections on your ${dim.name} journey...`}
                    value={notes[dim.id] || ''}
                    onChange={e => onUpdateNote(dim.id, e.target.value)}
                    className="text-xs min-h-[60px]"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Button className="w-full" size="lg" onClick={onAnalyze}>
        🔺 Calculate My LGT Balance
      </Button>
    </div>
  );
};

export default LgtTakeAssessment;
