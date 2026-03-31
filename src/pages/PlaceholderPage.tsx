import { Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const PlaceholderPage = () => {
  const location = useLocation();
  const pageName = location.pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Page';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-2xl gradient-sacred flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-primary-foreground" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">{pageName}</h1>
      <p className="text-muted-foreground max-w-md">
        This page is being crafted with care. The {pageName.toLowerCase()} feature will be available soon. 🙏
      </p>
      <span className="mt-6 text-4xl opacity-20">ॐ</span>
    </div>
  );
};

export default PlaceholderPage;
