from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.api.tracking_routes import router as tracking_router
from app.api.dashboard_routes import router as dashboard_router

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# ✅ CORS (VERY IMPORTANT for external websites)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routes
app.include_router(tracking_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {"message": "Backend running successfully"}