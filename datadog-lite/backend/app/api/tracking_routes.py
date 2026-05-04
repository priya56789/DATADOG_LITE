from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.models.session import Session as UserSession
from app.models.event import Event
from datetime import datetime

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/track")
def track_event(data: dict, db: Session = Depends(get_db)):
    user = User(name="guest")
    db.add(user)
    db.commit()
    db.refresh(user)

    session = UserSession(user_id=user.id)
    db.add(session)
    db.commit()
    db.refresh(session)

    event = Event(
        user_id=user.id,
        session_id=session.id,
        site_id=data.get("site_id", "default_site"),
        event_type=data.get("event_type", "page_view"),
        page=data.get("page", "/home"),
        timestamp=datetime.utcnow()
    )

    db.add(event)
    db.commit()

    return {"status": "tracked"}