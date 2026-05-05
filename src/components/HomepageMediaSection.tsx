import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { openExternal } from '@/lib/openExternal';
import { Youtube, Instagram, Facebook, Twitter, Linkedin, Link as LinkIcon, Play } from 'lucide-react';

type MediaRow = {
  id: string;
  title: string;
  platform: string;
  content_type: string;
  external_url: string;
  thumbnail_url: string | null;
  description: string | null;
};

const PLATFORM_META: Record<string, { label: string; Icon: typeof Youtube; chip: string }> = {
  youtube:   { label: 'YouTube',   Icon: Youtube,   chip: 'bg-red-600 text-white' },
  instagram: { label: 'Instagram', Icon: Instagram, chip: 'bg-pink-600 text-white' },
  facebook:  { label: 'Facebook',  Icon: Facebook,  chip: 'bg-blue-600 text-white' },
  x:         { label: 'X',         Icon: Twitter,   chip: 'bg-foreground text-background' },
  linkedin:  { label: 'LinkedIn',  Icon: Linkedin,  chip: 'bg-sky-700 text-white' },
  other:     { label: 'Link',      Icon: LinkIcon,  chip: 'bg-muted text-foreground' },
};

const HomepageMediaSection = () => {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['homepage-media-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_media')
        .select('id,title,platform,content_type,external_url,thumbnail_url,description')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(12);
      if (error) throw error;
      return data as MediaRow[];
    },
    staleTime: 60_000,
  });

  if (isLoading || items.length === 0) return null;

  return (
    <section className="bg-background py-16 sm:py-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-center">
          Featured Videos & Social Highlights
        </h2>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          Watch teachings, reels and stories across YouTube, Instagram, Facebook and more.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const meta = PLATFORM_META[item.platform] ?? PLATFORM_META.other;
            const Icon = meta.Icon;
            const isVideo = ['video', 'reel', 'short'].includes(item.content_type);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openExternal(item.external_url)}
                className="group text-left bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Open ${meta.label}: ${item.title}`}
              >
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Icon className="w-10 h-10" />
                    </div>
                  )}

                  {/* Platform badge */}
                  <span className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${meta.chip}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {meta.label}
                  </span>

                  {/* Type chip */}
                  <span className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide bg-background/85 text-foreground border border-border">
                    {item.content_type}
                  </span>

                  {/* Play overlay */}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-14 h-14 rounded-full bg-background/80 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Play className="w-6 h-6 text-foreground translate-x-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomepageMediaSection;
