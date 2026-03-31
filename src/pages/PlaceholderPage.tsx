import { useLocation } from 'react-router-dom';
import {
  Calendar, BarChart3, Sun, TrendingUp, RefreshCw, MessageSquare,
  FolderOpen, PieChart, Settings, ClipboardList, BookOpen, Heart,
  Compass, CreditCard, Star, Sparkles, User
} from 'lucide-react';

const PAGE_META: Record<string, { icon: any; title: string; description: string; features: string[] }> = {
  calendar: { icon: Calendar, title: 'Sacred Calendar', description: 'Your transformation schedule, aligned with cosmic rhythms.', features: ['Monthly & weekly calendar views', 'Color-coded session types', 'Recurring event patterns', 'One-click session scheduling'] },
  assessments: { icon: BarChart3, title: 'Assessment Center', description: 'Measure transformation across all dimensions of being.', features: ['SWOT Analysis', 'Wheel of Life with spider charts', "Life's Golden Triangle scores", 'Purusharthas (DAKM) balance'] },
  'daily-tracking': { icon: Sun, title: 'Daily Tracking', description: 'Monitor your seekers\' daily sadhana with loving awareness.', features: ['Today\'s submission overview', 'Streak leaderboard', 'Coach comments & encouragement', 'At-risk seeker alerts'] },
  'growth-matrix': { icon: TrendingUp, title: 'Growth Matrix', description: 'Track month-over-month transformation with precision.', features: ['Personal, Professional, Spiritual scores', 'Monthly trend visualizations', 'Breakthrough documentation', 'Tangible outcomes tracker'] },
  'follow-ups': { icon: RefreshCw, title: 'Follow-ups', description: 'Never let a seeker feel forgotten on their journey.', features: ['Overdue & upcoming follow-ups', 'Auto-generated reminders', 'Call, WhatsApp & email tracking', 'Follow-up templates'] },
  messages: { icon: MessageSquare, title: 'Messages', description: 'Sacred conversations that guide transformation.', features: ['Real-time chat with seekers', 'Support request management', 'Quick message templates', 'Read receipts & timestamps'] },
  resources: { icon: FolderOpen, title: 'Resource Library', description: 'Ancient wisdom meets modern learning tools.', features: ['PDFs, audio & video resources', 'Course-wise categorization', 'Multi-language support (EN/MR/HI)', 'Download & view tracking'] },
  reports: { icon: PieChart, title: 'Reports & Analytics', description: 'Data-driven insights for your coaching practice.', features: ['Seeker progress reports', 'Revenue analytics with charts', 'Attendance & consistency metrics', 'Lead conversion funnel'] },
  settings: { icon: Settings, title: 'Settings', description: 'Configure your sacred coaching space.', features: ['Coach profile management', 'Working hours & availability', 'Notification preferences', 'Financial & invoice settings'] },
  tasks: { icon: ClipboardList, title: 'My Tasks', description: 'Your assignments and action items for growth.', features: ['Pending assignments with deadlines', 'Session action items', 'Submit with reflections', 'Track completion history'] },
  growth: { icon: TrendingUp, title: 'My Growth', description: 'Witness your transformation unfold beautifully.', features: ['Overall growth score', 'Assessment trend charts', 'Achievement badges', 'Strength & growth areas'] },
  profile: { icon: User, title: 'My Profile', description: 'Your sacred identity on this journey.', features: ['Personal & professional info', 'Goals & vision statement', 'Core values selection', 'Notification preferences'] },
  journey: { icon: Compass, title: 'My Journey', description: 'A visual timeline of your sacred transformation.', features: ['Milestone timeline', 'Before vs Now comparison', 'Key breakthroughs log', 'Digital vision board'] },
  'weekly-review': { icon: Star, title: 'Weekly Review', description: 'Reflect, celebrate, and set intentions.', features: ['Week rating & top wins', 'Wheel of Life quick check', 'Goals review & planning', 'Gratitude & coach requests'] },
  payments: { icon: CreditCard, title: 'My Payments', description: 'Your investment in transformation.', features: ['Payment history & receipts', 'Upcoming due dates', 'Course fee breakdown', 'UPI payment links'] },
};

const PlaceholderPage = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const pageKey = segments[segments.length - 1] || 'page';
  const meta = PAGE_META[pageKey];
  const Icon = meta?.icon || Sparkles;
  const title = meta?.title || pageKey.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="w-full max-w-lg">
        <div className="bg-card rounded-2xl border-2 border-primary/20 shadow-lg overflow-hidden">
          {/* Gold strip */}
          <div className="h-1.5 gradient-chakravartin" />
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl gradient-sacred flex items-center justify-center mx-auto mb-5">
              <Icon className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
            <p className="text-muted-foreground italic text-sm mb-6">
              {meta?.description || 'This sacred module is being prepared for your transformation journey. Coming soon. 🙏'}
            </p>

            {meta?.features && (
              <div className="text-left space-y-2 mb-6">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Coming Features</p>
                <div className="gold-divider" />
                {meta.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            )}

            <span className="text-4xl opacity-10">ॐ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
