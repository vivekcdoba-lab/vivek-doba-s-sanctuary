import { useState, useRef, useEffect } from 'react';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useDbMessages, useSendMessage } from '@/hooks/useDbMessages';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Search, User } from 'lucide-react';
import { format } from 'date-fns';

export default function CoachMessages() {
  const { profile } = useAuthStore();
  const { data: seekers = [] } = useSeekerProfiles();
  const profileId = profile?.id || null;
  const { data: allMessages = [] } = useDbMessages(profileId);
  const sendMessage = useSendMessage();
  const [selectedSeeker, setSelectedSeeker] = useState('');
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversationPartners = new Map<string, { name: string; lastMsg: string; lastTime: string }>();
  allMessages.forEach(msg => {
    const partnerId = msg.sender_id === profileId ? msg.receiver_id : msg.sender_id;
    if (!conversationPartners.has(partnerId) || msg.created_at > (conversationPartners.get(partnerId)?.lastTime || '')) {
      const seeker = seekers.find(s => s.id === partnerId);
      conversationPartners.set(partnerId, {
        name: seeker?.full_name || 'Unknown',
        lastMsg: msg.content.slice(0, 50),
        lastTime: msg.created_at,
      });
    }
  });

  // Also show seekers with no messages
  seekers.forEach(s => {
    if (!conversationPartners.has(s.id)) {
      conversationPartners.set(s.id, { name: s.full_name, lastMsg: 'No messages yet', lastTime: '' });
    }
  });

  const partners = [...conversationPartners.entries()]
    .filter(([, v]) => v.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b[1].lastTime || '').localeCompare(a[1].lastTime || ''));

  const thread = allMessages.filter(m =>
    (m.sender_id === profileId && m.receiver_id === selectedSeeker) ||
    (m.receiver_id === profileId && m.sender_id === selectedSeeker)
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.length]);

  const handleSend = () => {
    if (!newMsg.trim() || !profileId || !selectedSeeker) return;
    sendMessage.mutate({ sender_id: profileId, receiver_id: selectedSeeker, content: newMsg.trim() });
    setNewMsg('');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-[#FF6B00]" /> Messages
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        {/* Sidebar */}
        <Card className="p-3 flex flex-col">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1">
            {partners.map(([id, p]) => (
              <button key={id} onClick={() => setSelectedSeeker(id)}
                className={`w-full text-left p-2.5 rounded-lg transition-colors ${selectedSeeker === id ? 'bg-[#FF6B00] text-white' : 'hover:bg-muted'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${selectedSeeker === id ? 'bg-white/20 text-white' : 'bg-[#FF6B00]/10 text-[#FF6B00]'}`}>
                    {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className={`text-xs truncate ${selectedSeeker === id ? 'text-white/70' : 'text-muted-foreground'}`}>{p.lastMsg}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Chat */}
        <Card className="md:col-span-2 flex flex-col p-0 overflow-hidden">
          {!selectedSeeker ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a seeker to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-border flex items-center gap-2">
                <User className="w-5 h-5 text-[#FF6B00]" />
                <span className="font-medium text-foreground">{conversationPartners.get(selectedSeeker)?.name}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {thread.map(msg => {
                  const isMine = msg.sender_id === profileId;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-xl px-3 py-2 ${isMine ? 'bg-[#FF6B00] text-white' : 'bg-muted'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-muted-foreground'}`}>
                          {format(new Date(msg.created_at), 'hh:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <Input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  placeholder="Type a message..." className="flex-1"
                  onKeyDown={e => e.key === 'Enter' && handleSend()} />
                <Button onClick={handleSend} disabled={!newMsg.trim()} className="bg-[#FF6B00] hover:bg-[#e65e00]">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
