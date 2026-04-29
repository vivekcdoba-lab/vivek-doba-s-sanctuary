import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import PhoneInput from '@/components/inputs/PhoneInput';
import CountryStateInput from '@/components/inputs/CountryStateInput';
import { validatePhone, toE164, DEFAULT_COUNTRY_CODE } from '@/lib/phoneValidation';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const INTENT_MAX = 500;

const TellUsAboutYourself = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState(DEFAULT_COUNTRY_CODE);
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('IN');
  const [stateVal, setStateVal] = useState('');
  const [pincode, setPincode] = useState('');
  const [intent, setIntent] = useState('');
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) return toast({ title: 'Please enter your full name', variant: 'destructive' });
    if (!isValidEmail(email)) return toast({ title: 'Please enter a valid email', variant: 'destructive' });
    const phoneErr = validatePhone(phoneCode, phone);
    if (phoneErr) return toast({ title: phoneErr, variant: 'destructive' });
    if (!intent.trim()) return toast({ title: 'Please share what brings you here', variant: 'destructive' });
    if (!consent) return toast({ title: 'Please agree to be contacted by our team', variant: 'destructive' });

    const phoneE164 = toE164(phoneCode, phone);

    setLoading(true);
    try {
      // Duplicate guard against existing seeker accounts
      const { data: dup } = await supabase.rpc('check_profile_duplicate', {
        _email: email.trim(),
        _phone: phoneE164,
      });
      if (dup === 'email') {
        toast({ title: 'An account with this email already exists. Please log in instead.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      if (dup === 'phone') {
        toast({ title: 'An account with this phone number already exists. Please log in instead.', variant: 'destructive' });
        setLoading(false);
        return;
      }

      const formData = {
        city: city.trim() || null,
        country,
        state: stateVal || null,
        pincode: pincode || null,
        intent: intent.trim(),
        source: 'tell_us_about_yourself',
      };

      const { error } = await supabase.from('submissions').insert({
        form_type: 'lgt_application',
        status: 'pending',
        full_name: fullName.trim(),
        email: email.trim(),
        mobile: phone,
        country_code: phoneCode,
        form_data: formData as any,
      });
      if (error) throw error;

      // Best-effort admin notification
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'new_submission',
            form_type: 'lgt_application',
            applicant_name: fullName.trim(),
            applicant_email: email.trim(),
            applicant_mobile: `${phoneCode}${phone}`,
            form_data: formData,
          },
        });
      } catch (err) {
        console.error('Notification error:', err);
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Something went wrong. Please try again.', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border border-border">
          <div className="text-5xl mb-4">🙏</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Thank you, {fullName.split(' ')[0]}!</h1>
          <p className="text-muted-foreground mb-6">
            We've received your details. Vivek Sir's team will personally reach out within 48 hours
            to understand your goals and design the right path for you.
          </p>
          <div className="text-left text-sm text-muted-foreground space-y-1 mb-6 bg-muted rounded-xl p-4">
            <p className="font-semibold text-foreground mb-1">What happens next:</p>
            <p>1. A short call or message to learn more about you</p>
            <p>2. We'll discuss the right program and offline payment options</p>
            <p>3. Once approved, your seeker account & login details are shared with you</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          <div
            className="p-6 text-primary-foreground"
            style={{ background: 'linear-gradient(135deg, #FFD700, #7B1FA2)' }}
          >
            <div className="text-3xl mb-2">👑</div>
            <h1 className="text-2xl font-bold">Tell Us About Yourself</h1>
            <p className="text-sm opacity-90 mt-1">
              Share a few details. We'll personally reach out to design the right path for you. Takes under a minute.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value.slice(0, 100))}
                placeholder="Your full name"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.slice(0, 255))}
                placeholder="you@example.com"
                className="mt-1.5"
              />
            </div>

            <PhoneInput
              id="phone"
              countryCode={phoneCode}
              phone={phone}
              onCountryCodeChange={setPhoneCode}
              onPhoneChange={setPhone}
              label="Mobile Number"
              required
              placeholder="Mobile number"
            />

            <div>
              <Label htmlFor="city">City / Location <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value.slice(0, 80))}
                placeholder="Pune, Mumbai, Bangalore..."
                className="mt-1.5"
              />
            </div>

            <CountryStateInput
              country={country}
              state={stateVal}
              pincode={pincode}
              onCountryChange={setCountry}
              onStateChange={setStateVal}
              onPincodeChange={setPincode}
            />

            <div>
              <Label htmlFor="intent">What brings you here? <span className="text-destructive">*</span></Label>
              <Textarea
                id="intent"
                value={intent}
                onChange={(e) => setIntent(e.target.value.slice(0, INTENT_MAX))}
                placeholder="A line or two about what you're looking for — clarity, growth, business breakthrough, peace of mind..."
                rows={3}
                className="mt-1.5"
              />
              <p className={`text-[10px] text-right mt-1 ${intent.length >= INTENT_MAX ? 'text-destructive' : 'text-muted-foreground'}`}>
                {intent.length}/{INTENT_MAX}
              </p>
            </div>

            <label className="flex items-start gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 accent-primary"
              />
              <span>I agree to be contacted by the VDTS team via call, email, or WhatsApp.</span>
            </label>

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-primary-foreground"
              style={{ background: 'linear-gradient(135deg, #FFD700, #7B1FA2)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              No payment required at this stage — pricing is finalized one-on-one.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TellUsAboutYourself;
