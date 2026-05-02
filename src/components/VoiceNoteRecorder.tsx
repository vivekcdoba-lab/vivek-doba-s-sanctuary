import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Trash2, Loader2, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VoiceNoteRecorderProps {
  sessionId: string;
  seekerProfileId: string;
  field: 'what_learned' | 'where_to_apply' | 'how_to_apply';
  existingPath?: string | null;
  disabled?: boolean;
  onChange: (path: string | null) => void;
}

const BUCKET = 'documents';

const VoiceNoteRecorder = ({
  sessionId,
  seekerProfileId,
  field,
  existingPath,
  disabled,
  onChange,
}: VoiceNoteRecorderProps) => {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Resolve a signed URL for the existing audio so the seeker (and coach) can play it back.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!existingPath) {
        setAudioUrl(null);
        return;
      }
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(existingPath, 60 * 60);
      if (!cancelled && data?.signedUrl) setAudioUrl(data.signedUrl);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [existingPath]);

  const startRecording = async () => {
    if (disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mime });
        await uploadBlob(blob);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch (err) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
  };

  const uploadBlob = async (blob: Blob) => {
    setUploading(true);
    try {
      const path = `session-reflections/${sessionId}/${seekerProfileId}-${field}.webm`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { upsert: true, contentType: blob.type });
      if (error) throw error;
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
      if (signed?.signedUrl) setAudioUrl(signed.signedUrl);
      onChange(path);
      toast.success('🎙️ Voice note saved');
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeRecording = async () => {
    if (!existingPath) {
      setAudioUrl(null);
      onChange(null);
      return;
    }
    try {
      await supabase.storage.from(BUCKET).remove([existingPath]);
      setAudioUrl(null);
      onChange(null);
      toast.success('Voice note removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-muted/30 p-2 border border-border/60">
      {!recording && !uploading && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={startRecording}
          disabled={disabled}
          className="gap-1.5"
        >
          <Mic className="w-4 h-4" /> {audioUrl ? 'Re-record' : 'Record voice'}
        </Button>
      )}
      {recording && (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={stopRecording}
          className="gap-1.5"
        >
          <Square className="w-4 h-4" /> Stop ({formatTime(elapsed)})
        </Button>
      )}
      {uploading && (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…
        </span>
      )}
      {audioUrl && !recording && !uploading && (
        <>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={togglePlay}
            className="gap-1.5"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {playing ? 'Pause' : 'Play'}
          </Button>
          <audio
            ref={audioRef}
            src={audioUrl}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            className="hidden"
          />
          {!disabled && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={removeRecording}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default VoiceNoteRecorder;
