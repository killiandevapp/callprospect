import axios, { AxiosError } from "axios";

// Instance Axios configurée pour l'API
export const api = axios.create({
  baseURL: "http://localhost:4000/api",     // URL de base de l'API
  withCredentials: true,                    // Envoie les cookies automatiquement
});

// Récupère le token CSRF depuis le  navigateur
function getCsrfTokenFromCookie(): string | null {
  const m = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

// Stocke le token JWT globalement
let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}

// INTERCEPTEUR REQUEST : Modifie CHAQUE requête AVANT envoi
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Ajoute le token JWT si disponible
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Ajoute le token CSRF pour les méthodes modifiant les données
  const method = (config.method || "get").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    const csrf = getCsrfTokenFromCookie();
    if (csrf) {
      config.headers = config.headers ?? {};
      config.headers["X-CSRF-Token"] = csrf;
    }
  }

  return config;
});

// INTERCEPTEUR RESPONSE : Gère les erreurs 401 (token expiré)
let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res, // Réponse OK → retourne normalement
  async (err: AxiosError) => {
    
   // Récupère la config de la requete originale qui a échoué
    const original = err.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!original) return Promise.reject(err);

    const url = original.url || "";
    const status = err.response?.status;

    // Ignore les routes d'auth (login/register ne se rafraichissent pas)
    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    // Si 401 + pas déjà retry + pas route auth → rafraîchit le token
    if (status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;

      try {
        // Évite les refresh multiples simultanés
        if (!refreshPromise) {
          refreshPromise = api
            .post<{ accessToken: string }>("/auth/refresh")
            .then((r) => r.data.accessToken)
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        setAccessToken(newToken);
        return api(original); // Refait la requête originale
      } catch (e) {
        setAccessToken(null); // Déconnexion si refresh échoue
        return Promise.reject(e);
      }
    }

    return Promise.reject(err);
  }
);
