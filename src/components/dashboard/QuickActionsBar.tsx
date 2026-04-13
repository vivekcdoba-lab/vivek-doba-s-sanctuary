import { Link } from 'react-router-dom';
import { ScrollText, BookOpen, Library, Headphones } from 'lucide-react';

const actions = [
  { label: 'Worksheet', icon: ScrollText, path: '/seeker/worksheet', gradient: 'gradient-saffron' },
  { label: 'Assessment', icon: BookOpen, path: '/seeker/assessments/history', gradient: 'gradient-sacred' },
  { label: 'Resources', icon: Library, path: '/seeker/learning/videos', gradient: 'gradient-growth' },
  { label: 'Meditate', icon: Headphones, path: '/seeker/sacred-space', gradient: 'gradient-hero' },
];

const QuickActionsBar = () => (
  <div className="grid grid-cols-4 gap-3">
    {actions.map((a) => (
      <Link key={a.label} to={a.path} className={`${a.gradient} rounded-xl p-3 text-center text-primary-foreground card-hover btn-press`}>
        <a.icon className="w-5 h-5 mx-auto mb-1" />
        <p className="text-[10px] font-medium">{a.label}</p>
      </Link>
    ))}
  </div>
);

export default QuickActionsBar;
