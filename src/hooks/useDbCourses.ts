import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { allCourses, type Course } from '@/data/courses';
import type { Database } from '@/integrations/supabase/types';

export type DbCourse = Database['public']['Tables']['courses']['Row'];
export type CourseUpdate = Database['public']['Tables']['courses']['Update'];

const objects = <T,>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];

export function dbCourseToCourse(row: DbCourse): Course {
  const fallback = allCourses.find(course => course.slug === row.slug);
  return {
    ...(fallback || { journey: [], takeaways: [], videos: [] } as Partial<Course>),
    id: row.id, slug: row.slug || fallback?.slug || row.id, sortOrder: row.sort_order,
    isSideProgram: row.is_side_program, step: row.step, stage: row.stage || '', name: row.name,
    hook: row.hook || row.tagline || '', outcome: row.outcome || row.public_description || '',
    duration: row.duration || '', format: row.format || '', mode: row.mode || '', seats: row.seats || undefined,
    nextDate: row.next_date || undefined, forWhom: row.who_for || '', notFor: row.not_for,
    before: row.before, after: row.after,
    benefits: objects<Course['benefits'][number]>(row.benefits),
    method: objects<Course['method'][number]>(row.method),
    timeline: objects<Course['timeline'][number]>(row.timeline), deliverables: row.deliverables,
    priceINR: row.price_inr, priceFrom: row.price_from, gstApplies: row.gst_applies,
    priceNote: row.price_note || undefined, cta: row.cta_label || 'Learn more',
    ctaType: row.cta_type as Course['ctaType'], nextSlug: row.next_slug || undefined, locked: row.locked,
    heroImageUrl: row.hero_image_url || undefined, cardImageUrl: row.card_image_url || undefined,
    galleryImageUrls: row.gallery_image_urls, generatedImage: row.generated_image, isPublished: row.is_published,
    videos: row.video_ids.map(youtubeId => ({ youtubeId, name: 'Participant story' })),
    seo: { title: row.seo_title || row.name, description: row.seo_description || row.outcome || '', keywords: row.seo_keywords },
  } as Course;
}

export function usePublicCourses() {
  return useQuery({
    queryKey: ['public-courses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('courses').select('*').eq('is_published', true).not('slug', 'is', null).order('sort_order');
      if (error) throw error;
      return data.length ? data.map(dbCourseToCourse) : allCourses;
    },
    placeholderData: allCourses,
  });
}

export function useDbCourses() {
  return useQuery({ queryKey: ['db-courses'], queryFn: async () => {
    const { data, error } = await supabase.from('courses').select('*').eq('is_active', true).order('name');
    if (error) throw error;
    return data;
  }});
}

export function useAllDbCourses() {
  return useQuery({ queryKey: ['db-courses', 'all'], queryFn: async () => {
    const { data, error } = await supabase.from('courses').select('*').not('slug', 'is', null).order('sort_order');
    if (error) throw error;
    return data;
  }});
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['db-courses'] });
  queryClient.invalidateQueries({ queryKey: ['public-courses'] });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: async (course: Database['public']['Tables']['courses']['Insert']) => {
    const { data, error } = await supabase.from('courses').insert(course).select().single();
    if (error) throw error; return data;
  }, onSuccess: () => invalidate(queryClient) });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: async ({ id, ...updates }: { id: string } & CourseUpdate) => {
    const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().single();
    if (error) throw error; return data;
  }, onSuccess: () => invalidate(queryClient) });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: async (id: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', id); if (error) throw error;
  }, onSuccess: () => invalidate(queryClient) });
}