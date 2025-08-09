import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Removed useLocation, useEffect

import BusinessNavbar from "./components/BusinessNavbar";
import Home from "./pages/home/Home_Page";
import Messages from "./pages/Messages";
import Projects from "./pages/Projects";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Favourite from "./pages/Favourite";
import Proposals from "./pages/Proposal";
import PrivateRoute from "./components/PrivateRoute";

// Your protected routes
function AppRoutes() {
  return (
    <Routes>
      {/*
        The wildcard path "/*" will catch any path that hasn't been matched
        by a more specific route. It's often used with nested routes.
        Ensure your PrivateRoute correctly handles authentication status.
      */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            {/*
              Render BusinessNavbar and nested Routes only if the user is authenticated.
              This setup ensures that BusinessNavbar is always present on protected pages
              and the sub-routes handle the specific page content.
            */}
            <>
              <BusinessNavbar />
              <Routes>
                <Route path="/dashboard" element={<Home />} />
                <Route path="/Proposals" element={<Proposals />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/Favourite" element={<Favourite />} />
                {/*
                  Fallback route: If no other path matches within the PrivateRoute,
                  it will default to Home.
                */}
                <Route path="*" element={<Home />} />
              </Routes>
            </>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

// Final App component
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-light">
        {/*
          No need for TokenHandler or GlobalRefreshHandler as the token
          is now handled correctly during registration/login in Join.jsx
          and should not appear in the URL.
        */}
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
