// Shared helper that prepends two seeker-specific pages (B1.1 Client Details and
// B1.2 Payments & Fees) to a pdf-lib PDFDocument. Used by both
// `get-signature-request` (so the seeker sees them before signing) and
// `submit-signature` (so the stored + emailed signed PDF includes them too).

import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "https://esm.sh/pdf-lib@1.17.1";

export interface SeekerInfo {
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

export interface FeeFields {
  feePerSession?: string;
  numSessions?: number | string | "";
  coachingDuration?: string;
  handHoldingSupport?: string;
  totalProgramDuration?: string;
  startDate?: string;
  endDate?: string;
  totalFeesExclGst?: number | string | "";
  gstAmount?: number | string | "";
  totalInvestment?: number | string | "";
  paymentPlan?: "full" | "installments" | "";
  installmentSchedule?: string;
  modeOfPayment?: string | string[];
  amountPaidToday?: number | string | "";
  balanceDue?: number | string | "";
}

const MAROON = rgb(0.545, 0, 0);            // #8B0000
const GOLD = rgb(0.831, 0.627, 0.090);       // #D4A017
const CREAM = rgb(1, 0.973, 0.906);          // #FFF8E7
const TEXT = rgb(0.10, 0.10, 0.10);
const MUTED = rgb(0.40, 0.40, 0.40);
const AMBER_BG = rgb(1, 0.953, 0.875);
const AMBER_BORDER = rgb(0.85, 0.65, 0.13);

function fmtINR(v: unknown): string {
  if (v === "" || v === null || v === undefined) return "—";
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return String(v);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `INR ${n}`;
  }
}

function fmtDate(d?: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

// Strip characters StandardFonts (WinAnsi) cannot encode. Replace common
// Devanagari/Unicode punctuation with safe ASCII to avoid pdf-lib throwing.
function safe(s: unknown): string {
  if (s === null || s === undefined) return "";
  let str = String(s);
  // Replace curly quotes / dashes
  str = str
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2022/g, "*");
  // Drop anything outside basic Latin + Latin-1 supplement
  str = str.replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");
  return str;
}

function drawHeaderBand(page: PDFPage, fontBold: PDFFont, title: string, badge: string) {
  const { width } = page.getSize();
  // Top band
  page.drawRectangle({ x: 0, y: 800, width, height: 42, color: MAROON });
  page.drawText(safe(title), { x: 40, y: 814, size: 16, font: fontBold, color: rgb(1, 1, 1) });
  // Badge pill
  const pillW = 56;
  page.drawRectangle({ x: width - 40 - pillW, y: 808, width: pillW, height: 22, color: GOLD });
  page.drawText(badge, { x: width - 40 - pillW + 12, y: 814, size: 12, font: fontBold, color: rgb(1, 1, 1) });
}

function drawFooter(page: PDFPage, font: PDFFont, label: string, pageNum: string) {
  const { width } = page.getSize();
  page.drawLine({
    start: { x: 40, y: 50 }, end: { x: width - 40, y: 50 },
    thickness: 0.5, color: rgb(0.8, 0.8, 0.8),
  });
  page.drawText(safe(pageNum), { x: 40, y: 36, size: 9, font, color: MUTED });
  const t = safe(label);
  const tw = font.widthOfTextAtSize(t, 9);
  page.drawText(t, { x: width - 40 - tw, y: 36, size: 9, font, color: MUTED });
}

function drawWrappedText(
  page: PDFPage, text: string, x: number, y: number, maxW: number,
  font: PDFFont, size: number, color = TEXT, lineGap = 4,
): number {
  const words = safe(text).split(/\s+/);
  let line = "";
  let cy = y;
  const lineH = size + lineGap;
  for (const w of words) {
    const trial = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(trial, size) <= maxW) {
      line = trial;
    } else {
      if (line) {
        page.drawText(line, { x, y: cy, size, font, color });
        cy -= lineH;
      }
      line = w;
    }
  }
  if (line) {
    page.drawText(line, { x, y: cy, size, font, color });
    cy -= lineH;
  }
  return cy;
}

export async function prependClientPages(
  pdfDoc: PDFDocument,
  opts: { seeker: SeekerInfo; fee: FeeFields | null },
): Promise<void> {
  const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // ---------- B1.1 — Client Details ----------
  const p1 = pdfDoc.insertPage(0, [595, 842]); // A4
  drawHeaderBand(p1, helvBold, "CLIENT DETAILS", "B1.1");

  let y = 770;
  p1.drawText("Auto-pulled from the Seeker's profile on file.", {
    x: 40, y, size: 10, font: italic, color: MUTED,
  });
  y -= 28;

  // 2x2 grid of cards
  const colW = 257;
  const rowH = 70;
  const drawCard = (
    cx: number, cy: number, label: string, value: string, fill = CREAM,
  ) => {
    p1.drawRectangle({ x: cx, y: cy - rowH, width: colW, height: rowH, color: fill, borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 0.5 });
    p1.drawText(safe(label), { x: cx + 10, y: cy - 18, size: 8, font: helvBold, color: MUTED });
    drawWrappedText(p1, value || "—", cx + 10, cy - 36, colW - 20, helvBold, 13);
  };
  drawCard(40, y, "CLIENT NAME", opts.seeker.full_name || "—");
  drawCard(40 + colW + 1, y, "START DATE", fmtDate(opts.fee?.startDate));
  y -= rowH + 10;
  drawCard(40, y, "PHONE", opts.seeker.phone || "—", rgb(1, 1, 1));
  drawCard(40 + colW + 1, y, "EMAIL", opts.seeker.email || "—", rgb(1, 1, 1));
  y -= rowH + 24;

  // Confirmation note box
  p1.drawRectangle({ x: 40, y: y - 70, width: 515, height: 70, color: rgb(0.96, 0.96, 0.96), borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 0.5 });
  drawWrappedText(
    p1,
    "By proceeding, the Client confirms that the above details are accurate and authorises Vivek Doba Business Solutions to use them for engagement, billing, and communication purposes.",
    50, y - 18, 495, helv, 10, TEXT,
  );

  drawFooter(p1, helv, "VIVEK DOBA BUSINESS SOLUTIONS", "1 | Page");

  // ---------- B1.2 — Payments & Fees ----------
  const p2 = pdfDoc.insertPage(1, [595, 842]);
  drawHeaderBand(p2, helvBold, "PAYMENTS & FEES", "B1.2");

  let y2 = 770;
  p2.drawText("Pulled from the Seeker's Fee Structure document on file.", {
    x: 40, y: y2, size: 10, font: italic, color: MUTED,
  });
  y2 -= 22;

  if (!opts.fee) {
    // Amber warning block
    p2.drawRectangle({ x: 40, y: y2 - 90, width: 515, height: 90, color: AMBER_BG, borderColor: AMBER_BORDER, borderWidth: 1 });
    p2.drawText("! Fee Structure Not Yet Recorded", {
      x: 56, y: y2 - 28, size: 12, font: helvBold, color: rgb(0.55, 0.35, 0.05),
    });
    drawWrappedText(
      p2,
      "No Fee Structure has been recorded for this Seeker yet. Please ask your Coach to complete it under Seekers > Documents > Fee Structure before final acknowledgement of payment terms.",
      56, y2 - 50, 485, helv, 10, rgb(0.45, 0.30, 0.05),
    );
  } else {
    const fee = opts.fee;
    const rows: Array<[string, string, boolean?]> = [
      ["Fee per session", safe(fee.feePerSession || "—")],
      ["Number of sessions", fee.numSessions ? `${fee.numSessions} sessions` : "—"],
      ["Coaching duration", safe(fee.coachingDuration || "—")],
      ["Hand-holding support", safe(fee.handHoldingSupport || "—")],
      ["Total program duration", safe(fee.totalProgramDuration || "—")],
      ["Start date", fmtDate(fee.startDate)],
      ["End date", fmtDate(fee.endDate)],
      ["Total fees (excl GST)", fmtINR(fee.totalFeesExclGst)],
      ["GST @ 18%", fmtINR(fee.gstAmount)],
      ["Total Investment", fmtINR(fee.totalInvestment), true],
      ["Payment plan", fee.paymentPlan === "full" ? "Full Payment" : fee.paymentPlan === "installments" ? "Installments" : "—"],
    ];
    if (fee.paymentPlan === "installments") {
      rows.push(["Installment schedule", safe(fee.installmentSchedule || "—")]);
    }
    rows.push([
      "Mode of payment",
      Array.isArray(fee.modeOfPayment)
        ? (fee.modeOfPayment.length ? fee.modeOfPayment.join(", ") : "—")
        : safe(fee.modeOfPayment || "—"),
    ]);
    rows.push(["Amount paid today", fmtINR(fee.amountPaidToday)]);
    rows.push(["Balance due", fmtINR(fee.balanceDue)]);

    // Table header
    const tableX = 40;
    const tableW = 515;
    const col1W = 290;
    const rowH2 = 22;
    p2.drawRectangle({ x: tableX, y: y2 - rowH2, width: tableW, height: rowH2, color: MAROON });
    p2.drawText("ITEM", { x: tableX + 10, y: y2 - 15, size: 10, font: helvBold, color: rgb(1, 1, 1) });
    p2.drawText("AMOUNT / DETAILS", { x: tableX + col1W + 10, y: y2 - 15, size: 10, font: helvBold, color: rgb(1, 1, 1) });
    let ry = y2 - rowH2;

    rows.forEach(([label, value, bold], i) => {
      const fill = i % 2 === 1 ? rgb(1, 0.973, 0.906) : rgb(1, 1, 1);
      p2.drawRectangle({ x: tableX, y: ry - rowH2, width: tableW, height: rowH2, color: fill, borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 0.3 });
      p2.drawText(safe(label), { x: tableX + 10, y: ry - 15, size: 9.5, font: helv, color: TEXT });
      p2.drawText(safe(value), { x: tableX + col1W + 10, y: ry - 15, size: 9.5, font: bold ? helvBold : helv, color: bold ? MAROON : TEXT });
      ry -= rowH2;
    });

    // GST footnote
    p2.drawText("GST invoice will be issued for every payment received.", {
      x: 40, y: ry - 16, size: 9, font: italic, color: MUTED,
    });
  }

  drawFooter(p2, helv, "VIVEK DOBA BUSINESS SOLUTIONS", "2 | Page");
}
