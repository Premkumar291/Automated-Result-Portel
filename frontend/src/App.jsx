<<<<<<< HEAD
import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import ForgotPassword from './components/auth/ForgetPassword' 
import Sidebar from './components/dashboard/Sidebar'
import PublishResults from './components/dashboard/PublishResults'
import Analytics from './components/dashboard/Analytics'
import StudentList from './components/dashboard/StudentList'
import Profile from './components/dashboard/Profile'
import HelpSupport from './components/dashboard/HelpSupport'
import Settings from './components/dashboard/Settings'
import ManageResults from './components/dashboard/ManageResults'
import { ThemeProvider } from "./context/ThemeContext";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
       <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard/*" element={<Sidebar />} />

      <Route path="/publish" element={<PublishResults />} />
      
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/students" element={<StudentList />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/help" element={<HelpSupport />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/manage-results" element={<ManageResults />} />
      <Route path="/theme" element={<ThemeProvider />} />
      {/* Add more routes as needed */} 
      
      
    </Routes>
  )
=======
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
>>>>>>> Prem-dev
}

export default App

