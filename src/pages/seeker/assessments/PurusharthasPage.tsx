import PurusharthasFullExperience from '@/components/purusharthas-assessment/PurusharthasFullExperience';
import { useNavigate } from 'react-router-dom';

const PurusharthasPage = () => {
  const navigate = useNavigate();
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <PurusharthasFullExperience onClose={() => navigate('/seeker/assessments')} />
    </div>
  );
};

export default PurusharthasPage;
