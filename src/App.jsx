import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import TournamentPage from "./pages/TournamentPage";
import DivisionPage from "./pages/DivisionPage";
import AdminLogin from "./pages/AdminLogin";
import AdminPage from "./pages/AdminPage";
import AdminTournamentDetail from "./pages/AdminTournamentDetail";
import RegisterPage from "./pages/RegisterPage"; // ✅ NEW

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route path="t/:tournamentId" element={<TournamentPage />} />
        <Route path="t/:tournamentId/register" element={<RegisterPage />} /> {/* ✅ NEW */}
        <Route path="t/:tournamentId/:divisionId" element={<DivisionPage />} />

        {/* Admin routes */}
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={<AdminPage />} />
        <Route
          path="admin/tournament/:tournamentId"
          element={<AdminTournamentDetail />}
        />
      </Route>
    </Routes>
  );
}