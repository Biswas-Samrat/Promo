import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import BusinessNavbar from "./components/BusinessNavbar";
import Home from "./pages/home/Home_Page";
import Messages from "./pages/Messages";
import Projects from "./pages/Projects";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Favourite from "./pages/Favourite";
import Proposals from "./pages/Proposal";
import PrivateRoute from "./components/PrivateRoute";

// TokenHandler component: Now also sets the 'isFirstVisitAfterAuth' flag
function TokenHandler({ children }) {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      // Set the flag here, as this is where the token is first recognized after auth
      localStorage.setItem("isFirstVisitAfterAuth", "true"); 
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location]);

  return children;
}

// GlobalRefreshHandler component: Triggers full page reload once after auth
function GlobalRefreshHandler({ children }) {
  const location = useLocation(); // Keep useLocation for dependency, though reload will reset everything

  useEffect(() => {
    const isFirstVisit = localStorage.getItem('isFirstVisitAfterAuth');

    if (isFirstVisit === 'true') {
      console.log("First visit after authentication detected. Initiating full page refresh...");
      localStorage.removeItem('isFirstVisitAfterAuth'); // Remove the flag immediately
      
      // Use a small delay to ensure localStorage update is committed before reload
      setTimeout(() => {
        window.location.reload(); // Perform a full page reload
      }, 100); // A very short delay, e.g., 100ms
    }
  }, [location]); // Re-run if location changes, although reload bypasses subsequent checks

  return children;
}


// Your protected routes
function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <PrivateRoute>
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
        <TokenHandler>
          {/* Wrap AppRoutes with GlobalRefreshHandler to enable the functionality */}
          <GlobalRefreshHandler>
            <AppRoutes />
          </GlobalRefreshHandler>
        </TokenHandler>
      </div>
    </Router>
  );
}

export default App;