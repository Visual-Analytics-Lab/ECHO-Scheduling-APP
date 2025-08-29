import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/authorization/PrivateRoute";
import { Dashboard } from "./components/dashboard/Dashboard";
import { NotFound } from "./components/page_not_found/PageNotFound";
import Admin from "./components/admin/Admin";
import CalendarPage from "./components/calendar/CalendarPage";
import { Landing } from "./components/landing/LandingPage";
import Navbar from "./components/navbar/Navbar";
import { MySessions } from "./components/my_sessions/MySessions";
import ResetPasswordPage from "./components/authorization/ResetPasswordPage"; // Add this import
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const App = () => (
  <>
    <AuthProvider>
      <BrowserRouter>
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> {/* Add this route */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={["admin", "Admin"]}>
                  <Admin />
                </PrivateRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <PrivateRoute>
                  <CalendarPage allowedRoles={["admin", "Admin"]}/>
                </PrivateRoute>
              }
            />
            <Route
              path="/mysessions"
              element={
                <PrivateRoute>
                  <MySessions />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
    
    <ToastContainer position="top-right" autoClose={3000} />
  </>
);