import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';

import UserProvider, { UserContext } from './context/UserContext';
import Login from "./pages/Auth/Login";
import SgnUp from "./pages/Auth/SgnUp";
import LandingPage from "./pages/interviewPrep/LandingPage";
import Dashboard from "./pages/Home/Dashboard";
import InterviewPrep from "./pages/Component/interviewPrep";
import Practice from "./pages/Practice/Practice";  // ← add this

// Private route protection
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-slate-500">Loading...</p>
    </div>
  );

  return user ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SgnUp />} />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/interviewprep/:sessionId"
            element={
              <PrivateRoute>
                <InterviewPrep />
              </PrivateRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <PrivateRoute>
                <Practice />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>

      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </UserProvider>
  );
};

export default App;