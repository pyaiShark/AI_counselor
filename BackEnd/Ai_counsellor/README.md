# AI Counselor - Smart University Admissions Assistant (Backend)

Welcome to the **AI Counselor** backend repository. This is a high-performance AI-driven platform designed to guide students through the complex process of international university admissions. It uses advanced Large Language Models (via Groq) to provide personalized counseling, task generation, and university shortlisting.

---

## 🚀 Key Features

### 1. **AI-Powered University Recommendations**
- **Dynamic Classification**: Categorizes universities into **Dream**, **Target**, and **Safe** based on the user's specific GPA, degree, and exam scores.
- **Smart Caching**: Implements a "Classify Once, Cache All" logic that reduces AI token usage by **80%**. The backend classifies a large pool of universities in one go and serves them via an optimized pagination layer.

### 2. **Intelligent Task Generation**
- Automatically generates high-priority, actionable tasks (e.g., "Draft SOP intro", "Improve GRE score", "Research Canadian visas") based on the student's current stage and profile completeness.

### 3. **Profile Strength Assessment**
- Instantly evaluates a student's profile across three pillars: **Academics**, **Exams**, and **SOP Readiness**.

### 4. **Performance & Optimization**
- **Hover Prefetch Support**: Optimized endpoints to support frontend "instant load" patterns.
- **Cache Invalidation**: Automatically clears AI caches when a user updates their profile data, ensuring counseling results are always fresh.

---

## 🚶‍♂️ Full Walkthrough

1.  **Onboarding**: User provides Academic Background -> Study Goals -> Budget -> Exam Readiness.
2.  **Dashboard**: AI analyzes the profile and displays a **Strength Meter** and a list of **Personalized Tasks**.
3.  **University Discovery**: The user hovers over the University Shortlist card (triggering a background prefetch). 
4.  **Shortlisting**: The user views categorized recommendations and can "Lock" their top choice.

---

## ⚙️ Setup Guide

### 1. Environment Variables
Create a `.env` file in the root directory:
```env
DEBUG=True
SECRET_KEY=your_django_secret_key
GROQ_API_KEY=your_groq_api_key
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_google_app_password
```

### 2. Installation & Run
```bash
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

---

## 🛠️ Integration Guides (Legacy & Tutorials)

### Creating an App Password for Your Google Account
If you have Two-Factor Authentication (2FA) enabled on your Google account, you will need to generate an App Password to allow Django to access your Gmail securely.

1.  **Step 1: Enable 2FA**: Go to [Google Account settings](https://myaccount.google.com) > Security > 2-Step Verification.
2.  **Step 2: Create App Password**: In Security tab, locate **App passwords**. Click it and choose **Other (Custom name)**, enter "Django Email".
3.  **Step 3: Generate & Copy**: Click **Generate**, copy the 16-character code.
4.  **Step 4: Update .env**: Use this code as your `EMAIL_HOST_PASSWORD`.

### Google Login Integration
This section describes how to enable Google login in your Django application.

1.  **Step 1: Obtain API Credentials**: Visit [Google Developers Console](https://console.developers.google.com/).
    - Create a New Project.
    - Enable **Google People API**.
    - Create **OAuth 2.0 Client IDs** (Type: Web application).
    - Add Redirect URI: `http://localhost:8000/accounts/google/login/callback/`.
2.  **Step 2: Update Your .env**: Add your **Client ID** and **Client Secret** to your environment file.
