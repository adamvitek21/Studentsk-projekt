# Metro Praha - Informační Displej 🚇

Informační displej pro metro Praha, linka C. Zobrazuje real-time pozici vlaku, příští stanici a čas příjezdu.

![Metro Display](docs/screenshot.png)

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
python3 -m http.server 5000

# 3. Otevři v prohlížeči
open http://localhost:5000/metro-map.html
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

## 📡 Reálná data z PID

Pro zobrazení reálných dat z Pražské integrované dopravy:

1. Zaregistruj se na [api.golemio.cz](https://api.golemio.cz)
2. Vytvoř API klíč
3. Přidej do `backend/.env`:

```env
GOLEMIO_API_KEY=tvuj-api-klic
GTFS_RT_URL=https://api.golemio.cz/v2/vehiclepositions/gtfsrt/
```

## 🖥️ Technické specifikace

- **Rozlišení displeje**: 4096×607px (průmyslový formát)
- **Linka**: Metro C (20 stanic: Letňany ↔ Háje)
- **Backend**: FastAPI + WebSocket
- **Frontend**: Vanilla JavaScript + CSS3
- **Data**: GTFS Realtime / simulace

## 📁 Struktura projektu

```
├── backend/
│   ├── app/
│   │   └── main.py          # FastAPI server
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── metro-map.html       # Hlavní displej
│   ├── css/
│   │   └── metro-map.css    # Styly
│   └── js/
│       └── metro-map.js     # Logika
└── docker-compose.yml
```

## 🔧 API Endpointy

| Endpoint | Metoda | Popis |
|----------|--------|-------|
| `/api/status` | GET | Stav serveru |
| `/api/metro/line-c` | GET | Data linky C |
| `/ws/metro/line-c` | WS | Real-time WebSocket |

## 🎮 Ovládání simulace

| Tlačítko | Funkce |
|----------|--------|
| ▶ Start | Spustí simulaci jízdy |
| ⏸ Pauza | Pozastaví/obnoví |
| ↺ Reset | Vrátí na začátek |
| ⇄ Otočit | Změní směr jízdy |
| 🌐 EN/CZ | Přepne jazyk |

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
