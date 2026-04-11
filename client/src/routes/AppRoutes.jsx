import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence } from 'framer-motion';

// Pages
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import VerifyEmail from '../pages/VerifyEmail.jsx';
import Profile from '../pages/Profile.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import NotFound from '../pages/NotFound.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ReportGeneratorPage from '../pages/ReportGeneratorPage.jsx';
import ReportDetailPage from '../pages/ReportDetailPage.jsx';
import ViewReportPage from '../pages/ViewReportPage.jsx';
import PublicReportView from '../pages/PublicReportView.jsx';

// Mock Interview Pages
import MockInterviewsListPage from '../pages/MockInterviewsListPage.jsx';
import MockInterviewSetupPage from '../pages/MockInterviewSetupPage.jsx';
import MockInterviewPage from '../pages/MockInterviewPage.jsx';
import MockInterviewReportPage from '../pages/MockInterviewReportPage.jsx';

import Loader from '../components/ui/Loader.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/public/report/:id" element={<PublicReportView />} />

        {/* Protected Routes */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Dashboard Route */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard/report-generator" element={<ProtectedRoute><ReportGeneratorPage /></ProtectedRoute>} />
        <Route path="/dashboard/view-report" element={<ProtectedRoute><ViewReportPage /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/dashboard/report/:reportId" element={<ProtectedRoute><ReportDetailPage /></ProtectedRoute>} />

        {/* Mock Interview Routes */}
        <Route path="/dashboard/mock-interviews" element={<ProtectedRoute><MockInterviewsListPage /></ProtectedRoute>} />
        <Route path="/dashboard/mock-interview/setup" element={<ProtectedRoute><MockInterviewSetupPage /></ProtectedRoute>} />
        <Route path="/dashboard/mock-interview/:sessionId" element={<ProtectedRoute><MockInterviewPage /></ProtectedRoute>} />
        <Route path="/dashboard/mock-interview/:sessionId/report" element={<ProtectedRoute><MockInterviewReportPage /></ProtectedRoute>} />

        {/* Redirect Root */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
