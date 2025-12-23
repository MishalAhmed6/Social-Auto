# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### Code Structure
- [x] Build script configured (`npm run build`)
- [x] Vite config optimized for production
- [x] `vercel.json` configuration file created
- [x] `.gitignore` includes environment files
- [x] All routes properly configured
- [x] Landing page implemented
- [x] Error handling in place

### Environment Variables Needed

Before deploying, prepare these environment variables for Vercel:

#### Firebase Configuration
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Cloud Functions URL
```
VITE_API_BASE_URL=https://us-central1-your-project.cloudfunctions.net
```

**Important**: Replace `your-project` with your actual Firebase project ID.

## 🚀 Quick Deploy Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Set root directory to `flacron-social-auto-web`
4. Add all environment variables
5. Click Deploy

**Option B: Via CLI**
```bash
npm install -g vercel
cd flacron-social-auto-web
vercel login
vercel
```

### 3. Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:
- Add all `VITE_*` variables
- Set for Production, Preview, and Development
- Redeploy after adding variables

### 4. Update Firebase Settings

1. **Authorized Domains**:
   - Firebase Console → Authentication → Settings
   - Add: `your-app.vercel.app` and your custom domain

2. **OAuth Redirect URLs**:
   - Update in Instagram/Facebook/Twitter/LinkedIn apps:
   - `https://your-app.vercel.app/oauth/callback`

3. **Cloud Functions**:
   - Update `success_url` and `cancel_url` in Stripe checkout
   - Use your Vercel domain instead of localhost

## 📋 Post-Deployment Checklist

- [ ] Application loads at Vercel URL
- [ ] Landing page displays correctly
- [ ] Authentication works (signup/login)
- [ ] Firebase connection works
- [ ] Cloud Functions are accessible
- [ ] OAuth flows work
- [ ] Stripe checkout works
- [ ] All pages load without errors
- [ ] Responsive design works on mobile
- [ ] No console errors

## 🔧 Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all dependencies in `package.json`
- Ensure Node.js version is compatible (18+)

### Environment Variables Not Working
- Verify all start with `VITE_` prefix
- Redeploy after adding variables
- Check Vercel build logs for errors

### 404 on Page Refresh
- `vercel.json` includes rewrites for SPA routing
- Should work automatically

### CORS Errors
- Update Cloud Functions CORS settings
- Add Vercel domain to allowed origins

## 📝 Files Created for Deployment

1. **vercel.json** - Vercel configuration
2. **.vercelignore** - Files to exclude from deployment
3. **.gitignore** - Updated with environment files
4. **vite.config.js** - Optimized build configuration
5. **VERCEL_DEPLOYMENT.md** - Detailed deployment guide

## 🎯 Ready to Deploy!

Your application is now structured for Vercel deployment. Follow the steps above to deploy.

