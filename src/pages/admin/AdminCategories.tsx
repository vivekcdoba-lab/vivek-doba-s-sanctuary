import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderOpen } from 'lucide-react';

const AdminCategories = () => {
  const { data: content = [], isLoading } = useQuery({ queryKey: ['learning-content-all'], queryFn: async () => { const { data, error } = await supabase.from('learning_content').select('category, type, is_active'); if (error) throw error; return data; } });

  const categories = useMemo(() => {
    const map: Record<string, { total: number; active: number; types: Set<string> }> = {};
    content.forEach(c => { const cat = c.category || 'Uncategorized'; if (!map[cat]) map[cat] = { total: 0, active: 0, types: new Set() }; map[cat].total++; if (c.is_active) map[cat].active++; map[cat].types.add(c.type); });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [content]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">📁 Content Categories</h1><p className="text-muted-foreground">Overview of learning content categories</p></div>
      {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> :
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(([name, info]) => (
          <Card key={name}>
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><FolderOpen className="w-4 h-4 text-primary" />{name}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl font-bold">{info.total}</span><span className="text-sm text-muted-foreground">resources</span></div>
              <div className="flex items-center gap-2"><Badge variant="default">{info.active} active</Badge>{Array.from(info.types).map(t => <Badge key={t} variant="outline">{t}</Badge>)}</div>
            </CardContent>
          </Card>
        ))}
        {categories.length === 0 && <p className="text-muted-foreground col-span-3 text-center py-8">No categories found</p>}
      </div>}
    </div>
  );
};

export default AdminCategories;
