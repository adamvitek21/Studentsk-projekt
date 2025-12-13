import asyncio
import json
import os
import httpx
import websockets

API_BASE = "http://localhost:8000"
WS_URL = "ws://localhost:8000/ws/updates"

def http_checks():
    with httpx.Client(timeout=5) as c:
        r = c.get(f"{API_BASE}/api/status")
        print("/api/status ->", r.status_code, r.text)
        r = c.get(f"{API_BASE}/api/latest")
        print("/api/latest ->", r.status_code, r.text)
        r = c.get(f"{API_BASE}/api/fallback")
        print("/api/fallback ->", r.status_code, r.text)

async def ws_check():
    try:
        async with websockets.connect(WS_URL) as ws:
            msg = await asyncio.wait_for(ws.recv(), timeout=10)
            print("WS message ->", msg)
    except Exception as e:
        print("WS error:", e)

if __name__ == "__main__":
    print("HTTP checks:")
    http_checks()
    print("\nWS check (awaiting single message):")
    asyncio.run(ws_check())