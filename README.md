# Brainory AI Mobile App

React Native/Expo UI scaffold based on the provided PDF design.

## Setup

1. Install Node.js LTS.
2. Install dependencies:

```bash
npm install
```

3. Start the app:

```bash
npm run start
```

4. Scan the QR code using Expo Go on Android/iPhone, or run:

```bash
npm run android
npm run ios
```

## Current UI

- Splash screen
- 3 onboarding screens
- Home screen
- Side menu / history drawer
- Upload question bottom sheet
- AI solution chat screen
- Search history screen
- Settings screen
- Profile screen
- Premium screen

## Logo

When you provide the logo, place it at:

```text
assets/logo.png
```

Then replace the text logo in `App.js` with an `Image`.

## Backend Plan

Later flow:

1. User asks question by text, image, PDF, or document.
2. App sends question to backend API.
3. Backend checks your database for a matching question.
4. If match found, return saved answer.
5. If no match, send question to ChatGPT/OpenAI API.
6. Save generated answer in database.
7. Return step-by-step solution to app.
