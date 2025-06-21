import { Link } from "react-router-dom";

const Login = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
    <div className="text-center max-w-2xl mb-12">
      <h1 className="text-4xl font-extrabold text-black leading-tight">Automate Results.<br />Empower Colleges.</h1>
      <p className="mt-4 text-[#ec4899] text-lg font-medium">Upload once. Let intelligence take over.</p>
      <p className="mt-2 text-gray-600 text-sm italic">“A smart solution for faculty to distribute, analyze and manage student performance seamlessly.”</p>
    </div>
    <div className="bg-white p-10 rounded-3xl shadow-2xl border w-full max-w-md">
      <h2 className="text-3xl font-bold text-[#2e1065] text-center mb-2">Get into it 👋</h2>
      <p className="text-sm text-[#ec4899] text-center mb-6">Login to your account to continue</p>
      <form className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#2e1065] mb-1">Email</label>
          <input type="email" placeholder="you@college.edu" className="w-full border px-4 py-2 rounded-xl bg-[#f9fafb]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2e1065] mb-1">Password</label>
          <input type="password" placeholder="••••••••" className="w-full border px-4 py-2 rounded-xl bg-[#f9fafb]" />
          <div className="text-right mt-1">
            <Link to="/forgot-password" className="text-sm text-[#ec4899] hover:underline">Forgot password?</Link>
          </div>
        </div>
        <button type="submit" className="w-full bg-[#ec4899] text-white py-2 rounded-xl font-semibold hover:bg-pink-600">Login</button>
      </form>
      <p className="text-sm text-center text-[#2e1065] mt-6">
        Don’t have an account? <Link to="/signup" className="text-[#ec4899] font-medium hover:underline">Sign up</Link>
      </p>
    </div>
  </div>
);

export default Login;