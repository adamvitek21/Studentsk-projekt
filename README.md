# Metro Praha - Informační Displej 🚇

Informační displej pro pražské metro zobrazující real-time pozice vlaků na linkách A, B a C.

![Metro Display](docs/screenshot.png)

## ✨ Funkce

- **Multi-line podpora** - Linky A 🟢, B 🟡, C 🔴
- **Real-time data** - Připojení k Golemio API (PID GTFS-RT)
- **Simulační režim** - Pro testování bez připojení
- **Vícejazyčná podpora** - Čeština / English
- **Obratové stanice** - Podpora zkrácených spojů
- **Přestupní indikátory** - Metro, vlaky, autobusy
- **Tabulka odjezdů** - Real-time odjezdy ze zastávek
- **Kombinovaný displej** - Střídání metro mapy a odjezdů
- **Smooth animace** - Plynulý pohyb pomocí requestAnimationFrame
- **Fixní rozlišení 4096×607px** - Bez deformace pro průmyslové displeje

## 🖥️ Verze aplikace

| Soubor | Popis |
|--------|-------|
| `metro-map.html` | Vývojová verze s ovládacím panelem |
| `metro-production.html` | Produkční metro mapa (fixní 4096×607px) |
| `departures.html` | Vývojová verze tabulky odjezdů |
| `departures-production.html` | Produkční tabulka odjezdů |
| `combined-production.html` | **Kombinovaný displej** - střídá metro mapu (15s) a odjezdy (5s) |

## 🚀 Rychlý start

### Lokální spuštění (bez Dockeru)

```bash
# 1. Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 2. Frontend (v novém terminálu)
cd frontend
python3 -m http.server 5002

# 3. Otevři v prohlížeči
open http://localhost:5002/metro-map.html
```

### Docker spuštění

```bash
# Vytvoř .env soubor
cp backend/.env.example backend/.env
# Uprav backend/.env a přidej GOLEMIO_API_KEY

# Spusť
docker-compose up -d

# Otevři
open http://localhost:5000/metro-map.html
```

## 🖥️ Přepínání linek

**Vývojová verze** (s ovládacím panelem):
```
http://localhost:5002/metro-map.html?line=A   # Linka A (zelená)
http://localhost:5002/metro-map.html?line=B   # Linka B (žlutá)
http://localhost:5002/metro-map.html?line=C   # Linka C (červená - výchozí)
```

**Produkční verze** (pro informační panely v soupravách):
```
http://localhost:5002/metro-production.html?line=C
http://localhost:5002/metro-production.html?line=A&lang=en
http://localhost:5002/metro-production.html?line=B&terminal=florenc-b
```

**Kombinovaný produkční displej** (střídání metro + odjezdy):
```
http://localhost:5002/combined-production.html?line=C
http://localhost:5002/combined-production.html?line=C&metroTime=15&departuresTime=5
http://localhost:5002/combined-production.html?line=C&debug=true
```

**Tabulka odjezdů**:
```
http://localhost:5002/departures-production.html?stop=Florenc
http://localhost:5002/departures-production.html?stop=Muzeum&limit=8
```

## 📡 Reálná data z PID

Pro zobrazení reálných dat z Pražské integrované dopravy:

1. Zaregistruj se na [api.golemio.cz](https://api.golemio.cz)
2. Vytvoř API klíč
3. Přidej do `backend/.env`:

```env
GOLEMIO_API_KEY=tvuj-api-klic
GTFS_RT_URL=https://api.golemio.cz/v2/vehiclepositions/gtfsrt/
```

## �️ Metro linky

| Linka | Barva | Trasa | Stanic |
|-------|-------|-------|--------|
| **A** | 🟢 #00A651 | Nemocnice Motol ↔ Depo Hostivař | 17 |
| **B** | 🟡 #FFD500 | Zličín ↔ Černý Most | 24 |
| **C** | 🔴 #E62F23 | Letňany ↔ Háje | 20 |

## �🖥️ Technické specifikace

- **Rozlišení displeje**: 4096×607px (průmyslový formát)
- **Backend**: Python 3.11+, FastAPI, uvicorn
- **Frontend**: Vanilla JavaScript + CSS3
- **Data**: GTFS Realtime / simulace

## 📁 Struktura projektu

```
├── backend/
│   ├── app/
│   │   └── main.py              # FastAPI server
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── metro-map.html           # Vývojová verze (s ovládacím panelem)
│   ├── metro-production.html    # Produkční verze (fixní 4096×607px)
│   ├── departures.html          # Tabulka odjezdů - vývojová
│   ├── departures-production.html # Tabulka odjezdů - produkční
│   ├── combined-production.html # Kombinovaný displej (metro + odjezdy)
│   ├── css/
│   │   ├── metro-map.css        # Vývojové styly
│   │   ├── metro-production.css # Produkční styly
│   │   └── departures.css       # Styly odjezdů
│   └── js/
│       ├── metro-map.js         # Vývojová logika
│       ├── metro-production.js  # Produkční logika (smooth animace)
│       ├── departures.js        # Logika odjezdů
│       └── departures-production.js # Produkční odjezdy
├── docs/
│   ├── DOKUMENTACE.md       # Projektová dokumentace
│   ├── TECHNICKA_DOKUMENTACE.md
│   └── UZIVATELSKA_PRIRUCKA.md
└── docker-compose.yml
```

## 🔧 API Endpointy

| Endpoint | Metoda | Popis |
|----------|--------|-------|
| `/api/status` | GET | Stav serveru |
| `/api/metro/lines` | GET | Seznam všech linek |
| `/api/metro/line/{id}` | GET | Data konkrétní linky + pozice vlaků |
| `/api/departures` | GET | Odjezdy ze zastávky |
| `/ws/metro/{id}` | WS | Real-time WebSocket |

## ⚙️ URL Parametry

### metro-production.html
| Parametr | Hodnoty | Popis |
|----------|---------|-------|
| `line` | A, B, C | Linka metra |
| `backend` | URL | URL backendu |
| `terminal` | station-id | Vlastní konečná |
| `lang` | cs, en | Jazyk |
| `direction` | first, last | Počáteční směr |
| `simulation` | true | Simulační režim |

### combined-production.html
| Parametr | Výchozí | Popis |
|----------|---------|-------|
| `line` | C | Linka metra |
| `metroTime` | 15 | Čas zobrazení metro mapy (s) |
| `departuresTime` | 5 | Čas zobrazení odjezdů (s) |
| `limit` | 10 | Počet odjezdů |
| `debug` | false | Zobrazit debug info |

### departures-production.html
| Parametr | Výchozí | Popis |
|----------|---------|-------|
| `stop` | Florenc | Název zastávky |
| `limit` | 10 | Počet odjezdů |
| `refresh` | 30 | Interval obnovení (s) |

## 🎮 Ovládání simulace

| Tlačítko | Funkce |
|----------|--------|
| ▶ Start | Spustí simulaci jízdy |
| ⏸ Pauza | Pozastaví/obnoví |
| ↺ Reset | Vrátí na začátek |
| ⇄ Otočit | Změní směr jízdy |
| 1×/2×/5× | Rychlost simulace |
| 📡/🟠 | Přepnutí API/Simulace |
| 🌐 EN/CZ | Přepne jazyk |

## 📖 Dokumentace

- [Projektová dokumentace](docs/DOKUMENTACE.md)
- [Technická dokumentace](docs/TECHNICKA_DOKUMENTACE.md)
- [Uživatelská příručka](docs/UZIVATELSKA_PRIRUCKA.md)

## 🎨 Barevné schéma

- **Pozadí**: #262625
- **Linka C**: #E62F23 (červená)
- **Aktuální stanice**: #00ff88 (zelená)
- **Přestupy**:
  - Linka A: #50AF31 (zelená)
  - Linka B: #FFD500 (žlutá)
  - Linka D: #007DC5 (modrá)

## 📋 TODO

- [ ] Hlasová oznámení
- [ ] Responzivní design pro menší displeje
- [ ] PWA podpora
- [ ] Konfigurační soubor stanic
- [x] Kombinovaný displej (metro + odjezdy)
- [x] Smooth animace (requestAnimationFrame)
- [x] REST API polling pro real-time data
- [x] Fixní rozlišení pro průmyslové displeje

## 📄 Licence

MIT License - volně použitelné pro studijní účely.

---

Vytvořeno pro projekt Studentské tabule 🎓
