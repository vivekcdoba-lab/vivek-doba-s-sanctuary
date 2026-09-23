import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { BookOpen, ChevronDown, GraduationCap, Image, Lock, MessageSquare, Phone, ShoppingBag, User } from 'lucide-react';
import { openWhatsApp } from '@/lib/openExternal';
import { Button } from '@/components/ui/button';

const courseMenu = [
  { group: 'Start here', items: [
    { label: 'Know Your Triangle', sub: '2 hours · Free', href: '/know-your-triangle' },
    { label: 'Golden Triangle Score', sub: '3 minutes · Online', href: '/score' },
    { label: 'Book + Workbook', sub: '₹999', href: '/book' },
  ] },
  { group: 'Two-day programs', items: [
    { label: 'LOA through Ramayana', sub: 'Mind and resolve', href: '/loa' },
    { label: 'Sales Sanjivani', sub: 'Team sales', href: '/sales-sanjivani' },
  ] },
  { group: 'Deep work', items: [
    { label: 'Udyog Sanjivani', sub: '90 days · 10 people', href: '/udyog-sanjivani' },
    { label: 'Life’s Golden Triangle', sub: '6 months · 1:1', href: '/lgt' },
    { label: '(Train the Trainer) LGT Practitioner', sub: 'Graduates only', href: '/practitioner' },
  ] },
  { group: 'For organisations', items: [
    { label: 'Leadership the Srikrishna Way', sub: 'Corporate · 1 day', href: '/leadership' },
  ] },
];

const tabs = [
  { to: '/about', label: 'About Us', icon: User },
  { to: '/courses', label: 'Courses', icon: GraduationCap },
  { to: '/shop', label: 'Shop', icon: ShoppingBag },
  { to: '/gallery', label: 'Gallery', icon: Image },
  { to: '/blog', label: 'Blog', icon: BookOpen },
  { to: '/contact', label: 'Contact Us', icon: Phone },
];

export default function PublicHeader() {
  const [coursesOpen, setCoursesOpen] = useState(false);
  const coursesRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isCoursesActive = location.pathname === '/courses' || courseMenu.some(group => group.items.some(item => item.href === location.pathname));

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!coursesRef.current?.contains(event.target as Node)) setCoursesOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCoursesOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => setCoursesOpen(false), [location.pathname]);

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
            {tabs.map(({ to, label, icon: Icon }) => to === '/courses' ? (
              <div key={to} ref={coursesRef} className={`relative flex items-stretch transition-colors ${isCoursesActive ? 'bg-primary/10' : 'hover:bg-primary/5'}`} onMouseEnter={() => window.matchMedia('(min-width: 768px)').matches && setCoursesOpen(true)} onMouseLeave={() => window.matchMedia('(min-width: 768px)').matches && setCoursesOpen(false)}>
                <NavLink to="/courses" onClick={() => setCoursesOpen(false)} className={`relative flex items-center justify-center gap-2 py-3 pl-4 pr-2 lg:pl-7 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:text-primary ${isCoursesActive ? 'font-bold text-primary after:absolute after:bottom-0 after:left-3 after:right-0 after:h-0.5 after:gradient-saffron' : 'font-semibold text-primary'}`}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full gradient-saffron text-primary-foreground"><Icon className="w-3.5 h-3.5" /></span>{label}
                </NavLink>
                <Button variant="ghost" size="icon" aria-label="Open Courses menu" aria-expanded={coursesOpen} aria-haspopup="menu" onClick={() => setCoursesOpen(open => !open)} className={`relative h-auto w-8 rounded-none px-0 text-primary hover:bg-primary/10 hover:text-primary ${isCoursesActive ? 'after:absolute after:bottom-0 after:left-0 after:right-3 after:h-0.5 after:gradient-saffron' : ''}`}>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${coursesOpen ? 'rotate-180' : ''}`} />
                </Button>
                {coursesOpen && <div role="menu" className="fixed left-3 right-3 top-[113px] md:left-1/2 md:right-auto md:w-[min(94vw,980px)] md:-translate-x-1/2 bg-card border border-primary/20 shadow-xl rounded-md overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-5 p-4 md:p-6 max-h-[65vh] overflow-y-auto">
                    {courseMenu.map(group => <section key={group.group} className="border-b border-border py-3 first:pt-0 last:border-0 md:border-0 md:py-0">
                      <h2 className="mb-2 text-xs font-semibold text-muted-foreground">{group.group}</h2>
                      <div className="space-y-1">{group.items.map(item => <Link role="menuitem" key={item.href} to={item.href} onClick={() => setCoursesOpen(false)} className="block rounded-md px-2 py-2 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <span className="block text-sm font-semibold text-foreground">{item.label}</span><span className="block text-xs leading-5 text-muted-foreground">{item.sub}</span>
                      </Link>)}</div>
                    </section>)}
                  </div>
                  <Link role="menuitem" to="/courses" onClick={() => setCoursesOpen(false)} className="block border-t border-primary/20 bg-primary/5 px-5 py-3 text-center text-sm font-bold text-primary hover:bg-primary/10">See the full ladder</Link>
                </div>}
              </div>
            ) : (
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