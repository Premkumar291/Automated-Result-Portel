import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { 
  LoginPage, 
  SignupPage, 
  VerifyEmailPage, 
  ForgotPassword,
  Dashboard,
  PageNotFound,
  ResultAnalysis
} from "./components";

// Layout wrapper component that applies different styles based on route
function AppLayout({ children }) {
  const location = useLocation();
  const isFullWidthPage = location.pathname === '/dashboard' || location.pathname.includes('/result-analysis');
  
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

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/result-analysis" element={<ResultAnalysis />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
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
