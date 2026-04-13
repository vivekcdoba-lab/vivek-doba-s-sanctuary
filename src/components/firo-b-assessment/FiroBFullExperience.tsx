import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, ClipboardList, BarChart3, Target, History } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { FiroBScores, DEFAULT_SCORES } from './firoBData';
import FiroBTakeAssessment from './FiroBTakeAssessment';
import FiroBResults from './FiroBResults';
import FiroBActionPlan from './FiroBActionPlan';
import FiroBHistory from './FiroBHistory';
import { useFiroBAssessment, FiroBAssessment } from '@/hooks/useFiroBAssessment';

interface Props { onClose?: () => void; }

const FiroBFullExperience = ({ onClose }: Props) => {
  const [scores, setScores] = useState<FiroBScores>({ ...DEFAULT_SCORES });
  const [activeTab, setActiveTab] = useState('take');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { history, saveAssessment, actions, saveAction, toggleAction } = useFiroBAssessment();

  const handleComplete = (finalScores: FiroBScores) => {
    setScores(finalScores);
    setHasSubmitted(true);
    setActiveTab('results');
  };

  const handleSave = async () => {
    try { await saveAssessment.mutateAsync(scores); toast.success('✅ FIRO-B Assessment saved!'); } catch { toast.error('Failed to save'); }
  };

  const scoresFrom = (a: FiroBAssessment): FiroBScores => ({
    eI: a.expressed_inclusion, wI: a.wanted_inclusion,
    eC: a.expressed_control, wC: a.wanted_control,
    eA: a.expressed_affection, wA: a.wanted_affection,
  });

  const handleViewDetails = (a: FiroBAssessment) => { setScores(scoresFrom(a)); setHasSubmitted(true); setActiveTab('results'); };
  const previousAssessment = history.length > 0 ? history[0] : null;

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">👥 FIRO-B (Interpersonal)</h2>
          <p className="text-sm text-muted-foreground">Understand your interpersonal needs — Inclusion, Control & Affection</p>
          {previousAssessment && <p className="text-xs text-muted-foreground mt-1">Last: {format(new Date(previousAssessment.created_at), 'MMM d, yyyy')} | E={previousAssessment.total_expressed} W={previousAssessment.total_wanted}</p>}
        </div>
        {onClose && <Button variant="ghost" size="sm" onClick={onClose}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>}
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="take" className="text-xs gap-1"><ClipboardList className="h-3.5 w-3.5" /> Take</TabsTrigger>
          <TabsTrigger value="results" className="text-xs gap-1" disabled={!hasSubmitted && history.length === 0}><BarChart3 className="h-3.5 w-3.5" /> Results</TabsTrigger>
          <TabsTrigger value="actions" className="text-xs gap-1" disabled={!hasSubmitted && history.length === 0}><Target className="h-3.5 w-3.5" /> Action Plan</TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1"><History className="h-3.5 w-3.5" /> History</TabsTrigger>
        </TabsList>
        <TabsContent value="take"><FiroBTakeAssessment scores={scores} onComplete={handleComplete} /></TabsContent>
        <TabsContent value="results">
          {hasSubmitted ? (<div className="space-y-4"><FiroBResults scores={scores} previousAssessment={previousAssessment} /><div className="grid grid-cols-2 gap-3"><Button variant="outline" onClick={() => window.print()}>🖨️ Print</Button><Button onClick={handleSave} disabled={saveAssessment.isPending}><Save className="h-4 w-4 mr-1" /> {saveAssessment.isPending ? 'Saving...' : 'Save'}</Button></div></div>)
          : history.length > 0 ? <FiroBResults scores={scoresFrom(history[0])} previousAssessment={history.length > 1 ? history[1] : null} /> : null}
        </TabsContent>
        <TabsContent value="actions"><FiroBActionPlan scores={hasSubmitted ? scores : history.length > 0 ? scoresFrom(history[0]) : scores} actions={actions} onSaveAction={(a) => saveAction.mutate(a)} onToggleAction={(id, c) => toggleAction.mutate({ id, completed: c })} isSaving={saveAction.isPending} /></TabsContent>
        <TabsContent value="history"><FiroBHistory history={history} onViewDetails={handleViewDetails} /></TabsContent>
      </Tabs>
    </div>
  );
};

export default FiroBFullExperience;
