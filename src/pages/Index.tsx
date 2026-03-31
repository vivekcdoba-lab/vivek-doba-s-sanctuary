import { Link } from 'react-router-dom';
import { Phone, MessageSquare, Lock, ChevronRight, Instagram, Youtube, Linkedin, Facebook } from 'lucide-react';
import vivekDobaPhoto from '@/assets/vivek-doba.png';

const stats = [
  { value: '80,000+', label: 'Lives Transformed' },
  { value: '35,000+', label: 'Inspiring Stories' },
  { value: '20+', label: 'Years Experience' },
];

const Index = () => (
  <div className="min-h-screen bg-background">
    {/* Navbar */}
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🪷</span>
          <span className="font-bold text-lg" style={{ color: '#B8860B', fontFamily: 'Poppins, sans-serif' }}>
            Vivek Doba Training Solutions
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="tel:9607050111" className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="w-4 h-4" /> 9607050111
          </a>
          <a
            href="https://wa.me/919607050111"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: '#25D366' }}
          >
            <MessageSquare className="w-4 h-4" /> <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium border-2 transition-colors hover:opacity-90"
            style={{ borderColor: '#B8860B', color: '#B8860B' }}
          >
            <Lock className="w-4 h-4" /> Login
          </Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section
      className="relative overflow-hidden py-16 sm:py-24 text-center"
      style={{ background: 'linear-gradient(135deg, #B8860B 0%, #FF9933 50%, #E91E63 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.06] text-[200px] leading-none flex flex-wrap justify-center items-center pointer-events-none select-none overflow-hidden">
        {'🪷 🕉️ 🪷 🕉️ 🪷 🕉️ 🪷 🕉️ 🪷 🕉️ '.repeat(3)}
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-full overflow-hidden mb-6 border-4 border-white/30 shadow-xl">
          <img src={vivekDobaPhoto} alt="Coach Vivek Doba" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Vivek Doba
        </h1>
        <p className="text-lg sm:text-xl text-white/80 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Spiritual Business Coach | Founder of Life's Golden Triangle
        </p>
        <p className="text-base text-white/70 italic mb-10">
          Transform Your Life Through Ancient Wisdom &amp; Modern Leadership
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-4 min-w-[160px]">
              <p className="text-2xl sm:text-3xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* 3 Registration Cards */}
    <section className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-3">Begin Your Transformation</h2>
      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">Choose how you'd like to start your journey with Vivek Doba</p>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {/* Card 1 */}
        <div className="group bg-card rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all overflow-hidden border border-border">
          <div className="h-2" style={{ background: 'linear-gradient(135deg, #2196F3, #00BCD4)' }} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📞</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-emerald-500">FREE</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Book a 45-Minute Discovery Call</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Not sure which program is right for you? Book a personal discovery call with Vivek Sir. Understand your goals, explore possibilities, and get clarity on your transformation path.
            </p>
            <Link
              to="/book-appointment"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #2196F3, #00BCD4)' }}
            >
              Book My Call <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group bg-card rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all overflow-hidden border border-border">
          <div className="h-2" style={{ background: 'linear-gradient(135deg, #FF9933, #FFD700)' }} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🎯</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#FFF3CD', color: '#B8860B' }}>Starting ₹5,000</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Register for a One-Day Workshop</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Experience the power of transformation in a single day. Choose from 'Laws of Attraction through Ramayana', 'Team Building', or 'Leadership through Mahabharata'.
            </p>
            <Link
              to="/register-workshop"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #FF9933, #FFD700)' }}
            >
              Register Now <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Card 3 */}
        <div className="group bg-card rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all overflow-hidden border border-border relative">
          <div className="h-2 shimmer-gold" style={{ background: 'linear-gradient(135deg, #FFD700, #7B1FA2)' }} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">👑</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#FFF3CD', color: '#B8860B' }}>6-12 Month Transformation</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Apply for Life's Golden Triangle — Premier Program</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              The flagship coaching program for serious business owners and leaders. Personal Mastery × Professional Excellence × Spiritual Wellbeing. A life-changing 180-day journey.
            </p>
            <Link
              to="/apply-lgt"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #FFD700, #7B1FA2)' }}
            >
              Apply Now <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-muted/50 border-t border-border py-10">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="font-semibold text-foreground mb-1">Vivek Doba Training Solutions | Pune, Maharashtra</p>
        <p className="text-sm text-muted-foreground mb-4">📞 9607050111 | 📧 info@vivekdoba.in | 🌐 vivekdoba.in</p>
        <div className="flex justify-center gap-3 mb-4">
          {[
            { name: 'Instagram', url: 'https://www.instagram.com/coachvivekdoba/', icon: Instagram, hoverColor: '#E4405F' },
            { name: 'YouTube', url: 'https://www.youtube.com/@coachvivekdoba', icon: Youtube, hoverColor: '#FF0000' },
            { name: 'LinkedIn', url: 'https://www.linkedin.com/in/coachvivekdoba/', icon: Linkedin, hoverColor: '#0A66C2' },
            { name: 'Facebook', url: 'https://www.facebook.com/coachvivekdoba', icon: Facebook, hoverColor: '#1877F2' },
          ].map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              title={s.name}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-white transition-all duration-200 hover:scale-110"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = s.hoverColor)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              <s.icon className="w-5 h-5" />
            </a>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Made with 🙏 for seekers of transformation</p>
      </div>
    </footer>
  </div>
);

export default Index;
