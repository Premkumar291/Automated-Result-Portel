"use client"
import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-red-500">Access Denied</h1>
          <p className="text-gray-400">
            You don't have permission to access this page. Please contact your administrator or return to your dashboard.
          </p>
        </div>
        <div className="space-y-4">
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
