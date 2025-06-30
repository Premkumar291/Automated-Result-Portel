import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { 
  LoginPage, 
  SignupPage, 
  VerifyEmailPage, 
  ForgotPassword,
  Dashboard,
  PageNotFound 
} from "./components";

// Layout wrapper component that applies different styles based on route
function AppLayout({ children }) {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  
  if (isDashboard) {
    // Full-width layout for dashboard
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
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
