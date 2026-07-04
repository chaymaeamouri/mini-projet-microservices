# Mini Projet Microservices

Application web avec architecture microservices développée avec Symfony (backend) et React (frontend).

## Structure du projet

```
mini-projet-microservices/
├── backend/
│   ├── service-authentication/   # Microservice Auth (port 8001)
│   └── service-students/         # Microservice Etudiants (port 8002)
├── frontend-app/                 # Interface React (port 5173)
└── nginx/                        # Configuration Nginx
```

## Technologies utilisées

- **Backend** : PHP 8.2, Symfony 7.4, Doctrine ORM, LexikJWT
- **Frontend** : React 18, Vite, Axios, React Router
- **Base de données** : MariaDB
- **Authentification** : JSON Web Token (JWT)

## Prérequis

- PHP 8.2+
- Composer
- Node.js + npm
- MariaDB

## Installation et démarrage

### 1. Base de données

Créer deux bases de données :
- `db_authentication`
- `db_students`

### 2. Service Authentification

```bash
cd backend/service-authentication
composer install
php bin/console doctrine:migrations:migrate
php -S 127.0.0.1:8001 -t public/
```

### 3. Service Etudiants

```bash
cd backend/service-students
composer install
php -S 127.0.0.1:8002 -t public/
```

### 4. Frontend

```bash
cd frontend-app
npm install
npm run dev
```

### 5. Accès

Ouvrir : **http://localhost:5173**

## Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@test.com | admin123 |
| Employé | employe@test.com | employe123 |

## Fonctionnalités

### Administrateur
- Connexion / Déconnexion
- Voir son profil
- Gérer les comptes employés (créer, lister)
- Gérer les étudiants (ajouter, modifier, supprimer)

### Employé
- Connexion / Déconnexion
- Voir son profil
- Gérer les étudiants (ajouter, modifier)

> La suppression d'un étudiant est réservée à l'Administrateur. L'API retourne une erreur 403 si un employé tente cette action.
