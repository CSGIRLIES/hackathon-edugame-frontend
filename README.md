# CSGIRLIES – Magical Study Companion 🪄 🌍

CSGIRLIES is a **multi-language gamified learning app** where you adopt a **magical baby animal** (winged kitten, mini-dragon, scholarly otter, cosmic penguin...) that grows and learns with you.

🎯 **Available in 5 languages**: English 🇬🇧, French 🇫🇷, Spanish 🇪🇸, German 🇩🇪, Arabic 🇸🇦 (with RTL support)

When you study, focus, and answer quizzes correctly, your companion gains XP, levels up (bébé → adolescent → adulte), and sends you encouraging messages – “Talking Tom”-style but for learning.

---
## 1. Features

### 🌍 Multi-Language Support
- **5 languages supported**: English 🇬🇧, French 🇫🇷, Spanish 🇪🇸, German 🇩🇪, Arabic 🇸🇦
- **Language selector**: Top-right dropdown with flag icons
- **RTL support**: Arabic automatically switches to right-to-left layout
- **Real-time switching**: Instant language changes across entire app
- **Persistent choice**: Language selection saved in localStorage

### Core user journey

- **Authentication / Sign-up**
  - Simple login / sign-up screen.
  - New users are redirected into an onboarding flow.

- **Onboarding**
  - Step 1: Enter your name or nickname.
  - Step 2: Choose your animal companion (cat, dragon, otter, penguin – themed labels like *Chaton ailé*, *Mini-dragon*, …).
  - Step 3: Choose your animal aura color (bleu galaxie, violet magique, orange énergie, vert focus).
  - Step 4: Name your companion.

- **Dashboard**
  - Shows your:
    - Companion (emoji in a glowing orb) with level: **Bébé / Adolescent / Adulte**.
    - XP and level pills.
  - Actions:
    - **Commencer une session d’apprentissage** (Learning session with optional Pomodoro).
    - **Faire un quiz rapide** (AI-generated quiz on the topic you choose).

- **Learning Session Page**
  - You describe what you will study (chapter, topic, or pasted course text).
  - Optional **Pomodoro mode**: 25 min focus → quiz.
  - Timer + progress bar.
  - On completion of a 25 min focus, you automatically:
    - Gain XP (25 XP per completed session).
    - Are redirected to a quiz to verify your understanding.

- **Quiz Page (AI-powered)**
  - You answer: *“Qu’est-ce que tu veux apprendre aujourd’hui ?”* by writing your topic or copying a part of your course.
  - The backend calls **Mistral AI** to generate a short multiple-choice quiz in French.
  - Questions are shown one by one.
  - Each correct answer gives **+20 XP**.
  - Final XP is added to your companion and you’re sent back to the dashboard.

### Companion & XP system

- **Companion evolution**
  - Levels:
    - **Bébé**: 0–19 XP
    - **Adolescent**: 20–59 XP
    - **Adulte**: 60+ XP
  - Visual changes:
    - Orb size & glow intensity increase with levels.
    - Context-aware messages depending on what you’re doing.

- **XP sources**
  - Learning session: +25 XP per completed Pomodoro.
  - Quiz: +20 XP per correct answer.
  - XP directly impacts the level & appearance of your companion.

### Talking companion behavior

The companion sends different messages depending on the context:

- **Dashboard** – motivational, “let’s study today” messages.
- **Learning session** – focus encouragement (“Chut… mode focus activé”).
- **Break** – reminders to stretch, hydrate, move.
- **Quiz** – “don’t panic” encouragement.

Messages rotate automatically every few seconds, so it feels alive and supportive.


---
## 2. Tech Stack & Architecture

### Frontend

- **React + TypeScript** (Create React App style setup).
- **React Router** for navigation between pages.
- **Internationalization (i18next)** for multi-language support.
- Global state for user & companion via `UserContext`.
- Custom CSS theme (dark violet gradient, glassmorphic cards, animated orb).

### Backend

- **Node.js + Express** API in `backend/`.
- **AI integration** via **Mistral** (`open-mistral-7b`) using `MISTRAL_API_KEY`.
- Ready-made agents (not fully wired to UI yet):
  - `DocumentIngestionAgent` – parse PDFs/DOCX, chunk + embed them into a vector store.
  - `QuizGenerationAgent` – generate quizzes from stored chunks.
  - `StudyCoachAgent` – generate personalized Pomodoro study plans.

### High-level architecture

- **Frontend**: SPA React app served on `http://localhost:3000`.
- **Backend**: Express server on `http://localhost:4000`.
- **Quiz flow**:
  - Frontend → `POST /api/quiz/from-text` (topic & desired number of questions).
  - Backend calls Mistral → returns structured questions.
  - Frontend renders quiz, calculates XP, updates UserContext.


---
## 3. Project Structure

```text
hackathon-edugame-frontend/
├── backend/
│   ├── agents/
│   │   ├── DocumentIngestionAgent.js
│   │   ├── QuizGenerationAgent.js
│   │   └── StudyCoachAgent.js
│   ├── data/
│   │   └── vectorstore.json
│   ├── routes/
│   │   ├── quiz.js         # /api/quiz/from-text
│   │   ├── study.js        # (stub/placeholder for study coach routes)
│   │   └── upload.js       # (stub/placeholder for ingestion routes)
│   ├── index.js            # Express server entrypoint
│   ├── package.json
│   └── package-lock.json
├── public/
│   └── index.html
├── src/
│   ├── index.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── contexts/
│   │   └── UserContext.tsx
│   ├── components/
│   │   └── Animal.tsx
│   └── pages/
│       ├── AuthPage.tsx
│       ├── OnboardingPage.tsx
│       ├── DashboardPage.tsx
│       ├── QuizPage.tsx
│       └── LearningPage.tsx
├── .gitignore
├── package.json
└── README.md
```


---
## 4. Prerequisites

- **Node.js**: v18+ recommended (your machine is already using a recent Node).
- **npm**: v8+.
- A **Mistral API key** (for quiz generation): `MISTRAL_API_KEY`.

You do **not** need to install packages one by one. One `npm install` in the frontend and one in the backend will install everything.


---
## 5. Environment configuration (ready-to-use templates)

### Backend `.env`

In `backend/`, create a file called `.env` based on `backend/.env.example`:

```env
# backend/.env
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
MISTRAL_API_KEY=YOUR_MISTRAL_API_KEY_HERE
```

- `PORT` – port for the backend API server.
- `FRONTEND_ORIGIN` – allowed origin for CORS (the React dev server).
- `MISTRAL_API_KEY` – your secret key from Mistral (get one at https://mistral.ai).

### Frontend `.env` (for Supabase authentication)

In the project root, create a file called `.env` based on `.env.example`:

```env
# .env (project root)
REACT_APP_SUPABASE_URL=YOUR_SUPABASE_URL_HERE
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
```

- `REACT_APP_SUPABASE_URL` – your Supabase project URL (e.g. `https://xxxx.supabase.co`).
- `REACT_APP_SUPABASE_ANON_KEY` – your Supabase public/anon key.

**How to get Supabase credentials:**

1. Go to https://supabase.com and create a free account + project.
2. In your Supabase dashboard → **Settings** → **API**:
   - Copy **Project URL** → use it as `REACT_APP_SUPABASE_URL`.
   - Copy **anon public** key → use it as `REACT_APP_SUPABASE_ANON_KEY`.
3. **(Important)** Disable email confirmation for instant signup:
   - Go to **Authentication** → **Providers** → Click on **Email**.
   - Turn **OFF** the "Confirm email" toggle.
   - Save changes.
   - Now users can sign up and log in immediately without email verification (perfect for demos!).

4. **Create the database table for companion profiles**:
   - In your Supabase dashboard → **SQL Editor**.
   - Open the file `supabase_schema.sql` from the project root.
   - Copy and paste the entire SQL script into the SQL Editor.
   - Click **Run** to create the `companion_profiles` table with all necessary policies and triggers.
   - This table stores: user name, companion type/name/color, XP, level, and timestamps.

> Tip: Never commit `.env` files. They're already in `.gitignore`.


---
## 6. How to run the app (step by step)

You only need to install dependencies **once** per folder.

### Step 1 – Clone the repo

```bash
git clone git@github.com:CSGIRLIES/hackathon-edugame-frontend.git
cd hackathon-edugame-frontend
```

### Step 2 – Install frontend dependencies

```bash
npm install
```

This reads `package.json` and installs all needed packages into `node_modules/`. You don’t have to worry about individual libraries.

### Step 3 – Install backend dependencies

```bash
cd backend
npm install
cd ..
```

Same idea: one command, all backend packages are installed.

### Step 4 – Configure backend environment

1. Copy the example file:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Edit `backend/.env` and set your real values:
   ```env
   PORT=4000
   FRONTEND_ORIGIN=http://localhost:3000
   MISTRAL_API_KEY=sk-...  # paste your Mistral API key
   ```
3. Go back to the project root:
   ```bash
   cd ..
   ```

### Step 5 – Start the backend server

In a terminal:

```bash
cd backend
npm start
```

You should see:

```text
[Backend] Server listening on port 4000
```

The quiz API is now available at `http://localhost:4000/api/quiz/from-text`.

### Step 6 – Start the frontend dev server

In another terminal (from the project root):

```bash
npm start
```

This will compile the React app and open it on `http://localhost:3000`.

---
## 7. Using the app – Step-by-step UX

1. **Open the app**
   - Go to `http://localhost:3000`.

2. **Sign Up**
   - On the first screen, choose *Créer un compte* and fill in email & password.
   - With Supabase configured, this creates a real user account.
   - Without Supabase env vars, you'll see an error message (auth won't work).

3. **Onboarding**
   - Step 1: Enter your name/pseudo.
   - Step 2: Choose your animal (e.g. *Chaton ailé*).
   - Step 3: Choose color (e.g. *Violet magique*).
   - Step 4: Name your companion.

4. **Dashboard**
   - See your companion, XP, and level.
   - Use buttons:
     - **Commencer une session d’apprentissage** – to open the Learning page.
     - **Faire un quiz rapide** – to open the Quiz page.

5. **Learning session**
   - Describe what you’ll study (e.g. *Les équations du premier degré*).
   - Keep Pomodoro checked (25 min focus / 5 min break), or disable if needed.
   - Start the session; timer runs.
   - When the timer ends, you get XP and are sent to the quiz.

6. **Quiz with AI**
   - On the **Quiz** page you can also start directly by entering a topic, even without a timer.
   - Click **Générer des questions**:
     - Frontend calls `POST http://localhost:4000/api/quiz/from-text` with your topic.
     - Backend uses Mistral to generate questions.
   - Answer each question – you gain XP for each correct answer.
   - At the end, you’re returned to the dashboard and see your XP/level updated.

7. **Companion behavior**
   - Dashboard: sends motivational messages.
   - Learning: encourages focus while the timer runs.
   - After focus / during breaks: reminds you to move, drink water.
   - Quiz: encourages you not to panic and to think.

---

## 🌍 Using Multi-Language Support

CSGIRLIES supports 5 languages to make learning accessible worldwide:

### **Changing Languages:**
1. **Language selector**: Look for the dropdown in the top-right corner with flag icons
2. **Choose your language**: Click any language (🇬🇧 🇫🇷 🇪🇸 🇩🇪 🇸🇦)
3. **Instant change**: The entire app switches language immediately
4. **Persistent choice**: Your choice is saved and restored when you reopen the app

### **Special Features:**
- **Arabic RTL Layout**: When selecting Arabic 🇸🇦, the entire app switches to right-to-left layout
- **Complete Translation**: Every button, message, and feature is translated
- **Context-aware Content**: Animal names and messages adapt to the selected language

### **Supported Languages:**
- **English 🇬🇧**: Default language
- **French 🇫🇷**: Complete translation (including regional expressions)
- **Spanish 🇪🇸**: Academic and educational terminology
- **German 🇩🇪**: Formal educational language
- **Arabic 🇸🇦**: RTL layout with Arabic educational terms

### **Adding More Languages:**
The i18n system is easily extensible. To add a new language:
1. Create `src/i18n/locales/[lang].json` following the existing structure
2. Add the language to `src/i18n/config.ts`
3. Add the flag to `LanguageSelector.tsx`

**All translations are professionally localized for educational contexts!**


---
## 8. Notes & Next Steps

### Current state

- Authentication uses **Supabase** (real user accounts with email/password).
- **Companion profiles are persisted** to Supabase database:
  - Name, animal type, animal name, color, XP, and level are saved.
  - XP updates automatically sync to the database in real-time.
  - Profiles persist across sessions – log out and back in to keep your progress!
- Document upload and study plan generation are wired to the UI but require uploaded material to work.
- AI quiz generation works with any topic (powered by Mistral).

### Future extensions

- Add routes/UI for:
  - Uploading PDFs / DOCX and indexing them via `DocumentIngestionAgent`.
  - Generating quiz questions from stored documents (`QuizGenerationAgent`).
  - Generating full Pomodoro-based study plans using `StudyCoachAgent`.
- Add streaks, parental view, and a small social component (friend visits, soft leaderboard).

If you want, we can next:
- Wire document upload + study plan generation to the UI.
- Add a root-level script (e.g. with `concurrently`) to run frontend and backend with a single command like `npm run dev`.
