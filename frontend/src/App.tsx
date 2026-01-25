import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AppHome from "./pages/appHome";
import HistoryHome from "./pages/HistoryHome";
import StatsPage from "./component/StatsPage";
import Header from "./component/header";
import MeetingPage from "./pages/MeetingPage";

import RequireAuth from "./router/RequireAuth";

// Composant principal de l'application gérant la navigation entre les pages.
// On utilise React Router pour définir les différentes routes de l'application.
export default function App() {
  return (
    <Routes>
      {/* Par défaut, redirection vers la page de login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Page de connexion accessible sans authentification */}
      <Route path="/login" element={<Login />} />

      {/* Page principale protégé */}
      <Route
        path="/app"
        element={
          <RequireAuth>
            <Header />
            <AppHome />
          </RequireAuth>
        }
      />

      <Route
        path="/history"
        element={
          <RequireAuth>
            <Header />
            <HistoryHome />
          </RequireAuth>
        }
      />
      <Route
        path="/stats"
        element={
          <RequireAuth>
            <Header />
            <StatsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/meeting"
        element={
          <RequireAuth>
            <Header />
            <MeetingPage />
          </RequireAuth>
        }
      />

      {/* Redirection de toutes les routes inconnues ver la page de login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
