import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Eagerly loaded — needed for first paint and routing shell
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import AuthGuard from "./components/AuthGuard";
import AdminLayout from "./components/AdminLayout";
import SeekerLayout from "./components/SeekerLayout";
import CoachingLayout from "./components/CoachingLayout";
import WhatsAppSupportButton from "./components/WhatsAppSupportButton";

// Lazy-loaded routes (split into per-route chunks)
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const BookAppointment = lazy(() => import("./pages/BookAppointment"));
const RegisterWorkshop = lazy(() => import("./pages/RegisterWorkshop"));
const SeekerLgtForm = lazy(() => import("./pages/SeekerLgtForm"));
const AdminApplyLgt = lazy(() => import("./pages/admin/AdminApplyLgt"));
const TellUsAboutYourself = lazy(() => import("./pages/TellUsAboutYourself"));
const PlaceholderPage = lazy(() => import("./pages/PlaceholderPage"));

const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const SeekersPage = lazy(() => import("./pages/admin/SeekersPage"));
const SeekerDetailPage = lazy(() => import("./pages/admin/SeekerDetailPage"));
const CoursesPage = lazy(() => import("./pages/admin/CoursesPage"));
const LeadsPage = lazy(() => import("./pages/admin/LeadsPage"));
const SessionsPage = lazy(() => import("./pages/admin/SessionsPage"));
const AssignmentsPage = lazy(() => import("./pages/admin/AssignmentsPage"));
const PaymentsPage = lazy(() => import("./pages/admin/PaymentsPage"));
const ResourcesPage = lazy(() => import("./pages/admin/ResourcesPage"));
const FollowUpsPage = lazy(() => import("./pages/admin/FollowUpsPage"));
const MessagesPage = lazy(() => import("./pages/admin/MessagesPage"));
const ReportsPage = lazy(() => import("./pages/admin/ReportsPage"));
const AssessmentsPage = lazy(() => import("./pages/admin/AssessmentsPage"));
const SettingsPage = lazy(() => import("./pages/admin/SettingsPage"));
const CalendarPage = lazy(() => import("./pages/admin/CalendarPage"));
const DailyTrackingPage = lazy(() => import("./pages/admin/DailyTrackingPage"));
const GrowthMatrixPage = lazy(() => import("./pages/admin/GrowthMatrixPage"));
const ApplicationsPage = lazy(() => import("./pages/admin/ApplicationsPage"));
const AdminDetailedIntake = lazy(() => import("./pages/admin/AdminDetailedIntake"));
const CoachDayView = lazy(() => import("./pages/admin/CoachDayView"));
const WorksheetAnalyticsPage = lazy(() => import("./pages/admin/WorksheetAnalyticsPage"));
const SessionCertification = lazy(() => import("./pages/admin/SessionCertification"));
const SessionReviewPage = lazy(() => import("./pages/admin/SessionReviewPage"));
const SessionTemplatesPage = lazy(() => import("./pages/admin/SessionTemplatesPage"));
const SwotPage = lazy(() => import("./pages/admin/SwotPage"));
const ActiveSessionsPage = lazy(() => import("./pages/admin/ActiveSessionsPage"));
const AdminCoaches = lazy(() => import("./pages/admin/AdminCoaches"));
const AdminLinkedProfiles = lazy(() => import("./pages/admin/AdminLinkedProfiles"));
const AdminCoachSeekers = lazy(() => import("./pages/admin/AdminCoachSeekers"));
const AdminAdmins = lazy(() => import("./pages/admin/AdminAdmins"));
const AdminAddUser = lazy(() => import("./pages/admin/AdminAddUser"));
const AdminUserAnalytics = lazy(() => import("./pages/admin/AdminUserAnalytics"));
const AdminSearchUsers = lazy(() => import("./pages/admin/AdminSearchUsers"));
const AdminCreateProgram = lazy(() => import("./pages/admin/AdminCreateProgram"));
const AdminEditPrograms = lazy(() => import("./pages/admin/AdminEditPrograms"));
const AdminProgramCoaches = lazy(() => import("./pages/admin/AdminProgramCoaches"));
const AdminProgramAnalytics = lazy(() => import("./pages/admin/AdminProgramAnalytics"));
const AdminEnrollments = lazy(() => import("./pages/admin/AdminEnrollments"));
const AdminNewEnrollment = lazy(() => import("./pages/admin/AdminNewEnrollment"));
const AdminBatches = lazy(() => import("./pages/admin/AdminBatches"));
const AdminEnrollmentStats = lazy(() => import("./pages/admin/AdminEnrollmentStats"));
const AdminAddLead = lazy(() => import("./pages/admin/AdminAddLead"));
const AdminAllLeads = lazy(() => import("./pages/admin/AdminAllLeads"));
const AdminHotLeads = lazy(() => import("./pages/admin/AdminHotLeads"));
const AdminConversionFunnel = lazy(() => import("./pages/admin/AdminConversionFunnel"));
const AdminLeadSources = lazy(() => import("./pages/admin/AdminLeadSources"));
const AdminRecordPayment = lazy(() => import("./pages/admin/AdminRecordPayment"));
const AdminInvoices = lazy(() => import("./pages/admin/AdminInvoices"));
const AdminOverduePayments = lazy(() => import("./pages/admin/AdminOverduePayments"));
const AdminRevenue = lazy(() => import("./pages/admin/AdminRevenue"));
const AdminExportFinancials = lazy(() => import("./pages/admin/AdminExportFinancials"));
const AdminVideos = lazy(() => import("./pages/admin/AdminVideos"));
const AdminAudios = lazy(() => import("./pages/admin/AdminAudios"));
const AdminUploadResource = lazy(() => import("./pages/admin/AdminUploadResource"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminQuestionBank = lazy(() => import("./pages/admin/AdminQuestionBank"));
const AdminCreateAssessment = lazy(() => import("./pages/admin/AdminCreateAssessment"));
const AdminAnnouncements = lazy(() => import("./pages/admin/AdminAnnouncements"));
const AdminCompetitors = lazy(() => import("./pages/admin/AdminCompetitors"));
const AdminBusinessMetrics = lazy(() => import("./pages/admin/AdminBusinessMetrics"));
const AdminStrategicGoals = lazy(() => import("./pages/admin/AdminStrategicGoals"));
const AdminUserGrowth = lazy(() => import("./pages/admin/AdminUserGrowth"));
const AdminEngagement = lazy(() => import("./pages/admin/AdminEngagement"));
const AdminCoachPerformance = lazy(() => import("./pages/admin/AdminCoachPerformance"));
const AdminRetention = lazy(() => import("./pages/admin/AdminRetention"));
const AdminExportReports = lazy(() => import("./pages/admin/AdminExportReports"));
const AdminBranding = lazy(() => import("./pages/admin/AdminBranding"));
const AdminNotificationsPage = lazy(() => import("./pages/admin/AdminNotificationsPage"));
const AdminIntegrations = lazy(() => import("./pages/admin/AdminIntegrations"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const AdminBackup = lazy(() => import("./pages/admin/AdminBackup"));
const AdminAssessmentConfig = lazy(() => import("./pages/admin/AdminAssessmentConfig"));
const AdminAssessmentAnalytics = lazy(() => import("./pages/admin/AdminAssessmentAnalytics"));
const AdminEncryptionStatus = lazy(() => import("./pages/admin/AdminEncryptionStatus"));
const AdminDocuments = lazy(() => import("./pages/admin/AdminDocuments"));
const SignDocument = lazy(() => import("./pages/SignDocument"));

const SeekerHome = lazy(() => import("./pages/seeker/SeekerHome"));
const SeekerDailyLog = lazy(() => import("./pages/seeker/SeekerDailyLog"));
const SacredSpace = lazy(() => import("./pages/seeker/SacredSpace"));
const SeekerGrowth = lazy(() => import("./pages/seeker/SeekerGrowth"));
const WheelOfLifePage = lazy(() => import("./pages/seeker/assessments/WheelOfLifePage"));
const SwotAssessmentPage = lazy(() => import("./pages/seeker/assessments/SwotAssessmentPage"));
const LgtAssessmentPage = lazy(() => import("./pages/seeker/assessments/LgtAssessmentPage"));
const PurusharthasPage = lazy(() => import("./pages/seeker/assessments/PurusharthasPage"));
const HappinessPage = lazy(() => import("./pages/seeker/assessments/HappinessPage"));
const MoochPage = lazy(() => import("./pages/seeker/assessments/MoochPage"));
const SeekerFiroBPage = lazy(() => import("./pages/seeker/assessments/FiroBPage"));
const AssessmentHistoryPage = lazy(() => import("./pages/seeker/assessments/AssessmentHistoryPage"));
const SeekerPayments = lazy(() => import("./pages/seeker/SeekerPayments"));
const SeekerTasks = lazy(() => import("./pages/seeker/SeekerTasks"));
const SeekerProfile = lazy(() => import("./pages/seeker/SeekerProfile"));
const SeekerJourney = lazy(() => import("./pages/seeker/SeekerJourney"));
const SeekerMessages = lazy(() => import("./pages/seeker/SeekerMessages"));
const SeekerWeeklyReview = lazy(() => import("./pages/seeker/SeekerWeeklyReview"));
const DailyWorksheet = lazy(() => import("./pages/seeker/DailyWorksheet"));
const SeekerTopics = lazy(() => import("./pages/seeker/SeekerTopics"));
const SeekerSessionDetail = lazy(() => import("./pages/seeker/SeekerSessionDetail"));
const SeekerLGTScore = lazy(() => import("./pages/seeker/SeekerLGTScore"));
const SeekerUpcomingSessions = lazy(() => import("./pages/seeker/SeekerUpcomingSessions"));
const SeekerSessionHistory = lazy(() => import("./pages/seeker/SeekerSessionHistory"));
const SeekerTasksEnhanced = lazy(() => import("./pages/seeker/SeekerTasksEnhanced"));
const SeekerDharmaMission = lazy(() => import("./pages/seeker/SeekerDharmaMission"));
const SeekerDharmaValues = lazy(() => import("./pages/seeker/SeekerDharmaValues"));
const SeekerDharmaJournal = lazy(() => import("./pages/seeker/SeekerDharmaJournal"));
const SeekerDharmaPractices = lazy(() => import("./pages/seeker/SeekerDharmaPractices"));
const SeekerMokshaMeditation = lazy(() => import("./pages/seeker/SeekerMokshaMeditation"));
const SeekerMokshaGoals = lazy(() => import("./pages/seeker/SeekerMokshaGoals"));
const SeekerMokshaJournal = lazy(() => import("./pages/seeker/SeekerMokshaJournal"));
const SeekerKamaGoals = lazy(() => import("./pages/seeker/SeekerKamaGoals"));
const SeekerKamaFamily = lazy(() => import("./pages/seeker/SeekerKamaFamily"));
const SeekerBadges = lazy(() => import("./pages/seeker/SeekerBadges"));
const SeekerPoints = lazy(() => import("./pages/seeker/SeekerPoints"));
const SeekerArthaDashboard = lazy(() => import("./pages/seeker/SeekerArthaDashboard"));
const ArthaBusinessProfile = lazy(() => import("./pages/seeker/ArthaBusinessProfile"));
const ArthaVisionMission = lazy(() => import("./pages/seeker/ArthaVisionMission"));
const ArthaMarketing = lazy(() => import("./pages/seeker/ArthaMarketing"));
const ArthaBranding = lazy(() => import("./pages/seeker/ArthaBranding"));
const ArthaSales = lazy(() => import("./pages/seeker/ArthaSales"));
const ArthaAccounting = lazy(() => import("./pages/seeker/ArthaAccounting"));
const ArthaCashflow = lazy(() => import("./pages/seeker/ArthaCashflow"));
const ArthaTeam = lazy(() => import("./pages/seeker/ArthaTeam"));
const ArthaRnD = lazy(() => import("./pages/seeker/ArthaRnD"));
const ArthaSatisfaction = lazy(() => import("./pages/seeker/ArthaSatisfaction"));
const ArthaDepartments = lazy(() => import("./pages/seeker/ArthaDepartments"));
const ArthaSwot = lazy(() => import("./pages/seeker/ArthaSwot"));
const ArthaCompetitors = lazy(() => import("./pages/seeker/ArthaCompetitors"));
const SeekerWorksheetHistory = lazy(() => import("./pages/seeker/SeekerWorksheetHistory"));
const SeekerStreaks = lazy(() => import("./pages/seeker/SeekerStreaks"));
const SeekerLeaderboard = lazy(() => import("./pages/seeker/SeekerLeaderboard"));
const SeekerProgressCharts = lazy(() => import("./pages/seeker/SeekerProgressCharts"));
const SeekerAssessmentHistory = lazy(() => import("./pages/seeker/SeekerAssessmentHistory"));
const SeekerPersonality = lazy(() => import("./pages/seeker/SeekerPersonality"));
const SeekerLearningVideos = lazy(() => import("./pages/seeker/SeekerLearningVideos"));
const SeekerLearningAudio = lazy(() => import("./pages/seeker/SeekerLearningAudio"));
const SeekerLearningPdfs = lazy(() => import("./pages/seeker/SeekerLearningPdfs"));
const SeekerLearningFrameworks = lazy(() => import("./pages/seeker/SeekerLearningFrameworks"));
const SeekerBookmarks = lazy(() => import("./pages/seeker/SeekerBookmarks"));
const SeekerNotifications = lazy(() => import("./pages/seeker/SeekerNotifications"));
const SeekerAnnouncements = lazy(() => import("./pages/seeker/SeekerAnnouncements"));
const SeekerHelp = lazy(() => import("./pages/seeker/SeekerHelp"));
const SeekerLiveSession = lazy(() => import("./pages/seeker/SeekerLiveSession"));
const SeekerSessionNotes = lazy(() => import("./pages/seeker/SeekerSessionNotes"));
const SeekerFeedback = lazy(() => import("./pages/seeker/SeekerFeedback"));
const SeekerSubmitAssignment = lazy(() => import("./pages/seeker/SeekerSubmitAssignment"));
const SeekerCoachFeedback = lazy(() => import("./pages/seeker/SeekerCoachFeedback"));
const SeekerKamaSocial = lazy(() => import("./pages/seeker/SeekerKamaSocial"));
const SeekerKamaDesires = lazy(() => import("./pages/seeker/SeekerKamaDesires"));
const SeekerMokshaConsciousness = lazy(() => import("./pages/seeker/SeekerMokshaConsciousness"));
const SeekerTimeSheet = lazy(() => import("./pages/seeker/SeekerTimeSheet"));
const SeekerChallenges = lazy(() => import("./pages/seeker/SeekerChallenges"));
const SeekerGratitudeWall = lazy(() => import("./pages/seeker/SeekerGratitudeWall"));
const SeekerWinJournal = lazy(() => import("./pages/seeker/SeekerWinJournal"));
const SeekerTransformationTimeline = lazy(() => import("./pages/seeker/SeekerTransformationTimeline"));
const SeekerIkigai = lazy(() => import("./pages/seeker/SeekerIkigai"));
const SeekerMeditationTimer = lazy(() => import("./pages/seeker/SeekerMeditationTimer"));
const SeekerRelationshipTracker = lazy(() => import("./pages/seeker/SeekerRelationshipTracker"));

const CoachingDashboard = lazy(() => import("./pages/coaching/CoachingDashboard"));
const ClientIntakePage = lazy(() => import("./pages/coaching/ClientIntakePage"));
const AgreementsPage = lazy(() => import("./pages/coaching/AgreementsPage"));
const FiroBPage = lazy(() => import("./pages/coaching/FiroBPage"));
const CoachingSessionNotes = lazy(() => import("./pages/coaching/CoachingSessionNotes"));
const CoachingPlanner = lazy(() => import("./pages/coaching/CoachingPlanner"));
const CoachingHomework = lazy(() => import("./pages/coaching/CoachingHomework"));
const CoachingProgress = lazy(() => import("./pages/coaching/CoachingProgress"));
const CoachWorksheetPending = lazy(() => import("./pages/coaching/CoachWorksheetPending"));
const CoachWorksheetReviewed = lazy(() => import("./pages/coaching/CoachWorksheetReviewed"));
const CoachWorksheetStats = lazy(() => import("./pages/coaching/CoachWorksheetStats"));
const CoachWorksheetMissed = lazy(() => import("./pages/coaching/CoachWorksheetMissed"));
const CoachSchedule = lazy(() => import("./pages/coaching/CoachSchedule"));
const CoachTodaySessions = lazy(() => import("./pages/coaching/CoachTodaySessions"));
const CoachPastSessions = lazy(() => import("./pages/coaching/CoachPastSessions"));
const CoachSessionAnalytics = lazy(() => import("./pages/coaching/CoachSessionAnalytics"));
const CoachCreateAssignment = lazy(() => import("./pages/coaching/CoachCreateAssignment"));
const CoachPendingSubmissions = lazy(() => import("./pages/coaching/CoachPendingSubmissions"));
const CoachReviewedAssignments = lazy(() => import("./pages/coaching/CoachReviewedAssignments"));
const CoachCompletionRate = lazy(() => import("./pages/coaching/CoachCompletionRate"));
const CoachBroadcast = lazy(() => import("./pages/coaching/CoachBroadcast"));
const CoachWeeklyReport = lazy(() => import("./pages/coaching/CoachWeeklyReport"));
const CoachAllSeekers = lazy(() => import("./pages/coaching/CoachAllSeekers"));
const CoachSeekersActive = lazy(() => import("./pages/coaching/CoachSeekersActive"));
const CoachSeekersAttention = lazy(() => import("./pages/coaching/CoachSeekersAttention"));
const CoachSeekersOntrack = lazy(() => import("./pages/coaching/CoachSeekersOntrack"));
const CoachSeekersSearch = lazy(() => import("./pages/coaching/CoachSeekersSearch"));
const CoachGenerateReports = lazy(() => import("./pages/coaching/CoachGenerateReports"));
const CoachBusinesses = lazy(() => import("./pages/coaching/CoachBusinesses"));
const CoachSwotReviews = lazy(() => import("./pages/coaching/CoachSwotReviews"));
const CoachDeptHealth = lazy(() => import("./pages/coaching/CoachDeptHealth"));
const CoachBusinessNotes = lazy(() => import("./pages/coaching/CoachBusinessNotes"));
const CoachMessages = lazy(() => import("./pages/coaching/CoachMessages"));
const CoachTemplates = lazy(() => import("./pages/coaching/CoachTemplates"));
const CoachAnnouncements = lazy(() => import("./pages/coaching/CoachAnnouncements"));
const CoachEngagement = lazy(() => import("./pages/coaching/CoachEngagement"));
const CoachProgressReport = lazy(() => import("./pages/coaching/CoachProgressReport"));
const CoachArthaProgress = lazy(() => import("./pages/coaching/CoachArthaProgress"));
const CoachExport = lazy(() => import("./pages/coaching/CoachExport"));
const CoachSettings = lazy(() => import("./pages/coaching/CoachSettings"));
const CoachSeekerAssessments = lazy(() => import("./pages/coaching/CoachSeekerAssessments"));
const CoachSeekerDetail = lazy(() => import("./pages/coaching/CoachSeekerDetail"));
const CoachAssessmentAnalytics = lazy(() => import("./pages/coaching/CoachAssessmentAnalytics"));

const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const SeoLifeCoaching = lazy(() => import("./pages/seo/LifeCoaching"));
const SeoBusinessCoaching = lazy(() => import("./pages/seo/BusinessCoaching"));
const SeoManifestation = lazy(() => import("./pages/seo/Manifestation"));
const SeoMeditation = lazy(() => import("./pages/seo/Meditation"));
const SeoDharmaPhilosophy = lazy(() => import("./pages/seo/DharmaPhilosophy"));
const SeoNlpCoach = lazy(() => import("./pages/seo/NlpCoach"));
const SeoSalesCoach = lazy(() => import("./pages/seo/SalesCoach"));
const SeoLifeCoachLocation = lazy(() => import("./pages/seo/LifeCoachLocation"));
const SeoBusinessCoachLocation = lazy(() => import("./pages/seo/BusinessCoachLocation"));

const queryClient = new QueryClient();

const P = PlaceholderPage;

const RouteFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

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
