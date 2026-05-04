from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Database
from app.database import engine, Base

# Models (IMPORTANT: import all models so tables get created)
from app.models.event import Event
from app.models.project import Project

# Routes
from app.api.tracking_routes import router as tracking_router
from app.api.dashboard_routes import router as dashboard_router
from app.api.project_routes import router as project_router
from app.api.project_routes import router as project_router
app.include_router(project_router)

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize app
app = FastAPI()

# Enable CORS (allow frontend + external sites)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(tracking_router)
app.include_router(dashboard_router)
app.include_router(project_router)

# Root API
@app.get("/")
def root():
    return {"message": "Datadog Lite Backend Running 🚀"}

# Health check
@app.get("/health")
def health():
    return {"status": "ok"}