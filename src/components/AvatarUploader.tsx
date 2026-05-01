import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, Loader2, X, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
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
  /** When true, hide the side Upload/Camera buttons — clicking the avatar opens a chooser dialog */
  compact?: boolean;
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
  compact = false,
}: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [busy, setBusy] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [chooserOpen, setChooserOpen] = useState(false);
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

  const openChooser = () => {
    if (busy) return;
    setChooserOpen(true);
  };
  const pickUpload = () => { setChooserOpen(false); fileRef.current?.click(); };
  const pickCamera = () => { setChooserOpen(false); setCameraOpen(true); };

  const badgeSize = Math.max(28, Math.round(size / 3.5));
  const iconSize = Math.max(14, Math.round(size / 7));

  return (
    <div className="flex items-center gap-4">
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />

      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <button
          type="button"
          onClick={openChooser}
          disabled={busy}
          aria-label="Edit profile picture"
          title="Click to update profile picture"
          className="rounded-full overflow-hidden bg-muted ring-2 ring-primary/20 hover:ring-primary/50 transition flex items-center justify-center text-foreground font-semibold w-full h-full focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed relative"
          style={{ fontSize: size / 3 }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={fallbackName ?? 'Avatar'} className="w-full h-full object-cover" />
          ) : (
            <span>{initials(fallbackName)}</span>
          )}
          {busy && (
            <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={openChooser}
          disabled={busy}
          aria-label="Edit profile picture"
          title="Edit"
          className="absolute -bottom-1 -right-1 rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-background flex items-center justify-center hover:scale-105 transition disabled:opacity-60"
          style={{ width: badgeSize, height: badgeSize }}
        >
          <Pencil style={{ width: iconSize, height: iconSize }} />
        </button>
      </div>

      {/* Side Upload/Camera buttons removed — pencil edit badge on the avatar opens the chooser dialog */}

      {/* Chooser dialog: Upload or Camera */}
      <Dialog open={chooserOpen} onOpenChange={setChooserOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update profile picture</DialogTitle>
            <DialogDescription>Choose how you want to set a new picture.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <Button type="button" variant="outline" className="h-24 flex-col gap-2" onClick={pickUpload}>
              <Upload className="w-6 h-6" />
              <span>Upload</span>
            </Button>
            <Button type="button" variant="outline" className="h-24 flex-col gap-2" onClick={pickCamera}>
              <Camera className="w-6 h-6" />
              <span>Camera</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">JPG/PNG up to 20MB. Auto-resized to 512px.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setChooserOpen(false)}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Camera dialog */}
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
