# Frontend – Authentification

Ce frontend est une application React qui consomme l’API backend de CallProspect.
Il gère l’authentification utilisateur, la navigation et la protection des routes.

L’objectif est de fournir une interface simple, sécurisée et cohérente avec la logique backend.

---

## Stack technique

- React
- TypeScript
- Vite
- React Router DOM
- Axios
- Tailwind CSS

---

## Fonctionnalités

- Formulaire de connexion
- Gestion de l’état d’authentification via Context
- Routes protégées
- Appels API sécurisés via Axios
- Refresh automatique de session lorsque l’access token expire

---

## Fonctionnement

- L’access token est conservé uniquement en mémoire.
- Les cookies (refresh token + CSRF) sont gérés automatiquement par le navigateur.
- Les routes sensibles sont protégées côté frontend et backend.
- Toute la logique de sécurité critique est centralisée côté backend.

---

## Structure simplifiée

- `src/auth/` : gestion de l’authentification
- `src/api/` : configuration Axios et interceptors
- `src/router/` : protection et gestion des routes
- `src/pages/` : pages (login, pages protégées)
- `src/components/` : composants UI réutilisables

---

## Remarque

Le frontend ne stocke jamais de données sensibles (tokens, secrets).
Il se contente de consommer l’API et d’appliquer les règles définies côté backend.
