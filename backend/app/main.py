import asyncio
import datetime
import json
import os
import pathlib
import random
import logging
import base64

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from google.transit import gtfs_realtime_pb2

ROOT = pathlib.Path(__file__).resolve().parents[1]

# Load .env file
env_path = ROOT / ".env"
if env_path.exists():
    load_dotenv(env_path)
    logging.info(f"Loaded .env from {env_path}")

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

# Metro vehicle positions cache (all lines)
# Uses JSON API from Golemio which provides trip_id as vehicle identifier
METRO_VEHICLES = {"A": [], "B": [], "C": []}
LAST_VEHICLE_UPDATE = None

# Legacy cache for backward compatibility
METRO_C_VEHICLES = []

# Golemio JSON API URL for vehicle positions
GOLEMIO_VEHICLE_API = "https://api.golemio.cz/v2/vehiclepositions"

# Metro route ID mapping
METRO_ROUTE_MAPPING = {
    "L990": "A",  # Line A (green)
    "L991": "C",  # Line C (red)  
    "L992": "B",  # Line B (yellow)
}


@app.get("/api/status")
async def status():
    return {"ok": True, "time": datetime.datetime.utcnow().isoformat()}


# ====== Konfigurace metro linek ======
METRO_LINES = {
    "A": {
        "color": "#00A651",
        "route_id": "L990",
        "terminals": {"first": "Nemocnice Motol", "last": "Depo Hostivař"},
        "stations": [
            {"id": "nemocnice-motol", "name": "Nemocnice Motol", "stop_ids": ["U321Z1", "U321Z2"]},
            {"id": "petriny", "name": "Petřiny", "stop_ids": ["U320Z1", "U320Z2"]},
            {"id": "nadrazi-veleslavin", "name": "Nádraží Veleslavín", "stop_ids": ["U319Z1", "U319Z2"]},
            {"id": "borislavka", "name": "Bořislavka", "stop_ids": ["U318Z1", "U318Z2"]},
            {"id": "dejvicka", "name": "Dejvická", "stop_ids": ["U317Z1", "U317Z2"]},
            {"id": "hradcanska", "name": "Hradčanská", "stop_ids": ["U316Z1", "U316Z2"]},
            {"id": "malostranska", "name": "Malostranská", "stop_ids": ["U315Z1", "U315Z2"]},
            {"id": "staromestska", "name": "Staroměstská", "stop_ids": ["U314Z1", "U314Z2"]},
            {"id": "mustek", "name": "Můstek", "stop_ids": ["U313Z1", "U313Z2"]},
            {"id": "muzeum-a", "name": "Muzeum", "stop_ids": ["U312Z1", "U312Z2"]},
            {"id": "namesti-miru", "name": "Náměstí Míru", "stop_ids": ["U311Z1", "U311Z2"]},
            {"id": "jiriho-z-podebrad", "name": "Jiřího z Poděbrad", "stop_ids": ["U310Z1", "U310Z2"]},
            {"id": "flora", "name": "Flora", "stop_ids": ["U309Z1", "U309Z2"]},
            {"id": "zelivskeho", "name": "Želivského", "stop_ids": ["U308Z1", "U308Z2"]},
            {"id": "strasnicka", "name": "Strašnická", "stop_ids": ["U307Z1", "U307Z2"]},
            {"id": "skalka", "name": "Skalka", "stop_ids": ["U306Z1", "U306Z2"]},
            {"id": "depo-hostivar", "name": "Depo Hostivař", "stop_ids": ["U305Z1", "U305Z2"]},
        ]
    },
    "B": {
        "color": "#FFD500",
        "route_id": "L992",
        "terminals": {"first": "Zličín", "last": "Černý Most"},
        "stations": [
            {"id": "zlicin", "name": "Zličín", "stop_ids": ["U401Z1", "U401Z2"]},
            {"id": "stodulky", "name": "Stodůlky", "stop_ids": ["U402Z1", "U402Z2"]},
            {"id": "luka", "name": "Luka", "stop_ids": ["U403Z1", "U403Z2"]},
            {"id": "luziny", "name": "Lužiny", "stop_ids": ["U404Z1", "U404Z2"]},
            {"id": "hurka", "name": "Hůrka", "stop_ids": ["U405Z1", "U405Z2"]},
            {"id": "nove-butovice", "name": "Nové Butovice", "stop_ids": ["U406Z1", "U406Z2"]},
            {"id": "jinonice", "name": "Jinonice", "stop_ids": ["U407Z1", "U407Z2"]},
            {"id": "radlicka", "name": "Radlická", "stop_ids": ["U408Z1", "U408Z2"]},
            {"id": "smichovske-nadrazi", "name": "Smíchovské nádraží", "stop_ids": ["U409Z1", "U409Z2"]},
            {"id": "andel", "name": "Anděl", "stop_ids": ["U410Z1", "U410Z2"]},
            {"id": "karlovo-namesti", "name": "Karlovo náměstí", "stop_ids": ["U411Z1", "U411Z2"]},
            {"id": "narodni-trida", "name": "Národní třída", "stop_ids": ["U412Z1", "U412Z2"]},
            {"id": "mustek-b", "name": "Můstek", "stop_ids": ["U413Z1", "U413Z2"]},
            {"id": "namesti-republiky", "name": "Náměstí Republiky", "stop_ids": ["U414Z1", "U414Z2"]},
            {"id": "florenc-b", "name": "Florenc", "stop_ids": ["U415Z1", "U415Z2"]},
            {"id": "krizikova", "name": "Křižíkova", "stop_ids": ["U416Z1", "U416Z2"]},
            {"id": "invalidovna", "name": "Invalidovna", "stop_ids": ["U417Z1", "U417Z2"]},
            {"id": "palmovka", "name": "Palmovka", "stop_ids": ["U418Z1", "U418Z2"]},
            {"id": "ceskomoravska", "name": "Českomoravská", "stop_ids": ["U419Z1", "U419Z2"]},
            {"id": "vysocanska", "name": "Vysočanská", "stop_ids": ["U420Z1", "U420Z2"]},
            {"id": "kolbenova", "name": "Kolbenova", "stop_ids": ["U421Z1", "U421Z2"]},
            {"id": "hloubetin", "name": "Hloubětín", "stop_ids": ["U422Z1", "U422Z2"]},
            {"id": "rajska-zahrada", "name": "Rajská zahrada", "stop_ids": ["U423Z1", "U423Z2"]},
            {"id": "cerny-most", "name": "Černý Most", "stop_ids": ["U424Z1", "U424Z2"]},
        ]
    },
    "C": {
        "color": "#E62F23",
        "route_id": "L991",
        "terminals": {"first": "Letňany", "last": "Háje"},
        "stations": [
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
    }
}

# Pro zpětnou kompatibilitu
METRO_LINE_C_STATIONS = METRO_LINES["C"]["stations"]

# Cached metro state
METRO_LINE_C_STATE = {
    "trains": [],  # List of train positions
    "delay": 0,     # Global delay in seconds
    "last_update": None
}


async def fetch_golemio_vehicles():
    """
    Fetch vehicle positions from Golemio JSON API.
    This API provides trip_id as the vehicle identifier for metro.
    """
    global METRO_VEHICLES, METRO_C_VEHICLES, LAST_VEHICLE_UPDATE
    
    if not GOLEMIO_API_KEY:
        logging.debug("No GOLEMIO_API_KEY set, skipping vehicle fetch")
        return
    
    try:
        headers = {"X-Access-Token": GOLEMIO_API_KEY}
        
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(f"{GOLEMIO_VEHICLE_API}?limit=5000", headers=headers)
            
            if response.status_code != 200:
                logging.warning(f"Golemio API returned {response.status_code}")
                return
            
            data = response.json()
            features = data.get("features", [])
            
            # Clear previous data
            metro_vehicles = {"A": [], "B": [], "C": []}
            
            for f in features:
                props = f.get("properties", {})
                trip = props.get("trip", {})
                gtfs = trip.get("gtfs", {})
                last_pos = props.get("last_position", {})
                
                route_type = gtfs.get("route_type")
                route_id = gtfs.get("route_id", "")
                route_name = gtfs.get("route_short_name", "")
                
                # Identify metro vehicles (route_type=1 or known route_ids)
                line = None
                if route_type == 1:
                    line = route_name if route_name in ["A", "B", "C"] else None
                if not line and route_id:
                    line = METRO_ROUTE_MAPPING.get(route_id)
                
                if line:
                    trip_id = gtfs.get("trip_id", "")
                    headsign = gtfs.get("trip_headsign", "")
                    vehicle_reg = trip.get("vehicle_registration_number")
                    
                    # Use trip_id as identifier (vehicle_reg is None for metro)
                    identifier = str(vehicle_reg) if vehicle_reg else trip_id
                    
                    coords = f.get("geometry", {}).get("coordinates", [])
                    state = last_pos.get("state_position", "unknown")
                    next_stop = last_pos.get("next_stop", {})
                    last_stop = last_pos.get("last_stop", {})
                    delay_info = last_pos.get("delay", {})
                    
                    # Get station names from stop_ids
                    next_stop_id = next_stop.get("id")
                    last_stop_id = last_stop.get("id")
                    next_station_name = get_station_name_from_stop_id(next_stop_id, line) if next_stop_id else None
                    last_station_name = get_station_name_from_stop_id(last_stop_id, line) if last_stop_id else None
                    
                    vehicle_info = {
                        "vehicle_id": identifier,  # trip_id as identifier
                        "trip_id": trip_id,
                        "route_id": route_id,
                        "headsign": headsign,
                        "state": state,
                        "next_stop_id": next_stop_id,
                        "next_station_name": next_station_name,
                        "last_stop_id": last_stop_id,
                        "last_station_name": last_station_name,
                        "delay": delay_info.get("actual", 0) if delay_info else 0,
                        "latitude": coords[1] if len(coords) > 1 else None,
                        "longitude": coords[0] if len(coords) > 0 else None,
                    }
                    
                    # Try to find station index from stop_id
                    stop_id = next_stop_id or last_stop_id
                    if stop_id:
                        idx, station = find_station_by_stop_id(line, stop_id)
                        if idx is not None:
                            vehicle_info["station_index"] = idx
                            vehicle_info["station_name"] = station["name"]
                    
                    metro_vehicles[line].append(vehicle_info)
            
            # Update global cache
            METRO_VEHICLES = metro_vehicles
            METRO_C_VEHICLES = metro_vehicles["C"]  # Legacy compatibility
            LAST_VEHICLE_UPDATE = datetime.datetime.utcnow().isoformat()
            
            total = sum(len(v) for v in metro_vehicles.values())
            logging.info(f"Fetched {total} metro vehicles (A:{len(metro_vehicles['A'])}, B:{len(metro_vehicles['B'])}, C:{len(metro_vehicles['C'])})")
            
    except Exception as e:
        logging.exception(f"Error fetching Golemio vehicles: {e}")


def find_station_by_stop_id(line_id: str, stop_id: str):
    """Find station index by GTFS stop_id for given line"""
    if line_id not in METRO_LINES:
        return None, None
    for i, station in enumerate(METRO_LINES[line_id]["stations"]):
        if stop_id in station["stop_ids"]:
            return i, station
    return None, None


def parse_vehicle_positions_for_metro(feed: gtfs_realtime_pb2.FeedMessage, line_id: str) -> list:
    """Parse GTFS-RT VehiclePositions feed to find metro vehicles for given line"""
    global METRO_C_VEHICLES, LAST_VEHICLE_UPDATE
    
    if line_id not in METRO_LINES:
        return []
    
    line_config = METRO_LINES[line_id]
    route_id_expected = line_config["route_id"]
    
    vehicles = []
    
    for entity in feed.entity:
        if entity.HasField("vehicle"):
            vp = entity.vehicle
            
            route_id = ""
            if vp.HasField("trip") and vp.trip.route_id:
                route_id = vp.trip.route_id
            
            # Check if this vehicle belongs to the requested line
            is_match = route_id == route_id_expected or route_id.upper() == line_id
            
            if is_match:
                vehicle_info = {
                    "vehicle_id": vp.vehicle.id if vp.HasField("vehicle") else entity.id,
                    "route_id": route_id,
                    "trip_id": vp.trip.trip_id if vp.HasField("trip") else None,
                    "current_stop_sequence": vp.current_stop_sequence if vp.current_stop_sequence else 0,
                    "stop_id": vp.stop_id if vp.stop_id else None,
                    "current_status": vp.current_status,
                    "timestamp": vp.timestamp if vp.timestamp else None,
                    "latitude": vp.position.latitude if vp.HasField("position") else None,
                    "longitude": vp.position.longitude if vp.HasField("position") else None,
                }
                
                if vehicle_info["stop_id"]:
                    idx, station = find_station_by_stop_id(line_id, vehicle_info["stop_id"])
                    if idx is not None:
                        vehicle_info["station_index"] = idx
                        vehicle_info["station_name"] = station["name"]
                
                vehicles.append(vehicle_info)
    
    if vehicles and line_id == "C":
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


# ====== Generický endpoint pro všechny linky metra ======
@app.get("/api/metro/lines")
async def metro_lines():
    """Get list of available metro lines"""
    return {
        "ok": True,
        "lines": list(METRO_LINES.keys()),
        "details": {
            line_id: {
                "color": config["color"],
                "terminals": config["terminals"],
                "station_count": len(config["stations"])
            }
            for line_id, config in METRO_LINES.items()
        }
    }


@app.get("/api/metro/line/{line_id}")
async def metro_line(line_id: str, train: str = None):
    """
    Get current state of any metro line for display.
    
    Parameters:
    - line_id: Metro line identifier (A, B, C)
    - train: Optional trip_id to filter results for specific train (for train-locked displays)
             Format: "993_3875_251222" (route_tripnum_date from Golemio API)
    
    When train parameter is provided, returns data only for that specific vehicle.
    This is used for displays installed in specific train cars that need to show
    position data for their own train only.
    
    Note: Golemio API doesn't provide vehicle_registration_number for metro,
    so we use trip_id as the vehicle identifier.
    """
    line_id = line_id.upper()
    
    if line_id not in METRO_LINES:
        return {"ok": False, "error": f"Line {line_id} not found"}
    
    line_config = METRO_LINES[line_id]
    
    # Get cached vehicles from Golemio JSON API
    vehicles = METRO_VEHICLES.get(line_id, [])
    
    # Fallback to legacy cache for line C
    if not vehicles and line_id == "C" and METRO_C_VEHICLES:
        vehicles = METRO_C_VEHICLES
    
    # Filter by train ID (trip_id) if specified
    filtered_trains = []
    source = "simulation"
    
    if train and vehicles:
        # Find specific train by vehicle_id (trip_id) or partial match
        matching = [v for v in vehicles if v.get("vehicle_id") == train or v.get("trip_id") == train]
        if matching:
            source = "golemio-api"
            v = matching[0]
            
            # Determine direction from headsign
            headsign = v.get("headsign", "")
            terminals = line_config["terminals"]
            
            # Direction based on headsign matching terminal names
            if terminals["last"].lower() in headsign.lower():
                direction = "last"
            elif terminals["first"].lower() in headsign.lower():
                direction = "first"
            else:
                # Fallback: use station position
                station_idx = v.get("station_index", 0)
                direction = "last" if station_idx < len(line_config["stations"]) // 2 else "first"
            
            filtered_trains.append({
                "vehicle_id": v.get("vehicle_id"),
                "trip_id": v.get("trip_id"),
                "dest": headsign or terminals[direction],
                "headsign": headsign,
                "direction": direction,
                "current_station": v.get("station_name"),
                "next_station_name": v.get("next_station_name"),
                "last_station_name": v.get("last_station_name"),
                "next_stop_id": v.get("next_stop_id"),
                "station_index": v.get("station_index"),
                "state": v.get("state"),  # "at_stop" or "on_track"
                "arrival_min": 0,
                "delay": v.get("delay", 0)
            })
    elif vehicles:
        # Return all trains if no filter
        source = "golemio-api"
        for v in vehicles:
            headsign = v.get("headsign", "")
            terminals = line_config["terminals"]
            
            if terminals["last"].lower() in headsign.lower():
                direction = "last"
            elif terminals["first"].lower() in headsign.lower():
                direction = "first"
            else:
                station_idx = v.get("station_index", 0)
                direction = "last" if station_idx < len(line_config["stations"]) // 2 else "first"
            
            filtered_trains.append({
                "vehicle_id": v.get("vehicle_id"),
                "trip_id": v.get("trip_id"),
                "dest": headsign or terminals[direction],
                "headsign": headsign,
                "direction": direction,
                "current_station": v.get("station_name"),
                "next_station_name": v.get("next_station_name"),
                "last_station_name": v.get("last_station_name"),
                "next_stop_id": v.get("next_stop_id"),
                "station_index": v.get("station_index"),
                "state": v.get("state"),
                "arrival_min": 0,
                "delay": v.get("delay", 0)
            })
    
    # Fallback simulation data if no real data
    if not filtered_trains:
        source = "simulation"
        if train:
            # Simulate specific train
            filtered_trains = [
                {"vehicle_id": train, "trip_id": train, "dest": line_config["terminals"]["last"], "direction": "last", "state": "at_stop", "arrival_min": 2, "delay": 0}
            ]
        else:
            filtered_trains = [
                {"vehicle_id": "SIM-001", "dest": line_config["terminals"]["last"], "direction": "last", "state": "at_stop", "arrival_min": 2, "delay": 0},
                {"vehicle_id": "SIM-002", "dest": line_config["terminals"]["first"], "direction": "first", "state": "on_track", "arrival_min": 4, "delay": 0}
            ]
    
    return {
        "ok": True,
        "source": source,
        "line": line_id,
        "color": line_config["color"],
        "terminals": line_config["terminals"],
        "stations": line_config["stations"],
        "trains": filtered_trains,
        "train_filter": train,  # Echo back the filter if used
        "vehicle_count": len(vehicles),
        "last_update": LAST_VEHICLE_UPDATE,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }


# Pro zpětnou kompatibilitu: /api/metro/line-c
@app.get("/api/metro/line-c")
async def metro_line_c(train: str = None):
    """Get current state of metro line C for display (legacy endpoint)"""
    return await metro_line("C", train)


# Pro zpětnou kompatibilitu: /api/metro/line-a
@app.get("/api/metro/line-a")
async def metro_line_a(train: str = None):
    """Get current state of metro line A for display"""
    return await metro_line("A", train)


# Pro zpětnou kompatibilitu: /api/metro/line-b
@app.get("/api/metro/line-b")
async def metro_line_b(train: str = None):
    """Get current state of metro line B for display"""
    return await metro_line("B", train)


@app.get("/api/metro/vehicles")
async def metro_vehicles(line: str = None):
    """
    Get list of all metro vehicles currently tracked.
    Useful for debugging and finding vehicle IDs (trip_ids) for train-locked displays.
    
    Parameters:
    - line: Optional filter by line (A, B, C)
    """
    if line:
        line = line.upper()
        if line not in METRO_VEHICLES:
            return {"ok": False, "error": f"Line {line} not found"}
        vehicles = METRO_VEHICLES.get(line, [])
        return {
            "ok": True,
            "line": line,
            "count": len(vehicles),
            "vehicles": vehicles,
            "last_update": LAST_VEHICLE_UPDATE
        }
    else:
        return {
            "ok": True,
            "counts": {line: len(veh) for line, veh in METRO_VEHICLES.items()},
            "total": sum(len(v) for v in METRO_VEHICLES.values()),
            "vehicles": METRO_VEHICLES,
            "last_update": LAST_VEHICLE_UPDATE
        }


@app.get("/api/fallback")
async def fallback():
    data_file = ROOT / "data" / "stations.json"
    if data_file.exists():
        return json.loads(data_file.read_text(encoding="utf-8"))
    return {"departures": []}


# Load stop mapping from JSON file
METRO_STOP_MAPPING = {}
_stop_mapping_file = ROOT / "data" / "metro_stops.json"
if _stop_mapping_file.exists():
    try:
        _data = json.loads(_stop_mapping_file.read_text(encoding="utf-8"))
        METRO_STOP_MAPPING = _data.get("stops", {})
        logging.info(f"Loaded metro stop mapping with {sum(len(v) for v in METRO_STOP_MAPPING.values())} stops")
    except Exception as e:
        logging.warning(f"Failed to load metro_stops.json: {e}")


def get_station_name_from_stop_id(stop_id: str, line: str = None) -> str:
    """Convert Golemio stop_id to station name."""
    if not stop_id:
        return None
    
    # Try specific line first
    if line and line in METRO_STOP_MAPPING:
        if stop_id in METRO_STOP_MAPPING[line]:
            return METRO_STOP_MAPPING[line][stop_id]
    
    # Try all lines
    for line_stops in METRO_STOP_MAPPING.values():
        if stop_id in line_stops:
            return line_stops[stop_id]
    
    return None


@app.get("/api/metro/stops")
async def metro_stops(line: str = None):
    """
    Get stop_id to station name mapping for metro lines.
    Useful for converting API stop_ids to human-readable names.
    """
    if line:
        line = line.upper()
        if line not in METRO_STOP_MAPPING:
            return {"ok": False, "error": f"Line {line} not found"}
        return {
            "ok": True,
            "line": line,
            "stops": METRO_STOP_MAPPING.get(line, {})
        }
    return {
        "ok": True,
        "stops": METRO_STOP_MAPPING
    }


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


async def golemio_vehicle_poller_loop():
    """Background task to periodically fetch metro vehicle positions from Golemio API"""
    if not GOLEMIO_API_KEY:
        logging.info("GOLEMIO_API_KEY not set — vehicle poller disabled")
        return
    
    logging.info(f"Starting Golemio vehicle poller (interval {POLL_INTERVAL}s)")
    try:
        while True:
            await fetch_golemio_vehicles()
            await asyncio.sleep(POLL_INTERVAL)
    except asyncio.CancelledError:
        logging.info("Golemio vehicle poller cancelled")
        raise


GOLEMIO_POLL_TASK = None


@app.on_event("startup")
async def startup_event():
    global POLL_TASK, GOLEMIO_POLL_TASK
    if GTFS_URL:
        POLL_TASK = asyncio.create_task(gtfs_poller_loop())
    if GOLEMIO_API_KEY:
        GOLEMIO_POLL_TASK = asyncio.create_task(golemio_vehicle_poller_loop())


@app.on_event("shutdown")
async def shutdown_event():
    global POLL_TASK, GOLEMIO_POLL_TASK
    if POLL_TASK:
        POLL_TASK.cancel()
        try:
            await POLL_TASK
        except asyncio.CancelledError:
            logging.debug("POLL_TASK cancelled during shutdown")
        except Exception:
            logging.exception("Error waiting for POLL_TASK")
    
    if GOLEMIO_POLL_TASK:
        GOLEMIO_POLL_TASK.cancel()
        try:
            await GOLEMIO_POLL_TASK
        except asyncio.CancelledError:
            logging.debug("GOLEMIO_POLL_TASK cancelled during shutdown")
        except Exception:
            logging.exception("Error waiting for GOLEMIO_POLL_TASK")


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


@app.websocket("/ws/metro/line-{line_id}")
async def websocket_metro_line(websocket: WebSocket, line_id: str):
    """WebSocket pro real-time aktualizace jakékoliv linky metra"""
    line_id = line_id.upper()
    
    if line_id not in METRO_LINES:
        await websocket.close(code=1008, reason=f"Line {line_id} not found")
        return
    
    await websocket.accept()
    logging.info(f"Metro line {line_id} display connected via WebSocket")
    
    line_config = METRO_LINES[line_id]
    stations = line_config["stations"]
    
    try:
        # Simulační stav vlaku
        sim_position = 0  # Index stanice
        sim_direction = "last"  # Směr
        sim_progress = 0.0  # 0.0-1.0 mezi stanicemi
        sim_delay = 0  # Zpoždění v sekundách
        
        while True:
            now = datetime.datetime.utcnow().isoformat()
            
            # Simulation mode - pohyb vlaku
            sim_progress += 0.1
            if sim_progress >= 1.0:
                sim_progress = 0.0
                if sim_direction == "last":
                    sim_position += 1
                    if sim_position >= len(stations) - 1:
                        sim_position = len(stations) - 1
                        sim_direction = "first"
                else:
                    sim_position -= 1
                    if sim_position <= 0:
                        sim_position = 0
                        sim_direction = "last"
            
            # Random delay simulation (occasionally)
            if random.random() < 0.05:
                sim_delay = random.randint(0, 180)
            
            current_station = stations[sim_position]
            next_idx = sim_position + 1 if sim_direction == "last" else sim_position - 1
            next_station = stations[next_idx] if 0 <= next_idx < len(stations) else None
            
            terminus = line_config["terminals"]["last"] if sim_direction == "last" else line_config["terminals"]["first"]
            arrival_sec = int((1.0 - sim_progress) * 90)  # ~90 sekund mezi stanicemi
            
            payload = {
                "type": "update",
                "source": "simulation",
                "timestamp": now,
                "line": line_id,
                "color": line_config["color"],
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
        logging.info(f"Metro line {line_id} display disconnected")
        return
    except Exception as e:
        logging.exception(f"WebSocket error for metro line {line_id}")
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


# ====== DEPARTURES API (Golemio Proxy) ======

@app.get("/api/departures")
async def get_departures(ids: str = "", names: str = "", limit: int = 20):
    """
    Proxy endpoint for Golemio PID Departure Boards API.
    
    Args:
        ids: Comma-separated ASW node IDs (e.g., "689" for Florenc)
        names: Comma-separated stop names (e.g., "Florenc,Muzeum")
        limit: Maximum number of departures
    
    Returns:
        List of departures with real-time data
    """
    if not GOLEMIO_API_KEY:
        return {"ok": False, "error": "GOLEMIO_API_KEY not configured", "departures": []}
    
    if not ids and not names:
        return {"ok": False, "error": "No stop IDs or names provided", "departures": []}
    
    try:
        headers = {"X-Access-Token": GOLEMIO_API_KEY}
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Build params based on what we have
            params = {
                "limit": limit,
                "minutesBefore": 0,
                "minutesAfter": 120,
                "includeMetroTrains": "true",
            }
            
            # Prefer names parameter as it's more reliable
            if names:
                params["names"] = names
            elif ids:
                # Convert IDs to names or use aswIds format
                params["aswIds"] = ids
            
            logging.info(f"Fetching departures with params: {params}")
            
            response = await client.get(
                "https://api.golemio.cz/v2/pid/departureboards",
                params=params,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                departures = data.get("departures", [])
                stops = data.get("stops", [])
                
                logging.info(f"Got {len(departures)} departures from {len(stops)} stops")
                
                return {
                    "ok": True,
                    "names": names,
                    "ids": ids,
                    "stops": stops,
                    "departures": departures,
                    "count": len(departures),
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }
            else:
                logging.error(f"Golemio API error: {response.status_code} - {response.text}")
                return {
                    "ok": False,
                    "error": f"Golemio API returned {response.status_code}: {response.text[:200]}",
                    "departures": []
                }
    
    except httpx.TimeoutException:
        logging.error("Golemio API timeout")
        return {"ok": False, "error": "API timeout", "departures": []}
    except Exception as e:
        logging.exception("Error fetching departures")
        return {"ok": False, "error": str(e), "departures": []}


@app.get("/api/stops/search")
async def search_stops(query: str = "", limit: int = 10):
    """
    Search for PID stops by name.
    
    Args:
        query: Search query (stop name)
        limit: Maximum results
    
    Returns:
        List of matching stops with IDs
    """
    if not GOLEMIO_API_KEY:
        return {"ok": False, "error": "GOLEMIO_API_KEY not configured", "stops": []}
    
    if not query or len(query) < 2:
        return {"ok": False, "error": "Query too short", "stops": []}
    
    try:
        headers = {"X-Access-Token": GOLEMIO_API_KEY}
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://api.golemio.cz/v2/pid/stops",
                params={"name": query, "limit": limit},
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                stops = data.get("stops", [])
                
                # Simplify stop data
                simplified = [{
                    "id": s.get("stop_id"),
                    "name": s.get("stop_name"),
                    "zone": s.get("zone_id"),
                    "lat": s.get("stop_lat"),
                    "lon": s.get("stop_lon"),
                    "wheelchair": s.get("wheelchair_boarding")
                } for s in stops]
                
                return {
                    "ok": True,
                    "query": query,
                    "stops": simplified,
                    "count": len(simplified)
                }
            else:
                return {"ok": False, "error": f"API returned {response.status_code}", "stops": []}
    
    except Exception as e:
        logging.exception("Error searching stops")
        return {"ok": False, "error": str(e), "stops": []}