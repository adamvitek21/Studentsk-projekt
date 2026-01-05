import os
import sys
import time
import urllib.request
from urllib.error import URLError, HTTPError
from pathlib import Path

WAIT_TIMEOUT = int(os.getenv("STARTUP_WAIT_TIMEOUT", "60"))  # seconds
CHECK_INTERVAL = float(os.getenv("STARTUP_CHECK_INTERVAL", "0.5"))
GTFS_URL = os.getenv("GTFS_RT_URL", "")

def file_exists(path: str) -> bool:
    p = Path(path)
    return p.exists()

def http_ok(url: str) -> bool:
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=5) as resp:
            return 200 <= resp.getcode() < 400
    except (HTTPError, URLError, Exception):
        return False

def wait_for_feed(url: str, timeout: int) -> bool:
    if not url:
        return True  # nothing to wait for
    deadline = time.time() + timeout
    if url.startswith("file://"):
        path = url[7:]
        while time.time() < deadline:
            if file_exists(path):
                return True
            time.sleep(CHECK_INTERVAL)
        return False
    if url.lower().startswith("http://") or url.lower().startswith("https://"):
        while time.time() < deadline:
            if http_ok(url):
                return True
            time.sleep(CHECK_INTERVAL)
        return False
    # treat as plain path
    path = os.path.expanduser(url)
    while time.time() < deadline:
        if file_exists(path):
            return True
        time.sleep(CHECK_INTERVAL)
    return False

def main():
    ok = wait_for_feed(GTFS_URL, WAIT_TIMEOUT)
    if not ok:
        print(f"[entrypoint] timeout waiting for GTFS resource: {GTFS_URL}", file=sys.stderr)
    else:
        print(f"[entrypoint] GTFS resource available: {GTFS_URL}")
    # Exec uvicorn (replace process) so signals propagate
    os.execvp("uvicorn", ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"])

if __name__ == "__main__":
    main()