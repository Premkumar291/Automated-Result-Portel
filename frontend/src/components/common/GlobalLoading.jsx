import React from "react";

const GlobalLoading = ({ message = "Initializing ACADEX Portal" }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 z-50 fixed inset-0">
            <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-purple-500 rounded-full animate-ping opacity-20"></div>
                    {/* Added border-t-transparent to make the spin visible */}
                    <div className="absolute inset-2 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-4 border-purple-600 rounded-full animate-pulse"></div>
                    <div className="absolute inset-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-white animate-bounce"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>
                </div>
                <h2 className="text-3xl font-bold mb-4 text-neutral-900">
                    {message}
                </h2>
                <div className="flex justify-center space-x-2">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-full bg-purple-600 animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GlobalLoading;
