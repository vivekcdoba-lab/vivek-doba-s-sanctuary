import { Outlet, useLocation } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import MobileContactBar from './MobileContactBar';

export default function PublicLayout() {
  const location = useLocation();
  return <div className="public-site min-h-screen bg-background flex flex-col overflow-x-hidden pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
    <PublicHeader />
    <main key={location.pathname} className="flex-1 animate-fade-up"><Outlet /></main>
    <PublicFooter />
    <MobileContactBar />
  </div>;
}