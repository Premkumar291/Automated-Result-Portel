import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyEmail = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("http://localhost:8080/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Verification failed");
      } else {
        // Navigate to dashboard on success
        navigate("/dashboard");
      }
    } catch {
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#2e1065] text-center mb-4">Verify Your Email</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter the verification code sent to your email{email ? ` (${email})` : ""}.
        </p>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Verification Code"
            className="w-full border px-4 py-2 rounded-xl bg-[#f9fafb]"
            required
          />
          <button type="submit" className="w-full bg-[#ec4899] text-white py-2 rounded-xl font-semibold hover:bg-pink-600">
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;