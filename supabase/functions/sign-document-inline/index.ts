import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function makeVerificationId() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return "VDTS-" + [...bytes].map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

async function buildSignedPdf(opts: {
  admin: any;
  docTitle: string;
  storagePath: string | null;
  signerName: string;
  place: string;
  signatureDate: string;
  ip: string | null;
  verificationId: string;
}) {
  let pdfDoc: PDFDocument;
  if (opts.storagePath) {
    const { data: file, error: dlErr } = await opts.admin.storage.from("documents").download(opts.storagePath);
    if (dlErr || !file) {
      pdfDoc = await PDFDocument.create();
    } else {
      const buf = new Uint8Array(await file.arrayBuffer());
      try { pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true }); }
      catch { pdfDoc = await PDFDocument.create(); }
    }
  } else {
    pdfDoc = await PDFDocument.create();
  }

  const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Append a dedicated certificate page
  const page = pdfDoc.addPage([595, 842]);
  const timestamp = new Date().toISOString();

  page.drawRectangle({ x: 0, y: 792, width: 595, height: 50, color: rgb(1, 0.42, 0) });
  page.drawText("Digital Signature Certificate", { x: 50, y: 808, size: 20, font: helvBold, color: rgb(1, 1, 1) });

  let y = 740;
  const line = (label: string, value: string, bold = false) => {
    page.drawText(label, { x: 50, y, size: 11, font: helvBold, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(value, { x: 200, y, size: 11, font: bold ? helvBold : helv, color: rgb(0, 0, 0) });
    y -= 24;
  };
  line("Document:", opts.docTitle, true);
  line("Signer:", opts.signerName, true);
  line("Place:", opts.place);
  line("Date:", opts.signatureDate);
  line("Timestamp (UTC):", timestamp);
  line("IP Address:", opts.ip ?? "—");
  line("Verification ID:", opts.verificationId, true);

  // Bottom-LEFT: Coach Signature  |  Bottom-RIGHT: Signer block
  const baseY = 90;
  // Coach (left)
  page.drawText("Coach Signature", { x: 50, y: baseY + 50, size: 10, font: helvBold, color: rgb(0.3, 0.3, 0.3) });
  page.drawText("Vivek Doba", { x: 50, y: baseY + 22, size: 22, font: italic, color: rgb(0.05, 0.1, 0.4) });
  page.drawLine({ start: { x: 50, y: baseY + 18 }, end: { x: 270, y: baseY + 18 }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) });
  page.drawText("Vivek Doba — Coach (Guruji)", { x: 50, y: baseY + 4, size: 9, font: helv, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(opts.signatureDate, { x: 50, y: baseY - 8, size: 9, font: helv, color: rgb(0.4, 0.4, 0.4) });

  // Signer (right)
  page.drawText("Signer Signature", { x: 325, y: baseY + 50, size: 10, font: helvBold, color: rgb(0.3, 0.3, 0.3) });
  page.drawText(opts.signerName, { x: 325, y: baseY + 22, size: 22, font: italic, color: rgb(0.05, 0.1, 0.4) });
  page.drawLine({ start: { x: 325, y: baseY + 18 }, end: { x: 545, y: baseY + 18 }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) });
  page.drawText(`${opts.signerName} — ${opts.place}`, { x: 325, y: baseY + 4, size: 9, font: helv, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(`${opts.signatureDate}  •  ${opts.verificationId}`, { x: 325, y: baseY - 8, size: 9, font: helv, color: rgb(0.4, 0.4, 0.4) });

  page.drawText("Electronically signed under the Information Technology Act, 2000.", {
    x: 50, y: 40, size: 9, font: italic, color: rgb(0.4, 0.4, 0.4),
  });

  pdfDoc.setTitle(`${opts.docTitle} — Signed`);
  pdfDoc.setAuthor("Vivek Doba Training Solutions");
  pdfDoc.setSubject(`Signed by ${opts.signerName}`);
  pdfDoc.setProducer("VDTS Signature Service");
  pdfDoc.setCreator("VDTS");

  return await pdfDoc.save({ useObjectStreams: true });
}

const THANK_YOU_HTML = (name: string, docTitle: string, verificationId: string) => `
  <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1f2937">
    <p>Dear ${name},</p>
    <p>Thank you for signing the agreement.</p>
    <p>We appreciate your prompt response and look forward to working together. Please let me know if there is anything further required from my side.</p>
    <p style="background:#FFF8F0;padding:12px;border-radius:8px;border-left:4px solid #FF6B00;font-size:14px">
      <strong>Document:</strong> ${docTitle}<br/>
      <strong>Verification ID:</strong> ${verificationId}
    </p>
    <p>Best regards,<br/>VDTS</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
    <p style="font-size:12px;color:#9ca3af">Vivek Doba Training Solutions</p>
  </div>`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: callerProfile } = await admin.from("profiles").select("id, role, is_also_coach").eq("user_id", user.id).maybeSingle();
    if (!callerProfile || (callerProfile.role !== "admin" && callerProfile.role !== "coach" && !callerProfile.is_also_coach)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { seeker_id, document_ids, full_name, place, signature_date } = body ?? {};
    if (!seeker_id || !Array.isArray(document_ids) || document_ids.length === 0 || !full_name || !place || !signature_date) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (String(full_name).length > 200 || String(place).length > 200) {
      return new Response(JSON.stringify({ error: "Field too long" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: seeker, error: seekerErr } = await admin.from("profiles").select("id, full_name, email").eq("id", seeker_id).single();
    if (seekerErr || !seeker) {
      return new Response(JSON.stringify({ error: "Seeker not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: docs, error: docsErr } = await admin.from("documents").select("id, title, storage_path").in("id", document_ids).eq("is_active", true);
    if (docsErr || !docs || docs.length === 0) {
      return new Response(JSON.stringify({ error: "No active documents" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const signed: any[] = [];

    for (const doc of docs) {
      const verificationId = makeVerificationId();

      // Create signed signature_request row (no token email step needed)
      const { data: req2, error: reqErr } = await admin.from("signature_requests").insert({
        seeker_id,
        document_id: doc.id,
        signer_name: full_name,
        token_hash: `inline-${verificationId}`,
        status: "signed",
        signed_at: new Date().toISOString(),
        created_by: callerProfile.id,
        sign_method: "in_person",
      }).select("id").single();
      if (reqErr) { console.error("request insert failed", reqErr); continue; }

      const signedBytes = await buildSignedPdf({
        admin, docTitle: doc.title, storagePath: doc.storage_path,
        signerName: full_name, place, signatureDate: signature_date,
        ip, verificationId,
      });
      const fileSize = signedBytes.byteLength;
      const signedPath = `${seeker_id}/${req2.id}-signed.pdf`;

      const { error: upErr } = await admin.storage.from("signatures").upload(signedPath, signedBytes, {
        contentType: "application/pdf", upsert: true,
      });
      if (upErr) { console.error("upload failed", upErr); continue; }

      await admin.from("document_signatures").insert({
        request_id: req2.id, seeker_id, document_id: doc.id,
        signed_pdf_path: signedPath, typed_full_name: full_name, place,
        signature_date, ip_address: ip, user_agent: req.headers.get("user-agent") ?? null,
        verification_id: verificationId, file_size_bytes: fileSize,
      });

      // Email seeker the signed copy with "Thank You" template
      let email_sent = false;
      let email_error: string | undefined;
      if (RESEND_API_KEY && seeker.email) {
        // Chunked base64 encoding to avoid "Maximum call stack size exceeded"
        const bytes = new Uint8Array(signedBytes);
        let binary = "";
        const CHUNK = 8192;
        for (let i = 0; i < bytes.length; i += CHUNK) {
          binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)));
        }
        const b64 = btoa(binary);
        try {
          const resp = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "Vivek Doba <info@vivekdoba.com>",
              to: [seeker.email],
              subject: "Thank You for Signing the Agreement",
              html: THANK_YOU_HTML(seeker.full_name ?? full_name, doc.title, verificationId),
              attachments: [{ filename: `${doc.title.replace(/[^a-z0-9]/gi, "_")}-signed.pdf`, content: b64 }],
            }),
          });
          const j = await resp.json().catch(() => ({}));
          if (!resp.ok) {
            email_error = `${resp.status}: ${JSON.stringify(j)}`;
            console.error("resend_failed", email_error);
          } else {
            email_sent = true;
          }
        } catch (e) {
          email_error = String(e);
          console.error("seeker email failed", e);
        }
      } else if (!seeker.email) {
        email_error = "Seeker has no email on file";
      } else {
        email_error = "RESEND_API_KEY not configured";
      }

      try {
        await admin.from("notifications").insert({
          user_id: seeker_id,
          title: "Document signed",
          message: `Your ${doc.title} has been signed. Verification ID: ${verificationId}`,
          type: "signature",
        });
      } catch (_) { /* optional */ }

      signed.push({ request_id: req2.id, document: doc.title, verification_id: verificationId, email_sent, email_error });
    }

    return new Response(JSON.stringify({ success: true, signed }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
