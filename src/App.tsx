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

import CoachingDashboard from "./pages/coaching/CoachingDashboard";
import ClientIntakePage from "./pages/coaching/ClientIntakePage";
import AgreementsPage from "./pages/coaching/AgreementsPage";
import FiroBPage from "./pages/coaching/FiroBPage";
import PlaceholderModule from "./pages/coaching/PlaceholderModule";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/register-workshop" element={<RegisterWorkshop />} />
          <Route path="/apply-lgt" element={<ApplyLGT />} />

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
          </Route>

          {/* Coaching Management Routes */}
          <Route element={<AuthGuard requiredRole="admin"><CoachingLayout /></AuthGuard>}>
            <Route path="/coaching" element={<CoachingDashboard />} />
            <Route path="/coaching/intake" element={<ClientIntakePage />} />
            <Route path="/coaching/agreements" element={<AgreementsPage />} />
            <Route path="/coaching/firo-b" element={<FiroBPage />} />
            <Route path="/coaching/sessions" element={<PlaceholderModule />} />
            <Route path="/coaching/planner" element={<PlaceholderModule />} />
            <Route path="/coaching/homework" element={<PlaceholderModule />} />
            <Route path="/coaching/progress" element={<PlaceholderModule />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
