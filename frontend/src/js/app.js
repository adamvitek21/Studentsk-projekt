// Simple signage client: WS realtime + HTTP fallback
(function(){
  const statusEl = document.getElementById('status');
  const listEl = document.getElementById('departures');
  const clockEl = document.getElementById('clock');
  const stationEl = document.getElementById('station-name');
  const trackEl = document.getElementById('track');

  // station and features from query
  (function setStationFromParams(){
    const params = new URLSearchParams(location.search);
    const s = params.get('station');
    if(s && stationEl) stationEl.textContent = s;
    const hasTrain = params.get('hasTrain');
    if(hasTrain && stationEl){
      stationEl.insertAdjacentHTML('beforeend',' <span class="station-train" aria-hidden="true"><svg class="icon small"><use href="#icon-train"></use></svg></span>');
    }
  })();

  // clock
  function updateClock(){
    if(!clockEl) return;
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  }
  setInterval(updateClock,1000); updateClock();

  // choose track class based on departure
  function getTrackClassForDeparture(d){
    if(!d) return 'track-green';
    if(d.mode === 'train') return 'track-green';
    const line = String(d.line||'').trim();
    const isAirportBus = line === '25' || d.mode === 'airport-bus' || (d.meta && String(d.meta).toLowerCase().includes('letiště'));
    if(isAirportBus) return 'track-yellow';
    if(/^[A-Z]$/.test(line)) return 'track-green';
    if(/^\d+$/.test(line)) return 'track-red';
    return 'track-green';
  }

  function setTrackColorAndRestart(departure){
    if(!trackEl) return;
    const cls = getTrackClassForDeparture(departure);
    trackEl.classList.remove('track-green','track-yellow','track-red');
    void trackEl.offsetWidth; // restart animation
    trackEl.classList.add(cls);
    let dur = 6;
    if(departure && typeof departure.in_min === 'number'){
      dur = Math.max(3, Math.min(12, 10 - Math.min(9, departure.in_min)));
    }
    trackEl.style.animationDuration = dur + 's';
  }

  // render departures
  function render(deps){
    listEl.innerHTML = '';
    if(!deps || deps.length===0){
      statusEl.textContent = 'Žádné odjezdy';
      setTrackColorAndRestart(null);
      return;
    }
    statusEl.textContent = `Aktualizováno: ${new Date().toLocaleTimeString()}`;
    // pick nearest (smallest in_min)
    const topDep = deps.reduce((a,b)=> (a==null?b:((b.in_min||999) < (a.in_min||999) ? b : a)), null);
    setTrackColorAndRestart(topDep);

    deps.forEach(d=>{
      const li = document.createElement('li');
      li.className = 'departure';

      const badge = document.createElement('div');
      badge.className = 'line-badge';
      badge.textContent = d.line || '–';

      const isAirportBus = (String(d.line) === '25') || (d.mode === 'airport-bus') || (d.meta && String(d.meta).toLowerCase().includes('letiště'));
      if(isAirportBus){
        badge.classList.add('bus-airport');
        const plane = document.createElement('span');
        plane.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-plane"></use></svg>';
        badge.prepend(plane);
      }
      if(d.mode === 'train'){
        badge.classList.add('train');
        badge.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-train"></use></svg> ' + (d.line||'–');
      }

      const main = document.createElement('div');
      main.className = 'departure-main';
      const destRow = document.createElement('div');
      destRow.className = 'dest-row';
      const dest = document.createElement('div');
      dest.className = 'dest';
      dest.textContent = d.dest || 'Směr';
      destRow.appendChild(dest);

      if(isAirportBus){
        const tag = document.createElement('div');
        tag.className = 'airport-tag';
        tag.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-plane"></use></svg><span>Letiště</span>';
        destRow.appendChild(tag);
      }

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = d.note || '';

      const eta = document.createElement('div');
      eta.className = 'eta';
      eta.textContent = (d.in_min!==undefined) ? `${d.in_min} min` : '—';

      main.appendChild(destRow);
      main.appendChild(meta);
      li.appendChild(badge);
      li.appendChild(main);
      li.appendChild(eta);
      listEl.appendChild(li);
    });
  }

  // fallback fetch
  async function fetchFallback(){
    try{
      const res = await fetch('/api/fallback');
      if(!res.ok) throw new Error('fallback error');
      const json = await res.json();
      render(json.departures || []);
    }catch(e){
      statusEl.textContent = 'Chyba fallback — demo';
      // demo data if backend not present
      const demo = [
        { line: 'A', dest: 'Depo', in_min: 2, mode: 'metro' },
        { line: '25', dest: 'Letiště', in_min: 8, mode: 'airport-bus', meta: 'jede na letiště' },
        { line: '199', dest: 'Černý Most', in_min: 12, mode: 'bus' }
      ];
      render(demo);
    }
  }

  // WS connect
  function wsUrl(){
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = (window.BACKEND && window.BACKEND.includes(':')) ? window.BACKEND : (location.hostname + ':8000');
    return `${protocol}//${host}/ws/updates`;
  }

  let ws;
  function connectWS(){
    try{
      ws = new WebSocket(wsUrl());
    }catch(e){
      fetchFallback();
      return;
    }
    ws.addEventListener('open',()=>{ statusEl.textContent='WS connected'; });
    ws.addEventListener('message',evt=>{
      try{
        const data = JSON.parse(evt.data);
        if(data.departures) render(data.departures);
      }catch(e){ console.error(e); }
    });
    ws.addEventListener('close',()=>{
      statusEl.textContent='WS disconnected — fallback';
      fetchFallback();
      setTimeout(connectWS,5000);
    });
    ws.addEventListener('error',()=>{ ws.close(); });
  }

  // init
  connectWS();
  setTimeout(fetchFallback,800);
})();