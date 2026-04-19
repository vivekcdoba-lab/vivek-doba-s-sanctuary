import { useState, useRef, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser, Undo2, Check, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DigitalSignatureProps {
  sessionId: string;
  signerId: string;
  signerRole: 'seeker' | 'coach';
  signerName: string;
  contentToHash: string; // JSON string of session content for SHA-256
  existingSignature?: {
    storage_path: string;
    signed_at: string;
    content_hash: string;
    typed_name?: string;
  } | null;
  disabled?: boolean;
  onSigned?: (signature: { storage_path: string; content_hash: string; signed_at: string }) => void;
}

async function computeSHA256(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function fetchIP(): Promise<string | null> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch {
    return null;
  }
}

const DigitalSignature = ({
  sessionId,
  signerId,
  signerRole,
  signerName,
  contentToHash,
  existingSignature,
  disabled = false,
  onSigned,
}: DigitalSignatureProps) => {
  const canvasRef = useRef<SignatureCanvas>(null);
  const [typedName, setTypedName] = useState('');
  const [useTyped, setUseTyped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signed, setSigned] = useState(!!existingSignature);

  const clearCanvas = useCallback(() => {
    canvasRef.current?.clear();
  }, []);

  const undoStroke = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toData();
    if (data.length > 0) {
      data.pop();
      canvas.fromData(data);
    }
  }, []);

  const isCanvasEmpty = (): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    return canvas.isEmpty();
  };

  const handleSign = async () => {
    if (!useTyped && isCanvasEmpty()) {
      toast.error('Please draw your signature or type your name');
      return;
    }
    if (useTyped && !typedName.trim()) {
      toast.error('Please type your full name');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Get signature image
      let signatureBlob: Blob;
      if (useTyped) {
        // Create canvas with typed name
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 400;
        tempCanvas.height = 150;
        const ctx = tempCanvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 400, 150);
        ctx.font = 'italic 36px "Dancing Script", cursive, serif';
        ctx.fillStyle = '#1a1a2e';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName, 200, 75);
        signatureBlob = await new Promise<Blob>((resolve) => {
          tempCanvas.toBlob((blob) => resolve(blob!), 'image/png');
        });
      } else {
        const dataUrl = canvasRef.current!.getTrimmedCanvas().toDataURL('image/png');
        const res = await fetch(dataUrl);
        signatureBlob = await res.blob();
      }

      // Compute SHA-256 content hash
      const signedAt = new Date().toISOString();
      const hashInput = contentToHash + signedAt;
      const contentHash = await computeSHA256(hashInput);

      // Fetch IP
      const ipAddress = await fetchIP();

      // Upload to storage — path MUST start with signer's auth UID for RLS
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const storagePath = `${user.id}/${sessionId}-${signerRole}.png`;
      const { error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(storagePath, signatureBlob, {
          contentType: 'image/png',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Save to DB
      const { error: dbError } = await supabase
        .from('session_signatures')
        .upsert({
          session_id: sessionId,
          signer_id: signerId,
          signer_role: signerRole,
          storage_path: storagePath,
          typed_name: useTyped ? typedName : null,
          ip_address: ipAddress,
          user_agent: navigator.userAgent,
          content_hash: contentHash,
          signed_at: signedAt,
        }, { onConflict: 'session_id,signer_role' });

      if (dbError) throw dbError;

      setSigned(true);
      toast.success(`Session signed successfully by ${signerName}`);
      onSigned?.({ storage_path: storagePath, content_hash: contentHash, signed_at: signedAt });
    } catch (err: any) {
      console.error('Signature error:', err);
      setError('Signature failed to save. Please try again.');
      toast.error('Failed to save signature');
    } finally {
      setSaving(false);
    }
  };

  const verificationId = existingSignature?.content_hash
    ? existingSignature.content_hash.slice(-16).toUpperCase()
    : null;

  // Signed state - show locked panel
  if (signed || existingSignature) {
    return (
      <div className="p-4 rounded-xl border-2 border-green-500/30 bg-green-50/5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
              ✓ Signed by {signerName}
            </p>
            <p className="text-xs text-muted-foreground">
              {existingSignature?.signed_at
                ? new Date(existingSignature.signed_at).toLocaleString('en-IN')
                : 'Just now'}
            </p>
          </div>
        </div>
        {verificationId && (
          <p className="text-xs text-muted-foreground font-mono bg-muted/50 rounded px-2 py-1">
            Verification ID: {verificationId}
          </p>
        )}
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20">
        <p className="text-sm text-muted-foreground text-center">
          🔒 Awaiting {signerRole === 'coach' ? 'coach' : 'seeker'} signature
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-3">
      <p className="text-sm font-semibold text-foreground">
        {signerRole === 'seeker' ? '✍️ Seeker Signature' : '✍️ Coach Signature'}
      </p>

      {!useTyped ? (
        <div className="space-y-2">
          <div
            className="border-2 border-dashed border-border rounded-lg bg-background overflow-hidden touch-none"
            onTouchStart={(e) => e.stopPropagation()}
          >
            <SignatureCanvas
              ref={canvasRef}
              penColor="#1a1a2e"
              canvasProps={{
                width: 380,
                height: 150,
                className: 'w-full h-[150px]',
                style: { touchAction: 'none' },
              }}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={clearCanvas} className="px-3 py-1.5 rounded-lg text-xs bg-muted text-muted-foreground hover:bg-muted/80 flex items-center gap-1">
              <Eraser className="w-3 h-3" /> Clear
            </button>
            <button onClick={undoStroke} className="px-3 py-1.5 rounded-lg text-xs bg-muted text-muted-foreground hover:bg-muted/80 flex items-center gap-1">
              <Undo2 className="w-3 h-3" /> Undo
            </button>
          </div>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Type your full name"
            className="w-full px-3 py-3 rounded-lg border border-input bg-background text-center text-lg italic"
            style={{ fontFamily: '"Dancing Script", cursive, serif' }}
          />
        </div>
      )}

      <button
        onClick={() => setUseTyped(!useTyped)}
        className="text-xs text-primary hover:underline"
      >
        {useTyped ? 'Switch to draw signature' : 'Or type your full name'}
      </button>

      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-2">
          <AlertCircle className="w-3 h-3" /> {error}
          <button onClick={handleSign} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      <button
        onClick={handleSign}
        disabled={saving}
        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing...</> : <><Check className="w-4 h-4" /> Sign Session</>}
      </button>
    </div>
  );
};

export default DigitalSignature;
