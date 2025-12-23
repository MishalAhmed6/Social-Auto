# Firestore Security Rules Setup

## The Error: "Missing or insufficient permissions"

This error occurs because Firestore security rules are blocking access. You need to configure security rules in your Firebase Console.

## Quick Setup Steps

### Option 1: Use the Rules File (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Copy the contents from `firestore.rules` file in this project
5. Paste into the Rules editor
6. Click **Publish**

### Option 2: Manual Setup

1. Go to Firebase Console → Firestore Database → Rules
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection - users can read/write their own profile
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      
      // User's social accounts subcollection
      match /socialAccounts/{accountId} {
        allow read, write: if isOwner(userId);
      }
      
      // User's post templates subcollection
      match /postTemplates/{templateId} {
        allow read, write: if isOwner(userId);
      }
      
      // User's scheduled posts subcollection
      match /scheduledPosts/{postId} {
        allow read, write: if isOwner(userId);
      }
      
      // User's post insights subcollection
      match /postInsights/{insightId} {
        allow read: if isOwner(userId);
        // Write is typically done by backend/Cloud Functions
        allow write: if false;
      }
    }
    
    // Subscriptions collection - users can read their own subscription
    match /subscriptions/{userId} {
      allow read: if isOwner(userId);
      // Write is typically done by backend/Cloud Functions (Stripe webhooks)
      allow write: if false;
    }
  }
}
```

3. Click **Publish**

## What These Rules Do

- **Users can only access their own data**: Each user can only read/write documents where `userId` matches their Firebase Auth UID
- **Subcollections are protected**: All subcollections under `users/{userId}` follow the same ownership rule
- **Subscriptions are read-only for users**: Users can read their subscription but cannot modify it (backend handles updates via Stripe webhooks)
- **Post insights are read-only**: Users can read analytics but cannot write them (backend populates this data)

## Testing

After publishing the rules:
1. Restart your dev server
2. Try signing up a new account
3. The error should be resolved

## Temporary Development Rules (NOT FOR PRODUCTION)

If you need to test quickly during development, you can temporarily use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ WARNING**: This allows any authenticated user to read/write ALL data. Only use for development/testing!

## Need Help?

- Check Firebase Console → Firestore → Rules for syntax errors
- Check browser console for specific permission errors
- Verify your Firebase Auth is working (try signing up first)

