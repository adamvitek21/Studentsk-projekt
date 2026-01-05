import asyncio
import datetime
import json
import os
import pathlib
import random
import logging
import base64

import httpx
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from google.transit import gtfs_realtime_pb2

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

# Shared state filled by background poller
LATEST_DEPARTURES = []
POLL_TASK = None

# track last raw bytes and last error for debugging (/api/raw)
LAST_RAW_BYTES = None
LAST_ERROR = None

GTFS_URL = os.getenv("GTFS_RT_URL")  # e.g. "https://.../gtfs-rt.pb"
POLL_INTERVAL = int(os.getenv("GTFS_POLL_INTERVAL", "15"))  # seconds (use larger in prod)

# Golemio API key for Prague PID data
GOLEMIO_API_KEY = os.getenv("GOLEMIO_API_KEY", "")

# Optional headers as JSON string, e.g. export GTFS_RT_HEADERS='{"x-api-key":"XXX"}'
GTFS_HEADERS = None
if GOLEMIO_API_KEY:
    GTFS_HEADERS = {"X-Access-Token": GOLEMIO_API_KEY}
elif os.getenv("GTFS_RT_HEADERS"):
    try:
        GTFS_HEADERS = json.loads(os.getenv("GTFS_RT_HEADERS"))
    except Exception:
        logging.warning("Invalid GTFS_RT_HEADERS JSON, ignoring")

# Metro line C vehicle positions cache
METRO_C_VEHICLES = []
LAST_VEHICLE_UPDATE = None


@app.get("/api/status")
async def status():
    return {"ok": True, "time": datetime.datetime.utcnow().isoformat()}


# ====== Metro Linka C - speciální endpoint pro displej ======
# Stanice linky C s jejich GTFS stop_id (PID Praha)
METRO_LINE_C_STATIONS = [
    {"id": "letnany", "name": "Letňany", "stop_ids": ["U1081Z1", "U1081Z2"]},
    {"id": "prosek", "name": "Prosek", "stop_ids": ["U1099Z1", "U1099Z2"]},
    {"id": "strizkov", "name": "Střížkov", "stop_ids": ["U1088Z1", "U1088Z2"]},
    {"id": "ladvi", "name": "Ládví", "stop_ids": ["U1077Z1", "U1077Z2"]},
    {"id": "kobylisy", "name": "Kobylisy", "stop_ids": ["U1078Z1", "U1078Z2"]},
    {"id": "nadrazi-holesovice", "name": "Nádraží Holešovice", "stop_ids": ["U1072Z1", "U1072Z2"]},
    {"id": "vltavska", "name": "Vltavská", "stop_ids": ["U1067Z1", "U1067Z2"]},
    {"id": "florenc", "name": "Florenc", "stop_ids": ["U1063Z1", "U1063Z2"]},
    {"id": "hlavni-nadrazi", "name": "Hlavní nádraží", "stop_ids": ["U1059Z1", "U1059Z2"]},
    {"id": "muzeum", "name": "Muzeum", "stop_ids": ["U1058Z1", "U1058Z2"]},
    {"id": "ip-pavlova", "name": "I. P. Pavlova", "stop_ids": ["U1057Z1", "U1057Z2"]},
    {"id": "vysehrad", "name": "Vyšehrad", "stop_ids": ["U1056Z1", "U1056Z2"]},
    {"id": "prazskeho-povstani", "name": "Pražského povstání", "stop_ids": ["U1053Z1", "U1053Z2"]},
    {"id": "pankrac", "name": "Pankrác", "stop_ids": ["U1051Z1", "U1051Z2"]},
    {"id": "budejovicka", "name": "Budějovická", "stop_ids": ["U1049Z1", "U1049Z2"]},
    {"id": "kacerov", "name": "Kačerov", "stop_ids": ["U1047Z1", "U1047Z2"]},
    {"id": "roztyly", "name": "Roztyly", "stop_ids": ["U1044Z1", "U1044Z2"]},
    {"id": "chodov", "name": "Chodov", "stop_ids": ["U1041Z1", "U1041Z2"]},
    {"id": "opatov", "name": "Opatov", "stop_ids": ["U1039Z1", "U1039Z2"]},
    {"id": "haje", "name": "Háje", "stop_ids": ["U1036Z1", "U1036Z2"]},
]

# Cached metro state
METRO_LINE_C_STATE = {
    "trains": [],  # List of train positions
    "delay": 0,     # Global delay in seconds
    "last_update": None
}


def find_station_by_stop_id(stop_id: str):
    """Find station index by GTFS stop_id"""
    for i, station in enumerate(METRO_LINE_C_STATIONS):
        if stop_id in station["stop_ids"]:
            return i, station
    return None, None


def parse_vehicle_positions_for_metro_c(feed: gtfs_realtime_pb2.FeedMessage) -> list:
    """Parse GTFS-RT VehiclePositions feed to find metro line C vehicles"""
    global METRO_C_VEHICLES, LAST_VEHICLE_UPDATE
    
    vehicles = []
    
    for entity in feed.entity:
        if entity.HasField("vehicle"):
            vp = entity.vehicle
            
            # Check if this is metro line C
            route_id = ""
            if vp.HasField("trip") and vp.trip.route_id:
                route_id = vp.trip.route_id
            
            # Metro line C route IDs in Prague: L991, or contains "C"
            is_line_c = route_id in ["L991", "C"] or "metro_c" in route_id.lower()
            
            if is_line_c or route_id.upper() == "C":
                vehicle_info = {
                    "vehicle_id": vp.vehicle.id if vp.HasField("vehicle") else entity.id,
                    "route_id": route_id,
                    "trip_id": vp.trip.trip_id if vp.HasField("trip") else None,
                    "current_stop_sequence": vp.current_stop_sequence if vp.current_stop_sequence else 0,
                    "stop_id": vp.stop_id if vp.stop_id else None,
                    "current_status": vp.current_status,  # 0=INCOMING_AT, 1=STOPPED_AT, 2=IN_TRANSIT_TO
                    "timestamp": vp.timestamp if vp.timestamp else None,
                    "latitude": vp.position.latitude if vp.HasField("position") else None,
                    "longitude": vp.position.longitude if vp.HasField("position") else None,
                }
                
                # Find station index from stop_id
                if vehicle_info["stop_id"]:
                    idx, station = find_station_by_stop_id(vehicle_info["stop_id"])
                    if idx is not None:
                        vehicle_info["station_index"] = idx
                        vehicle_info["station_name"] = station["name"]
                
                vehicles.append(vehicle_info)
    
    if vehicles:
        METRO_C_VEHICLES = vehicles
        LAST_VEHICLE_UPDATE = datetime.datetime.utcnow().isoformat()
        logging.info(f"Found {len(vehicles)} metro line C vehicles")
    
    return vehicles


def parse_metro_c_from_gtfs(feed_data: list) -> dict:
    """Parse GTFS departures to find metro line C train positions"""
    trains = []
    now_ts = int(datetime.datetime.utcnow().timestamp())
    
    for dep in feed_data:
        line = dep.get("line", "")
        if line.upper() == "C":
            dest = dep.get("dest", "")
            in_min = dep.get("in_min", 0)
            delay = dep.get("delay", 0)  # delay in seconds if available
            
            # Determine direction
            direction = "haje"  # default
            if "letňany" in dest.lower() or "nádraží holešovice" in dest.lower():
                direction = "letnany"
            
            trains.append({
                "dest": dest,
                "direction": direction,
                "arrival_min": in_min,
                "delay": delay
            })
    
    # Sort by arrival time
    trains.sort(key=lambda x: x["arrival_min"])
    
    return {
        "trains": trains[:5],  # Max 5 trains
        "timestamp": datetime.datetime.utcnow().isoformat()
    }


@app.get("/api/metro/line-c")
async def metro_line_c():
    """Get current state of metro line C for display"""
    global METRO_LINE_C_STATE
    
    if LATEST_DEPARTURES:
        metro_data = parse_metro_c_from_gtfs(LATEST_DEPARTURES)
        return {
            "ok": True,
            "source": "gtfs-rt",
            "stations": METRO_LINE_C_STATIONS,
            **metro_data
        }
    
    # Fallback simulation data
    return {
        "ok": True,
        "source": "simulation",
        "stations": METRO_LINE_C_STATIONS,
        "trains": [
            {"dest": "Háje", "direction": "haje", "arrival_min": 2, "delay": 0},
            {"dest": "Letňany", "direction": "letnany", "arrival_min": 4, "delay": 0}
        ],
        "timestamp": datetime.datetime.utcnow().isoformat()
    }


@app.get("/api/fallback")
async def fallback():
    data_file = ROOT / "data" / "stations.json"
    if data_file.exists():
        return json.loads(data_file.read_text(encoding="utf-8"))
    return {"departures": []}


@app.get("/api/latest")
async def api_latest():
    """Return the last polled GTFS departures (or empty list)."""
    return {"count": len(LATEST_DEPARTURES), "departures": LATEST_DEPARTURES}


async def fetch_gtfs_rt(url: str):
    """Download and parse GTFS-RT feed -> list[dict] or None on error.
    Supports http(s) URLs or local file paths / file:// URIs.
    Implements simple retry/backoff for HTTP fetches.
    """
    import os
    import asyncio
    global LAST_RAW_BYTES, LAST_ERROR
    logging.debug("Fetching GTFS-RT from %s", url)
    if not url:
        logging.debug("No GTFS URL provided")
        return None

    try:
        content = None

        # local file handling (no network)
        if url.startswith("file://"):
            path = url[7:]
            path = os.path.expanduser(path)
            if not os.path.exists(path):
                logging.error("Local GTFS file not found: %s", path)
                LAST_ERROR = f"Local file not found: {path}"
                return None
            logging.debug("Reading GTFS-RT local file (file://): %s", path)
            with open(path, "rb") as fh:
                content = fh.read()
        elif url.lower().startswith("http://") or url.lower().startswith("https://"):
            # HTTP with retries + exponential backoff
            retries = 3
            delay = 0.5
            last_exc = None
            for attempt in range(1, retries + 1):
                try:
                    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
                        r = await client.get(url, headers=GTFS_HEADERS)
                        r.raise_for_status()
                        content = r.content
                        break
                except Exception as e:
                    last_exc = e
                    logging.warning("HTTP fetch attempt %d failed: %s", attempt, e)
                    if attempt < retries:
                        await asyncio.sleep(delay)
                        delay *= 2
            if content is None:
                LAST_ERROR = f"HTTP fetch error: {last_exc}"
                logging.error("All HTTP fetch attempts failed")
                return None
        else:
            path = os.path.expanduser(url)
            if os.path.exists(path):
                logging.debug("Reading GTFS-RT local file: %s", path)
                with open(path, "rb") as fh:
                    content = fh.read()
            else:
                logging.error("GTFS_RT_URL does not look like HTTP(s) and file does not exist: %s", url)
                LAST_ERROR = f"Invalid GTFS_RT_URL or file not found: {url}"
                logging.debug("Not attempting HTTP fetch for non-HTTP value")
                return None

        # parse feed
        feed = gtfs_realtime_pb2.FeedMessage()
        feed.ParseFromString(content)
        # store raw bytes for debug
        LAST_RAW_BYTES = content
        LAST_ERROR = None

        departures = []
        now_ts = int(datetime.datetime.utcnow().timestamp())
        for entity in feed.entity:
            if entity.HasField("trip_update"):
                tu = entity.trip_update
                route_id = getattr(tu.trip, "route_id", "") or ""
                route_id = route_id[:10]
                trip_headsign = getattr(tu.trip, "trip_headsign", None)
                for stu in tu.stop_time_update:
                    if stu.HasField("arrival") and getattr(stu.arrival, "time", None):
                        arrival_ts = stu.arrival.time
                        in_min = max(0, int((arrival_ts - now_ts) / 60))
                        dest = trip_headsign or route_id or "?"
                        departures.append({"line": route_id or "?", "dest": dest, "in_min": in_min})
                        break
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
            deps = await fetch_gtfs_rt(GTFS_URL)
            if deps is not None:
                LATEST_DEPARTURES = deps
                logging.debug("Updated LATEST_DEPARTURES (%d items)", len(deps))
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
        try:
            await POLL_TASK
        except asyncio.CancelledError:
            logging.debug("POLL_TASK cancelled during shutdown")
        except Exception:
            logging.exception("Error waiting for POLL_TASK")


@app.websocket("/ws/updates")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        base_lines = [
            {"line": "A", "dest": "Muzeum"},
            {"line": "B", "dest": "Florenc"},
            {"line": "C", "dest": "Hradčanská"},
            {"line": "D", "dest": "Hloubětín"},
        ]
        while True:
            now = datetime.datetime.utcnow().isoformat()
            departures = []
            # Prefer background-polled GTFS data
            if LATEST_DEPARTURES:
                departures = LATEST_DEPARTURES[:20]
            else:
                # fallback to simulated feed
                for entry in base_lines:
                    in_min = random.randint(1, 12)
                    departures.append({"line": entry["line"], "dest": entry["dest"], "in_min": in_min})
            payload = {"t": now, "departures": departures}
            await websocket.send_json(payload)
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        return
    except Exception:
        try:
            await websocket.close()
        except Exception:
            pass


@app.websocket("/ws/metro/line-c")
async def websocket_metro_c(websocket: WebSocket):
    """WebSocket pro real-time aktualizace linky C pro displej"""
    await websocket.accept()
    logging.info("Metro line C display connected via WebSocket")
    try:
        # Simulační stav vlaku
        sim_position = 0  # Index stanice
        sim_direction = "haje"  # Směr
        sim_progress = 0.0  # 0.0-1.0 mezi stanicemi
        sim_delay = 0  # Zpoždění v sekundách
        
        while True:
            now = datetime.datetime.utcnow().isoformat()
            
            if LATEST_DEPARTURES:
                # Real GTFS data
                metro_data = parse_metro_c_from_gtfs(LATEST_DEPARTURES)
                payload = {
                    "type": "update",
                    "source": "gtfs-rt",
                    "timestamp": now,
                    **metro_data
                }
            else:
                # Simulation mode - pohyb vlaku
                sim_progress += 0.1
                if sim_progress >= 1.0:
                    sim_progress = 0.0
                    if sim_direction == "haje":
                        sim_position += 1
                        if sim_position >= len(METRO_LINE_C_STATIONS) - 1:
                            sim_position = len(METRO_LINE_C_STATIONS) - 1
                            sim_direction = "letnany"
                    else:
                        sim_position -= 1
                        if sim_position <= 0:
                            sim_position = 0
                            sim_direction = "haje"
                
                # Random delay simulation (occasionally)
                if random.random() < 0.05:
                    sim_delay = random.randint(0, 180)
                
                current_station = METRO_LINE_C_STATIONS[sim_position]
                next_idx = sim_position + 1 if sim_direction == "haje" else sim_position - 1
                next_station = METRO_LINE_C_STATIONS[next_idx] if 0 <= next_idx < len(METRO_LINE_C_STATIONS) else None
                
                terminus = "Háje" if sim_direction == "haje" else "Letňany"
                arrival_sec = int((1.0 - sim_progress) * 90)  # ~90 sekund mezi stanicemi
                
                payload = {
                    "type": "update",
                    "source": "simulation",
                    "timestamp": now,
                    "train": {
                        "currentStation": current_station["id"],
                        "currentStationIndex": sim_position,
                        "nextStation": next_station["id"] if next_station else None,
                        "nextStationIndex": next_idx if next_station else None,
                        "direction": sim_direction,
                        "terminus": terminus,
                        "progress": sim_progress,
                        "arrivalSeconds": arrival_sec,
                        "delay": sim_delay
                    }
                }
            
            await websocket.send_json(payload)
            await asyncio.sleep(3)  # Update every 3 seconds
            
    except WebSocketDisconnect:
        logging.info("Metro line C display disconnected")
        return
    except Exception as e:
        logging.exception("WebSocket error for metro line C")
        try:
            await websocket.close()
        except Exception:
            pass


@app.get("/api/raw")
async def api_raw(raw: bool = False):
    """Return last raw fetch metadata. If raw=true, return base64 of last bytes (beware size)."""
    global LAST_RAW_BYTES, LAST_ERROR
    if LAST_RAW_BYTES is None and LAST_ERROR is None:
        return {"ok": False, "msg": "no data yet"}
    resp = {"ok": True, "last_error": LAST_ERROR, "last_raw_len": len(LAST_RAW_BYTES) if LAST_RAW_BYTES else 0}
    if raw:
        resp["last_raw_base64"] = base64.b64encode(LAST_RAW_BYTES or b"").decode("ascii")
    return resp