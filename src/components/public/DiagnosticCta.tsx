import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DIAGNOSTIC_LABEL, DIAGNOSTIC_MESSAGE, DIAGNOSTIC_NOTE } from '@/data/framework';
import { WHATSAPP_NUMBER } from '@/data/courses';
import { openExternal } from '@/lib/openExternal';
import { Link } from 'react-router-dom';

export const DIAGNOSTIC_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DIAGNOSTIC_MESSAGE)}`;

type DiagnosticCtaProps = {
  className?: string;
  noteClassName?: string;
  compact?: boolean;
  to?: string;
};

export default function DiagnosticCta({ className = '', noteClassName = '', compact = false, to }: DiagnosticCtaProps) {
  return <div className={compact ? 'max-w-sm' : 'max-w-md'}>
    {to ? <Button asChild className={`h-auto min-h-12 whitespace-normal ${className}`}><Link to={to}>{DIAGNOSTIC_LABEL}<MessageCircle /></Link></Button> : <Button className={`h-auto min-h-12 whitespace-normal ${className}`} onClick={() => openExternal(DIAGNOSTIC_URL)}>
      {DIAGNOSTIC_LABEL}<MessageCircle />
    </Button>}
    <p className={`mt-2 text-xs leading-5 text-muted-foreground ${noteClassName}`}>{DIAGNOSTIC_NOTE}</p>
  </div>;
}