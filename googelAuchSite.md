# Google Authentication Deployment Guide

If you are deploying this application to a production server (e.g., Vercel, Heroku, AWS), you **MUST** update all hardcoded URLs and Google Cloud Console settings.

## 1. Google Cloud Console Configuration

Go to [Google Cloud Console](https://console.cloud.google.com/) -> APIs & Services -> Credentials.

### Authorized JavaScript Origins
- `http://localhost:5173` (Development)
- `https://your-frontend-domain.com` (Production)

### Authorized Redirect URIs
- `http://127.0.0.1:8000/accounts/google/login/callback/` (Development)
- `https://your-backend-api.com/accounts/google/login/callback/` (Production)

---

## 2. Backend Changes (`BackEnd/Ai_counsellor/`)

### [settings.py](file:///c:/Users/go880/Desktop/Hackathon/AI_Counselor/BackEnd/Ai_counsellor/Ai_counselor/settings.py)
Change these to your production URLs:
```python
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
]

LOGIN_REDIRECT_URL = '/api/auth/google/callback/' # Relative is fine
LOGOUT_REDIRECT_URL = 'https://your-frontend-domain.com'
```

### [api/views.py](file:///c:/Users/go880/Desktop/Hackathon/AI_Counselor/BackEnd/Ai_counsellor/api/views.py)
Update the frontend URL in `google_login_callback`:
```python
# From:
frontend_url = f"http://127.0.0.1:5173/login?access={access_token}&refresh={refresh_token}"
# To:
frontend_url = f"https://your-frontend-domain.com/login?access={access_token}&refresh={refresh_token}"
```

### Templates (`templates/`)
Update the "Back to Login" or "Cancel" links in:
- `templates/socialaccount/login.html`
- `templates/socialaccount/login_cancelled.html`
- `templates/socialaccount/authentication_error.html`
- `templates/account/login.html`
- `templates/account/signup.html`
- `templates/account/logout.html`

Replace `http://127.0.0.1:5173` with `https://your-frontend-domain.com`.

---

## 3. Frontend Changes (`FrontEnd/Ai-Counselor/`)

### [src/api.js](file:///c:/Users/go880/Desktop/Hackathon/AI_Counselor/FrontEnd/Ai-Counselor/src/api.js)
```javascript
const API_BASE_URL = 'https://your-backend-api.com/api';
```

### [src/components/Auth/Login.jsx](file:///c:/Users/go880/Desktop/Hackathon/AI_Counselor/FrontEnd/Ai-Counselor/src/components/Auth/Login.jsx)
Update the Google login trigger URL:
```javascript
// From:
window.location.href = 'http://127.0.0.1:8000/accounts/google/login/'
// To:
window.location.href = 'https://your-backend-api.com/accounts/google/login/'
```

---

## 4. Environment Variables
Ensure your `.env` on the production server has the correct production values for:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SECRET_KEY`
- `DEBUG=False`
