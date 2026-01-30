# AI Counselor - Smart University Admissions Assistant

AI Counselor is a comprehensive, AI-driven platform designed to simplify the complex journey of international university admissions. By leveraging advanced Large Language Models (LLMs) and a modern tech stack, it provides students with personalized guidance, tailored university recommendations, and an actionable roadmap to success.

---

## 🚀 Core Features

### 1. **Personalized AI Counseling**
- **Full-Screen Interaction**: A dedicated, immersive chat interface for direct conversation with an AI counselor.
- **Context-Aware Guidance**: The AI has full access to your profile, acadmics, goals, and currently locked universities to provide precise advice.
- **Suggested Actions**: Real-time actionable prompts to keep the conversation moving and informative.

### 2. **Intelligent University Discovery**
- **Smart Classification**: Universities are automatically categorized into **Dream**, **Target**, and **Safe** based on your unique GPA, degree major, and test scores.
- **Instant Pre-fetching**: Technical optimizations (hover pre-fetch) ensure that recommendations load instantly as you browse.
- **Shortlisting & Locking**: Save interesting universities to your shortlist and "Lock" the ones you are committed to applying for.

### 3. **Dynamic Application Roadmap**
- **Stage Progression**: Automatically tracks your progress across 4 key stages:
    - **Stage 1 (Building Profile)**: Onboarding and profile setup.
    - **Stage 2 (Discovering Universities)**: Exploration of potential matches.
    - **Stage 3 (Finalizing Universities)**: Visiting shortlists and refining choices.
    - **Stage 4 (Preparing Applications)**: Starting official applications for locked universities.
- **AI Task Generation**: The system generates specific, high-priority tasks (e.g., "Draft SOP", "Register for IELTS") based on your current stage and profile gaps.

### 4. **Profile Strength Analytics**
- **Strength Meter**: Visual representation of your admission chances based on Academics, Exams, and SOP readiness.
- **Actionable Feedback**: Explains *why* your profile is strong or what specific areas need improvement.

---

## 🛠️ Project Structure

```text
AI_Counselor/
├── BackEnd/
│   └── Ai_counsellor/          # Django Backend (API & AI Logic)
└── FrontEnd/
    └── Ai-Counselor/           # React + Vite Frontend (UI/UX)
```

---

## ⚙️ Installation & Setup

### 1. Backend Setup (Django)

#### Option A: Standard Installation (venv)
1.  **Navigate to the Backend directory**:
    ```bash
    cd BackEnd/Ai_counsellor
    ```
2.  **Create a virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

#### Option B: Fast Installation (uv)
[uv](https://github.com/astral-sh/uv) is an extremely fast Python package manager.
1.  **Install dependencies and sync**:
    ```bash
    uv venv
    source .venv/bin/activate # On Windows: .venv\Scripts\activate
    uv pip install -r requirements.txt
    ```

#### Option C: Docker (Containerized)
1.  **Make sure Docker and Docker Compose are installed**.
2.  **Build and Run**:
    ```bash
    docker-compose up --build
    ```
    *Note: Ensure your `.env` file contains `DB_NAME`, `DB_USER`, and `DB_PASSWORD` for the PostgreSQL container, or provide a `DATABASE_URL` for the web service.*

#### Configuration & Run (For Options A & B)
1.  **Configure Environment Variables**:
    Create a `.env` file in `BackEnd/Ai_counsellor/`:
    ```env
    SECRET_KEY=your_django_secret_key
    DEBUG=True
    GROQ_API_KEY=your_groq_api_key
    EMAIL_HOST_USER=your_email@gmail.com
    EMAIL_HOST_PASSWORD=your_app_password
    DATABASE_URL=postgres://user:password@host:port/dbname # Optional
    CORS_ALLOWED_ORIGINS=http://localhost:5173
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    ```
2.  **Run Migrations**:
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```
3.  **Start the Server**:
    ```bash
    python manage.py runserver
    ```

### 2. Frontend Setup (React + Vite)

1.  **Navigate to the Frontend directory**:
    ```bash
    cd FrontEnd/Ai-Counselor
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment Variables**:
    Create a `.env` file in `FrontEnd/Ai-Counselor/`:
    ```env
    VITE_API_BASE_URL="http://127.0.0.1:8000"
    ```
4.  **Start the Development Server**:
    ```bash
    npm run dev
    ```

---

## 🧪 Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Tailus UI, Lucide React.
- **Backend**: Django, Django REST Framework.
- **AI Platform**: Groq (LLM API), LangGraph (Workflow orchestration).
- **Database**: PostgreSQL (Production), SQLite (Local/Development).
- **Icons**: Lucide React.
- **Typography**: Inter / Modern Sans-serif.

---

## 🏛️ Layout Rules & Aesthetics
- **Full Immersion**: AI Counselor page is purposefully designed without global headers/footers for a focused experience.
- **Responsive Design**: Mobile-first approach for all dashboard components and application forms.
- **Dark Mode Support**: Seamless transition between light and dark themes using a custom `ThemeProvider`.
