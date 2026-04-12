import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';

interface WorksheetStatusCardProps {
  hasFilledToday: boolean;
  streak: number;
}

const WorksheetStatusCard = ({ hasFilledToday, streak }: WorksheetStatusCardProps) => (
  <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden">
    <div className="h-1.5 gradient-saffron" />
    <div className="p-4 text-center">
      <div className="w-10 h-10 rounded-xl gradient-saffron flex items-center justify-center mx-auto mb-2">
        <ClipboardList className="w-5 h-5 text-primary-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground">Today</p>
      <p className={`text-xs font-medium mt-1 ${hasFilledToday ? 'text-dharma-green' : 'text-destructive'}`}>
        {hasFilledToday ? '✅ Done' : '⚠️ Pending'}
      </p>
    </div>
  </div>
);

export default WorksheetStatusCard;
