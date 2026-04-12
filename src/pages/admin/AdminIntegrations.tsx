import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Database, Cloud, Shield } from 'lucide-react';

const integrations = [
  { name: 'Lovable Cloud', desc: 'Database, auth, and storage', icon: Database, status: 'connected', color: 'text-emerald-600' },
  { name: 'Email (Resend)', desc: 'Transactional emails and OTP', icon: Mail, status: 'connected', color: 'text-blue-600' },
  { name: 'WhatsApp (Twilio)', desc: 'WhatsApp messaging and OTP', icon: MessageSquare, status: 'connected', color: 'text-emerald-600' },
  { name: 'File Storage', desc: 'Resources, avatars, signatures', icon: Cloud, status: 'connected', color: 'text-violet-600' },
  { name: 'Row Level Security', desc: 'Database access control', icon: Shield, status: 'active', color: 'text-amber-600' },
];

const AdminIntegrations = () => (
  <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-foreground">🔗 Integrations</h1><p className="text-muted-foreground">Connected services and their status</p></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {integrations.map(i => (
        <Card key={i.name}>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><i.icon className={`w-5 h-5 ${i.color}`} />{i.name}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{i.desc}</p>
            <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">● {i.status}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default AdminIntegrations;
