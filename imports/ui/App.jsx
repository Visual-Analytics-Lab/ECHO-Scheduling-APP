import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Dashboard } from "./components/dashboard/Dashboard";
import { NotFound } from "./components/page_not_found/PageNotFound";

export const App = () => (
    <BrowserRouter>
        <div>
            <nav>
                <Link to="/"></Link>
            </nav>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    </BrowserRouter>
);