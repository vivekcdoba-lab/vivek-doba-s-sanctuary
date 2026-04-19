import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDbCourses } from '@/hooks/useDbCourses';
import { useAuthStore } from '@/store/authStore';
import { UserPlus, ArrowLeft, ArrowRight, Check, Shield, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { PERMISSION_KEYS, PERMISSION_LABELS, allPermissionsTrue, type PermissionKey } from '@/lib/adminPermissions';
import { validatePassword, PASSWORD_HELP } from '@/lib/passwordValidation';

const STEPS = ['Role & Basic Info', 'Profile Details', 'Review & Create'];

const AdminAddUser = () => {
  const { data: courses = [] } = useDbCourses();
  const { user } = useAuthStore();
  const [callerIsSuper, setCallerIsSuper] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    role: 'seeker',
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    city: '',
    state: '',
    company: '',
    occupation: '',
    gender: '',
    course_id: '',
    send_welcome: true,
    auto_generate_password: false,
    admin_level: 'admin' as 'admin' | 'super_admin',
    admin_permissions: {} as Record<string, boolean>,
  });

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('profiles').select('admin_level').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setCallerIsSuper(data?.admin_level === 'super_admin'));
  }, [user?.id]);

  const update = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));
  const togglePerm = (key: PermissionKey) =>
    setForm(prev => ({ ...prev, admin_permissions: { ...prev.admin_permissions, [key]: !prev.admin_permissions[key] } }));

  const isSeeker = form.role === 'seeker';
  const autoGen = isSeeker || form.auto_generate_password;
  const passwordError = form.password ? validatePassword(form.password) : null;
  const passwordsMatch = form.password === form.confirm_password;

  const canNext = () => {
    if (step === 0) {
      const baseOk = !!(form.role && form.full_name && form.email && form.phone);
      if (!baseOk) return false;
      // Auto-generated password path: no manual fields required
      if (autoGen) return true;
      // Admins/coaches with manual password must type a valid 12-char password + matching confirm
      return !!(form.password && !passwordError && passwordsMatch);
    }
    return true;
  };

  const handleCreate = async () => {
    if (!form.full_name || !form.email || !form.phone) {
      toast.error('Please fill required fields');
      return;
    }
    if (!autoGen) {
      const pErr = validatePassword(form.password);
      if (pErr) { toast.error(pErr); return; }
      if (form.password !== form.confirm_password) { toast.error('Passwords do not match'); return; }
    }
    setLoading(true);
    try {
      const isAdmin = form.role === 'admin';
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: form.email,
          full_name: form.full_name,
          phone: form.phone,
          // When auto-gen is on (or seeker), server ignores password and generates a temp one
          password: autoGen ? null : form.password,
          auto_generate_password: autoGen,
          role: form.role,
          city: form.city,
          state: form.state,
          company: form.company,
          occupation: form.occupation,
          gender: form.gender,
          course_id: isSeeker && form.course_id ? form.course_id : null,
          admin_level: isAdmin ? form.admin_level : null,
          admin_permissions: isAdmin
            ? (form.admin_level === 'super_admin' ? allPermissionsTrue() : form.admin_permissions)
            : null,
        },
      });
      if (error || (data as any)?.error) {
        toast.error((data as any)?.error || error?.message || 'Failed to create user');
        setLoading(false);
        return;
      }
      const emailSent = (data as any)?.email_sent;
      const emailError = (data as any)?.email_error;
      const isTemp = (data as any)?.is_temp_password;
      const generatedPassword = (data as any)?.generated_password as string | null;
      const baseMsg = `${form.role.toUpperCase()} "${form.full_name}" created.`;
      const detail = emailSent
        ? (isTemp
            ? `Temporary password emailed to ${form.email}. They'll set their own on first login.`
            : `Login credentials emailed to ${form.email}.`)
        : `⚠️ Email failed (${emailError || 'unknown'}). Please share credentials manually.`;

      if (generatedPassword) {
        // Show the generated password persistently with a Copy action
        toast.success(`${baseMsg} Temporary password: ${generatedPassword}`, {
          description: detail,
          duration: 30000,
          action: {
            label: 'Copy password',
            onClick: () => {
              navigator.clipboard.writeText(generatedPassword);
              toast.success('Password copied');
            },
          },
        });
      } else if (emailSent) {
        toast.success(`${baseMsg} ${detail}`, { duration: 12000 });
      } else {
        toast.warning(`${baseMsg} ${detail}`, { duration: 18000 });
      }

      setForm({ role: 'seeker', full_name: '', email: '', phone: '', password: '', confirm_password: '', city: '', state: '', company: '', occupation: '', gender: '', course_id: '', send_welcome: true, auto_generate_password: false, admin_level: 'admin', admin_permissions: {} });
      setStep(0);
    } catch (e: any) {
      toast.error(e?.message || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  const isAdminRole = form.role === 'admin';
  const isSuperLevel = form.admin_level === 'super_admin';
  const permCount = isSuperLevel ? PERMISSION_KEYS.length : PERMISSION_KEYS.filter(k => form.admin_permissions[k]).length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add New User</h1>
        <p className="text-sm text-muted-foreground">Create a new account in the system</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i < step ? 'bg-primary text-primary-foreground' : i === step ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : 'bg-muted text-muted-foreground'
            }`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${i === step ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={form.role} onValueChange={v => update('role', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seeker">Seeker</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 9876543210" />
              </div>
              {isSeeker ? (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-foreground">
                  🔐 A <strong>temporary password</strong> will be generated and emailed to the seeker. They will be required to set their own password on first login.
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <Input type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Set login password" />
                    <p className="text-xs text-muted-foreground">{PASSWORD_HELP}</p>
                    {form.password && passwordError && (
                      <p className="text-xs text-destructive">{passwordError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password *</Label>
                    <Input type="password" value={form.confirm_password} onChange={e => update('confirm_password', e.target.value)} placeholder="Re-enter password" />
                    {form.confirm_password && !passwordsMatch && (
                      <p className="text-xs text-destructive">Passwords do not match</p>
                    )}
                  </div>
                  <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                    📧 Login credentials (email + this password) will be emailed to the {form.role}. They can optionally change it on first login.
                  </div>
                </>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={form.city} onChange={e => update('city', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={form.state} onChange={e => update('state', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={form.company} onChange={e => update('company', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Input value={form.occupation} onChange={e => update('occupation', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={v => update('gender', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.role === 'seeker' && (
                <div className="space-y-2">
                  <Label>Enroll in Course</Label>
                  <Select value={form.course_id} onValueChange={v => update('course_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Select course (optional)" /></SelectTrigger>
                    <SelectContent>
                      {courses.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isAdminRole && (
                <div className="space-y-4 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-destructive" />
                    <span className="font-semibold text-sm">Admin Access Configuration</span>
                  </div>

                  <div className="space-y-2">
                    <Label>Admin Level *</Label>
                    <Select value={form.admin_level} onValueChange={v => update('admin_level', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin" disabled={!callerIsSuper}>
                          Super Admin {!callerIsSuper && '(super admin only)'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {isSuperLevel && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Super Admins automatically have all permissions.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Permissions ({permCount} / {PERMISSION_KEYS.length})</Label>
                      {!isSuperLevel && (
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="ghost" className="h-7 text-xs"
                            onClick={() => update('admin_permissions', allPermissionsTrue())}>Select all</Button>
                          <Button type="button" size="sm" variant="ghost" className="h-7 text-xs"
                            onClick={() => update('admin_permissions', {})}>Clear</Button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {PERMISSION_KEYS.map(k => (
                        <label key={k} className={`flex items-center gap-2 text-sm p-2 rounded border ${isSuperLevel ? 'opacity-60' : 'cursor-pointer hover:bg-muted/50'}`}>
                          <Checkbox
                            checked={isSuperLevel || !!form.admin_permissions[k]}
                            disabled={isSuperLevel}
                            onCheckedChange={() => togglePerm(k)}
                          />
                          <span>{PERMISSION_LABELS[k]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox checked={form.send_welcome} onCheckedChange={v => update('send_welcome', !!v)} id="welcome" />
                <Label htmlFor="welcome" className="text-sm">Send welcome email</Label>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Review Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Role:</span> <Badge className="ml-2">{form.role}</Badge></div>
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium ml-2">{form.full_name}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="ml-2">{form.email}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="ml-2">{form.phone}</span></div>
                {form.city && <div><span className="text-muted-foreground">City:</span> <span className="ml-2">{form.city}</span></div>}
                {form.state && <div><span className="text-muted-foreground">State:</span> <span className="ml-2">{form.state}</span></div>}
                {form.company && <div><span className="text-muted-foreground">Company:</span> <span className="ml-2">{form.company}</span></div>}
                {form.occupation && <div><span className="text-muted-foreground">Occupation:</span> <span className="ml-2">{form.occupation}</span></div>}
                {form.gender && <div><span className="text-muted-foreground">Gender:</span> <span className="ml-2">{form.gender}</span></div>}
                {isAdminRole && (
                  <>
                    <div><span className="text-muted-foreground">Admin Level:</span>
                      <Badge variant={isSuperLevel ? 'destructive' : 'default'} className="ml-2">
                        {isSuperLevel ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </div>
                    <div><span className="text-muted-foreground">Permissions:</span>
                      <span className="ml-2 font-medium">{isSuperLevel ? 'All' : `${permCount} of ${PERMISSION_KEYS.length}`}</span>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-muted-foreground">Password:</span>
                  <span className="ml-2 font-mono">
                    {isSeeker
                      ? <span className="text-xs text-muted-foreground italic">auto-generated & emailed</span>
                      : <>●●●●●●●● <span className="text-xs text-muted-foreground">(set by admin)</span></>}
                  </span>
                </div>
                <div><span className="text-muted-foreground">Credentials Email:</span> <span className="ml-2">Yes — sent to {form.email}</span></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        {step < 2 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
            Next <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={loading} className="bg-primary">
            {loading ? <><span className="animate-spin mr-2">⏳</span> Creating...</> : <><UserPlus className="w-4 h-4 mr-1" /> Create User</>}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminAddUser;
