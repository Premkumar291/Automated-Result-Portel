import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/auth/login-page";
import SignupPage from "./components/auth/signup-page";
import Dashboard from "./components/Dashboard/dashboard";
import VerifyEmail from "./components/auth/verify-email-page";
import ForgotPassword from "./components/auth/forgot-password"; // Add this import

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Fixed route */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

