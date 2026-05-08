from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)

    site_id = Column(String)
    user_id = Column(String)

    event_type = Column(String)
    page = Column(String)
    full_url = Column(String)
    referrer = Column(String)

    browser = Column(String)
    device = Column(String)

    timestamp = Column(DateTime, default=datetime.utcnow)