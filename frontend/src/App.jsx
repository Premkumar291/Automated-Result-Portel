import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Signup from './components/Signup'
import ForgotPassword from './ForgetPassword' 
import Terms from './components/terms'
import Sidebar from './components/Sidebar'
import Dashboard from './components/dashboard'
import UploadResults from './components/UploadResults'
import PublishResults from './components/PublishResults'
import MyResults from './components/MyResults'
import Analytics from './components/Analytics'
import StudentList from './components/StudentList'
import Profile from './components/Profile'
import HelpSupport from './components/HelpSupport'
import Settings from './components/Settings'


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
       <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/dashboard/*" element={<Sidebar />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/upload" element={<UploadResults />} />
      <Route path="/publish" element={<PublishResults />} />
      <Route path="/my-results" element={<MyResults />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/students" element={<StudentList />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/help" element={<HelpSupport />} />
      <Route path="/settings" element={<Settings />} />
      
      {/* Add more routes as needed */} 
      
      
    </Routes>
  )
}

export default App

