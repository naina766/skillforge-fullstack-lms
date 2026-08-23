import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { authApi } from './api/authApi';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/ui/Toast';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { CourseCatalogPage } from './pages/public/CourseCatalogPage';
import { CourseDetailPage } from './pages/public/CourseDetailPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { AIMentorPage } from './pages/public/AIMentorPage';
import { CertificateVerifyPage } from './pages/public/CertificateVerifyPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyLearningPage } from './pages/student/MyLearningPage';
import { LearningPlayerPage } from './pages/student/LearningPlayerPage';
import { WishlistPage } from './pages/student/WishlistPage';
import { CertificatesPage } from './pages/student/CertificatesPage';
import { NotificationsPage } from './pages/student/NotificationsPage';

// Instructor Pages
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';
import { CourseEditorPage } from './pages/instructor/CourseEditorPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

export default function App() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Session restoration on app launch
    authApi
      .getMe()
      .then((res) => {
        if (res.data) setUser(res.data);
      })
      .catch(() => {
        // Guest mode
      });
  }, [setUser]);

  return (
    <Router>
      <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans">
        <Navbar />

        <div className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/courses" element={<CourseCatalogPage />} />
            <Route path="/courses/:slug" element={<CourseDetailPage />} />
            <Route path="/workshops" element={<Navigate to="/courses?type=WORKSHOP" replace />} />
            <Route path="/learning-paths" element={<Navigate to="/courses" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-certificate/:certId" element={<CertificateVerifyPage />} />

            {/* Protected Routes: All Authenticated Users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/dashboard/my-learning" element={<MyLearningPage />} />
              <Route path="/dashboard/wishlist" element={<WishlistPage />} />
              <Route path="/dashboard/certificates" element={<CertificatesPage />} />
              <Route path="/dashboard/notifications" element={<NotificationsPage />} />
              <Route path="/learn/:courseId" element={<LearningPlayerPage />} />
              <Route path="/ai-mentor" element={<AIMentorPage />} />
              <Route path="/mentor" element={<AIMentorPage />} />
            </Route>

            {/* Protected Routes: Instructor & Admin */}
            <Route element={<ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']} />}>
              <Route path="/instructor" element={<InstructorDashboard />} />
              <Route path="/instructor/courses" element={<InstructorDashboard />} />
              <Route path="/instructor/courses/create" element={<CourseEditorPage />} />
              <Route path="/instructor/courses/new" element={<CourseEditorPage />} />
              <Route path="/instructor/courses/:id/edit" element={<CourseEditorPage />} />
            </Route>

            {/* Protected Routes: Admin Only */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <Footer />
        <ToastContainer />
      </div>
    </Router>
  );
}
