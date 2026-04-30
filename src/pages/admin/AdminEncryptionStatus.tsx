import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, KeyRound, Clock, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { getEncryptionStatus } from '@/lib/encryption';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { formatDateDMY } from "@/lib/dateFormat";

interface RotationLogRow {
  id: string;
  rotated_at: string;
  from_version: string | null;
  to_version: string;
  trigger_source: string;
}

const AdminEncryptionStatus = () => {
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getEncryptionStatus>> | null>(null);
  const [history, setHistory] = useState<RotationLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, h] = await Promise.all([
          getEncryptionStatus(),
          supabase
            .from('key_rotation_log' as any)
            .select('id, rotated_at, from_version, to_version, trigger_source')
            .order('rotated_at', { ascending: false })
            .limit(12),
        ]);
        setStatus(s);
        setHistory(((h.data as any) ?? []) as RotationLogRow[]);
      } catch (e: any) {
        setErr(e.message ?? 'Failed to load encryption status');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" /> Encryption Status
        </h1>
        <p className="text-muted-foreground">AES-256-GCM field-level encryption with automatic 30-day key rotation</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : err ? (
        <Card><CardContent className="py-6 flex items-center gap-2 text-destructive">
          <AlertCircle className="w-4 h-4" /> {err}
        </CardContent></Card>
      ) : status ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" /> Current Key Version
              </CardTitle></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{status.current_version}</p>
                <p className="text-xs text-muted-foreground mt-1">{status.current_key_age_days} days old</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Next Rotation
              </CardTitle></CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-foreground">
                  {formatDateDMY(new Date(status.next_scheduled_rotation))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Automatic — 1st of every month, 03:00 UTC</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-primary" /> Total Versions
              </CardTitle></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{status.total_key_versions}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {status.last_rotation_at ? `Last rotated ${formatDateDMY(new Date(status.last_rotation_at))}` : 'No rotations yet'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> What's Encrypted
            </CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium text-foreground mb-1">👤 Personal Identity</p>
                  <p className="text-muted-foreground text-xs">DOB, gender, address, blood group, WhatsApp, LinkedIn, hometown, PAN, Aadhaar, emergency contact, marriage anniversary</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">💰 Financial</p>
                  <p className="text-muted-foreground text-xs">Payment amounts, transaction IDs, bank refs, GST, PAN, business revenue, accounting records, cashflow</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">🩺 Coaching Intake</p>
                  <p className="text-muted-foreground text-xs">Personal/medical/family history, relationship & children details</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">💬 Sensitive Communications</p>
                  <p className="text-muted-foreground text-xs">Internal messages, OTP codes (10-min TTL), reset tokens (hash only)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Rotation History</CardTitle></CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rotations yet — initial key v1 is in use.</p>
              ) : (
                <div className="space-y-2">
                  {history.map(r => (
                    <div key={r.id} className="flex items-center justify-between border border-border rounded-lg px-3 py-2">
                      <div className="text-sm">
                        <span className="font-mono">{r.from_version ?? '—'} → {r.to_version}</span>
                        <span className="text-muted-foreground ml-2">{format(new Date(r.rotated_at), 'dd MMM yyyy HH:mm')}</span>
                      </div>
                      <Badge variant={r.trigger_source === 'cron' ? 'default' : 'secondary'}>{r.trigger_source}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default AdminEncryptionStatus;
