# Mini-Projet Microservices : Gestion des Étudiants

Ce projet est une application basée sur une architecture de microservices, construite avec **Symfony** pour le backend et **React** pour le frontend.

## Architecture

Le projet est divisé en plusieurs dossiers, suivant le modèle d'un Monorepo :

- **`backend/`** : Contient les microservices de l'application.
  - `service-authentication/` (Port 8001) : Gère l'authentification des utilisateurs (login, register, JWT).
  - `service-students/` (Port 8002) : Gère le CRUD des étudiants (liste, ajout, modification, suppression).
- **`frontend-app/`** : Application web développée en React.js (Vite) avec un dashboard pour interagir avec les microservices.
- **`nginx/`** : Configuration pour le reverse proxy Nginx (permettant de router les requêtes du frontend vers les différents microservices).

## Technologies Utilisées

- **Backend** : PHP 8.x, Symfony 7.4, NelmioCorsBundle
- **Frontend** : React 19, Vite
- **Serveur Web** : Nginx
- **Base de données** : (À venir) MySQL / PostgreSQL

## Démarrage Rapide (Développement Local)

1. Démarrer le Service Authentification :
   ```bash
   cd backend/service-authentication
   symfony local:server:start --port=8001
   ```

2. Démarrer le Service Étudiants :
   ```bash
   cd backend/service-students
   symfony local:server:start --port=8002
   ```

3. Démarrer le Frontend React :
   ```bash
   cd frontend-app
   npm run dev
   ```

4. Accéder au dashboard sur : `http://localhost:5173`
