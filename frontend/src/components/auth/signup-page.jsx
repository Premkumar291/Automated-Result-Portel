import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../api/auth";

// SVG icons
const UserIcon = (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5a8.25 8.25 0 0115 0" />
  </svg>
);

const MailIcon = (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12l-4-4-4 4m8 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0V6a2 2 0 00-2-2H6a2 2 0 00-2 2v6" />
  </svg>
);

const DeptIcon = (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7m-1-4H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
  </svg>
);

const EyeIcon = ({ shown, onClick }) => (
  <span
    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center"
    onClick={onClick}
    tabIndex={0}
    aria-label={shown ? "Hide password" : "Show password"}
    role="button"
  >
    {shown ? (
      // Eye Closed
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.956 9.956 0 012.293-3.95M6.873 6.872A9.956 9.956 0 0112 5c4.478 0 8.269 2.943 9.543 7a9.956 9.956 0 01-4.422 5.568M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
      </svg>
    ) : (
      // Eye Open
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )}  </span>
);

const LockIcon = (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Prepare data for API (confirmPassword is not sent)
    const formData = {
      name: form.name,
      email: form.email,
      department: form.department,
      password: form.password,
    };

    try {
      const data = await signup(formData);
      
      if (data.success === false) {
        setError(data.message || "Signup failed");
      } else {
        setSuccess("Signup successful! Please check your email for verification.");
        setForm({ name: "", email: "", department: "", password: "", confirmPassword: "" });
        // Navigate to verify email page after a short delay
        setTimeout(() => {
          navigate("/verify-email", { state: { email: form.email } });
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "Network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl font-extrabold text-black leading-tight">Create Account.<br />Join the Automation.</h1>
        <p className="mt-4 text-[#ec4899] text-lg font-medium">Sign up and let automation handle results.</p>
        <p className="mt-2 text-gray-600 text-sm italic">“Empowering faculty to simplify result management, effortlessly.”</p>
      </div>
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-[#2e1065] text-center mb-2">Sign Up 👤</h2>
        <p className="text-sm text-[#ec4899] text-center mb-6">Create your account to continue</p>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Full Name</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">{UserIcon}</span>              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}                disabled={loading}
                placeholder="Your Full Name"
                className={`w-full shadow-md hover:shadow-lg focus:shadow-xl focus:ring-2 focus:ring-[#ec4899] focus:ring-opacity-50 transition-all duration-200 pl-10 pr-4 py-2 rounded-xl bg-[#f9fafb] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Institutional Email ID</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">{MailIcon}</span>              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}                disabled={loading}
                placeholder="you@college.edu"
                className={`w-full shadow-md hover:shadow-lg focus:shadow-xl focus:ring-2 focus:ring-[#ec4899] focus:ring-opacity-50 transition-all duration-200 pl-10 pr-4 py-2 rounded-xl bg-[#f9fafb] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Department</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">{DeptIcon}</span>              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}                disabled={loading}
                placeholder="Department"
                className={`w-full shadow-md hover:shadow-lg focus:shadow-xl focus:ring-2 focus:ring-[#ec4899] focus:ring-opacity-50 transition-all duration-200 pl-10 pr-4 py-2 rounded-xl bg-[#f9fafb] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Password</label>            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                {LockIcon}
              </span>
              <input                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                placeholder="••••••••"
                className={`w-full outline-none shadow-md hover:shadow-lg focus:shadow-xl focus:ring-2 focus:ring-[#ec4899] focus:ring-opacity-50 transition-all duration-200 rounded-xl pl-12 pr-12 py-3 bg-[#f9fafb] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                required
              />
              <EyeIcon shown={showPassword} onClick={() => setShowPassword((prev) => !prev)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Confirm Password</label>            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                {LockIcon}
              </span>
              <input                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                placeholder="••••••••"
                className={`w-full outline-none shadow-md hover:shadow-lg focus:shadow-xl focus:ring-2 focus:ring-[#ec4899] focus:ring-opacity-50 transition-all duration-200 rounded-xl pl-12 pr-12 py-3 bg-[#f9fafb] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                required
              />
              <EyeIcon shown={showConfirm} onClick={() => setShowConfirm((prev) => !prev)} />
            </div>
          </div>          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-2 rounded-xl font-semibold transition-all duration-200 
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#ec4899] hover:bg-pink-600 hover:cursor-pointer active:translate-y-[2px] active:shadow-lg active:scale-[0.99]'
              } text-white`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </div>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
        <p className="text-sm text-center text-[#2e1065] mt-6">
          Already have an account? <Link to="/login" className="text-[#ec4899] font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;