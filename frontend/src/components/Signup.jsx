import { useState } from "react";
import { Link } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !department || !staffId || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the terms and conditions");
      return;
    }

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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

    setError("");
    console.log("Signup Details:", {
      name,
      email,
      department,
      staffId,
      password,
    });

    // Send data to backend here
  };

  return (
    <div className="min-h-screen bg-white font-[Poppins] flex flex-col items-center justify-center px-4">
      {/* ✨ Project Heading Section */}
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl font-extrabold text-black leading-tight relative inline-block heading-sweep">
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

      {/* 🧾 Signup Card */}
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-[#e2e8f0] w-full max-w-md">
        <h2 className="text-3xl font-bold text-[#2e1065] text-center mb-2">Sign Up 👤</h2>
        <p className="text-sm text-[#ec4899] text-center mb-6">Create your account to continue</p>

        {error && (
          <p className="text-center text-red-500 mb-4 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Your Full Name"
              className="w-full border border-[#cbd5e1] px-4 py-2 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#ec4899] text-[#2e1065]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Institutional Email ID</label>
            <input
              type="email"
              placeholder="you@college.edu"
              className="w-full border border-[#cbd5e1] px-4 py-2 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#ec4899] text-[#2e1065]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Department</label>
            <input
              type="text"
              placeholder="Department"
              className="w-full border border-[#cbd5e1] px-4 py-2 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#ec4899] text-[#2e1065]"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Staff ID</label>
            <input
              type="text"
              placeholder="Staff/Employee ID"
              className="w-full border border-[#cbd5e1] px-4 py-2 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#ec4899] text-[#2e1065]"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-[#cbd5e1] px-4 py-2 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#ec4899] text-[#2e1065]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must include uppercase, lowercase, number & symbol. Min 8 chars.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-[#cbd5e1] px-4 py-2 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#ec4899] text-[#2e1065]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="terms" className="text-sm text-[#2e1065]">
              I agree to the <Link to="/terms" className="text-[#ec4899] hover:underline">Terms & Conditions</Link>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#ec4899] text-white py-2 rounded-xl font-semibold hover:bg-pink-600 transition duration-200"
          >
            Sign Up
          </button>
        </form>

        {/* 🔗 Divider & Social Sign-in */}
        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-4">
            <hr className="w-full border-gray-300" />
            <span className="absolute bg-white px-3 text-sm text-gray-500">or</span>
          </div>

          <div className="space-y-3">
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
        </div>

        {/* 🔁 Login Link */}
        <p className="text-sm text-center text-[#2e1065] mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#ec4899] font-medium hover:underline transition">
            Login
          </Link>
        </p>
      </div>

      {/* ✨ Glowing Heading Animation */}
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
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: 0 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Signup;
