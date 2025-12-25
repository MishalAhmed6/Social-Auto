# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub (recommended)
3. **Firebase Project**: Ensure your Firebase project is set up
4. **Cloud Functions**: Deploy your Cloud Functions to Firebase

## Step 1: Prepare Environment Variables

Before deploying, you need to set up environment variables in Vercel. These are the variables you'll need:

### Frontend Environment Variables (Vercel Dashboard)

Go to your Vercel project settings → Environment Variables and add:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=https://your-region-your-project.cloudfunctions.net
```

**Important Notes:**
- Replace `your-region-your-project` with your actual Firebase Cloud Functions URL
- For production, use your deployed Cloud Functions URL (not localhost)
- Example: `https://us-central1-demoproject-5774f.cloudfunctions.net`

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select the `flacron-social-auto-web` folder as the root directory

2. **Configure Project**:
   - Framework Preset: **Vite**
   - Root Directory: `flacron-social-auto-web`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

3. **Add Environment Variables**:
   - In the project settings, add all the `VITE_*` environment variables
   - Make sure to add them for **Production**, **Preview**, and **Development** environments

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to project directory**:
   ```bash
   cd flacron-social-auto-web
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new
   - Set up environment variables when prompted

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Step 3: Update Firebase Configuration

After deployment, update your Firebase configuration:

1. **Authorized Domains**:
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add your Vercel domain (e.g., `your-app.vercel.app`)

2. **OAuth Redirect URLs**:
   - Update OAuth redirect URLs in your social media app settings:
     - Instagram: `https://your-app.vercel.app/oauth/callback`
     - Facebook: `https://your-app.vercel.app/oauth/callback`
     - Twitter: `https://your-app.vercel.app/oauth/callback`
     - LinkedIn: `https://your-app.vercel.app/oauth/callback`

3. **Stripe Webhooks**:
   - Update Stripe webhook URLs to point to your Firebase Cloud Functions
   - Example: `https://us-central1-your-project.cloudfunctions.net/stripeWebhook`

## Step 4: Update Cloud Functions

Update your Cloud Functions to use the production frontend URL:

In `functions/index.js`, update the `success_url` and `cancel_url`:

```javascript
const frontendUrl = process.env.FRONTEND_URL || 'https://your-app.vercel.app';
```

## Step 5: Verify Deployment

1. **Check Build Logs**:
   - Go to Vercel Dashboard → Deployments
   - Check if build completed successfully

2. **Test the Application**:
   - Visit your Vercel URL
   - Test authentication
   - Test Cloud Functions integration
   - Test OAuth flows

## Common Issues

### Issue: Environment Variables Not Working

**Solution**: 
- Make sure all variables start with `VITE_` prefix
- Redeploy after adding environment variables
- Check Vercel build logs for errors

### Issue: 404 on Refresh

**Solution**: 
- The `vercel.json` file includes rewrites to handle client-side routing
- This should be automatically configured

### Issue: CORS Errors

**Solution**:
- Make sure your Cloud Functions allow your Vercel domain
- Update CORS settings in Cloud Functions

### Issue: Firebase Auth Not Working

**Solution**:
- Add your Vercel domain to Firebase Authorized Domains
- Check that environment variables are correctly set

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Firebase authorized domains updated
- [ ] OAuth redirect URLs updated
- [ ] Stripe webhook URLs updated
- [ ] Cloud Functions deployed and accessible
- [ ] Build completes successfully
- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Cloud Functions integration works
- [ ] OAuth flows work
- [ ] Stripe checkout works

## Custom Domain Setup

1. **Add Domain in Vercel**:
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Firebase**:
   - Add custom domain to Firebase Authorized Domains
   - Update OAuth redirect URLs

3. **Update Environment Variables**:
   - Update `VITE_API_BASE_URL` if needed

## Monitoring

- **Vercel Analytics**: Enable in project settings
- **Error Tracking**: Consider adding Sentry or similar
- **Performance**: Monitor Core Web Vitals in Vercel dashboard

## Support

For issues:
1. Check Vercel build logs
2. Check browser console for errors
3. Verify environment variables
4. Check Firebase console for errors
5. Review Cloud Functions logs


