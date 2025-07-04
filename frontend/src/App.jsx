<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
=======
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
>>>>>>> cccbcd8ad28449916d6ddc487e1f5c6b01e4a5af
import { 
  LoginPage, 
  SignupPage, 
  VerifyEmailPage, 
  ForgotPassword,
  Dashboard,
<<<<<<< HEAD
  ResultsManager,
  PageNotFound
} from "./components";

export default function App() {
  return (
    <Router>
      <div>
=======
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
>>>>>>> cccbcd8ad28449916d6ddc487e1f5c6b01e4a5af
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
<<<<<<< HEAD
          <Route path="/results" element={<ResultsManager />} />
=======
>>>>>>> cccbcd8ad28449916d6ddc487e1f5c6b01e4a5af
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
<<<<<<< HEAD
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
      </div>
=======
      </AppLayout>
>>>>>>> cccbcd8ad28449916d6ddc487e1f5c6b01e4a5af
    </Router>
  );
}
