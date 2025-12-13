// Simple signage client: WS realtime + HTTP fallback; uses window.BACKEND (host:port)
(function(){
  const statusEl = document.getElementById('status');
  const listEl = document.getElementById('departures');

  function render(deps){
    listEl.innerHTML = '';
    if(!deps || deps.length===0){
      statusEl.textContent = 'Žádné odjezdy';
      return;
    }
    statusEl.textContent = `Aktualizováno: ${new Date().toLocaleTimeString()}`;
    deps.forEach(d=>{
      const li = document.createElement('li');
      li.textContent = `${d.line} → ${d.dest} (${d.in_min} min)`;
      listEl.appendChild(li);
    });
  }

  async function fetchFallback(){
    try{
      const url = `http://${window.BACKEND}/api/fallback`;
      const res = await fetch(url);
      if(!res.ok) throw new Error('fallback error');
      const json = await res.json();
      render(json.departures || []);
    }catch(e){
      statusEl.textContent = 'Chyba fallback';
      console.error(e);
    }
  }

  function wsUrl(){
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.BACKEND.replace(/\/+$/,'')}/ws/updates`;
  }

  let ws;
  let reconnectDelay = 1000;
  function connectWS(){
    try{
      ws = new WebSocket(wsUrl());
    }catch(e){
      fetchFallback();
      return;
    }
    ws.addEventListener('open',()=>{
      statusEl.textContent='WS connected';
      reconnectDelay = 1000;
    });
    ws.addEventListener('message',evt=>{
      try{
        const data = JSON.parse(evt.data);
        if(data.departures) render(data.departures);
      }catch(e){
        console.error(e);
      }
    });
    ws.addEventListener('close',()=>{
      statusEl.textContent='WS disconnected — using fallback';
      fetchFallback();
      setTimeout(connectWS, reconnectDelay);
      reconnectDelay = Math.min(30000, reconnectDelay * 2);
    });
    ws.addEventListener('error',()=>{ ws.close(); });
  }

  // init
  connectWS();
  // periodic fallback refresh if WS not giving updates
  setInterval(fetchFallback, 30000);
})();