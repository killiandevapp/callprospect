[![CI](https://github.com/killiandevapp/callprospect/actions/workflows/ci.yml/badge.svg)](https://github.com/killiandevapp/callprospect/actions/workflows/ci.yml)



# CallProspect

CallProspect est une application de prospection téléphonique conçue pour remplacer
les fichiers Excel, notes papier et outils bricolés par une solution simple,
structurée et orientée usage réel.

L’application permet de gérer des campagnes, des prospects, d’enregistrer les appels
et d’exploiter un historique clair avec des statistiques basiques.

Projet volontairement pragmatique : pas de sur-ingénierie, mais une architecture propre
et sécurisée, proche de la réalité terrain .

---

## Fonctionnalités

- Authentification sécurisée (email / mot de passe)
- Gestion de campagnes de prospection
- Gestion des prospects
- Enregistrement des appels (résultat, durée, RDV, refus)
- Motifs de refus personnalisés par campagne
- Historique des appels
- Statistiques simples par campagne
- Sécurité (JWT, cookies httpOnly, CSRF)
- Tests & CI

---

## Architecture

/callprospect
├── backend/ API Node.js + Express
├── frontend/ Application React
└── README.md (ce fichier)


## Stack technique

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios

### Backend
- Node.js
- Express
- TypeScript
- MySQL
- JWT (access + refresh)
- bcrypt
- zod

### Base de données (principales tables)
- users
- refresh_tokens
- login_attempts
- campaigns
- refusal_reasons
- prospects
- call_logs
- meetings

---

## Philosophie du projet

- Sécurité gérée côté backend
- Tokens sensibles jamais stockés en localStorage
- Logique métier simple et explicite
- Code lisible avant d’être abstrait
- Pensé pour évoluer (CSV, stats avancées, etc.)