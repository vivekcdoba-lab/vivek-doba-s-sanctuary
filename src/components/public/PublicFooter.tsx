import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

const socials = [
  { name: 'Instagram', url: 'https://www.instagram.com/vivekdoba/', icon: Instagram },
  { name: 'YouTube', url: 'https://www.youtube.com/@VIVEKDOBA', icon: Youtube },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/vivek-doba-life-nlp-success-business-coach/', icon: Linkedin },
  { name: 'Facebook', url: 'https://www.facebook.com/askVivekDoba', icon: Facebook },
];

export default function PublicFooter() {
  return <footer className="bg-muted/50 border-t border-border py-10">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <p className="font-semibold text-foreground mb-1">Vivek Doba Business Mastery | Pune, Maharashtra</p>
      <p className="text-sm text-muted-foreground mb-2">Office No. 228 &amp; 229, Tower B, Second Floor, Gera Imperium Gateway, Near Nashik Phata Metro Station, Nashik Phata, Pune 411034</p>
      <p className="text-sm text-muted-foreground mb-4">9607050111 | info@vivekdoba.com | vivekdoba.com</p>
      <div className="flex justify-center gap-3 mb-4">
        {socials.map(({ name, url, icon: Icon }) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all hover:-translate-y-0.5"><Icon className="w-5 h-5" /></a>)}
      </div>
      <p className="text-xs text-muted-foreground">Made with reverence for seekers of transformation</p>
    </div>
  </footer>;
}