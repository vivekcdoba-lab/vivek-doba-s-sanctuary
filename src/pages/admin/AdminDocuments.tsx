import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Trash2, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminDocuments = () => {
  const { toast } = useToast();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("agreement");
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
    setDocs(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleUpload = async () => {
    if (!title.trim() || !file) return;
    setUploading(true);
    try {
      // Determine next version: same title + category → bump latest version by 1
      const { data: prior } = await supabase
        .from("documents")
        .select("version")
        .eq("title", title.trim())
        .eq("category", category)
        .order("version", { ascending: false })
        .limit(1);
      const nextVersion = (prior?.[0]?.version ?? 0) + 1;

      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const safeName = file.name.replace(/[^a-z0-9.]/gi, "_");
      const path = `library/${today}/v${nextVersion}-${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage.from("documents").upload(path, file, { contentType: "application/pdf" });
      if (upErr) throw upErr;
      const { data: { user } } = await supabase.auth.getUser();
      const { data: prof } = await supabase.from("profiles").select("id").eq("user_id", user!.id).single();
      const { error: insErr } = await supabase.from("documents").insert({
        title: title.trim(),
        description: description.trim() || null,
        category,
        storage_path: path,
        uploaded_by: prof?.id,
        version: nextVersion,
      });
      if (insErr) throw insErr;
      toast({ title: `Document uploaded (v${nextVersion})`, description: `Saved on ${today}` });
      setOpen(false); setTitle(""); setDescription(""); setFile(null);
      load();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    await supabase.from("documents").update({ is_active: !is_active }).eq("id", id);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await supabase.from("documents").delete().eq("id", id);
    load();
  };
  const download = async (path: string) => {
    const { data } = await supabase.storage.from("documents").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agreement Document Library</h1>
          <p className="text-sm text-muted-foreground">Upload PDFs to send to seekers for digital signature</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Upload Document</Button>
      </div>

      {loading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.length === 0 && <Card className="p-8 col-span-full text-center text-muted-foreground">No documents yet. Upload one to get started.</Card>}
          {docs.map(d => (
            <Card key={d.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <FileText className="w-8 h-8 text-primary" />
                <Badge variant={d.is_active ? "default" : "secondary"}>{d.is_active ? "Active" : "Inactive"}</Badge>
              </div>
              <h3 className="font-semibold mt-3 text-foreground">{d.title}</h3>
              <p className="text-xs text-muted-foreground capitalize">
                {d.category} · v{d.version} · Uploaded {new Date(d.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              {d.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{d.description}</p>}
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => download(d.storage_path)}><Download className="w-3 h-3" /></Button>
                <Button size="sm" variant="outline" onClick={() => toggleActive(d.id, d.is_active)}>{d.is_active ? "Deactivate" : "Activate"}</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Coaching Agreement" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agreement">Agreement</SelectItem>
                  <SelectItem value="nda">NDA</SelectItem>
                  <SelectItem value="commitment">Commitment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div>
              <Label>PDF File *</Label>
              <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <Button onClick={handleUpload} disabled={!title.trim() || !file || uploading} className="w-full">
              {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading…</> : "Upload"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDocuments;
