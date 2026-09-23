import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { BookOpen, ChevronDown, GraduationCap, Image, Menu, MessageSquare, Phone, ShoppingBag, User } from 'lucide-react';
import { openWhatsApp } from '@/lib/openExternal';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { courseMenu } from '@/data/courses';
import { usePublicCourses } from '@/hooks/useDbCourses';

const tabs = [
  { to: '/about', label: 'About Us', icon: User }, { to: '/courses', label: 'Courses', icon: GraduationCap },
  { to: '/shop', label: 'Shop', icon: ShoppingBag }, { to: '/gallery', label: 'Gallery', icon: Image },
  { to: '/blog', label: 'Blog', icon: BookOpen }, { to: '/contact', label: 'Contact Us', icon: Phone },
];
const desktopTabs = tabs.filter(tab => tab.to !== '/contact');
const diagnostic = () => openWhatsApp('919607050111', 'Namaste, I would like to book a diagnostic call.');

export default function PublicHeader() {
  const { data: courses = [] } = usePublicCourses();
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const coursesRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isCoursesActive = location.pathname.startsWith('/courses') || courseMenu.some(group => group.items.some(item => item.href === location.pathname));
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 8); onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);
  useEffect(() => { const close = (event: MouseEvent) => { if (!coursesRef.current?.contains(event.target as Node)) setCoursesOpen(false); }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close); }, []);
  useEffect(() => setCoursesOpen(false), [location.pathname]);
  return <header className={`sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
    <div className="mx-auto hidden max-w-7xl xl:block">
      <div className="flex h-12 items-center justify-between border-b border-border/50 px-4">
        <Link to="/" className="text-lg font-bold text-primary">Vivek Doba Business Mastery</Link>
        <Link to="/login" className="text-sm font-bold text-foreground transition-colors hover:text-primary">Login</Link>
      </div>
      <div className="flex h-14 items-center justify-between gap-4 px-4">
        <nav aria-label="Main navigation" className="flex h-full min-w-0 items-stretch">{desktopTabs.map(({ to, label, icon: Icon }) => to === '/courses' ? <div key={to} ref={coursesRef} className="relative flex" onMouseEnter={() => setCoursesOpen(true)} onMouseLeave={() => setCoursesOpen(false)}><NavLink to={to} className={`flex items-center gap-2 px-3 py-2 text-sm ${isCoursesActive ? 'font-bold text-primary' : 'text-muted-foreground'}`}><Icon className="h-4 w-4" />{label}</NavLink><Button variant="ghost" size="icon" className="h-auto w-7" aria-label="Open Courses menu" aria-expanded={coursesOpen} onClick={() => setCoursesOpen(v => !v)}><ChevronDown className="h-4 w-4" /></Button>{coursesOpen && <div role="menu" className="fixed left-1/2 top-[6.5rem] w-[min(94vw,980px)] -translate-x-1/2 rounded-md border bg-card p-6 shadow-xl"><div className="grid grid-cols-4 gap-5">{courseMenu.map(group => <section key={group.group}><h2 className="mb-2 text-xs font-semibold text-muted-foreground">{group.group}</h2>{group.items.map(item => { const course = courses.find(entry => `/courses/${entry.slug}` === item.href); return <Link key={item.href} to={item.href} role="menuitem" className="flex gap-3 rounded-md p-2 hover:bg-primary/10">{course?.cardImageUrl && <img src={course.cardImageUrl} alt="" width="1200" height="900" loading="lazy" className="h-11 w-14 rounded object-cover" />}<span><b className="block text-sm">{course?.name || item.label}</b><small className="text-muted-foreground">{course?.duration || item.sub}</small></span></Link>; })}</section>)}</div></div>}</div> : <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 text-sm ${isActive ? 'font-bold text-primary' : 'text-muted-foreground'}`}><Icon className="h-4 w-4" />{label}</NavLink>)}</nav>
        <div className="flex shrink-0 items-center gap-2"><a href="tel:9607050111" className="flex items-center text-sm text-muted-foreground"><Phone className="mr-1 h-4 w-4" />9607050111</a><Button variant="ghost" size="sm" onClick={() => openWhatsApp()}><MessageSquare />WhatsApp</Button><Button asChild variant="ghost" size="sm"><NavLink to="/contact" className={({ isActive }) => isActive ? 'font-bold text-primary' : ''}><Phone />Contact Us</NavLink></Button><Button size="sm" onClick={diagnostic} className="bg-diagnostic text-primary-foreground hover:bg-diagnostic/90">Book a diagnostic</Button></div>
      </div>
    </div>
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 xl:hidden">
      <Link to="/" className="min-w-0 truncate text-sm font-bold text-primary sm:text-lg">Vivek Doba Business Mastery</Link>
      <div className="flex shrink-0 items-center gap-2"><Button size="sm" onClick={diagnostic} className="bg-diagnostic text-primary-foreground hover:bg-diagnostic/90">Book a diagnostic</Button><Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open menu"><Menu /></Button></SheetTrigger><SheetContent><SheetTitle>Menu</SheetTitle><nav className="mt-8 space-y-2">{tabs.map(({ to, label, icon: Icon }) => <SheetClose asChild key={to}><Link to={to} className="flex items-center gap-3 rounded-md p-3 hover:bg-muted"><Icon className="h-5 w-5 text-primary" />{label}</Link></SheetClose>)}<a href="tel:9607050111" className="flex items-center gap-3 rounded-md p-3"><Phone className="h-5 w-5 text-primary" />9607050111</a><Button variant="outline" className="w-full" onClick={() => openWhatsApp()}><MessageSquare />WhatsApp</Button><SheetClose asChild><Link to="/login" className="block p-3 text-center text-sm font-bold text-foreground">Login</Link></SheetClose></nav></SheetContent></Sheet></div>
    </div>
  </header>;
}