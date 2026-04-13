import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Sparkles } from 'lucide-react';
import { WOL_SPOKES, WoLScores, getScoreZone } from './wolData';

interface Props {
  scores: WoLScores;
  onUpdateScore: (spokeId: keyof WoLScores, value: number) => void;
  onAnalyze: () => void;
}

const WoLTakeAssessment = ({ scores, onUpdateScore, onAnalyze }: Props) => {
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
        <p className="text-sm text-muted-foreground">
          Rate each area of your life honestly from 1 (Very Dissatisfied) to 10 (Fully Satisfied)
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-1">
        {WOL_SPOKES.map((spoke) => (
          <div
            key={spoke.id}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              scores[spoke.id] !== 5 ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <div className="space-y-2">
        {WOL_SPOKES.map((spoke) => {
          const score = scores[spoke.id];
          const zone = getScoreZone(score);
          return (
            <Card key={spoke.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: `${spoke.color}20`, color: spoke.color }}
                  >
                    {spoke.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{spoke.name}</p>
                        <p className="text-[10px] text-muted-foreground">{spoke.hindi}</p>
                      </div>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                        style={{ backgroundColor: spoke.color }}
                      >
                        {score}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">{spoke.description}</p>

                    <Slider
                      value={[score]}
                      onValueChange={(v) => onUpdateScore(spoke.id, v[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />

                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[9px] text-muted-foreground">1 - Very Dissatisfied</span>
                      <Badge variant="outline" className={`text-[9px] ${zone.class}`}>
                        {zone.emoji} {zone.label}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground">10 - Fully Satisfied</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button onClick={onAnalyze} className="w-full py-6 text-base font-bold" size="lg">
        <Sparkles className="h-5 w-5 mr-2" />
        🎯 CALCULATE MY LIFE BALANCE
      </Button>
    </div>
  );
};

export default WoLTakeAssessment;
