import { NavLink, Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Image, Lock, MessageSquare, Phone, ShoppingBag, User } from 'lucide-react';
import { openWhatsApp } from '@/lib/openExternal';

const tabs = [
  { to: '/about', label: 'About Us', icon: User },
  { to: '/courses', label: 'Courses', icon: GraduationCap },
  { to: '/shop', label: 'Shop', icon: ShoppingBag },
  { to: '/gallery', label: 'Gallery', icon: Image },
  { to: '/blog', label: 'Blog', icon: BookOpen },
  { to: '/contact', label: 'Contact Us', icon: Phone },
];

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <span className="text-2xl" aria-hidden="true">🪷</span>
            <span className="font-bold text-base sm:text-lg text-primary truncate">Vivek Doba Business Mastery</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a href="tel:9607050111" className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Phone className="w-4 h-4" /> 9607050111
            </a>
            <a href="https://wa.me/919607050111" target="_blank" rel="noopener noreferrer" onClick={(event) => { event.preventDefault(); openWhatsApp(); }} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium bg-[hsl(var(--dharma-green))] text-primary-foreground hover:opacity-90 transition-opacity">
              <MessageSquare className="w-4 h-4" /><span className="hidden sm:inline">WhatsApp</span>
            </a>
            <Link to="/login" className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium border-2 border-primary text-primary hover:bg-primary/10 transition-colors">
              <Lock className="w-4 h-4" /> Login
            </Link>
          </div>
        </div>
      </div>
      <nav aria-label="Main navigation" className="bg-background/95 backdrop-blur-md border-b border-primary/20 shadow-sm">
        <div className="max-w-5xl mx-auto overflow-x-auto scrollbar-none px-3">
          <div className="flex min-w-max sm:min-w-0 sm:justify-center sm:divide-x sm:divide-primary/10">
            {tabs.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `relative flex items-center justify-center gap-2 px-4 lg:px-7 py-3 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:text-primary ${isActive ? 'font-bold text-primary after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:gradient-saffron' : 'font-medium text-muted-foreground'}`}>
                <Icon className="w-4 h-4" />{label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}