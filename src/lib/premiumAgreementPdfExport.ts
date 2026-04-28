/**
 * Premium Coaching Agreement PDF export.
 * Renders the DOM element #premium-agreement-print into a multi-page A4 PDF.
 * Each <section data-page="N"> becomes one PDF page (preserves crisp text).
 */
export async function generatePremiumAgreementPdf(opts: {
  filename?: string;
}): Promise<{ blob: Blob; base64: string; filename: string }> {
  const filename = opts.filename || `Coaching-Agreement-${new Date().toISOString().slice(0, 10)}.pdf`;

  const root = document.getElementById("premium-agreement-print");
  if (!root) throw new Error("Premium agreement element #premium-agreement-print not found");

  const pages = Array.from(root.querySelectorAll<HTMLElement>("section[data-page]"));
  if (pages.length === 0) throw new Error("No pages found in agreement DOM");

  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pages.length; i++) {
    const node = pages[i];
    const canvas = await html2canvas(node, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      windowWidth: node.scrollWidth,
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    if (i > 0) pdf.addPage();
    // Fit image to A4 maintaining aspect ratio (anchored to top-left)
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    pdf.addImage(imgData, "JPEG", 0, 0, imgW, Math.min(imgH, pageH));
  }

  const blob = pdf.output("blob");
  const dataUri = pdf.output("datauristring");
  const base64 = dataUri.split(",")[1] ?? "";

  return { blob, base64, filename };
}
