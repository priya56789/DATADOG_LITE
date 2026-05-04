from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import SessionLocal
from app.models.event import Event
from app.config import VALID_PROJECTS

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
    site_id = data.get("site_id")

    if not site_id:
        raise HTTPException(status_code=400, detail="site_id is required")

    if site_id not in VALID_PROJECTS:
        raise HTTPException(status_code=403, detail="Unknown site_id")

    expected_key = VALID_PROJECTS[site_id]["api_key"]

    if not x_api_key or x_api_key != expected_key:
        raise HTTPException(status_code=401, detail="Invalid API key")

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