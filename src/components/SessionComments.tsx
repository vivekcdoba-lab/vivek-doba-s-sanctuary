import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { MessageCircle, Send, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  section_name: string;
  author_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  author_name?: string;
}

interface SessionCommentsProps {
  sessionId: string;
  sectionName: string;
  sectionLabel: string;
}

const SessionComments = ({ sessionId, sectionName, sectionLabel }: SessionCommentsProps) => {
  const { profile } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) loadComments();
  }, [isOpen, sessionId, sectionName]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${sessionId}-${sectionName}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'session_comments',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const newC = payload.new as Comment;
        if (newC.section_name === sectionName) {
          setComments(prev => [...prev, newC]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, sectionName]);

  const loadComments = async () => {
    const { data } = await supabase
      .from('session_comments')
      .select('*')
      .eq('session_id', sessionId)
      .eq('section_name', sectionName)
      .order('created_at', { ascending: true });
    
    if (data) {
      // Load author names
      const authorIds = [...new Set(data.map(c => c.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', authorIds);
      
      const nameMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      setComments(data.map(c => ({ ...c, author_name: nameMap.get(c.author_id) || 'Unknown' })));

      // Mark unread as read
      const unread = data.filter(c => !c.is_read && c.author_id !== profile?.id);
      if (unread.length > 0) {
        await supabase
          .from('session_comments')
          .update({ is_read: true })
          .in('id', unread.map(c => c.id));
      }
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !profile?.id) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('session_comments').insert({
        session_id: sessionId,
        section_name: sectionName,
        author_id: profile.id,
        content: newComment.trim(),
      });
      if (error) throw error;

      // Add audit log
      await supabase.from('session_audit_log').insert({
        session_id: sessionId,
        actor_id: profile.id,
        action: 'commented',
        diff: { section: sectionName, content: newComment.trim() },
      });

      setNewComment('');
      toast.success('Comment added');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = comments.filter(c => !c.is_read && c.author_id !== profile?.id).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative"
        aria-label={`Comments for ${sectionLabel}`}
      >
        <MessageCircle className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 z-50 w-80 bg-card border border-border rounded-xl shadow-lg">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground">
              💬 {sectionLabel} Comments
            </h4>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-muted">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto p-3 space-y-3">
            {comments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No comments yet</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className={`text-xs space-y-1 p-2 rounded-lg ${
                  c.author_id === profile?.id ? 'bg-primary/5 ml-4' : 'bg-muted/50 mr-4'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{c.author_name}</span>
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-foreground/80">{c.content}</p>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-border flex gap-2">
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addComment()}
              placeholder="Add a comment..."
              className="flex-1 text-xs rounded-lg border border-input bg-background px-2.5 py-1.5"
              aria-label="Comment text"
            />
            <button
              onClick={addComment}
              disabled={loading || !newComment.trim()}
              className="p-1.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
              aria-label="Send comment"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionComments;
