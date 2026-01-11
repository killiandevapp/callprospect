import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAccessToken } from "../api/axios";

type LoginBody = { email: string; password: string };

type User = {
  id: number;
  email: string;
};

type AuthContextValue = {
  ready: boolean;          // true quand on a fini la vérif initiale
  isAuth: boolean;
  user: User | null;
  login: (body: LoginBody) => Promise<void>;
  logout: () => Promise<void>;
};
// Crée le "conteneur" d'authentification pour toute l'app
// null = valeur par défaut si aucun Provider n'est trouvé
const AuthCtx = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Bootstrap au chargement : si refresh cookie valide, /me passera
useEffect(() => {
  if (import.meta.env.MODE === "test") {
    setReady(true);
    return;
  }

  (async () => {
    try {
      const r = await api.get<{ user: User }>("/me");
      setUser(r.data.user);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  })();
}, []);

  const login = async ({ email, password }: LoginBody) => {
    const r = await api.post<{ accessToken: string; user?: User }>("/auth/login", { email, password });
    setAccessToken(r.data.accessToken);
    // si ton backend renvoie user, on le garde, sinon on refait /me
    if (r.data.user) setUser(r.data.user);
    else {
      const me = await api.get<{ user: User }>("/me");
      setUser(me.data.user);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };
  // Crée un objet "value" avec toutes les infos d'auth à partager
  // useMemo = "optimisation" (évite de recréer l'objet à chaque rendu)
  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      isAuth: !!user,
      user,
      login,
      logout,
    }),
    [ready, user]
  );

  // Fournit le contexte d'authentification à toute l'app
  return (
    <AuthCtx.Provider value={value}>
      {children}
    </AuthCtx.Provider>
  );

}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
