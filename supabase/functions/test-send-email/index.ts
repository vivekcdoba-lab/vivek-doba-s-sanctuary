// One-off deliverability test. Safe to delete after use.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ ok: false, reason: "no_api_key" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#FFF8F0;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;padding:32px 12px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #f0e3cf;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#FF6B00,#800020);padding:28px;text-align:center;color:#ffffff;">
          <div style="font-size:36px;line-height:1;">ॐ</div>
          <div style="margin-top:8px;font-size:20px;font-weight:700;">Vivek Doba Training Solutions</div>
          <div style="margin-top:4px;font-size:13px;opacity:.85;">Deliverability test</div>
        </td></tr>
        <tr><td style="padding:28px;">
          <h2 style="margin:0 0 8px;color:#222;font-size:20px;">Hello Coach Vivek 🙏</h2>
          <p style="margin:0 0 16px;color:#444;font-size:15px;line-height:1.55;">
            This is a one-off test email from the VDTS platform sent at
            <strong>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</strong>.
          </p>
          <p style="margin:0 0 16px;color:#444;font-size:15px;line-height:1.55;">
            If you received this in your inbox (or spam), please confirm — it means email delivery
            from <code>info@vivekdoba.com</code> is working correctly.
          </p>
          <p style="color:#666;font-size:12px;margin-top:24px">— Vivek Doba Training Solutions</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "VDTS <info@vivekdoba.com>",
      to: ["coachviveklgt@gmail.com"],
      subject: "VDTS — Deliverability Test",
      html,
    }),
  });

  const text = await resp.text();
  console.log("[_test-send-email] status=" + resp.status + " body=" + text);
  return new Response(
    JSON.stringify({ status: resp.status, ok: resp.ok, body: text }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
