import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DIAGNOSTIC_LABEL, DIAGNOSTIC_MESSAGE, DIAGNOSTIC_NOTE } from '@/data/framework';
import { WHATSAPP_NUMBER } from '@/data/courses';
import { openExternal } from '@/lib/openExternal';

export const DIAGNOSTIC_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DIAGNOSTIC_MESSAGE)}`;

type DiagnosticCtaProps = {
  className?: string;
  noteClassName?: string;
  compact?: boolean;
};

export default function DiagnosticCta({ className = '', noteClassName = '', compact = false }: DiagnosticCtaProps) {
  return <div className={compact ? 'max-w-sm' : 'max-w-md'}>
    <Button className={className} onClick={() => openExternal(DIAGNOSTIC_URL)}>
      {DIAGNOSTIC_LABEL}<MessageCircle />
    </Button>
    <p className={`mt-2 text-xs leading-5 text-muted-foreground ${noteClassName}`}>{DIAGNOSTIC_NOTE}</p>
  </div>;
}