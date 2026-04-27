import { supabase } from '@/integrations/supabase/client';
import { generateLgtReportPdf } from './lgtPdfExport';

/**
 * Waits for the hidden LGT report element to mount, then captures it as a
 * PDF and emails it to the seeker + all admins via the `send-lgt-report`
 * Edge Function. Also stamps `last_emailed_at` on the lgt_applications row.
 *
 * Caller must have already mounted <LgtReport /> off-screen (id="lgt-report-print").
 */
export async function captureAndEmailLgtReport(opts: {
  seekerId: string;
  seekerName?: string | null;
  applicationId?: string | null;
  publicMode?: boolean;
  inviteToken?: string;
  delayMs?: number;
}): Promise<{ success: boolean; recipients?: string[]; error?: string }> {
  const { seekerId, seekerName, applicationId, publicMode, inviteToken, delayMs = 600 } = opts;
  // Give the hidden node + recharts a moment to render
  await new Promise(r => setTimeout(r, delayMs));

  const safeName = (seekerName || 'Seeker').replace(/\s+/g, '_');
  const { base64, filename } = await generateLgtReportPdf({
    filename: `LGT-Report-${safeName}.pdf`,
  });

  const { data, error } = await supabase.functions.invoke('send-lgt-report', {
    body: {
      seekerId,
      pdfBase64: base64,
      filename,
      publicMode: !!publicMode,
      inviteToken,
    },
  });
  if (error) return { success: false, error: error.message };
  const r = data as any;
  if (r && r.success === false) return { success: false, error: r.error || r.warning, recipients: r.recipients };

  // Best-effort: stamp last_emailed_at
  try {
    if (applicationId) {
      await supabase.from('lgt_applications')
        .update({ last_emailed_at: new Date().toISOString() })
        .eq('id', applicationId);
    } else {
      await supabase.from('lgt_applications')
        .update({ last_emailed_at: new Date().toISOString() })
        .eq('seeker_id', seekerId);
    }
  } catch { /* non-fatal */ }

  return { success: true, recipients: r?.recipients };
}
