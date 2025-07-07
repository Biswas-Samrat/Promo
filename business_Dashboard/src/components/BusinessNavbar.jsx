import React, { useState, useEffect } from "react"; // Import useEffect
import { Link, useLocation } from "react-router-dom"; // Link for internal navigation
import { Avatar } from "@mui/material"; // Keep Avatar if you like Material-UI components
import ProfileDialog from "./ProfileDialog"; // Import the ProfileDialog component
import "./BusinessNavbar.css"; // Your custom CSS for BusinessNavbar

const BusinessNavbar = () => {
  const [isOpen, setIsOpen] = useState(false); // For mobile menu toggle
  // const [anchorEl, setAnchorEl] = useState(null); // No longer needed for Mui Menu
  const location = useLocation();

  // State for user profile and dialog
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorProfile, setErrorProfile] = useState(null);

  // Function to fetch user profile data from the backend
  const fetchUserProfile = async () => {
    setLoadingProfile(true);
    setErrorProfile(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadingProfile(false);
        setErrorProfile("No authentication token found.");
        console.warn("No token found for fetching profile. User might not be logged in.");
        return;
      }

      // IMPORTANT: Adjust the URL if your backend is on a different port/domain
      const response = await fetch("https://promo-ke7k.onrender.com/api/user/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send token for authentication
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error("Token expired or invalid. Redirecting to login.");
          localStorage.removeItem("token"); // Clear invalid token
          window.location.href = "https://promo-1-v4b5.onrender.com"; // Redirect to your business login page
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setErrorProfile(error.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchUserProfile(); // Fetch profile on component mount
  }, []); // Empty dependency array means this runs once on mount

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "http://localhost:5174/"; // Redirect to your business login/home page
  };

  const toggleProfileDialog = () => {
    setShowProfileDialog(!showProfileDialog);
    // setAnchorEl(null); // Close any Material-UI menu if it was somehow open
  };

  // Define navigation items
  const navItems = [
    { path: "/dashboard", label: "Home" },
    { path: "/favourite", label: "Favourite" },
    { path: "/Proposals", label: "Proposals" },
    { path: "/messages", label: "Messages" },
    { path: "/projects", label: "Projects" },
    { path: "/history", label: "History" },
  ];

  // Helper function to render profile area
  const renderProfileArea = () => {
    if (loadingProfile) {
      return <span className="text-white me-3">Loading profile...</span>;
    }
    if (errorProfile) {
      return <span className="text-danger me-3">Error: {errorProfile}</span>;
    }
    if (userProfile) {
      return (
        <li className="nav-item d-flex align-items-center profile-dropdown-wrapper">
          <div
            className="profile-info d-flex align-items-center me-3"
            onClick={toggleProfileDialog} // Click opens the dialog
            style={{ cursor: "pointer" }}
          >
            {/* Using Avatar from Material-UI if you prefer its styling, otherwise use a regular <img> */}
            <Avatar
              alt={`${userProfile.name}'s Profile`}
              src={userProfile.profilePictureUrl || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
              className="me-2 profile-navbar-img" // Custom class for size/border
            />
           
          </div>
        </li>
      );
    }
    return null;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link
          className="navbar-brand me-auto" 
         
          to="/dashboard"
          style={{ marginLeft: "15rem", fontFamily: "Playwrite BE WAL"}}
        >
          promo
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="navbarNav">
          {/* Middle Navigation Links */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 "
          
          >

            {navItems.map((item) => (
              <li className="nav-item " key={item.path}>
                <Link
                  className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
                  to={item.path}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right-aligned Profile and Logout */}
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {renderProfileArea()}
            <li className="nav-item">
              <button className="btn btn-outline-light" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Profile Dialog */}
      {showProfileDialog && userProfile && (
        <ProfileDialog
          userProfile={userProfile}
          onClose={toggleProfileDialog}
        />
      )}
    </nav>
  );
};

export default BusinessNavbar;
