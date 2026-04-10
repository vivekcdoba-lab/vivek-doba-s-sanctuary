import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BookAppointment from "./pages/BookAppointment";
import RegisterWorkshop from "./pages/RegisterWorkshop";
import ApplyLGT from "./pages/ApplyLGT";
import AuthGuard from "./components/AuthGuard";
import AdminLayout from "./components/AdminLayout";
import SeekerLayout from "./components/SeekerLayout";
import CoachingLayout from "./components/CoachingLayout";
import PlaceholderPage from "./pages/PlaceholderPage";

import AdminDashboard from "./pages/admin/Dashboard";
import SeekersPage from "./pages/admin/SeekersPage";
import SeekerDetailPage from "./pages/admin/SeekerDetailPage";
import CoursesPage from "./pages/admin/CoursesPage";
import LeadsPage from "./pages/admin/LeadsPage";
import SessionsPage from "./pages/admin/SessionsPage";
import AssignmentsPage from "./pages/admin/AssignmentsPage";
import PaymentsPage from "./pages/admin/PaymentsPage";
import ResourcesPage from "./pages/admin/ResourcesPage";
import FollowUpsPage from "./pages/admin/FollowUpsPage";
import MessagesPage from "./pages/admin/MessagesPage";
import ReportsPage from "./pages/admin/ReportsPage";
import AssessmentsPage from "./pages/admin/AssessmentsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import CalendarPage from "./pages/admin/CalendarPage";
import DailyTrackingPage from "./pages/admin/DailyTrackingPage";
import GrowthMatrixPage from "./pages/admin/GrowthMatrixPage";
import ApplicationsPage from "./pages/admin/ApplicationsPage";
import CoachDayView from "./pages/admin/CoachDayView";
import WorksheetAnalyticsPage from "./pages/admin/WorksheetAnalyticsPage";
import SessionCertification from "./pages/admin/SessionCertification";
import SessionReviewPage from "./pages/admin/SessionReviewPage";
import SessionTemplatesPage from "./pages/admin/SessionTemplatesPage";
import SwotPage from "./pages/admin/SwotPage";
import ActiveSessionsPage from "./pages/admin/ActiveSessionsPage";

import SeekerHome from "./pages/seeker/SeekerHome";
import SeekerDailyLog from "./pages/seeker/SeekerDailyLog";
import SacredSpace from "./pages/seeker/SacredSpace";
import SeekerGrowth from "./pages/seeker/SeekerGrowth";
import SeekerAssessments from "./pages/seeker/SeekerAssessments";
import SeekerPayments from "./pages/seeker/SeekerPayments";
import SeekerTasks from "./pages/seeker/SeekerTasks";
import SeekerProfile from "./pages/seeker/SeekerProfile";
import SeekerJourney from "./pages/seeker/SeekerJourney";
import SeekerMessages from "./pages/seeker/SeekerMessages";
import SeekerWeeklyReview from "./pages/seeker/SeekerWeeklyReview";
import DailyWorksheet from "./pages/seeker/DailyWorksheet";
import SeekerTopics from "./pages/seeker/SeekerTopics";
import SeekerSessionDetail from "./pages/seeker/SeekerSessionDetail";
import SeekerLGTScore from "./pages/seeker/SeekerLGTScore";
import SeekerUpcomingSessions from "./pages/seeker/SeekerUpcomingSessions";
import SeekerSessionHistory from "./pages/seeker/SeekerSessionHistory";
import SeekerTasksEnhanced from "./pages/seeker/SeekerTasksEnhanced";
import SeekerDharmaMission from "./pages/seeker/SeekerDharmaMission";
import SeekerDharmaValues from "./pages/seeker/SeekerDharmaValues";
import SeekerDharmaJournal from "./pages/seeker/SeekerDharmaJournal";
import SeekerDharmaPractices from "./pages/seeker/SeekerDharmaPractices";
import SeekerMokshaMeditation from "./pages/seeker/SeekerMokshaMeditation";
import SeekerMokshaGoals from "./pages/seeker/SeekerMokshaGoals";
import SeekerMokshaJournal from "./pages/seeker/SeekerMokshaJournal";
import SeekerKamaGoals from "./pages/seeker/SeekerKamaGoals";
import SeekerKamaFamily from "./pages/seeker/SeekerKamaFamily";
import SeekerBadges from "./pages/seeker/SeekerBadges";
import SeekerPoints from "./pages/seeker/SeekerPoints";
import SeekerArthaDashboard from "./pages/seeker/SeekerArthaDashboard";
import ArthaBusinessProfile from "./pages/seeker/ArthaBusinessProfile";
import ArthaVisionMission from "./pages/seeker/ArthaVisionMission";
import ArthaMarketing from "./pages/seeker/ArthaMarketing";
import ArthaBranding from "./pages/seeker/ArthaBranding";
import ArthaSales from "./pages/seeker/ArthaSales";
import ArthaAccounting from "./pages/seeker/ArthaAccounting";
import ArthaCashflow from "./pages/seeker/ArthaCashflow";
import ArthaTeam from "./pages/seeker/ArthaTeam";
import ArthaRnD from "./pages/seeker/ArthaRnD";
import ArthaSatisfaction from "./pages/seeker/ArthaSatisfaction";
import ArthaDepartments from "./pages/seeker/ArthaDepartments";
import ArthaSwot from "./pages/seeker/ArthaSwot";
import ArthaCompetitors from "./pages/seeker/ArthaCompetitors";
import SeekerWorksheetHistory from "./pages/seeker/SeekerWorksheetHistory";
import SeekerStreaks from "./pages/seeker/SeekerStreaks";
import SeekerLeaderboard from "./pages/seeker/SeekerLeaderboard";
import SeekerProgressCharts from "./pages/seeker/SeekerProgressCharts";
import SeekerAssessmentHistory from "./pages/seeker/SeekerAssessmentHistory";

import CoachingDashboard from "./pages/coaching/CoachingDashboard";
import ClientIntakePage from "./pages/coaching/ClientIntakePage";
import AgreementsPage from "./pages/coaching/AgreementsPage";
import FiroBPage from "./pages/coaching/FiroBPage";
import CoachingSessionNotes from "./pages/coaching/CoachingSessionNotes";
import CoachingPlanner from "./pages/coaching/CoachingPlanner";
import CoachingHomework from "./pages/coaching/CoachingHomework";
import CoachingProgress from "./pages/coaching/CoachingProgress";

import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import HelpPage from "./pages/HelpPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import WhatsAppSupportButton from "./components/WhatsAppSupportButton";

const queryClient = new QueryClient();

const P = PlaceholderPage;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/register-workshop" element={<RegisterWorkshop />} />
          <Route path="/apply-lgt" element={<ApplyLGT />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

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
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/worksheet-analytics" element={<WorksheetAnalyticsPage />} />
            <Route path="/sessions/:id/certify" element={<SessionCertification />} />
            <Route path="/sessions/:id/review" element={<SessionReviewPage />} />
            <Route path="/session-templates" element={<SessionTemplatesPage />} />
            <Route path="/swot" element={<SwotPage />} />
            <Route path="/active-sessions" element={<ActiveSessionsPage />} />
            {/* Admin placeholder routes */}
            <Route path="/admin/coaches" element={<P />} />
            <Route path="/admin/admins" element={<P />} />
            <Route path="/admin/add-user" element={<P />} />
            <Route path="/admin/user-analytics" element={<P />} />
            <Route path="/admin/search-users" element={<P />} />
            <Route path="/admin/create-program" element={<P />} />
            <Route path="/admin/edit-programs" element={<P />} />
            <Route path="/admin/program-analytics" element={<P />} />
            <Route path="/admin/enrollments" element={<P />} />
            <Route path="/admin/new-enrollment" element={<P />} />
            <Route path="/admin/batches" element={<P />} />
            <Route path="/admin/enrollment-stats" element={<P />} />
            <Route path="/admin/add-lead" element={<P />} />
            <Route path="/admin/all-leads" element={<P />} />
            <Route path="/admin/hot-leads" element={<P />} />
            <Route path="/admin/conversion-funnel" element={<P />} />
            <Route path="/admin/lead-sources" element={<P />} />
            <Route path="/admin/record-payment" element={<P />} />
            <Route path="/admin/invoices" element={<P />} />
            <Route path="/admin/overdue-payments" element={<P />} />
            <Route path="/admin/revenue" element={<P />} />
            <Route path="/admin/export-financials" element={<P />} />
            <Route path="/admin/videos" element={<P />} />
            <Route path="/admin/audios" element={<P />} />
            <Route path="/admin/upload-resource" element={<P />} />
            <Route path="/admin/categories" element={<P />} />
            <Route path="/admin/question-bank" element={<P />} />
            <Route path="/admin/create-assessment" element={<P />} />
            <Route path="/admin/announcements" element={<P />} />
            <Route path="/admin/competitors" element={<P />} />
            <Route path="/admin/business-metrics" element={<P />} />
            <Route path="/admin/strategic-goals" element={<P />} />
            <Route path="/admin/user-growth" element={<P />} />
            <Route path="/admin/engagement" element={<P />} />
            <Route path="/admin/coach-performance" element={<P />} />
            <Route path="/admin/retention" element={<P />} />
            <Route path="/admin/export-reports" element={<P />} />
            <Route path="/admin/branding" element={<P />} />
            <Route path="/admin/notifications" element={<P />} />
            <Route path="/admin/integrations" element={<P />} />
            <Route path="/admin/audit-logs" element={<P />} />
            <Route path="/admin/backup" element={<P />} />
          </Route>

          {/* Seeker Routes */}
          <Route element={<AuthGuard requiredRole="seeker"><SeekerLayout /></AuthGuard>}>
            <Route path="/seeker/home" element={<SeekerHome />} />
            <Route path="/seeker/daily-log" element={<SeekerDailyLog />} />
            <Route path="/seeker/tasks" element={<SeekerTasks />} />
            <Route path="/seeker/growth" element={<SeekerGrowth />} />
            <Route path="/seeker/sacred-space" element={<SacredSpace />} />
            <Route path="/seeker/profile" element={<SeekerProfile />} />
            <Route path="/seeker/journey" element={<SeekerJourney />} />
            <Route path="/seeker/assessments" element={<SeekerAssessments />} />
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
            <Route path="/seeker/kama/social" element={<P />} />
            <Route path="/seeker/kama/desires" element={<P />} />
            {/* Moksha */}
            <Route path="/seeker/moksha/meditation" element={<SeekerMokshaMeditation />} />
            <Route path="/seeker/moksha/goals" element={<SeekerMokshaGoals />} />
            <Route path="/seeker/moksha/journal" element={<SeekerMokshaJournal />} />
            <Route path="/seeker/moksha/consciousness" element={<P />} />
            {/* Achievements */}
            <Route path="/seeker/badges" element={<SeekerBadges />} />
            <Route path="/seeker/points" element={<SeekerPoints />} />
            <Route path="/seeker/leaderboard" element={<SeekerLeaderboard />} />
            {/* Placeholder routes */}
            <Route path="/seeker/worksheet-history" element={<SeekerWorksheetHistory />} />
            <Route path="/seeker/streaks" element={<SeekerStreaks />} />
            <Route path="/seeker/personality" element={<P />} />
            <Route path="/seeker/progress-charts" element={<SeekerProgressCharts />} />
            <Route path="/seeker/assessment-history" element={<SeekerAssessmentHistory />} />
            <Route path="/seeker/live-session" element={<P />} />
            <Route path="/seeker/session-notes" element={<P />} />
            <Route path="/seeker/feedback" element={<P />} />
            <Route path="/seeker/submit-assignment" element={<P />} />
            <Route path="/seeker/coach-feedback" element={<P />} />
            <Route path="/seeker/learning/videos" element={<P />} />
            <Route path="/seeker/learning/audio" element={<P />} />
            <Route path="/seeker/learning/pdfs" element={<P />} />
            <Route path="/seeker/learning/frameworks" element={<P />} />
            <Route path="/seeker/learning/bookmarks" element={<P />} />
            <Route path="/seeker/announcements" element={<P />} />
            <Route path="/seeker/notifications" element={<P />} />
            <Route path="/seeker/privacy-settings" element={<P />} />
            <Route path="/seeker/help" element={<P />} />
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
            <Route path="/coaching/seekers" element={<P />} />
            <Route path="/coaching/seekers-active" element={<P />} />
            <Route path="/coaching/seekers-attention" element={<P />} />
            <Route path="/coaching/seekers-ontrack" element={<P />} />
            <Route path="/coaching/seekers-search" element={<P />} />
            <Route path="/coaching/worksheet-pending" element={<P />} />
            <Route path="/coaching/worksheet-reviewed" element={<P />} />
            <Route path="/coaching/worksheet-stats" element={<P />} />
            <Route path="/coaching/worksheet-missed" element={<P />} />
            <Route path="/coaching/schedule" element={<P />} />
            <Route path="/coaching/today-sessions" element={<P />} />
            <Route path="/coaching/past-sessions" element={<P />} />
            <Route path="/coaching/session-analytics" element={<P />} />
            <Route path="/coaching/create-assignment" element={<P />} />
            <Route path="/coaching/pending-submissions" element={<P />} />
            <Route path="/coaching/reviewed" element={<P />} />
            <Route path="/coaching/completion-rate" element={<P />} />
            <Route path="/coaching/generate-reports" element={<P />} />
            <Route path="/coaching/businesses" element={<P />} />
            <Route path="/coaching/swot-reviews" element={<P />} />
            <Route path="/coaching/dept-health" element={<P />} />
            <Route path="/coaching/business-notes" element={<P />} />
            <Route path="/coaching/messages" element={<P />} />
            <Route path="/coaching/templates" element={<P />} />
            <Route path="/coaching/announcements" element={<P />} />
            <Route path="/coaching/engagement" element={<P />} />
            <Route path="/coaching/progress-report" element={<P />} />
            <Route path="/coaching/artha-progress" element={<P />} />
            <Route path="/coaching/export" element={<P />} />
            <Route path="/coaching/settings" element={<P />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <WhatsAppSupportButton />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
