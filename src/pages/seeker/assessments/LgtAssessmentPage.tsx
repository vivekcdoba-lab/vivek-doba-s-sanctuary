import LgtFullExperience from '@/components/lgt-assessment/LgtFullExperience';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LgtAssessmentPage = () => {
  const navigate = useNavigate();
  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4 animate-fade-up">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/seeker/assessments')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Assessments
        </Button>
      </div>
      <LgtFullExperience onClose={() => navigate('/seeker/assessments')} />
    </div>
  );
};

export default LgtAssessmentPage;
