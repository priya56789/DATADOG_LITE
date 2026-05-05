from datetime import datetime, timedelta

@router.get("/active-users")
def active_users(site_id: str = None, db: Session = Depends(get_db)):
    five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)

    query = db.query(Event).filter(Event.timestamp >= five_minutes_ago)

    if site_id:
        query = query.filter(Event.site_id == site_id)

    active_count = query.with_entities(
        func.count(func.distinct(Event.user_id))
    ).scalar()

    return {
        "active_users": active_count or 0
    }