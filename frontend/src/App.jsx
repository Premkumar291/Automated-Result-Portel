import LoginPage from "./components/login-page"
import SignupPage from "./components/signup-page"
import Dashboard from "./components/dashboard"

export default function App() {
  

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Dashboard />
      </div>
    </div>
  )
}
