from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from google.transit import gtfs_realtime_pb2
import os
import json
import datetime
import logging
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]

app = FastAPI()
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)s %(message)s")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_path = ROOT / "studentsk-signage-frontend" / "src"
if frontend_path.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_path)), name="frontend")

LATEST_DEPARTURES = []
POLL_TASK = None

LAST_RAW_BYTES = None
LAST_ERROR = None

GTFS_URL = os.getenv("GTFS_RT_URL")
POLL_INTERVAL = int(os.getenv("GTFS_POLL_INTERVAL", "5"))
GTFS_HEADERS = None
if os.getenv("GTFS_RT_HEADERS"):
    try:
        GTFS_HEADERS = json.loads(os.getenv("GTFS_RT_HEADERS"))
    except Exception:
        logging.warning("Invalid GTFS_RT_HEADERS JSON, ignoring")


@app.get("/api/status")
async def status():
    return {"ok": True, "time": datetime.datetime.utcnow().isoformat()}


@app.get("/api/fallback")
async def fallback():
    data_file = ROOT / "data" / "stations.json"
    if data_file.exists():
        return json.loads(data_file.read_text(encoding="utf-8"))
    return {"departures": []}


@app.get("/api/latest")
async def api_latest():
    return {"count": len(LATEST_DEPARTURES), "departures": LATEST_DEPARTURES}


async def fetch_gtfs_rt(url: str):
    global LAST_RAW_BYTES, LAST_ERROR
    logging.debug("Fetching GTFS-RT from %s", url)
    if not url:
        logging.debug("No GTFS URL provided")
        return None

    try:
        content = None

        if url.startswith("file://"):
            path = url[7:]
            path = os.path.expanduser(path)
            if not os.path.exists(path):
                logging.debug("GTFS-RT local file not found: %s", path)
                return None
            logging.debug("Reading GTFS-RT local file (file://): %s", path)
            with open(path, "rb") as fh:
                content = fh.read()
        elif url.lower().startswith("http://") or url.lower().startswith("https://"):
            retries = 3
            delay = 0.5
            last_exc = None
            for attempt in range(1, retries + 1):
                try:
                    async with httpx.AsyncClient() as client:
                        response = await client.get(url)
                        response.raise_for_status()
                        content = response.content
                        break
                except Exception as exc:
                    last_exc = exc
                    logging.warning("Attempt %d failed: %s", attempt, exc)
                    await asyncio.sleep(delay)
                    delay *= 2
            if content is None:
                logging.error("Failed to fetch GTFS-RT after %d attempts: %s", retries, last_exc)
                return None
        else:
            path = os.path.expanduser(url)

        feed = gtfs_realtime_pb2.FeedMessage()
        feed.ParseFromString(content)
        LAST_RAW_BYTES = content
        LAST_ERROR = None

        departures = []
        now_ts = int(datetime.datetime.utcnow().timestamp())
        for entity in feed.entity:
            if not entity.HasField("trip_update"):
                continue
            tu = entity.trip_update
            route_id = tu.trip.route_id
            for stu in tu.stop_time_update:
                if stu.HasField("arrival"):
                    arrival_ts = stu.arrival.time
                    in_min = max(0, int((arrival_ts - now_ts) / 60))
                    departures.append({"line": route_id, "dest": tu.trip.trip_headsign or route_id, "in_min": in_min})

        departures = sorted(departures, key=lambda x: x["in_min"])[:50]
        logging.debug("Parsed %d departures", len(departures))
        return departures
    except Exception as exc:
        LAST_ERROR = str(exc)
        logging.exception("GTFS fetch/parse failed")
        return None


async def gtfs_poller_loop():
    global LATEST_DEPARTURES
    if not GTFS_URL:
        logging.info("GTFS_RT_URL not set — poller disabled")
        return
    logging.info("Starting GTFS poller for %s (interval %ss)", GTFS_URL, POLL_INTERVAL)
    try:
        while True:
            departures = await fetch_gtfs_rt(GTFS_URL)
            if departures:
                LATEST_DEPARTURES = departures
            await asyncio.sleep(POLL_INTERVAL)
    except asyncio.CancelledError:
        logging.info("GTFS poller cancelled")
        raise


@app.on_event("startup")
async def startup_event():
    global POLL_TASK
    if GTFS_URL:
        POLL_TASK = asyncio.create_task(gtfs_poller_loop())


@app.on_event("shutdown")
async def shutdown_event():
    global POLL_TASK
    if POLL_TASK:
        POLL_TASK.cancel()
        await POLL_TASK


@app.websocket("/ws/updates")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json(LATEST_DEPARTURES)
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        logging.info("WebSocket disconnected")
    except Exception:
        logging.exception("WebSocket error")


@app.get("/api/raw")
async def api_raw(raw: bool = False):
    global LAST_RAW_BYTES, LAST_ERROR
    if LAST_RAW_BYTES is None and LAST_ERROR is None:
        return {"ok": False, "last_error": "No data fetched yet"}
    resp = {"ok": True, "last_error": LAST_ERROR, "last_raw_len": len(LAST_RAW_BYTES) if LAST_RAW_BYTES else 0}
    if raw:
        resp["last_raw"] = LAST_RAW_BYTES.hex() if LAST_RAW_BYTES else None
    return resp