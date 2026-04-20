import { MessageCircle } from 'lucide-react';
import { openWhatsApp, WHATSAPP_SUPPORT_MESSAGE } from '@/lib/openExternal';

export default function WhatsAppSupportButton() {
  const phone = '919607050111';
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(WHATSAPP_SUPPORT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.preventDefault();
        openWhatsApp(phone);
      }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg hover:bg-[#20bd5a] transition-colors print:hidden"
      aria-label="WhatsApp Support"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline text-sm font-medium">Support</span>
    </a>
  );
}
