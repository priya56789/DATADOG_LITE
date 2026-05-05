from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import SessionLocal
from app.models.event import Event
from app.models.project import Project

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/track")
def track_event(
    data: dict,
    db: Session = Depends(get_db),
    x_api_key: str = Header(None)
):
    site_id = data.get("site_id", "ecommerce_app")

    # TEMPORARY SAFE DEFAULT so tracking works
    api_key = x_api_key or data.get("api_key") or "demo_key"

    project = db.query(Project).filter(Project.site_id == site_id).first()

    if not project:
        project = Project(
            project_name=site_id,
            site_id=site_id,
            api_key=api_key
        )
        db.add(project)
        db.commit()
        db.refresh(project)

    event = Event(
        site_id=site_id,
        user_id=data.get("user_id", "anonymous"),
        event_type=data.get("event_type", "page_view"),
        page=data.get("page", "/"),
        full_url=data.get("full_url", ""),
        referrer=data.get("referrer", "direct"),
        browser=data.get("browser", ""),
        device=data.get("device", ""),
        timestamp=datetime.utcnow()
    )

    db.add(event)
    db.commit()

    return {
        "status": "tracked",
        "site_id": site_id
    }


@router.get("/track-debug")
def track_debug():
    return {
        "message": "tracking_routes updated",
        "version": "no_401_debug_v1"
    }