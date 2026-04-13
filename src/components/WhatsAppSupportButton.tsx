import { forwardRef } from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppSupportButton = forwardRef<HTMLAnchorElement>(function WhatsAppSupportButton(_props, ref) {
  const phone = '919876543210'; // Replace with actual VDTS WhatsApp number
  const message = encodeURIComponent('Namaste! I need help with the VDTS platform.');
  
  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg hover:bg-[#20bd5a] transition-colors print:hidden"
      aria-label="WhatsApp Support"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline text-sm font-medium">Support</span>
    </a>
  );
}
