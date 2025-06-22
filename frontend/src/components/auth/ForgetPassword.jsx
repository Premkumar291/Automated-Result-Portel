import { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (code !== "123456") {
      setError("Invalid verification code.");
      return;
    }
    setError("");
    setStep(3);
  };

  const handlePasswordReset = (e) => {
  e.preventDefault();

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/;

  if (!password || !confirm) {
    setError("Please enter and confirm your new password.");
    return;
  }

  if (!strongPasswordRegex.test(password)) {
    setError(
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
    );
    return;
  }

  if (password !== confirm) {
    setError("Passwords do not match.");
    return;
  }

  setError("");
  setSuccess("Password reset successful! You may now login.");
  setStep(4);
};


  return (
    <div className="min-h-screen bg-white font-[Poppins] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-xl mb-10">
        <h1 className="text-3xl font-extrabold text-black relative inline-block heading-sweep">
          Reset Your Password
        </h1>
        <p className="mt-4 text-[#ec4899] text-base">
          {step === 1 && "Enter your email to receive a verification code."}
          {step === 2 && "Check your email for the 6-digit code (mock: 123456)."}
          {step === 3 && "Set your new password securely."}
          {step === 4 && "Done! You can now log in with your new password."}
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-[#e2e8f0] w-full max-w-md">
        {error && <p className="text-center text-red-500 mb-4 text-sm">{error}</p>}
        {success && <p className="text-center text-green-600 mb-4 text-sm">{success}</p>}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#2e1065] mb-1">Email</label>
              <input
                type="email"
                placeholder="you@college.edu"
                className="w-full border border-gray-300 px-4 py-2 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#ec4899]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#ec4899] text-white py-2 rounded-xl font-semibold hover:bg-pink-600 transition duration-200"
            >
              Send Code
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCodeSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#2e1065] mb-1">Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full border border-gray-300 px-4 py-2 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#ec4899]"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#ec4899] text-white py-2 rounded-xl font-semibold hover:bg-pink-600 transition duration-200"
            >
              Verify Code
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordReset} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#2e1065] mb-1">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full border border-gray-300 px-4 py-2 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#ec4899]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2e1065] mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter password"
                className="w-full border border-gray-300 px-4 py-2 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#ec4899]"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#ec4899] text-white py-2 rounded-xl font-semibold hover:bg-pink-600 transition duration-200"
            >
              Reset Password
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="text-center">
            <Link to="/login" className="text-[#ec4899] font-medium hover:underline text-sm">
              Go to Login
            </Link>
          </div>
        )}
      </div>

      {/* ✨ Glowing Animation Style */}
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
