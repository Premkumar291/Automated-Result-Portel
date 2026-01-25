import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import FacultyErrorBoundary from "./components/common/FacultyErrorBoundary";
import { Suspense, lazy } from "react";
import GlobalLoading from "@/components/common/GlobalLoading";


// Lazy load pages
const LoginPage = lazy(() => import("./components/auth/login-page"));
const SignupPage = lazy(() => import("./components/auth/signup-page"));
const VerifyEmailPage = lazy(() => import("./components/auth/verify-email-page"));
const ForgotPassword = lazy(() => import("./components/auth/forgot-password"));
const FacultyDashboard = lazy(() => import("./components/Faculty - frontend/Dashboard/dashboard"));
const PageNotFound = lazy(() => import("./components/pagenotfound/page-not-found"));
const ResultAnalysis = lazy(() => import("./components/Faculty - frontend/Analysis/result-analysis"));
const ReportGenerationPage = lazy(() => import("./components/Faculty - frontend/ReportGenerationPage"));
const AdminDashboard = lazy(() => import("./components/Admin - frontend/Dashboard/dashboard"));
const CreateFaculty = lazy(() => import("./components/Admin - frontend/creatingPages/create-faculty"));
const SubjectManagement = lazy(() => import("./components/Admin - frontend/creatingPages/subject-management"));
const FacultyManagement = lazy(() => import("./components/Admin - frontend/creatingPages/faculty-management"));
const AdminHierarchyPage = lazy(() => import("./components/AdminHierarchyPage"));
// Layouts can stay static or be lazy too, but usually static is fine for layouts used immediately
import AdminLayout from "./components/Admin - frontend/Layout/AdminLayout";


// Layout wrapper component that applies different styles based on route
function AppLayout({ children }) {
  const location = useLocation();
  const isFullWidthPage = location.pathname === '/faculty-dashboard' || location.pathname === '/admin-dashboard' || location.pathname.includes('/result-analysis') || location.pathname.includes('/generate-report') || location.pathname.includes('/subject-management') || location.pathname.includes('/faculty-management') || location.pathname.includes('/admin-hierarchy') || location.pathname.includes('/create-faculty');

  if (isFullWidthPage) {
    // Full-width layout for dashboard and result analysis pages
    return (
      <div className="min-h-screen w-full">
        {children}
      </div>
    );
  }

  // Centered layout for auth pages
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {children}
      </div>
    </div>
  );
}



function App() {
  return (
    <Router>
      <AppLayout>
        <Suspense fallback={<GlobalLoading />}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/faculty-dashboard" element={<FacultyErrorBoundary><FacultyDashboard /></FacultyErrorBoundary>} />
            <Route path="/admin-dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin-dashboard/create-faculty" element={<AdminLayout><CreateFaculty /></AdminLayout>} />
            <Route path="/admin-dashboard/subject-management" element={<AdminLayout><SubjectManagement /></AdminLayout>} />
            <Route path="/admin-dashboard/faculty-management" element={<AdminLayout><FacultyManagement /></AdminLayout>} />
            <Route path="/admin-dashboard/admin-hierarchy" element={<AdminLayout><AdminHierarchyPage /></AdminLayout>} />

            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/result-analysis" element={<FacultyErrorBoundary><ResultAnalysis /></FacultyErrorBoundary>} />
            <Route path="/generate-report" element={<FacultyErrorBoundary><ReportGenerationPage /></FacultyErrorBoundary>} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </AppLayout>
    </Router>
  );
}

export default App;
