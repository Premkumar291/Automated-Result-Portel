import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyEmail } from "../../api/auth";

const VerifyEmail = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await verifyEmail(code);
      
      if (data.success) {
        setSuccess("Email verified successfully! Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError(data.message || "Verification failed");
      }
    } catch (err) {
      setError(err.message || "Network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#2e1065] text-center mb-4">Verify Your Email</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter the verification code sent to your email{email ? ` (${email})` : ""}.
        </p>        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            disabled={loading}
            placeholder="Verification Code"
            className={`w-full outline-none shadow-md hover:shadow-lg focus:shadow-xl focus:ring-2 focus:ring-[#ec4899] focus:ring-opacity-50 transition-all duration-200 rounded-xl px-4 py-3 bg-[#f9fafb] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            required
          />
          <button 
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
                Verifying...
              </div>
            ) : (
              'Verify'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;