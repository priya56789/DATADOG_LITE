from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import secrets
import re

from app.database import SessionLocal
from app.models.project import Project

router = APIRouter(prefix="/projects", tags=["Projects"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def make_site_id(project_name: str):
    site_id = project_name.lower()
    site_id = re.sub(r