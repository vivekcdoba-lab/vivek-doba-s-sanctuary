import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// Chunked base64 encoding — avoids "Maximum call stack size exceeded"
// when spreading large Uint8Arrays into String.fromCharCode(...).
function bytesToBase64(bytes: Uint8Array): string {
  const CHUNK = 0x8000; // 32 KB chunks
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const slice = bytes.subarray(i, i + CHUNK);
    binary += String.fromCharCode.apply(null, slice as unknown as number[]);
  }
  return btoa(binary);
}

function makeVerificationId() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return "VDTS-" + [...bytes].map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const { token, full_name, place, signature_date, consent, user_agent } = body ?? {};
    if (!token || !full_name || !place || !signature_date || consent !== true) {
      return new Response(JSON.stringify({ error: "Missing fields or consent" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (full_name.length > 200 || place.length > 200) {
      return new Response(JSON.stringify({ error: "Field too long" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null;
    const tokenHash = await sha256(token);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: reqRow, error } = await admin
      .from("signature_requests")
      .select("id, seeker_id, document_id, status, expires_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (error || !reqRow) return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (reqRow.status !== "pending") return new Response(JSON.stringify({ error: reqRow.status }), { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (new Date(reqRow.expires_at) < new Date()) {
      await admin.from("signature_requests").update({ status: "expired" }).eq("id", reqRow.id);
      return new Response(JSON.stringify({ error: "expired" }), { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: doc } = await admin.from("documents").select("title, storage_path").eq("id", reqRow.document_id).single();
    const { data: seeker } = await admin.from("profiles").select("full_name, email").eq("id", reqRow.seeker_id).single();

    // Load source PDF (or create a blank one if no source)
    let pdfDoc: PDFDocument;
    if (doc?.storage_path) {
      const { data: file, error: dlErr } = await admin.storage.from("documents").download(doc.storage_path);
      if (dlErr || !file) {
        pdfDoc = await PDFDocument.create();
        const p = pdfDoc.addPage([595, 842]);
        const f = await pdfDoc.embedFont(StandardFonts.Helvetica);
        p.drawText(doc?.title ?? "Document", { x: 50, y: 780, size: 18, font: f, color: rgb(0, 0, 0) });
      } else {
        const buf = new Uint8Array(await file.arrayBuffer());
        try { pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true }); }
        catch { pdfDoc = await PDFDocument.create(); }
      }
    } else {
      pdfDoc = await PDFDocument.create();
    }

    // Append signature page
    const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const page = pdfDoc.addPage([595, 842]);
    const verificationId = makeVerificationId();
    const timestamp = new Date().toISOString();

    page.drawRectangle({ x: 0, y: 792, width: 595, height: 50, color: rgb(1, 0.42, 0) });
    page.drawText("Digital Signature Certificate", { x: 50, y: 808, size: 20, font: helvBold, color: rgb(1, 1, 1) });

    let y = 740;
    const line = (label: string, value: string, bold = false) => {
      page.drawText(label, { x: 50, y, size: 11, font: helvBold, color: rgb(0.3, 0.3, 0.3) });
      page.drawText(value, { x: 200, y, size: 11, font: bold ? helvBold : helv, color: rgb(0, 0, 0) });
      y -= 24;
    };
    line("Document:", doc?.title ?? "—", true);
    line("Signer:", full_name, true);
    line("Place:", place);
    line("Date:", signature_date);
    line("Timestamp (UTC):", timestamp);
    line("IP Address:", ip ?? "—");
    line("Verification ID:", verificationId, true);

    // Bottom-LEFT: Coach Signature  |  Bottom-RIGHT: Signer block
    const baseY = 90;
    page.drawText("Coach Signature", { x: 50, y: baseY + 50, size: 10, font: helvBold, color: rgb(0.3, 0.3, 0.3) });
    page.drawText("Vivek Doba", { x: 50, y: baseY + 22, size: 22, font: italic, color: rgb(0.05, 0.1, 0.4) });
    page.drawLine({ start: { x: 50, y: baseY + 18 }, end: { x: 270, y: baseY + 18 }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) });
    page.drawText("Vivek Doba — Coach (Guruji)", { x: 50, y: baseY + 4, size: 9, font: helv, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(signature_date, { x: 50, y: baseY - 8, size: 9, font: helv, color: rgb(0.4, 0.4, 0.4) });

    page.drawText("Signer Signature", { x: 325, y: baseY + 50, size: 10, font: helvBold, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(full_name, { x: 325, y: baseY + 22, size: 22, font: italic, color: rgb(0.05, 0.1, 0.4) });
    page.drawLine({ start: { x: 325, y: baseY + 18 }, end: { x: 545, y: baseY + 18 }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) });
    page.drawText(`${full_name} — ${place}`, { x: 325, y: baseY + 4, size: 9, font: helv, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(`${signature_date}  •  ${verificationId}`, { x: 325, y: baseY - 8, size: 9, font: helv, color: rgb(0.4, 0.4, 0.4) });

    page.drawText("Electronically signed under the Information Technology Act, 2000.", {
      x: 50, y: 40, size: 9, font: italic, color: rgb(0.4, 0.4, 0.4),
    });

    pdfDoc.setTitle(`${doc?.title ?? "Document"} — Signed`);
    pdfDoc.setAuthor("Vivek Doba Training Solutions");
    pdfDoc.setSubject(`Signed by ${full_name}`);
    pdfDoc.setProducer("VDTS Signature Service");
    pdfDoc.setCreator("VDTS");

    const signedBytes = await pdfDoc.save({ useObjectStreams: true });
    const fileSize = signedBytes.byteLength;
    const signedPath = `${reqRow.seeker_id}/${reqRow.id}-signed.pdf`;

    const { error: upErr } = await admin.storage.from("signatures").upload(signedPath, signedBytes, {
      contentType: "application/pdf", upsert: true,
    });
    if (upErr) throw upErr;

    await admin.from("document_signatures").insert({
      request_id: reqRow.id, seeker_id: reqRow.seeker_id, document_id: reqRow.document_id,
      signed_pdf_path: signedPath, typed_full_name: full_name, place,
      signature_date, ip_address: ip, user_agent: user_agent ?? null,
      verification_id: verificationId, file_size_bytes: fileSize,
    });
    await admin.from("signature_requests").update({ status: "signed", signed_at: new Date().toISOString() }).eq("id", reqRow.id);

    // Email signed PDF to seeker + notify coach/admins
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY && seeker?.email) {
      const b64 = btoa(String.fromCharCode(...new Uint8Array(signedBytes)));
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
            html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1f2937">
              <p>Dear ${seeker?.full_name ?? full_name},</p>
              <p>Thank you for signing the agreement.</p>
              <p>We appreciate your prompt response and look forward to working together. Please let me know if there is anything further required from my side.</p>
              <p style="background:#FFF8F0;padding:12px;border-radius:8px;border-left:4px solid #FF6B00;font-size:14px">
                <strong>Document:</strong> ${doc?.title}<br/>
                <strong>Verification ID:</strong> ${verificationId}
              </p>
              <p>Best regards,<br/>VDTS</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
              <p style="font-size:12px;color:#9ca3af">Vivek Doba Training Solutions</p>
            </div>`,
            attachments: [{ filename: `${(doc?.title ?? "document").replace(/[^a-z0-9]/gi, "_")}-signed.pdf`, content: b64 }],
          }),
        });
        if (!resp.ok) console.error("resend_failed seeker", resp.status, await resp.text().catch(() => ""));
      } catch (e) { console.error("seeker email failed", e); }

      // Notify admins + coaches
      const { data: admins } = await admin.from("profiles").select("email").or("role.eq.admin,role.eq.coach,is_also_coach.eq.true");
      const adminEmails = (admins ?? []).map((a: any) => a.email).filter(Boolean);
      if (adminEmails.length) {
        try {
          const resp = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "VDTS Notifications <info@vivekdoba.com>",
              to: adminEmails,
              subject: `Signed: ${seeker?.full_name ?? "Seeker"} → ${doc?.title}`,
              html: `<p>${seeker?.full_name} signed <strong>${doc?.title}</strong> at ${timestamp}.</p>
                <p>Verification ID: <strong>${verificationId}</strong></p>`,
            }),
          });
          if (!resp.ok) console.error("resend_failed admin", resp.status, await resp.text().catch(() => ""));
        } catch (e) { console.error("admin email failed", e); }
      }
    }

    // In-app notification
    try {
      await admin.from("notifications").insert({
        user_id: reqRow.seeker_id,
        title: "Document signed",
        message: `Your ${doc?.title} has been signed. Verification ID: ${verificationId}`,
        type: "signature",
      });
    } catch (_) { /* notifications table optional */ }

    return new Response(JSON.stringify({ success: true, verification_id: verificationId, file_size_bytes: fileSize }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
