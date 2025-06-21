// This file contains functions to handle authentication-related API calls.

// It includes functions for user signup and email verification.
export const signup = async (formData) => {
  const response = await fetch("http://localhost:8080/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return response.json();
};


// This function sends a request to verify the user's email using a verification code.
export const login = async (formData) => {
  const response = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Important for cookies!
    body: JSON.stringify(formData),
  });
  return response.json();
};

// This function sends a request to verify the user's email using a verification code.
export const forgotPassword = async (email) => {
  const response = await fetch("http://localhost:8080/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return response.json();
};


//// This function sends a request to verify the user's email using a verification code.
export const verifyResetToken = async (email, code) => {
  const response = await fetch("http://localhost:8080/api/auth/verify-reset-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  return response.json();
};

// This function sends a request to reset the user's password using a new password and verification code.
export const resetPassword = async (email, code, newPassword) => {
  const response = await fetch("http://localhost:8080/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, newPassword }),
  });
  return response.json();
};