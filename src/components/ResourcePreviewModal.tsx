import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  type: string; // pdf | audio | video | worksheet | ...
  url?: string;
}

const ytId = (u: string) => {
  const m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m?.[1];
};
const vimeoId = (u: string) => {
  const m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m?.[1];
};
const isDriveLink = (u: string) => u.includes("drive.google.com");

export const ResourcePreviewModal = ({ open, onOpenChange, title, type, url }: Props) => {
  const [resolved, setResolved] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !url) return;
    setErr(null);
    setResolved(null);
    (async () => {
      try {
        if (url.startsWith("storage:resources/")) {
          setLoading(true);
          const path = url.replace("storage:resources/", "");
          const { data, error } = await supabase.storage.from("resources").createSignedUrl(path, 600);
          if (error || !data?.signedUrl) throw new Error("Could not load file");
          setResolved(data.signedUrl);
        } else {
          setResolved(url);
        }
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, url]);

  const openExt = () => resolved && window.open(resolved, "_blank", "noopener,noreferrer");

  const renderBody = () => {
    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
    if (err) return <p className="text-sm text-destructive">{err}</p>;
    if (!resolved) return <p className="text-sm text-muted-foreground">No URL available.</p>;

    if (type === "audio") {
      return <audio controls src={resolved} className="w-full" />;
    }
    if (type === "video") {
      const yid = ytId(resolved);
      if (yid) {
        return <iframe className="w-full aspect-video rounded-md" src={`https://www.youtube.com/embed/${yid}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
      }
      const vid = vimeoId(resolved);
      if (vid) {
        return <iframe className="w-full aspect-video rounded-md" src={`https://player.vimeo.com/video/${vid}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />;
      }
      return <video controls src={resolved} className="w-full rounded-md max-h-[70vh]" />;
    }
    if (type === "pdf" || type === "worksheet") {
      if (isDriveLink(resolved)) {
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Google Drive links cannot be embedded. Open in a new tab to view.</p>
            <Button onClick={openExt}><ExternalLink className="w-4 h-4 mr-2" /> Open in new tab</Button>
          </div>
        );
      }
      return <iframe src={resolved} className="w-full h-[70vh] rounded-md border border-border" title={title} />;
    }
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Preview not supported for this type.</p>
        <Button onClick={openExt}><ExternalLink className="w-4 h-4 mr-2" /> Open in new tab</Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3 pr-6">
            <span className="truncate">{title}</span>
            {resolved && (
              <Button variant="ghost" size="sm" onClick={openExt} className="flex-shrink-0">
                <ExternalLink className="w-4 h-4 mr-1" /> New tab
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        <div>{renderBody()}</div>
      </DialogContent>
    </Dialog>
  );
};
