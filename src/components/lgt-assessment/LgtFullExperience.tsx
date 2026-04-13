import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, ClipboardList, BarChart3, Target, History } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { LgtScores, DEFAULT_SCORES } from './lgtData';
import LgtTakeAssessment from './LgtTakeAssessment';
import LgtResults from './LgtResults';
import LgtActionPlan from './LgtActionPlan';
import LgtHistory from './LgtHistory';
import { useLgtAssessment, LgtAssessment } from '@/hooks/useLgtAssessment';

interface Props {
  onClose?: () => void;
}

const LgtFullExperience = ({ onClose }: Props) => {
  const [scores, setScores] = useState<LgtScores>({ ...DEFAULT_SCORES });
  const [dimNotes, setDimNotes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('take');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { history, saveAssessment, actions, saveAction, toggleAction } = useLgtAssessment();

  const handleUpdateScore = useCallback((dim: keyof LgtScores, value: number) => {
    setScores(prev => ({ ...prev, [dim]: value }));
  }, []);

  const handleUpdateNote = useCallback((dim: string, value: string) => {
    setDimNotes(prev => ({ ...prev, [dim]: value }));
  }, []);

  const handleAnalyze = () => {
    setHasSubmitted(true);
    setActiveTab('results');
  };

  const handleSave = async () => {
    try {
      await saveAssessment.mutateAsync(scores);
      toast.success('✅ LGT Assessment saved!');
    } catch {
      toast.error('Failed to save assessment');
    }
  };

  const handleViewDetails = (assessment: LgtAssessment) => {
    setScores({
      dharma: assessment.dharma_score,
      artha: assessment.artha_score,
      kama: assessment.kama_score,
      moksha: assessment.moksha_score,
    });
    setHasSubmitted(true);
    setActiveTab('results');
  };

  const previousAssessment = history.length > 0 ? history[0] : null;

  const scoresFromAssessment = (a: LgtAssessment): LgtScores => ({
    dharma: a.dharma_score, artha: a.artha_score, kama: a.kama_score, moksha: a.moksha_score,
  });

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">🔺 LGT Dimension Score</h2>
          <p className="text-sm text-muted-foreground">Life's Golden Triangle — Balance Dharma, Artha, Kama & Moksha</p>
          {previousAssessment && (
            <p className="text-xs text-muted-foreground mt-1">
              Last Assessment: {format(new Date(previousAssessment.created_at), 'MMM d, yyyy')} | Avg: {previousAssessment.average_score?.toFixed(1)}/10
            </p>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="take" className="text-xs gap-1"><ClipboardList className="h-3.5 w-3.5" /> Take</TabsTrigger>
          <TabsTrigger value="results" className="text-xs gap-1" disabled={!hasSubmitted && history.length === 0}><BarChart3 className="h-3.5 w-3.5" /> Results</TabsTrigger>
          <TabsTrigger value="actions" className="text-xs gap-1" disabled={!hasSubmitted && history.length === 0}><Target className="h-3.5 w-3.5" /> Action Plan</TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1"><History className="h-3.5 w-3.5" /> History</TabsTrigger>
        </TabsList>

        <TabsContent value="take">
          <LgtTakeAssessment scores={scores} notes={dimNotes} onUpdateScore={handleUpdateScore} onUpdateNote={handleUpdateNote} onAnalyze={handleAnalyze} />
        </TabsContent>

        <TabsContent value="results">
          {hasSubmitted ? (
            <div className="space-y-4">
              <LgtResults scores={scores} previousAssessment={previousAssessment} />
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => window.print()}>🖨️ Print Report</Button>
                <Button onClick={handleSave} disabled={saveAssessment.isPending}>
                  <Save className="h-4 w-4 mr-1" /> {saveAssessment.isPending ? 'Saving...' : 'Save Assessment'}
                </Button>
              </div>
            </div>
          ) : history.length > 0 ? (
            <LgtResults scores={scoresFromAssessment(history[0])} previousAssessment={history.length > 1 ? history[1] : null} />
          ) : null}
        </TabsContent>

        <TabsContent value="actions">
          <LgtActionPlan
            scores={hasSubmitted ? scores : history.length > 0 ? scoresFromAssessment(history[0]) : scores}
            actions={actions}
            onSaveAction={(action) => saveAction.mutate(action)}
            onToggleAction={(id, completed) => toggleAction.mutate({ id, completed })}
            isSaving={saveAction.isPending}
          />
        </TabsContent>

        <TabsContent value="history">
          <LgtHistory history={history} onViewDetails={handleViewDetails} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LgtFullExperience;
