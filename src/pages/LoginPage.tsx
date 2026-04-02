import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Eye, EyeOff, Mail, Lock, Sparkles, Loader2, Shield, Users, UserCheck, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type LoginRole = 'seeker' | 'coach' | 'admin';

const roleTabs: { role: LoginRole; label: string; icon: React.ReactNode; color: string; gradient: string }[] = [
  { role: 'seeker', label: 'Seeker', icon: <Users className="w-4 h-4" />, color: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-500' },
  { role: 'coach', label: 'Coach', icon: <UserCheck className="w-4 h-4" />, color: 'text-amber-600', gradient: 'from-amber-500 to-orange-500' },
  { role: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" />, color: 'text-purple-600', gradient: 'from-purple-500 to-indigo-500' },
];

const LotusPattern = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="absolute lotus-float text-primary-foreground/10" style={{
        left: `${15 + i * 15}%`,
        animationDelay: `${i * 2.5}s`,
        fontSize: '2rem',
      }}>
        ✿
      </div>
    ))}
  </div>
);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<LoginRole>('seeker');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.user) {
        // Fetch profile to determine role
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, user_id, email, full_name, role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        const role = profile?.role || 'seeker';

        // Update auth store
        setAuth(data.user, profile as any);

        toast.success(`Welcome! 🙏`);

        // Route based on actual role from database
        if (role === 'admin') {
          navigate('/dashboard');
        } else if (role === 'coach') {
          navigate('/coaching');
        } else {
          navigate('/seeker/home');
        }
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const activeTab = roleTabs.find(t => t.role === selectedRole)!;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Hero Section */}
      <div className="lg:w-[55%] gradient-hero relative flex items-center justify-center p-8 lg:p-16 min-h-[30vh] lg:min-h-screen">
        <LotusPattern />
        <div className="relative z-10 text-center">
          <div className="mx-auto w-28 h-28 lg:w-36 lg:h-36 rounded-full flex items-center justify-center mb-8 mandala-border">
            <div className="w-full h-full rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-4xl lg:text-5xl font-bold text-primary-foreground tracking-wider">VD</span>
            </div>
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-primary-foreground mb-3">
            Vivek Doba Training Solutions
          </h1>
          <p className="text-lg lg:text-xl text-primary-foreground/80 italic mb-2">
            Transform Your Life Through Ancient Wisdom
          </p>
          <p className="text-sm lg:text-base text-primary-foreground/60">
            Spiritual Business Coach | Founder of Life's Golden Triangle
          </p>
          <div className="mt-8 hidden lg:block">
            <span className="text-6xl text-primary-foreground/10">ॐ</span>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="lg:w-[45%] flex items-center justify-center p-6 lg:p-16 bg-background">
        <div className="w-full max-w-md glass-card p-8 lg:p-10 space-y-6 animate-fade-up">
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground text-sm mt-1">Begin your sacred session</p>
          </div>

          {/* Role Tabs */}
          <div className="flex rounded-xl border border-border overflow-hidden">
            {roleTabs.map((tab) => (
              <button
                key={tab.role}
                onClick={() => setSelectedRole(tab.role)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  selectedRole === tab.role
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-inner`
                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" placeholder={`${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} email address`} value={email}
                onChange={(e) => setEmail(e.target.value)} className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button onClick={handleLogin} disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${activeTab.gradient} hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50`}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🙏'} Sign In as {activeTab.label}
          </button>

          <div className="text-center space-y-2">
            <button className="text-xs text-muted-foreground hover:text-foreground">Forgot Password?</button>
            <p className="text-sm text-muted-foreground">
              New seeker? <Link to="/register" className="text-primary hover:underline font-medium">Create Account →</Link>
            </p>
          </div>

          {/* WhatsApp + Journey */}
          <div className="pt-4 border-t border-border space-y-3">
            <a
              href="https://wa.me/919607050111"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageSquare className="w-4 h-4" /> Chat on WhatsApp — 9607050111
            </a>

            <p className="text-center text-sm font-semibold text-foreground">Begin Your Journey</p>
            <div className="space-y-2">
              <Link to="/book-appointment" className="flex items-center justify-between w-full p-3 rounded-xl border border-border hover:border-primary/40 hover:shadow-md transition-all group bg-card">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📞</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">Book a Discovery Call</p>
                    <p className="text-xs text-muted-foreground">Free 45-min call with Vivek Sir</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
              <Link to="/register-workshop" className="flex items-center justify-between w-full p-3 rounded-xl border border-border hover:border-primary/40 hover:shadow-md transition-all group bg-card">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎯</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">Register for Workshop</p>
                    <p className="text-xs text-muted-foreground">One-day transformation · From ₹5,000</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
              <Link to="/apply-lgt" className="flex items-center justify-between w-full p-3 rounded-xl border border-border hover:border-primary/40 hover:shadow-md transition-all group bg-card">
                <div className="flex items-center gap-3">
                  <span className="text-xl">👑</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">Apply for LGT Program</p>
                    <p className="text-xs text-muted-foreground">6-12 month premier transformation</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </div>
            <Link to="/" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
