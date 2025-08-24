import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { 
  LoginPage, 
  SignupPage, 
  VerifyEmailPage, 
  ForgotPassword,
  Dashboard as FacultyDashboard,
  PageNotFound
} from "./components";
import { ResultAnalysis } from "./components/Faculty - frontend/Analysis";
import ReportGenerationPage from "./components/Faculty - frontend/ReportGenerationPage";
import AdminDashboard from "./components/Admin - frontend/Dashboard/dashboard";
import AddStudentPage from "./components/Admin - frontend/creatingPages/add-student-page";
import CreateFaculty from "./components/Admin - frontend/creatingPages/create-faculty";
import SubjectManagement from "./components/Admin - frontend/creatingPages/subject-management";
import FacultyManagement from "./components/Admin - frontend/creatingPages/faculty-management";


// Layout wrapper component that applies different styles based on route
function AppLayout({ children }) {
  const location = useLocation();
  const isFullWidthPage = location.pathname === '/faculty-dashboard' || location.pathname === '/admin-dashboard' || location.pathname.includes('/result-analysis') || location.pathname.includes('/add-student') || location.pathname.includes('/generate-report') || location.pathname.includes('/subject-management') || location.pathname.includes('/faculty-management');
  
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
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/createFaculty/add-student" element={<AddStudentPage />} />
          <Route path="/admin/createFaculty/create-faculty" element={<CreateFaculty />} />
          <Route path="/admin/subject-management" element={<SubjectManagement />} />
          <Route path="/admin/faculty-management" element={<FacultyManagement />} />
          
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/result-analysis" element={<ResultAnalysis />} />
          <Route path="/generate-report" element={<ReportGenerationPage />} />
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

export default App;

