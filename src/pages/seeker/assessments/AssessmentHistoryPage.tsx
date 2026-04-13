import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AssessmentHistoryPage = () => {
  const navigate = useNavigate();
  return (
    <div className="p-4 max-w-4xl mx-auto space-y-5 animate-fade-up">
      <Button variant="ghost" size="sm" onClick={() => navigate('/seeker/assessments')}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Assessments
      </Button>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">📈 Assessment History</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your transformation journey across all assessments</p>
      </div>
      <Card className="p-8 text-center">
        <p className="text-4xl mb-4">📈</p>
        <p className="text-muted-foreground">Full assessment history & comparison view coming soon</p>
      </Card>
    </div>
  );
};

export default AssessmentHistoryPage;
