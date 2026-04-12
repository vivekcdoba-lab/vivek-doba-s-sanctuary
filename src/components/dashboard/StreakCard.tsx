import { Flame } from 'lucide-react';

interface StreakCardProps {
  streak: number;
}

const StreakCard = ({ streak }: StreakCardProps) => (
  <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden">
    <div className="h-1.5 bg-gradient-to-r from-orange-500 to-red-500" />
    <div className="p-4 text-center">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-2">
        <Flame className="w-5 h-5 text-primary-foreground animate-pulse" />
      </div>
      <p className="text-2xl font-bold text-foreground">{streak}</p>
      <p className="text-xs text-muted-foreground">day streak</p>
    </div>
  </div>
);

export default StreakCard;
