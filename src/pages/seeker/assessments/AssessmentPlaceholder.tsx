import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  emoji: string;
  title: string;
  subtitle: string;
}

const AssessmentPlaceholder = ({ emoji, title, subtitle }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-5 animate-fade-up">
      <Button variant="ghost" size="sm" onClick={() => navigate('/seeker/assessments')}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Assessments
      </Button>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">{emoji} {title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <Tabs defaultValue="take" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="take">Take Assessment</TabsTrigger>
          <TabsTrigger value="results">My Results</TabsTrigger>
          <TabsTrigger value="action">Action Plan</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        {['take', 'results', 'action', 'history'].map(tab => (
          <TabsContent key={tab} value={tab}>
            <Card className="p-8 text-center">
              <p className="text-4xl mb-4">{emoji}</p>
              <p className="text-muted-foreground">
                {tab === 'take' && 'Assessment form coming soon in Phase 2'}
                {tab === 'results' && 'Results & Charts coming soon in Phase 3'}
                {tab === 'action' && 'Action Plan coming soon in Phase 4'}
                {tab === 'history' && 'History coming soon in Phase 4'}
              </p>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AssessmentPlaceholder;
