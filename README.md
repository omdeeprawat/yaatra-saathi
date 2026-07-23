# Yaatra Saathi

Yaatra Saathi is an AI-powered companion app for the Nanda Devi Raj Jat Yatra. It combines a FastAPI backend, a React + Vite frontend, and a knowledge-driven chat experience to help pilgrims explore the route, read stories, manage community posts, and access yatra information in one place.

## What it does

- AI chat assistant for pilgrimage guidance and route knowledge
- Interactive route map and yatra stop details
- Community feed with posts, comments, likes, and replies
- Story browsing with dedicated story detail pages
- Authentication with email/password, OTP verification, refresh tokens, and Google OAuth support
- Admin tools for document upload, ingestion, and knowledge-base monitoring
- Health and readiness checks for database, Redis, vector store, and LLM configuration

## Tech Stack

### Backend

- FastAPI
- SQLAlchemy + Alembic
- PostgreSQL
- Redis + Celery
- ChromaDB / LangChain / LangGraph for RAG
- Groq or OpenAI-compatible LLM support
- Cloudinary for image uploads
- EmailJS for email delivery

### Frontend

- React 19 + TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- Zustand
- Leaflet / React Leaflet

## Repository Structure

```text
yaatra-saathi/
├── README.md
├── backend/
│   ├── alembic/                  # Database migrations
│   ├── core/                     # Settings, security, dependencies, rate limiting
│   ├── db/                       # Database session and engine setup
│   ├── models/                   # SQLAlchemy models
│   ├── rag/                      # Ingestion, vector store, and agent logic
│   ├── routers/                  # FastAPI route modules
│   ├── schemas/                  # Pydantic request/response schemas
│   ├── services/                 # Business logic and seed helpers
│   ├── tasks/                    # Celery background tasks
│   ├── tests/                    # API contract tests
│   ├── main.py                   # FastAPI app entrypoint
│   └── pyproject.toml / requirements.txt
└── frontend/
	├── public/
	├── src/
	│   ├── assets/               # Images and static assets
	│   ├── components/           # Shared UI components and layout
	│   ├── context/              # Auth and theme providers
	│   ├── hooks/                # Custom React hooks
	│   ├── pages/                # Route-level screens
	│   ├── services/             # API client and data access
	│   ├── store/                # Client state management
	│   ├── types/                # Shared TypeScript types
	│   └── utils/                # Utility helpers
	├── package.json
	└── vite.config.ts
```

## Main Features by Area

### Public site

- Landing page with project overview and feature highlights
- Public feed preview and story previews
- Route/map discovery for yatra stops

### Authentication

- Register, login, OTP verification, and profile update flow
- Google OAuth callback support
- Protected route handling on the frontend

### Community

- Post creation and deletion
- Comment threads, replies, and likes
- Community feed browsing with pagination

### Chat and RAG

- Streaming AI chat responses
- Knowledge-base ingestion and status tracking
- Chat session history and export support

### Admin

- Admin-only document upload
- Ingestion trigger and knowledge-base status view
- System-level dashboard with readiness checks

## Backend Folder Overview

- `backend/main.py`: creates the FastAPI app and mounts all routers
- `backend/core/`: application settings, auth helpers, and middleware support
- `backend/db/`: database connection setup
- `backend/models/`: users, posts, stories, comments, chat sessions, and stops
- `backend/routers/`: HTTP endpoints for auth, chat, posts, stories, map, upload, admin, health, and comments
- `backend/services/`: business logic for auth, posts, comments, chat, uploads, and data seeding
- `backend/rag/`: ingestion pipeline, vector store, multi-agent logic, and source documents
- `backend/tasks/`: Celery jobs for email and RAG processing
- `backend/alembic/`: migration history

## Frontend Folder Overview

- `frontend/src/pages/`: page screens such as Home, Login, Register, Dashboard, Chat, Map, Feed, Stories, Profile, and Admin
- `frontend/src/components/`: reusable UI and layout components
- `frontend/src/context/`: auth and theme providers
- `frontend/src/services/`: API client and endpoint wrappers
- `frontend/src/hooks/`: shared React hooks
- `frontend/src/types/`: TypeScript models shared across the app

## Prerequisites

- Python 3.12+
- Node.js 20+
- npm or pnpm
- PostgreSQL
- Redis

Optional but recommended for full AI features:

- Groq API key or OpenAI API key
- Cloudinary credentials for image uploads
- EmailJS service/template keys for email delivery
- Google OAuth client credentials

## Environment Variables

Create a `backend/.env` file with the following values:

```env
APP_NAME=Yaatra Saathi
DEBUG=true
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@localhost:5432/yaatra_saathi
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
OPENAI_API_KEY=
GROQ_API_KEY=
EMAILJS_API_URL=https://api.emailjs.com/api/v1.0/email/send
EMAILJS_SERVICE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=
EMAILJS_OTP_TEMPLATE_ID=
EMAILJS_WELCOME_TEMPLATE_ID=
EMAILJS_FROM_NAME=Yatra Saathi
EMAILJS_FROM_EMAIL=onboarding@resend.dev
AI_PROVIDER=groq
CHROMA_DB_PATH=./chroma_db
CHROMA_COLLECTION=yatra_knowledge
RAG_CHUNK_SIZE=800
RAG_CHUNK_OVERLAP=150
RAG_TOP_K=5
CHAT_MODEL=llama-3.3-70b-versatile
EMBED_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

## Clone the Repository

```bash
git clone https://github.com/<your-username>/yaatra-saathi.git
cd yaatra-saathi
```

## Run the Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend URLs:

- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://localhost:5173`

## Run the Full App Locally

1. Start PostgreSQL and Redis.
2. Configure `backend/.env`.
3. Run the backend on port `8000`.
4. Run the frontend on port `5173`.
5. Open the frontend in your browser and sign in or register.

## Available Backend Routes

- `GET /health` and `GET /health/ready`
- `POST /auth/register`, `POST /auth/login`, `POST /auth/verify-otp`, `POST /auth/resend-otp`, `POST /auth/refresh`, `POST /auth/logout`
- `GET /auth/me`, `PATCH /auth/profile`, `GET /auth/google`, `GET /auth/google/callback`
- `GET /posts`, `POST /posts`, `DELETE /posts/{post_id}`
- `GET /posts/{post_id}/comments`, `POST /posts/{post_id}/comments`, comment likes and replies
- `GET /stories`, `GET /stories/{slug}`, `GET /stories/preview/{slug}`
- `GET /map/stops`, `GET /map/stops/{stop_id}`
- `GET /chat/status`, `POST /chat/stream`, `POST /chat/ingest-document`
- `GET /chat/sessions`, `GET /chat/history/{session_id}`, `DELETE /chat/session/{session_id}`
- `POST /upload/image`
- `POST /admin/upload-document`, `POST /admin/ingest`, `GET /admin/documents`, `GET /admin/ingestion-status`

## Notes

- The frontend uses `/api` as its API base path, so you may need a proxy or reverse proxy in development depending on your setup.
- Google OAuth, EmailJS, Cloudinary, and Groq/OpenAI features are optional but required for the full experience.
- The `backend/chroma_db/` directory stores local vector data for the RAG pipeline.

## License

Add your preferred license here before publishing to GitHub.
