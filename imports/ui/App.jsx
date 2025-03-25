import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/sign_in/PrivateRoute";

import { Dashboard } from "./components/dashboard/Dashboard";
import { NotFound } from "./components/page_not_found/PageNotFound";
import Admin from "./components/admin/Admin";
import Calendar from "./components/calendar/Calendar";



export const App = () => (
    <AuthProvider>
        <BrowserRouter>
          <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
              <Route 
                  path="/admin" 
                  element={
                      <PrivateRoute>
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
        </BrowserRouter>
    </AuthProvider>
);
