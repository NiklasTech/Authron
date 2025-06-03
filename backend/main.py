from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager

from backend.api.v1 import auth, passwords, admin, user_settings, translations
from backend.database.database import engine
from backend.database.models import Base
from backend.api.v1 import (
    auth,
    passwords,
    admin,
    user_settings,
    translations,
    two_factor,
    totp,
    system_status,
    backup,
    teams,
    shared_passwords,
    policy,
    logs,
    export_import,
    password_sharing
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    # Erstelle Admin-Account falls er nicht existiert
    from backend.create_tables import init_db
    init_db()

    logger.info("Database ready")
    yield
    logger.info("Shutting down application")


app = FastAPI(
    title="Password Manager API",
    description="Secure password management API",
    version="0.1.0",
    lifespan=lifespan,
)

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1",
    "http://127.0.0.1:5173",
    # Fügen Sie Ihre lokale IP-Adresse hinzu
    "http://192.168.178.96:5173",  # Ersetzen Sie x.x mit Ihrer tatsächlichen lokalen IP
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(passwords.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(user_settings.router, prefix="/api/v1")
app.include_router(translations.router, prefix="/api/v1")
app.include_router(two_factor.router, prefix="/api/v1")
app.include_router(totp.router, prefix="/api/v1")
app.include_router(system_status.router, prefix="/api/v1")
app.include_router(backup.router, prefix="/api/v1")
app.include_router(teams.router, prefix="/api/v1")
app.include_router(shared_passwords.router, prefix="/api/v1")
app.include_router(policy.router, prefix="/api/v1")
app.include_router(logs.router, prefix="/api/v1")
app.include_router(export_import.router, prefix="/api/v1")
app.include_router(password_sharing.router, prefix="/api/v1")
@app.get("/")
async def root():
    return {"message": "Password Manager API running"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
