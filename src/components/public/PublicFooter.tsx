import { Facebook, Instagram, Linkedin, MapPin, MessageSquare, Phone, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { allCourses } from '@/data/courses';
import { BUSINESS_ADDRESS, BUSINESS_EMAIL, BUSINESS_HOURS, BUSINESS_NAME, BUSINESS_PHONE } from './PublicSeo';

const socials = [{ name: 'YouTube', url: 'https://www.youtube.com/@VIVEKDOBA', icon: Youtube }, { name: 'Instagram', url: 'https://www.instagram.com/vivekdoba/', icon: Instagram }, { name: 'Facebook', url: 'https://www.facebook.com/askVivekDoba/', icon: Facebook }, { name: 'LinkedIn', url: 'https://www.linkedin.com/in/vivekdoba/', icon: Linkedin }];
const explore = [['About Us','/about'],['Shop','/shop'],['Gallery','/gallery'],['Blog','/blog'],['Testimonials','/testimonials'],['Contact Us','/contact'],['Golden Triangle Score','/score']];
const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS_ADDRESS)}`;

export default function PublicFooter() {
  return <footer className="bg-footer-background text-footer-foreground">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
      <section><Link to="/" className="font-bold">Vivek Doba Business Mastery</Link><p className="mt-4 font-semibold">Success is a Triangle. Complete it.</p><p className="mt-2 text-sm">Ghar bhi jeeto. Bazaar bhi.</p><div className="mt-5 flex gap-2">{socials.map(({ name,url,icon:Icon }) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name} className="rounded-full border border-footer-foreground/30 p-2 transition-colors hover:bg-footer-foreground/10"><Icon className="h-5 w-5" /></a>)}</div></section>
      <section><h2 className="font-bold">Programs</h2><ul className="mt-4 space-y-2 text-sm">{allCourses.map(course => <li key={course.slug}><Link to={`/courses/${course.slug}`} className="hover:underline">{course.name}</Link></li>)}</ul></section>
      <section><h2 className="font-bold">Explore</h2><ul className="mt-4 space-y-2 text-sm">{explore.map(([label,to]) => <li key={to}><Link to={to} className="hover:underline">{label}</Link></li>)}</ul></section>
      <section><h2 className="font-bold">Visit us</h2><div className="mt-4 space-y-3 text-sm"><p className="font-semibold">{BUSINESS_NAME}</p><p className="flex gap-2"><MapPin className="h-5 w-5 shrink-0" />{BUSINESS_ADDRESS}</p><a className="flex gap-2" href={`tel:${BUSINESS_PHONE}`}><Phone className="h-5 w-5 shrink-0" />{BUSINESS_PHONE}</a><a className="flex gap-2" href={`https://wa.me/91${BUSINESS_PHONE}`} target="_blank" rel="noopener noreferrer"><MessageSquare className="h-5 w-5 shrink-0" />WhatsApp</a><a className="block hover:underline" href={`mailto:${BUSINESS_EMAIL}`}>{BUSINESS_EMAIL}</a>{BUSINESS_HOURS && <p>{BUSINESS_HOURS}</p>}<a className="font-semibold underline" href={directionsUrl} target="_blank" rel="noopener noreferrer">Get directions</a></div></section>
    </div>
    <div className="border-t border-footer-foreground/20"><div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-3 gap-y-2 px-4 py-5 text-xs"><span>© 2026 Vivek Doba Business Mastery</span><span>·</span><Link to="/privacy">Privacy Policy</Link><span>·</span><Link to="/terms">Terms</Link><span>·</span><Link to="/refund-policy">Refund Policy</Link></div></div>
  </footer>;
}