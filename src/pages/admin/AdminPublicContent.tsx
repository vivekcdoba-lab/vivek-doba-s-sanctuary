import { useMemo, useState } from 'react';
import { Edit2, Plus, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBlogPosts, useContentDelete, useContentMutation, useGallery, useProducts, type BlogPost, type ContentKind, type GalleryItem, type Product } from '@/hooks/usePublicContent';
import { supabase } from '@/integrations/supabase/client';

async function toWebp(file: File) {
  const image = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / image.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image processing is unavailable');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image conversion failed')), 'image/webp', .86));
}

type Mode = 'products' | 'gallery_items' | 'blog_posts';
const configs = {
  products: { title: 'Shop Products', singular: 'Product' },
  gallery_items: { title: 'Gallery', singular: 'Gallery Item' },
  blog_posts: { title: 'Blog Posts', singular: 'Blog Post' },
};

const emptyFor = (mode: Mode): Record<string, any> => mode === 'products'
  ? { name: '', slug: '', image_url: '', gallery_images: '', short_description: '', long_description: '', price_inr: '0', gst_included: false, stock_status: 'in_stock', is_preorder: false, sort_order: 0, is_published: false, description: '', category: 'book', price: '0', is_active: false, display_order: 0 }
  : mode === 'gallery_items'
    ? { title: '', image_url: '', youtube_id: '', caption: '', event_name: '', program_slug: '', city: 'Pune', date: '', category: 'Events', sort_order: 0, is_published: false, media_type: 'image', media_url: '', thumbnail_url: '', is_active: false, display_order: 0 }
    : { title: '', slug: '', excerpt: '', content: '', cover_image_url: '', status: 'draft', published_at: '' };

export default function AdminPublicContent({ mode }: { mode: Mode }) {
  const products = useProducts(true);
  const gallery = useGallery(true);
  const blog = useBlogPosts(true);
  const rows = (mode === 'products' ? products.data : mode === 'gallery_items' ? gallery.data : blog.data) || [];
  const loading = mode === 'products' ? products.isLoading : mode === 'gallery_items' ? gallery.isLoading : blog.isLoading;
  const mutation = useContentMutation(mode as ContentKind);
  const remove = useContentDelete(mode as ContentKind);
  const [editingId, setEditingId] = useState<string>();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<Record<string, any>>(() => emptyFor(mode));
  const config = configs[mode];
  const fields = useMemo(() => mode === 'products' ? ['name','slug','image_url','gallery_images','short_description','long_description','price_inr','stock_status','sort_order'] : mode === 'gallery_items' ? ['image_url','youtube_id','caption','event_name','program_slug','city','date','category','sort_order'] : ['title','slug','excerpt','content','cover_image_url','status','published_at'], [mode]);
  const labels: Record<string, string> = { name: 'Name', title: 'Title', description: 'Description', short_description: 'Short Description', long_description: 'Long Description', category: 'Category', image_url: 'Main Image URL', gallery_images: 'Gallery Image URLs (one per line)', youtube_id: 'YouTube ID', caption: 'Caption', event_name: 'Event Name', program_slug: 'Program', city: 'City', date: 'Date', price: 'Price (₹)', price_inr: 'Price (₹)', display_order: 'Display Order', sort_order: 'Sort Order', stock_status: 'Stock Status', media_type: 'Media Type', media_url: 'Media URL', thumbnail_url: 'Thumbnail URL', slug: 'URL Slug', excerpt: 'Excerpt', content: 'Article Content', cover_image_url: 'Cover Image URL', status: 'Status', published_at: 'Publish Date' };
  const startAdd = () => { setEditingId(undefined); setForm(emptyFor(mode)); setOpen(true); };
  const startEdit = (row: Product | GalleryItem | BlogPost) => { setEditingId(row.id); const copy = { ...row } as Record<string, any>; if (copy.published_at) copy.published_at = String(copy.published_at).slice(0, 10); if (Array.isArray(copy.gallery_images)) copy.gallery_images = copy.gallery_images.join('\n'); setForm(copy); setOpen(true); };
  const save = async () => { try { const values = { ...form }; delete values.id; delete values.created_at; delete values.updated_at; if (mode === 'products') { values.slug = String(values.slug || values.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); values.price_inr = Number(values.price_inr); values.sort_order = Number(values.sort_order); values.gallery_images = String(values.gallery_images || '').split('\n').map((url: string) => url.trim()).filter(Boolean); values.price = values.price_inr; values.display_order = values.sort_order; values.description = values.long_description; values.is_active = values.is_published; } if (mode === 'gallery_items') { values.title = values.caption || values.event_name || 'Gallery photo'; values.description = values.caption || null; values.sort_order = Number(values.sort_order); values.display_order = values.sort_order; values.media_type = values.youtube_id ? 'video' : 'image'; values.media_url = values.youtube_id || values.image_url; values.thumbnail_url = values.image_url || null; values.is_active = values.is_published; } if (mode === 'blog_posts') { values.slug = String(values.slug).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); values.published_at = values.status === 'published' ? (values.published_at ? new Date(`${values.published_at}T00:00:00`).toISOString() : new Date().toISOString()) : null; } await mutation.mutateAsync({ id: editingId, values }); toast.success(`${config.singular} saved`); setOpen(false); } catch (error: any) { toast.error(error.message || 'Could not save'); } };
  const destroy = async (id: string) => { if (!window.confirm(`Delete this ${config.singular.toLowerCase()}?`)) return; try { await remove.mutateAsync(id); toast.success(`${config.singular} deleted`); } catch (error: any) { toast.error(error.message || 'Could not delete'); } };
  const set = (key: string, value: any) => setForm(current => ({ ...current, [key]: value }));
  const uploadImage = async (field: string, file?: File) => {
    if (!file) return;
    setUploading(true);
    const folder = mode === 'products' ? 'products' : mode === 'gallery_items' ? 'gallery' : 'blog';
    const blob = await toWebp(file);
    const path = `${folder}/${crypto.randomUUID()}.webp`;
    const { error } = await supabase.storage.from('homepage-media').upload(path, blob, { upsert: false, contentType: 'image/webp' });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from('homepage-media').getPublicUrl(path);
    set(field, data.publicUrl);
    setUploading(false);
    toast.success('Image uploaded');
  };
  const uploadGalleryImages = async (files?: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const [index, file] of Array.from(files).entries()) {
        const blob = await toWebp(file);
        const path = `gallery/${crypto.randomUUID()}.webp`;
        const { error } = await supabase.storage.from('homepage-media').upload(path, blob, { contentType: 'image/webp' });
        if (error) throw error;
        const { data } = supabase.storage.from('homepage-media').getPublicUrl(path);
        const caption = form.caption || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
        await mutation.mutateAsync({ values: { ...form, title: caption, description: caption, image_url: data.publicUrl, media_url: data.publicUrl, thumbnail_url: data.publicUrl, media_type: 'image', youtube_id: null, caption, sort_order: Number(form.sort_order) + index, display_order: Number(form.sort_order) + index, is_active: Boolean(form.is_published) } });
      }
      toast.success(`${files.length} photo${files.length === 1 ? '' : 's'} uploaded`);
      setOpen(false);
    } catch (error: any) { toast.error(error.message || 'Could not upload photos'); }
    finally { setUploading(false); }
  };
  return <div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">{config.title}</h1><p className="text-sm text-muted-foreground">Add, edit, publish or remove website content.</p></div><Button onClick={startAdd}><Plus className="w-4 h-4 mr-2" />Add {config.singular}</Button></div>{loading ? <p className="text-muted-foreground">Loading…</p> : rows.length === 0 ? <div className="border border-dashed border-border p-10 text-center text-muted-foreground">No content added yet.</div> : <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{rows.map((row: any) => <article key={row.id} className="bg-card border border-border rounded-lg overflow-hidden">{(row.image_url || row.thumbnail_url || row.cover_image_url) && <img src={row.image_url || row.thumbnail_url || row.cover_image_url} alt="" className="w-full h-36 object-cover" />}<div className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{row.name || row.title}</h2><p className="text-xs text-muted-foreground mt-1">{row.category || row.status}</p></div><span className={`w-2.5 h-2.5 rounded-full mt-1 ${row.is_active === false || row.status === 'draft' ? 'bg-muted-foreground' : 'bg-[hsl(var(--dharma-green))]'}`} /></div><p className="text-sm text-muted-foreground line-clamp-2 mt-3">{row.description || row.excerpt || row.content}</p><div className="flex justify-end gap-2 mt-4"><Button size="sm" variant="outline" onClick={() => startEdit(row)}><Edit2 className="w-4 h-4 mr-1" />Edit</Button><Button size="sm" variant="destructive" onClick={() => destroy(row.id)}><Trash2 className="w-4 h-4" /></Button></div></div></article>)}</div>}
    {open && <div className="fixed inset-0 z-[70] bg-foreground/50 p-4 flex items-center justify-center" onClick={() => setOpen(false)}><div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}><div className="p-5 border-b border-border flex justify-between"><h2 className="text-xl font-bold">{editingId ? 'Edit' : 'Add'} {config.singular}</h2><Button size="icon" variant="ghost" onClick={() => setOpen(false)}><X /></Button></div><div className="p-5 space-y-4">{mode === 'gallery_items' && !editingId && <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-primary/50 p-5 font-semibold text-primary"><input className="sr-only" type="file" accept="image/*" multiple onChange={event => uploadGalleryImages(event.target.files)} /><Upload className="h-5 w-5" />{uploading ? 'Uploading photos…' : 'Upload multiple photos'}</label>}{fields.map(field => <div key={field}><label className="text-sm font-medium">{labels[field]}</label>{['description','short_description','long_description','gallery_images','caption','excerpt','content'].includes(field) ? <Textarea rows={field === 'content' || field === 'long_description' ? 7 : 3} value={form[field] || ''} onChange={e => set(field, e.target.value)} /> : field === 'stock_status' ? <select className="w-full border border-input bg-background rounded-md px-3 py-2" value={form[field]} onChange={e => set(field, e.target.value)}><option value="in_stock">In stock</option><option value="out_of_stock">Out of stock</option><option value="preorder">Pre-order</option></select> : field === 'program_slug' ? <select className="w-full border border-input bg-background rounded-md px-3 py-2" value={form[field]} onChange={e => set(field, e.target.value)}><option value="">No program</option><option value="loa">LOA through Ramayana</option><option value="udyog-sanjivani">Udyog Sanjivani</option><option value="lgt">Life’s Golden Triangle™</option></select> : field === 'category' && mode === 'gallery_items' ? <select className="w-full border border-input bg-background rounded-md px-3 py-2" value={form[field]} onChange={e => set(field, e.target.value)}>{['Corporate','Events','Workshops'].map(option => <option key={option}>{option}</option>)}</select> : field === 'status' ? <select className="w-full border border-input bg-background rounded-md px-3 py-2" value={form[field]} onChange={e => set(field, e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select> : <><Input type={['price','price_inr','display_order','sort_order'].includes(field) ? 'number' : ['published_at','date'].includes(field) ? 'date' : 'text'} value={form[field] ?? ''} onChange={e => set(field, e.target.value)} />{['image_url','thumbnail_url','cover_image_url'].includes(field) && <label className="inline-flex mt-2"><input className="sr-only" type="file" accept="image/*" onChange={e => uploadImage(field, e.target.files?.[0])} /><span className="inline-flex items-center text-xs font-medium text-primary cursor-pointer"><Upload className="w-3.5 h-3.5 mr-1" />{uploading ? 'Uploading…' : 'Upload image'}</span></label>}</>}</div>)}{mode === 'products' ? <div className="space-y-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form.gst_included)} onChange={e => set('gst_included', e.target.checked)} />Price includes all taxes</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form.is_preorder)} onChange={e => set('is_preorder', e.target.checked)} />Pre-order</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form.is_published)} onChange={e => set('is_published', e.target.checked)} />Published</label></div> : mode === 'gallery_items' ? <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form.is_published)} onChange={e => set('is_published', e.target.checked)} />Published</label> : mode !== 'blog_posts' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />Visible on website</label>}<Button className="w-full" disabled={mutation.isPending || uploading} onClick={save}>{mutation.isPending ? 'Saving…' : 'Save'}</Button></div></div></div>}
  </div>;
}