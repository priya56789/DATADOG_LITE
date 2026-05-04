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
def get_stats(site_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Event)

    if site_id:
        query = query.filter(Event.site_id == site_id)

    total_events = query.count()

    total_users = (
        db.query(func.count(func.distinct(Event.user_id)))
        .filter(Event.site_id == site_id if site_id else True)
        .scalar()
    )

    total_page_views = (
        db.query(Event)
        .filter(Event.event_type == "page_view")
        .filter(Event.site_id == site_id if site_id else True)
        .count()
    )

    total_clicks = (
        db.query(Event)
        .filter(Event.event_type == "click")
        .filter(Event.site_id == site_id if site_id else True)
        .count()
    )

    return {
        "total_users": total_users or 0,
        "total_events": total_events,
        "total_page_views": total_page_views,
        "total_clicks": total_clicks
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


@router.get("/sites")
def get_sites(db: Session = Depends(get_db)):
    data = db.query(Event.site_id).distinct().all()
    return [{"site_id": site[0]} for site in data]


@router.get("/recent-events")
def recent_events(site_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Event)

    if site_id:
        query = query.filter(Event.site_id == site_id)

    events = query.order_by(Event.timestamp.desc()).limit(20).all()

    return [
        {
            "site_id": e.site_id,
            "user_id": e.user_id,
            "event_type": e.event_type,
            "page": e.page,
            "full_url": e.full_url,
            "referrer": e.referrer,
            "device": e.device,
            "timestamp": e.timestamp
        }
        for e in events
    ]
    from app.config import VALID_PROJECTS

@router.get("/projects")
def get_projects():
    return [
        {
            "site_id": site_id,
            "name": details["name"]
        }
        for site_id, details in VALID_PROJECTS.items()
    ]