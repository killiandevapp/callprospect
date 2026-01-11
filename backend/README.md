# Backend – Authentification

Ce backend fournit une API d’authentification utilisée par le frontend.
Il gère la création de compte, la connexion, le maintien de session et la sécurité associée.

Le but est d’avoir une implémentation réaliste, sans sur-ingénierie.

## Stack technique

- Node.js
- Express
- TypeScript
- MySQL
- JWT
- bcrypt
- zod

## Fonctionnalités

- Inscription utilisateur (email / mot de passe)
- Connexion sécurisée
- Access token JWT (durée courte)
- Refresh token stocké en cookie httpOnly
- Refresh de session
- Déconnexion
- Protection brute-force (rate limit + verrouillage temporaire)
- Protection CSRF pour les requêtes sensibles
- Journalisation des tentatives de connexion

## Fonctionnement général

1. Lors de la connexion, un access token est renvoyé au client.
2. Un refresh token est stocké en cookie httpOnly côté serveur.
3. Lorsque l’access token expire, le client demande un refresh.
4. Le serveur valide le refresh token, puis renvoie un nouvel access token.
5. En cas de déconnexion, le refresh token est révoqué.

## Sécurité

- Les mots de passe sont hashés avec bcrypt.
- Les refresh tokens ne sont jamais stockés en clair en base.
- Les cookies sensibles sont protégés (`httpOnly`, `sameSite`).
- Les attaques par brute-force sont limitées.

## Configuration

Un fichier `.env` est requis (non versionné) pour :
- les secrets JWT
- la configuration de la base de données
- les options de cookies

Sans ces variables, l’application ne démarre pas volontairement.

