# Deployment Guide

This document covers deploying **Yaatra Saathi** with the production stack:

| Component | Platform  | Live URL |
|-----------|-----------|----------|
| Frontend  | Vercel    | [https://yaatra-saathi.vercel.app](https://yaatra-saathi.vercel.app/) |
| Backend   | Render    | `https://<your-service>.onrender.com` (set after deploy) |
| Database  | Supabase (PostgreSQL) | — |
| Redis     | Render Redis or Upstash | — |
| Celery    | Render Background Worker (optional) | — |

---

## Migrating from Railway

If your Railway free trial has expired, move the backend to Render. Supabase (database) and Vercel (frontend) are unaffected.

### What breaks when Railway stops

- API requests from the frontend fail (login, chat, feed, map data)
- Redis/Celery on Railway stop (OTP emails, background ingestion)
- ChromaDB vector data on Railway is lost unless you exported it first

### Migration checklist

1. **Export env vars from Railway** (Dashboard → your service → Variables). Copy every value — you will paste them into Render.

2. **Create Render services** (see [§ 2. Render](#2-render-backend) below):
   - Web service (`yaatra-api`)
   - Redis (`yaatra-redis`) or use [Upstash](https://upstash.com) free tier
   - Optional: Celery worker for email + ingestion

3. **Set production env vars on Render:**

   ```env
   FRONTEND_URL=https://yaatra-saathi.vercel.app
   GOOGLE_REDIRECT_URI=https://<your-render-service>.onrender.com/auth/google/callback
   DEBUG=false
   ```

   Keep the same `DATABASE_URL` (Supabase) — no database migration needed.

4. **Update Vercel** (Project → Settings → Environment Variables):

   ```env
   VITE_API_URL=https://<your-render-service>.onrender.com
   ```

   Redeploy the frontend after saving (Deployments → Redeploy).

5. **Update Google OAuth** (Google Cloud Console → Credentials):
   - Authorized redirect URI: `https://<your-render-service>.onrender.com/auth/google/callback`

6. **Run migrations** (included in Render build command, or manually):

   ```bash
   cd backend && alembic upgrade head
   ```

7. **Re-ingest RAG documents** — ChromaDB does not transfer from Railway. After deploy, log in as admin and trigger ingestion from the Admin panel, or call `POST /admin/ingest`.

8. **Verify:**

   ```bash
   curl https://<your-render-service>.onrender.com/health
   curl https://<your-render-service>.onrender.com/health/ready
   ```

   Then smoke-test [yaatra-saathi.vercel.app](https://yaatra-saathi.vercel.app/) — register/login, chat, map.

### Free-tier alternatives if Render limits are tight

| Need | Free option |
|------|-------------|
| Redis | [Upstash](https://upstash.com) — 10k commands/day free |
| Backend | Render free web service (spins down after 15 min idle; ~30–60s cold start) |
| Celery | Skip initially — OTP emails can run synchronously in dev; for prod, add Render worker later |

---

## Architecture at a glance

```text
                    ┌─────────────────┐
                    │  Vercel (CDN)   │
                    │  React SPA      │
                    └────────┬────────┘
                             │ HTTPS
                             ▼
                    ┌─────────────────┐
                    │  Render Web     │
                    │  FastAPI        │
                    └──┬──────┬───┬───┘
                       │      │   │
           ┌───────────┘      │   └──────────────┐
           ▼                  ▼                  ▼
   ┌──────────────┐   ┌─────────────┐   ┌─────────────┐
   │  Supabase    │   │   Redis     │   │  ChromaDB   │
   │  PostgreSQL  │   │  (Render/   │   │  (local FS  │
   │              │   │   Upstash)  │   │  on Render) │
   └──────────────┘   └──────┬──────┘   └─────────────┘
                             │
                      ┌──────▼──────┐
                      │ Celery      │
                      │ Worker      │
                      └─────────────┘
```

External services: **Groq** (LLM), **Cloudinary** (images), **EmailJS** (email), **Google OAuth**.

---

## 1. Supabase (PostgreSQL)

### Create the database

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → Database**.
3. Copy the **Connection string (URI)** under *Connection pooling* or *Direct connection*.

### Connection string format

Supabase provides:

```text
postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

Convert for SQLAlchemy (required by this app):

```text
postgresql+psycopg2://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

Use this as `DATABASE_URL` on Render.

> **Tip:** Prefer the **transaction pooler** (port `6543`) for serverless/stateless web services. Use the direct connection (port `5432`) only if you need session-level features during migrations.

### Run migrations

Run once locally against the Supabase URL, or as part of the Render build command:

```bash
cd backend
alembic upgrade head
```

### Seed data (optional)

Yatra stops and stories can be seeded via the backend services (`backend/services/seed_stories.py`) if needed after first deploy.

---

## 2. Render (Backend)

### Services to create

| Service type          | Name (example)     | Purpose                    |
|-----------------------|--------------------|----------------------------|
| Web Service           | `yaatra-api`       | FastAPI / Uvicorn          |
| Background Worker     | `yaatra-celery`    | Email + RAG ingestion    |
| Redis                 | `yaatra-redis`     | Broker, cache, rate limits |

You can use [Upstash Redis](https://upstash.com) instead of Render Redis — set `REDIS_URL` accordingly.

### Web service settings

| Setting            | Value                                              |
|--------------------|----------------------------------------------------|
| Root Directory     | `backend`                                          |
| Runtime            | Python 3.12                                        |
| Build Command      | `pip install -r requirements.txt && alembic upgrade head` |
| Start Command      | `uvicorn main:app --host 0.0.0.0 --port $PORT`     |
| Health Check Path  | `/health`                                          |

Alternatively, use the included **`render.yaml`** Blueprint at the repo root for infrastructure-as-code.

### Celery worker settings

| Setting            | Value                                              |
|--------------------|----------------------------------------------------|
| Root Directory     | `backend`                                          |
| Build Command      | `pip install -r requirements.txt`                  |
| Start Command      | `celery -A celery_app worker --loglevel=info`      |

### Backend environment variables (Render)

Set these in the Render dashboard for **both** the web service and Celery worker:

```env
# App
APP_NAME=Yaatra Saathi
DEBUG=false
FRONTEND_URL=https://yaatra-saathi.vercel.app

# Database (Supabase)
DATABASE_URL=postgresql+psycopg2://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres

# Redis
REDIS_URL=redis://red-xxxxx:6379

# JWT
SECRET_KEY=<long-random-string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://your-api.onrender.com/auth/google/callback

# Email (EmailJS)
EMAILJS_API_URL=https://api.emailjs.com/api/v1.0/email/send
EMAILJS_SERVICE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=
EMAILJS_OTP_TEMPLATE_ID=
EMAILJS_WELCOME_TEMPLATE_ID=
EMAILJS_FROM_NAME=Yaatra Saathi
EMAILJS_FROM_EMAIL=your@email.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# AI / RAG
AI_PROVIDER=groq
GROQ_API_KEY=
CHROMA_DB_PATH=./chroma_db
CHROMA_COLLECTION=yatra_knowledge
RAG_CHUNK_SIZE=800
RAG_CHUNK_OVERLAP=150
RAG_TOP_K=5
CHAT_MODEL=llama-3.3-70b-versatile
EMBED_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### ChromaDB on Render

The vector store uses a **local persistent directory** (`CHROMA_DB_PATH`). On Render:

- Ephemeral filesystem is wiped on redeploy unless you attach a **Persistent Disk**.
- After each fresh deploy, trigger ingestion via the **Admin panel** (`POST /admin/ingest`) or run ingestion locally and upload the `chroma_db` folder.

**Recommended:** Add a Render persistent disk mounted at `/opt/render/project/src/chroma_db` and set:

```env
CHROMA_DB_PATH=/opt/render/project/src/chroma_db
```

### Production cookie settings

In `backend/routers/auth.py`, ensure refresh cookies use HTTPS in production:

```python
secure=True   # when FRONTEND_URL and backend use HTTPS
```

Update `SessionMiddleware` in `main.py` similarly:

```python
https_only=True
```

### CORS

`FRONTEND_URL` must exactly match your Vercel deployment URL (no trailing slash). The backend reads this in `main.py` for CORS `allow_origins`.

---

## 3. Vercel (Frontend)

### Project settings

| Setting            | Value                    |
|--------------------|--------------------------|
| Root Directory     | `frontend`               |
| Framework Preset   | Vite                     |
| Build Command      | `npm run build`          |
| Output Directory   | `dist`                   |
| Install Command    | `npm install`            |

`frontend/vercel.json` already configures SPA rewrites so client-side routes work.

### Frontend environment variables (Vercel)

| Variable        | Example                              | Environments   |
|-----------------|--------------------------------------|----------------|
| `VITE_API_URL`  | `https://your-api.onrender.com`      | Production, Preview |

> Do **not** include a trailing slash on `VITE_API_URL`.

Redeploy after changing environment variables — Vite bakes them in at build time.

### Google OAuth (frontend callback)

The backend redirects to `{FRONTEND_URL}/auth/callback` after Google login. Ensure:

1. Google Cloud Console **Authorized redirect URI** includes `https://your-api.onrender.com/auth/google/callback`.
2. `FRONTEND_URL` on Render matches your Vercel URL.

---

## 4. Post-deploy checklist

### Health checks

```bash
curl https://your-api.onrender.com/health
curl https://your-api.onrender.com/health/ready
```

`/health/ready` returns `200` only when database, Redis, Groq key, and vector store (with chunks) are all healthy.

### Smoke tests

1. Open the Vercel URL — landing page loads.
2. Register a new account — OTP email arrives (EmailJS).
3. Verify OTP and log in — dashboard accessible.
4. Open **Chat** — streaming response completes.
5. Open **Map** — yatra stops render.
6. Create a post with image — Cloudinary upload succeeds.
7. (Admin) Upload a document and trigger ingestion — chunk count increases in `/chat/status`.

See `backend/RELEASE_CHECKLIST.md` for the full release gate list.

---

## 5. Redeploying updates

### Backend (Render)

Push to the connected Git branch. Render rebuilds automatically, or trigger **Manual Deploy** from the dashboard.

If migrations changed:

```bash
# Build command already runs: alembic upgrade head
```

### Frontend (Vercel)

Push to the connected Git branch. Vercel rebuilds on every push to `main` (or your configured production branch).

### Database migrations only

```bash
cd backend
DATABASE_URL="postgresql+psycopg2://..." alembic upgrade head
```

---

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| CORS errors in browser | `FRONTEND_URL` mismatch | Set exact Vercel URL on Render |
| 401 on all API calls | Wrong `VITE_API_URL` or expired token | Rebuild frontend; clear localStorage |
| `/health/ready` → 503, `vector_store: false` | ChromaDB empty after redeploy | Run admin ingestion or attach persistent disk |
| Google OAuth redirect error | Redirect URI mismatch | Update Google Console + `GOOGLE_REDIRECT_URI` |
| Refresh token not sent | Cookie `secure` flag on HTTP | Use HTTPS everywhere; set `secure=True` only with HTTPS |
| Chat streams fail | Missing `GROQ_API_KEY` | Add key on Render and redeploy |
| OTP emails not sent | EmailJS misconfiguration | Verify service/template IDs and keys |
| DB connection errors | Wrong Supabase URL or pooler mode | Use `postgresql+psycopg2://` prefix; check password |

---

## 7. Optional: render.yaml Blueprint

The repo includes `render.yaml` for declarative setup. To use it:

1. In Render, choose **New → Blueprint**.
2. Connect the GitHub repository.
3. Review generated services and fill in secret env vars marked `sync: false`.
4. Apply the Blueprint.

---

## 8. Cost notes

- **Supabase** — Free tier includes PostgreSQL; monitor connection limits with pooler.
- **Render** — Web service + Redis + worker may exceed free tier; free web services spin down after inactivity (cold starts ~30–60s).
- **Vercel** — Hobby tier sufficient for personal projects.
- **Groq** — Free tier with rate limits; monitor usage.
- **Cloudinary / EmailJS** — Free tiers available with quotas.
