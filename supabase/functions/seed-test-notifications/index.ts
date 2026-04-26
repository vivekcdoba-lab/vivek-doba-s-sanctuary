const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const RECIPIENTS = [
  'crwanare@gmail.com',
  'coachviveklgt@gmail.com',
  'vivekcdoba@gmail.com',
];

const FROM = 'VDTS Testing <onboarding@resend.dev>';

function wrap(title: string, body: string) {
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#FFF8F0;padding:24px;color:#1a1a1a">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #f0e0d0">
    <div style="background:linear-gradient(135deg,#FF6B00,#800020);padding:20px 24px;color:#fff">
      <div style="font-size:12px;opacity:.85;letter-spacing:.5px">VDTS — END-TO-END TEST</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px">${title}</div>
    </div>
    <div style="padding:24px;line-height:1.6;font-size:14px">${body}</div>
    <div style="padding:16px 24px;border-top:1px solid #f0e0d0;font-size:11px;color:#888">This is a TEST email from the Jan 1 – May 31 2026 dry-run seed. Safe to ignore.</div>
  </div></body></html>`;
}

interface Mail { subject: string; html: string }

function buildMails(): Mail[] {
  const mails: Mail[] = [];

  mails.push({
    subject: 'Welcome to LGT PLATINUM™ (Jan 1, 2026)',
    html: wrap('🙏 Welcome, Seeker', `<p>Your enrollment in <b>LGT PLATINUM™</b> is confirmed effective <b>1 January 2026</b>.</p><p>Coach: Vivek Doba<br/>Program duration: 5 months · 21 weekly sessions<br/>Total fee: ₹50,000 + GST</p>`),
  });

  // 5 monthly payments
  const months = ['January', 'February', 'March', 'April', 'May'];
  months.forEach((m, i) => {
    mails.push({
      subject: `Payment Received ₹11,800 (${m} 2026)`,
      html: wrap(`💳 Payment Received — ${m} 2026`, `<p>We have received your monthly installment.</p><table style="width:100%;border-collapse:collapse"><tr><td style="padding:6px 0;color:#666">Date</td><td style="text-align:right"><b>10 ${m} 2026</b></td></tr><tr><td style="padding:6px 0;color:#666">Base</td><td style="text-align:right">₹10,000</td></tr><tr><td style="padding:6px 0;color:#666">GST (18%)</td><td style="text-align:right">₹1,800</td></tr><tr><td style="padding:6px 0;border-top:1px solid #eee"><b>Total</b></td><td style="text-align:right;border-top:1px solid #eee"><b>₹11,800</b></td></tr></table><p style="margin-top:16px">Installment ${i + 1} of 5 · Status: <b style="color:#1D9E75">RECEIVED</b></p>`),
    });
  });

  // 6 badges
  const badges = [
    ['First Worksheet', '📝', 'You submitted your very first daily worksheet.'],
    ['7-Day Streak', '🔥', 'Seven consecutive days of daily practice.'],
    ['30-Day Streak', '⚡', 'A full month of unbroken sadhana.'],
    ['First Session', '🎓', 'You attended your first 1:1 coaching session.'],
    ['10 Sessions Completed', '🏆', 'Ten coaching sessions in the books.'],
    ['Wheel Master', '☸️', 'Three Wheel-of-Life assessments completed.'],
  ];
  badges.forEach(([name, emoji, desc]) => {
    mails.push({
      subject: `Badge Earned: ${name}`,
      html: wrap(`${emoji} Badge Unlocked — ${name}`, `<p style="font-size:48px;text-align:center;margin:0">${emoji}</p><p style="text-align:center;font-size:18px;font-weight:700">${name}</p><p style="text-align:center;color:#666">${desc}</p>`),
    });
  });

  // 21 weekly session reminders
  for (let w = 1; w <= 21; w++) {
    mails.push({
      subject: `Session Reminder — Week ${w} (Saturday 10:00 AM)`,
      html: wrap(`📅 Week ${w} Coaching Session`, `<p>Reminder: your weekly LGT session is scheduled for <b>Saturday at 10:00 AM IST</b>.</p><p>Pillar focus: <b>${['Dharma', 'Artha', 'Kama', 'Moksha'][(w - 1) % 4]}</b></p><p>Please complete your worksheet and arrive 5 min early.</p>`),
    });
  }

  // 21 weekly progress summaries
  const pattern = ['↑', '↑', '↑', '→', '→', '→', '↑', '↑', '↑', '↓', '↓', '↓', '→', '→', '→', '↑', '↑', '↑', '↑', '↑', '↑'];
  for (let w = 1; w <= 21; w++) {
    mails.push({
      subject: `Weekly Progress Summary — Week ${w} of 21 ${pattern[w - 1]}`,
      html: wrap(`📊 Week ${w} Progress`, `<p>Trend this week: <b style="font-size:20px">${pattern[w - 1]}</b></p><ul><li>Worksheets submitted: ${5 + (w % 3)}/7</li><li>LGT balance score: ${(5 + w * 0.18).toFixed(1)}/10</li><li>Sessions attended: 1/1</li></ul>`),
    });
  }

  // Missed worksheet alerts (down weeks)
  [10, 11, 12].forEach(w => {
    mails.push({
      subject: `Coach Alert — Missed Worksheets Week ${w}`,
      html: wrap(`⚠️ Engagement Dip — Week ${w}`, `<p>Seeker has missed worksheets in week ${w}. Suggest reaching out for support.</p>`),
    });
  });

  return mails.map(m => ({ ...m, subject: `Testing — ${m.subject}` }));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY missing');

    const mails = buildMails();
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const m of mails) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM,
          to: RECIPIENTS,
          subject: m.subject,
          html: m.html,
        }),
      });
      const body = await res.text();
      if (res.ok) sent++; else { failed++; errors.push(`${res.status}: ${body.slice(0, 200)}`); }
      await new Promise(r => setTimeout(r, 600)); // throttle
    }

    return new Response(JSON.stringify({
      success: true,
      total: mails.length,
      sent,
      failed,
      recipients: RECIPIENTS,
      sample_errors: errors.slice(0, 5),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
