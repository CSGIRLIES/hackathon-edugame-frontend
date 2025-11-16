# What we are about

**By PawPatrol**

PawFriend is a **multi-language gamified learning app** where you adopt a **magical companion animal** (fox, puppy) that grows and learns with you.

🎯 **Available in 5 languages**: English 🇬🇧, French 🇫🇷, Spanish 🇪🇸, German 🇩🇪, Arabic 🇸🇦 (with RTL support)

When you study, focus, and answer quizzes correctly, your companion gains XP, levels up (baby → adolescent → adult), and sends you encouraging messages. The goal is to be consistent xith your learning so your companion can stay nourished and hydrated.

***

## ✨ Features

### 🌍 Multi-Language Support

* **5 languages**: English 🇬🇧, French 🇫🇷, Spanish 🇪🇸, German 🇩🇪, Arabic 🇸🇦
* **Language selector**: Top-right dropdown with flag icons
* **RTL support**: Arabic automatically switches to right-to-left layout
* **Real-time switching**: Instant language changes across entire app
* **Persistent choice**: Language selection saved in localStorage
* **Complete translation**: Every button, message, and feature translated
* **Context-aware content**: Animal messages adapt to selected language

### 🎓 Smart Study Sessions

* **Pomodoro Technique**: 25-minute focus sessions + 5-minute breaks
* **AI-Powered Study Plans**: Upload documents (PDF/DOCX) and get personalized study schedules according to the uploaded material
* **Cycle-by-Cycle Execution**: Automated progression through multiple Pomodoro cycles
* **Detailed Guidance**: Each cycle includes:
  * Focus task description
  * Specific objectives
  * Key points to remember
  * Progress tracking with checkboxes
* **Break Management**: Automatic transitions between focus and rest periods
* **XP Rewards**: +25 XP per completed 25-minute session

### 🧠 AI-Powered Quizzes

* **Topic-Based Generation**: AI creates quizzes on any subject using Mistral AI
* **Multiple Choice**: 3 questions per quiz, 4 options each
* **Instant Feedback**: See if answers are correct immediately
* **XP Rewards**: +20 XP per correct answer (60 XP max per quiz)

⚠️ **Important Note: AI Content Limitations** AI-generated quiz content may have inaccuracies or errors. The open-source model (Mistral AI) can sometimes:

* Provide false answers or incorrect information
* Omit correct answer options from the choices
* Incorrectly evaluate answers as right or wrong
*   Generate misleading or inaccurate explanations

    \

* **Wolfram Integration**: Get detailed mathematical explanations for quiz questions
* **Themed Quizzes**: Pre-made AI-generated quiz themes across subjects:
  * Mathematics (Algebra, Geometry, Calculus)
  * Sciences (Biology, Chemistry, Physics)
  * History (Ancient civilizations, Medieval period, Modern era)
  * Geography (Maps, Capitals, Demographics)
  * Languages (Vocabulary, Grammar, Conjugation)
  * Computer Science (Wolfram Language tutorials)

### 🐾 Companion System

* **Choose Your Companion**: Fox or puppy, each with unique personality
* **Customizable Appearance**: 4 aura colors (Galaxy Blue, Magic Purple, Energy Orange, Focus Green)
* **Level Progression**:
  * **Baby** (0-999 XP): Small, learning together
  * **Adolescent** (1000-1999 XP): Growing stronger
  * **Adult** (2000+ XP): Fully evolved companion
* **Context-Aware Messages**: Dynamic messages based on activity:
  * Dashboard: Motivational messages
  * Study sessions: Focus encouragement
  * Breaks: Health reminders (stretch, hydrate)
  * Quizzes: Calm, supportive messages
* **Visual Evolution**: Companion orb size and glow intensity increase with level

### 💧 Hydration Streaks

* **Water-Themed Motivation**: 💧 symbols
* **Streak Tracking**: Study daily to keep your companion hydrated
* **Personal Records**: Track your max streak achievement
* **Dynamic Messages**:
  * 1 day: "Your companion is refreshed!"
  * 3-6 days: "Keep your companion hydrated!"
  * 7+ days: "Your companion stays hydrated! 💧"
  * 14+ days: "Epic hydration!"
  * 30+ days: "Legendary caregiver!"

### 📊 Learning Analytics

* **Study Sessions Counter**: Total Pomodoro cycles completed (🎓)
* **Average Quiz Score**: Calculated from XP earned (🎯)
* **Total Study Time**: Minutes spent in focus sessions (⏱️)
* **Weekly Progress Chart**: Visual bar chart of daily activity
* **Performance Indicators**:
  * Excellent (85%+): Green
  * Good (70-84%): Yellow
  * Keep Practicing (55-69%): Orange
  * Needs Improvement (<55%): Red
* **Personalized Recommendations**: Tips based on your performance

### 🔐 Authentication & Profiles

* **Supabase Integration**: Real user accounts with email/password
* **Instant Signup**: No email verification required for quick demos
* **Profile Persistence**: All data saved to database:
  * User name and companion details
  * XP and level
  * Streaks (current and max)
  * Study time and completed cycles
  * Last study date
* **Session Management**: Automatic login restoration

### 🎨 Beautiful UI/UX

* ADD DESCRIPTION

### 📚 Document Processing

* **File Upload**: Support for PDF, DOCX, and images
* **AI Ingestion**: Documents automatically chunked and processed
* **Vector Storage**: Content stored for intelligent retrieval
* **Study Plan Generation**: AI uses uploaded materials to create customized plans

### 🍖 Companion Care & Feeding

* **Food Shop**: Buy food for your companion using earned XP
* **Animal-Specific Food**: Each companion type has unique foods:
  * **Puppy**: Croquette (regular) and Muffin (special treat)
  * **Fox**: Dango (regular) and Bao (special treat)
* **XP Economy**:
  * Regular food: Costs 5 XP, gives back 2 XP
  * Special food: Costs 10 XP, gives back 5 XP (unlocked at adolescent level)
* **Feeding System**: Interactive feeding with visual bowl states (empty/full)
* **Level Requirements**: Special treats unlock when companion reaches adolescent level
* **Reward Mechanism**: Feed your companion to receive bonus XP

### 🎯 Gamification Elements

* **XP System**: Earn points for every activity
* **Level Progression**: Visual and functional companion evolution
* **Achievement Tracking**: Personal records and milestones
* **Progress Tracking**: Completed cycles, total study time
* **Motivational Feedback**: Dynamic messages and encouragement
* **XP Economy**: Spend earned XP on companion food and rewards

***

## 🛠️ Tech Stack

### Frontend

* **React + TypeScript**: Modern component-based architecture
* **React Router**: Client-side navigation
* **i18next**: Internationalization framework
* **Context API**: Global state management (UserContext)
* **Custom CSS**: Themed styling with CSS variables
* **Supabase Client**: Database and authentication

### Backend

* **Node.js + Express**: REST API server
* **Mistral AI**: Open-source LLM for quizzes and lesson plan generation (`open-mistral-7b`)
* **Wolfram Alpha API**: Mathematical explanations and themed quiz generations
* **AI Agents**:
  * `DocumentIngestionAgent`: PDF/DOCX parsing and chunking
  * `QuizGenerationAgent`: Intelligent quiz creation
  * `StudyCoachAgent`: Personalized study plan generation
* **Vector Storage**: JSON-based document storage for retrieval

### Database

* **Supabase (PostgreSQL)**: User profiles and progress tracking
* **Row Level Security**: Data isolation per user
* **Real-time Sync**: Automatic profile updates

***

## 📁 Project Structure

```
pawfriend/
├── backend/
│   ├── agents/
│   │   ├── DocumentIngestionAgent.js
│   │   ├── QuizGenerationAgent.js
│   │   └── StudyCoachAgent.js
│   ├── data/
│   │   └── vectorstore.json
│   ├── routes/
│   │   ├── quiz.js         # Quiz generation API
│   │   ├── study.js        # Study plan generation
│   │   ├── upload.js       # Document processing
│   │   └── wolfram.js      # Wolfram Alpha integration
│   ├── index.js
│   └── package.json
├── public/
│   ├── completion.mp3      # Cycle completion sound
│   ├── notification.mp3    # Notification sound
│   ├── *.png              # Companion sprites
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Animal.tsx               # Companion with messages
│   │   ├── LearningAnalytics.tsx    # Stats dashboard
│   │   ├── LanguageSelector.tsx     # Language switcher
│   │   ├── Modal.tsx                # Reusable modal
│   │   ├── SoundConsentBanner.tsx   # Audio permission
│   │   ├── StreaksWidget.tsx        # Hydration streaks
│   │   └── UserHeader.tsx           # Top navigation
│   ├── contexts/
│   │   └── UserContext.tsx          # Global state
│   ├── i18n/
│   │   ├── config.ts
│   │   └── locales/
│   │       ├── en.json
│   │       ├── fr.json
│   │       ├── es.json
│   │       ├── de.json
│   │       └── ar.json
│   ├── pages/
│   │   ├── AuthPage.tsx             # Login/signup
│   │   ├── DashboardPage.tsx        # Main hub
│   │   ├── LearningPage.tsx         # Study sessions
│   │   ├── OnboardingPage.tsx       # Companion creation
│   │   ├── QuizPage.tsx             # Quiz interface
│   │   ├── QuizThemesPage.tsx       # Themed quizzes
│   │   └── WolframCompanionPage.tsx # Wolfram queries
│   ├── utils/
│   │   ├── profileService.ts
│   │   └── supabaseClient.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── supabase_schema.sql
├── package.json
└── README.md
```

***

## 🚀 Quick Start

### Prerequisites

* Node.js v18+
* npm v8+
* Mistral API key (get from https://mistral.ai)
* Supabase account (free tier at https://supabase.com)
* Wolfram API Key (get from )

### 1. Clone Repository

```bash
git clone git@github.com:CSGIRLIES/hackathon-edugame-frontend.git
cd hackathon-edugame-frontend
```

### 2. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 3. Configure Environment

**Backend `.env`** (in `backend/` folder):

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
MISTRAL_API_KEY=your_mistral_key_here
WOLFRAM_APP_ID=your_wolfram_id_here
```

**Frontend `.env`** (in project root):

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Setup Database

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase_schema.sql`
3. Paste and run to create tables
4. Disable email confirmation: Authentication → Providers → Email → Turn OFF "Confirm email"

### 5. Create Demo User (Optional)

**Credentials:** `demo@csgirlies.com` / `DemoPass123!`

1. Supabase → Authentication → Users → Add user
2. Enter credentials above
3. Copy the generated `user_id` (UUID)
4. In SQL Editor, find commented INSERT in `supabase_schema.sql`
5. Replace `'YOUR-USER-ID-HERE'` with actual UUID
6. Uncomment and run the INSERT statement

**Demo profile includes:**

* 150 XP (Adolescent level)
* Purple fox named "Nova" 🦊
* 5-day streak (max 7 days)
* 125 minutes study time
* 12 completed cycles

### 6. Run Application

**One command (recommended):**

```bash
npm run dev
```

**Or run separately:**

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

Open http://localhost:3000 🎉

***

## 📖 User Guide

### Getting Started

1. **Sign Up**: Create account with email/password
2. **Onboarding**:
   * Enter your name
   * Choose companion (fox or puppy)
   * Select aura color
   * Name your companion
3. **Dashboard**: See companion, XP, and available activities

### Study Sessions

1. Click "Start Learning Session"
2. Enter what you're studying
3. (Optional) Upload study materials (PDF/DOCX)
4. (Optional) Generate AI study plan with available time
5. Start session - timer begins 25-minute cycle
6. Complete objectives during focus time
7. Take 5-minute break when prompted
8. Repeat for multiple cycles
9. Earn +25 XP per cycle

### Taking Quizzes

1. Click "Quick Quiz" or finish a study session
2. Enter topic or choose themed quiz
3. AI generates 3 questions
4. Answer multiple choice questions
5. Earn +20 XP per correct answer (60 XP max)
6. Return to dashboard with updated XP

### Feeding Your Companion

1. Navigate to food shop (dashboard)
2. View available food items for your companion type
3. Purchase food with earned XP:
   * Regular food: 5 XP (available anytime)
   * Special treats: 10 XP (unlocked at adolescent level)
4. Feed your companion and receive bonus XP
5. Watch the feeding animation with visual feedback

### Themed Quizzes

1. Navigate to "Quiz Themes"
2. Select subject (Math, Science, History, etc.)
3. Choose difficulty (Beginner, Intermediate, Advanced, Pro)
4. Pick specific topic from available quizzes
5. AI generates curriculum-aligned questions

### Maintaining Streaks

* Study at least once per day
* Your companion stays "hydrated" 💧
* Miss a day → streak resets to 0
* Track personal best streak record

### Changing Language

* Click language selector (top-right)
* Choose from 5 languages
* Entire app switches instantly
* Selection persists across sessions

***

## 🧪 Testing

### Demo User

Use `demo@csgirlies.com` / `DemoPass123!` to test with pre-populated data.

### Feature Testing Checklist

* [ ] Sign up new account
* [ ] Complete onboarding flow
* [ ] Start 25-minute Pomodoro session
* [ ] Take AI-generated quiz
* [ ] Upload study document
* [ ] Generate AI study plan
* [ ] Execute multi-cycle study plan
* [ ] Try themed quiz
* [ ] Check analytics dashboard
* [ ] Test streak system
* [ ] Switch languages
* [ ] Verify XP and level updates
* [ ] Hear sound effects
* [ ] Test on different browsers

***

## 👥 Team PawPatrol

This project was built by **Team PawPatrol** as a gamified educational platform to make learning fun and engaging through companion-based motivation!

***

## 📄 License

This project is part of the CSGIRLIES hackathon submission.

***

## 🤖 Development Credits

**AI-Powered Development:** The application was primarily developed using Cline, powered by **anthropic/claude-sonnet-3.5** and **openai/gpt-4o**, with extensive debugging and fine-tuning by the girlies at PawPatrol 🐾❤️

***

## 🙏 Acknowledgments

* **Mistral AI** for open-source LLM
* **Wolfram Alpha** for mathematical computations
* **CLINE** for access credits to their premium models
* **Supabase** for backend infrastructure
* **React** team for excellent framework
* All open-source contributors!
