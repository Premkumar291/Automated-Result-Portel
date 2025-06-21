import { Link } from "react-router-dom";

const Signup = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
    <div className="text-center max-w-2xl mb-12">
      <h1 className="text-4xl font-extrabold text-black leading-tight">Create Account.<br />Join the Automation.</h1>
      <p className="mt-4 text-[#ec4899] text-lg font-medium">Sign up and let automation handle results.</p>
      <p className="mt-2 text-gray-600 text-sm italic">“Empowering faculty to simplify result management, effortlessly.”</p>
    </div>
    <div className="bg-white p-10 rounded-3xl shadow-2xl border w-full max-w-md">
      <h2 className="text-3xl font-bold text-[#2e1065] text-center mb-2">Sign Up 👤</h2>
      <p className="text-sm text-[#ec4899] text-center mb-6">Create your account to continue</p>
      <form className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#2e1065] mb-1">Full Name</label>
          <input type="text" placeholder="Your Full Name" className="w-full border px-4 py-2 rounded-xl bg-[#f9fafb]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2e1065] mb-1">Institutional Email ID</label>
          <input type="email" placeholder="you@college.edu" className="w-full border px-4 py-2 rounded-xl bg-[#f9fafb]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2e1065] mb-1">Department</label>
          <input type="text" placeholder="Department" className="w-full border px-4 py-2 rounded-xl bg-[#f9fafb]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2e1065] mb-1">Staff ID</label>
          <input type="text" placeholder="Staff/Employee ID" className="w-full border px-4 py-2 rounded-xl bg-[#f9fafb]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2e1065] mb-1">Password</label>
          <input type="password" placeholder="••••••••" className="w-full border px-4 py-2 rounded-xl bg-[#f9fafb]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2e1065] mb-1">Confirm Password</label>
          <input type="password" placeholder="••••••••" className="w-full border px-4 py-2 rounded-xl bg-[#f9fafb]" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="terms" className="h-4 w-4" />
          <label htmlFor="terms" className="text-sm text-[#2e1065]">
            I agree to the <Link to="/terms" className="text-[#ec4899] hover:underline">Terms & Conditions</Link>
          </label>
        </div>
        <button type="submit" className="w-full bg-[#ec4899] text-white py-2 rounded-xl font-semibold hover:bg-pink-600">Sign Up</button>
      </form>
      <p className="text-sm text-center text-[#2e1065] mt-6">
        Already have an account? <Link to="/login" className="text-[#ec4899] font-medium hover:underline">Login</Link>
      </p>
    </div>
  </div>
);

export default Signup;