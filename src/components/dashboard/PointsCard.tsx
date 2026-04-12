import { Star } from 'lucide-react';

interface PointsCardProps {
  points: number;
  level: number;
}

const PointsCard = ({ points, level }: PointsCardProps) => (
  <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden">
    <div className="h-1.5 gradient-growth" />
    <div className="p-4 text-center">
      <div className="w-10 h-10 rounded-xl gradient-growth flex items-center justify-center mx-auto mb-2">
        <Star className="w-5 h-5 text-primary-foreground" />
      </div>
      <p className="text-2xl font-bold text-foreground">{points.toLocaleString('en-IN')}</p>
      <p className="text-xs text-muted-foreground">Level {level}</p>
    </div>
  </div>
);

export default PointsCard;
