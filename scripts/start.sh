#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

echo "Starting backend..."
cd backend
source .venv/bin/activate 2>/dev/null || python3 -m venv .venv && source .venv/bin/activate
pip install -q -r requirements.txt
python scripts/mock_feed.py
export GTFS_RT_URL="/tmp/feed.pb"
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "Starting frontend..."
cd ../frontend
python3 -m http.server 5000 --directory src &
FRONTEND_PID=$!

echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5000"
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
