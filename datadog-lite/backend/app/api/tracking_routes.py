from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import SessionLocal
from app.models.event import Event
from app.config import VALID_API_KEYS

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
    # 🔐 API KEY VALIDATION
    if not x_api_key or x_api_key not in VALID_API_KEYS:
        raise HTTPException(status_code=401, detail="Invalid API Key")

    # Optional: validate site_id matches API key
    expected_site = VALID_API_KEYS[x_api_key]
    if data.get("site_id") != expected_site:
        raise HTTPException(status_code=403, detail="Site ID mismatch")

    event = Event(
        site_id=data.get("site_id"),
        user_id=data.get("user_id"),
        event_type=data.get("event_type"),
        page=data.get("page"),
        full_url=data.get("full_url"),
        referrer=data.get("referrer"),
        browser=data.get("browser"),
        device=data.get("device"),
        timestamp=datetime.utcnow()
    )

    db.add(event)
    db.commit()

    return {"status": "tracked"}