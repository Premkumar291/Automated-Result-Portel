import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    console.log("Login Details:", { email, password });
    setError("");
    navigate("/manage-results"); // ✅ Redirect after login
  };

  return (
    <div className="min-h-screen bg-white font-[Poppins] flex flex-col items-center justify-center px-4">
      {/* Project Quote */}
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl font-extrabold text-black leading-tight heading-sweep">
          Automate Results.<br />Empower Colleges.
        </h1>
        <p className="mt-4 text-[#ec4899] text-lg font-medium">Upload once. Let intelligence take over.</p>
        <p className="mt-2 text-gray-600 text-sm italic">“A smart solution to manage student performance seamlessly.”</p>
      </div>

      {/* Login Card */}
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-300 w-full max-w-md">
        <h2 className="text-3xl font-bold text-[#2e1065] text-center mb-2">Get into it 👋</h2>
        <p className="text-sm text-[#ec4899] text-center mb-6">Login to your account to continue</p>

        {error && <p className="text-center text-red-500 mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div>
            <label className="block text-sm font-medium text-[#2e1065] mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 px-4 py-2 rounded-xl bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#ec4899]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#ec4899] text-white py-2 rounded-xl font-semibold hover:bg-pink-600 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center text-[#2e1065] mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-[#ec4899] font-medium hover:underline transition">
            Sign up
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

export default Login;
