# Technická dokumentace pro vývojáře

## Obsah
1. [Architektura kódu](#architektura-kódu)
2. [Frontend - detailní popis](#frontend---detailní-popis)
3. [Backend - detailní popis](#backend---detailní-popis)
4. [Datové struktury](#datové-struktury)
5. [Stavový diagram](#stavový-diagram)
6. [Rozšíření systému](#rozšíření-systému)

---

## Architektura kódu

### Frontend architektura

```
MetroMap (hlavní třída)
├── Konfigurace
│   ├── linesConfig          # Konfigurace všech linek
│   ├── translations         # Překlady CS/EN
│   └── icons               # SVG ikony
│
├── Stav aplikace
│   ├── currentLine          # Aktuální linka (A/B/C)
│   ├── currentStationIndex  # Index aktuální stanice
│   ├── direction           # Směr jízdy (first/last)
│   ├── isMoving            # Vlak je v pohybu
│   ├── isAtStation         # Vlak je ve stanici
│   ├── customTerminal      # Vlastní konečná stanice
│   └── delay               # Zpoždění v sekundách
│
├── Backend komunikace
│   ├── ws                   # WebSocket připojení
│   ├── useBackend          # Použít API nebo simulaci
│   ├── connectionStatus    # Stav připojení
│   └── apiPollingActive    # REST API polling aktivní
│
├── Smooth animace (NOVÉ)
│   ├── animationFrame       # requestAnimationFrame ID
│   ├── lastFrameTime        # Čas posledního frame
│   ├── smoothProgress       # Plynulý progress (0-1)
│   └── targetProgress       # Cílový progress
│
└── Metody
    ├── Inicializace (init, renderStations)
    ├── Aktualizace (updateDisplay, updatePassedLine)
    ├── Simulace (startSimulation, moveToNextStation, animationLoop)
    ├── API (pollApi, handleApiResponse)
    └── Backend (connectToBackend, handleBackendUpdate)
```

### MetroMapProduction - Produkční verze (NOVÉ)

```
MetroMapProduction (rozšíření pro produkci)
├── Smooth animace
│   ├── animationLoop()      # requestAnimationFrame loop (60 FPS)
│   ├── lerp interpolace     # Plynulý přechod hodnot
│   └── deltaTime            # Čas od posledního frame
│
├── REST API Polling
│   ├── startApiPolling()    # Spuštění pollingu
│   ├── pollApi()            # Dotaz na API každých 5s
│   ├── handleApiResponse()  # Zpracování odpovědi
│   └── trackedTrainDest     # Sledovaný vlak
│
├── Iframe komunikace (NOVÉ)
│   └── broadcastStationUpdate() # postMessage pro combined display
│
└── Fixní rozlišení
    └── 4096×607px           # Bez deformace
```

### CombinedProductionDisplay - Kombinovaný displej (NOVÉ)

```
CombinedProductionDisplay
├── Konfigurace
│   ├── metroTime: 15        # Čas zobrazení metro mapy (s)
│   ├── departuresTime: 5    # Čas zobrazení odjezdů (s)
│   └── debug               # Debug mode
│
├── Stav
│   ├── currentView          # 'metro' nebo 'departures'
│   ├── currentStation       # Stanice kde vlak stojí
│   ├── nextStation          # Kam přijíždí
│   └── lastLoadedStop       # Poslední načtená zastávka
│
├── Iframy
│   ├── metroIframe          # Metro mapa
│   └── departuresIframe     # Tabulka odjezdů
│
└── Metody
    ├── handleMessage()      # Příjem postMessage
    ├── switchView()         # Přepnutí zobrazení
    └── loadDeparturesForStation() # Dynamické načtení odjezdů
```

### Backend architektura

```
FastAPI Application
├── Middleware
│   └── CORSMiddleware      # CORS pro frontend
│
├── REST Endpoints
│   ├── /api/status         # Health check
│   ├── /api/metro/lines    # Seznam linek
│   ├── /api/metro/line/{id}# Data konkrétní linky + vlaky
│   └── /api/departures     # Odjezdy ze zastávky (NOVÉ)
│
├── WebSocket Endpoints
│   └── /ws/metro/{line_id} # Real-time aktualizace
│
├── GTFS-RT Parser
│   ├── parse_vehicle_positions_for_metro()
│   └── find_station_by_stop_id()
│
└── Data Cache
    ├── METRO_C_VEHICLES    # Cache pozic vozidel
    └── METRO_LINE_C_STATE  # Cache stavu linky
```

---

## Frontend - detailní popis

### Konfigurace linky

```javascript
// Struktura konfigurace jedné linky
{
    color: '#E62F23',           // Barva linky (hex)
    textColor: '#FFFFFF',       // Barva textu
    terminals: {
        first: 'Letňany',       // Konečná stanice směr "first"
        last: 'Háje'            // Konečná stanice směr "last"
    },
    possibleTerminals: [        // Možné obratové stanice
        'letnany', 'ladvi', 'nadrazi-holesovice', 
        'florenc', 'prazskeho-povstani', 'kacerov', 'haje'
    ],
    stations: [                 // Seznam stanic
        {
            id: 'letnany',           // Unikátní ID
            name: 'Letňany',         // Zobrazovaný název
            transfer: null,          // Přestupy (null nebo pole)
            travelTime: 120          // Čas jízdy k další stanici (sekundy)
        },
        // ...
    ]
}
```

### Typy přestupů

```javascript
// Hodnoty v poli transfer
'A', 'B', 'C'        // Přestup na jinou linku metra
'train'              // Přestup na vlak
'bus'                // Autobusové nádraží
'bus-airport'        // Autobus na letiště (AE)
'bus-zoo'            // Autobus do ZOO
```

### Vykreslování stanic

```javascript
renderStations() {
    const stationsContainer = document.querySelector('.stations');
    stationsContainer.innerHTML = '';
    
    this.stations.forEach((station, index) => {
        const stationEl = document.createElement('div');
        stationEl.className = 'station';
        stationEl.dataset.index = index;
        
        // Kolečko stanice
        const dot = document.createElement('div');
        dot.className = 'station-dot';
        
        // Název stanice
        const name = document.createElement('div');
        name.className = 'station-name';
        name.textContent = station.name;
        
        // Přestupní ikony
        if (station.transfer) {
            const icons = this.generateInlineIcons(station);
            name.innerHTML += icons;
        }
        
        stationEl.appendChild(dot);
        stationEl.appendChild(name);
        stationsContainer.appendChild(stationEl);
    });
}
```

### Aktualizace projeté části

```javascript
updatePassedLine() {
    const passedLine = document.querySelector('.route-line-passed');
    const disabledLine = document.querySelector('.route-line-disabled');
    const routeLine = document.querySelector('.route-line');
    
    const totalStations = this.stations.length - 1;
    const terminalIndex = this.getTerminalIndex();
    const lineWidth = routeLine.offsetWidth;
    
    // Výpočet šířky projeté části
    if (this.direction === 'last') {
        const passedWidth = (this.currentStationIndex / totalStations) * lineWidth;
        passedLine.style.width = `${passedWidth}px`;
        
        // Disabled část za vlastní konečnou
        if (this.customTerminal && terminalIndex < totalStations) {
            const disabledWidth = ((totalStations - terminalIndex) / totalStations) * lineWidth;
            disabledLine.style.width = `${disabledWidth}px`;
        }
    }
}
```

### WebSocket komunikace

```javascript
connectToBackend() {
    const wsUrl = `ws://${this.backendUrl}/ws/metro/${this.currentLine.toLowerCase()}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
        this.connectionStatus = 'connected';
        this.updateConnectionIndicator();
    };
    
    this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleBackendUpdate(data);
    };
    
    this.ws.onclose = () => {
        this.connectionStatus = 'disconnected';
        this.scheduleReconnect();
    };
}
```

### Smooth animace (NOVÉ)

Produkční verze používá `requestAnimationFrame` pro plynulou animaci 60 FPS:

```javascript
// Animační loop
animationLoop(currentTime) {
    if (!this.isMoving) {
        this.animationFrame = null;
        return;
    }
    
    // Výpočet delta času
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;
    
    // Aktualizace countdown
    if (this.arrivalCountdown > 0) {
        this.arrivalCountdown -= deltaTime * this.simulationSpeed;
        
        if (this.arrivalCountdown <= 0) {
            this.arrivalCountdown = 0;
            this.arriveAtStation(nextIndex);
            return;
        }
    }
    
    this.updateDisplay();
    this.animationFrame = requestAnimationFrame((t) => this.animationLoop(t));
}
```

### Lerp interpolace pro plynulý progress

```javascript
updatePassedLine() {
    // ...
    if (this.isMoving && this.totalTravelTime > 0) {
        const rawProgress = 1 - (this.arrivalCountdown / this.totalTravelTime);
        this.targetProgress = Math.max(0, Math.min(1, rawProgress));
        
        // Smooth interpolace (lerp)
        const lerpFactor = 0.15;
        this.smoothProgress += (this.targetProgress - this.smoothProgress) * lerpFactor;
        
        progressOffset = (this.smoothProgress / totalStations) * lineWidth;
    }
    // ...
}
```

### REST API Polling (NOVÉ)

```javascript
async pollApi() {
    if (!this.apiPollingActive) return;
    
    const response = await fetch(`${this.backendUrl}/api/metro/line/${this.currentLine}`);
    const data = await response.json();
    this.handleApiResponse(data);
    
    // Naplánovat další poll (každých 5s)
    this.apiPollTimeout = setTimeout(() => this.pollApi(), this.apiPollRate);
}

handleApiResponse(data) {
    // Najdi sledovaný vlak nebo vyber první
    let train = data.trains.find(t => 
        t.dest === this.trackedTrainDest && 
        t.direction === this.trackedTrainDirection
    ) || data.trains[0];
    
    // Smooth aktualizace countdown
    const newArrival = train.arrival_min * 60;
    const diff = newArrival - this.arrivalCountdown;
    if (Math.abs(diff) > 30) {
        this.arrivalCountdown = newArrival;
    } else {
        this.arrivalCountdown += diff * 0.2; // Postupná korekce
    }
}
```

### Iframe komunikace pro kombinovaný displej (NOVÉ)

```javascript
// V metro-production.js
broadcastStationUpdate() {
    const message = {
        type: 'metro-station-update',
        currentStation: this.stations[this.currentStationIndex].name,
        nextStation: nextStation ? nextStation.name : null,
        direction: this.direction,
        isMoving: this.isMoving,
        isAtStation: this.isAtStation
    };
    
    if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, '*');
    }
}

// V combined-production.html
handleMessage(event) {
    if (event.data.type === 'metro-station-update') {
        this.currentStation = event.data.currentStation;
        this.nextStation = event.data.nextStation;
        
        // Dynamicky načti odjezdy pro přijíždějící stanici
        const stopForDepartures = event.data.isAtStation 
            ? event.data.nextStation 
            : event.data.nextStation;
        
        if (stopForDepartures !== this.lastLoadedStop) {
            this.loadDeparturesForStation(stopForDepartures);
        }
    }
}
```

---

## Backend - detailní popis

### GTFS-RT Parser

```python
def parse_vehicle_positions_for_metro(
    feed: gtfs_realtime_pb2.FeedMessage, 
    line_id: str
) -> list:
    """
    Parsuje GTFS-RT VehiclePositions feed a vrací pozice vozidel
    pro danou linku metra.
    """
    vehicles = []
    line_config = METRO_LINES[line_id]
    route_id_expected = line_config["route_id"]
    
    for entity in feed.entity:
        if entity.HasField("vehicle"):
            vp = entity.vehicle
            
            # Kontrola zda vozidlo patří k dané lince
            route_id = vp.trip.route_id if vp.HasField("trip") else ""
            if route_id == route_id_expected:
                vehicle_info = {
                    "vehicle_id": vp.vehicle.id,
                    "stop_id": vp.stop_id,
                    "current_status": vp.current_status,
                    "timestamp": vp.timestamp
                }
                
                # Mapování stop_id na stanici
                idx, station = find_station_by_stop_id(line_id, vp.stop_id)
                if idx is not None:
                    vehicle_info["station_index"] = idx
                    vehicle_info["station_name"] = station["name"]
                
                vehicles.append(vehicle_info)
    
    return vehicles
```

### WebSocket Endpoint

```python
@app.websocket("/ws/metro/{line_id}")
async def metro_websocket(websocket: WebSocket, line_id: str):
    line_id = line_id.upper()
    
    if line_id not in METRO_LINES:
        await websocket.close(code=4004)
        return
    
    await websocket.accept()
    
    try:
        while True:
            # Odeslání aktuálního stavu
            state = await get_metro_line_state(line_id)
            await websocket.send_json(state)
            
            # Čekání na další interval
            await asyncio.sleep(POLL_INTERVAL)
    except WebSocketDisconnect:
        pass
```

### Konfigurace stanic s GTFS stop_id

```python
METRO_LINES = {
    "C": {
        "stations": [
            {
                "id": "letnany", 
                "name": "Letňany", 
                "stop_ids": ["U1081Z1", "U1081Z2"]  # Oba směry
            },
            {
                "id": "florenc", 
                "name": "Florenc", 
                "stop_ids": ["U1063Z1", "U1063Z2"]
            },
            # ...
        ]
    }
}
```

---

## Datové struktury

### Stav vlaku (frontend)

```typescript
interface TrainState {
    currentStationIndex: number;  // Index aktuální stanice (0-based)
    direction: 'first' | 'last';  // Směr jízdy
    isMoving: boolean;            // Vlak je v pohybu
    arrivalCountdown: number;     // Zbývající čas do příjezdu (sekundy)
    delay: number;                // Zpoždění (sekundy)
}
```

### Data stanice

```typescript
interface Station {
    id: string;                   // Unikátní identifikátor
    name: string;                 // Zobrazovaný název
    transfer: string[] | null;    // Přestupy
    travelTime: number;           // Čas jízdy k další stanici
}
```

### Backend response

```typescript
interface MetroLineResponse {
    ok: boolean;
    source: 'gtfs-rt' | 'simulation';
    line: string;
    color: string;
    terminals: {
        first: string;
        last: string;
    };
    stations: Station[];
    trains: Train[];
    timestamp: string;
}

interface Train {
    dest: string;           // Cílová stanice
    direction: string;      // Směr ('first' nebo 'last')
    arrival_min: number;    // Příjezd za (minuty)
    delay: number;          // Zpoždění (sekundy)
}
```

---

## Stavový diagram

### Stavy simulace

```
                    ┌─────────┐
                    │  INIT   │
                    └────┬────┘
                         │ init()
                         ▼
┌─────────────────────────────────────────────┐
│                   READY                      │
│  currentStationIndex = 0                     │
│  direction = 'last'                          │
│  isMoving = false                            │
└────────────────────┬────────────────────────┘
                     │ startSimulation()
                     ▼
┌─────────────────────────────────────────────┐
│                  MOVING                      │
│  isMoving = true                             │
│  arrivalCountdown > 0                        │
└────────────────────┬────────────────────────┘
                     │ arrivalCountdown = 0
                     ▼
┌─────────────────────────────────────────────┐
│              AT_STATION                      │
│  isMoving = false                            │
│  currentStationIndex++                       │
└────────────────────┬────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ AT_INTERMEDIATE │    │   AT_TERMINUS   │
│ → continue      │    │ → reverse dir   │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
                  MOVING
```

### Stavy připojení

```
         ┌──────────────┐
         │ DISCONNECTED │
         └──────┬───────┘
                │ connectToBackend()
                ▼
         ┌──────────────┐
         │  CONNECTING  │
         └──────┬───────┘
                │
       ┌────────┴────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│  CONNECTED  │   │   ERROR     │
└──────┬──────┘   └──────┬──────┘
       │                 │
       │ onclose         │ scheduleReconnect()
       │                 │
       └────────┬────────┘
                │
                ▼
         ┌──────────────┐
         │ DISCONNECTED │
         └──────────────┘
```

---

## Rozšíření systému

### Přidání nové linky metra

1. **Backend** - přidat do `METRO_LINES` v `main.py`:
```python
"D": {
    "color": "#007DC5",
    "route_id": "L993",
    "terminals": {"first": "Náměstí Míru", "last": "Depo Písnice"},
    "stations": [...]
}
```

2. **Frontend** - přidat do `linesConfig` v `metro-map.js`:
```javascript
'D': {
    color: '#007DC5',
    textColor: '#FFFFFF',
    terminals: { first: 'Náměstí Míru', last: 'Depo Písnice' },
    possibleTerminals: [...],
    stations: [...]
}
```

3. **CSS** - přidat barvu linky:
```css
.line-btn.line-d { background: #007DC5; color: #fff; }
.transfer-inline .badge.line-d { background: #007DC5; color: #fff; }
```

4. **HTML** - přidat tlačítko do line-selector:
```html
<button class="line-btn line-d" data-line="D">D</button>
```

### Přidání nového typu přestupu

1. **Frontend konfigurace**:
```javascript
{ id: 'nova-stanice', name: 'Nová Stanice', transfer: ['tram', 'P+R'], travelTime: 90 }
```

2. **Ikona v `generateInlineIcons()`**:
```javascript
case 'tram':
    return `<span class="icon"><svg>...</svg></span>`;
case 'P+R':
    return `<span class="text-badge">P+R</span>`;
```

### Přidání nového jazyka

```javascript
this.translations = {
    // ...
    de: {
        nextStation: 'Nächste Station:',
        arrivalIn: 'Ankunft in:',
        // ...
    }
};
```

---

## Train-Locked Displej (NOVÉ)

### Koncept

Train-locked displej je produkční verze určená pro instalaci přímo do vagónů metra. Každý displej je "zamknutý" na konkrétní soupravu pomocí unikátního `vehicle_id` z GTFS-RT feedu.

### Architektura

```
MetroTrainLocked
├── Konfigurace
│   ├── trainId              # ID soupravy z URL parametru
│   ├── trainFound           # Byl vlak nalezen v API?
│   └── lastTrainUpdate      # Čas poslední aktualizace
│
├── Connection Status
│   ├── connected            # Vlak nalezen, data se aktualizují
│   ├── searching            # Hledá se vlak v API
│   ├── train-not-found      # Vlak není v aktivních datech
│   └── simulation           # Fallback simulace
│
└── API Filtering
    └── ?train=VEHICLE_ID    # Backend filtruje data pro konkrétní vlak
```

### URL Parametry

```
metro-train-locked.html?train=M1C-001&line=C&backend=http://api.example.com:8000

Parametry:
  train=VEHICLE_ID    # POVINNÉ - ID soupravy z GTFS-RT
  line=A|B|C          # Linka (výchozí: C)
  backend=url         # URL backendu (výchozí: localhost:8000)
  terminal=station-id # Vlastní konečná stanice
  lang=cs|en          # Jazyk (výchozí: cs)
  direction=first|last # Počáteční směr
  simulation=true     # Vynutit simulaci (ignoruje API)
  debug=true          # Zapne debug výpisy v konzoli
```

### Backend API

```python
# Endpoint s filtrováním podle train ID
GET /api/metro/line/{line_id}?train={vehicle_id}

# Příklad odpovědi pro konkrétní vlak
{
    "ok": true,
    "source": "gtfs-rt",
    "line": "C",
    "trains": [
        {
            "vehicle_id": "M1C-001",
            "dest": "Háje",
            "direction": "last",
            "current_station": "Florenc",
            "station_index": 7,
            "arrival_min": 0,
            "delay": 0
        }
    ],
    "train_filter": "M1C-001",
    "timestamp": "2026-01-06T14:30:00Z"
}
```

### Instalace v soupravě

1. **Konfigurace displeje**
   ```bash
   # Každý displej má unikátní URL s train ID
   # Displej 1 v soupravě M1C-001:
   http://localhost/metro-train-locked.html?train=M1C-001&line=C
   
   # Displej 2 v soupravě M1C-002:
   http://localhost/metro-train-locked.html?train=M1C-002&line=C
   ```

2. **Způsoby identifikace vlaku**
   - **Statická konfigurace**: Train ID je natvrdo v URL
   - **Dynamická konfigurace**: Displej se dotáže na lokální server ve vlaku
   - **QR kód/NFC**: Během instalace se načte ID soupravy

3. **Fallback chování**
   - Pokud vlak není nalezen v API (např. mimo provoz), displej přejde do simulačního režimu
   - Status indikátor ukazuje "Souprava nenalezena" nebo "Simulace"
   - Při obnovení spojení se automaticky přepne na reálná data

### Soubory

```
frontend/
├── metro-train-locked.html     # HTML struktura
├── css/
│   └── metro-train-locked.css  # Styly (rozšíření metro-production.css)
└── js/
    └── metro-train-locked.js   # JavaScript logika

backend/
└── app/main.py                 # API endpoint s train filtrováním
```

---

## Testování

### Manuální testování

1. **Simulace**
   - Spustit simulaci tlačítkem Start
   - Ověřit pohyb vlaku mezi stanicemi
   - Ověřit změnu směru na konečné

2. **Přepínání linek**
   - Přepnout mezi linkami A, B, C
   - Ověřit správné barvy a stanice

3. **Vlastní konečná**
   - Vybrat obratovou stanici z dropdownu
   - Ověřit zobrazení šedé části za konečnou

4. **Train-Locked displej** (NOVÉ)
   - Otevřít `metro-train-locked.html?train=TEST-001&line=C&debug=true`
   - Ověřit zobrazení Train ID v headeru
   - Ověřit indikátor stavu připojení
   - Zkontrolovat konzoli pro debug výpisy

### Integrační testy

```bash
cd backend
python scripts/integration_test.py
```

### API testy

```bash
# Health check
curl http://localhost:8000/api/status

# Seznam linek
curl http://localhost:8000/api/metro/lines

# Data linky C
curl http://localhost:8000/api/metro/line/C

# Data pro konkrétní vlak (NOVÉ)
curl "http://localhost:8000/api/metro/line/C?train=M1C-001"
```

---

*Technická dokumentace - verze 1.1*
*Poslední aktualizace: 6. ledna 2026*
*Přidáno: Train-Locked displej pro instalaci v soupravách*
