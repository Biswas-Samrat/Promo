import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // 1. Check for token presence
  if (!token) {
    // If no token, redirect to a public login page.
    // Replace '/login' with the actual path to your application's login page.
    console.log("No token found. Redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  // 2. Check token validity and expiration
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert current time to seconds

    if (decodedToken.exp < currentTime) {
      // If token is expired, remove it and redirect to login
      localStorage.removeItem("token");
      console.log("Token expired. Redirecting to login.");
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    // If the token is malformed or invalid for any other reason,
    // remove it and redirect to login.
    localStorage.removeItem("token");
    console.error("Invalid token format or unable to decode. Redirecting to login.", error);
    return <Navigate to="/login" replace />;
  }

  // If token exists, is valid, and not expired, render the children (protected content)
  return children;
};

export default PrivateRoute;


