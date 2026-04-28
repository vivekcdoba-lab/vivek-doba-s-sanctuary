import { premiumAgreementContent as C } from "@/content/premiumAgreement";
import type { FeeStructureFields } from "@/hooks/useFeeStructure";

export interface PremiumAgreementClient {
  fullName: string;
  email: string;
  phone: string;
  startDate: string; // ISO date
}

export interface PremiumAgreementSignature {
  storage_path?: string | null;
  typed_name?: string | null;
  signed_at?: string | null;
  signer_name?: string | null;
}

interface Props {
  client: PremiumAgreementClient;
  fee: FeeStructureFields | null;
  seekerSignature?: PremiumAgreementSignature | null;
  coachSignature?: PremiumAgreementSignature | null;
  signatureImageUrls?: { seeker?: string | null; coach?: string | null };
}

const Page = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <section
    data-page={n}
    className="bg-white text-[#1a1a1a] mx-auto mb-6 print:mb-0 print:break-after-page shadow-lg print:shadow-none"
    style={{
      width: "210mm",
      minHeight: "297mm",
      padding: "18mm 16mm",
      fontFamily: "'Poppins', system-ui, sans-serif",
      fontSize: "10.5pt",
      lineHeight: 1.45,
    }}
  >
    {children}
    <div className="text-[8pt] text-gray-500 mt-6 pt-3 border-t border-gray-200 flex justify-between">
      <span>{n} | Page</span>
      <span>{C.brand.company}</span>
    </div>
  </section>
);

const Heading = ({ en, hi }: { en: string; hi: string }) => (
  <div className="mb-3">
    <h2 className="text-[14pt] font-bold text-[#8B0000]">{en}</h2>
    <h3 className="text-[11pt] font-semibold text-gray-700">{hi}</h3>
  </div>
);

const Bilingual = ({ en, hi, className = "" }: { en: string; hi: string; className?: string }) => (
  <div className={`mb-2 ${className}`}>
    <p>{en}</p>
    <p className="text-gray-700 italic">{hi}</p>
  </div>
);

const formatINR = (n: number | string | "") => {
  if (n === "" || n === null || n === undefined) return "—";
  const num = typeof n === "number" ? n : Number(n);
  if (isNaN(num)) return String(n);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);
};

const fmtDate = (d?: string) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
};

export default function PremiumAgreementDocument({
  client,
  fee,
  seekerSignature,
  coachSignature,
  signatureImageUrls,
}: Props) {
  return (
    <div id="premium-agreement-print" className="bg-gray-100 print:bg-white py-6 print:py-0">
      {/* PAGE 1 — COVER */}
      <Page n={1}>
        <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "240mm" }}>
          <div className="text-[10pt] tracking-[0.4em] text-[#8B0000] font-bold mb-2">{C.brand.company}</div>
          <div className="text-[9pt] italic text-gray-600 mb-12">{C.brand.tagline}</div>
          <div className="border-t-2 border-b-2 border-[#D4A017] py-6 px-8 mb-8">
            <h1 className="text-[22pt] font-bold text-[#8B0000] mb-2">{C.cover.title_en}</h1>
            <h2 className="text-[14pt] text-gray-700">{C.cover.title_hi}</h2>
          </div>
          <p className="text-[12pt] italic mb-1">{C.cover.subtitle_en}</p>
          <p className="text-[10pt] text-gray-700 mb-12">{C.cover.subtitle_hi}</p>
          <div className="text-[9pt] text-gray-600 max-w-md mx-auto mb-8">
            <p className="mb-1">{C.cover.note_en}</p>
            <p className="italic">{C.cover.note_hi}</p>
          </div>
          <div className="text-[9pt] tracking-[0.3em] text-[#8B0000] font-semibold">PRIVATE • CONFIDENTIAL</div>
        </div>
      </Page>

      {/* PAGE 2 — SNAPSHOT */}
      <Page n={2}>
        <Heading en={C.snapshot.heading_en} hi={C.snapshot.heading_hi} />
        <div className="grid grid-cols-2 gap-4">
          {C.snapshot.blocks.map((b, i) => (
            <div key={i} className="border border-[#D4A017]/40 rounded-md p-3 bg-[#FFF8E7]/30">
              <div className="text-[10pt] font-bold text-[#8B0000]">✦ {b.title_en}</div>
              <div className="text-[8.5pt] italic text-gray-600 mb-2">{b.title_hi}</div>
              <ul className="list-disc pl-4 space-y-1 text-[9pt]">
                {b.items.map((it, j) => <li key={j}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-3 p-2 border border-red-300 bg-red-50 rounded text-[9pt]">
          <span className="font-bold text-red-700">✗ </span>{C.snapshot.notForLine_en}
          <p className="italic text-gray-600">{C.snapshot.notForLine_hi}</p>
        </div>
        <div className="mt-2 p-2 border border-amber-400 bg-amber-50 rounded text-[9pt]">
          <span className="font-bold">⚠ </span>{C.snapshot.limitedNote_en}
          <p className="italic text-gray-600">{C.snapshot.limitedNote_hi}</p>
        </div>
      </Page>

      {/* PAGE 3 — NOTE FROM VIVEK + PROMISE */}
      <Page n={3}>
        <Heading en={C.noteFromVivek.heading_en} hi={C.noteFromVivek.heading_hi} />
        {C.noteFromVivek.paragraphs.map((p, i) => <Bilingual key={i} en={p.en} hi={p.hi} />)}
        <p className="text-[10pt] font-semibold mt-2">{C.noteFromVivek.signoff.en}</p>
        <p className="text-[9pt] italic text-gray-700 mb-5">{C.noteFromVivek.signoff.hi}</p>

        <Heading en={C.promise.heading_en} hi={C.promise.heading_hi} />
        <table className="w-full border-collapse text-[9pt]">
          <tbody>
            {C.promise.rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-2 pr-3 align-top w-1/2">
                  <div className="font-semibold text-[#8B0000]">◆ {r.en_title}</div>
                  <div className="text-gray-700">{r.en_body}</div>
                </td>
                <td className="py-2 pl-3 align-top w-1/2 border-l border-gray-200">
                  <div className="font-semibold">◆ {r.hi_title}</div>
                  <div className="text-gray-700 italic">{r.hi_body}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Page>

      {/* PAGE 4 — B1.1 CLIENT BLOCK */}
      <Page n={4}>
        <div className="text-center mb-4">
          <div className="inline-block bg-[#8B0000] text-white px-4 py-1 rounded text-[10pt] font-bold">B1.1</div>
        </div>
        <Heading en="CLIENT DETAILS" hi="क्लाइंट विवरण" />
        <p className="text-[9pt] text-gray-600 mb-4">
          The information below is auto-pulled from the Seeker's profile on file. /
          <span className="italic"> नीचे की जानकारी फाइल पर सेकर की प्रोफाइल से ली गई है।</span>
        </p>

        <table className="w-full border border-gray-400 text-[10pt]">
          <tbody>
            <tr className="bg-[#FFF8E7]">
              <td className="border border-gray-400 p-3 w-1/2">
                <div className="text-[8pt] text-gray-600 uppercase">Client Name / नाम</div>
                <div className="font-semibold text-[12pt] mt-1">{client.fullName || "—"}</div>
              </td>
              <td className="border border-gray-400 p-3 w-1/2">
                <div className="text-[8pt] text-gray-600 uppercase">Start Date / प्रारंभ तिथि</div>
                <div className="font-semibold text-[12pt] mt-1">{fmtDate(client.startDate)}</div>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-3">
                <div className="text-[8pt] text-gray-600 uppercase">Phone / फ़ोन</div>
                <div className="font-semibold text-[12pt] mt-1">{client.phone || "—"}</div>
              </td>
              <td className="border border-gray-400 p-3">
                <div className="text-[8pt] text-gray-600 uppercase">Email / ईमेल</div>
                <div className="font-semibold text-[12pt] mt-1 break-all">{client.email || "—"}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded text-[9pt] text-gray-700">
          By proceeding, the Client confirms that the above details are accurate and authorises Vivek Doba Business Solutions
          to use them for engagement, billing, and communication purposes.
          <p className="italic mt-1 text-gray-600">
            आगे बढ़ने पर, क्लाइंट पुष्टि करता है कि उपरोक्त विवरण सटीक हैं।
          </p>
        </div>
      </Page>

      {/* PAGE 5 — DELIVERS */}
      <Page n={5}>
        <Heading en={C.delivers.heading_en} hi={C.delivers.heading_hi} />
        <Bilingual en={C.delivers.intro_en} hi={C.delivers.intro_hi} />
        <table className="w-full border-collapse mt-3 text-[10pt]">
          <thead>
            <tr className="bg-[#8B0000] text-white">
              <th className="text-left p-2 w-1/2">WHAT'S INCLUDED</th>
              <th className="text-left p-2 w-1/2">क्या शामिल है</th>
            </tr>
          </thead>
          <tbody>
            {C.delivers.rows.map((r, i) => (
              <tr key={i} className={i % 2 ? "bg-[#FFF8E7]/40" : ""}>
                <td className="border border-gray-300 p-2">◆ {r[0]}</td>
                <td className="border border-gray-300 p-2 italic text-gray-700">◆ {r[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 p-3 bg-[#FFF8E7] border-l-4 border-[#D4A017] text-[10pt]">
          <p className="font-semibold">{C.delivers.closing_en}</p>
          <p className="italic text-gray-700 mt-1">{C.delivers.closing_hi}</p>
        </div>
      </Page>

      {/* PAGE 6 — B1.2 PAYMENTS & FEES */}
      <Page n={6}>
        <div className="text-center mb-4">
          <div className="inline-block bg-[#8B0000] text-white px-4 py-1 rounded text-[10pt] font-bold">B1.2</div>
        </div>
        <Heading en="PAYMENTS & FEES" hi="भुगतान और शुल्क" />
        <p className="text-[9pt] text-gray-600 mb-3">
          Pulled from the Seeker's Fee Structure document on file. /
          <span className="italic"> सेकर की फीस संरचना दस्तावेज़ से लिया गया।</span>
        </p>

        {!fee ? (
          <div className="p-4 bg-amber-50 border border-amber-400 rounded text-[10pt] text-amber-900">
            ⚠ No Fee Structure has been recorded yet for this Seeker. Please complete it under
            <b> Seekers → Documents → Fee Structure</b> before generating the agreement.
          </div>
        ) : (
          <table className="w-full border border-gray-400 text-[10pt]">
            <thead>
              <tr className="bg-[#8B0000] text-white">
                <th className="border border-gray-400 p-2 text-left w-2/3">ITEM / विवरण</th>
                <th className="border border-gray-400 p-2 text-left w-1/3">AMOUNT / राशि</th>
              </tr>
            </thead>
            <tbody>
              <Row label="Fee per session / प्रति सेशन फीस" value={fee.feePerSession || "—"} />
              <Row label="Number of sessions / सेशन की संख्या" value={fee.numSessions ? `${fee.numSessions} sessions` : "—"} />
              <Row label="Coaching duration / कोचिंग की अवधि" value={fee.coachingDuration || "—"} />
              <Row label="Hand-holding support / हैंड-होल्डिंग सपोर्ट" value={fee.handHoldingSupport || "—"} />
              <Row label="Total program duration / कुल प्रोग्राम अवधि" value={fee.totalProgramDuration || "—"} />
              <Row label="Start date / प्रारंभ तिथि" value={fmtDate(fee.startDate)} />
              <Row label="End date / समाप्ति तिथि" value={fmtDate(fee.endDate)} />
              <Row label="Total fees (excl GST) / कुल फीस (GST रहित)" value={formatINR(fee.totalFeesExclGst)} />
              <Row label="GST @ 18% / जीएसटी @ 18%" value={formatINR(fee.gstAmount)} />
              <Row label="Total Investment / कुल निवेश" value={formatINR(fee.totalInvestment)} bold />
              <Row label="Payment plan / भुगतान योजना" value={fee.paymentPlan === "full" ? "Full Payment" : fee.paymentPlan === "installments" ? "Installments" : "—"} />
              {fee.paymentPlan === "installments" && (
                <Row label="Installment schedule / किस्त अनुसूची" value={fee.installmentSchedule || "—"} />
              )}
              <Row label="Mode of payment / भुगतान का तरीका" value={fee.modeOfPayment || "—"} />
              <Row label="Amount paid today / आज भुगतान की गई राशि" value={formatINR(fee.amountPaidToday)} />
              <Row label="Balance due / बकाया" value={formatINR(fee.balanceDue)} />
            </tbody>
          </table>
        )}

        <div className="mt-3 text-[9pt] text-gray-600 italic">
          GST invoice will be issued for every payment received. / हर भुगतान के लिए GST चालान जारी किया जाएगा।
        </div>
      </Page>

      {/* PAGE 7 — HOW WE WORK */}
      <Page n={7}>
        <Heading en={C.howWeWork.heading_en} hi={C.howWeWork.heading_hi} />
        <Bilingual en={C.howWeWork.intro_en} hi={C.howWeWork.intro_hi} />
        <table className="w-full border-collapse mt-3 text-[10pt]">
          <tbody>
            {C.howWeWork.rows.map((r, i) => (
              <tr key={i} className={i % 2 ? "bg-[#FFF8E7]/40" : ""}>
                <td className="border border-gray-300 p-2 w-1/2">◆ {r[0]}</td>
                <td className="border border-gray-300 p-2 w-1/2 italic text-gray-700">◆ {r[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Page>

      {/* PAGE 8 — RESPONSIBILITIES (closing of how-we-work) */}
      <Page n={8}>
        <Heading en="4. YOUR RESPONSIBILITIES" hi="4. आपकी ज़िम्मेदारियाँ" />
        <ul className="list-disc pl-5 space-y-2 text-[10pt]">
          <li>Show up prepared and on time for every session.</li>
          <li>Complete assignments and apply learnings between sessions.</li>
          <li>Submit a short monthly progress report so sessions stay relevant.</li>
          <li>Communicate openly — successes, blockers and doubts.</li>
          <li>Honour the agreed fee schedule and notice periods.</li>
        </ul>
        <div className="mt-6 p-3 bg-[#FFF8E7] border-l-4 border-[#D4A017]">
          <p className="font-semibold">{C.howWeWork.closing_en}</p>
          <p className="italic text-gray-700 mt-1">{C.howWeWork.closing_hi}</p>
        </div>
      </Page>

      {/* PAGE 9 — POLICIES (payments + attendance) */}
      <Page n={9}>
        <Heading en={C.policies.heading_en} hi={C.policies.heading_hi} />
        {C.policies.sections.slice(0, 2).map((s, i) => (
          <div key={i} className="mb-4">
            <h3 className="text-[11pt] font-bold text-[#8B0000]">◆ {s.title_en}</h3>
            <h4 className="text-[9pt] italic text-gray-600 mb-2">{s.title_hi}</h4>
            {s.items.map(([en, hi], j) => (
              <div key={j} className="text-[9.5pt] mb-2 pl-3 border-l-2 border-[#D4A017]/40">
                <p>◆ {en}</p>
                <p className="italic text-gray-600">◆ {hi}</p>
              </div>
            ))}
          </div>
        ))}
      </Page>

      {/* PAGE 10 — POLICIES (dispute + closing) */}
      <Page n={10}>
        {C.policies.sections.slice(2).map((s, i) => (
          <div key={i} className="mb-4">
            <h3 className="text-[11pt] font-bold text-[#8B0000]">◆ {s.title_en}</h3>
            <h4 className="text-[9pt] italic text-gray-600 mb-2">{s.title_hi}</h4>
            {s.items.map(([en, hi], j) => (
              <div key={j} className="text-[9.5pt] mb-2 pl-3 border-l-2 border-[#D4A017]/40">
                <p>◆ {en}</p>
                <p className="italic text-gray-600">◆ {hi}</p>
              </div>
            ))}
          </div>
        ))}

        <div className="mt-6 p-4 border-2 border-[#8B0000] rounded text-[10pt] bg-[#FFF8E7]/30">
          <p className="font-semibold">All terms above are jointly agreed by both parties as a basis for this 12-month engagement.</p>
          <p className="italic text-gray-700 mt-1">उपरोक्त सभी शर्तें दोनों पक्षों द्वारा संयुक्त रूप से स्वीकार की गई हैं।</p>
        </div>
      </Page>

      {/* PAGE 11 — B1.3 SIGNATURE */}
      <Page n={11}>
        <div className="text-center mb-4">
          <div className="inline-block bg-[#8B0000] text-white px-4 py-1 rounded text-[10pt] font-bold">B1.3</div>
        </div>
        <Heading en={C.beforeYouSign.heading_en} hi={C.beforeYouSign.heading_hi} />

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border border-gray-300 rounded p-3 bg-[#FFF8E7]/30">
            <div className="text-[10pt] font-bold text-[#8B0000] mb-2">🔒 WHAT'S PROTECTED</div>
            <ul className="list-disc pl-4 space-y-1 text-[9pt]">
              {C.beforeYouSign.protected.map((x, i) => <li key={i}>{x}</li>)}
            </ul>
          </div>
          <div className="border border-gray-300 rounded p-3 bg-[#FFF8E7]/30">
            <div className="text-[10pt] font-bold text-[#8B0000] mb-2">✦ WHAT YOU'RE GETTING</div>
            <ul className="list-disc pl-4 space-y-1 text-[9pt]">
              {C.beforeYouSign.getting.map((x, i) => <li key={i}>{x}</li>)}
            </ul>
          </div>
        </div>

        <Heading en="SIGNATURES / हस्ताक्षर" hi="" />
        <table className="w-full border border-gray-400 text-[10pt]">
          <tbody>
            <tr>
              <td className="border border-gray-400 p-3 w-1/2 align-top" style={{ minHeight: "40mm" }}>
                <div className="text-[9pt] text-gray-600 mb-1">[Participant] By / [प्रतिभागी] द्वारा</div>
                <div className="font-semibold mb-2">{client.fullName}</div>
                <div className="border-b border-gray-400 mb-1" style={{ height: "30mm", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {signatureImageUrls?.seeker ? (
                    <img src={signatureImageUrls.seeker} alt="Seeker signature" style={{ maxHeight: "28mm", maxWidth: "100%" }} />
                  ) : (
                    <span className="text-gray-400 text-[9pt] italic">Awaiting signature</span>
                  )}
                </div>
                <div className="text-[8pt] text-gray-600">
                  Signed: {seekerSignature?.signed_at ? fmtDate(seekerSignature.signed_at) : "—"}
                </div>
                {seekerSignature?.typed_name && (
                  <div className="text-[9pt] mt-1">Name: <b>{seekerSignature.typed_name}</b></div>
                )}
              </td>
              <td className="border border-gray-400 p-3 w-1/2 align-top">
                <div className="text-[9pt] text-gray-600 mb-1">[Coach] By / [कोच] द्वारा</div>
                <div className="font-semibold mb-2">Vivek Doba — for Vivek Doba Business Solutions</div>
                <div className="border-b border-gray-400 mb-1" style={{ height: "30mm", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {signatureImageUrls?.coach ? (
                    <img src={signatureImageUrls.coach} alt="Coach signature" style={{ maxHeight: "28mm", maxWidth: "100%" }} />
                  ) : (
                    <span className="text-gray-400 text-[9pt] italic">Awaiting signature</span>
                  )}
                </div>
                <div className="text-[8pt] text-gray-600">
                  Signed: {coachSignature?.signed_at ? fmtDate(coachSignature.signed_at) : "—"}
                </div>
                {coachSignature?.typed_name && (
                  <div className="text-[9pt] mt-1">Name: <b>{coachSignature.typed_name}</b></div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </Page>

      {/* PAGE 12 — CLOSING */}
      <Page n={12}>
        <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "240mm" }}>
          <div className="text-[10pt] tracking-[0.4em] text-[#8B0000] font-bold mb-12">{C.brand.company}</div>
          <div className="border-t-2 border-b-2 border-[#D4A017] py-8 px-10 mb-8 max-w-xl">
            <p className="text-[14pt] font-bold text-[#8B0000] mb-3">{C.closing.en}</p>
            <p className="text-[10pt] italic text-gray-700">{C.closing.hi}</p>
          </div>
          <p className="text-[12pt] mb-1">{C.closing.en2}</p>
          <p className="text-[10pt] italic text-gray-700 mb-12">{C.closing.hi2}</p>
          <p className="text-[10pt] text-[#8B0000] font-semibold">{C.closing.contact}</p>
        </div>
      </Page>
    </div>
  );
}

const Row = ({ label, value, bold }: { label: string; value: string | number; bold?: boolean }) => (
  <tr>
    <td className="border border-gray-300 p-2">{label}</td>
    <td className={`border border-gray-300 p-2 ${bold ? "font-bold text-[#8B0000] text-[11pt]" : ""}`}>{value}</td>
  </tr>
);
