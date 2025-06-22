import { useState } from "react";
import { Link } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [staffId, setStaffId] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !staffId || !department || !institution || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
      setError("You must accept the terms and conditions.");
      return;
    }

    setError("");
    console.log("Signup Details:", { name, email, staffId, department, institution, password });
  };

  return (
    <div className="min-h-screen bg-white font-[Poppins] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl font-extrabold text-black leading-tight heading-sweep">
          Create Account.<br />
          Join the Automation.
        </h1>
        <p className="mt-4 text-[#ec4899] text-lg font-medium">
          Sign up and let automation handle results.
        </p>
        <p className="mt-2 text-gray-600 text-sm italic">
          “Empowering faculty to simplify result management, effortlessly.”
        </p>
      </div>

      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-[#e2e8f0] w-full max-w-md">
        <h2 className="text-3xl font-bold text-[#2e1065] text-center mb-2">Sign Up 👤</h2>
        <p className="text-sm text-[#ec4899] text-center mb-6">Create your account to continue</p>

        {error && (
          <p className="text-center text-red-500 mb-4 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="form-input" />
          <input type="text" placeholder="Staff ID" value={staffId} onChange={(e) => setStaffId(e.target.value)} className="form-input" />
          <input type="text" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} className="form-input" />
          <input type="text" placeholder="Institutional Email ID" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" />
          <input type="text" placeholder="Institution Name" value={institution} onChange={(e) => setInstitution(e.target.value)} className="form-input" />

          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" />
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-input" />

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={() => setAgreeTerms(!agreeTerms)}
              className="mr-2"
            />
            <p className="text-sm text-[#2e1065]">
              I agree to the <Link to="/terms" className="text-[#ec4899] underline">Terms & Conditions</Link>
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#ec4899] text-white py-2 rounded-xl font-semibold hover:bg-pink-600 transition"
          >
            Sign Up
          </button>
        </form>

        {/* Social Sign-In */}
        <div className="mt-6 space-y-3">
          <div className="relative flex items-center justify-center mb-4">
            <hr className="w-full border-gray-300" />
            <span className="absolute bg-white px-3 text-sm text-gray-500">or</span>
          </div>

          <button className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition">
            <img src="https://img.icons8.com/color/20/000000/google-logo.png" alt="Google" />
            <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
          </button>

          <button className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition">
            <img src="https://img.icons8.com/ios-glyphs/20/000000/github.png" alt="GitHub" />
            <span className="text-sm font-medium text-gray-700">Sign in with GitHub</span>
          </button>

          <button className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition">
            <span className="text-sm font-medium text-gray-700">Sign in with SSO</span>
          </button>
        </div>

        <p className="text-sm text-center text-[#2e1065] mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#ec4899] font-medium hover:underline transition">
            Login
          </Link>
        </p>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          border: 1px solid #cbd5e1;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          background-color: #f9fafb;
          color: #2e1065;
          outline: none;
          font-size: 0.875rem;
        }
        .form-input:focus {
          border-color: #ec4899;
          box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.4);
        }

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

export default Signup;
