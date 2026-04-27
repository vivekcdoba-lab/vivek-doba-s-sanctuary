import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ApplyLGT from '../ApplyLGT';
import { useToast } from '@/hooks/use-toast';

interface Submission {
  id: string;
  full_name: string;
  email: string;
  mobile: string | null;
  country_code: string | null;
  form_data: Record<string, any> | null;
}

const AdminDetailedIntake = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('id, full_name, email, mobile, country_code, form_data')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) {
        toast({ title: 'Submission not found', variant: 'destructive' });
        navigate('/applications');
        return;
      }
      setSubmission(data as Submission);
      setLoading(false);
    })();
  }, [id, navigate, toast]);

  if (loading || !submission) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const fd = submission.form_data || {};

  // Build initial values: prefer detailed intake fields if they exist, otherwise prefill from short intake
  const initial: Record<string, any> = {
    ...fd,
    fullName: fd.fullName || submission.full_name || '',
    email: fd.email || submission.email || '',
    mobile: fd.mobile || (submission.mobile || '').replace(/^\+\d+/, '') || '',
    mobileCode: fd.mobileCode || submission.country_code || '+91',
    city: fd.city || '',
  };

  return (
    <div className="-m-6">
      <div className="px-4 sm:px-6 pt-4">
        <Link to="/applications" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Applications
        </Link>
      </div>
      <ApplyLGT
        adminMode
        submissionId={submission.id}
        initialData={initial}
        onAdminSaved={() => navigate('/applications')}
      />
    </div>
  );
};

export default AdminDetailedIntake;
