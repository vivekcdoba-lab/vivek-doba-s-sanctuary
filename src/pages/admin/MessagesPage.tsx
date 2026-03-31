import { useState } from 'react';
import { MESSAGES, SEEKERS } from '@/data/mockData';

const conversations = [
  { seekerId: 's1', name: 'Rahul Patil', lastMsg: 'Thank you Vivek sir 🙏', unread: 1 },
  { seekerId: 's2', name: 'Meera Shah', lastMsg: "We'll discuss advanced techniques in session 13.", unread: 0 },
  { seekerId: 's3', name: 'Amit Joshi', lastMsg: "4:30 PM works better. Let's keep original time.", unread: 0 },
  { seekerId: 's4', name: 'Sneha Kulkarni', lastMsg: "Let's discuss the EMI plan in our next session.", unread: 0 },
];

const MessagesPage = () => {
  const [selectedConv, setSelectedConv] = useState(conversations[0].seekerId);
  const msgs = MESSAGES.filter(m => m.sender_id === selectedConv || m.receiver_id === selectedConv);
  const selectedName = conversations.find(c => c.seekerId === selectedConv)?.name;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Messages</h1>
      <div className="flex gap-4 h-[calc(100vh-14rem)]">
        {/* Conversation List */}
        <div className="w-72 flex-shrink-0 bg-card rounded-xl border border-border overflow-y-auto">
          {conversations.map((c) => (
            <button key={c.seekerId} onClick={() => setSelectedConv(c.seekerId)} className={`w-full text-left p-4 border-b border-border transition-colors ${selectedConv === c.seekerId ? 'bg-primary/5' : 'hover:bg-muted/50'}`}>
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
        </div>

        {/* Chat Thread */}
        <div className="flex-1 bg-card rounded-xl border border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">{selectedName}</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((m) => {
              const isCoach = m.sender_id === 'admin-1';
              return (
                <div key={m.id} className={`flex ${isCoach ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isCoach ? 'bg-primary/10 text-foreground' : 'bg-muted text-foreground'}`}>
                    <p className="text-sm">{m.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t border-border flex gap-2">
            <input placeholder="Type a message..." className="flex-1 px-4 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            <button className="gradient-chakravartin text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
