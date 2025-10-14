# 🚀 St. Pete Volleyball - Vercel Deployment Guide

## Pre-Deployment Security Checklist

### ✅ Completed Security Measures

1. **Firebase Security Rules** - Already deployed to Firebase Console
2. **Service Account Protection** - Added to `.gitignore`
3. **Environment Variables** - Properly configured with `VITE_` prefix
4. **Security Headers** - Configured in `vercel.json`
5. **Legal Pages** - Privacy Policy, Terms of Service, and Waiver created
6. **Footer Links** - Legal pages linked in site footer
7. **HTTPS** - Automatically enforced by Vercel

---

## 🔐 Critical: Verify Before Deployment

### 1. Check Git Repository for Sensitive Files

```bash
# Make sure these files are NOT in your Git repository:
git ls-files | grep -E "(service-account|\.env)"
```

**If any files appear, you MUST:**
```bash
# Remove from Git history
git rm --cached spvb-service-account.json
git rm --cached .env.local
git commit -m "Remove sensitive files"

# Then rotate your Firebase credentials immediately
```

### 2. Verify .gitignore is Working

```bash
# Check that sensitive files are ignored:
git status --ignored

# You should see:
# - spvb-service-account.json
# - .env.local
```

---

## 📋 Vercel Deployment Steps

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Configure project settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Step 3: Add Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

```
VITE_FIREBASE_API_KEY=AIzaSyA3EMVk40nCsz2N0SkbvdERTR4dvRITSjM
VITE_FIREBASE_AUTH_DOMAIN=st-pete-volleyball.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=st-pete-volleyball
VITE_FIREBASE_STORAGE_BUCKET=st-pete-volleyball.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=16870335086
VITE_FIREBASE_APP_ID=1:16870335086:web:aa9dacdaf01aa4bf3cfc7f
VITE_FIREBASE_MEASUREMENT_ID=G-5TVNPNX8D7
```

**Important:** 
- Set these for **Production**, **Preview**, and **Development** environments
- These are client-side variables (safe to expose in browser)
- Firebase security is handled by Firestore rules, not API key secrecy

### Step 4: Deploy

Click "Deploy" and wait for build to complete.

---

## 🔒 Post-Deployment Security Verification

### 1. Test Security Headers

```bash
curl -I https://your-domain.vercel.app
```

Verify these headers are present:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: ...`

### 2. Test Firebase Security Rules

Try these tests in browser console on your deployed site:

```javascript
// Should FAIL (non-admin trying to create tournament)
firebase.firestore().collection('tournaments').add({
  name: 'Hack Attempt'
});

// Should SUCCEED (reading public tournament data)
firebase.firestore().collection('tournaments').get();
```

### 3. Verify Legal Pages

Visit these URLs and confirm they load:
- `https://your-domain.vercel.app/privacy`
- `https://your-domain.vercel.app/terms`
- `https://your-domain.vercel.app/waiver`

### 4. Test Admin Access Control

1. Try accessing `/admin` without logging in → Should redirect to `/admin/login`
2. Try logging in with non-admin account → Should show "Access denied"
3. Log in with admin account → Should access admin dashboard

---

## 🌐 Custom Domain Setup (Optional)

### Add Custom Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `stpetevb.com`)
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificate

### Recommended DNS Settings

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 🔧 Firebase Configuration

### Verify Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select "st-pete-volleyball" project
3. Navigate to Firestore Database → Rules
4. Verify rules match the ones you provided (already deployed)
5. Click "Publish" if any changes needed

### Add Authorized Domains

1. Firebase Console → Authentication → Settings → Authorized domains
2. Add your Vercel domain: `your-project.vercel.app`
3. Add custom domain if applicable: `stpetevb.com`

---

## 📊 Monitoring & Analytics

### Enable Vercel Analytics (Optional)

```bash
npm install @vercel/analytics
```

Add to `src/main.jsx`:
```javascript
import { inject } from '@vercel/analytics';
inject();
```

### Firebase Analytics

Already configured via `VITE_FIREBASE_MEASUREMENT_ID`

---

## 🚨 Security Incident Response

### If Service Account Key is Compromised

1. **Immediately** go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Delete the old key from Firebase
4. Update local `spvb-service-account.json` (DO NOT COMMIT)
5. Verify `.gitignore` is working

### If Unauthorized Access Detected

1. Check Firebase Console → Authentication → Users for suspicious accounts
2. Review Firestore Database → Usage tab for unusual activity
3. Check Vercel Analytics for traffic spikes
4. Review admin login attempts in Firebase Authentication logs

---

## 📝 Maintenance Checklist

### Weekly
- [ ] Review Firebase usage and costs
- [ ] Check Vercel deployment logs for errors
- [ ] Monitor user registrations for spam

### Monthly
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review Firebase security rules for needed updates
- [ ] Check SSL certificate status (auto-renewed by Vercel)
- [ ] Backup Firestore data (Firebase Console → Firestore → Export)

### Quarterly
- [ ] Review and update Privacy Policy if needed
- [ ] Review Terms of Service for legal compliance
- [ ] Test all admin functionality
- [ ] Review user feedback and feature requests

---

## 🆘 Troubleshooting

### Build Fails on Vercel

**Error:** `Module not found`
```bash
# Locally test production build:
npm run build
npm run preview
```

**Error:** Environment variables not working
- Verify all `VITE_` prefixed variables are in Vercel dashboard
- Redeploy after adding environment variables

### Firebase Connection Issues

**Error:** `Firebase: Error (auth/unauthorized-domain)`
- Add Vercel domain to Firebase Authorized Domains (see above)

**Error:** `Missing or insufficient permissions`
- Check Firestore security rules
- Verify user has admin custom claim (if accessing admin features)

### Admin Login Not Working

1. Verify admin custom claim is set:
```bash
node setAdmin.js your-admin-email@example.com
```

2. Check Firebase Console → Authentication → Users → Custom Claims

---

## 📞 Support Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **Vercel Documentation:** https://vercel.com/docs
- **React Router:** https://reactrouter.com/
- **Vite Documentation:** https://vitejs.dev/

---

## ✅ Final Pre-Launch Checklist

- [ ] All environment variables added to Vercel
- [ ] Firebase security rules deployed and tested
- [ ] Service account file NOT in Git repository
- [ ] Legal pages (Privacy, Terms, Waiver) accessible
- [ ] Footer links working on all pages
- [ ] Admin login tested with admin account
- [ ] Non-admin users cannot access admin panel
- [ ] Tournament registration flow tested
- [ ] Score submission tested
- [ ] Mobile responsive design verified
- [ ] Security headers verified with curl
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic via Vercel)
- [ ] Firebase authorized domains updated
- [ ] Analytics configured (optional)

---

## 🎉 You're Ready to Deploy!

Once all checklist items are complete, your St. Pete Volleyball website is secure and ready for production use.

**Questions or Issues?**
Contact: stpetevolleyball@gmail.com