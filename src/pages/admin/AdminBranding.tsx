import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminBranding = () => {
  const [config, setConfig] = useState(() => JSON.parse(localStorage.getItem('admin_branding') || '{"platformName":"LGT Sahayak","tagline":"Life Growth Technology","primaryColor":"#2196F3","secondaryColor":"#FF9800","description":""}'));

  const save = () => { localStorage.setItem('admin_branding', JSON.stringify(config)); toast({ title: '✅ Branding saved' }); };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">🎨 Branding</h1><p className="text-muted-foreground">Customize platform appearance</p></div>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Brand Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Platform Name</Label><Input value={config.platformName} onChange={e => setConfig((p: any) => ({ ...p, platformName: e.target.value }))} /></div>
          <div><Label>Tagline</Label><Input value={config.tagline} onChange={e => setConfig((p: any) => ({ ...p, tagline: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Primary Color</Label><div className="flex gap-2"><Input type="color" value={config.primaryColor} onChange={e => setConfig((p: any) => ({ ...p, primaryColor: e.target.value }))} className="w-12 h-10 p-1" /><Input value={config.primaryColor} onChange={e => setConfig((p: any) => ({ ...p, primaryColor: e.target.value }))} /></div></div>
            <div><Label>Secondary Color</Label><div className="flex gap-2"><Input type="color" value={config.secondaryColor} onChange={e => setConfig((p: any) => ({ ...p, secondaryColor: e.target.value }))} className="w-12 h-10 p-1" /><Input value={config.secondaryColor} onChange={e => setConfig((p: any) => ({ ...p, secondaryColor: e.target.value }))} /></div></div>
          </div>
          <div><Label>Description</Label><Textarea value={config.description} onChange={e => setConfig((p: any) => ({ ...p, description: e.target.value }))} placeholder="Platform description" /></div>
          <div className="p-4 rounded-lg border"><p className="text-sm text-muted-foreground mb-2">Preview</p><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg" style={{ background: config.primaryColor }} /><div><p className="font-bold">{config.platformName}</p><p className="text-sm text-muted-foreground">{config.tagline}</p></div></div></div>
          <Button onClick={save} className="w-full"><Save className="w-4 h-4 mr-2" />Save Branding</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBranding;
