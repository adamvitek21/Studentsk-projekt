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
│   ├── metro-production.html    # Produkční verze (pro displeje v metrech)
│   ├── css/
│   │   ├── metro-map.css        # Vývojové styly
│   │   └── metro-production.css # Produkční styly
│   └── js/
│       ├── metro-map.js         # Vývojová logika
│       └── metro-production.js  # Produkční logika
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
| `/api/metro/line/{id}` | GET | Data konkrétní linky |
| `/ws/metro/{id}` | WS | Real-time WebSocket |

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

- [ ] Přidat linky A, B, D
- [ ] Hlasová oznámení
- [ ] Responzivní design
- [ ] PWA podpora
- [ ] Konfigurační soubor stanic

## 📄 Licence

MIT License - volně použitelné pro studijní účely.

---

Vytvořeno pro projekt Studentské tabule 🎓
