import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Phone, MessageSquare, Lock, ChevronRight, Instagram, Youtube, Linkedin, Facebook } from "lucide-react";

export const SeoNav = () => (
  <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md shadow-sm border-b border-border">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl">🪷</span>
        <span className="font-bold text-base sm:text-lg" style={{ color: "#B8860B", fontFamily: "Poppins, sans-serif" }}>
          Vivek Doba Training Solutions
        </span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        <a href="tel:9607050111" className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Phone className="w-4 h-4" /> 9607050111
        </a>
        <a
          href="https://wa.me/919607050111?text=Hello"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: "#25D366" }}
        >
          <MessageSquare className="w-4 h-4" /> <span className="hidden sm:inline">WhatsApp</span>
        </a>
        <Link
          to="/login"
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium border-2 transition-colors hover:opacity-90"
          style={{ borderColor: "#B8860B", color: "#B8860B" }}
        >
          <Lock className="w-4 h-4" /> Login
        </Link>
      </div>
    </div>
  </nav>
);

export const SeoFooter = () => (
  <footer className="bg-muted/50 border-t border-border py-10 mt-16">
    <div className="max-w-5xl mx-auto px-4 text-center">
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-4 text-sm">
        <Link to="/life-coaching" className="text-muted-foreground hover:text-foreground">Life Coaching</Link>
        <Link to="/business-coaching" className="text-muted-foreground hover:text-foreground">Business Coaching</Link>
        <Link to="/manifestation" className="text-muted-foreground hover:text-foreground">Manifestation</Link>
        <Link to="/meditation" className="text-muted-foreground hover:text-foreground">Meditation</Link>
        <Link to="/dharma-philosophy" className="text-muted-foreground hover:text-foreground">Dharma Philosophy</Link>
      </div>
      <p className="font-semibold text-foreground mb-1">Vivek Doba Training Solutions | Pune, Maharashtra</p>
      <p className="text-sm text-muted-foreground mb-4">📞 9607050111 | 📧 info@vivekdoba.com | 🌐 vivekdoba.com</p>
      <div className="flex justify-center gap-3 mb-4">
        {[
          { name: "Instagram", url: "https://www.instagram.com/coachvivekdoba/", icon: Instagram, hoverColor: "#E4405F" },
          { name: "YouTube", url: "https://www.youtube.com/@coachvivekdoba", icon: Youtube, hoverColor: "#FF0000" },
          { name: "LinkedIn", url: "https://www.linkedin.com/in/coachvivekdoba/", icon: Linkedin, hoverColor: "#0A66C2" },
          { name: "Facebook", url: "https://www.facebook.com/coachvivekdoba", icon: Facebook, hoverColor: "#1877F2" },
        ].map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            title={s.name}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-white transition-all duration-200 hover:scale-110"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = s.hoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
          >
            <s.icon className="w-5 h-5" />
          </a>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Made with 🙏 for seekers of transformation</p>
    </div>
  </footer>
);

export const SeoHero = ({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) => (
  <section
    className="relative overflow-hidden py-14 sm:py-20 text-center"
    style={{ background: "linear-gradient(135deg, #B8860B 0%, #FF9933 50%, #E91E63 100%)" }}
  >
    <div className="relative z-10 max-w-4xl mx-auto px-4">
      <p className="text-white/80 uppercase tracking-widest text-xs sm:text-sm mb-3">{eyebrow}</p>
      <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
        {title}
      </h1>
      <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">{subtitle}</p>
    </div>
  </section>
);

export const SeoCTA = () => (
  <section className="max-w-5xl mx-auto px-4 py-12">
    <div className="grid sm:grid-cols-3 gap-4">
      <Link
        to="/book-appointment"
        className="flex items-center justify-center gap-2 py-4 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #2196F3, #00BCD4)" }}
      >
        Book Free Discovery Call <ChevronRight className="w-4 h-4" />
      </Link>
      <Link
        to="/register-workshop"
        className="flex items-center justify-center gap-2 py-4 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #FF9933, #FFD700)" }}
      >
        Join a Workshop <ChevronRight className="w-4 h-4" />
      </Link>
      <Link
        to="/apply-lgt"
        className="flex items-center justify-center gap-2 py-4 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #FFD700, #7B1FA2)" }}
      >
        Apply for LGT Program <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  </section>
);

export const SeoPage = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background">
    <SeoNav />
    {children}
    <SeoFooter />
  </div>
);
