from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from db.database import Base, engine
from routers import health, auth, posts

Base.metadata.create_all(bind=engine)

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

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(posts.router)

@app.get("/")
def root():
    return {
        "app" : settings.APP_NAME,
        "docs" : "/docs",
        "health" : "/health"
    }