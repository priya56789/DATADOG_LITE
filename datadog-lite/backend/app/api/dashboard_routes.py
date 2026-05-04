from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import SessionLocal
from app.models.user import User
from app.models.session import Session as UserSession
from app.models.event import Event

router = APIRouter(prefix="/dashboard")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return {
        "total_users": db.query(User).count(),
        "total_sessions": db.query(UserSession).count(),
        "total_events": db.query(Event).count()
    }


@router.get("/page-views")
def page_views(site_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Event.page, func.count(Event.id)) \
              .filter(Event.event_type == "page_view")

    if site_id:
        query = query.filter(Event.site_id == site_id)

    data = query.group_by(Event.page).all()

    return [{"page": p, "views": c} for p, c in data]