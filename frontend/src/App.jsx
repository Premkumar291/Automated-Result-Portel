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
      {/* Add more routes as needed */} 
      
      
    </Routes>
  )
}

export default App

