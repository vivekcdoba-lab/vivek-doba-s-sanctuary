import { useState } from 'react';
import { Send } from 'lucide-react';
import { useDbMessages, useSendMessage } from '@/hooks/useDbMessages';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const MessagesPage = () => {
  const { profile } = useAuthStore();
  const adminProfileId = profile?.id || null;
  const { data: seekers = [] } = useSeekerProfiles();
  const [selectedSeekerId, setSelectedSeekerId] = useState<string | null>(null);
  const { data: allMessages = [], isLoading } = useDbMessages(adminProfileId);
  const sendMessage = useSendMessage();
  const [newMsg, setNewMsg] = useState('');

  // Build conversation list from real messages
  const conversationMap = new Map<string, { lastMsg: string; unread: number; time: string }>();
  allMessages.forEach(m => {
    const otherId = m.sender_id === adminProfileId ? m.receiver_id : m.sender_id;
    const existing = conversationMap.get(otherId);
    if (!existing || m.created_at > existing.time) {
      conversationMap.set(otherId, {
        lastMsg: m.content.slice(0, 50),
        unread: (existing?.unread || 0) + (m.receiver_id === adminProfileId && !m.is_read ? 1 : 0),
        time: m.created_at,
      });
    }
  });

  // Also add seekers who haven't messaged yet
  seekers.forEach(s => { if (!conversationMap.has(s.id)) conversationMap.set(s.id, { lastMsg: 'No messages yet', unread: 0, time: '' }); });

  const conversations = Array.from(conversationMap.entries()).map(([id, data]) => {
    const seeker = seekers.find(s => s.id === id);
    return { seekerId: id, name: seeker?.full_name || 'Unknown', ...data };
  }).sort((a, b) => b.time.localeCompare(a.time));

  const activeSeekerId = selectedSeekerId || conversations[0]?.seekerId;
  const msgs = allMessages.filter(m => m.sender_id === activeSeekerId || m.receiver_id === activeSeekerId);
  const activeName = conversations.find(c => c.seekerId === activeSeekerId)?.name;

  const handleSend = () => {
    if (!newMsg.trim() || !adminProfileId || !activeSeekerId) return;
    sendMessage.mutate({ sender_id: adminProfileId, receiver_id: activeSeekerId, content: newMsg }, {
      onSuccess: () => { setNewMsg(''); },
      onError: () => toast.error('Failed to send'),
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Messages</h1>
      <div className="flex gap-4 h-[calc(100vh-14rem)]">
        <div className="w-72 flex-shrink-0 bg-card rounded-xl border border-border overflow-y-auto">
          {conversations.map(c => (
            <button key={c.seekerId} onClick={() => setSelectedSeekerId(c.seekerId)} className={`w-full text-left p-4 border-b border-border transition-colors ${activeSeekerId === c.seekerId ? 'bg-primary/5' : 'hover:bg-muted/50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full gradient-chakravartin flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                  {c.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                    {c.unread > 0 && <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">{c.unread}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.lastMsg}</p>
                </div>
              </div>
            </button>
          ))}
          {conversations.length === 0 && <p className="text-sm text-muted-foreground p-4">No conversations yet.</p>}
        </div>

        <div className="flex-1 bg-card rounded-xl border border-border flex flex-col">
          <div className="p-4 border-b border-border"><h3 className="font-semibold text-foreground">{activeName || 'Select a conversation'}</h3></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>}
            {msgs.map(m => {
              const isCoach = m.sender_id === adminProfileId;
              return (
                <div key={m.id} className={`flex ${isCoach ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isCoach ? 'bg-primary/10 text-foreground' : 'bg-muted text-foreground'}`}>
                    <p className="text-sm">{m.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                  </div>
                </div>
              );
            })}
            {!isLoading && msgs.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No messages in this conversation.</p>}
          </div>
          <div className="p-4 border-t border-border flex gap-2">
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="flex-1 px-4 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            <button onClick={handleSend} disabled={sendMessage.isPending} className="gradient-chakravartin text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
