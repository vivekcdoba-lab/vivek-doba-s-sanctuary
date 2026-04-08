import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BackToHome from '@/components/BackToHome';

const faqs = [
  { q: 'What is the LGT Framework?', a: "Life's Golden Triangle (LGT) is VDTS's proprietary coaching framework built on the four Purusharthas — Dharma (Purpose), Artha (Prosperity), Kama (Fulfillment), and Moksha (Liberation). It provides a holistic approach to transformation." },
  { q: 'How long is the coaching program?', a: 'Our flagship LGT Platinum program is a 180-day (6-month) structured transformation journey. We also offer shorter programs and workshops.' },
  { q: 'How do I fill the Daily Dharmic Worksheet?', a: 'Navigate to the Worksheet section from your dashboard. Fill in your morning intention, gratitude entries, and priorities. In the evening, complete the reflection section. Aim to submit both morning and evening entries daily.' },
  { q: 'How are assessments used?', a: 'Assessments like the Wheel of Life and LGT Dimension Assessment provide a baseline of your current state. They are retaken periodically to measure your growth and guide your coaching sessions.' },
  { q: 'What happens if I miss a day on my worksheet?', a: "Your streak counter resets, but don't worry! Consistency matters more than perfection. Jump back in the next day. Your coach will help you build sustainable habits." },
  { q: 'How do I contact my coach?', a: 'Use the Messages section in your dashboard to send a message directly to your coach. For urgent matters, use the WhatsApp support button.' },
  { q: 'Can I access the platform on mobile?', a: 'Yes! The platform is fully responsive and works on all devices. You can add it to your home screen for quick access.' },
  { q: 'How is my data protected?', a: 'All data is stored securely with encryption at rest and in transit. Row-level security ensures you can only access your own data. We never share your information with third parties.' },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <BackToHome />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Help Center</h1>
        <p className="text-muted-foreground">Frequently asked questions and support</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Need More Help?</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>📧 Email: <a href="mailto:support@vdts.in" className="text-primary underline">support@vdts.in</a></p>
          <p>📱 WhatsApp: Use the green support button at the bottom-right of any page</p>
          <p>🕐 Support hours: Monday–Saturday, 9 AM – 7 PM IST</p>
        </CardContent>
      </Card>
    </div>
  );
}
