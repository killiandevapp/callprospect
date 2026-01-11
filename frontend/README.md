# Frontend – Authentification

Ce frontend est une application React qui consomme l’API d’authentification.
Il gère le login utilisateur et la protection des routes.


## Stack technique

- React
- TypeScript
- Vite
- react router dom
- axios



## Fonctionnalités

- Formulaire de connexion
- Gestion de l’état d’authentification via context
- Routes protégées
- Appels API sécurisés via axios
- Refresh automatique de session en cas d’expiration du token

## Fonctionnement

- L’access token est conservé uniquement en mémoire.
- Les cookies (refresh + CSRF) sont gérés automatiquement par le navigateur.
- Les routes sensibles sont protégées coté frontend et backend.

## Structure simplifiée

- `src/auth/` : gestion de l’authentification
- `src/api/` : configuration axios
- `src/router/` : protection des routes
- `src/pages/` : pages login et page protégée


## Remarque

Le frontend ne stocke jamais les tokens sensibles dans le localStorage.
La sécurité est volontairement gérée coté backend.


