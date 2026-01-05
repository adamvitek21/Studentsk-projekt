const statusEl = document.getElementById('status');
const listEl = document.getElementById('departures');
const clockEl = document.getElementById('clock');
const stationEl = document.getElementById('station-name');
const trackEl = document.getElementById('track');

// Set station name from query param ?station=... and optional features ?hasTrain=1
(function setStationFromParams() {
    const params = new URLSearchParams(location.search);
    const s = params.get('station');
    if (s && stationEl) stationEl.textContent = s;

    const hasTrain = params.get('hasTrain') || params.get('component') === '23' || (params.get('features') || '').split(',').includes('23');
    if (hasTrain && stationEl) {
        stationEl.insertAdjacentHTML('beforeend', ' <span class="station-train" aria-hidden="true"><svg class="icon small"><use href="#icon-train"></use></svg></span>');
    }
})();

// Live clock
function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// Map line/mode to track color class
function getTrackClassForDeparture(d) {
    if (!d) return 'track-green';
    if (d.mode === 'train') return 'track-green';
    const line = String(d.line || '').trim();
    const isAirportBus = line === '25' || d.mode === 'airport-bus' || (d.meta && String(d.meta).toLowerCase().includes('letiště'));
    if (isAirportBus) return 'track-yellow';
    if (/^[A-Z]$/.test(line)) return 'track-green';
    if (/^\d+$/.test(line)) return 'track-red';
    return 'track-green';
}

// Restart animation (force reflow) and set color class
function setTrackColorAndRestart(departure) {
    if (!trackEl) return;
    const cls = getTrackClassForDeparture(departure);
    trackEl.classList.remove('track-green', 'track-yellow', 'track-red');
    void trackEl.offsetWidth;
    trackEl.classList.add(cls);
    let dur = 6; // default seconds
    if (departure && typeof departure.in_min === 'number') {
        dur = Math.max(3, Math.min(12, 10 - Math.min(9, departure.in_min)));
    }
    trackEl.style.animationDuration = dur + 's';
}

function render(deps) {
    listEl.innerHTML = '';
    if (!deps || deps.length === 0) {
        statusEl.textContent = 'Žádné odjezdy';
        setTrackColorAndRestart(null);
        return;
    }
    statusEl.textContent = `Aktualizováno: ${new Date().toLocaleTimeString()}`;
    const topDep = deps.reduce((a, b) => (a == null ? b : ((b.in_min || 999) < (a.in_min || 999) ? b : a)), null);
    setTrackColorAndRestart(topDep);
    deps.forEach(d => {
        const li = document.createElement('li');
        li.className = 'departure';

        const badge = document.createElement('div');
        badge.className = 'line-badge';
        badge.textContent = d.line || '–';

        const isAirportBus = (String(d.line) === '25') || (d.mode === 'airport-bus') || (d.meta && String(d.meta).toLowerCase().includes('letiště'));
        if (isAirportBus) {
            badge.classList.add('line-badge.bus-airport');
        }

        const main = document.createElement('div');
        main.className = 'departure-main';
        const destRow = document.createElement('div');
        destRow.className = 'dest-row';
        const dest = document.createElement('div');
        dest.className = 'dest';
        dest.textContent = d.dest || 'Směr';

        if (isAirportBus) {
            const airportTag = document.createElement('div');
            airportTag.className = 'airport-tag';
            airportTag.textContent = 'Airport';
            destRow.appendChild(airportTag);
        }

        destRow.appendChild(dest);
        main.appendChild(destRow);
        li.appendChild(badge);
        li.appendChild(main);
        listEl.appendChild(li);
    });
}

async function fetchFallback() {
    try {
        const response = await fetch('/api/fallback');
        const data = await response.json();
        render(data.departures);
    } catch (e) {
        console.error('Failed to fetch fallback data:', e);
    }
}

function wsUrl() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${location.hostname}:8000/ws/updates`;
}

let ws;
function connectWS() {
    try {
        ws = new WebSocket(wsUrl());
        ws.addEventListener('open', () => {
            console.log('WebSocket connected');
        });
        ws.addEventListener('message', evt => {
            const data = JSON.parse(evt.data);
            render(data.departures);
        });
        ws.addEventListener('close', () => {
            console.log('WebSocket closed, attempting to reconnect...');
            setTimeout(connectWS, 5000);
        });
        ws.addEventListener('error', () => {
            console.error('WebSocket error, closing connection...');
            ws.close();
        });
    } catch (e) {
        console.error('WebSocket connection failed:', e);
    }
}

// Init
connectWS();
setTimeout(fetchFallback, 1000);