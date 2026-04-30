import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import BackToHome from '@/components/BackToHome';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Bookmark, Search, Trash2, ExternalLink, StickyNote, Video,
  Headphones, FileText, BookOpen, ClipboardList, Tag, Filter,
  SortAsc, Edit2, X, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { formatDateDMY } from "@/lib/dateFormat";
const TYPE_META: Record<string, { icon: any; label: string; color: string; route: string }> = {
  video: { icon: Video, label: 'Video', color: 'bg-[hsl(var(--saffron))]/10 text-[hsl(var(--saffron))]', route: '/seeker/learning/videos' },
  audio: { icon: Headphones, label: 'Audio', color: 'bg-[hsl(var(--chakra-indigo))]/10 text-[hsl(var(--chakra-indigo))]', route: '/seeker/learning/audio' },
  pdf: { icon: FileText, label: 'PDF', color: 'bg-[hsl(var(--dharma-green))]/10 text-[hsl(var(--dharma-green))]', route: '/seeker/learning/pdfs' },
  framework: { icon: BookOpen, label: 'Framework', color: 'bg-[hsl(var(--gold-bright))]/10 text-[hsl(var(--gold-bright))]', route: '/seeker/learning/frameworks' },
  session_note: { icon: ClipboardList, label: 'Session Note', color: 'bg-[hsl(var(--wisdom-purple))]/10 text-[hsl(var(--wisdom-purple))]', route: '/seeker/sessions' },
};

const TABS = [
  { key: 'all', label: 'All', emoji: '📌' },
  { key: 'video', label: 'Videos', emoji: '🎬' },
  { key: 'audio', label: 'Audio', emoji: '🎧' },
  { key: 'pdf', label: 'PDFs', emoji: '📄' },
  { key: 'framework', label: 'Frameworks', emoji: '🧩' },
  { key: 'session_note', label: 'Notes', emoji: '📝' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest First' },
  { key: 'oldest', label: 'Oldest First' },
  { key: 'title', label: 'Title A-Z' },
];

interface BookmarkRow {
  id: string;
  seeker_id: string;
  content_type: string;
  content_id: string | null;
  content_title: string;
  content_url: string | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
}

export default function SeekerBookmarks() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState('');

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['user-bookmarks', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('*')
        .eq('seeker_id', profile!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as BookmarkRow[];
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_bookmarks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookmarks'] });
      toast.success('Bookmark removed');
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, notes, tags }: { id: string; notes: string; tags: string[] }) => {
      const { error } = await supabase
        .from('user_bookmarks')
        .update({ notes, tags } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookmarks'] });
      setEditingId(null);
      toast.success('Bookmark updated');
    },
  });

  const startEdit = (bm: BookmarkRow) => {
    setEditingId(bm.id);
    setEditNotes(bm.notes || '');
    setEditTags((bm.tags || []).join(', '));
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateMut.mutate({
      id: editingId,
      notes: editNotes,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  // All unique tags
  const allTags = useMemo(() => {
    const s = new Set<string>();
    bookmarks.forEach(b => (b.tags || []).forEach(t => s.add(t)));
    return Array.from(s).sort();
  }, [bookmarks]);

  const [tagFilter, setTagFilter] = useState('');

  const filtered = useMemo(() => {
    let list = bookmarks;
    if (activeTab !== 'all') list = list.filter(b => b.content_type === activeTab);
    if (search) list = list.filter(b =>
      b.content_title.toLowerCase().includes(search.toLowerCase()) ||
      (b.notes || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
    if (tagFilter) list = list.filter(b => (b.tags || []).includes(tagFilter));

    if (sortBy === 'oldest') list = [...list].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else if (sortBy === 'title') list = [...list].sort((a, b) => a.content_title.localeCompare(b.content_title));
    // newest is default order from query
    return list;
  }, [bookmarks, activeTab, search, tagFilter, sortBy]);

  const typeCounts = useMemo(() => {
    const m: Record<string, number> = { all: bookmarks.length };
    bookmarks.forEach(b => { m[b.content_type] = (m[b.content_type] || 0) + 1; });
    return m;
  }, [bookmarks]);

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return formatDateDMY(dt);
  };

  return (
    <div className="space-y-6">
      <BackToHome />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-[hsl(var(--gold-bright))]" /> My Bookmarks
        </h1>
        <p className="text-sm text-muted-foreground">{bookmarks.length} saved items across your learning journey</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.emoji} {tab.label}
            {(typeCounts[tab.key] || 0) > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-primary-foreground/20' : 'bg-background'
              }`}>
                {typeCounts[tab.key] || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search, Filter, Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search bookmarks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {allTags.length > 0 && (
          <Select value={tagFilter} onValueChange={v => setTagFilter(v === 'none' ? '' : v)}>
            <SelectTrigger className="w-[180px]">
              <Tag className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All Tags</SelectItem>
              {allTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]">
            <SortAsc className="h-4 w-4 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(o => <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Tag chips */}
      {allTags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {allTags.map(t => (
            <button
              key={t}
              onClick={() => setTagFilter(tagFilter === t ? '' : t)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                tagFilter === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <Bookmark className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">
              {bookmarks.length === 0 ? 'No Bookmarks Yet' : 'No matching bookmarks'}
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              {bookmarks.length === 0
                ? 'Bookmark videos, audio, PDFs, and frameworks from the learning pages.'
                : 'Try adjusting your search or filters.'}
            </p>
            {bookmarks.length === 0 && (
              <Button onClick={() => navigate('/seeker/learning/videos')}>
                <BookOpen className="h-4 w-4 mr-1" /> Explore Content
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(bm => {
            const meta = TYPE_META[bm.content_type] || TYPE_META.pdf;
            const Icon = meta.icon;
            return (
              <Card key={bm.id} className="overflow-hidden hover:shadow-md transition-all group border-border">
                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">{bm.content_title}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge className={`${meta.color} text-[9px] px-1.5 py-0`}>{meta.label}</Badge>
                        <span className="text-[10px] text-muted-foreground">{formatDate(bm.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {bm.notes && (
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <div className="flex items-center gap-1 mb-1">
                        <StickyNote className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground">Note</span>
                      </div>
                      <p className="text-xs text-foreground line-clamp-2">{bm.notes}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {bm.tags && bm.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {bm.tags.map(t => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                          onClick={() => setTagFilter(t)}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <div className="flex gap-1">
                      {bm.content_url && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => window.open(bm.content_url!, '_blank')}>
                          <ExternalLink className="h-3 w-3 mr-1" /> Open
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate(meta.route)}>
                        Go to {meta.label}
                      </Button>
                    </div>
                    <div className="flex gap-0.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(bm)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteMut.mutate(bm.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingId} onOpenChange={open => { if (!open) setEditingId(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Bookmark</DialogTitle>
            <DialogDescription>Update notes and tags for this bookmark.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Notes</label>
              <Textarea
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Add personal notes..."
                className="mt-1 min-h-[80px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Tags (comma separated)</label>
              <Input
                value={editTags}
                onChange={e => setEditTags(e.target.value)}
                placeholder="e.g. meditation, important, review"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
              <Button onClick={saveEdit} disabled={updateMut.isPending}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
