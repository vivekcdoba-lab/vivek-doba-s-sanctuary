import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const { toast } = useToast();

  const handleLogin = (role: 'admin' | 'seeker') => {
    if (!email || !password) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    login(email, role);
    toast({ title: `Welcome${role === 'admin' ? ', Vivek Sir' : ''}! 🙏` });
    navigate(role === 'admin' ? '/dashboard' : '/seeker/home');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Hero Section */}
      <div className="lg:w-[55%] gradient-hero relative flex items-center justify-center p-8 lg:p-16 min-h-[30vh] lg:min-h-screen">
        <LotusPattern />
        <div className="relative z-10 text-center">
          {/* VD Monogram */}
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

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleLogin('admin')}
              className="w-full py-3 rounded-xl font-semibold text-primary-foreground gradient-chakravartin hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              🟡 Enter as Coach / Admin
            </button>
            <button
              onClick={() => handleLogin('seeker')}
              className="w-full py-3 rounded-xl font-semibold text-primary-foreground gradient-maroon hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              🙏 Enter as Seeker (साधक)
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link to="/register" className="text-sm text-primary hover:underline font-medium">
              New here? Begin Your Journey →
            </Link>
            <br />
            <button className="text-xs text-muted-foreground hover:text-foreground">
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
