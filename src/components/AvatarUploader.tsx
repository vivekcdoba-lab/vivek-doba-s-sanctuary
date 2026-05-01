import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Props {
  /** profiles.id of the seeker/coach being edited */
  profileId: string | null;
  /** auth user id whose folder we'll upload into. Defaults to current user. */
  targetUserId?: string;
  /** Current avatar URL (if any) */
  avatarUrl?: string | null;
  /** Display name fallback for initials */
  fallbackName?: string;
  /** Called after successful update with the new public URL */
  onChange?: (url: string) => void;
  size?: number;
}

const MAX_DIM = 512;
const QUALITY = 0.85;

async function resizeToJpeg(file: File | Blob): Promise<Blob> {
  const bmp = await createImageBitmap(file as Blob);
  const ratio = Math.min(1, MAX_DIM / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * ratio);
  const h = Math.round(bmp.height * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bmp, 0, 0, w, h);
  return new Promise(resolve =>
    canvas.toBlob(b => resolve(b!), 'image/jpeg', QUALITY)
  );
}

function initials(name?: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

export default function AvatarUploader({
  profileId,
  targetUserId,
  avatarUrl,
  fallbackName,
  onChange,
  size = 96,
}: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [busy, setBusy] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl ?? null);

  useEffect(() => setPreview(avatarUrl ?? null), [avatarUrl]);

  useEffect(() => {
    if (!cameraOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (cancelled) { s.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
        }
      } catch (e: any) {
        toast.error('Camera unavailable: ' + (e?.message || 'permission denied'));
        setCameraOpen(false);
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [cameraOpen]);

  const upload = async (blob: Blob) => {
    if (!profileId) { toast.error('Profile not loaded'); return; }
    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const folder = targetUserId || userData?.user?.id;
      if (!folder) throw new Error('Not authenticated');
      const path = `${folder}/profile-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = pub.publicUrl;
      const { error: updErr } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', profileId);
      if (updErr) throw updErr;
      setPreview(url);
      onChange?.(url);
      toast.success('Profile picture updated');
    } catch (e: any) {
      toast.error(e?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!f.type.startsWith('image/')) { toast.error('Please pick an image'); return; }
    const blob = await resizeToJpeg(f);
    await upload(blob);
  };

  const capturePhoto = async () => {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement('canvas');
    const w = v.videoWidth, h = v.videoHeight;
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d')!.drawImage(v, 0, 0, w, h);
    const blob: Blob = await new Promise(r => canvas.toBlob(b => r(b!), 'image/jpeg', QUALITY));
    const resized = await resizeToJpeg(blob);
    setCameraOpen(false);
    await upload(resized);
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className="rounded-full overflow-hidden bg-muted ring-2 ring-primary/20 flex items-center justify-center text-foreground font-semibold"
        style={{ width: size, height: size, fontSize: size / 3 }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={fallbackName ?? 'Avatar'} className="w-full h-full object-cover" />
        ) : (
          <span>{initials(fallbackName)}</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        <div className="flex gap-2 flex-wrap">
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
            Upload
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => setCameraOpen(true)}>
            <Camera className="w-4 h-4 mr-1" /> Camera
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">JPG/PNG up to 20MB. Auto-resized.</p>
      </div>

      <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Take a photo</DialogTitle></DialogHeader>
          <div className="rounded-md overflow-hidden bg-black aspect-square">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCameraOpen(false)}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button onClick={capturePhoto} disabled={busy}>
              <Camera className="w-4 h-4 mr-1" /> Capture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
