# Mini Projet Microservices

Application web avec architecture microservices développée avec Symfony (backend) et React (frontend).

## Structure du projet

```
mini-projet-microservices/
├── backend/
│   ├── service-authentication/         # Microservice Auth (port 8001)
│   ├── service-students/               # Microservice Etudiants (port 8002)
│   ├── service-gestion-emploi-du-temps/# Microservice Emploi du Temps (port 8003)
│   └── service-gestion-profs/          # Microservice Professeurs (port 8004)
├── frontend-app/                       # Interface React (port 5173)
└── nginx/                              # Configuration Nginx
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

Créer quatre bases de données dans MariaDB / phpMyAdmin :
- `db_authentication`
- `db_students`
- `db_emploi`
- `db_profs`

### 2. Service Authentification (Port 8001)

```bash
cd backend/service-authentication
composer install
php bin/console doctrine:migrations:migrate
php -S 127.0.0.1:8001 -t public/
```

### 3. Service Etudiants (Port 8002)

```bash
cd backend/service-students
composer install
php bin/console doctrine:migrations:migrate
php -S 127.0.0.1:8002 -t public/
```

### 4. Service Emploi du Temps (Port 8003)

```bash
cd backend/service-gestion-emploi-du-temps
composer install
php bin/console doctrine:migrations:migrate
php -S 127.0.0.1:8003 -t public/
```

### 5. Service Professeurs (Port 8004)

```bash
cd backend/service-gestion-profs
composer install
php bin/console doctrine:migrations:migrate
php -S 127.0.0.1:8004 -t public/
```

*(Note : Assurez-vous que les clés publiques/privées JWT sont bien présentes dans le dossier `config/jwt` de chaque microservice pour que la vérification des tokens fonctionne correctement).*

### 6. Frontend

```bash
cd frontend-app
npm install
npm run dev
```

### 7. Accès

Ouvrir : http://localhost:5173

**Comptes de test par défaut** :
| Rôle | Email | Mot de passe |
|---|---|---|
| **Admin** | admin@test.com | admin123 |
| **Employé** | employe@test.com | employe123 |

## Fonctionnalités

### Administrateur
- Connexion / Déconnexion avec JWT
- Voir son profil
- Gérer les comptes employés (créer, lister)
- **Étudiants** : CRUD complet (ajouter, modifier, supprimer)
- **Professeurs** : CRUD complet (ajouter, modifier, supprimer)
- **Emploi du temps** : CRUD complet (ajouter, modifier, supprimer) avec vue Tableau & Cartes dynamiques

### Employé
- Connexion / Déconnexion avec JWT
- Voir son profil
- **Étudiants** : (ajouter, modifier)
- **Professeurs** : (ajouter, modifier)
- **Emploi du temps** : (ajouter, modifier)

> ⚠️ *La suppression d'un étudiant, professeur ou cours est strictement réservée à l'Administrateur. L'API retourne une erreur 403 (ou bloque l'interface) si un employé tente cette action.*
