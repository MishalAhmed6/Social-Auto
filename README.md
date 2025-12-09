# Flacron Social Auto — Web Dashboard (MVP)

A React-based web dashboard for managing social media automation, AI content generation, scheduling, and analytics.

## Tech Stack

- **Frontend**: React 18 with Vite
- **State Management**: React Context API
- **Styling**: Vanilla CSS / CSS Modules
- **Routing**: react-router-dom
- **HTTP Client**: axios
- **Date Utilities**: date-fns
- **Authentication & Database**: Firebase Auth + Firestore
- **Backend Integration**: Cloud Functions (assumed to exist)

## Prerequisites

- Node.js 18+ and npm
- Firebase project with Auth and Firestore enabled
- Cloud Functions deployed (or running locally via emulators)

## Installation

1. Clone the repository and navigate to the project directory:
```bash
cd flacron-social-auto-web
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory (copy from `.env.example`):
```bash
cp .env.example .env.local
```

4. Fill in your Firebase configuration in `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:5001/<your-project-id>/us-central1
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Note**: Replace `<your-project-id>` with your actual Firebase project ID. For production, use your deployed Cloud Functions URL.

## Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in the terminal).

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
src/
  api/               # Axios wrappers for Cloud Functions
  components/        # Reusable components (Navbar, ProtectedRoute, Toast, Layout)
  context/           # React Context providers (AuthContext, AppContext)
  hooks/             # Custom React hooks (if any)
  pages/             # Page components
    - Login.jsx
    - Signup.jsx
    - ForgotPassword.jsx
    - Dashboard.jsx
    - OnboardingProfile.jsx
    - OnboardingPlan.jsx
    - Accounts.jsx
    - AI.jsx
    - Templates.jsx
    - Scheduler.jsx
    - Analytics.jsx
    - Billing.jsx
  router/            # App routing configuration
  styles/             # CSS files
  utils/              # Utility functions (Firebase initialization)
```

## Cloud Functions API Reference

The frontend expects the following Cloud Function endpoints to be available:

### Stripe Endpoints

#### `POST /stripe/createCheckoutSession`
Creates a Stripe checkout session for plan selection.

**Request Body:**
```json
{
  "userId": "string",
  "planId": "string"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

#### `GET /stripe/billingPortalUrl?userId=<userId>`
Gets the Stripe Customer Portal URL for managing billing.

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

### AI Endpoints

#### `POST /ai/generatePosts`
Generates AI-powered social media posts.

**Request Body:**
```json
{
  "userId": "string",
  "niche": "string",
  "goal": "string",
  "tone": "string",
  "count": number
}
```

**Response:**
```json
[
  {
    "title": "string",
    "captionText": "string",
    "hashtags": ["string"]
  }
]
```

### OAuth Endpoints

#### `GET /oauth/getOAuthUrl?platform=<platform>&userId=<userId>`
Gets the OAuth authorization URL for connecting social accounts.

**Response:**
```json
{
  "url": "https://api.instagram.com/oauth/authorize?..."
}
```

**Note**: The frontend opens this URL in a new window. The Cloud Function handles the OAuth callback and token exchange, then writes the account data to Firestore (`users/{userId}/socialAccounts`).

## Firestore Data Structure

### Users Collection
- `users/{userId}` - User profile document
  - `name`: string
  - `email`: string
  - `role`: string (default: "user")
  - `businessCategory`: string
  - `timezone`: string
  - `createdAt`: timestamp
  - `updatedAt`: timestamp

### Subcollections under `users/{userId}`:

#### `socialAccounts`
- `{accountId}` - Connected social account
  - `platform`: string (instagram, facebook, twitter, linkedin)
  - `accountName`: string
  - `lastUpdated`: timestamp

#### `postTemplates`
- `{templateId}` - Saved post template
  - `title`: string
  - `captionText`: string
  - `hashtags`: array of strings
  - `createdAt`: timestamp
  - `updatedAt`: timestamp

#### `scheduledPosts`
- `{postId}` - Scheduled post
  - `platform`: string
  - `captionText`: string
  - `mediaUrl`: string (optional)
  - `scheduledAt`: timestamp
  - `status`: string ("pending", "published", "failed")
  - `createdAt`: timestamp

#### `postInsights`
- `{insightId}` - Post analytics data
  - `date`: timestamp
  - `impressions`: number
  - `likes`: number
  - `comments`: number
  - `platform`: string

### Subscriptions Collection
- `subscriptions/{userId}` - User subscription data
  - `planId`: string
  - `status`: string ("active", "cancelled")
  - `currentPeriodEnd`: timestamp
  - `limits`: object
    - `aiPostsPerMonth`: number
    - `connectedAccounts`: number

## Features Implemented

### Week 1 Features
- ✅ User authentication (sign up, sign in, password reset)
- ✅ Onboarding flow (profile completion, plan selection)
- ✅ Connected accounts management (OAuth flow UI)
- ✅ Dashboard overview

### Week 2 Features
- ✅ AI content generator
- ✅ Post templates (save, edit, delete)
- ✅ Scheduler (weekly/monthly calendar view)
- ✅ Analytics dashboard
- ✅ Billing management

## Authentication Flow

1. User signs up → Firebase Auth creates user → Firestore `users/{userId}` doc created
2. User completes onboarding profile → Updates `users/{userId}` doc
3. User selects plan → Calls `/stripe/createCheckoutSession` → Redirects to Stripe checkout
4. After checkout, backend webhook updates `subscriptions/{userId}` doc
5. User can manage billing via `/stripe/billingPortalUrl`

## OAuth Flow

1. User clicks "Connect Account" → Frontend calls `/oauth/getOAuthUrl`
2. Frontend opens OAuth URL in new window
3. User authorizes → OAuth callback handled by Cloud Function
4. Cloud Function exchanges code for token → Writes account doc to `users/{userId}/socialAccounts`
5. Frontend listens to Firestore changes → UI updates automatically

## Testing Locally

### With Firebase Emulators

1. Start Firebase emulators:
```bash
firebase emulators:start
```

2. Update `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:5001/<project-id>/us-central1
```

3. Run the dev server:
```bash
npm run dev
```

### Testing Checklist

- [ ] User can sign up and create account
- [ ] User can sign in with email/password
- [ ] User can reset password
- [ ] Onboarding profile form saves to Firestore
- [ ] Plan selection calls Stripe checkout (or shows error if endpoint unavailable)
- [ ] Connected accounts page opens OAuth URLs
- [ ] Social accounts appear in UI when added to Firestore
- [ ] AI generator calls `/ai/generatePosts` and displays results
- [ ] Templates can be saved, edited, and deleted
- [ ] Scheduler can create/edit/delete scheduled posts
- [ ] Analytics page reads `postInsights` and displays stats
- [ ] Billing page opens Stripe customer portal

## Environment Variables

All environment variables must be prefixed with `VITE_` for Vite to expose them to the client.

- `VITE_API_BASE_URL` - Base URL for Cloud Functions
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase Auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

## Security Notes

- **No secrets in frontend code**: All API keys are via environment variables
- **Firestore Security Rules**: Ensure proper rules are set up to protect user data
- **Cloud Functions**: Handle sensitive operations (OAuth token exchange, Stripe webhooks) server-side
- **ID Tokens**: Frontend attaches Firebase ID tokens to Cloud Function requests via axios interceptor

## Troubleshooting

### Firebase not initializing
- Check that all environment variables are set correctly in `.env.local`
- Ensure `.env.local` is in `.gitignore` (not committed)

### Cloud Functions not responding
- Verify `VITE_API_BASE_URL` is correct
- Check Cloud Functions logs
- Ensure CORS is configured on Cloud Functions

### OAuth not working
- Verify OAuth URLs are being generated correctly
- Check Cloud Function logs for OAuth callback errors
- Ensure Firestore security rules allow writes to `socialAccounts` subcollection

## Git Branch

This implementation is on branch: `feature/web-week1-2`

## License

Private - Flacron Social Auto
