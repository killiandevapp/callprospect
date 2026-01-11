# CallProspect

CallProspect est une petite application de prospection téléphonique permettant de gérer des campagnes, des prospects, et d’enregistrer les résultats des appels.

L’objectif est de remplacer l’usage de feuilles, de tableurs ou de notes personnelles par un outil simple et structuré.

---

## Fonctionnalités principales

- Authentification (email + mot de passe)
- Gestion des campagnes de prospection
- Ajout de prospects (manuel, CSV à venir)
- Enregistrement des résultats d’appel
- Gestion des motifs de refus (propres à chaque campagne)
- Historique des appels
- Statistiques simples par campagne

---

## Aperçu technique

Frontend :
- React + TypeScript
- Routage + pages protégées
- State simple

Backend :
- Node.js + Express
- API REST
- MySQL
- JWT (access + refresh)
- Cookies HttpOnly
- Vérifications de sécurité classiques

Base de données :
- users
- refresh_tokens
- login_attempts
- campaigns
- refusal_reasons
- prospects
- call_logs


