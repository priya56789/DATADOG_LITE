from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import SessionLocal
from app.models.event import Event

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_events = db.query(Event).count()
    total_users = db.query(func.count(func.distinct(Event.user_id))).scalar()
    total_sessions = db.query(func.count(func.distinct(Event.session_id))).scalar()

    return {
        "total_users": total_users or 0,
        "total_sessions": total_sessions or 0,
        "total_events": total_events or 0
    }


@router.get("/page-views")
def page_views(site_id: str = None, db: Session = Depends(get_db)):
    query = (
        db.query(Event.page, func.count(Event.id))
        .filter(Event.event_type == "page_view")
    )

    if site_id:
        query = query.filter(Event.site_id == site_id)

    data = query.group_by(Event.page).all()

    return [{"page": page, "views": count} for page, count in data]