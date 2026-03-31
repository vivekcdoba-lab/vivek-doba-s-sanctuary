import { useState } from 'react';
import { MESSAGES } from '@/data/mockData';
import { Send, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SeekerMessages = () => {
  const [messages, setMessages] = useState(MESSAGES.filter(m => m.sender_id === 's1' || m.receiver_id === 's1'));
  const [newMessage, setNewMessage] = useState('');
  const [showSupport, setShowSupport] = useState(false);
  const [supportForm, setSupportForm] = useState({ category: 'Assignment Help', priority: 'medium', description: '' });
  const { toast } = useToast();

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, { id: `m${Date.now()}`, sender_id: 's1', receiver_id: 'admin-1', content: newMessage, is_read: false, created_at: new Date().toISOString() }]);
    setNewMessage('');
    toast({ title: '✅ Message sent!' });
  };

  const submitSupport = () => {
    if (!supportForm.description.trim()) return;
    setMessages(prev => [...prev, { id: `m${Date.now()}`, sender_id: 's1', receiver_id: 'admin-1', content: `🆘 Support Request (${supportForm.category}): ${supportForm.description}`, is_read: false, created_at: new Date().toISOString() }]);
    setShowSupport(false);
    setSupportForm({ category: 'Assignment Help', priority: 'medium', description: '' });
    toast({ title: '🆘 Support request sent!', description: 'Coach will respond soon.' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const getDateLabel = (dateStr: string) => {
    const d = dateStr.split('T')[0];
    if (d === '2025-03-31') return 'Today';
    if (d === '2025-03-30') return 'Yesterday';
    return d.split('-').reverse().join('/');
  };

  let lastDate = '';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-sm font-bold">VD</div>
          <div>
            <p className="font-semibold text-foreground text-sm">Vivek Doba</p>
            <p className="text-xs text-muted-foreground">Coach • Online</p>
          </div>
        </div>
        <button onClick={() => setShowSupport(true)} className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Help
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(m => {
          const dateLabel = getDateLabel(m.created_at);
          const showDate = dateLabel !== lastDate;
          lastDate = dateLabel;
          const isMine = m.sender_id === 's1';
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
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-background">
        <div className="flex gap-2">
          <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..." className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm" />
          <button onClick={sendMessage} className="p-2.5 rounded-xl bg-primary text-primary-foreground"><Send className="w-4 h-4" /></button>
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
