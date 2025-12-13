# Studentské Signage — frontend

Spuštění (lokálně):

1) Nainstalovat závislosti:
   cd studentsk-signage-frontend
   npm install

2) Spustit dev server:
   npm start
   nebo bez instalace:
   npx live-server src --port=5000 --host=0.0.0.0 --quiet

Konfigurace:
- Pro připojení na jiný backend přidej query param `?backend=HOST:PORT`, např.:
  http://localhost:5000?backend=192.168.1.10:8000

# studentsk-signage-frontend

Lightweight static frontend. Dev setup avoids npm dev dependencies to remove vulnerable packages.

Quick start (no node deps required)
1. Serve static files with Python (recommended):
```bash
cd /Users/adamvitek/Documents/GitHub/Studentsk-projekt/studentsk-signage-frontend
npm run start
# opens static server on http://localhost:5000 (serves files from src/)
```