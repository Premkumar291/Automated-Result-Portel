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