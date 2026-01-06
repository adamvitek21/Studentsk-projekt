# Projektová dokumentace: Metro Praha - Informační displej

## 📋 Obsah

1. [Přehled projektu](#přehled-projektu)
2. [Architektura systému](#architektura-systému)
3. [Technická specifikace](#technická-specifikace)
4. [Struktura projektu](#struktura-projektu)
5. [Backend API](#backend-api)
6. [Frontend aplikace](#frontend-aplikace)
7. [Konfigurace metro linek](#konfigurace-metro-linek)
8. [Instalace a spuštění](#instalace-a-spuštění)
9. [Docker nasazení](#docker-nasazení)
10. [API Reference](#api-reference)
11. [Uživatelská příručka](#uživatelská-příručka)
12. [Rozšíření a budoucí vývoj](#rozšíření-a-budoucí-vývoj)

---

## Přehled projektu

### Popis
Informační displej pro pražské metro zobrazující real-time pozice vlaků, přestupní stanice a časy příjezdů. Systém je navržen pro průmyslové displeje ve stanicích metra s rozlišením 4096×607 pixelů.

### Hlavní funkce
- **Multi-line podpora** - Linky A (zelená), B (žlutá), C (červená)
- **Real-time data** - Připojení k Golemio API (PID GTFS-RT)
- **Simulační režim** - Pro testování a demonstrace
- **Vícejazyčná podpora** - Čeština a angličtina
- **Vlastní konečné stanice** - Podpora obratových stanic pro zkrácené spoje
- **Přestupní indikátory** - Vizuální značení přestupů na jiné linky a dopravní prostředky

### Cílové použití
- Informační panely v soupravě metra
- Webové informační tabule
- Kiosky a informační terminály
- Testovací a demonstrační účely

### Verze aplikace

| Verze | Soubor | Popis |
|-------|--------|-------|
| **Vývojová** | `metro-map.html` | S ovládacím panelem pro testování a vývoj |
| **Produkční** | `metro-production.html` | Pro reálné nasazení v soupravách metra |

---

## Architektura systému

```
┌─────────────────────────────────────────────────────────────────┐
│                        KLIENTSKÁ VRSTVA                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   metro-map.js  │  │  metro-map.css  │  │  metro-map.html │  │
│  │   (1234 řádků)  │  │   (803 řádků)   │  │   (hlavní UI)   │  │
│  └────────┬────────┘  └─────────────────┘  └─────────────────┘  │
│           │                                                      │
│           │ WebSocket / REST API                                 │
└───────────┼─────────────────────────────────────────────────────┘
            │
┌───────────┴─────────────────────────────────────────────────────┐
│                        SERVEROVÁ VRSTVA                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    FastAPI Backend                          ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   ││
│  │  │  REST API     │  │  WebSocket    │  │  GTFS-RT      │   ││
│  │  │  /api/*       │  │  /ws/*        │  │  Parser       │   ││
│  │  └───────────────┘  └───────────────┘  └───────────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
            │
┌───────────┴─────────────────────────────────────────────────────┐
│                       DATOVÁ VRSTVA                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Golemio API    │  │  Konfigurace    │  │  Statická data  │  │
│  │  (GTFS-RT)      │  │  (lines.json)   │  │  (stations.json)│  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Komunikační schéma

```
┌──────────┐         ┌──────────┐         ┌──────────────┐
│ Frontend │ ──WS──► │ Backend  │ ──HTTP─► │ Golemio API  │
│ (JS)     │ ◄──WS── │ (FastAPI)│ ◄─GTFS─  │ (PID Data)   │
└──────────┘         └──────────┘         └──────────────┘
     │                    │
     │                    │
     ▼                    ▼
┌──────────┐         ┌──────────┐
│ Simulace │         │ Cache    │
│ (lokální)│         │ (memory) │
└──────────┘         └──────────┘
```

---

## Technická specifikace

### Hardware požadavky (doporučené)
| Komponenta | Minimum | Doporučeno |
|------------|---------|------------|
| CPU | 2 jádra | 4 jádra |
| RAM | 1 GB | 2 GB |
| Displej | 1920×1080 | 4096×607 (průmyslový) |
| Síť | 1 Mbps | 10 Mbps |

### Software požadavky
| Technologie | Verze | Účel |
|-------------|-------|------|
| Python | 3.11+ | Backend server |
| FastAPI | 0.124+ | REST API framework |
| uvicorn | 0.38+ | ASGI server |
| httpx | 0.28+ | HTTP klient |
| protobuf | 6.33+ | GTFS-RT parsing |

### Podporované prohlížeče
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Síťové porty
| Port | Služba | Popis |
|------|--------|-------|
| 8000 | Backend API | FastAPI server |
| 5000 | Frontend (Docker) | HTTP server pro statické soubory |
| 5002 | Frontend (dev) | Lokální vývojový server |

---

## Struktura projektu

```
Studentsk-projekt/
├── backend/                    # Backend aplikace
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py            # Hlavní FastAPI aplikace (594 řádků)
│   ├── data/
│   │   └── stations.json      # Statická data stanic
│   ├── scripts/
│   │   ├── integration_test.py # Integrační testy
│   │   ├── mock_feed.py       # Mockovaná GTFS data
│   │   └── test_gtfs.py       # GTFS testy
│   ├── .env                   # Konfigurace prostředí
│   ├── .env.example           # Příklad konfigurace
│   ├── Dockerfile             # Docker obraz pro backend
│   ├── entrypoint.py          # Docker entrypoint skript
│   ├── requirements.txt       # Python závislosti
│   └── requirements.lock.txt  # Zamčené verze závislostí
│
├── frontend/                   # Frontend aplikace
│   ├── css/
│   │   ├── metro-map.css      # Hlavní styly (803 řádků)
│   │   └── backup.css         # Záložní styly
│   ├── js/
│   │   ├── metro-map.js       # Hlavní logika (1234 řádků)
│   │   └── backup.js          # Záložní verze
│   ├── src/                   # Legacy frontend
│   │   ├── index.html
│   │   ├── css/styles.css
│   │   └── js/app.js
│   ├── metro-map.html         # Hlavní HTML soubor
│   ├── package.json
│   └── README.md
│
├── config/
│   └── lines.json             # Konfigurace linek (prázdné)
│
├── docs/
│   ├── DOKUMENTACE.md         # Tato dokumentace
│   └── prikazy.txt            # Užitečné příkazy
│
├── scripts/
│   └── start.sh               # Spouštěcí skript
│
├── docker-compose.yml         # Docker Compose konfigurace
├── .gitignore
└── README.md                  # Základní README
```

---

## Backend API

### Hlavní komponenty

#### FastAPI aplikace (`backend/app/main.py`)

```python
# Klíčové importy
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from google.transit import gtfs_realtime_pb2

# Inicializace
app = FastAPI()
```

#### Konfigurace GTFS-RT
```python
GTFS_URL = os.getenv("GTFS_RT_URL")
POLL_INTERVAL = int(os.getenv("GTFS_POLL_INTERVAL", "15"))
GOLEMIO_API_KEY = os.getenv("GOLEMIO_API_KEY", "")
```

#### Konfigurace metro linek
Backend obsahuje kompletní definici všech tří linek metra:

```python
METRO_LINES = {
    "A": {
        "color": "#00A651",
        "route_id": "L990",
        "terminals": {"first": "Nemocnice Motol", "last": "Depo Hostivař"},
        "stations": [...]  # 17 stanic
    },
    "B": {
        "color": "#FFD500",
        "route_id": "L992",
        "terminals": {"first": "Zličín", "last": "Černý Most"},
        "stations": [...]  # 24 stanic
    },
    "C": {
        "color": "#E62F23",
        "route_id": "L991",
        "terminals": {"first": "Letňany", "last": "Háje"},
        "stations": [...]  # 20 stanic
    }
}
```

---

## Frontend aplikace

### Třída MetroMap (`frontend/js/metro-map.js`)

#### Konstruktor a inicializace
```javascript
class MetroMap {
    constructor() {
        // Konfigurace všech linek metra
        this.linesConfig = { 'A': {...}, 'B': {...}, 'C': {...} };
        
        // Stav aplikace
        this.currentLine = 'C';
        this.currentStationIndex = 0;
        this.direction = 'last';
        this.isMoving = false;
        
        // Backend connection
        this.useBackend = false;
        this.connectionStatus = 'disconnected';
        
        // Vícejazyčná podpora
        this.language = 'cs';
    }
}
```

#### Klíčové metody

| Metoda | Popis |
|--------|-------|
| `init()` | Inicializace aplikace |
| `renderStations()` | Vykreslení stanic na displej |
| `updateDisplay()` | Aktualizace zobrazení |
| `updatePassedLine()` | Aktualizace projeté části trasy |
| `connectToBackend()` | Připojení k WebSocket backendu |
| `startSimulation()` | Spuštění simulace pohybu vlaku |
| `switchLine(lineId)` | Přepnutí na jinou linku |
| `setCustomTerminal(terminalId)` | Nastavení vlastní konečné stanice |

### CSS styly (`frontend/css/metro-map.css`)

#### CSS proměnné
```css
:root {
    --line-color: #E62F23;
    --line-text-color: #FFFFFF;
    --line-a-color: #00A651;
    --line-b-color: #FFD500;
    --line-c-color: #E62F23;
    --current-station-color: #00ff88;
    --background-color: #262625;
}
```

#### Hlavní layout
```css
.display-container {
    width: 4096px;
    height: 607px;
    background: var(--background-color);
}
```

---

## Konfigurace metro linek

### Linka A (zelená)
| Parametr | Hodnota |
|----------|---------|
| Barva | `#00A651` |
| Počet stanic | 17 |
| Konečné | Nemocnice Motol ↔ Depo Hostivař |
| Obratové stanice | Petřiny, Dejvická, Náměstí Míru, Želivského, Skalka |

### Linka B (žlutá)
| Parametr | Hodnota |
|----------|---------|
| Barva | `#FFD500` |
| Počet stanic | 24 |
| Konečné | Zličín ↔ Černý Most |
| Obratové stanice | Nové Butovice, Smíchovské nádraží, Florenc, Českomoravská, Vysočanská |

### Linka C (červená)
| Parametr | Hodnota |
|----------|---------|
| Barva | `#E62F23` |
| Počet stanic | 20 |
| Konečné | Letňany ↔ Háje |
| Obratové stanice | Ládví, Nádraží Holešovice, Florenc, Pražského povstání, Kačerov |

### Přestupní stanice

| Stanice | Linky | Další přestupy |
|---------|-------|----------------|
| Můstek | A ↔ B | - |
| Muzeum | A ↔ C | - |
| Florenc | B ↔ C | Autobusové nádraží |
| Hlavní nádraží | C | Vlak, Letiště bus |
| Nádraží Holešovice | C | Vlak, ZOO bus |
| Smíchovské nádraží | B | Vlak |
| Vysočanská | B | Vlak |
| Nádraží Veleslavín | A | Vlak, Letiště bus |

---

## Instalace a spuštění

### Požadavky
- Python 3.11+
- Node.js (volitelně pro frontend dev)
- Docker & Docker Compose (pro kontejnerizované nasazení)

### Lokální instalace

#### 1. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate   # Windows

pip install -r requirements.txt
```

#### 2. Konfigurace
```bash
cp .env.example .env
# Upravte .env a přidejte GOLEMIO_API_KEY
```

#### 3. Spuštění backendu
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 4. Spuštění frontendu
```bash
cd frontend
python3 -m http.server 5002
```

#### 5. Otevření v prohlížeči

**Vývojová verze** (s ovládacím panelem):
```
http://localhost:5002/metro-map.html
http://localhost:5002/metro-map.html?line=A
http://localhost:5002/metro-map.html?line=B
http://localhost:5002/metro-map.html?line=C
```

**Produkční verze** (pro informační panely v soupravách):
```
http://localhost:5002/metro-production.html
http://localhost:5002/metro-production.html?line=A
http://localhost:5002/metro-production.html?line=B&lang=en
http://localhost:5002/metro-production.html?line=C&terminal=kacerov
```

#### Produkční URL parametry

| Parametr | Hodnoty | Popis |
|----------|---------|-------|
| `line` | A, B, C | Výběr linky metra |
| `backend` | URL | Adresa backendu (výchozí: localhost:8000) |
| `terminal` | station-id | ID vlastní konečné stanice |
| `lang` | cs, en | Jazyk displeje |
| `direction` | first, last | Počáteční směr jízdy |
| `simulation` | (přítomnost) | Vynucený simulační režim |

---

## Docker nasazení

### Docker Compose konfigurace

```yaml
version: "3.8"
services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "8000:8000"
    environment:
      - GTFS_RT_URL=${GTFS_RT_URL:-}
      - GTFS_POLL_INTERVAL=${GTFS_POLL_INTERVAL:-15}
      - GOLEMIO_API_KEY=${GOLEMIO_API_KEY:-}
    env_file:
      - ./backend/.env
    restart: unless-stopped

  metro-display:
    image: python:3.11-slim
    working_dir: /app
    volumes:
      - ./frontend:/app:ro
    ports:
      - "5000:5000"
    command: python3 -m http.server 5000
    depends_on:
      - backend
    restart: unless-stopped
```

### Spuštění s Dockerem
```bash
# Build a spuštění
docker-compose up -d

# Zobrazení logů
docker-compose logs -f

# Zastavení
docker-compose down
```

---

## API Reference

### REST Endpointy

#### GET `/api/status`
Vrací stav serveru.

**Response:**
```json
{
    "ok": true,
    "time": "2026-01-06T14:32:00.000Z"
}
```

#### GET `/api/metro/lines`
Seznam dostupných linek metra.

**Response:**
```json
{
    "ok": true,
    "lines": ["A", "B", "C"],
    "details": {
        "A": {
            "color": "#00A651",
            "terminals": {"first": "Nemocnice Motol", "last": "Depo Hostivař"},
            "station_count": 17
        },
        ...
    }
}
```

#### GET `/api/metro/line/{line_id}`
Data konkrétní linky metra.

**Parameters:**
- `line_id` (path): ID linky (A, B, C)

**Response:**
```json
{
    "ok": true,
    "source": "simulation",
    "line": "C",
    "color": "#E62F23",
    "terminals": {"first": "Letňany", "last": "Háje"},
    "stations": [...],
    "trains": [
        {"dest": "Háje", "direction": "last", "arrival_min": 2, "delay": 0}
    ],
    "timestamp": "2026-01-06T14:32:00.000Z"
}
```

### WebSocket Endpointy

#### WS `/ws/metro/{line_id}`
Real-time aktualizace pozic vlaků.

**Message format:**
```json
{
    "type": "position_update",
    "line": "C",
    "trains": [...],
    "timestamp": "2026-01-06T14:32:00.000Z"
}
```

---

## Uživatelská příručka

### Ovládací panel

| Tlačítko | Funkce |
|----------|--------|
| ▶ Start | Spuštění simulace |
| ⏸ Pauza | Pozastavení simulace |
| ↺ Reset | Reset do výchozího stavu |
| ⇄ Otočit směr | Změna směru jízdy |
| 📡 API / 🟠 Simulace | Přepínání režimu |
| 🌐 EN/CZ | Přepnutí jazyka |

### URL parametry

| Parametr | Hodnoty | Popis |
|----------|---------|-------|
| `line` | A, B, C | Výběr linky metra |
| `backend` | URL | Vlastní backend URL |

**Příklady:**
```
/metro-map.html?line=A
/metro-map.html?line=B&backend=api.example.com:8000
```

### Klávesové zkratky
| Klávesa | Akce |
|---------|------|
| Space | Start/Pauza |
| R | Reset |
| D | Změna směru |
| 1-3 | Rychlost (1×, 2×, 5×) |

---

## Produkční nasazení

### Produkční verze pro informační panely

Produkční verze (`metro-production.html`) je optimalizována pro nasazení v reálných soupravách metra:

#### Rozdíly oproti vývojové verzi

| Funkce | Vývojová | Produkční |
|--------|----------|-----------|
| Ovládací panel | ✅ Ano | ❌ Ne |
| Automatický fullscreen | ❌ Ne | ✅ Ano |
| Připojení k API | Manuální | Automatické |
| Fallback na simulaci | Manuální | Automatický |
| Kurzor myši | Viditelný | Skrytý |
| Reconnect pokusy | 10 | Neomezeno |

#### Příklad nasazení

```bash
# Spuštění produkční verze pro linku C
http://metro-server:5000/metro-production.html?line=C&backend=api-server:8000

# S vlastní konečnou (zkrácený spoj)
http://metro-server:5000/metro-production.html?line=C&terminal=kacerov

# Anglická verze
http://metro-server:5000/metro-production.html?line=A&lang=en
```

#### Konfigurace pro průmyslový displej

1. **Rozlišení:** 4096×607 pixelů
2. **Prohlížeč:** Chromium v kiosk režimu
3. **Spuštění:**
```bash
chromium --kiosk --disable-infobars \
  --disable-session-crashed-bubble \
  --noerrdialogs \
  "http://localhost:5000/metro-production.html?line=C"
```

#### Soubory produkční verze

```
frontend/
├── metro-production.html    # HTML bez ovládacích prvků
├── css/
│   └── metro-production.css # Optimalizované CSS
└── js/
    └── metro-production.js  # JS s automatickým API připojením
```

---

## Rozšíření a budoucí vývoj

### Plánované funkce
- [ ] Linka D (modrá) - po dokončení výstavby
- [ ] Integrace s dalšími dopravními prostředky (tramvaje, autobusy)
- [ ] Hlasové oznámení stanic
- [ ] Offline režim s PWA
- [ ] Mobilní aplikace

### Možná rozšíření
- Real-time informace o zpoždění
- Predikce příjezdů pomocí ML
- Integrace s navigací
- Bezbariérový přístup - informace o výtazích

### Známé problémy
1. Golemio API může být dočasně nedostupné
2. Některé GTFS stop_id nemusí být správně namapované
3. Pozice disabled linky může být mírně nepřesná na určitých rozlišeních

---

## Kontakt a podpora

**Repozitář:** https://github.com/adamvitek21/Studentsk-projekt

**Autor:** Adam Vítek

**Licence:** MIT

---

*Dokumentace aktualizována: 6. ledna 2026*
