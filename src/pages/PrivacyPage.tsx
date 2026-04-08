import BackToHome from '@/components/BackToHome';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: April 2026</p>

      <div className="prose prose-sm max-w-none text-foreground space-y-4">
        <h2 className="text-lg font-semibold">1. Information We Collect</h2>
        <p>We collect information you provide during registration (name, email, phone, occupation, location), coaching data (worksheets, assessments, session notes), and usage data (pages visited, features used).</p>

        <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
        <p>Your data is used to: deliver coaching services, track your transformation progress, personalize your experience, communicate with you, and improve our platform.</p>

        <h2 className="text-lg font-semibold">3. Data Security</h2>
        <p>We use industry-standard security measures including encryption at rest and in transit, row-level security policies, and secure authentication. Your data is stored on servers within India.</p>

        <h2 className="text-lg font-semibold">4. Data Sharing</h2>
        <p>We do not sell, trade, or share your personal information with third parties. Your coaching data is visible only to you and your assigned coach. Aggregated, anonymized data may be used for research and platform improvement.</p>

        <h2 className="text-lg font-semibold">5. Your Rights</h2>
        <p>You have the right to: access your personal data, request corrections, download your data, and request deletion of your account. Contact us at <a href="mailto:support@vdts.in" className="text-primary underline">support@vdts.in</a> for any data-related requests.</p>

        <h2 className="text-lg font-semibold">6. Cookies</h2>
        <p>We use essential cookies for authentication and session management. No third-party tracking cookies are used.</p>

        <h2 className="text-lg font-semibold">7. Changes</h2>
        <p>We may update this policy periodically. You will be notified of significant changes via the platform.</p>
      </div>
    </div>
  );
}
