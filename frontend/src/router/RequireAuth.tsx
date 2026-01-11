import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// Protege les pages nécessitant une authentification
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { ready, isAuth } = useAuth();

  // Affiche un chargement tant que l'état n’est pas prêt
  if (!ready) return <div>Chargement...</div>;
  if (!isAuth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
