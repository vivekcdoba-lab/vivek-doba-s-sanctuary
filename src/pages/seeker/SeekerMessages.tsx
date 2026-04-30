import { useState, useEffect, useRef } from 'react';
import { Send, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { useDbMessages, useSendMessage } from '@/hooks/useDbMessages';
import { useAllProfiles } from '@/hooks/useSeekerProfiles';
import BackToHome from '@/components/BackToHome';
import { formatDateDMY } from "@/lib/dateFormat";

const SeekerMessages = () => {
  const { profile } = useAuthStore();
  const profileId = profile?.id || null;
  const { data: messages = [], isLoading } = useDbMessages(profileId);
  const { data: allProfiles = [] } = useAllProfiles();
  const sendMessage = useSendMessage();
  const [newMessage, setNewMessage] = useState('');
  const [showSupport, setShowSupport] = useState(false);
  const [supportForm, setSupportForm] = useState({ category: 'Assignment Help', priority: 'medium', description: '' });
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find admin/coach profile for sending messages to
  const adminProfile = allProfiles.find(p => p.role === 'admin');
  const adminId = adminProfile?.id;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !profileId || !adminId) return;
    sendMessage.mutate(
      { sender_id: profileId, receiver_id: adminId, content: newMessage },
      {
        onSuccess: () => {
          setNewMessage('');
          toast({ title: '✅ Message sent!' });
        },
        onError: () => toast({ title: '❌ Failed to send message', variant: 'destructive' }),
      }
    );
  };

  const submitSupport = () => {
    if (!supportForm.description.trim() || !profileId || !adminId) return;
    sendMessage.mutate(
      { sender_id: profileId, receiver_id: adminId, content: `🆘 Support Request (${supportForm.category}): ${supportForm.description}` },
      {
        onSuccess: () => {
          setShowSupport(false);
          setSupportForm({ category: 'Assignment Help', priority: 'medium', description: '' });
          toast({ title: '🆘 Support request sent!', description: 'Coach will respond soon.' });
        },
      }
    );
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const getDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return formatDateDMY(d);
  };

  let lastDate = '';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <BackToHome />
      </div>
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-sm font-bold">VD</div>
          <div>
            <p className="font-semibold text-foreground text-sm">{adminProfile?.full_name || 'Coach'}</p>
            <p className="text-xs text-muted-foreground">Coach • Online</p>
          </div>
        </div>
        <button onClick={() => setShowSupport(true)} className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Help
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && <p className="text-center text-muted-foreground text-sm">Loading messages...</p>}
        {!isLoading && messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Say hello to your coach! 👋</p>
        )}
        {messages.map(m => {
          const dateLabel = getDateLabel(m.created_at);
          const showDate = dateLabel !== lastDate;
          lastDate = dateLabel;
          const isMine = m.sender_id === profileId;
          return (
            <div key={m.id}>
              {showDate && <div className="text-center my-3"><span className="text-[10px] bg-muted px-3 py-1 rounded-full text-muted-foreground">{dateLabel}</span></div>}
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-primary/10 text-foreground rounded-br-sm' : 'bg-card border border-border text-foreground rounded-bl-sm'}`}>
                  <p className="text-sm">{m.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 text-right">{formatTime(m.created_at)} {isMine ? (m.is_read ? '✓✓' : '✓') : ''}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-background">
        <div className="flex gap-2">
          <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..." className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm" />
          <button onClick={handleSend} disabled={sendMessage.isPending} className="p-2.5 rounded-xl bg-primary text-primary-foreground"><Send className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Support Modal */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={() => setShowSupport(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">🆘 New Support Request</h3>
              <button onClick={() => setShowSupport(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <select value={supportForm.category} onChange={e => setSupportForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                {['Session Reschedule', 'Assignment Help', 'Technical Issue', 'Personal Challenge', 'Billing'].map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={supportForm.priority} onChange={e => setSupportForm(p => ({ ...p, priority: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                <option value="low">🟢 Low</option><option value="medium">🟡 Medium</option><option value="high">🔴 High</option>
              </select>
              <textarea value={supportForm.description} onChange={e => setSupportForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe your issue..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" rows={4} />
              <button onClick={submitSupport} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeekerMessages;
