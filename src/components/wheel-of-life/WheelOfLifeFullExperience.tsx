import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, ClipboardList, BarChart3, Target, History } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { WoLScores, DEFAULT_SCORES, WOL_SPOKES } from './wolData';
import WoLTakeAssessment from './WoLTakeAssessment';
import WoLResults from './WoLResults';
import WoLActionPlan from './WoLActionPlan';
import WoLHistory from './WoLHistory';
import { useWheelOfLife, WoLAssessment } from '@/hooks/useWheelOfLife';

interface Props {
  onClose?: () => void;
}

const WheelOfLifeFullExperience = ({ onClose }: Props) => {
  const [scores, setScores] = useState<WoLScores>({ ...DEFAULT_SCORES });
  const [spokeNotes, setSpokeNotes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('take');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { history, saveAssessment, actions, saveAction, toggleAction } = useWheelOfLife();

  const handleUpdateScore = useCallback((spokeId: keyof WoLScores, value: number) => {
    setScores(prev => ({ ...prev, [spokeId]: value }));
  }, []);

  const handleUpdateNote = useCallback((spokeId: string, value: string) => {
    setSpokeNotes(prev => ({ ...prev, [spokeId]: value }));
  }, []);

  const handleAnalyze = () => {
    setHasSubmitted(true);
    setActiveTab('results');
  };

  const handleSave = async () => {
    try {
      await saveAssessment.mutateAsync(scores);
      toast.success('✅ Wheel of Life Assessment saved!');
    } catch {
      toast.error('Failed to save assessment');
    }
  };

  const handleViewDetails = (assessment: WoLAssessment) => {
    // Load the scores from the assessment into view
    setScores({
      career: assessment.career_score,
      finance: assessment.finance_score,
      health: assessment.health_score,
      family: assessment.family_score,
      romance: assessment.romance_score,
      growth: assessment.growth_score,
      fun: assessment.fun_score,
      environment: assessment.environment_score,
    });
    setHasSubmitted(true);
    setActiveTab('results');
  };

  const previousAssessment = history.length > 0 ? history[0] : null;

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            🎡 Wheel of Life Assessment
          </h2>
          <p className="text-sm text-muted-foreground">
            Measure balance across 8 critical life dimensions
          </p>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="take" className="text-xs gap-1">
            <ClipboardList className="h-3.5 w-3.5" /> Take
          </TabsTrigger>
          <TabsTrigger value="results" className="text-xs gap-1" disabled={!hasSubmitted && history.length === 0}>
            <BarChart3 className="h-3.5 w-3.5" /> Results
          </TabsTrigger>
          <TabsTrigger value="actions" className="text-xs gap-1" disabled={!hasSubmitted && history.length === 0}>
            <Target className="h-3.5 w-3.5" /> Action Plan
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1">
            <History className="h-3.5 w-3.5" /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="take">
          <WoLTakeAssessment
            scores={scores}
            notes={spokeNotes}
            onUpdateScore={handleUpdateScore}
            onUpdateNote={handleUpdateNote}
            onAnalyze={handleAnalyze}
          />
        </TabsContent>

        <TabsContent value="results">
          {hasSubmitted ? (
            <div className="space-y-4">
              <WoLResults scores={scores} previousAssessment={previousAssessment} />
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => window.print()}>
                  🖨️ Print Report
                </Button>
                <Button onClick={handleSave} disabled={saveAssessment.isPending}>
                  <Save className="h-4 w-4 mr-1" />
                  {saveAssessment.isPending ? 'Saving...' : 'Save Assessment'}
                </Button>
              </div>
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-4">
              <WoLResults
                scores={{
                  career: history[0].career_score,
                  finance: history[0].finance_score,
                  health: history[0].health_score,
                  family: history[0].family_score,
                  romance: history[0].romance_score,
                  growth: history[0].growth_score,
                  fun: history[0].fun_score,
                  environment: history[0].environment_score,
                }}
                previousAssessment={history.length > 1 ? history[1] : null}
              />
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="actions">
          <WoLActionPlan
            scores={hasSubmitted ? scores : history.length > 0 ? {
              career: history[0].career_score,
              finance: history[0].finance_score,
              health: history[0].health_score,
              family: history[0].family_score,
              romance: history[0].romance_score,
              growth: history[0].growth_score,
              fun: history[0].fun_score,
              environment: history[0].environment_score,
            } : scores}
            actions={actions}
            onSaveAction={(action) => saveAction.mutate(action)}
            onToggleAction={(id, completed) => toggleAction.mutate({ id, completed })}
            isSaving={saveAction.isPending}
          />
        </TabsContent>

        <TabsContent value="history">
          <WoLHistory history={history} onViewDetails={handleViewDetails} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WheelOfLifeFullExperience;
