import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { FIRO_B_QUESTIONS, FIRO_B_DIMENSIONS, FiroBScores } from './firoBData';

interface Props { scores: FiroBScores; onComplete: (scores: FiroBScores) => void; }

const FiroBTakeAssessment = ({ scores: initialScores, onComplete }: Props) => {
  const sections = ['eI', 'wI', 'eC', 'wC', 'eA', 'wA'] as const;
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>(() => {
    const init: Record<string, number[]> = {};
    sections.forEach(s => { init[s] = new Array(FIRO_B_QUESTIONS[s].length).fill(0); });
    return init;
  });

  const sectionCode = sections[currentSection];
  const dim = FIRO_B_DIMENSIONS.find(d => d.code === sectionCode)!;
  const questions = FIRO_B_QUESTIONS[sectionCode];
  const scale = ['Never', 'Rarely', 'Sometimes', 'Often', 'Usually', 'Always'];

  const handleAnswer = (qIndex: number, value: number) => {
    setAnswers(prev => {
      const updated = { ...prev };
      updated[sectionCode] = [...updated[sectionCode]];
      updated[sectionCode][qIndex] = value;
      return updated;
    });
  };

  const sectionAvg = (code: string) => {
    const vals = answers[code];
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.round((sum / vals.length) * (9 / 6) * 10) / 10; // Scale 0-6 avg to 0-9
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      const finalScores: FiroBScores = { eI: 0, wI: 0, eC: 0, wC: 0, eA: 0, wA: 0 };
      sections.forEach(s => { finalScores[s] = Math.min(9, Math.round(sectionAvg(s))); });
      onComplete(finalScores);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">{dim.emoji} {dim.label}</Badge>
          <span className="text-xs text-muted-foreground">Section {currentSection + 1} of {sections.length}</span>
        </div>
        <p className="text-xs text-muted-foreground">{dim.description}</p>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }} />
        </div>
      </Card>

      {questions.map((q, i) => (
        <Card key={i} className="p-4">
          <p className="text-sm text-foreground mb-3">{i + 1}. {q}</p>
          <div className="grid grid-cols-6 gap-1">
            {scale.map((label, val) => (
              <Button key={val} variant={answers[sectionCode][i] === val + 1 ? 'default' : 'outline'} size="sm" className="text-[10px] px-1 py-2 h-auto flex flex-col"
                onClick={() => handleAnswer(i, val + 1)}>
                <span className="font-bold">{val + 1}</span>
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
        </Card>
      ))}

      <Button className="w-full" size="lg" onClick={handleNext}>
        {currentSection < sections.length - 1 ? `Next Section →` : '👥 View My Results →'}
      </Button>
    </div>
  );
};

export default FiroBTakeAssessment;
