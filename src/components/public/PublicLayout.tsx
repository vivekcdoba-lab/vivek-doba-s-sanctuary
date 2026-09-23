import { Outlet, useLocation } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

export default function PublicLayout() {
  const location = useLocation();
  return <div className="min-h-screen bg-background flex flex-col">
    <PublicHeader />
    <main key={location.pathname} className="flex-1 animate-fade-up"><Outlet /></main>
    <PublicFooter />
  </div>;
}