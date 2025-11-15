# Getting Started

Cette section explique comment cloner le projet, configurer les variables d’environnement et lancer **CSGIRLIES** en local avec le frontend + backend.

---
## 1. Prérequis

- **Node.js** ≥ 18
- **npm** ≥ 8
- Un compte **Mistral** (clé API) pour la génération de quiz
- (Optionnel) Un projet **Supabase** si tu veux persister les profils et l’XP

---
## 2. Installation du projet

```bash
# Cloner le repo
git clone <URL_DU_REPO>
cd hackathon-edugame-frontend

# Installer les dépendances frontend
npm install

# Installer les dépendances backend
cd backend
npm install
cd ..
```

---
## 3. Configuration des variables d’environnement

### 3.1 Backend (`backend/.env`)

Dans le dossier `backend/` :

```bash
cp .env.example .env
```

Puis édite `backend/.env` :

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
MISTRAL_API_KEY=TA_CLE_MISTRAL_ICI
WOLFRAM_APPID=TON_APPID_WOLFRAM_ICI
```

- `MISTRAL_API_KEY` : clé depuis https://mistral.ai
- `WOLFRAM_APPID` : APPID Wolfram Alpha (https://developer.wolframalpha.com/)

### 3.2 Frontend (`.env` à la racine)

À la racine du projet :

```bash
cp .env.example .env
```

Puis édite `.env` :

```env
REACT_APP_SUPABASE_URL=TON_URL_SUPABASE
REACT_APP_SUPABASE_ANON_KEY=TA_CLE_ANON_SUPABASE
```

Ces variables sont uniquement nécessaires si tu veux la persistance via Supabase. Sans elles, l’app peut quand même tourner mais l’auth/XP ne seront pas persistés.

---
## 4. Lancer le projet en développement

### 4.1 Tout en une commande (recommandé)

Depuis la racine `hackathon-edugame-frontend` :

```bash
npm run dev
```

Ce script :
- lance le backend Express sur `http://localhost:4000`,
- lance le frontend React sur `http://localhost:3000`.

### 4.2 Frontend et backend séparés (optionnel)

```bash
# Terminal 1 – backend
cd backend
npm start

# Terminal 2 – frontend
cd ..
npm start
```

---
## 5. Accéder à l’application

- Ouvre ton navigateur sur : `http://localhost:3000`
- Tu verras la page d’authentification (Supabase) puis le flux d’onboarding (choix du compagnon).
- Le backend expose notamment :
  - `GET http://localhost:4000/api/health` → vérifie que le backend tourne.
  - `POST http://localhost:4000/api/quiz/from-text` → génération de quiz par Mistral.
  - `POST http://localhost:4000/api/wolfram/query` → requêtes directes Wolfram Alpha.
  - `POST http://localhost:4000/api/wolfram/assist` → génération automatique de requêtes Wolfram à partir de descriptions en français.

---
## 6. Structure de la doc GitBook

Dans le dossier `docs/` tu trouveras :

- `SUMMARY.md` : sommaire GitBook
- `intro.md` : introduction générale
- `getting-started.md` : ce fichier
- `architecture.md` : vue d’ensemble front/back
- `frontend.md` : pages, composants, contexte utilisateur
- `backend.md` : routes, agents, intégrations Mistral & Wolfram
- `quizzes.md` : logique de quiz et XP
- `wolfram-companion.md` : Compagnon prof (Wolfram)
- `i18n.md` : multi-langues et i18next
- `data.md` : Supabase, profils, XP, vector store
- `roadmap.md` : idées et futures évolutions

Tu peux pousser ce dossier `docs/` sur un GitBook (ou autre générateur de doc) pour publier la documentation de CSGIRLIES.
