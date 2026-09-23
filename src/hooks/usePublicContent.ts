import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Product = {
  id: string;
  name: string;
  slug: string | null;
  image_url: string | null;
  gallery_images: string[];
  short_description: string | null;
  long_description: string | null;
  price_inr: number | null;
  gst_included: boolean;
  stock_status: 'in_stock' | 'out_of_stock' | 'preorder';
  is_preorder: boolean;
  sort_order: number;
  is_published: boolean;
  description: string | null;
  category: string;
  price: number;
  is_active: boolean;
  display_order: number;
};
export type GalleryItem = {
  id: string; title: string; description: string | null; category: string; media_type: 'image' | 'video'; media_url: string; thumbnail_url: string | null; is_active: boolean; display_order: number;
  image_url: string | null; youtube_id: string | null; caption: string | null; event_name: string | null; program_slug: string | null; city: string | null; date: string | null; sort_order: number; is_published: boolean;
};
export type BlogPost = { id: string; title: string; slug: string; excerpt: string | null; content: string; cover_image_url: string | null; status: 'draft' | 'published'; published_at: string | null; created_at: string };
export type Post = { id: string; title: string; slug: string; excerpt: string; cover_image: string | null; body: string; category: 'Business Growth' | 'Leadership' | 'Mindset' | 'Health' | 'Family' | 'Sales'; tags: string[]; author: string; published_at: string | null; seo_title: string | null; seo_description: string | null; related_course_slug: string | null; is_published: boolean; created_at: string; updated_at: string };
export type Testimonial = { id: string; name: string; business: string | null; city: string | null; photo: string | null; quote: string | null; youtube_id: string | null; program_slug: string | null; rating: number | null; sort_order: number; is_published: boolean; created_at: string; updated_at: string };
export type ContentKind = 'products' | 'gallery_items' | 'blog_posts' | 'posts' | 'testimonials';

export function useProducts(includeInactive = false) {
  return useQuery({ queryKey: ['products', includeInactive], queryFn: async () => {
    let query = supabase.from('products').select('*').order('sort_order').order('name');
    if (!includeInactive) query = query.eq('is_published', true);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Product[];
  }});
}

export function useProduct(slug?: string) {
  return useQuery({ queryKey: ['product', slug], enabled: Boolean(slug), queryFn: async () => {
    const { data, error } = await supabase.from('products').select('*').eq('slug', slug || '').eq('is_published', true).maybeSingle();
    if (error) throw error;
    return data as Product | null;
  }});
}

export function useGallery(includeInactive = false) {
  return useQuery({ queryKey: ['gallery-items', includeInactive], queryFn: async () => {
    let query = supabase.from('gallery_items').select('*').order('sort_order').order('date', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
    if (!includeInactive) query = query.eq('is_published', true);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as GalleryItem[];
  }});
}

export function useProgramGallery(programSlug?: string, limit = 4) {
  return useQuery({ queryKey: ['gallery-items', 'program', programSlug, limit], enabled: Boolean(programSlug), queryFn: async () => {
    const { data, error } = await supabase.from('gallery_items').select('*').eq('is_published', true).eq('program_slug', programSlug || '').not('image_url', 'is', null).order('date', { ascending: false, nullsFirst: false }).order('sort_order').limit(limit);
    if (error) throw error;
    return (data || []) as GalleryItem[];
  }});
}

export function useBlogPosts(includeDrafts = false) {
  return useQuery({ queryKey: ['blog-posts', includeDrafts], queryFn: async () => {
    let query = supabase.from('blog_posts').select('*').order('published_at', { ascending: false, nullsFirst: false });
    if (!includeDrafts) query = query.eq('status', 'published');
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as BlogPost[];
  }});
}

export function useBlogPost(slug?: string) {
  return useQuery({ queryKey: ['blog-post', slug], enabled: Boolean(slug), queryFn: async () => {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug || '').single();
    if (error) throw error;
    return data as BlogPost;
  }});
}

export function usePosts(includeDrafts = false) {
  return useQuery({ queryKey: ['posts', includeDrafts], queryFn: async () => {
    let query = supabase.from('posts').select('*').order('published_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
    if (!includeDrafts) query = query.eq('is_published', true);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Post[];
  }});
}

export function usePost(slug?: string) {
  return useQuery({ queryKey: ['post', slug], enabled: Boolean(slug), retry: false, queryFn: async () => {
    const { data, error } = await supabase.from('posts').select('*').eq('slug', slug || '').eq('is_published', true).maybeSingle();
    if (error) throw error;
    return data as Post | null;
  }});
}

export function useTestimonials(includeDrafts = false) {
  return useQuery({ queryKey: ['testimonials', includeDrafts], queryFn: async () => {
    let query = supabase.from('testimonials').select('*').order('sort_order').order('created_at', { ascending: false });
    if (!includeDrafts) query = query.eq('is_published', true);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Testimonial[];
  }});
}

export function useProgramTestimonials(programSlug?: string) {
  return useQuery({ queryKey: ['testimonials', 'program', programSlug], enabled: Boolean(programSlug), queryFn: async () => {
    const { data, error } = await supabase.from('testimonials').select('*').eq('is_published', true).eq('program_slug', programSlug || '').order('sort_order').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Testimonial[];
  }});
}

export function useContentMutation(kind: ContentKind) {
  const client = useQueryClient();
  return useMutation({ mutationFn: async ({ id, values }: { id?: string; values: Record<string, unknown> }) => {
    const table = supabase.from(kind) as any;
    const query = id ? table.update(values).eq('id', id) : table.insert(values);
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
  }, onSuccess: () => client.invalidateQueries() });
}

export function useContentDelete(kind: ContentKind) {
  const client = useQueryClient();
  return useMutation({ mutationFn: async (id: string) => {
    const { error } = await supabase.from(kind).delete().eq('id', id);
    if (error) throw error;
  }, onSuccess: () => client.invalidateQueries() });
}