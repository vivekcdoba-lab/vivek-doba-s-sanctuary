import HappinessFullExperience from '@/components/happiness-assessment/HappinessFullExperience';
import { useNavigate } from 'react-router-dom';

const HappinessPage = () => {
  const navigate = useNavigate();
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <HappinessFullExperience onClose={() => navigate('/seeker/assessments')} />
    </div>
  );
};

export default HappinessPage;
