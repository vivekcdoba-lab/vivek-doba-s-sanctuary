/**
 * Captures the LGT report DOM (id="lgt-report-print") and produces an A4 PDF.
 *
 * Heavy deps (jspdf, html2canvas) are loaded dynamically so they are NOT in
 * the initial app bundle — they only download when a user actually generates
 * a PDF.
 *
 * Returns:
 *   - blob: the PDF Blob (for download)
 *   - base64: base64-encoded PDF (for sending as email attachment via edge function)
 */
export async function generateLgtReportPdf(opts: {
  elementId?: string;
  filename?: string;
}): Promise<{ blob: Blob; base64: string; filename: string }> {
  const elementId = opts.elementId || 'lgt-report-print';
  const filename = opts.filename || `LGT-Report-${new Date().toISOString().slice(0, 10)}.pdf`;

  const node = document.getElementById(elementId);
  if (!node) throw new Error(`LGT report element #${elementId} not found in DOM`);

  // Dynamic imports — keep these out of the main bundle
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  // Render the DOM node at 2x for crisp output
  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    windowWidth: node.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Fit the captured canvas width to the A4 page width and slice across pages.
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;
  let heightLeft = imgH;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position = heightLeft - imgH;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
    heightLeft -= pageH;
  }

  const blob = pdf.output('blob') as Blob;
  const dataUri = pdf.output('datauristring') as string;
  const base64 = dataUri.split(',')[1] || '';

  return { blob, base64, filename };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
