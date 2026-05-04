from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import SessionLocal
from app.models.event import Event

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/track")
def track_event(data: dict, db: Session = Depends(get_db)):
    event = Event(
        site_id=data.get("site_id", "default_site"),
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

    return {"status": "tracked"}