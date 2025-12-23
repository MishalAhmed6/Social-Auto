# OAuth Connection Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Failed to connect [platform]" Error

**Possible Causes:**
1. Cloud Function endpoint not deployed or incorrect URL
2. OAuth redirect URL not configured in platform settings
3. CORS issues
4. Missing environment variables

**Solutions:**

1. **Check Cloud Function URL:**
   - Verify `VITE_API_BASE_URL` in `.env.local` is correct
   - Format: `https://<region>-<project-id>.cloudfunctions.net` or `http://localhost:5001/<project-id>/us-central1` for emulators
   - Test the endpoint: `GET /oauth/getOAuthUrl?platform=instagram&userId=<your-user-id>`

2. **Configure OAuth Redirect URLs:**
   
   **For Instagram/Facebook:**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Add redirect URI: `https://<your-domain>/oauth/callback` or `http://localhost:5173/oauth/callback` for local dev
   
   **For Twitter:**
   - Go to [Twitter Developer Portal](https://developer.twitter.com/)
   - Add callback URL: `https://<your-domain>/oauth/callback`
   
   **For LinkedIn:**
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Add redirect URL: `https://<your-domain>/oauth/callback`

3. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Check Network tab for failed requests
   - Check Console for error messages

4. **Verify Firestore Security Rules:**
   - Ensure rules allow writes to `users/{userId}/socialAccounts`
   - See `firestore.rules` file

### Issue: OAuth Popup Opens But Nothing Happens

**Possible Causes:**
1. OAuth callback URL not configured in Cloud Function
2. Popup blocked by browser
3. Cloud Function not handling callback correctly

**Solutions:**

1. **Check Cloud Function Logs:**
   - Go to Firebase Console → Functions → Logs
   - Look for errors during OAuth callback

2. **Allow Popups:**
   - Check browser settings to allow popups for your domain
   - Try clicking "Connect" again

3. **Manual Testing:**
   - Open OAuth URL directly in browser (check Network tab)
   - Complete authorization manually
   - Check if account appears in Firestore

### Issue: Account Shows as Connected But Can't Use It

**Possible Causes:**
1. Token expired or invalid
2. Permissions not granted correctly
3. Account data incomplete in Firestore

**Solutions:**

1. **Check Firestore Document:**
   - Go to Firebase Console → Firestore
   - Check `users/{userId}/socialAccounts/{accountId}`
   - Verify fields: `platform`, `accountName`, `accessToken` (if stored), `lastUpdated`

2. **Reconnect Account:**
   - Disconnect the account
   - Connect again
   - Grant all required permissions

### Testing OAuth Flow Locally

1. **Start Firebase Emulators:**
```bash
firebase emulators:start
```

2. **Update `.env.local`:**
```env
VITE_API_BASE_URL=http://localhost:5001/<project-id>/us-central1
```

3. **Configure Local Redirect:**
   - Add `http://localhost:5173/oauth/callback` to OAuth app settings
   - Or use `http://localhost:5001` if using Firebase Hosting emulator

4. **Test Flow:**
   - Click "Connect" on Accounts page
   - Complete OAuth in popup
   - Check Firestore emulator UI for new document

### Cloud Function Requirements

Your Cloud Function should:

1. **Generate OAuth URL:**
   - Endpoint: `GET /oauth/getOAuthUrl?platform=<platform>&userId=<userId>`
   - Return: `{ url: "<oauth-authorization-url>" }`
   - Include `state` parameter with userId for security

2. **Handle OAuth Callback:**
   - Endpoint: `GET /oauth/callback?code=<code>&state=<state>&platform=<platform>`
   - Exchange code for access token
   - Store account data in Firestore: `users/{userId}/socialAccounts/{accountId}`
   - Redirect to: `https://<your-domain>/oauth/callback?success=true`

3. **Store Account Data:**
```javascript
{
  platform: 'instagram',
  accountName: 'username',
  accessToken: 'token', // or store securely server-side
  refreshToken: 'refresh_token', // if available
  expiresAt: timestamp,
  lastUpdated: timestamp,
  createdAt: timestamp
}
```

### Debug Checklist

- [ ] Cloud Functions deployed and accessible
- [ ] `VITE_API_BASE_URL` correctly set
- [ ] OAuth redirect URLs configured in platform settings
- [ ] Firestore security rules allow writes
- [ ] Browser allows popups
- [ ] User is authenticated (check Firebase Auth)
- [ ] Network requests succeed (check DevTools)
- [ ] Cloud Function logs show no errors
- [ ] Firestore document created after OAuth

### Still Having Issues?

1. Check browser console for specific error messages
2. Check Cloud Function logs in Firebase Console
3. Verify OAuth app credentials are correct
4. Test OAuth URL manually in browser
5. Check Firestore security rules syntax

