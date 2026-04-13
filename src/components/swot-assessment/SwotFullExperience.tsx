import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, ClipboardList, BarChart3, Target, History } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { SwotScores, DEFAULT_SWOT } from './swotData';
import SwotTakeAssessment from './SwotTakeAssessment';
import SwotResults from './SwotResults';
import SwotActionPlan from './SwotActionPlan';
import SwotHistory from './SwotHistory';
import { useSwotAssessment, SwotAssessment } from '@/hooks/useSwotAssessment';

interface Props {
  onClose?: () => void;
}

const SwotFullExperience = ({ onClose }: Props) => {
  const [scores, setScores] = useState<SwotScores>({ ...DEFAULT_SWOT });
  const [activeTab, setActiveTab] = useState('take');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { history, saveAssessment, actions, saveAction, toggleAction } = useSwotAssessment();

  const handleUpdateScores = useCallback((newScores: SwotScores) => {
    setScores(newScores);
  }, []);

  const handleAnalyze = () => {
    setHasSubmitted(true);
    setActiveTab('results');
  };

  const handleSave = async () => {
    try {
      await saveAssessment.mutateAsync(scores);
      toast.success('✅ SWOT Assessment saved!');
    } catch {
      toast.error('Failed to save assessment');
    }
  };

  const handleViewDetails = (assessment: SwotAssessment) => {
    setScores({
      strengths: assessment.strengths,
      weaknesses: assessment.weaknesses,
      opportunities: assessment.opportunities,
      threats: assessment.threats,
    });
    setHasSubmitted(true);
    setActiveTab('results');
  };

  const previousAssessment = history.length > 0 ? history[0] : null;
  const currentScores = hasSubmitted ? scores : previousAssessment ? {
    strengths: previousAssessment.strengths,
    weaknesses: previousAssessment.weaknesses,
    opportunities: previousAssessment.opportunities,
    threats: previousAssessment.threats,
  } : scores;

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            📋 Personal SWOT Analysis
          </h2>
          <p className="text-sm text-muted-foreground">
            Identify your Strengths, Weaknesses, Opportunities & Threats
          </p>
          {previousAssessment && (
            <p className="text-xs text-muted-foreground mt-1">
              Last Assessment: {format(new Date(previousAssessment.created_at), 'MMM d, yyyy')} | Balance: {previousAssessment.balance_score?.toFixed(0)}%
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
          <SwotTakeAssessment scores={scores} onUpdateScores={handleUpdateScores} onAnalyze={handleAnalyze} />
        </TabsContent>

        <TabsContent value="results">
          {(hasSubmitted || history.length > 0) && (
            <div className="space-y-4">
              <SwotResults
                scores={currentScores}
                previousAssessment={history.length > 1 ? history[1] : null}
              />
              {hasSubmitted && (
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => window.print()}>
                    🖨️ Print Report
                  </Button>
                  <Button onClick={handleSave} disabled={saveAssessment.isPending}>
                    <Save className="h-4 w-4 mr-1" />
                    {saveAssessment.isPending ? 'Saving...' : 'Save Assessment'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="actions">
          <SwotActionPlan
            scores={currentScores}
            actions={actions}
            onSaveAction={(action) => saveAction.mutate(action)}
            onToggleAction={(id, completed) => toggleAction.mutate({ id, completed })}
            isSaving={saveAction.isPending}
          />
        </TabsContent>

        <TabsContent value="history">
          <SwotHistory history={history} onViewDetails={handleViewDetails} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SwotFullExperience;
