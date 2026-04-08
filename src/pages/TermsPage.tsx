import BackToHome from '@/components/BackToHome';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Last updated: April 2026</p>

      <div className="prose prose-sm max-w-none text-foreground space-y-4">
        <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
        <p>By accessing or using the VDTS (Vivek Doba Training Solutions) platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>

        <h2 className="text-lg font-semibold">2. Services</h2>
        <p>VDTS provides life coaching, business coaching, and spiritual coaching services through its online platform, including daily worksheets, assessments, session management, and resource libraries.</p>

        <h2 className="text-lg font-semibold">3. User Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration. Sharing your account with others is prohibited.</p>

        <h2 className="text-lg font-semibold">4. Coaching Relationship</h2>
        <p>The coaching services provided are for personal and professional development purposes. They do not constitute medical, psychological, or financial advice. Please consult qualified professionals for specific concerns.</p>

        <h2 className="text-lg font-semibold">5. Payment Terms</h2>
        <p>Program fees are communicated during enrollment. All payments are subject to applicable GST. Refund policies are communicated at the time of enrollment.</p>

        <h2 className="text-lg font-semibold">6. Intellectual Property</h2>
        <p>All content, frameworks (including LGT, K.S.H.A.M.A., R.A.M., T.A.T.H.A.S.T.U.), materials, and methodologies are the exclusive property of Vivek Doba Training Solutions and may not be reproduced without written permission.</p>

        <h2 className="text-lg font-semibold">7. Limitation of Liability</h2>
        <p>VDTS shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or platform.</p>

        <h2 className="text-lg font-semibold">8. Contact</h2>
        <p>For questions about these terms, contact us at <a href="mailto:support@vdts.in" className="text-primary underline">support@vdts.in</a>.</p>
      </div>
    </div>
  );
}
