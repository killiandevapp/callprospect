# Backend – Authentification

Ce backend fournit une API REST utilisée par le frontend CallProspect.
Il gère l’authentification, la sécurité et la logique métier liée à la prospection téléphonique.

Le but est d’avoir une implémentation réaliste, lisible et maintenable,
sans sur-ingénierie inutile.

---

## Stack technique

- Node.js
- Express
- TypeScript
- MySQL
- JWT (access / refresh)
- bcrypt
- zod
- Jest

---

## Fonctionnalités

- Inscription utilisateur (email / mot de passe)
- Connexion sécurisée
- Access token JWT à durée de vie courte
- Refresh token stocké en cookie httpOnly
- Rafraîchissement automatique de session
- Déconnexion avec révocation du refresh token
- Protection contre le brute-force
- Protection CSRF sur les routes sensibles
- Journalisation des tentatives de connexion

---

## Fonctionnement général

1. Lors de la connexion, un access token est renvoyé au client.
2. Un refresh token est stocké en cookie httpOnly.
3. À l’expiration de l’access token, le client demande un refresh.
4. Le serveur valide le refresh token et renvoie un nouvel access token.
5. Lors de la déconnexion, le refresh token est invalidé.

---

## Sécurité

- Les mots de passe sont hashés avec bcrypt.
- Les refresh tokens ne sont jamais stockés en clair en base.
- Les cookies sensibles utilisent `httpOnly` et `sameSite`.
- Les tentatives de connexion abusives sont limitées.
- Chaque requête vérifie la propriété des ressources (user ↔ données).

---

## Configuration

Un fichier `.env` est requis (non versionné) pour :
- les secrets JWT
- la configuration de la base de données
- les options liées aux cookies

Sans ces variables, l’application ne démarre pas volontairement.
