# Stripe Checkout Troubleshooting Guide

## Error: "Failed to start checkout"

This error occurs when the frontend cannot successfully call the Stripe checkout Cloud Function.

## Common Causes and Solutions

### 1. Cloud Function Not Deployed

**Symptoms:**
- Error message mentions "endpoint not found" or "404"
- Network error in browser console

**Solution:**
- Deploy your Cloud Function: `POST /stripe/createCheckoutSession`
- Verify the function is accessible at: `{VITE_API_BASE_URL}/stripe/createCheckoutSession`
- Check Firebase Console → Functions to see if function is deployed

### 2. Incorrect API Base URL

**Symptoms:**
- Network error or "Cannot reach server"
- Error mentions checking `VITE_API_BASE_URL`

**Solution:**
1. Check `.env.local` file:
   ```env
   VITE_API_BASE_URL=https://<region>-<project-id>.cloudfunctions.net
   ```
   Or for emulators:
   ```env
   VITE_API_BASE_URL=http://localhost:5001/<project-id>/us-central1
   ```

2. Verify the URL format:
   - Production: `https://us-central1-<project-id>.cloudfunctions.net`
   - Emulator: `http://localhost:5001/<project-id>/us-central1`

3. Restart dev server after changing `.env.local`

### 3. CORS Issues

**Symptoms:**
- CORS error in browser console
- "Network Error" message

**Solution:**
- Ensure Cloud Function has CORS headers configured:
  ```javascript
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  ```

### 4. Authentication Token Missing/Invalid

**Symptoms:**
- 401 or 403 error
- "Authentication failed" message

**Solution:**
1. Ensure user is signed in
2. Check browser console → Application → Local Storage → `idToken` exists
3. Sign out and sign in again to refresh token
4. Verify Cloud Function validates Firebase ID tokens

### 5. Cloud Function Error

**Symptoms:**
- 500 error
- "Server error" message
- Check Cloud Function logs in Firebase Console

**Solution:**
1. Check Firebase Console → Functions → Logs
2. Look for errors in `/stripe/createCheckoutSession` function
3. Common issues:
   - Stripe API key not configured
   - Missing environment variables
   - Invalid plan ID
   - Stripe webhook not configured

## Testing Checklist

- [ ] Cloud Function deployed and accessible
- [ ] `VITE_API_BASE_URL` correctly set in `.env.local`
- [ ] Dev server restarted after changing `.env.local`
- [ ] User is authenticated (check Firebase Auth)
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows request to correct URL
- [ ] Cloud Function logs show no errors
- [ ] Stripe API keys configured in Cloud Function environment

## Manual Testing

1. **Check API URL:**
   ```bash
   # In browser console, check:
   console.log(import.meta.env.VITE_API_BASE_URL);
   ```

2. **Test Endpoint Directly:**
   ```bash
   # Using curl or Postman:
   POST {VITE_API_BASE_URL}/stripe/createCheckoutSession
   Headers: {
     "Authorization": "Bearer <firebase-id-token>",
     "Content-Type": "application/json"
   }
   Body: {
     "userId": "<user-id>",
     "planId": "starter"
   }
   ```

3. **Check Browser Network Tab:**
   - Open DevTools → Network
   - Click "Select Plan"
   - Look for request to `/stripe/createCheckoutSession`
   - Check request URL, headers, and response

## Expected Cloud Function Response

The Cloud Function should return:
```json
{
  "url": "https://checkout.stripe.com/pay/cs_..."
}
```

If you get a different response format, update the frontend code accordingly.

## Quick Fixes

1. **If using Firebase Emulators:**
   ```bash
   firebase emulators:start
   ```
   Update `.env.local`:
   ```env
   VITE_API_BASE_URL=http://localhost:5001/<project-id>/us-central1
   ```

2. **If Cloud Function exists but returns error:**
   - Check Cloud Function code
   - Verify Stripe API keys
   - Check function logs

3. **If URL is wrong:**
   - Get correct URL from Firebase Console → Functions
   - Update `.env.local`
   - Restart dev server

## Still Having Issues?

1. Check browser console for detailed error messages
2. Check Network tab for failed requests
3. Check Cloud Function logs in Firebase Console
4. Verify Stripe account is set up correctly
5. Test Cloud Function directly with Postman/curl

