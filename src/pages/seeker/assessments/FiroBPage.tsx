import FiroBFullExperience from '@/components/firo-b-assessment/FiroBFullExperience';
import { useNavigate } from 'react-router-dom';

const FiroBPage = () => {
  const navigate = useNavigate();
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <FiroBFullExperience onClose={() => navigate('/seeker/assessments')} />
    </div>
  );
};

export default FiroBPage;
