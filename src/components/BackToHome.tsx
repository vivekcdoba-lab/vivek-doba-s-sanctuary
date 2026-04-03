import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackToHomeProps {
  light?: boolean;
}

const BackToHome = ({ light }: BackToHomeProps) => (
  <Link
    to="/seeker/home"
    className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
      light
        ? 'text-primary-foreground/70 hover:text-primary-foreground'
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    <ArrowLeft className="w-4 h-4" />
    Back to Home
  </Link>
);

export default BackToHome;
