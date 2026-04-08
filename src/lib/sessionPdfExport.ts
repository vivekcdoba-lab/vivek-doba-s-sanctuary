import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

interface SessionPdfData {
  sessionNumber: number;
  date: string;
  duration: string;
  seekerName: string;
  coachName: string;
  courseName: string;
  topics: string[];
  notes: string;
  insights: string;
  breakthroughs: string;
  seekerSignature?: {
    storage_path: string;
    signed_at: string;
    content_hash: string;
    typed_name?: string;
  };
  coachSignature?: {
    storage_path: string;
    signed_at: string;
    content_hash: string;
    typed_name?: string;
  };
}

async function getSignatureImage(storagePath: string): Promise<string | null> {
  try {
    const { data } = supabase.storage.from('signatures').getPublicUrl(storagePath);
    return data.publicUrl;
  } catch {
    return null;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function exportSessionPdf(data: SessionPdfData): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header
  pdf.setFillColor(26, 26, 46);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('LGT Coaching', margin, 15);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Certified Session Record', margin, 23);
  pdf.setFontSize(9);
  pdf.text(`Session #${data.sessionNumber} · ${data.date}`, margin, 30);

  y = 45;
  pdf.setTextColor(0, 0, 0);

  // Session Details
  pdf.setFillColor(245, 245, 250);
  pdf.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Seeker:', margin + 4, y + 7);
  pdf.text('Coach:', margin + 4, y + 14);
  pdf.text('Duration:', margin + 4, y + 21);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.seekerName, margin + 30, y + 7);
  pdf.text(data.coachName, margin + 30, y + 14);
  pdf.text(data.duration, margin + 30, y + 21);

  pdf.text('Course:', margin + contentWidth / 2, y + 7);
  pdf.text(data.courseName, margin + contentWidth / 2 + 25, y + 7);

  if (data.topics.length > 0) {
    pdf.text('Topics:', margin + contentWidth / 2, y + 14);
    pdf.text(data.topics.join(', '), margin + contentWidth / 2 + 25, y + 14);
  }

  y += 32;

  // Section helper
  const addSection = (title: string, content: string, emoji: string) => {
    if (!content?.trim()) return;

    if (y > 260) {
      pdf.addPage();
      y = margin;
    }

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(99, 102, 241);
    pdf.text(`${emoji} ${title}`, margin, y);
    y += 6;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    const lines = pdf.splitTextToSize(content, contentWidth);
    pdf.text(lines, margin, y);
    y += lines.length * 4.5 + 8;
  };

  addSection('Session Notes', data.notes, '📝');
  addSection('Key Insights', data.insights, '💡');
  addSection('Breakthroughs', data.breakthroughs, '🌟');

  // Signatures
  if (data.seekerSignature || data.coachSignature) {
    if (y > 220) {
      pdf.addPage();
      y = margin;
    }

    pdf.setDrawColor(200, 200, 220);
    pdf.line(margin, y, margin + contentWidth, y);
    y += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(99, 102, 241);
    pdf.text('✍️ Digital Signatures', margin, y);
    y += 8;

    const sigWidth = contentWidth / 2 - 5;

    // Seeker signature
    if (data.seekerSignature) {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Seeker Signature', margin, y);
      y += 3;

      try {
        const imgUrl = await getSignatureImage(data.seekerSignature.storage_path);
        if (imgUrl) {
          const img = await loadImage(imgUrl);
          pdf.addImage(img, 'PNG', margin, y, sigWidth, 30);
        }
      } catch {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'italic');
        pdf.text(data.seekerSignature.typed_name || data.seekerName, margin + 5, y + 18);
      }

      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.seekerName, margin, y + 34);
      pdf.text(new Date(data.seekerSignature.signed_at).toLocaleString('en-IN'), margin, y + 38);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`ID: ${data.seekerSignature.content_hash.slice(-16).toUpperCase()}`, margin, y + 42);
    }

    // Coach signature
    if (data.coachSignature) {
      const cx = margin + sigWidth + 10;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Coach Signature', cx, y - 3);

      try {
        const imgUrl = await getSignatureImage(data.coachSignature.storage_path);
        if (imgUrl) {
          const img = await loadImage(imgUrl);
          pdf.addImage(img, 'PNG', cx, y, sigWidth, 30);
        }
      } catch {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'italic');
        pdf.text(data.coachSignature.typed_name || data.coachName, cx + 5, y + 18);
      }

      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(data.coachName, cx, y + 34);
      pdf.text(new Date(data.coachSignature.signed_at).toLocaleString('en-IN'), cx, y + 38);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`ID: ${data.coachSignature.content_hash.slice(-16).toUpperCase()}`, cx, y + 42);
    }

    y += 50;
  }

  // Footer
  if (y > 270) {
    pdf.addPage();
    y = margin;
  }
  pdf.setDrawColor(200, 200, 220);
  pdf.line(margin, y, margin + contentWidth, y);
  y += 6;
  pdf.setFontSize(7);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    'This document was digitally signed and certified via LGT Coaching Platform.',
    margin, y
  );
  pdf.text(
    'Verification IDs are tamper-evident SHA-256 content hashes.',
    margin, y + 4
  );

  // Save
  const filename = `LGT_${data.seekerName.replace(/\s+/g, '_')}_Session${data.sessionNumber}_${data.date}.pdf`;
  pdf.save(filename);
}
