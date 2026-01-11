import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AppHome from "./pages/AppHome";
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
            <AppHome />
          </RequireAuth>
        }
      />

      {/* Redirection de toutes les routes inconnues ver la page de login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
