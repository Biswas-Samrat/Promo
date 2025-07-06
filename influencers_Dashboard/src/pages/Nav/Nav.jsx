// import React from "react";
// import { NavLink } from "react-router-dom"; 
// import "./Navbar.css";

// function Navbar() {

//    const handleLogout = () => {
//     localStorage.removeItem("token");
//     window.location.href = "http://localhost:5173/";
//   };

//   return (
//     <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
//       <NavLink
//         className="navbar-brand" 
//         to="/Proposals"
//         style={{ marginLeft: "4rem", fontFamily: "Playwrite BE WAL" }}
//       >
//         promo
//       </NavLink>
//       <div className="container-fluid d-flex justify-content-center" style={{marginRight:"10rem"}}>

//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>

//         <div
//           className="collapse navbar-collapse justify-content-center"
//           id="navbarNav"
//         >
       
//           <ul className="navbar-nav mb-2 mb-lg-0">
      
      
//             <li className="nav-item">
//               <NavLink
//                 className="nav-link"
//                 to="/Proposals"
          
//               >
//                 Proposals
//               </NavLink>
//             </li>
//             <li className="nav-item">
//               <NavLink
//                 className="nav-link"
//                 to="/messages"
                
//               >
//                 Messages
//               </NavLink>
//             </li>
//             <li className="nav-item">
//               <NavLink
//                 className="nav-link"
//                 to="/projects"
          
//               >
//                 Projects
//               </NavLink>
//             </li>
//             <li className="nav-item">
//               <NavLink
//                 className="nav-link"
//                 to="/history"
           
//               >
//                 History
//               </NavLink>
//             </li>
//             <li className="nav-item">
//               <NavLink
//                 className="nav-link"
//                 to="/profile"
          
//               >
//                 Profile
//               </NavLink>
//             </li>
//           </ul>

//           <button onClick={handleLogout}>Logout</button>
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;



import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import ProfileDialog from "./ProfileDialog"; // Import the ProfileDialog component
import "./Navbar.css";

function Navbar() {
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [userProfile, setUserProfile] = useState(null); // State to store user profile data
  const [loadingProfile, setLoadingProfile] = useState(true); // To show loading state
  const [errorProfile, setErrorProfile] = useState(null); // To handle fetch errors

  // Function to fetch user profile data from the backend
  const fetchUserProfile = async () => {
    setLoadingProfile(true);
    setErrorProfile(null);
    try {
      const token = localStorage.getItem("token"); // Get the token from localStorage
      if (!token) {
        // If no token, maybe redirect to login or show a default state
        setLoadingProfile(false);
        setErrorProfile("No authentication token found.");
        console.warn("No token found for fetching profile.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/user/profile", { // Adjust URL if your backend is on a different port/domain
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send token for authentication
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            // Token expired or invalid
            localStorage.removeItem("token"); // Clear invalid token
            window.location.href = "http://localhost:5173/"; // Redirect to login
            return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch user profile");
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
    window.location.href = "http://localhost:5173/"; // Redirect to your login/home page
  };

  const toggleProfileDialog = () => {
    setShowProfileDialog(!showProfileDialog);
  };

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
        <li className="nav-item d-flex align-items-center">
          <div
            className="profile-info d-flex align-items-center me-3"
            onClick={toggleProfileDialog}
            style={{ cursor: "pointer" }}
          >
            <img
              src={userProfile.profilePictureUrl || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} // Use actual URL or default
              alt={`${userProfile.name}'s Profile`}
              className="rounded-circle me-2 profile-navbar-img" // Added specific class
            />
         
          </div>
        </li>
      );
    }
    // Fallback if no userProfile (e.g., not logged in yet)
    return null; // Or render a "Login" button if appropriate
  };


  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <NavLink
        className="navbar-brand"
        to="/Proposals"
        style={{ marginLeft: "4rem", fontFamily: "Playwrite BE WAL" }}
      >
        promo
      </NavLink>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        {/* Middle navigation links - using mx-auto for centering */}
        <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <NavLink className="nav-link" to="/Proposals"
            style={{marginLeft:"200px"}}
            >
              Proposals
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/messages">
              Messages
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/projects">
              Projects
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/history">
              History
            </NavLink>
          </li>
        </ul>

        {/* Right-aligned profile and logout - using ms-auto for right alignment */}
        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
          {renderProfileArea()} {/* Render the profile picture/name or loading/error */}
          <li className="nav-item">
            <button className="btn btn-outline-light" onClick={handleLogout}
            style={{marginRight:"80px"}}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Profile Dialog - only render if showProfileDialog is true and userProfile exists */}
      {showProfileDialog && userProfile && (
        <ProfileDialog
          userProfile={userProfile}
          onClose={toggleProfileDialog}
        />
      )}
    </nav>
  );
}

export default Navbar;