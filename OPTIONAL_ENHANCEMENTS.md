# 🔧 Optional Security Enhancements

These enhancements are **not required** for deployment but will improve security and user experience.

---

## 1. 🛡️ Admin Route Protection (Recommended)

**Priority:** Medium  
**Effort:** 15 minutes  
**Benefit:** Prevents non-admin users from seeing admin UI

### Current Behavior:
- Non-admin users can navigate to `/admin` and see the UI briefly
- Firebase security rules block data access, but UI is visible
- User sees error messages when trying to load data

### Improved Behavior:
- Non-admin users are immediately redirected to login
- Admin UI is never visible to unauthorized users
- Better user experience and security

### Implementation:

#### Step 1: Create ProtectedRoute Component

Create `/src/components/ProtectedRoute.jsx`:

```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      try {
        const tokenResult = await user.getIdTokenResult();
        setIsAdmin(!!tokenResult.claims.admin);
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      }
      setLoading(false);
    };
    
    checkAdmin();
  }, [user]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p>Verifying access...</p>
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
}
```

#### Step 2: Update App.jsx

```jsx
import ProtectedRoute from "./components/ProtectedRoute";

// ... existing imports ...

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* ... existing public routes ... */}

        {/* Admin routes - NOW PROTECTED */}
        <Route path="admin/login" element={<AdminLogin />} />
        <Route 
          path="admin" 
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="admin/tournament/:tournamentId"
          element={
            <ProtectedRoute>
              <AdminTournamentDetail />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
```

#### Step 3: Test

1. Log out of admin account
2. Try navigating to `/admin` → Should redirect to `/admin/login`
3. Log in with non-admin account → Should redirect to `/admin/login`
4. Log in with admin account → Should access admin dashboard

---

## 2. 🔐 Two-Factor Authentication (2FA)

**Priority:** Low  
**Effort:** 5 minutes (Firebase Console)  
**Benefit:** Extra security for admin accounts

### Implementation:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select "st-pete-volleyball" project
3. Navigate to **Authentication** → **Sign-in method**
4. Click **Advanced** → **Multi-factor authentication**
5. Enable **SMS** or **TOTP** (authenticator app)
6. Require 2FA for admin users

### User Experience:
- Admin users will be prompted to set up 2FA on next login
- They'll need their phone or authenticator app to log in
- Significantly reduces risk of account compromise

---

## 3. 🚦 Rate Limiting for Registrations

**Priority:** Low  
**Effort:** 30-60 minutes  
**Benefit:** Prevents spam registrations

### Option A: Firebase App Check (Easiest)

1. Go to Firebase Console → **App Check**
2. Enable reCAPTCHA v3 for web app
3. Add to `src/services/firebase.js`:

```javascript
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// After initializeApp
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true
});
```

### Option B: Vercel Edge Functions (Advanced)

Create `/api/register.js`:

```javascript
import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const key = `rate-limit:${ip}`;
  
  // Check rate limit (max 5 registrations per hour)
  const count = await kv.incr(key);
  if (count === 1) {
    await kv.expire(key, 3600); // 1 hour
  }
  
  if (count > 5) {
    return new Response('Too many registrations. Try again later.', {
      status: 429
    });
  }
  
  return new Response('OK', { status: 200 });
}
```

---

## 4. 📱 Phone Number Validation

**Priority:** Low  
**Effort:** 10 minutes  
**Benefit:** Ensures valid phone numbers

### Implementation:

Update `RegisterPage.jsx`:

```javascript
const validatePhone = (phone) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  // Validate phone number
  if (!validatePhone(captainPhone)) {
    setError("Please enter a valid 10-digit phone number.");
    return;
  }

  // ... rest of submit logic
};
```

---

## 5. 🔍 Dependency Security Audits

**Priority:** Medium  
**Effort:** 5 minutes (recurring)  
**Benefit:** Prevents known vulnerabilities

### Implementation:

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if possible)
npm audit fix

# Fix breaking changes manually
npm audit fix --force

# Update all dependencies
npm update
```

### Recommended Schedule:
- **Weekly:** Run `npm audit` during development
- **Monthly:** Update dependencies with `npm update`
- **Before deployment:** Always run `npm audit` and fix critical/high issues

---

## 6. 📊 Security Monitoring

**Priority:** Low  
**Effort:** 10 minutes  
**Benefit:** Early detection of security issues

### Firebase Security Monitoring:

1. **Enable Firebase Alerts:**
   - Firebase Console → **Project Settings** → **Integrations**
   - Enable email alerts for unusual activity

2. **Monitor Authentication:**
   - Firebase Console → **Authentication** → **Users**
   - Check for suspicious account creation patterns

3. **Monitor Firestore Usage:**
   - Firebase Console → **Firestore Database** → **Usage**
   - Watch for unusual spikes in reads/writes

### Vercel Monitoring:

1. **Enable Vercel Analytics:**
   ```bash
   npm install @vercel/analytics
   ```

   Add to `src/main.jsx`:
   ```javascript
   import { inject } from '@vercel/analytics';
   inject();
   ```

2. **Set up Vercel Alerts:**
   - Vercel Dashboard → Project → **Settings** → **Notifications**
   - Enable alerts for deployment failures and errors

---

## 7. 🔒 Content Security Policy (CSP) Hardening

**Priority:** Low  
**Effort:** 30 minutes  
**Benefit:** Stronger XSS protection

### Current CSP:
```json
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com"
```

### Hardened CSP (requires nonces):

Update `vercel.json`:

```json
"Content-Security-Policy": "default-src 'self'; script-src 'self' 'nonce-{NONCE}' https://*.firebaseapp.com; ..."
```

Then implement nonce generation in your build process. This is advanced and may require significant refactoring.

**Recommendation:** Only implement if you have specific security requirements. Current CSP is acceptable for most use cases.

---

## 8. 🗄️ Database Backup Automation

**Priority:** Medium  
**Effort:** 15 minutes  
**Benefit:** Data recovery in case of disaster

### Implementation:

1. **Manual Backup (Start Here):**
   - Firebase Console → **Firestore Database** → **Import/Export**
   - Click **Export** and select collections
   - Save to Google Cloud Storage

2. **Automated Backup (Advanced):**
   - Set up Cloud Scheduler to run daily exports
   - Requires Google Cloud Platform setup
   - See: https://firebase.google.com/docs/firestore/manage-data/export-import

### Recommended Schedule:
- **Daily:** Automated backups (if implemented)
- **Weekly:** Manual backup verification
- **Before major changes:** Always create a manual backup

---

## 9. 🧪 Security Testing

**Priority:** Low  
**Effort:** Varies  
**Benefit:** Identify vulnerabilities before attackers do

### Basic Testing (Free):

1. **OWASP ZAP:**
   - Download: https://www.zaproxy.org/
   - Run automated scan against your deployed site
   - Review and fix any findings

2. **Browser DevTools Security Audit:**
   - Open Chrome DevTools → **Lighthouse**
   - Run audit with "Best Practices" selected
   - Review security recommendations

### Professional Testing (Paid):

Consider hiring a security firm for:
- Penetration testing
- Code review
- Compliance audit (if handling sensitive data)

---

## 10. 📝 Security Incident Response Plan

**Priority:** Low  
**Effort:** 30 minutes  
**Benefit:** Faster response to security incidents

### Create a Plan:

1. **Identify Key Contacts:**
   - Who handles security incidents?
   - Who has Firebase admin access?
   - Who can deploy emergency fixes?

2. **Document Response Steps:**
   - How to disable compromised accounts
   - How to rotate Firebase credentials
   - How to roll back deployments
   - How to notify affected users

3. **Store Plan Securely:**
   - Keep in password manager or secure wiki
   - Share with all admins
   - Review quarterly

### Example Incident Response:

**If Service Account Key is Compromised:**
1. Immediately generate new key in Firebase Console
2. Update local `spvb-service-account.json`
3. Delete old key from Firebase
4. Review Firebase logs for unauthorized access
5. Notify users if data was accessed

**If Admin Account is Compromised:**
1. Reset password immediately
2. Enable 2FA if not already enabled
3. Review recent admin actions in Firebase
4. Check for unauthorized tournament/registration changes
5. Notify users if data was modified

---

## Priority Summary

### Implement Now (Before Launch):
- ✅ All items in main deployment checklist
- ✅ Run `npm audit` and fix critical/high issues

### Implement Soon (First Month):
- 🛡️ Admin route protection (15 min)
- 🔍 Set up weekly `npm audit` schedule
- 🗄️ Set up manual database backups

### Implement Later (As Needed):
- 🔐 Two-factor authentication for admins
- 🚦 Rate limiting for registrations
- 📱 Phone number validation
- 📊 Security monitoring and alerts
- 🧪 Security testing with OWASP ZAP

### Nice to Have (Optional):
- 🔒 CSP hardening with nonces
- 📝 Formal incident response plan
- 🗄️ Automated database backups

---

## Questions?

Contact: stpetevolleyball@gmail.com

Remember: **Your application is already secure enough for production.** These enhancements are optional improvements that can be implemented over time as your application grows.