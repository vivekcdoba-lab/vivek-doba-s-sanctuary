import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { usePayments } from '@/hooks/usePayments';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useSeekerLinkGroup, RELATIONSHIP_EMOJIS, RELATIONSHIP_LABELS } from '@/hooks/useSeekerLinks';
import { toast } from '@/hooks/use-toast';
import { IndianRupee, Receipt, Users } from 'lucide-react';

const AdminRecordPayment = () => {
  const { data: seekers = [] } = useSeekerProfiles();
  const { createPayment } = usePayments();
  const [form, setForm] = useState({
    seeker_id: '', amount: '', method: 'upi', transaction_id: '', notes: '',
    payment_date: new Date().toISOString().split('T')[0],
    is_joint: false,
  });

  const { data: linkGroup = [] } = useSeekerLinkGroup(form.seeker_id || null);
  const isLinked = linkGroup.length > 1;
  const partner = linkGroup.find(r => r.seeker_id !== form.seeker_id);
  const groupId = linkGroup[0]?.group_id || null;

  const amount = parseFloat(form.amount) || 0;
  const gst = Math.round(amount * 0.18 * 100) / 100;
  const total = amount + gst;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.seeker_id || !amount) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    try {
      await createPayment.mutateAsync({
        seeker_id: form.seeker_id,
        amount, gst_amount: gst, total_amount: total,
        payment_date: form.payment_date,
        method: form.method,
        transaction_id: form.transaction_id || undefined,
        notes: form.notes || undefined,
        is_joint: form.is_joint && isLinked,
        joint_group_id: form.is_joint && isLinked ? groupId : null,
      });
      toast({
        title: form.is_joint && isLinked
          ? `✅ Joint payment recorded — visible to ${partner?.seeker?.full_name || 'partner'} as well`
          : '✅ Payment recorded successfully',
      });
      setForm({
        seeker_id: '', amount: '', method: 'upi', transaction_id: '', notes: '',
        payment_date: new Date().toISOString().split('T')[0],
        is_joint: false,
      });
    } catch {
      toast({ title: 'Failed to record payment', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">💰 Record Payment</h1>
        <p className="text-muted-foreground">Record a new payment from a seeker</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Receipt className="w-5 h-5" /> Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Seeker *</Label>
                  <Select value={form.seeker_id} onValueChange={v => setForm(p => ({ ...p, seeker_id: v, is_joint: false }))}>
                    <SelectTrigger><SelectValue placeholder="Select seeker" /></SelectTrigger>
                    <SelectContent>
                      {seekers.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Date *</Label>
                  <Input type="date" value={form.payment_date} onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))} />
                </div>
                <div>
                  <Label>Amount (₹) *</Label>
                  <Input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select value={form.method} onValueChange={v => setForm(p => ({ ...p, method: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['upi', 'bank_transfer', 'cash', 'cheque', 'card'].map(m => <SelectItem key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Transaction ID</Label>
                  <Input placeholder="Optional" value={form.transaction_id} onChange={e => setForm(p => ({ ...p, transaction_id: e.target.value }))} />
                </div>
              </div>

              {/* Joint payment section */}
              {form.seeker_id && (
                <div className={`rounded-lg border p-3 ${isLinked ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Joint Payment</p>
                        <p className="text-xs text-muted-foreground">
                          {isLinked && partner?.seeker
                            ? <>Visible to <strong>{partner.seeker.full_name}</strong> {RELATIONSHIP_EMOJIS[partner.relationship]} ({RELATIONSHIP_LABELS[partner.relationship]})</>
                            : 'This seeker is not linked to anyone — joint payments unavailable.'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={form.is_joint && isLinked}
                      disabled={!isLinked}
                      onCheckedChange={v => setForm(p => ({ ...p, is_joint: v }))}
                    />
                  </div>
                  {isLinked && form.is_joint && (
                    <Badge variant="outline" className="mt-2 border-primary/40 text-primary">
                      💑 Joint with {partner?.seeker?.full_name}
                    </Badge>
                  )}
                </div>
              )}

              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Additional notes..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <Button type="submit" disabled={createPayment.isPending} className="w-full">
                {createPayment.isPending ? 'Recording...' : 'Record Payment'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><IndianRupee className="w-5 h-5" /> Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Base Amount</span><span className="font-medium">₹{amount.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">GST (18%)</span><span className="font-medium">₹{gst.toLocaleString('en-IN')}</span></div>
            <hr />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">₹{total.toLocaleString('en-IN')}</span></div>
            {form.is_joint && isLinked && (
              <div className="text-xs text-primary bg-primary/10 rounded p-2 mt-2">
                💡 This payment will appear in both seekers' payment history.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRecordPayment;
