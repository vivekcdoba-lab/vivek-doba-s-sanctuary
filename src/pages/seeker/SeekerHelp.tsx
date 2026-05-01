import { useState, useMemo } from 'react';
import { Search, MessageCircle, Mail, Phone, BookOpen, FileText, BarChart3, Sparkles, Send, Bug, Lightbulb, Video, HelpCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import BackToHome from '@/components/BackToHome';

/* ── FAQ data ─────────────────────────────────────────── */
const faqCategories: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All', icon: <HelpCircle className="w-4 h-4" /> },
  { key: 'account', label: 'Account', icon: <HelpCircle className="w-4 h-4" /> },
  { key: 'worksheets', label: 'Worksheets', icon: <FileText className="w-4 h-4" /> },
  { key: 'sessions', label: 'Sessions', icon: <Video className="w-4 h-4" /> },
  { key: 'payments', label: 'Payments', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'technical', label: 'Technical', icon: <Bug className="w-4 h-4" /> },
];

const faqs: { category: string; q: string; a: string }[] = [
  { category: 'account', q: 'How do I update my profile?', a: 'Go to your Profile page from the sidebar menu. You can update your name, photo, city, and other details there.' },
  { category: 'account', q: 'Can I change my email address?', a: 'Email changes require coach assistance for security. Please contact support via WhatsApp.' },
  { category: 'account', q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page. A reset link will be sent to your registered email.' },
  { category: 'worksheets', q: 'How do I fill the Daily Dharmic Worksheet?', a: 'Navigate to the Worksheet section from your dashboard. Fill in your morning intention, gratitude entries, and priorities. In the evening, complete the reflection section. Aim for both morning and evening entries daily.' },
  { category: 'worksheets', q: 'What if I miss a day on my worksheet?', a: "Your streak counter resets, but don't worry! Consistency matters more than perfection. Jump back in the next day. Your coach will help you build sustainable habits." },
  { category: 'worksheets', q: 'Can I edit a submitted worksheet?', a: 'You can edit a worksheet until midnight of the same day. After that, it locks to preserve authenticity.' },
  { category: 'sessions', q: 'How do I book a coaching session?', a: 'Go to Upcoming Sessions from your dashboard. Your coach schedules sessions based on your enrolled program. Contact your coach for rescheduling.' },
  { category: 'sessions', q: 'What happens if I miss a session?', a: 'Missed sessions are marked in your attendance record. Please inform your coach in advance if you cannot attend. Rescheduling is possible with prior notice.' },
  { category: 'sessions', q: 'How long is each coaching session?', a: 'Standard sessions are 45–60 minutes. The duration may vary based on your program tier.' },
  { category: 'payments', q: 'What payment methods are accepted?', a: 'We accept UPI, bank transfer, and online payments. Payment details are shared upon enrollment.' },
  { category: 'payments', q: 'Where can I see my payment history?', a: 'Navigate to the Payments section from your dashboard sidebar to view all invoices and payment records.' },
  { category: 'payments', q: 'Can I get a GST invoice?', a: 'Yes! All invoices include GST details. You can download them from the Payments section.' },
  { category: 'technical', q: 'Can I access the platform on mobile?', a: 'Yes! The platform is fully responsive. You can add it to your home screen for quick access like an app.' },
  { category: 'technical', q: 'The page is not loading properly. What should I do?', a: 'Try clearing your browser cache or using incognito mode. If the issue persists, contact support with a screenshot.' },
  { category: 'technical', q: 'How is my data protected?', a: 'All data is stored securely with encryption at rest and in transit. Row-level security ensures you can only access your own data. We never share your information.' },
];

/* ── Quick guides ─────────────────────────────────────── */
const quickGuides = [
  { title: 'How to fill Daily Worksheet', description: 'Step-by-step guide for morning & evening entries', icon: <FileText className="w-5 h-5" />, route: '/seeker/worksheet' },
  { title: 'How to book a session', description: 'View upcoming sessions and connect with your coach', icon: <Video className="w-5 h-5" />, route: '/seeker/sessions/upcoming' },
  { title: 'How to track my progress', description: 'Charts, streaks, badges and growth metrics', icon: <BarChart3 className="w-5 h-5" />, route: '/seeker/progress-charts' },
  { title: 'How to use Sacred Space', description: 'Meditation, Japa counter and spiritual tools', icon: <Sparkles className="w-5 h-5" />, route: '/seeker/sacred-space' },
  { title: 'Video Tutorials', description: 'Watch guided walkthroughs of every feature', icon: <BookOpen className="w-5 h-5" />, route: '/seeker/learning/videos' },
];

export default function SeekerHelp() {
  const { profile } = useAuthStore();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [faqTab, setFaqTab] = useState('all');

  /* report issue */
  const [issueType, setIssueType] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueSubmitting, setIssueSubmitting] = useState(false);

  /* feature request */
  const [featureDesc, setFeatureDesc] = useState('');
  const [featureSubmitting, setFeatureSubmitting] = useState(false);

  const filtered = useMemo(() => {
    let list = faqs;
    if (faqTab !== 'all') list = list.filter(f => f.category === faqTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
    }
    return list;
  }, [faqTab, search]);

  const submitIssue = async () => {
    if (!issueType || !issueDesc.trim() || !profile?.id) return;
    setIssueSubmitting(true);
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        seeker_id: profile.id,
        kind: 'issue',
        category: issueType,
        description: issueDesc.trim(),
      })
      .select('id')
      .single();
    if (!error && ticket) {
      await supabase.rpc('notify_admins_of_ticket', { _ticket_id: ticket.id });
    }
    setIssueSubmitting(false);
    if (error) {
      toast({ title: '❌ Failed to submit', variant: 'destructive' });
    } else {
      toast({ title: '✅ Issue reported!', description: 'Our team has been notified and will look into it.' });
      setIssueType('');
      setIssueDesc('');
    }
  };

  const submitFeature = async () => {
    if (!featureDesc.trim() || !profile?.id) return;
    setFeatureSubmitting(true);
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        seeker_id: profile.id,
        kind: 'feature',
        description: featureDesc.trim(),
      })
      .select('id')
      .single();
    if (!error && ticket) {
      await supabase.rpc('notify_admins_of_ticket', { _ticket_id: ticket.id });
    }
    setFeatureSubmitting(false);
    if (error) {
      toast({ title: '❌ Failed to submit', variant: 'destructive' });
    } else {
      toast({ title: '✅ Suggestion received!', description: 'Thank you — your idea is now with our team.' });
      setFeatureDesc('');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <BackToHome />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground">We're here to help you on your transformation journey 🙏</p>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a href="https://wa.me/919607050111?text=Namaste!%20I%20need%20help%20with%20the%20VDTS%20platform." target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
          <div className="p-2 rounded-lg bg-accent"><MessageCircle className="w-5 h-5 text-accent-foreground" /></div>
          <div>
            <p className="font-semibold text-sm text-foreground">WhatsApp Support</p>
            <p className="text-xs text-muted-foreground">Fastest way to reach us</p>
          </div>
        </a>

        <a href="mailto:info@vivekdoba.com" className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
          <div className="p-2 rounded-lg bg-primary/10"><Mail className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="font-semibold text-sm text-foreground">Email Support</p>
            <p className="text-xs text-muted-foreground">info@vivekdoba.com</p>
          </div>
        </a>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="p-2 rounded-lg bg-secondary/10"><Phone className="w-5 h-5 text-secondary" /></div>
          <div>
            <p className="font-semibold text-sm text-foreground">Phone (Office Hours)</p>
            <p className="text-xs text-muted-foreground">Mon–Sat, 9 AM – 7 PM IST</p>
          </div>
        </div>
      </div>

      {/* Quick Guides */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-lg">📖 Quick Guides</CardTitle></CardHeader>
        <CardContent className="grid gap-2">
          {quickGuides.map(g => (
            <a key={g.title} href={g.route} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors group">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">{g.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{g.title}</p>
                <p className="text-xs text-muted-foreground truncate">{g.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>
          ))}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">❓ Frequently Asked Questions</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search FAQs…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={faqTab} onValueChange={setFaqTab}>
            <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
              {faqCategories.map(c => (
                <TabsTrigger key={c.key} value={c.key} className="text-xs gap-1">{c.icon}{c.label}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={faqTab} className="mt-0">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No matching questions found.</p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filtered.map((f, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm">{f.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Report Issue & Feature Request side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Report Issue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><Bug className="w-5 h-5 text-destructive" /> Report an Issue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={issueType} onValueChange={setIssueType}>
              <SelectTrigger><SelectValue placeholder="Select issue type" /></SelectTrigger>
              <SelectContent>
                {['Login / Account', 'Worksheet', 'Session', 'Payment', 'Display / UI Bug', 'Performance', 'Other'].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea placeholder="Describe the issue in detail…" rows={4} value={issueDesc} onChange={e => setIssueDesc(e.target.value)} />
            <p className="text-xs text-muted-foreground">💡 Tip: Include a screenshot via WhatsApp for faster resolution.</p>
            <Button onClick={submitIssue} disabled={!issueType || !issueDesc.trim() || issueSubmitting} className="w-full gap-2">
              <Send className="w-4 h-4" /> Submit Issue
            </Button>
          </CardContent>
        </Card>

        {/* Feature Request */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary" /> Suggest a Feature</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea placeholder="What would make your experience even better?" rows={4} value={featureDesc} onChange={e => setFeatureDesc(e.target.value)} />
            <p className="text-xs text-muted-foreground">Your suggestions help us build a better platform for everyone. 🙏</p>
            <Button variant="secondary" onClick={submitFeature} disabled={!featureDesc.trim() || featureSubmitting} className="w-full gap-2">
              <Send className="w-4 h-4" /> Submit Suggestion
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Live Chat placeholder */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
          <MessageCircle className="w-5 h-5" />
          <p className="text-sm">Live Chat coming soon — in the meantime, reach us on WhatsApp!</p>
        </CardContent>
      </Card>
    </div>
  );
}
