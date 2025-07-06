import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "../src/pages/Nav/Nav";
import Messages from "../src/pages/messages/Messages";
import History from "../src/pages/history/History";
import Projects from "../src/pages/projects/Projects";
import Proposals from "../src/pages/proposals/Proposals";
import Profile from "../src/pages/profile/Profile";
import PrivateRoute from './PrivateRoute';

// TokenHandler component (remains the same)
function TokenHandler({ children }) {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token); // Save token securely
      // IMPORTANT: Set the flag AFTER successfully processing the token
      localStorage.setItem("isFirstVisitAfterAuth", "true"); 
      window.history.replaceState({}, "", location.pathname); // Remove token from URL
    }
  }, [location]);

  return children;
}

// New component to handle the global refresh
function GlobalRefreshHandler({ children }) {
  const location = useLocation(); // To detect path changes if needed, though window.location.reload will clear this

  useEffect(() => {
    const isFirstVisit = localStorage.getItem('isFirstVisitAfterAuth');

    if (isFirstVisit === 'true') {
      console.log("First visit after authentication detected. Initiating full page refresh...");
      localStorage.removeItem('isFirstVisitAfterAuth'); // Remove the flag immediately
      
      // Use a small delay to ensure localStorage update is committed before reload
      // and to give the browser a moment before forcing a refresh.
      setTimeout(() => {
        window.location.reload(); // Perform a full page reload
      }, 100); // A very short delay, e.g., 100ms
    }
  }, [location]); // Dependency on location ensures it checks on route changes too (though reload bypasses this)

  return children;
}


function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <>
              <Navbar />
              <Routes>
                <Route path="/Proposals" element={<Proposals />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Proposals />} />
              </Routes>
            </>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-light">
        <TokenHandler>
          {/* Wrap AppRoutes with GlobalRefreshHandler */}
          <GlobalRefreshHandler> 
            <AppRoutes />
          </GlobalRefreshHandler>
        </TokenHandler>
      </div>
    </Router>
  );
}

export default App;