from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import secrets
import re

from app.database import SessionLocal
from app.models.project import Project

router = APIRouter(prefix="/projects", tags=["Projects"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def make_site_id(project_name: str):
    site_id = project_name.lower()
    site_id = re.sub(r"[^a-z0-9]+", "_", site_id)
    site_id = site_id.strip("_")
    return site_id


@router.post("/create")
def create_project(data: dict, db: Session = Depends(get_db)):
    project_name = data.get("project_name")

    if not project_name:
        return {"error": "project_name is required"}

    site_id = make_site_id(project_name)
    api_key = secrets.token_hex(24)

    existing = db.query(Project).filter(Project.site_id == site_id).first()

    if existing:
        return {
            "error": "Project already exists",
            "site_id": existing.site_id,
            "api_key": existing.api_key
        }

    project = Project(
        project_name=project_name,
        site_id=site_id,
        api_key=api_key
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    integration_script = f"""
<script>
  window.SITE_ID = "{site_id}";
  window.DATADOG_LITE_API_KEY = "{api_key}";
</script>

<script src="https://datadog-lite.vercel.app/tracker.js"></script>
"""

    return {
        "message": "Project created successfully",
        "project_name": project.project_name,
        "site_id": project.site_id,
        "api_key": project.api_key,
        "integration_script": integration_script
    }


@router.get("/")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()

    return [
        {
            "project_name": p.project_name,
            "site_id": p.site_id,
            "api_key": p.api_key,
            "created_at": p.created_at
        }
        for p in projects
    ]