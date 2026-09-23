import { useEffect, useState } from 'react';
import { GripVertical, ImageUp, Loader2, Pencil, Save, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAllDbCourses, useUpdateCourse, type DbCourse } from '@/hooks/useDbCourses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const textFields = [
  ['name','Course name'], ['slug','URL slug'], ['step','Step'], ['stage','Stage'], ['hook','Emotional hook'],
  ['outcome','Outcome'], ['duration','Duration'], ['format','Format'], ['mode','Mode'], ['seats','Seats'],
  ['next_date','Next date'], ['who_for','Who it is for'], ['price_note','Price note'], ['cta_label','Button label'],
  ['next_slug','Next course slug'], ['seo_title','SEO title'], ['seo_description','SEO description'],
] as const;
const listFields = [['not_for','Not for'],['before','Before'],['after','After'],['deliverables','Deliverables'],['seo_keywords','SEO keywords'],['video_ids','YouTube video IDs'],['gallery_image_urls','Gallery image URLs']] as const;
const jsonFields = [['benefits','Benefits: title | text | icon'],['method','Method: title | text'],['timeline','Timeline: when | what']] as const;
type Form = Record<string, unknown>;
const lines = (value: unknown) => Array.isArray(value) ? value.join('\n') : '';
const parseLines = (value: unknown) => String(value || '').split('\n').map(item => item.trim()).filter(Boolean);
const structured = (value: unknown, keys: string[]) => Array.isArray(value) ? value.map(item => keys.map(key => String((item as Record<string,string>)[key] || '')).join(' | ')).join('\n') : '';
const parseStructured = (value: unknown, keys: string[]) => parseLines(value).map(line => Object.fromEntries(keys.map((key,index) => [key, line.split('|')[index]?.trim() || ''])));

async function webp(file: File, ratio: number) {
  const image = await createImageBitmap(file);
  const maxWidth = Math.min(1600, image.width);
  const width = maxWidth;
  const height = Math.round(width / ratio);
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d'); if (!context) throw new Error('Image conversion failed');
  const sourceRatio = image.width / image.height;
  let sx = 0, sy = 0, sw = image.width, sh = image.height;
  if (sourceRatio > ratio) { sw = image.height * ratio; sx = (image.width - sw) / 2; }
  else { sh = image.width / ratio; sy = (image.height - sh) / 2; }
  context.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
  return new Promise<Blob>((resolve,reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image conversion failed')), 'image/webp', .86));
}

export default function CoursesPage() {
  const { data: courses = [], isLoading } = useAllDbCourses();
  const update = useUpdateCourse();
  const [editing, setEditing] = useState<DbCourse | null>(null);
  const [form, setForm] = useState<Form>({});
  const [uploading, setUploading] = useState(false);
  const [dragged, setDragged] = useState<string | null>(null);
  useEffect(() => { if (editing) setForm({ ...editing, ...Object.fromEntries(listFields.map(([key]) => [key, lines(editing[key])])), benefits: structured(editing.benefits,['title','text','icon']), method: structured(editing.method,['title','text']), timeline: structured(editing.timeline,['when','what']) }); }, [editing]);
  const set = (key: string, value: unknown) => setForm(previous => ({ ...previous, [key]: value }));

  const save = async () => {
    if (!editing || !String(form.name || '').trim() || !String(form.slug || '').trim()) return toast.error('Course name and URL slug are required');
    const payload: Record<string, unknown> = { ...form };
    listFields.forEach(([key]) => payload[key] = parseLines(form[key]));
    payload.benefits = parseStructured(form.benefits,['title','text','icon']); payload.method = parseStructured(form.method,['title','text']); payload.timeline = parseStructured(form.timeline,['when','what']);
    payload.price_inr = form.price_inr === '' ? null : Number(form.price_inr); delete payload.id; delete payload.created_at; delete payload.updated_at;
    try { await update.mutateAsync({ id: editing.id, ...payload }); toast.success('Course updated on the website'); setEditing(null); } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save course'); }
  };

  const uploadImages = async (file: File) => {
    if (!editing) return; setUploading(true);
    try {
      const slug = String(form.slug || editing.slug); const stamp = Date.now();
      const [hero, card] = await Promise.all([webp(file,16/9), webp(file,4/3)]);
      const upload = async (blob: Blob, kind: string) => {
        const path = `courses/${slug}-${kind}-${stamp}.webp`;
        const { error } = await supabase.storage.from('homepage-media').upload(path, blob, { contentType:'image/webp' }); if (error) throw error;
        return supabase.storage.from('homepage-media').getPublicUrl(path).data.publicUrl;
      };
      const [heroUrl,cardUrl] = await Promise.all([upload(hero,'hero'),upload(card,'card')]);
      setForm(previous => ({ ...previous, hero_image_url:heroUrl, card_image_url:cardUrl, generated_image:false })); toast.success('Hero and card images are ready');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Image upload failed'); } finally { setUploading(false); }
  };

  const reorder = async (targetId: string) => {
    if (!dragged || dragged === targetId) return;
    const ordered = [...courses]; const from = ordered.findIndex(course => course.id === dragged); const to = ordered.findIndex(course => course.id === targetId);
    const [moved] = ordered.splice(from,1); ordered.splice(to,0,moved); setDragged(null);
    try { await Promise.all(ordered.map((course,index) => update.mutateAsync({ id:course.id, sort_order:index }))); toast.success('Course order updated'); } catch { toast.error('Could not reorder courses'); }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold">Website Courses</h1><p className="text-sm text-muted-foreground">Edit, publish and reorder the courses shown on the public website.</p></div>
    <div className="space-y-3">{courses.map(course => <article key={course.id} draggable onDragStart={() => setDragged(course.id)} onDragOver={event => event.preventDefault()} onDrop={() => reorder(course.id)} className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
      <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" aria-hidden="true" />
      {course.card_image_url && <img src={course.card_image_url} alt="" className="h-16 w-20 rounded object-cover" />}
      <div className="min-w-0 flex-1"><h2 className="truncate font-bold">{course.name}</h2><p className="truncate text-sm text-muted-foreground">/{course.slug}</p></div>
      {course.generated_image && <span className="hidden items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs font-medium sm:flex"><Sparkles className="h-3 w-3" />AI image — replace with a real photo</span>}
      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${course.is_published ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{course.is_published ? 'Published' : 'Draft'}</span>
      <Button variant="outline" size="icon" aria-label={`Edit ${course.name}`} onClick={() => setEditing(course)}><Pencil className="h-4 w-4" /></Button>
    </article>)}</div>

    {editing && <div className="fixed inset-0 z-50 overflow-y-auto bg-foreground/50 p-4"><div className="mx-auto my-6 max-w-5xl rounded-lg border bg-background shadow-xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-5"><div><h2 className="text-xl font-bold">Edit {editing.name}</h2>{form.generated_image && <p className="mt-1 text-xs text-muted-foreground">AI image — replace with a real photo</p>}</div><Button variant="ghost" size="icon" aria-label="Close editor" onClick={() => setEditing(null)}><X /></Button></div>
      <div className="space-y-8 p-5">
        <section className="grid gap-4 md:grid-cols-2">{textFields.map(([key,label]) => <div key={key} className={key === 'outcome' || key === 'who_for' || key === 'seo_description' ? 'md:col-span-2' : ''}><Label htmlFor={key}>{label}</Label>{key === 'outcome' || key === 'who_for' || key === 'seo_description' ? <Textarea id={key} value={String(form[key] || '')} onChange={event => set(key,event.target.value)} /> : <Input id={key} value={String(form[key] || '')} onChange={event => set(key,event.target.value)} />}</div>)}</section>
        <section className="grid gap-4 md:grid-cols-3"><div><Label htmlFor="price">Price in INR</Label><Input id="price" type="number" min="0" value={String(form.price_inr ?? '')} onChange={event => set('price_inr',event.target.value)} /></div><div><Label htmlFor="cta">Button action</Label><select id="cta" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={String(form.cta_type || 'none')} onChange={event => set('cta_type',event.target.value)}>{['book','diagnostic','apply','enquiry','prebook','read','none'].map(value => <option key={value}>{value}</option>)}</select></div><div className="flex flex-wrap items-center gap-5 pt-6">{[['is_published','Published'],['is_side_program','Side program'],['price_from','Price from'],['gst_applies','GST applies'],['locked','Locked']].map(([key,label]) => <Label key={key} className="flex items-center gap-2"><Switch checked={Boolean(form[key])} onCheckedChange={value => set(key,value)} />{label}</Label>)}</div></section>
        <section><Label>Course images</Label><div className="mt-2 grid gap-4 md:grid-cols-2">{[['hero_image_url','Hero 16:9'],['card_image_url','Card 4:3']].map(([key,label]) => <div key={key}>{form[key] ? <img src={String(form[key])} alt={`${editing.name} ${label}`} className="aspect-video w-full rounded object-cover" /> : <div className="aspect-video rounded bg-muted" />}<Input className="mt-2" value={String(form[key] || '')} onChange={event => set(key,event.target.value)} aria-label={`${label} URL`} /></div>)}</div><Label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium"><ImageUp className="h-4 w-4" />{uploading ? 'Preparing images…' : 'Upload one photo for both crops'}<input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={event => { const file=event.target.files?.[0]; if(file) uploadImages(file); }} /></Label></section>
        <section className="grid gap-4 md:grid-cols-2">{listFields.map(([key,label]) => <div key={key}><Label htmlFor={key}>{label} — one per line</Label><Textarea id={key} rows={5} value={String(form[key] || '')} onChange={event => set(key,event.target.value)} /></div>)}</section>
        <section className="grid gap-4 md:grid-cols-3">{jsonFields.map(([key,label]) => <div key={key}><Label htmlFor={key}>{label}</Label><Textarea id={key} rows={8} value={String(form[key] || '')} onChange={event => set(key,event.target.value)} /></div>)}</section>
      </div>
      <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-background p-5"><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} disabled={update.isPending || uploading}><Save className="h-4 w-4" />{update.isPending ? 'Saving…' : 'Save changes'}</Button></div>
    </div></div>}
  </div>;
}