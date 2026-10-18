import { Link } from 'react-router-dom';
import { CalendarDays, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BOOKING_PATH, PUBLIC_CALL_URL, PUBLIC_WHATSAPP_URL } from '@/lib/publicConversion';

export default function MobileContactBar() {
  return <nav aria-label="Quick contact" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 gap-1 border-t border-border bg-background px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg md:hidden print:hidden">
    <Button asChild variant="outline" className="px-2"><a href={PUBLIC_CALL_URL}><Phone />Call</a></Button>
    <Button asChild variant="outline" className="px-2"><a href={PUBLIC_WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a></Button>
    <Button asChild className="h-auto min-h-12 whitespace-normal px-2"><Link to={BOOKING_PATH}><CalendarDays />Book diagnostic</Link></Button>
  </nav>;
}