// This file contains functions to handle authentication-related API calls.

const apiUrl = "http://localhost:8080/api";

// It includes functions for user signup and email verification.
export const signup = async (formData) => {
  const response = await fetch(`${apiUrl}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};


// This function sends a request to verify the user's email using a verification code.
export const login = async (formData) => {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Important for cookies!
    body: JSON.stringify(formData),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};

export const verifyEmail = async (code) => {
  try {
    console.log('Sending verify email request:', { code });
    const response = await fetch(`${apiUrl}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    
    const data = await response.json();
    console.log('Verify email response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Verify email API error:', error);
    throw error;
  }
};

// This function sends a request to verify the user's email using a verification code.
export const forgotPassword = async (email) => {
  try {
    console.log('Sending forgot password request:', { email });
    const response = await fetch(`${apiUrl}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    console.log('Forgot password response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Forgot password API error:', error);
    throw error;
  }
};


//// This function sends a request to verify the user's email using a verification code.
export const verifyResetToken = async (email, code) => {
  try {
    console.log('Sending verify reset token request:', { email, code });
    const response = await fetch(`${apiUrl}/auth/verify-reset-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    
    const data = await response.json();
    console.log('Verify reset token response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Verify reset token API error:', error);
    throw error;
  }
};

// This function sends a request to reset the user's password using a new password and verification code.
export const resetPassword = async (email, code, newPassword) => {
  try {
    console.log('Sending reset password request:', { email, code });
    const response = await fetch(`${apiUrl}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });
    
    const data = await response.json();
    console.log('Reset password response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Reset password API error:', error);
    throw error;
  }
};

// This function sends a request to logout the user
export const logout = async () => {
  try {
    console.log('Sending logout request');
    const response = await fetch(`${apiUrl}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important for cookies!
    });
    
    const data = await response.json();
    console.log('Logout response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Logout API error:', error);
    throw error;
  }
};

// This function checks if the user is authenticated
export const checkAuth = async () => {
  try {
    console.log('Checking authentication status');
    const response = await fetch(`${apiUrl}/auth/check-auth`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important for cookies!
    });
    
    const data = await response.json();
    console.log('Check auth response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Check auth API error:', error);
    throw error;
  }
};