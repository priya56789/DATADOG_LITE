from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import SessionLocal
from app.models.user import User
from app.models.session import Session as UserSession
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
    try:
        total_users = db.query(User).count()
        total_sessions = db.query(UserSession).count()
        total_events = db.query(Event).count()

        return {
            "total_users": total_users,
            "total_sessions": total_sessions,
            "total_events": total_events
        }

    except Exception as e:
        return {
            "error": str(e),
            "total_users": 0,
            "total_sessions": 0,
            "total_events": 0
        }


@router.get("/page-views")
def page_views(site_id: str = None, db: Session = Depends(get_db)):
    try:
        query = (
            db.query(Event.page, func.count(Event.id))
            .filter(Event.event_type == "page_view")
        )

        if site_id:
            query = query.filter(Event.site_id == site_id)

        data = query.group_by(Event.page).all()

        return [{"page": page, "views": count} for page, count in data]

    except Exception as e:
        return [{"error": str(e)}]