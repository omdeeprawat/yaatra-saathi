from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from core.config import settings
from routers import health, auth, posts, upload, stories

import models 

app = FastAPI(
    title = "yaatra-saathi",
    description = "ai-powered yaata companion app for Nanda Devi Raj Jat Yatra",
    version = "1.0.0",
    docs_url = "/docs",
    redoc_url = "/redoc"
)

# C0RS handling
app.add_middleware(
    CORSMiddleware,
    allow_origins = [settings.FRONTEND_URL],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

app.add_middleware(
    SessionMiddleware, 
    secret_key = settings.SECRET_KEY, 
    same_site="lax", 
    https_only = False
)

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(upload.router)
app.include_router(stories.router)

@app.get("/")
def root():
    return {
        "app" : settings.APP_NAME,
        "docs" : "/docs",
        "redoc" : "/redoc",
        "health" : "/health",
        "version" : "1.0.0"
    }

