import { Link } from "react-router-dom";

const Terms = () => (
  <div className="min-h-screen bg-white p-6">
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-[#2e1065] mb-4">Terms & Conditions</h1>
      <ul className="list-disc list-inside space-y-3 text-gray-600 text-sm">
        <li>Only authorized faculty members of the institution may register.</li>
        <li>You must use your institutional email address for signup and login.</li>
        <li>Maintain the confidentiality of student data and login credentials.</li>
        <li>Do not share passwords or access tokens with others.</li>
        <li>All academic data uploaded must be accurate and true to your knowledge.</li>
        <li>Actions taken inside this portal may be logged and monitored.</li>
        <li>Violations of policy can result in account suspension or legal action.</li>
      </ul>
      <p className="mt-6 text-sm text-gray-700 italic">
        By creating an account, you agree to abide by the above terms and the institution’s data policy.
      </p>
      <div className="mt-6">
        <Link to="/signup" className="text-[#ec4899] hover:underline">← Back to Signup</Link>
      </div>
    </div>
  </div>
);

export default Terms;