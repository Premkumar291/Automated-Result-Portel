import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, verifyResetToken, resetPassword } from "../../api/auth";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      console.log('Sending forgot password request...');
      const data = await forgotPassword(form.email);
      console.log('Forgot password response:', data);
      
      if (data.success) {
        setSuccess(data.message);
        setStep(2);
      } else {
        setError(data.message || "Failed to send verification code");
      }
    } catch(err) {
      console.error('Forgot password error:', err);
      setError(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    // Validate code length
    if (form.code.length !== 6) {
      setError("Please enter a 6-digit code");
      setLoading(false);
      return;
    }

    try {
      console.log('Verifying reset code...');
      const data = await verifyResetToken(form.email, form.code);
      console.log('Verify reset token response:', data);
      
      if (data.success) {
        setSuccess("Code verified successfully!");
        // Clear any previous password data
        setForm(prev => ({
          ...prev,
          newPassword: "",
          confirmPassword: ""
        }));
        // Add a small delay to show the success message before transitioning
        setTimeout(() => {
          setStep(3); // Move to password reset step
        }, 1000);
      } else {
        setError(data.message || "Invalid verification code");
      }
    } catch (err) {
      console.error('Verify reset token error:', err);
      setError(err.message || "Failed to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }
    
    try {
      console.log('Resetting password...');
      const data = await resetPassword(form.email, form.code, form.newPassword);
      console.log('Reset password response:', data);
      
      if (data.success) {
        setSuccess("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch(err) {
      console.error('Reset password error:', err);
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const EyeIcon = ({ shown, onClick }) => (
    <span
      onClick={onClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center"
      role="button"
      aria-label={shown ? "Hide password" : "Show password"}
    >
      {shown ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.956 9.956 0 012.293-3.95M6.873 6.872A9.956 9.956 0 0112 5c4.478 0 8.269 2.943 9.543 7a9.956 9.956 0 01-4.422 5.568M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>      )}
    </span>
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

  return (
    <div className="min-h-screen bg-white font-[Poppins] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-xl mb-10">
        <h1 className="text-3xl font-extrabold text-black relative inline-block heading-sweep">
          Reset Your Password
        </h1>
        <p className="mt-4 text-[#ec4899] text-base">
          {step === 1 && "Enter your email to receive a verification code."}
          {step === 2 && "Enter the verification code sent to your email."}
          {step === 3 && "Enter your new password."}
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {success && <div className="text-green-500 text-sm mb-4">{success}</div>}

        {/* Step 1: Email */}
        {step === 1 && (
          <form className="space-y-5" onSubmit={handleSendCode}>
            <div>
              <label className="block text-sm font-medium text-[#2e1065] mb-1">Email</label>              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                placeholder="you@college.edu"
                className={`w-full outline-none shadow-md hover:shadow-lg focus:shadow-xl focus:ring-2 focus:ring-[#ec4899] focus:ring-opacity-50 transition-all duration-200 rounded-xl px-4 py-3 bg-[#f9fafb] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                required
              />
            </div>            <button
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
                  Sending Code...
                </div>
              ) : (
                'Send Code'
              )}
            </button>
          </form>
        )}

        {/* Step 2: Code */}
        {step === 2 && (
          <form className="space-y-5" onSubmit={handleVerifyCode}>
            <div>
              <label className="block text-sm font-medium text-[#2e1065] mb-1">Verification Code</label>              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Enter 6-digit code"
                maxLength={6}
                pattern="[0-9]{6}"
                className="w-full outline-none shadow-md hover:shadow-lg focus:shadow-xl focus:ring-2 focus:ring-[#ec4899] focus:ring-opacity-50 transition-all duration-200 rounded-xl px-4 py-3 bg-[#f9fafb]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code sent to {form.email}</p>
            </div>            <button
              type="submit"
              disabled={loading || form.code.length !== 6}
              className={`w-full py-2 rounded-xl font-semibold transition-all duration-200 
                ${loading || form.code.length !== 6
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
                  Verifying...
                </div>
              ) : form.code.length === 6 ? "Verify Code" : "Enter 6-digit code"}
            </button>
            <button
              type="button"
              onClick={handleSendCode}
              className="w-full mt-2 text-[#ec4899] text-sm hover:underline"
            >
              Resend code
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form className="space-y-5" onSubmit={handleResetPassword}>
            <div>
              <label className="block text-sm font-medium text-[#2e1065] mb-1">New Password</label>              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  {LockIcon}
                </span>                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full outline-none shadow-md hover:shadow-lg focus:shadow-xl focus:ring-2 focus:ring-[#ec4899] focus:ring-opacity-50 transition-all duration-200 rounded-xl pl-12 pr-12 py-3 bg-[#f9fafb]"
                  required
                />
                <EyeIcon shown={showNewPassword} onClick={() => setShowNewPassword(prev => !prev)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2e1065] mb-1">Confirm Password</label>              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  {LockIcon}
                </span>                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full outline-none shadow-md hover:shadow-lg focus:shadow-xl focus:ring-2 focus:ring-[#ec4899] focus:ring-opacity-50 transition-all duration-200 rounded-xl pl-12 pr-12 py-3 bg-[#f9fafb]"
                  required
                />
                <EyeIcon shown={showConfirmPassword} onClick={() => setShowConfirmPassword(prev => !prev)} />
              </div>
            </div>            <button
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
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        <div className="text-center mt-8">
          <Link to="/login" className="text-[#ec4899] font-medium hover:underline text-sm">
            Back to Login
          </Link>
        </div>
      </div>

      {/* Keep your existing animation styles */}
      <style>{`
        .heading-sweep {
          background-image: linear-gradient(120deg, #000000, #000000, #ffffff 40%, #000000, #000000);
          background-size: 300% 100%;
          background-repeat: no-repeat;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: sweepLight 3s linear infinite;
        }

        @keyframes sweepLight {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;