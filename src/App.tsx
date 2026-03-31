import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuthGuard from "./components/AuthGuard";
import AdminLayout from "./components/AdminLayout";
import SeekerLayout from "./components/SeekerLayout";

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
import PlaceholderPage from "./pages/PlaceholderPage";

import SeekerHome from "./pages/seeker/SeekerHome";
import SeekerDailyLog from "./pages/seeker/SeekerDailyLog";
import SacredSpace from "./pages/seeker/SacredSpace";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin Routes */}
          <Route element={<AuthGuard requiredRole="admin"><AdminLayout /></AuthGuard>}>
            <Route path="/dashboard" element={<AdminDashboard />} />
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
            <Route path="/calendar" element={<PlaceholderPage />} />
            <Route path="/assessments" element={<PlaceholderPage />} />
            <Route path="/daily-tracking" element={<PlaceholderPage />} />
            <Route path="/growth-matrix" element={<PlaceholderPage />} />
            <Route path="/settings" element={<PlaceholderPage />} />
          </Route>

          {/* Seeker Routes */}
          <Route element={<AuthGuard requiredRole="seeker"><SeekerLayout /></AuthGuard>}>
            <Route path="/seeker/home" element={<SeekerHome />} />
            <Route path="/seeker/daily-log" element={<SeekerDailyLog />} />
            <Route path="/seeker/tasks" element={<PlaceholderPage />} />
            <Route path="/seeker/growth" element={<PlaceholderPage />} />
            <Route path="/seeker/sacred-space" element={<SacredSpace />} />
            <Route path="/seeker/profile" element={<PlaceholderPage />} />
            <Route path="/seeker/journey" element={<PlaceholderPage />} />
            <Route path="/seeker/assessments" element={<PlaceholderPage />} />
            <Route path="/seeker/messages" element={<PlaceholderPage />} />
            <Route path="/seeker/weekly-review" element={<PlaceholderPage />} />
            <Route path="/seeker/payments" element={<PlaceholderPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
