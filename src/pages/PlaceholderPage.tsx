import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const PlaceholderPage = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const pageKey = segments[segments.length - 1] || 'page';
  const title = pageKey.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="w-full max-w-lg">
        <div className="bg-card rounded-2xl border-2 border-primary/20 shadow-lg overflow-hidden">
          <div className="h-1.5 gradient-chakravartin" />
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl gradient-sacred flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
            <p className="text-muted-foreground italic text-sm mb-6">
              This sacred module is being prepared for your transformation journey. Coming soon. 🙏
            </p>
            <span className="text-4xl opacity-10">ॐ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
