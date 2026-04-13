import MoochFullExperience from '@/components/mooch-assessment/MoochFullExperience';
import { useNavigate } from 'react-router-dom';

const MoochPage = () => {
  const navigate = useNavigate();
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <MoochFullExperience onClose={() => navigate('/seeker/assessments')} />
    </div>
  );
};

export default MoochPage;
