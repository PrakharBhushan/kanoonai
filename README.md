# KanoonAI — Know Your Rights. Stay Protected.

> **© 2026 Prakhar Bhushan. All rights reserved.** This source is public for review only.
> It is not open source: copying, reusing, modifying or deploying any part of it, or using the
> KanoonAI name, is not permitted without written permission. See [LICENSE](LICENSE).

A React Native mobile app that gives Indian citizens instant access to legal information, emergency recording, and legal education — in English and Hindi.

## What This App Does

- **Emergency Mode**: Describe a legal situation (police stop, tenant dispute, consumer fraud, etc.) and get instant AI-powered legal information citing exact Indian law sections. Queries outside the law database's coverage (e.g. non-Indian law) deliberately skip the LLM and return fixed, reviewed guidance instead of letting the model improvise — a scoping decision to avoid confidently wrong legal information
- **Panic Recording**: One-tap emergency video/audio recording that uploads clips to secure cloud as they are captured, so footage taken before any interruption is preserved. Stopping from inside the app requires a 4-digit PIN. (Note: recording requires the app open and the screen on — force-quitting or powering off the device stops it; managed Expo cannot record in the background. Marketing copy must reflect this.)
- **Learn Mode**: Duolingo-style legal education with 6 topics, 5 lessons each, MCQ questions, hearts system, XP, streaks, and level progression
- **Bilingual**: Full English + Hindi support, toggle anytime in Settings
- **Dark/Light Mode**: System-aware with manual override

## Tech Stack

- **Framework**: Expo SDK 54 + TypeScript
- **Navigation**: React Navigation 7 (Stack + Bottom Tabs)
- **Database**: Supabase (PostgreSQL + pgvector for RAG)
- **AI**: Google Gemini 2.5 Flash + gemini-embedding-001 (RAG over Indian law text, Supabase pgvector)
- **Camera/Audio**: expo-camera, expo-av
- **Security**: expo-secure-store + SHA-256 PIN hashing
- **Animations**: react-native-reanimated
- **Styling**: React Native StyleSheet (no NativeWind)

## How to Run on Your Phone

1. Install **Expo Go** from the Play Store or App Store
2. Run in terminal:
   ```bash
   npx expo start
   ```
3. Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android)
4. The app loads instantly — changes appear live

## How to Build APK (Android)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

## Environment Setup

> ⚠️ **Do not commit real credentials.** Secrets must not live in the repo or in the
> client bundle. The Gemini key in particular must move behind a Supabase Edge Function
> (server-side) before launch — anything in `app.config.js extra` ships inside the app and
> can be extracted. Use EAS environment variables / a git-ignored `.env` and reference them
> from `app.config.js`.

`app.config.js` reads config from environment variables, e.g.:

```js
extra: {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_PUBLISHABLE_KEY, // publishable (RLS-protected) key only
  // geminiKey: removed from the client — call Gemini via a Supabase Edge Function instead
}
```

Create a git-ignored `.env` (see `.gitignore`) locally and set the same values as
EAS secrets for builds: `eas env:create`.

## Supabase Setup

1. Create a new Supabase project
2. Enable the `pgvector` extension in the SQL editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run `setup/storage-setup.sql` in the SQL editor to create all tables, policies, and functions
4. The `emergency-recordings` storage bucket is created automatically by the SQL script

## Seeding Law Data

To populate the `law_chunks` table with Indian law content for the AI RAG system:
1. Create a seeding script that generates embeddings using `gemini-embedding-001` (768-dim, truncated via `outputDimensionality`)
2. Insert rows into `law_chunks` with `law_name`, `section_number`, `content`, `plain_english`, `topic_slug`, and `embedding` (vector of 768 dimensions)

## Project Structure

```
src/
├── i18n/          — English + Hindi translations
├── theme/         — Colors + Dark/Light ThemeContext
├── navigation/    — Root, Auth, App, Emergency, Learn navigators
├── screens/       — All 16 screens across 5 categories
├── components/    — 10 reusable UI components
├── services/      — Supabase, Gemini, Panic Recording, Notifications
├── hooks/         — useAuth, useUser, useTheme, useTranslation
└── utils/         — XP calculations, Hearts logic, PIN security
```

## Key Security Features

- PIN is hashed with SHA-256 + salt before storage in SecureStore
- Emergency recordings upload to private Supabase bucket with RLS
- Only the recording user can access their own recordings
- Recording cannot be stopped without correct PIN (PIN pad is the only exit)
- Android back button is disabled during panic recording

## Legal Disclaimer

KanoonAI provides legal **information** for awareness only. It is not legal advice and does not create an attorney-client relationship. For case-specific guidance, consult a qualified advocate registered with the Bar Council of India. NALSA free legal aid: **15100**.
