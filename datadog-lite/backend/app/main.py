from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base

# Import models
from app.models.event import Event
from app.models.project import Project

# Import routers
from app.api.tracking_routes import router as tracking_router
from app.api.dashboard_routes import router as dashboard_router
from app.api.project_routes import router as project_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Datadog Lite Backend Debug")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(tracking_router)
app.include_router(dashboard_router)
app.include_router(project_router)


@app.get("/")
def root():
    return {
        "message": "Datadog Lite Backend Running",
        "debug_version": "main_debug_v2",
        "routers_loaded": [
            "tracking_routes",
            "dashboard_routes",
            "project_routes"
        ]
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "debug_version": "main_debug_v2"
    }


@app.get("/debug-routes")
def debug_routes():
    routes = []

    for route in app.routes:
        routes.append({
            "path": route.path,
            "name": route.name,
            "methods": list(route.methods) if hasattr(route, "methods") else []
        })

    return {
        "debug_version": "main_debug_v2",
        "routes": routes
    }