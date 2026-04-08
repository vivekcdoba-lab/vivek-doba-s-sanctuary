import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Shield, Clock, User, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import DigitalSignature from '@/components/DigitalSignature';
import { exportSessionPdf } from '@/lib/sessionPdfExport';
import { toast } from 'sonner';

interface SessionData {
  id: string;
  session_number: number;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  session_notes: string | null;
  key_insights: string | null;
  breakthroughs: string | null;
  topics_covered: string[] | null;
  seeker_id: string;
  course_id: string | null;
}

interface SignatureData {
  id: string;
  signer_role: string;
  storage_path: string;
  signed_at: string;
  content_hash: string;
  typed_name: string | null;
  signer_id: string;
}

const SessionCertification = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [session, setSession] = useState<SessionData | null>(null);
  const [seekerProfile, setSeekerProfile] = useState<{ full_name: string } | null>(null);
  const [courseName, setCourseName] = useState('');
  const [signatures, setSignatures] = useState<SignatureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadSession();
  }, [id]);

  const loadSession = async () => {
    setLoading(true);
    try {
      // Load session
      const { data: sessionData, error: sessionErr } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id!)
        .single();
      if (sessionErr) throw sessionErr;
      setSession(sessionData);

      // Load seeker profile
      const { data: seekerData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', sessionData.seeker_id)
        .single();
      setSeekerProfile(seekerData);

      // Load course
      if (sessionData.course_id) {
        const { data: courseData } = await supabase
          .from('courses')
          .select('name')
          .eq('id', sessionData.course_id)
          .single();
        setCourseName(courseData?.name || '');
      }

      // Load signatures
      const { data: sigData } = await supabase
        .from('session_signatures')
        .select('*')
        .eq('session_id', id!);
      setSignatures(sigData || []);
    } catch (err) {
      console.error('Failed to load session:', err);
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const seekerSig = signatures.find(s => s.signer_role === 'seeker');
  const coachSig = signatures.find(s => s.signer_role === 'coach');
  const bothSigned = !!seekerSig && !!coachSig;
  const isAdmin = profile?.role === 'admin';
  const isSeeker = session?.seeker_id === profile?.id;

  const contentForHash = JSON.stringify({
    session_id: session?.id,
    notes: session?.session_notes,
    insights: session?.key_insights,
    breakthroughs: session?.breakthroughs,
    topics: session?.topics_covered,
  });

  const handleExportPdf = async () => {
    if (!session) return;
    setExporting(true);
    try {
      await exportSessionPdf({
        sessionNumber: session.session_number,
        date: session.date,
        duration: `${session.duration_minutes} minutes`,
        seekerName: seekerProfile?.full_name || 'Seeker',
        coachName: 'Coach Vivek Doba',
        courseName: courseName,
        topics: (session.topics_covered as string[]) || [],
        notes: session.session_notes || '',
        insights: session.key_insights || '',
        breakthroughs: session.breakthroughs || '',
        seekerSignature: seekerSig ? {
          storage_path: seekerSig.storage_path,
          signed_at: seekerSig.signed_at,
          content_hash: seekerSig.content_hash || '',
          typed_name: seekerSig.typed_name || undefined,
        } : undefined,
        coachSignature: coachSig ? {
          storage_path: coachSig.storage_path,
          signed_at: coachSig.signed_at,
          content_hash: coachSig.content_hash || '',
          typed_name: coachSig.typed_name || undefined,
        } : undefined,
      });
      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleSignatureComplete = () => {
    loadSession(); // Refresh signatures
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Session not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline text-sm">Go back</button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Session Certification</h1>
          <p className="text-sm text-muted-foreground">Session #{session.session_number} · {session.date}</p>
        </div>
      </div>

      {/* Certification Status Banner */}
      {bothSigned && (
        <div className="bg-green-500/10 border-2 border-green-500/30 rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">✅</div>
          <h2 className="text-lg font-bold text-green-600 dark:text-green-400">Session Certified</h2>
          <p className="text-sm text-muted-foreground mt-1">Both parties have digitally signed this session record</p>
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 mx-auto hover:opacity-90 disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download Certified PDF
          </button>
        </div>
      )}

      {/* Session Details Card */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" /> Session Details
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Seeker</p>
            <p className="font-medium text-foreground">{seekerProfile?.full_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Date</p>
            <p className="font-medium text-foreground">{session.date}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Duration</p>
            <p className="font-medium text-foreground">{session.duration_minutes} min</p>
          </div>
          <div>
            <p className="text-muted-foreground">Course</p>
            <p className="font-medium text-foreground">{courseName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium text-foreground capitalize">{session.status}</p>
          </div>
        </div>

        {session.topics_covered && (session.topics_covered as string[]).length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Topics</p>
            <div className="flex flex-wrap gap-1.5">
              {(session.topics_covered as string[]).map((topic, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">{topic}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Session Content */}
      {(session.session_notes || session.key_insights || session.breakthroughs) && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">📝 Session Content</h3>
          {session.session_notes && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{session.session_notes}</p>
            </div>
          )}
          {session.key_insights && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Key Insights</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{session.key_insights}</p>
            </div>
          )}
          {session.breakthroughs && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Breakthroughs</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{session.breakthroughs}</p>
            </div>
          )}
        </div>
      )}

      {/* Digital Signatures */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Digital Signatures
        </h3>
        <p className="text-xs text-muted-foreground">
          Signatures are secured with SHA-256 content hashing. Each signature creates a tamper-evident verification ID.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seeker Signature */}
          <DigitalSignature
            sessionId={session.id}
            signerId={profile?.id || ''}
            signerRole="seeker"
            signerName={seekerProfile?.full_name || 'Seeker'}
            contentToHash={contentForHash}
            existingSignature={seekerSig ? {
              storage_path: seekerSig.storage_path,
              signed_at: seekerSig.signed_at,
              content_hash: seekerSig.content_hash || '',
              typed_name: seekerSig.typed_name || undefined,
            } : null}
            disabled={!isSeeker && !isAdmin}
            onSigned={handleSignatureComplete}
          />

          {/* Coach Signature */}
          <DigitalSignature
            sessionId={session.id}
            signerId={profile?.id || ''}
            signerRole="coach"
            signerName="Coach Vivek Doba"
            contentToHash={contentForHash}
            existingSignature={coachSig ? {
              storage_path: coachSig.storage_path,
              signed_at: coachSig.signed_at,
              content_hash: coachSig.content_hash || '',
              typed_name: coachSig.typed_name || undefined,
            } : null}
            disabled={!isAdmin}
            onSigned={handleSignatureComplete}
          />
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-muted/30 rounded-xl p-4 border border-dashed border-border">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Shield className="w-3 h-3" />
          Signatures are digitally verified with SHA-256 content hashes. Verification IDs are tamper-evident — any content change after signing invalidates the hash.
        </p>
      </div>

      {/* PDF Export Button (when not both signed yet) */}
      {!bothSigned && (seekerSig || coachSig) && (
        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="w-full py-3 rounded-xl border border-primary text-primary font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/5 disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download Session PDF (Partial)
        </button>
      )}
    </div>
  );
};

export default SessionCertification;
