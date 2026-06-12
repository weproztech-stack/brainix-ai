# Brainory AI - Step by Step Plan

## Phase 1: UI

Done in this workspace:

- React Native / Expo project scaffold
- Splash screen matching the uploaded screenshot style
- 3 onboarding screens: Snap Any Question, Step-by-Step Solutions, Smart Study History
- Home screen
- Upload question bottom sheet
- Side menu with history
- Solution/chat screen
- Search history
- Settings
- Profile
- Premium plan screen
- Branding changed from Solve AI to Brainory AI

## Run Locally

```bash
npm install
npm run start
```

Then scan the Expo QR code with Expo Go.

## Logo

When logo is ready:

1. Save it as `assets/logo.png`.
2. Replace the `AppLogo` text component in `App.js` with a React Native `Image`.

## Phase 2: Backend

Recommended backend:

- Node.js + Express or NestJS
- PostgreSQL or MongoDB
- OpenAI/ChatGPT API
- File upload storage for images, PDFs, and documents

Question solving flow:

1. User submits text/image/PDF/document.
2. Backend extracts question text.
3. Backend searches your database for a matching question.
4. If match exists, return saved answer.
5. If no match exists, call OpenAI API.
6. Save the new question and answer in your database.
7. Return step-by-step solution to the mobile app.

## Phase 3: App Features

- Authentication
- Question history
- Image upload
- PDF/document upload
- OCR for image questions
- Saved answers
- Premium plans
- PDF export
- Push notifications
