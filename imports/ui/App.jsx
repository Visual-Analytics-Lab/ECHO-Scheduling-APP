import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/sign_in/PrivateRoute";
import { Dashboard } from "./components/dashboard/Dashboard";
import { NotFound } from "./components/page_not_found/PageNotFound";
import Admin from "./components/admin/Admin";
import Calendar from "./components/calendar/Calendar";
import { Landing } from "./components/landing/LandingPage";





export const App = () => (
    <AuthProvider>
        <BrowserRouter>
            <div>
                <Routes>
                    <Route path="/" element={<Landing />} />
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
                            <PrivateRoute allowedRoles={["admin"]}>
                                <Admin />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/calendar" 
                        element={
                            <PrivateRoute>
                                <Calendar />
                            </PrivateRoute>
                        } 
                    />
                </Routes>
            </div>
        </BrowserRouter>
    </AuthProvider>
);
