import { useMemo, useState } from 'react';
import { Edit2, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBlogPosts, useContentDelete, useContentMutation, useGallery, useProducts, type BlogPost, type ContentKind, type GalleryItem, type Product } from '@/hooks/usePublicContent';

type Mode = 'products' | 'gallery_items' | 'blog_posts';
const configs = {
  products: { title: 'Shop Products', singular: 'Product' },
  gallery_items: { title: 'Gallery', singular: 'Gallery Item' },
  blog_posts: { title: 'Blog Posts', singular: 'Blog Post' },
};

const emptyFor = (mode: Mode): Record<string, any> => mode === 'products'
  ? { name: '', description: '', category: 'book', image_url: '', price: '0', is_active: true, display_order: 0 }
  : mode === 'gallery_items'
    ? { title: '', description: '', category: 'Events', media_type: 'image', media_url: '', thumbnail_url: '', is_active: true, display_order: 0 }
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
  const [form, setForm] = useState<Record<string, any>>(() => emptyFor(mode));
  const config = configs[mode];
  const fields = useMemo(() => mode === 'products' ? ['name','description','category','image_url','price','display_order'] : mode === 'gallery_items' ? ['title','description','category','media_type','media_url','thumbnail_url','display_order'] : ['title','slug','excerpt','content','cover_image_url','status','published_at'], [mode]);
  const labels: Record<string, string> = { name: 'Name', title: 'Title', description: 'Description', category: 'Category', image_url: 'Image URL', price: 'Price (₹)', display_order: 'Display Order', media_type: 'Media Type', media_url: 'Media URL', thumbnail_url: 'Thumbnail URL', slug: 'URL Slug', excerpt: 'Excerpt', content: 'Article Content', cover_image_url: 'Cover Image URL', status: 'Status', published_at: 'Publish Date' };
  const startAdd = () => { setEditingId(undefined); setForm(emptyFor(mode)); setOpen(true); };
  const startEdit = (row: Product | GalleryItem | BlogPost) => { setEditingId(row.id); const copy = { ...row } as Record<string, any>; if (copy.published_at) copy.published_at = String(copy.published_at).slice(0, 10); setForm(copy); setOpen(true); };
  const save = async () => { try { const values = { ...form }; delete values.id; delete values.created_at; delete values.updated_at; if (mode === 'products') values.price = Number(values.price); if (mode === 'blog_posts') { values.slug = String(values.slug).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); values.published_at = values.status === 'published' ? (values.published_at ? new Date(`${values.published_at}T00:00:00`).toISOString() : new Date().toISOString()) : null; } await mutation.mutateAsync({ id: editingId, values }); toast.success(`${config.singular} saved`); setOpen(false); } catch (error: any) { toast.error(error.message || 'Could not save'); } };
  const destroy = async (id: string) => { if (!window.confirm(`Delete this ${config.singular.toLowerCase()}?`)) return; try { await remove.mutateAsync(id); toast.success(`${config.singular} deleted`); } catch (error: any) { toast.error(error.message || 'Could not delete'); } };
  const set = (key: string, value: any) => setForm(current => ({ ...current, [key]: value }));
  return <div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">{config.title}</h1><p className="text-sm text-muted-foreground">Add, edit, publish or remove website content.</p></div><Button onClick={startAdd}><Plus className="w-4 h-4 mr-2" />Add {config.singular}</Button></div>{loading ? <p className="text-muted-foreground">Loading…</p> : rows.length === 0 ? <div className="border border-dashed border-border p-10 text-center text-muted-foreground">No content added yet.</div> : <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{rows.map((row: any) => <article key={row.id} className="bg-card border border-border rounded-lg overflow-hidden">{(row.image_url || row.thumbnail_url || row.cover_image_url) && <img src={row.image_url || row.thumbnail_url || row.cover_image_url} alt="" className="w-full h-36 object-cover" />}<div className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{row.name || row.title}</h2><p className="text-xs text-muted-foreground mt-1">{row.category || row.status}</p></div><span className={`w-2.5 h-2.5 rounded-full mt-1 ${row.is_active === false || row.status === 'draft' ? 'bg-muted-foreground' : 'bg-[hsl(var(--dharma-green))]'}`} /></div><p className="text-sm text-muted-foreground line-clamp-2 mt-3">{row.description || row.excerpt || row.content}</p><div className="flex justify-end gap-2 mt-4"><Button size="sm" variant="outline" onClick={() => startEdit(row)}><Edit2 className="w-4 h-4 mr-1" />Edit</Button><Button size="sm" variant="destructive" onClick={() => destroy(row.id)}><Trash2 className="w-4 h-4" /></Button></div></div></article>)}</div>}
    {open && <div className="fixed inset-0 z-[70] bg-foreground/50 p-4 flex items-center justify-center" onClick={() => setOpen(false)}><div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}><div className="p-5 border-b border-border flex justify-between"><h2 className="text-xl font-bold">{editingId ? 'Edit' : 'Add'} {config.singular}</h2><Button size="icon" variant="ghost" onClick={() => setOpen(false)}><X /></Button></div><div className="p-5 space-y-4">{fields.map(field => <div key={field}><label className="text-sm font-medium">{labels[field]}</label>{field === 'description' || field === 'excerpt' || field === 'content' ? <Textarea rows={field === 'content' ? 9 : 3} value={form[field] || ''} onChange={e => set(field, e.target.value)} /> : field === 'category' && mode === 'gallery_items' ? <select className="w-full border border-input bg-background rounded-md px-3 py-2" value={form[field]} onChange={e => set(field, e.target.value)}>{['Events','Seminars','Workshops','Testimonials'].map(option => <option key={option}>{option}</option>)}</select> : field === 'media_type' ? <select className="w-full border border-input bg-background rounded-md px-3 py-2" value={form[field]} onChange={e => set(field, e.target.value)}><option value="image">Image</option><option value="video">Video</option></select> : field === 'status' ? <select className="w-full border border-input bg-background rounded-md px-3 py-2" value={form[field]} onChange={e => set(field, e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select> : <Input type={field === 'price' || field === 'display_order' ? 'number' : field === 'published_at' ? 'date' : 'text'} value={form[field] ?? ''} onChange={e => set(field, e.target.value)} />}</div>)}{mode !== 'blog_posts' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />Visible on website</label>}<Button className="w-full" disabled={mutation.isPending} onClick={save}>{mutation.isPending ? 'Saving…' : 'Save'}</Button></div></div></div>}
  </div>;
}