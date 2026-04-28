import { lazy, Suspense, type ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Auto-recover from stale chunk errors after a deploy. When code-splitting
// is enabled, every publish produces new hashed chunk filenames; users with
// the previous index.html cached will request chunks that no longer exist.
// On that specific failure we reload once so the browser picks up the fresh
// index.html and its new chunk hashes.
const CHUNK_RELOAD_KEY = "vdts:chunk-reload";
function lazyWithReload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err: any) {
      const msg = String(err?.message || err);
      const isChunkErr =
        msg.includes("Failed to fetch dynamically imported module") ||
        msg.includes("Importing a module script failed") ||
        msg.includes("error loading dynamically imported module") ||
        msg.includes("Unable to preload CSS");
      if (isChunkErr && typeof window !== "undefined" && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
        window.location.reload();
        // Never resolve so React doesn't try to render before reload completes
        return new Promise<{ default: T }>(() => {});
      }
      throw err;
    }
  });
}

// Eagerly loaded — needed for first paint and routing shell
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import AuthGuard from "./components/AuthGuard";
import AdminLayout from "./components/AdminLayout";
import SeekerLayout from "./components/SeekerLayout";
import CoachingLayout from "./components/CoachingLayout";
import WhatsAppSupportButton from "./components/WhatsAppSupportButton";

// Lazy-loaded routes (split into per-route chunks)
const RegisterPage = lazyWithReload(() => import("./pages/RegisterPage"));
const BookAppointment = lazyWithReload(() => import("./pages/BookAppointment"));
const RegisterWorkshop = lazyWithReload(() => import("./pages/RegisterWorkshop"));
const SeekerLgtForm = lazyWithReload(() => import("./pages/SeekerLgtForm"));
const AdminApplyLgt = lazyWithReload(() => import("./pages/admin/AdminApplyLgt"));
const TellUsAboutYourself = lazyWithReload(() => import("./pages/TellUsAboutYourself"));
const PlaceholderPage = lazyWithReload(() => import("./pages/PlaceholderPage"));

const AdminDashboard = lazyWithReload(() => import("./pages/admin/Dashboard"));
const SeekersPage = lazyWithReload(() => import("./pages/admin/SeekersPage"));
const SeekerDetailPage = lazyWithReload(() => import("./pages/admin/SeekerDetailPage"));
const CoursesPage = lazyWithReload(() => import("./pages/admin/CoursesPage"));
const LeadsPage = lazyWithReload(() => import("./pages/admin/LeadsPage"));
const SessionsPage = lazyWithReload(() => import("./pages/admin/SessionsPage"));
const AssignmentsPage = lazyWithReload(() => import("./pages/admin/AssignmentsPage"));
const PaymentsPage = lazyWithReload(() => import("./pages/admin/PaymentsPage"));
const ResourcesPage = lazyWithReload(() => import("./pages/admin/ResourcesPage"));
const FollowUpsPage = lazyWithReload(() => import("./pages/admin/FollowUpsPage"));
const MessagesPage = lazyWithReload(() => import("./pages/admin/MessagesPage"));
const ReportsPage = lazyWithReload(() => import("./pages/admin/ReportsPage"));
const AssessmentsPage = lazyWithReload(() => import("./pages/admin/AssessmentsPage"));
const SettingsPage = lazyWithReload(() => import("./pages/admin/SettingsPage"));
const CalendarPage = lazyWithReload(() => import("./pages/admin/CalendarPage"));
const DailyTrackingPage = lazyWithReload(() => import("./pages/admin/DailyTrackingPage"));
const GrowthMatrixPage = lazyWithReload(() => import("./pages/admin/GrowthMatrixPage"));
const ApplicationsPage = lazyWithReload(() => import("./pages/admin/ApplicationsPage"));
const AdminDetailedIntake = lazyWithReload(() => import("./pages/admin/AdminDetailedIntake"));
const CoachDayView = lazyWithReload(() => import("./pages/admin/CoachDayView"));
const WorksheetAnalyticsPage = lazyWithReload(() => import("./pages/admin/WorksheetAnalyticsPage"));
const SessionCertification = lazyWithReload(() => import("./pages/admin/SessionCertification"));
const SessionReviewPage = lazyWithReload(() => import("./pages/admin/SessionReviewPage"));
const SessionTemplatesPage = lazyWithReload(() => import("./pages/admin/SessionTemplatesPage"));
const SwotPage = lazyWithReload(() => import("./pages/admin/SwotPage"));
const ActiveSessionsPage = lazyWithReload(() => import("./pages/admin/ActiveSessionsPage"));
const AdminCoaches = lazyWithReload(() => import("./pages/admin/AdminCoaches"));
const AdminLinkedProfiles = lazyWithReload(() => import("./pages/admin/AdminLinkedProfiles"));
const AdminCoachSeekers = lazyWithReload(() => import("./pages/admin/AdminCoachSeekers"));
const AdminAdmins = lazyWithReload(() => import("./pages/admin/AdminAdmins"));
const AdminAddUser = lazyWithReload(() => import("./pages/admin/AdminAddUser"));
const AdminUserAnalytics = lazyWithReload(() => import("./pages/admin/AdminUserAnalytics"));
const AdminSearchUsers = lazyWithReload(() => import("./pages/admin/AdminSearchUsers"));
const AdminCreateProgram = lazyWithReload(() => import("./pages/admin/AdminCreateProgram"));
const AdminEditPrograms = lazyWithReload(() => import("./pages/admin/AdminEditPrograms"));
const AdminProgramCoaches = lazyWithReload(() => import("./pages/admin/AdminProgramCoaches"));
const AdminProgramAnalytics = lazyWithReload(() => import("./pages/admin/AdminProgramAnalytics"));
const AdminEnrollments = lazyWithReload(() => import("./pages/admin/AdminEnrollments"));
const AdminNewEnrollment = lazyWithReload(() => import("./pages/admin/AdminNewEnrollment"));
const AdminBatches = lazyWithReload(() => import("./pages/admin/AdminBatches"));
const AdminEnrollmentStats = lazyWithReload(() => import("./pages/admin/AdminEnrollmentStats"));
const AdminAddLead = lazyWithReload(() => import("./pages/admin/AdminAddLead"));
const AdminAllLeads = lazyWithReload(() => import("./pages/admin/AdminAllLeads"));
const AdminHotLeads = lazyWithReload(() => import("./pages/admin/AdminHotLeads"));
const AdminConversionFunnel = lazyWithReload(() => import("./pages/admin/AdminConversionFunnel"));
const AdminLeadSources = lazyWithReload(() => import("./pages/admin/AdminLeadSources"));
const AdminRecordPayment = lazyWithReload(() => import("./pages/admin/AdminRecordPayment"));
const AdminInvoices = lazyWithReload(() => import("./pages/admin/AdminInvoices"));
const AdminOverduePayments = lazyWithReload(() => import("./pages/admin/AdminOverduePayments"));
const AdminRevenue = lazyWithReload(() => import("./pages/admin/AdminRevenue"));
const AdminExportFinancials = lazyWithReload(() => import("./pages/admin/AdminExportFinancials"));
const AdminVideos = lazyWithReload(() => import("./pages/admin/AdminVideos"));
const AdminAudios = lazyWithReload(() => import("./pages/admin/AdminAudios"));
const AdminUploadResource = lazyWithReload(() => import("./pages/admin/AdminUploadResource"));
const AdminCategories = lazyWithReload(() => import("./pages/admin/AdminCategories"));
const AdminQuestionBank = lazyWithReload(() => import("./pages/admin/AdminQuestionBank"));
const AdminCreateAssessment = lazyWithReload(() => import("./pages/admin/AdminCreateAssessment"));
const AdminAnnouncements = lazyWithReload(() => import("./pages/admin/AdminAnnouncements"));
const AdminCompetitors = lazyWithReload(() => import("./pages/admin/AdminCompetitors"));
const AdminBusinessMetrics = lazyWithReload(() => import("./pages/admin/AdminBusinessMetrics"));
const AdminStrategicGoals = lazyWithReload(() => import("./pages/admin/AdminStrategicGoals"));
const AdminUserGrowth = lazyWithReload(() => import("./pages/admin/AdminUserGrowth"));
const AdminEngagement = lazyWithReload(() => import("./pages/admin/AdminEngagement"));
const AdminCoachPerformance = lazyWithReload(() => import("./pages/admin/AdminCoachPerformance"));
const AdminRetention = lazyWithReload(() => import("./pages/admin/AdminRetention"));
const AdminExportReports = lazyWithReload(() => import("./pages/admin/AdminExportReports"));
const AdminBranding = lazyWithReload(() => import("./pages/admin/AdminBranding"));
const AdminNotificationsPage = lazyWithReload(() => import("./pages/admin/AdminNotificationsPage"));
const AdminIntegrations = lazyWithReload(() => import("./pages/admin/AdminIntegrations"));
const AdminAuditLogs = lazyWithReload(() => import("./pages/admin/AdminAuditLogs"));
const AdminBackup = lazyWithReload(() => import("./pages/admin/AdminBackup"));
const AdminAssessmentConfig = lazyWithReload(() => import("./pages/admin/AdminAssessmentConfig"));
const AdminAssessmentAnalytics = lazyWithReload(() => import("./pages/admin/AdminAssessmentAnalytics"));
const AdminEncryptionStatus = lazyWithReload(() => import("./pages/admin/AdminEncryptionStatus"));
const AdminDocuments = lazyWithReload(() => import("./pages/admin/AdminDocuments"));
const SignDocument = lazyWithReload(() => import("./pages/SignDocument"));

const SeekerHome = lazyWithReload(() => import("./pages/seeker/SeekerHome"));
const SeekerDailyLog = lazyWithReload(() => import("./pages/seeker/SeekerDailyLog"));
const SacredSpace = lazyWithReload(() => import("./pages/seeker/SacredSpace"));
const SeekerGrowth = lazyWithReload(() => import("./pages/seeker/SeekerGrowth"));
const WheelOfLifePage = lazyWithReload(() => import("./pages/seeker/assessments/WheelOfLifePage"));
const SwotAssessmentPage = lazyWithReload(() => import("./pages/seeker/assessments/SwotAssessmentPage"));
const LgtAssessmentPage = lazyWithReload(() => import("./pages/seeker/assessments/LgtAssessmentPage"));
const PurusharthasPage = lazyWithReload(() => import("./pages/seeker/assessments/PurusharthasPage"));
const HappinessPage = lazyWithReload(() => import("./pages/seeker/assessments/HappinessPage"));
const MoochPage = lazyWithReload(() => import("./pages/seeker/assessments/MoochPage"));
const SeekerFiroBPage = lazyWithReload(() => import("./pages/seeker/assessments/FiroBPage"));
const AssessmentHistoryPage = lazyWithReload(() => import("./pages/seeker/assessments/AssessmentHistoryPage"));
const SeekerPayments = lazyWithReload(() => import("./pages/seeker/SeekerPayments"));
const SeekerTasks = lazyWithReload(() => import("./pages/seeker/SeekerTasks"));
const SeekerProfile = lazyWithReload(() => import("./pages/seeker/SeekerProfile"));
const SeekerJourney = lazyWithReload(() => import("./pages/seeker/SeekerJourney"));
const SeekerMessages = lazyWithReload(() => import("./pages/seeker/SeekerMessages"));
const SeekerWeeklyReview = lazyWithReload(() => import("./pages/seeker/SeekerWeeklyReview"));
const DailyWorksheet = lazyWithReload(() => import("./pages/seeker/DailyWorksheet"));
const SeekerTopics = lazyWithReload(() => import("./pages/seeker/SeekerTopics"));
const SeekerSessionDetail = lazyWithReload(() => import("./pages/seeker/SeekerSessionDetail"));
const SeekerLGTScore = lazyWithReload(() => import("./pages/seeker/SeekerLGTScore"));
const SeekerUpcomingSessions = lazyWithReload(() => import("./pages/seeker/SeekerUpcomingSessions"));
const SeekerSessionHistory = lazyWithReload(() => import("./pages/seeker/SeekerSessionHistory"));
const SeekerTasksEnhanced = lazyWithReload(() => import("./pages/seeker/SeekerTasksEnhanced"));
const SeekerDharmaMission = lazyWithReload(() => import("./pages/seeker/SeekerDharmaMission"));
const SeekerDharmaValues = lazyWithReload(() => import("./pages/seeker/SeekerDharmaValues"));
const SeekerDharmaJournal = lazyWithReload(() => import("./pages/seeker/SeekerDharmaJournal"));
const SeekerDharmaPractices = lazyWithReload(() => import("./pages/seeker/SeekerDharmaPractices"));
const SeekerMokshaMeditation = lazyWithReload(() => import("./pages/seeker/SeekerMokshaMeditation"));
const SeekerMokshaGoals = lazyWithReload(() => import("./pages/seeker/SeekerMokshaGoals"));
const SeekerMokshaJournal = lazyWithReload(() => import("./pages/seeker/SeekerMokshaJournal"));
const SeekerKamaGoals = lazyWithReload(() => import("./pages/seeker/SeekerKamaGoals"));
const SeekerKamaFamily = lazyWithReload(() => import("./pages/seeker/SeekerKamaFamily"));
const SeekerBadges = lazyWithReload(() => import("./pages/seeker/SeekerBadges"));
const SeekerPoints = lazyWithReload(() => import("./pages/seeker/SeekerPoints"));
const SeekerArthaDashboard = lazyWithReload(() => import("./pages/seeker/SeekerArthaDashboard"));
const ArthaBusinessProfile = lazyWithReload(() => import("./pages/seeker/ArthaBusinessProfile"));
const ArthaVisionMission = lazyWithReload(() => import("./pages/seeker/ArthaVisionMission"));
const ArthaMarketing = lazyWithReload(() => import("./pages/seeker/ArthaMarketing"));
const ArthaBranding = lazyWithReload(() => import("./pages/seeker/ArthaBranding"));
const ArthaSales = lazyWithReload(() => import("./pages/seeker/ArthaSales"));
const ArthaAccounting = lazyWithReload(() => import("./pages/seeker/ArthaAccounting"));
const ArthaCashflow = lazyWithReload(() => import("./pages/seeker/ArthaCashflow"));
const ArthaTeam = lazyWithReload(() => import("./pages/seeker/ArthaTeam"));
const ArthaRnD = lazyWithReload(() => import("./pages/seeker/ArthaRnD"));
const ArthaSatisfaction = lazyWithReload(() => import("./pages/seeker/ArthaSatisfaction"));
const ArthaDepartments = lazyWithReload(() => import("./pages/seeker/ArthaDepartments"));
const ArthaSwot = lazyWithReload(() => import("./pages/seeker/ArthaSwot"));
const ArthaCompetitors = lazyWithReload(() => import("./pages/seeker/ArthaCompetitors"));
const SeekerWorksheetHistory = lazyWithReload(() => import("./pages/seeker/SeekerWorksheetHistory"));
const SeekerStreaks = lazyWithReload(() => import("./pages/seeker/SeekerStreaks"));
const SeekerLeaderboard = lazyWithReload(() => import("./pages/seeker/SeekerLeaderboard"));
const SeekerProgressCharts = lazyWithReload(() => import("./pages/seeker/SeekerProgressCharts"));
const SeekerAssessmentHistory = lazyWithReload(() => import("./pages/seeker/SeekerAssessmentHistory"));
const SeekerPersonality = lazyWithReload(() => import("./pages/seeker/SeekerPersonality"));
const SeekerLearningVideos = lazyWithReload(() => import("./pages/seeker/SeekerLearningVideos"));
const SeekerLearningAudio = lazyWithReload(() => import("./pages/seeker/SeekerLearningAudio"));
const SeekerLearningPdfs = lazyWithReload(() => import("./pages/seeker/SeekerLearningPdfs"));
const SeekerLearningFrameworks = lazyWithReload(() => import("./pages/seeker/SeekerLearningFrameworks"));
const SeekerBookmarks = lazyWithReload(() => import("./pages/seeker/SeekerBookmarks"));
const SeekerNotifications = lazyWithReload(() => import("./pages/seeker/SeekerNotifications"));
const SeekerAnnouncements = lazyWithReload(() => import("./pages/seeker/SeekerAnnouncements"));
const SeekerHelp = lazyWithReload(() => import("./pages/seeker/SeekerHelp"));
const SeekerLiveSession = lazyWithReload(() => import("./pages/seeker/SeekerLiveSession"));
const SeekerSessionNotes = lazyWithReload(() => import("./pages/seeker/SeekerSessionNotes"));
const SeekerFeedback = lazyWithReload(() => import("./pages/seeker/SeekerFeedback"));
const SeekerSubmitAssignment = lazyWithReload(() => import("./pages/seeker/SeekerSubmitAssignment"));
const SeekerCoachFeedback = lazyWithReload(() => import("./pages/seeker/SeekerCoachFeedback"));
const SeekerKamaSocial = lazyWithReload(() => import("./pages/seeker/SeekerKamaSocial"));
const SeekerKamaDesires = lazyWithReload(() => import("./pages/seeker/SeekerKamaDesires"));
const SeekerMokshaConsciousness = lazyWithReload(() => import("./pages/seeker/SeekerMokshaConsciousness"));
const SeekerTimeSheet = lazyWithReload(() => import("./pages/seeker/SeekerTimeSheet"));
const SeekerChallenges = lazyWithReload(() => import("./pages/seeker/SeekerChallenges"));
const SeekerGratitudeWall = lazyWithReload(() => import("./pages/seeker/SeekerGratitudeWall"));
const SeekerWinJournal = lazyWithReload(() => import("./pages/seeker/SeekerWinJournal"));
const SeekerTransformationTimeline = lazyWithReload(() => import("./pages/seeker/SeekerTransformationTimeline"));
const SeekerIkigai = lazyWithReload(() => import("./pages/seeker/SeekerIkigai"));
const SeekerMeditationTimer = lazyWithReload(() => import("./pages/seeker/SeekerMeditationTimer"));
const SeekerRelationshipTracker = lazyWithReload(() => import("./pages/seeker/SeekerRelationshipTracker"));

const CoachingDashboard = lazyWithReload(() => import("./pages/coaching/CoachingDashboard"));
const ClientIntakePage = lazyWithReload(() => import("./pages/coaching/ClientIntakePage"));
const AgreementsPage = lazyWithReload(() => import("./pages/coaching/AgreementsPage"));
const PremiumAgreementPage = lazyWithReload(() => import("./pages/coaching/PremiumAgreementPage"));
const FiroBPage = lazyWithReload(() => import("./pages/coaching/FiroBPage"));
const CoachingSessionNotes = lazyWithReload(() => import("./pages/coaching/CoachingSessionNotes"));
const CoachingPlanner = lazyWithReload(() => import("./pages/coaching/CoachingPlanner"));
const CoachingHomework = lazyWithReload(() => import("./pages/coaching/CoachingHomework"));
const CoachingProgress = lazyWithReload(() => import("./pages/coaching/CoachingProgress"));
const CoachWorksheetPending = lazyWithReload(() => import("./pages/coaching/CoachWorksheetPending"));
const CoachWorksheetReviewed = lazyWithReload(() => import("./pages/coaching/CoachWorksheetReviewed"));
const CoachWorksheetStats = lazyWithReload(() => import("./pages/coaching/CoachWorksheetStats"));
const CoachWorksheetMissed = lazyWithReload(() => import("./pages/coaching/CoachWorksheetMissed"));
const CoachSchedule = lazyWithReload(() => import("./pages/coaching/CoachSchedule"));
const CoachTodaySessions = lazyWithReload(() => import("./pages/coaching/CoachTodaySessions"));
const CoachPastSessions = lazyWithReload(() => import("./pages/coaching/CoachPastSessions"));
const CoachSessionAnalytics = lazyWithReload(() => import("./pages/coaching/CoachSessionAnalytics"));
const CoachCreateAssignment = lazyWithReload(() => import("./pages/coaching/CoachCreateAssignment"));
const CoachPendingSubmissions = lazyWithReload(() => import("./pages/coaching/CoachPendingSubmissions"));
const CoachReviewedAssignments = lazyWithReload(() => import("./pages/coaching/CoachReviewedAssignments"));
const CoachCompletionRate = lazyWithReload(() => import("./pages/coaching/CoachCompletionRate"));
const CoachBroadcast = lazyWithReload(() => import("./pages/coaching/CoachBroadcast"));
const CoachWeeklyReport = lazyWithReload(() => import("./pages/coaching/CoachWeeklyReport"));
const CoachAllSeekers = lazyWithReload(() => import("./pages/coaching/CoachAllSeekers"));
const CoachSeekersActive = lazyWithReload(() => import("./pages/coaching/CoachSeekersActive"));
const CoachSeekersAttention = lazyWithReload(() => import("./pages/coaching/CoachSeekersAttention"));
const CoachSeekersOntrack = lazyWithReload(() => import("./pages/coaching/CoachSeekersOntrack"));
const CoachSeekersSearch = lazyWithReload(() => import("./pages/coaching/CoachSeekersSearch"));
const CoachGenerateReports = lazyWithReload(() => import("./pages/coaching/CoachGenerateReports"));
const CoachBusinesses = lazyWithReload(() => import("./pages/coaching/CoachBusinesses"));
const CoachSwotReviews = lazyWithReload(() => import("./pages/coaching/CoachSwotReviews"));
const CoachDeptHealth = lazyWithReload(() => import("./pages/coaching/CoachDeptHealth"));
const CoachBusinessNotes = lazyWithReload(() => import("./pages/coaching/CoachBusinessNotes"));
const CoachMessages = lazyWithReload(() => import("./pages/coaching/CoachMessages"));
const CoachTemplates = lazyWithReload(() => import("./pages/coaching/CoachTemplates"));
const CoachAnnouncements = lazyWithReload(() => import("./pages/coaching/CoachAnnouncements"));
const CoachEngagement = lazyWithReload(() => import("./pages/coaching/CoachEngagement"));
const CoachProgressReport = lazyWithReload(() => import("./pages/coaching/CoachProgressReport"));
const CoachArthaProgress = lazyWithReload(() => import("./pages/coaching/CoachArthaProgress"));
const CoachExport = lazyWithReload(() => import("./pages/coaching/CoachExport"));
const CoachSettings = lazyWithReload(() => import("./pages/coaching/CoachSettings"));
const CoachSeekerAssessments = lazyWithReload(() => import("./pages/coaching/CoachSeekerAssessments"));
const CoachSeekerDetail = lazyWithReload(() => import("./pages/coaching/CoachSeekerDetail"));
const CoachAssessmentAnalytics = lazyWithReload(() => import("./pages/coaching/CoachAssessmentAnalytics"));

const ResetPassword = lazyWithReload(() => import("./pages/ResetPassword"));
const NotFound = lazyWithReload(() => import("./pages/NotFound"));
const HelpPage = lazyWithReload(() => import("./pages/HelpPage"));
const TermsPage = lazyWithReload(() => import("./pages/TermsPage"));
const PrivacyPage = lazyWithReload(() => import("./pages/PrivacyPage"));
const SeoLifeCoaching = lazyWithReload(() => import("./pages/seo/LifeCoaching"));
const SeoBusinessCoaching = lazyWithReload(() => import("./pages/seo/BusinessCoaching"));
const SeoManifestation = lazyWithReload(() => import("./pages/seo/Manifestation"));
const SeoMeditation = lazyWithReload(() => import("./pages/seo/Meditation"));
const SeoDharmaPhilosophy = lazyWithReload(() => import("./pages/seo/DharmaPhilosophy"));
const SeoNlpCoach = lazyWithReload(() => import("./pages/seo/NlpCoach"));
const SeoSalesCoach = lazyWithReload(() => import("./pages/seo/SalesCoach"));
const SeoLifeCoachLocation = lazyWithReload(() => import("./pages/seo/LifeCoachLocation"));
const SeoBusinessCoachLocation = lazyWithReload(() => import("./pages/seo/BusinessCoachLocation"));

const queryClient = new QueryClient();

const P = PlaceholderPage;

const RouteFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Main bundle loaded successfully — clear the one-shot reload guard so a
// future stale-chunk error can also recover.
if (typeof window !== "undefined") {
  try { sessionStorage.removeItem(CHUNK_RELOAD_KEY); } catch {}
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/register-workshop" element={<RegisterWorkshop />} />
            {/* Legacy public route — now admin-only */}
            <Route path="/apply-lgt" element={<Navigate to="/login" replace />} />
            {/* Public seeker invite link — token-gated */}
            <Route path="/lgt-form/:token" element={<SeekerLgtForm />} />
            <Route path="/get-started" element={<TellUsAboutYourself />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/life-coaching" element={<SeoLifeCoaching />} />
            <Route path="/business-coaching" element={<SeoBusinessCoaching />} />
            <Route path="/manifestation" element={<SeoManifestation />} />
            <Route path="/meditation" element={<SeoMeditation />} />
            <Route path="/dharma-philosophy" element={<SeoDharmaPhilosophy />} />
            <Route path="/nlp-coach" element={<SeoNlpCoach />} />
            <Route path="/sales-coach" element={<SeoSalesCoach />} />
            <Route path="/life-coach-in-:location" element={<SeoLifeCoachLocation />} />
            <Route path="/business-coach-in-:location" element={<SeoBusinessCoachLocation />} />
            <Route path="/sign/:token" element={<SignDocument />} />

            {/* Admin Routes */}
            <Route element={<AuthGuard requiredRole="admin"><AdminLayout /></AuthGuard>}>
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/coach-day" element={<CoachDayView />} />
              <Route path="/seekers" element={<SeekersPage />} />
              <Route path="/seekers/:id" element={<SeekerDetailPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/assignments" element={<AssignmentsPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/follow-ups" element={<FollowUpsPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/assessments" element={<AssessmentsPage />} />
              <Route path="/daily-tracking" element={<DailyTrackingPage />} />
              <Route path="/growth-matrix" element={<GrowthMatrixPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/applications/:id/detailed-intake" element={<AdminDetailedIntake />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/worksheet-analytics" element={<WorksheetAnalyticsPage />} />
              <Route path="/sessions/:id/certify" element={<SessionCertification />} />
              <Route path="/sessions/:id/review" element={<SessionReviewPage />} />
              <Route path="/session-templates" element={<SessionTemplatesPage />} />
              <Route path="/swot" element={<SwotPage />} />
              <Route path="/active-sessions" element={<ActiveSessionsPage />} />
              {/* Legacy redirects */}
              <Route path="/admin/seekers" element={<Navigate to="/seekers" replace />} />
              {/* Admin placeholder routes */}
              <Route path="/admin/coaches" element={<AdminCoaches />} />
              <Route path="/admin/linked-profiles" element={<AdminLinkedProfiles />} />
              <Route path="/admin/coach-seekers" element={<AdminCoachSeekers />} />
              <Route path="/admin/documents" element={<AdminDocuments />} />
              <Route path="/admin/admins" element={<AdminAdmins />} />
              <Route path="/admin/add-user" element={<AdminAddUser />} />
              <Route path="/admin/user-analytics" element={<AdminUserAnalytics />} />
              <Route path="/admin/search-users" element={<AdminSearchUsers />} />
              <Route path="/admin/create-program" element={<AdminCreateProgram />} />
              <Route path="/admin/edit-programs" element={<AdminEditPrograms />} />
              <Route path="/admin/program-coaches" element={<AdminProgramCoaches />} />
              <Route path="/admin/program-analytics" element={<AdminProgramAnalytics />} />
              <Route path="/admin/enrollments" element={<AdminEnrollments />} />
              <Route path="/admin/new-enrollment" element={<AdminNewEnrollment />} />
              <Route path="/admin/apply-lgt" element={<AdminApplyLgt />} />
              <Route path="/admin/batches" element={<AdminBatches />} />
              <Route path="/admin/enrollment-stats" element={<AdminEnrollmentStats />} />
              <Route path="/admin/add-lead" element={<AdminAddLead />} />
              <Route path="/admin/all-leads" element={<AdminAllLeads />} />
              <Route path="/admin/hot-leads" element={<AdminHotLeads />} />
              <Route path="/admin/conversion-funnel" element={<AdminConversionFunnel />} />
              <Route path="/admin/lead-sources" element={<AdminLeadSources />} />
              <Route path="/admin/record-payment" element={<AdminRecordPayment />} />
              <Route path="/admin/invoices" element={<AdminInvoices />} />
              <Route path="/admin/overdue-payments" element={<AdminOverduePayments />} />
              <Route path="/admin/revenue" element={<AdminRevenue />} />
              <Route path="/admin/export-financials" element={<AdminExportFinancials />} />
              <Route path="/admin/videos" element={<AdminVideos />} />
              <Route path="/admin/audios" element={<AdminAudios />} />
              <Route path="/admin/upload-resource" element={<AdminUploadResource />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/question-bank" element={<AdminQuestionBank />} />
              <Route path="/admin/create-assessment" element={<AdminCreateAssessment />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
              <Route path="/admin/competitors" element={<AdminCompetitors />} />
              <Route path="/admin/business-metrics" element={<AdminBusinessMetrics />} />
              <Route path="/admin/strategic-goals" element={<AdminStrategicGoals />} />
              <Route path="/admin/user-growth" element={<AdminUserGrowth />} />
              <Route path="/admin/engagement" element={<AdminEngagement />} />
              <Route path="/admin/coach-performance" element={<AdminCoachPerformance />} />
              <Route path="/admin/retention" element={<AdminRetention />} />
              <Route path="/admin/export-reports" element={<AdminExportReports />} />
              <Route path="/admin/branding" element={<AdminBranding />} />
              <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
              <Route path="/admin/integrations" element={<AdminIntegrations />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
              <Route path="/admin/backup" element={<AdminBackup />} />
              <Route path="/admin/assessments/configure" element={<AdminAssessmentConfig />} />
              <Route path="/admin/assessments/analytics" element={<AdminAssessmentAnalytics />} />
              <Route path="/admin/encryption-status" element={<AdminEncryptionStatus />} />
            </Route>

            {/* Seeker Routes */}
            <Route path="/seeker" element={<Navigate to="/seeker/home" replace />} />
            <Route element={<AuthGuard requiredRole="seeker"><SeekerLayout /></AuthGuard>}>
              <Route path="/seeker/home" element={<SeekerHome />} />
              <Route path="/seeker/daily-log" element={<SeekerDailyLog />} />
              <Route path="/seeker/tasks" element={<SeekerTasks />} />
              <Route path="/seeker/growth" element={<SeekerGrowth />} />
              <Route path="/seeker/sacred-space" element={<SacredSpace />} />
              <Route path="/seeker/profile" element={<SeekerProfile />} />
              <Route path="/seeker/journey" element={<SeekerJourney />} />
              <Route path="/seeker/assessments" element={<Navigate to="/seeker/assessments/history" replace />} />
              <Route path="/seeker/assessments/wheel-of-life" element={<WheelOfLifePage />} />
              <Route path="/seeker/assessments/swot" element={<SwotAssessmentPage />} />
              <Route path="/seeker/assessments/lgt" element={<LgtAssessmentPage />} />
              <Route path="/seeker/assessments/purusharthas" element={<PurusharthasPage />} />
              <Route path="/seeker/assessments/happiness" element={<HappinessPage />} />
              <Route path="/seeker/assessments/mooch" element={<MoochPage />} />
              <Route path="/seeker/assessments/firo-b" element={<SeekerFiroBPage />} />
              <Route path="/seeker/assessments/history" element={<AssessmentHistoryPage />} />
              <Route path="/seeker/messages" element={<SeekerMessages />} />
              <Route path="/seeker/weekly-review" element={<SeekerWeeklyReview />} />
              <Route path="/seeker/payments" element={<SeekerPayments />} />
              <Route path="/seeker/worksheet" element={<DailyWorksheet />} />
              <Route path="/seeker/topics" element={<SeekerTopics />} />
              <Route path="/seeker/sessions/:id/certify" element={<SessionCertification />} />
              <Route path="/seeker/sessions/:id" element={<SeekerSessionDetail />} />
              <Route path="/seeker/lgt-score" element={<SeekerLGTScore />} />
              <Route path="/seeker/upcoming-sessions" element={<SeekerUpcomingSessions />} />
              <Route path="/seeker/session-history" element={<SeekerSessionHistory />} />
              <Route path="/seeker/completed-tasks" element={<SeekerTasksEnhanced />} />
              {/* Dharma */}
              <Route path="/seeker/dharma/mission" element={<SeekerDharmaMission />} />
              <Route path="/seeker/dharma/values" element={<SeekerDharmaValues />} />
              <Route path="/seeker/dharma/journal" element={<SeekerDharmaJournal />} />
              <Route path="/seeker/dharma/practices" element={<SeekerDharmaPractices />} />
              {/* Artha */}
              <Route path="/seeker/artha" element={<SeekerArthaDashboard />} />
              <Route path="/seeker/artha/dashboard" element={<SeekerArthaDashboard />} />
              <Route path="/seeker/artha/profile" element={<ArthaBusinessProfile />} />
              <Route path="/seeker/artha/vision" element={<ArthaVisionMission />} />
              <Route path="/seeker/artha/values" element={<ArthaVisionMission />} />
              <Route path="/seeker/artha/swot" element={<ArthaSwot />} />
              <Route path="/seeker/artha/marketing" element={<ArthaMarketing />} />
              <Route path="/seeker/artha/branding" element={<ArthaBranding />} />
              <Route path="/seeker/artha/sales" element={<ArthaSales />} />
              <Route path="/seeker/artha/accounting" element={<ArthaAccounting />} />
              <Route path="/seeker/artha/cashflow" element={<ArthaCashflow />} />
              <Route path="/seeker/artha/team" element={<ArthaTeam />} />
              <Route path="/seeker/artha/rnd" element={<ArthaRnD />} />
              <Route path="/seeker/artha/satisfaction" element={<ArthaSatisfaction />} />
              <Route path="/seeker/artha/competitors" element={<ArthaCompetitors />} />
              <Route path="/seeker/artha/departments" element={<ArthaDepartments />} />
              {/* Kama */}
              <Route path="/seeker/kama/goals" element={<SeekerKamaGoals />} />
              <Route path="/seeker/kama/family" element={<SeekerKamaFamily />} />
              <Route path="/seeker/kama/social" element={<SeekerKamaSocial />} />
              <Route path="/seeker/kama/desires" element={<SeekerKamaDesires />} />
              {/* Moksha */}
              <Route path="/seeker/moksha/meditation" element={<SeekerMokshaMeditation />} />
              <Route path="/seeker/moksha/goals" element={<SeekerMokshaGoals />} />
              <Route path="/seeker/moksha/journal" element={<SeekerMokshaJournal />} />
              <Route path="/seeker/moksha/consciousness" element={<SeekerMokshaConsciousness />} />
              {/* Achievements */}
              <Route path="/seeker/badges" element={<SeekerBadges />} />
              <Route path="/seeker/points" element={<SeekerPoints />} />
              <Route path="/seeker/leaderboard" element={<SeekerLeaderboard />} />
              {/* Placeholder routes */}
              <Route path="/seeker/worksheet-history" element={<SeekerWorksheetHistory />} />
              <Route path="/seeker/timesheet" element={<SeekerTimeSheet />} />
              <Route path="/seeker/challenges" element={<SeekerChallenges />} />
              <Route path="/seeker/gratitude-wall" element={<SeekerGratitudeWall />} />
              <Route path="/seeker/win-journal" element={<SeekerWinJournal />} />
              <Route path="/seeker/transformation" element={<SeekerTransformationTimeline />} />
              <Route path="/seeker/dharma/ikigai" element={<SeekerIkigai />} />
              <Route path="/seeker/moksha/meditation-timer" element={<SeekerMeditationTimer />} />
              <Route path="/seeker/kama/relationships" element={<SeekerRelationshipTracker />} />
              <Route path="/seeker/streaks" element={<SeekerStreaks />} />
              <Route path="/seeker/personality" element={<SeekerPersonality />} />
              <Route path="/seeker/progress-charts" element={<SeekerProgressCharts />} />
              <Route path="/seeker/assessment-history" element={<SeekerAssessmentHistory />} />
              <Route path="/seeker/live-session" element={<SeekerLiveSession />} />
              <Route path="/seeker/session-notes" element={<SeekerSessionNotes />} />
              <Route path="/seeker/feedback" element={<SeekerFeedback />} />
              <Route path="/seeker/submit-assignment" element={<SeekerSubmitAssignment />} />
              <Route path="/seeker/coach-feedback" element={<SeekerCoachFeedback />} />
              <Route path="/seeker/learning/videos" element={<SeekerLearningVideos />} />
              <Route path="/seeker/learning/audio" element={<SeekerLearningAudio />} />
              <Route path="/seeker/learning/pdfs" element={<SeekerLearningPdfs />} />
              <Route path="/seeker/learning/frameworks" element={<SeekerLearningFrameworks />} />
              <Route path="/seeker/learning/bookmarks" element={<SeekerBookmarks />} />
              <Route path="/seeker/announcements" element={<SeekerAnnouncements />} />
              <Route path="/seeker/notifications" element={<SeekerNotifications />} />
              <Route path="/seeker/privacy-settings" element={<P />} />
              <Route path="/seeker/help" element={<SeekerHelp />} />
            </Route>

            {/* Coaching Management Routes */}
            <Route element={<AuthGuard requiredRole="coach"><CoachingLayout /></AuthGuard>}>
              <Route path="/coaching" element={<CoachingDashboard />} />
              <Route path="/coaching/intake" element={<ClientIntakePage />} />
              <Route path="/coaching/agreements" element={<AgreementsPage />} />
              <Route path="/coaching/premium-agreement/:seekerId" element={<PremiumAgreementPage />} />
              <Route path="/coaching/firo-b" element={<FiroBPage />} />
              <Route path="/coaching/sessions" element={<CoachingSessionNotes />} />
              <Route path="/coaching/planner" element={<CoachingPlanner />} />
              <Route path="/coaching/homework" element={<CoachingHomework />} />
              <Route path="/coaching/progress" element={<CoachingProgress />} />
              {/* Coach placeholder routes */}
              <Route path="/coaching/seekers" element={<CoachAllSeekers />} />
              <Route path="/coaching/seekers-active" element={<CoachSeekersActive />} />
              <Route path="/coaching/seekers-attention" element={<CoachSeekersAttention />} />
              <Route path="/coaching/seekers-ontrack" element={<CoachSeekersOntrack />} />
              <Route path="/coaching/seekers-search" element={<CoachSeekersSearch />} />
              <Route path="/coaching/worksheet-pending" element={<CoachWorksheetPending />} />
              <Route path="/coaching/worksheet-reviewed" element={<CoachWorksheetReviewed />} />
              <Route path="/coaching/worksheet-stats" element={<CoachWorksheetStats />} />
              <Route path="/coaching/worksheet-missed" element={<CoachWorksheetMissed />} />
              <Route path="/coaching/schedule" element={<CoachSchedule />} />
              <Route path="/coaching/today-sessions" element={<CoachTodaySessions />} />
              <Route path="/coaching/past-sessions" element={<CoachPastSessions />} />
              <Route path="/coaching/session-analytics" element={<CoachSessionAnalytics />} />
              <Route path="/coaching/create-assignment" element={<CoachCreateAssignment />} />
              <Route path="/coaching/pending-submissions" element={<CoachPendingSubmissions />} />
              <Route path="/coaching/reviewed" element={<CoachReviewedAssignments />} />
              <Route path="/coaching/completion-rate" element={<CoachCompletionRate />} />
              <Route path="/coaching/generate-reports" element={<CoachGenerateReports />} />
              <Route path="/coaching/businesses" element={<CoachBusinesses />} />
              <Route path="/coaching/swot-reviews" element={<CoachSwotReviews />} />
              <Route path="/coaching/dept-health" element={<CoachDeptHealth />} />
              <Route path="/coaching/business-notes" element={<CoachBusinessNotes />} />
              <Route path="/coaching/messages" element={<CoachMessages />} />
              <Route path="/coaching/templates" element={<CoachTemplates />} />
              <Route path="/coaching/announcements" element={<CoachAnnouncements />} />
              <Route path="/coaching/engagement" element={<CoachEngagement />} />
              <Route path="/coaching/progress-report" element={<CoachProgressReport />} />
              <Route path="/coaching/artha-progress" element={<CoachArthaProgress />} />
              <Route path="/coaching/export" element={<CoachExport />} />
              <Route path="/coaching/broadcast" element={<CoachBroadcast />} />
              <Route path="/coaching/weekly-report" element={<CoachWeeklyReport />} />
              <Route path="/coaching/settings" element={<CoachSettings />} />
              <Route path="/coaching/seeker-assessments" element={<CoachSeekerAssessments />} />
              <Route path="/coaching/seeker-assessments/:seekerId" element={<CoachSeekerDetail />} />
              <Route path="/coaching/assessment-analytics" element={<CoachAssessmentAnalytics />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <WhatsAppSupportButton />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
