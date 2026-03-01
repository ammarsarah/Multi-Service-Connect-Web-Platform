<div align="center">

# 🔧 Multi-Service Connect

### La plateforme de mise en relation entre clients et prestataires de services

![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payment-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

</div>

---

## 📖 Description

**Multi-Service Connect** est une plateforme web complète et sécurisée qui met en relation des **clients** avec des **prestataires de services** (plombiers, électriciens, jardiniers, etc.). La plateforme intègre un système de paiement sécurisé via Stripe, une messagerie en temps réel, et des fonctionnalités d'intelligence artificielle pour des recommandations personnalisées et la détection de fraude.

---

## ✨ Fonctionnalités Principales

### 👥 Gestion des Utilisateurs
- Inscription / connexion sécurisée avec JWT (access + refresh tokens)
- Vérification par e-mail
- Réinitialisation du mot de passe
- Trois rôles : **client**, **prestataire**, **admin**
- Profils prestataires avec validation manuelle par un admin

### 🛠️ Services & Demandes
- Publication et gestion de services (tarif fixe / horaire / devis)
- Recherche avancée avec filtres (catégorie, localisation, prix, note)
- Système de demandes avec workflow complet : `pending → accepted → in_progress → completed`
- Planification de rendez-vous

### 💳 Paiements Sécurisés (Stripe)
- Création d'intentions de paiement
- Confirmation et capture de paiement
- Gestion des remboursements
- Commission plateforme configurable (défaut 10%)
- Tableau de bord des revenus pour les prestataires
- Webhooks Stripe sécurisés

### ⭐ Avis & Évaluations
- Système de notation (1–5 étoiles)
- Commentaires vérifiés (liés aux demandes complétées)
- Mise à jour automatique des statistiques prestataires

### 🤖 Intelligence Artificielle (OpenAI GPT-4)
- Recommandations personnalisées de services
- Matching intelligent client–prestataire
- Assistant chatbot intégré
- Rapport de détection de fraude

### 🔔 Notifications
- Notifications en temps réel (in-app)
- E-mails transactionnels (nodemailer)
- Centre de notifications avec marquage lu/non-lu

### 🛡️ Sécurité & Anti-Fraude
- Détection automatique de comportements suspects
- Score de risque par utilisateur
- Interface admin de revue des signalements
- Rate limiting sur toutes les routes sensibles
- Helmet, CORS, validation des entrées (Joi)

### 📊 Dashboard Administrateur
- Vue globale : revenus, utilisateurs, transactions
- Validation des prestataires
- Gestion des bannissements
- Consultation des logs de fraude

---

## 🏗️ Stack Technologique

| Couche       | Technologie                   | Version |
|--------------|-------------------------------|---------|
| Runtime      | Node.js                       | 20 LTS  |
| Framework    | Express.js                    | 4.x     |
| Frontend     | React + Vite                  | 18 / 5  |
| Base de données | PostgreSQL                 | 15      |
| ORM/Query    | node-postgres (pg)            | 8.x     |
| Auth         | JWT (jsonwebtoken)            | 9.x     |
| Paiement     | Stripe                        | 14.x    |
| IA           | OpenAI API (GPT-4)            | 4.x     |
| E-mail       | Nodemailer                    | 6.x     |
| Validation   | Joi                           | 17.x    |
| Sécurité     | Helmet, bcrypt, express-rate-limit | –  |
| Reverse Proxy | Nginx                        | Alpine  |
| Conteneurisation | Docker + Docker Compose   | –       |
| Styling      | Tailwind CSS                  | 3.x     |

---

## 🏛️ Architecture

```
                          ┌─────────────────────────────────────┐
                          │            Internet / Client         │
                          └──────────────────┬──────────────────┘
                                             │ :80 / :443
                          ┌──────────────────▼──────────────────┐
                          │           Nginx (Reverse Proxy)      │
                          │   /api/* → backend   / → frontend   │
                          └──────────┬──────────────────┬───────┘
                                     │                  │
               ┌─────────────────────▼───┐   ┌──────────▼───────────────┐
               │  Backend (Node/Express)  │   │  Frontend (React/Vite)   │
               │  :5000                   │   │  Nginx static :80        │
               │  ┌─────────────────────┐ │   └──────────────────────────┘
               │  │  REST API Routes    │ │
               │  │  JWT Middleware      │ │
               │  │  Stripe Integration  │ │
               │  │  OpenAI Integration  │ │
               │  └──────────┬──────────┘ │
               └─────────────┼────────────┘
                             │
               ┌─────────────▼────────────┐
               │  PostgreSQL 15            │
               │  (UUID, JSONB, Arrays)    │
               └──────────────────────────┘
```

---

## 🚀 Démarrage Rapide

### Prérequis

- [Docker](https://docs.docker.com/get-docker/) ≥ 24.x et [Docker Compose](https://docs.docker.com/compose/) ≥ 2.x
- Compte [Stripe](https://stripe.com) (clés API)
- Compte [OpenAI](https://platform.openai.com) (clé API)
- Serveur SMTP (e.g. Gmail, Mailgun, SendGrid)

### 1. Cloner le dépôt

```bash
git clone https://github.com/your-org/Multi-Service-Connect-Web-Platform.git
cd Multi-Service-Connect-Web-Platform
```

### 2. Configurer l'environnement

```bash
cp .env.example .env
# Éditer .env avec vos propres valeurs
```

### 3. Lancer avec Docker

```bash
docker compose up -d --build
```

La plateforme sera disponible sur **http://localhost**.

---

## ⚙️ Configuration des Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
# ── Base de données ──────────────────────────────
POSTGRES_DB=multiservice_db
POSTGRES_USER=msc_user
POSTGRES_PASSWORD=your_strong_password
POSTGRES_PORT=5432

# ── JWT ──────────────────────────────────────────
JWT_SECRET=your_very_long_random_jwt_secret
JWT_REFRESH_SECRET=your_very_long_random_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Stripe ───────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# ── OpenAI ───────────────────────────────────────
OPENAI_API_KEY=sk-...

# ── E-mail ───────────────────────────────────────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@multiservice.com

# ── Application ──────────────────────────────────
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost/api
PLATFORM_COMMISSION_RATE=0.10
NODE_ENV=production
```

---

## 🗄️ Configuration de la Base de Données

Le schéma et les données de seed sont automatiquement appliqués au premier démarrage de Docker.

**Manuellement :**

```bash
# Connexion à la base
psql -h localhost -U msc_user -d multiservice_db

# Appliquer le schéma
\i database/schema.sql

# Insérer les données de test
\i database/seed.sql
```

**Comptes de seed disponibles :**

| Rôle        | Email                          | Mot de passe   |
|-------------|--------------------------------|----------------|
| Admin       | admin@multiservice.com         | Admin@123456   |
| Prestataire | jean.dupont@provider.com       | Provider@123   |
| Prestataire | marie.martin@provider.com      | Provider@123   |
| Client      | sophie.leroy@client.com        | Client@123     |

---

## 🐳 Docker - Mode Détaillé

```bash
# Démarrer tous les services
docker compose up -d

# Voir les logs en temps réel
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend

# Arrêter les services
docker compose down

# Arrêter + supprimer les volumes (reset complet)
docker compose down -v

# Rebuild sans cache
docker compose build --no-cache && docker compose up -d
```

---

## 💻 Mode Développement Local

### Backend

```bash
cd backend
npm install
cp .env.example .env   # configurer les variables
npm run dev            # démarre avec nodemon sur :5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # configurer VITE_API_URL, VITE_STRIPE_PUBLISHABLE_KEY
npm run dev            # démarre Vite sur :5173
```

---

## 📚 Documentation API

La documentation complète de l'API est disponible dans [`docs/API.md`](docs/API.md).

### Aperçu des endpoints

| Groupe        | Préfixe                 | Description                          |
|---------------|-------------------------|--------------------------------------|
| Auth          | `POST /auth/register`   | Inscription, login, tokens           |
| Utilisateurs  | `GET /users`            | Profils, gestion admin               |
| Services      | `GET /services`         | CRUD services + recherche            |
| Demandes      | `POST /requests`        | Workflow client–prestataire          |
| Paiements     | `POST /payments/*`      | Stripe integration + webhooks        |
| Avis          | `GET /reviews/*`        | Notation et commentaires             |
| Catégories    | `GET /categories`       | CRUD catégories (admin)              |
| Notifications | `GET /notifications`    | Centre de notifications              |
| Admin         | `GET /admin/dashboard`  | Tableau de bord administrateur       |
| IA            | `GET /ai/recommendations` | Recommandations et chatbot IA      |

---

## 🤖 Fonctionnalités IA

### Recommandations Personnalisées
L'IA analyse l'historique des demandes du client et ses préférences pour suggérer les services les plus pertinents.

### Matching Intelligent
Pour un service donné, l'IA évalue la compatibilité client–prestataire en tenant compte des compétences, de la localisation et des avis.

### Chatbot Assistant
Un assistant conversationnel basé sur GPT-4 guide les utilisateurs dans leur navigation et répond à leurs questions.

### Détection de Fraude
Analyse comportementale automatique avec scoring de risque, alertes admin et logs détaillés.

---

## 🚢 Déploiement en Production

Le guide complet de déploiement est disponible dans [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

**Étapes clés :**
1. Configurer un VPS (Ubuntu 22.04 recommandé)
2. Installer Docker et Docker Compose
3. Configurer les variables d'environnement de production
4. Configurer SSL avec Let's Encrypt (Certbot)
5. Lancer `docker compose -f docker-compose.yml up -d`
6. Configurer les sauvegardes automatiques de la base de données

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. **Fork** le projet
2. Créez votre branche : `git checkout -b feature/ma-fonctionnalite`
3. Committez vos changements : `git commit -m 'feat: ajouter ma fonctionnalité'`
4. Pushez : `git push origin feature/ma-fonctionnalite`
5. Ouvrez une **Pull Request**

### Conventions de commit

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` documentation uniquement
- `chore:` maintenance, dépendances
- `test:` ajout ou modification de tests

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">
  Made with ❤️ — Multi-Service Connect Team
</div>
