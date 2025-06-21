import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { login } from "../../api/auth"

// SVG icons
const MailIcon = (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 12l-4-4-4 4m8 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0V6a2 2 0 00-2-2H6a2 2 0 00-2 2v6"
    />
  </svg>
)

const EyeIcon = ({ shown, onClick }) => (
  <span
    onClick={onClick}
    tabIndex={0}
    aria-label={shown ? "Hide password" : "Show password"}
    role="button"
    className="cursor-pointer"
  >
    {shown ? (
      // Eye Closed SVG
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.956 9.956 0 012.293-3.95M6.873 6.872A9.956 9.956 0 0112 5c4.478 0 8.269 2.943 9.543 7a9.956 9.956 0 01-4.422 5.568M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
      </svg>
    ) : (
      // Eye Open SVG
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    )}
  </span>
)

const UserIcon = (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5a8.25 8.25 0 0115 0" />
  </svg>
)

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const data = await login(form)
      if (data.message === "Login successful") {
        navigate("/dashboard")
      } else {
        setError(data.message || "Login failed")
      }
    } catch {
      setError("Network error")
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl font-extrabold text-black leading-tight">
          Automate Results.
          <br />
          Empower Colleges.
        </h1>
        <p className="mt-4 text-[#ec4899] text-lg font-medium">Upload once. Let intelligence take over.</p>
        <p className="mt-2 text-gray-600 text-sm italic">
          "A smart solution for faculty to distribute, analyze and manage student performance seamlessly."
        </p>
      </div>
      <div className="bg-white p-10 rounded-3xl shadow-2xl border w-full max-w-md">
        <h2 className="text-3xl font-bold text-[#2e1065] text-center mb-2">Get into it 👋</h2>
        <p className="text-sm text-[#ec4899] text-center mb-6">Login to your account to continue</p>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">{UserIcon}</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@college.edu"
                className="w-full outline-none border-2 border-gray-300 focus:border-[#ec4899] transition rounded-xl pl-10 py-2 bg-[#f9fafb]"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-auto">
                <EyeIcon shown={showPassword} onClick={() => setShowPassword((prev) => !prev)} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full outline-none border-2 border-gray-300 focus:border-[#ec4899] transition rounded-xl pl-10 py-2 bg-[#f9fafb]"
                required
              />
              <div className="text-right mt-1">
                <Link to="/forgot-password" className="text-sm text-[#ec4899] hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[#ec4899] text-white py-2 rounded-xl font-semibold hover:bg-pink-600"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-center text-[#2e1065] mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#ec4899] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
