import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Dashboard } from "./components/dashboard/Dashboard";
import Admin from "./components/admin/Admin";
import { NotFound } from "./components/page_not_found/PageNotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/sign_in/PrivateRoute";

export const App = () => (
    <AuthProvider>
        <BrowserRouter>
            <div>
                <nav>
                    <Link to="/"></Link>
                </nav>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="*" element={<NotFound />} />
                    <Route 
                        path="/protected" 
                        element={
                            <PrivateRoute>
                            </PrivateRoute>
                        } 
                        />
                </Routes>
            </div>
        </BrowserRouter>
    </AuthProvider>
);