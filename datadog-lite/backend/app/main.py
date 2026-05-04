from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base

from app.models.event import Event
from app.models.project import Project

from app.api.tracking_routes import router as tracking_router
from app.api.dashboard_routes import router as dashboard_router
from app.api.project_routes import router as project_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tracking_router)
app.include_router(dashboard_router)
app.include_router(project_router)


@app.get("/")
def root():
    return {"message": "Datadog Lite Backend Running"}


@app.get("/health")
def health():
    return {"status": "ok"}