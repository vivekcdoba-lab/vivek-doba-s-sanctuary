import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { VISIBILITY_OPTIONS, ContentVisibility, visibilityLabel, visibilityBadgeClass } from '@/lib/contentVisibility';

interface Props {
  contentId: string;
  value: ContentVisibility | string | null | undefined;
  /** When true, render only the badge (no editor) */
  readOnly?: boolean;
}

export const VisibilityEditor = ({ contentId, value, readOnly }: Props) => {
  const queryClient = useQueryClient();
  const current = (value || 'all') as ContentVisibility;

  const mutation = useMutation({
    mutationFn: async (next: ContentVisibility) => {
      const { error } = await supabase
        .from('learning_content')
        .update({ visibility: next } as any)
        .eq('id', contentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-content'] });
      toast({ title: '✅ Access updated' });
    },
    onError: (e: any) => toast({ title: 'Update failed', description: e.message, variant: 'destructive' }),
  });

  if (readOnly) {
    return <Badge variant="outline" className={visibilityBadgeClass(current)}>{visibilityLabel(current)}</Badge>;
  }

  return (
    <Select value={current} onValueChange={(v: ContentVisibility) => mutation.mutate(v)} disabled={mutation.isPending}>
      <SelectTrigger className={`h-8 w-[150px] text-xs ${visibilityBadgeClass(current)}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {VISIBILITY_OPTIONS.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>
            <div className="flex flex-col">
              <span className="font-medium">{opt.label}</span>
              <span className="text-[10px] text-muted-foreground">{opt.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
