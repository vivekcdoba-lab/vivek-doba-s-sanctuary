import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ApplyLGT from './ApplyLGT';
import LgtReport from '@/components/lgt/LgtReport';
import { captureAndEmailLgtReport } from '@/lib/lgtReportEmail';

interface TokenResult {
  valid: boolean;
  reason?: string;
  application_id?: string;
  seeker_id?: string;
  form_data?: Record<string, any>;
  profile?: {
    full_name?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
    dob?: string;
    company?: string;
    occupation?: string;
  };
}

const REASON_MESSAGES: Record<string, { title: string; body: string }> = {
  invalid_token: { title: 'Invalid link', body: 'This invitation link is not valid.' },
  not_found: { title: 'Link not found', body: 'We couldn\'t find this invitation. It may have been revoked.' },
  expired: { title: 'Link expired', body: 'This invitation link has expired (valid for 14 days). Please request a new one from your coach.' },
  already_submitted: { title: 'Already submitted', body: 'You have already completed this application. Thank you! 🙏' },
};

const SeekerLgtForm = () => {
  const { token } = useParams<{ token: string }>();
  const [result, setResult] = useState<TokenResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase.rpc('get_lgt_application_by_token', { _token: token });
      if (error) {
        setResult({ valid: false, reason: 'invalid_token' });
      } else {
        setResult((data as unknown as TokenResult) || { valid: false, reason: 'invalid_token' });
      }
      setLoading(false);
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result?.valid) {
    const info = REASON_MESSAGES[result?.reason || 'invalid_token'] || REASON_MESSAGES.invalid_token;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card border border-border rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">{info.title}</h1>
          <p className="text-sm text-muted-foreground mb-6">{info.body}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link to="/" className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted">
              ← Back to Home
            </Link>
            <a
              href="https://wa.me/919607050111?text=Hi%2C%20my%20LGT%20application%20link%20isn%27t%20working."
              target="_blank"
              rel="noopener noreferrer me"
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ backgroundColor: '#25D366' }}
            >
              💬 Get help
            </a>
          </div>
        </div>
      </div>
    );
  }

  const p = result.profile || {};
  const initial: Record<string, any> = {
    ...(result.form_data || {}),
    fullName: (result.form_data as any)?.fullName || p.full_name || '',
    email: (result.form_data as any)?.email || p.email || '',
    mobile: (result.form_data as any)?.mobile || (p.phone || '').replace(/^\+\d+/, ''),
    mobileCode: (result.form_data as any)?.mobileCode || '+91',
    city: (result.form_data as any)?.city || p.city || '',
    state: (result.form_data as any)?.state || p.state || '',
    country: (result.form_data as any)?.country || p.country || 'India',
    dob: (result.form_data as any)?.dob || p.dob || '',
    company: (result.form_data as any)?.company || p.company || '',
    designation: (result.form_data as any)?.designation || p.occupation || '',
  };

  const [reportData, setReportData] = useState<Record<string, any> | null>(null);
  const sentRef = useRef(false);

  return (
    <div>
      <div
        className="px-4 py-4 text-white text-sm text-center"
        style={{ background: 'linear-gradient(135deg, #FFD700, #7B1FA2)' }}
      >
        🙏 Namaste {p.full_name || 'Seeker'} — Vivek Sir has invited you to complete your <strong>Life's Golden Triangle</strong> application.
      </div>
      <ApplyLGT
        tokenMode={{ token: token!, seekerName: p.full_name }}
        initialData={initial}
        onTokenSubmitted={() => {
          // Capture & email PDF report (publicMode — no auth required)
          setReportData({ ...initial });
          setTimeout(async () => {
            if (sentRef.current || !result.seeker_id) return;
            sentRef.current = true;
            try {
              const { base64, filename } = await generateLgtReportPdf({
                filename: `LGT-Report-${(p.full_name || 'Seeker').replace(/\s+/g, '_')}.pdf`,
              });
              await supabase.functions.invoke('send-lgt-report', {
                body: {
                  seekerId: result.seeker_id,
                  pdfBase64: base64,
                  filename,
                  publicMode: true,
                  inviteToken: token,
                },
              });
            } catch (e) {
              console.error('LGT report email failed', e);
            }
          }, 800);
        }}
      />
      {reportData && (
        <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '900px', background: '#fff' }}>
          <LgtReport
            seekerName={p.full_name}
            seekerEmail={p.email}
            submittedAt={new Date().toISOString()}
            filledByRole="seeker"
            data={reportData}
          />
        </div>
      )}
    </div>
  );
};

export default SeekerLgtForm;
