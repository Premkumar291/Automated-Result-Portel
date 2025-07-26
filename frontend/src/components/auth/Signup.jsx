import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setError("Password must be strong (uppercase, lowercase, number, special char, min 8 chars)");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    console.log("Signup Details:", { name, email, password });
    navigate("/manage-results"); // ✅ Redirect after signup
  };

  return (
    <div className="min-h-screen bg-white font-[Poppins] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl font-extrabold text-black leading-tight heading-sweep">
          Create Account.<br />Join the Automation.
        </h1>
        <p className="mt-4 text-[#ec4899] text-lg font-medium">
          Sign up and let automation handle results.
        </p>
        <p className="mt-2 text-gray-600 text-sm italic">
          “Empowering faculty to simplify result management, effortlessly.”
        </p>
      </div>

      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-300 w-full max-w-md">
        <h2 className="text-3xl font-bold text-[#2e1065] text-center mb-2">Sign Up 👤</h2>
        <p className="text-sm text-[#ec4899] text-center mb-6">Create your account to continue</p>

        {error && <p className="text-center text-red-500 mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Name</label>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full border px-4 py-2 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#ec4899]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Email</label>
            <input
              type="email"
              placeholder="you@college.edu"
              className="w-full border px-4 py-2 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#ec4899]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border px-4 py-2 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#ec4899]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border px-4 py-2 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#ec4899]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#ec4899] text-white py-2 rounded-xl font-semibold hover:bg-pink-600 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center text-[#2e1065] mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#ec4899] font-medium hover:underline transition">
            Login
          </Link>
        </p>
      </div>

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

export default Signup;
