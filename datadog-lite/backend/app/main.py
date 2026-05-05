from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

app = FastAPI(title="Datadog Lite Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

events: List[Dict[str, Any]] = []
connections: List[WebSocket] = []


class TrackEvent(BaseModel):
    site_id: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    event_type: str
    full_url: Optional[str] = None
    referrer: Optional[str] = None
    device: Optional[str] = None
    timestamp: Optional[str] = None


@app.get("/")
def root():
    return {
        "message": "Datadog Lite Backend Running",
        "total_events": len(events),
        "websocket_clients": len(connections),
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "time": datetime.utcnow().isoformat(),
    }


async def broadcast_event(data: dict):
    disconnected = []

    for ws in connections:
        try:
            await ws.send_json(data)
        except Exception:
            disconnected.append(ws)

    for ws in disconnected:
        if ws in connections:
            connections.remove(ws)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connections.append(websocket)
    print("✅ WebSocket connected. Total:", len(connections))

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in connections:
            connections.remove(websocket)
        print("❌ WebSocket disconnected. Total:", len(connections))


@app.post("/track")
async def track_event(event: TrackEvent, request: Request):
    saved_event = {
        "site_id": event.site_id,
        "user_id": event.user_id or "anonymous",
        "session_id": event.session_id or "no_session",
        "event_type": event.event_type,
        "full_url": event.full_url,
        "referrer": event.referrer,
        "device": event.device or request.headers.get("user-agent"),
        "timestamp": event.timestamp or datetime.utcnow().isoformat(),
        "ip": request.client.host if request.client else None,
    }

    events.append(saved_event)

    print("📩 Event received:", saved_event)

    await broadcast_event({
        "type": "new_event",
        "data": saved_event,
        "total_events": len(events),
    })

    return {
        "success": True,
        "message": "Event tracked",
        "event": saved_event,
        "total_events": len(events),
    }


@app.get("/dashboard/recent-events")
def recent_events(limit: int = 20):
    return events[-limit:][::-1]


@app.get("/dashboard/stats")
def dashboard_stats(site_id: Optional[str] = None):
    filtered = events

    if site_id:
        filtered = [e for e in events if e["site_id"] == site_id]

    page_views = len([e for e in filtered if e["event_type"] == "page_view"])
    clicks = len([e for e in filtered if e["event_type"] == "click"])

    users = len(set(e["user_id"] for e in filtered))
    sessions = len(set(e["session_id"] for e in filtered))

    return {
        "site_id": site_id or "all",
        "total_events": len(filtered),
        "page_views": page_views,
        "clicks": clicks,
        "users": users,
        "sessions": sessions,
        "websocket_clients": len(connections),
    }


@app.get("/dashboard/page-views")
def page_views(site_id: Optional[str] = None):
    filtered = events

    if site_id:
        filtered = [e for e in events if e["site_id"] == site_id]

    only_page_views = [e for e in filtered if e["event_type"] == "page_view"]

    return {
        "site_id": site_id or "all",
        "count": len(only_page_views),
        "events": only_page_views,
    }


@app.get("/dashboard/sites")
def get_sites():
    site_ids = sorted(list(set(e["site_id"] for e in events)))

    return {
        "sites": site_ids,
        "count": len(site_ids),
    }


@app.get("/dashboard/projects")
def get_projects():
    site_ids = sorted(list(set(e["site_id"] for e in events)))

    return [
        {
            "site_id": site_id,
            "events": len([e for e in events if e["site_id"] == site_id]),
        }
        for site_id in site_ids
    ]


@app.post("/projects/create")
async def create_project(project: dict):
    return {
        "success": True,
        "message": "Project created",
        "project": project,
    }