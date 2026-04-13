import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { WOL_SPOKES, WoLScores, getScoreZone } from './wolData';

interface Props {
  scores: WoLScores;
  notes?: Record<string, string>;
  onUpdateScore: (spokeId: keyof WoLScores, value: number) => void;
  onUpdateNote?: (spokeId: string, value: string) => void;
  onAnalyze: () => void;
  isSubmitting?: boolean;
}

const WoLTakeAssessment = ({ scores, notes = {}, onUpdateScore, onUpdateNote, onAnalyze, isSubmitting }: Props) => {
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const average = (Object.values(scores).reduce((sum, s) => sum + s, 0) / 8).toFixed(1);

  const toggleNote = (id: string) => {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Instructions Card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
            📝 How to Rate
          </h3>
          <p className="text-sm text-muted-foreground">
            Rate each life area from 1 (very dissatisfied) to 10 (completely satisfied).
            Be honest with yourself — this assessment is for your growth! 🙏
          </p>
        </CardContent>
      </Card>

      {/* Live Average Score */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground overflow-hidden">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Current Average Score</p>
            <p className="text-3xl font-bold">{average}/10</p>
          </div>
          <span className="text-5xl">🎡</span>
        </CardContent>
      </Card>

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

      {/* Spoke Input Cards */}
      <div className="space-y-2">
        {WOL_SPOKES.map((spoke) => {
          const score = scores[spoke.id];
          const zone = getScoreZone(score);
          const noteExpanded = expandedNotes[spoke.id];
          return (
            <Card key={spoke.id} className="overflow-hidden hover:shadow-md transition-shadow">
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

                    {/* Notes toggle */}
                    <button
                      onClick={() => toggleNote(spoke.id)}
                      className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {noteExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {notes[spoke.id] ? '📝 Edit note' : '+ Add note'}
                    </button>

                    {noteExpanded && (
                      <Textarea
                        placeholder={`Add notes about your ${spoke.name.toLowerCase()} (optional)...`}
                        value={notes[spoke.id] || ''}
                        onChange={(e) => onUpdateNote?.(spoke.id, e.target.value)}
                        className="mt-2 text-sm resize-none h-16"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Submit Section */}
      <Card className="bg-gradient-to-r from-muted/50 to-primary/5">
        <CardContent className="p-6 text-center space-y-4">
          <div>
            <p className="text-lg font-semibold text-foreground">Ready to see your life balance?</p>
            <p className="text-sm text-muted-foreground">
              Your average score: <span className="font-bold text-primary">{average}/10</span>
            </p>
          </div>

          <Button
            onClick={onAnalyze}
            className="w-full py-6 text-base font-bold"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Calculating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                🎯 Calculate My Life Balance
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Your assessment will be saved and you can track your progress over time
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WoLTakeAssessment;
