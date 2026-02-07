class MetroMap {
    constructor() {
        // Konfigurace všech linek metra
        this.linesConfig = {
            'A': {
                color: '#00A651',
                textColor: '#FFFFFF',
                terminals: { first: 'Nemocnice Motol', last: 'Depo Hostivař' },
                // Možné konečné stanice (obratové stanice)
                possibleTerminals: ['nemocnice-motol', 'petriny', 'dejvicka', 'namesti-miru', 'zelivskeho', 'skalka', 'depo-hostivar'],
                stations: [
                    { id: 'nemocnice-motol', name: 'Nemocnice Motol', transfer: null, travelTime: 120 },
                    { id: 'petriny', name: 'Petřiny', transfer: null, travelTime: 90 },
                    { id: 'nadrazi-veleslavin', name: 'Nádraží Veleslavín', transfer: ['train', 'bus-airport'], travelTime: 90 },
                    { id: 'borislavka', name: 'Bořislavka', transfer: null, travelTime: 90 },
                    { id: 'dejvicka', name: 'Dejvická', transfer: ['bus-airport'], travelTime: 90 },
                    { id: 'hradcanska', name: 'Hradčanská', transfer: ['train'], travelTime: 90 },
                    { id: 'malostranska', name: 'Malostranská', transfer: null, travelTime: 90 },
                    { id: 'staromestska', name: 'Staroměstská', transfer: null, travelTime: 90 },
                    { id: 'mustek', name: 'Můstek', transfer: ['B'], travelTime: 60 },
                    { id: 'muzeum-a', name: 'Muzeum', transfer: ['C'], travelTime: 60 },
                    { id: 'namesti-miru', name: 'Náměstí Míru', transfer: null, travelTime: 90 },
                    { id: 'jiriho-z-podebrad', name: 'Jiřího z Poděbrad', transfer: null, travelTime: 90 },
                    { id: 'flora', name: 'Flora', transfer: null, travelTime: 90 },
                    { id: 'zelivskeho', name: 'Želivského', transfer: null, travelTime: 90 },
                    { id: 'strasnicka', name: 'Strašnická', transfer: null, travelTime: 90 },
                    { id: 'skalka', name: 'Skalka', transfer: null, travelTime: 90 },
                    { id: 'depo-hostivar', name: 'Depo Hostivař', transfer: null, travelTime: 120 }
                ]
            },
            'B': {
                color: '#FFD500',
                textColor: '#000000',
                terminals: { first: 'Zličín', last: 'Černý Most' },
                // Možné konečné stanice (obratové stanice)
                possibleTerminals: ['zlicin', 'nove-butovice', 'smichovske-nadrazi','florenc-b', 'ceskomoravska','vysocanska', 'cerny-most'],
                stations: [
                    { id: 'zlicin', name: 'Zličín', transfer: ['bus-airport'], travelTime: 120 },
                    { id: 'stodulky', name: 'Stodůlky', transfer: null, travelTime: 90 },
                    { id: 'luka', name: 'Luka', transfer: null, travelTime: 90 },
                    { id: 'luziny', name: 'Lužiny', transfer: null, travelTime: 90 },
                    { id: 'hurka', name: 'Hůrka', transfer: null, travelTime: 90 },
                    { id: 'nove-butovice', name: 'Nové Butovice', transfer: null, travelTime: 90 },
                    { id: 'jinonice', name: 'Jinonice', transfer: ['train'], travelTime: 90 },
                    { id: 'radlicka', name: 'Radlická', transfer: null, travelTime: 90 },
                    { id: 'smichovske-nadrazi', name: 'Smíchovské nádraží', transfer: ['train'], travelTime: 90 },
                    { id: 'andel', name: 'Anděl', transfer: null, travelTime: 90 },
                    { id: 'karlovo-namesti', name: 'Karlovo náměstí', transfer: null, travelTime: 90 },
                    { id: 'narodni-trida', name: 'Národní třída', transfer: null, travelTime: 60 },
                    { id: 'mustek-b', name: 'Můstek', transfer: ['A'], travelTime: 60 },
                    { id: 'namesti-republiky', name: 'Náměstí Republiky', transfer: null, travelTime: 90 },
                    { id: 'florenc-b', name: 'Florenc', transfer: ['C'], travelTime: 90 },
                    { id: 'krizikova', name: 'Křižíkova', transfer: null, travelTime: 90 },
                    { id: 'invalidovna', name: 'Invalidovna', transfer: null, travelTime: 90 },
                    { id: 'palmovka', name: 'Palmovka', transfer: null, travelTime: 90 },
                    { id: 'ceskomoravska', name: 'Českomoravská', transfer: null, travelTime: 90 },
                    { id: 'vysocanska', name: 'Vysočanská', transfer: ['train'], travelTime: 90 },
                    { id: 'kolbenova', name: 'Kolbenova', transfer: null, travelTime: 90 },
                    { id: 'hloubetin', name: 'Hloubětín', transfer: null, travelTime: 90 },
                    { id: 'rajska-zahrada', name: 'Rajská zahrada', transfer: ['train'], travelTime: 90 },
                    { id: 'cerny-most', name: 'Černý Most', transfer: null, travelTime: 120 }
                ]
            },
            'C': {
                color: '#E62F23',
                textColor: '#FFFFFF',
                terminals: { first: 'Letňany', last: 'Háje' },
                // Možné konečné stanice (obratové stanice)
                possibleTerminals: ['letnany', 'ladvi', 'nadrazi-holesovice', 'florenc', 'prazskeho-povstani', 'kacerov', 'haje'],
                stations: [
                    { id: 'letnany', name: 'Letňany', transfer: null, travelTime: 120 },
                    { id: 'prosek', name: 'Prosek', transfer: null, travelTime: 90 },
                    { id: 'strizkov', name: 'Střížkov', transfer: null, travelTime: 90 },
                    { id: 'ladvi', name: 'Ládví', transfer: null, travelTime: 90 },
                    { id: 'kobylisy', name: 'Kobylisy', transfer: null, travelTime: 90 },
                    { id: 'nadrazi-holesovice', name: 'Nádraží Holešovice', transfer: ['train', 'bus-zoo'], travelTime: 120 },
                    { id: 'vltavska', name: 'Vltavská', transfer: null, travelTime: 90 },
                    { id: 'florenc', name: 'Florenc', transfer: ['B', 'bus'], travelTime: 90 },
                    { id: 'hlavni-nadrazi', name: 'Hlavní nádraží', transfer: ['train', 'bus-airport'], travelTime: 60 },
                    { id: 'muzeum', name: 'Muzeum', transfer: ['A'], travelTime: 60 },
                    { id: 'ip-pavlova', name: 'I. P. Pavlova', transfer: null, travelTime: 90 },
                    { id: 'vysehrad', name: 'Vyšehrad', transfer: null, travelTime: 90 },
                    { id: 'prazskeho-povstani', name: 'Pražského povstání', transfer: null, travelTime: 90 },
                    { id: 'pankrac', name: 'Pankrác', transfer: null, travelTime: 90 },
                    { id: 'budejovicka', name: 'Budějovická', transfer: null, travelTime: 90 },
                    { id: 'kacerov', name: 'Kačerov', transfer: ['train'], travelTime: 90 },
                    { id: 'roztyly', name: 'Roztyly', transfer: null, travelTime: 90 },
                    { id: 'chodov', name: 'Chodov', transfer: null, travelTime: 90 },
                    { id: 'opatov', name: 'Opatov', transfer: null, travelTime: 90 },
                    { id: 'haje', name: 'Háje', transfer: null, travelTime: 120 }
                ]
            }
        };
        
        // Aktuální linka - výchozí C nebo z URL parametru
        this.currentLine = this.getLineFromUrl() || 'C';
        this.stations = this.linesConfig[this.currentLine].stations;
        
        this.currentStationIndex = 0;
        this.direction = 'last'; // 'first' nebo 'last'
        this.isMoving = false;
        this.isAtStation = true; // Vlak je ve stanici (ne v pohybu)
        this.isPaused = false;
        this.arrivalCountdown = 0;
        this.totalTravelTime = 0;
        this.stationStopTime = 20;
        this.simulationSpeed = 1;
        
        this.countdownInterval = null;
        this.tickInterval = 100;
        
        // Backend connection
        this.backendUrl = this.getBackendUrl();
        this.ws = null;
        this.wsReconnectAttempts = 0;
        this.wsMaxReconnectAttempts = 10;
        this.wsReconnectDelay = 3000;
        this.useBackend = false; // true = real data, false = simulation
        this.lastBackendUpdate = null;
        this.connectionStatus = 'disconnected'; // 'connected', 'disconnected', 'connecting'
        
        // Vícejazyčná podpora
        this.language = 'cs'; // 'cs' nebo 'en'
        this.translations = {
            cs: {
                nextStation: 'Příští stanice:',
                atStation: 'Ve stanici:',
                arrivalIn: 'Příjezd za:',
                departsIn: 'Odjezd za:',
                min: 'min',
                terminus: 'Konečná',
                ready: 'Připraveno',
                running: 'Jede...',
                paused: 'Pozastaveno',
                station: 'Stanice:',
                next: 'Příští:',
                direction: 'Směr:',
                readyToDepart: 'Připraveno k odjezdu',
                start: '▶ Start',
                pause: '⏸ Pauza',
                resume: '▶ Pokračovat',
                reset: '↺ Reset',
                reverse: '⇄ Otočit směr',
                speed: 'Rychlost:',
                language: '🌐 EN',
                delay: 'Zpoždění:',
                noDelay: 'Bez zpoždění',
                delayed: 'Zpožděno',
                connected: '🟢 Online (PID)',
                disconnected: '🔴 Offline',
                connecting: '🟡 Připojování...',
                simulation: '🟠 Simulace',
                liveData: '📡 Živá data'
            },
            en: {
                nextStation: 'Next station:',
                atStation: 'At station:',
                arrivalIn: 'Arriving in:',
                departsIn: 'Departing in:',
                min: 'min',
                terminus: 'Terminus',
                ready: 'Ready',
                running: 'Running...',
                paused: 'Paused',
                station: 'Station:',
                next: 'Next:',
                direction: 'Direction:',
                readyToDepart: 'Ready to depart',
                start: '▶ Start',
                pause: '⏸ Pause',
                resume: '▶ Resume',
                reset: '↺ Reset',
                reverse: '⇄ Reverse',
                speed: 'Speed:',
                language: '🌐 CZ',
                delay: 'Delay:',
                noDelay: 'On time',
                delayed: 'Delayed',
                connected: '🟢 Online (PID)',
                disconnected: '🔴 Offline',
                connecting: '🟡 Connecting...',
                simulation: '🟠 Simulation',
                liveData: '📡 Live data'
            }
        };
        
        // Zpoždění
        this.delay = 0; // v sekundách
        this.isDelayed = false;
        
        // SVG ikony
        this.icons = {
            train: `<svg viewBox="0 0 24 24"><path d="M12 2C8 2 4 2.5 4 6v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l1.5-2h5l1.5 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm2 0V6h5v5h-5zm3.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
            bus: `<svg viewBox="0 0 24 24"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>`,
            info: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
            // Kombinovaná ikona: autobus + letadlo (Airport Express)
            busAirport: `<svg viewBox="0 0 32 24"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" fill="#fff"/><path d="M28 10v-1.5l-5-3V2.5c0-.55-.45-1-1-1s-1 .45-1 1v3l-5 3V10l5-1.5v4l-1.5 1v1.5l2.5-.75 2.5.75v-1.5l-1.5-1v-4l5 1.5z" fill="#0066CC"/></svg>`,
            // Metro linky jako SVG kolečka
            metroA: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#00A651" stroke="#000" stroke-width="1"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold" font-family="Arial">A</text></svg>`,
            metroB: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#FFD500" stroke="#000" stroke-width="1"/><text x="12" y="16" text-anchor="middle" fill="#000" font-size="14" font-weight="bold" font-family="Arial">B</text></svg>`,
            metroC: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#E62F23" stroke="#000" stroke-width="1"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold" font-family="Arial">C</text></svg>`
        };
        
        // Vlastní konečná stanice (null = výchozí z konfigurace)
        this.customTerminal = null;
        
        // Vlastní výchozí stanice (null = výchozí konečná podle směru)
        this.customStartStation = null;
        
        this.init();
    }


    // Získání linky z URL parametru (?line=A)
    getLineFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const line = params.get('line');
        if (line && this.linesConfig && this.linesConfig[line.toUpperCase()]) {
            return line.toUpperCase();
        }
        return null;
    }

    // Získání URL backendu z URL parametrů nebo výchozí
    getBackendUrl() {
        const params = new URLSearchParams(window.location.search);
        const backend = params.get('backend');
        if (backend) {
            return backend.startsWith('http') ? backend : `http://${backend}`;
        }
        // Default: localhost:8000
        return `http://${window.location.hostname}:8000`;
    }

    // Přepnutí na jinou linku
    switchLine(lineId) {
        if (!this.linesConfig[lineId]) {
            console.error(`Linka ${lineId} neexistuje`);
            return;
        }
        
        // Zastav simulaci
        this.isMoving = false;
        this.isPaused = false;
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // Přepni linku
        this.currentLine = lineId;
        this.stations = this.linesConfig[lineId].stations;
        this.currentStationIndex = 0;
        this.direction = 'last';
        this.customTerminal = null; // Reset vlastní konečné
        this.customStartStation = null; // Reset vlastní výchozí
        
        // Aktualizuj URL bez reloadu
        const url = new URL(window.location);
        url.searchParams.set('line', lineId);
        window.history.pushState({}, '', url);
        
        // Aktualizuj barvy
        this.updateLineColors();
        
        // Překresli
        this.renderStations();
        this.updateDisplay();
        this.updateLineSelectorButtons();
        this.updateStartSelector();
        this.updateTerminalSelector();
        
        console.log(`[Metro] Přepnuto na linku ${lineId}`);
    }


    // Aktualizace barev podle aktuální linky
    updateLineColors() {
        const config = this.linesConfig[this.currentLine];
        const root = document.documentElement;
        
        root.style.setProperty('--line-color', config.color);
        root.style.setProperty('--line-text-color', config.textColor);
        
        // Aktualizuj badge linky
        const lineBadge = document.querySelector('.line-badge');
        if (lineBadge) {
            lineBadge.textContent = this.currentLine;
            lineBadge.style.background = config.color;
            lineBadge.style.color = config.textColor;
        }
        
        // Aktualizuj barvu tratě
        const routeLine = document.querySelector('.route-line');
        if (routeLine) {
            routeLine.style.background = config.color;
        }
    }

    // Aktualizace tlačítek přepínače linek
    updateLineSelectorButtons() {
        const buttons = document.querySelectorAll('.line-selector .line-btn');
        buttons.forEach(btn => {
            const lineId = btn.dataset.line;
            btn.classList.toggle('active', lineId === this.currentLine);
        });
    }

    init() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        
        // Nastav barvy pro aktuální linku
        this.updateLineColors();
        
        // Přidej disabled line element
        this.createDisabledLineElement();
        
        this.renderStations();
        this.updateDisplay();
        this.setupControls();
        this.setupLineSelector();
        
        // Výchozí režim: simulace (nepřipojovat k backendu automaticky)
        // Pro API režim klikni na tlačítko "📡 API"
        this.useBackend = false;
        this.connectionStatus = 'disconnected';
        console.log('[Metro] Spuštěno v simulačním režimu. Pro API klikni na tlačítko.');
    }

    // Vytvoření elementu pro disabled část linky
    createDisabledLineElement() {
        const routeContainer = document.querySelector('.route-container');
        if (!routeContainer) return;
        
        // Kontrola zda už existuje
        if (!document.querySelector('.route-line-disabled')) {
            const disabledLine = document.createElement('div');
            disabledLine.className = 'route-line-disabled';
            routeContainer.appendChild(disabledLine);
        }
    }

    // Nastavení přepínače linek
    setupLineSelector() {
        const selector = document.querySelector('.line-selector');
        if (!selector) return;
        
        selector.addEventListener('click', (e) => {
            const btn = e.target.closest('.line-btn');
            if (btn) {
                const lineId = btn.dataset.line;
                if (lineId && lineId !== this.currentLine) {
                    this.switchLine(lineId);
                }
            }
        });
        
        this.updateLineSelectorButtons();
    }

    // ====== Backend Connection ======
    connectToBackend() {
        const t = this.translations[this.language];
        this.connectionStatus = 'connecting';
        this.updateConnectionIndicator();
        
        const wsUrl = this.backendUrl.replace('http://', 'ws://').replace('https://', 'wss://');
        const wsEndpoint = `${wsUrl}/ws/metro/line-${this.currentLine.toLowerCase()}`;
        
        console.log(`[Metro] Connecting to WebSocket: ${wsEndpoint}`);
        
        try {
            this.ws = new WebSocket(wsEndpoint);
            
            this.ws.onopen = () => {
                console.log('[Metro] WebSocket connected');
                this.connectionStatus = 'connected';
                this.wsReconnectAttempts = 0;
                this.useBackend = true;
                this.updateConnectionIndicator();
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleBackendUpdate(data);
                } catch (e) {
                    console.error('[Metro] Failed to parse WebSocket message:', e);
                }
            };
            
            this.ws.onclose = (event) => {
                console.log('[Metro] WebSocket closed:', event.code, event.reason);
                this.connectionStatus = 'disconnected';
                this.useBackend = false;
                this.updateConnectionIndicator();
                this.scheduleReconnect();
            };
            
            this.ws.onerror = (error) => {
                console.error('[Metro] WebSocket error:', error);
                this.connectionStatus = 'disconnected';
                this.updateConnectionIndicator();
            };
            
        } catch (error) {
            console.error('[Metro] Failed to create WebSocket:', error);
            this.connectionStatus = 'disconnected';
            this.updateConnectionIndicator();
            this.scheduleReconnect();
        }
    }

    scheduleReconnect() {
        // Nepřipojovat znovu pokud jsme v simulačním režimu
        if (!this.useBackend) {
            console.log('[Metro] V simulačním režimu - nepřipojuji se znovu');
            return;
        }
        
        if (this.wsReconnectAttempts >= this.wsMaxReconnectAttempts) {
            console.log('[Metro] Max reconnect attempts reached, falling back to simulation');
            this.useBackend = false;
            this.updateModeButton();
            return;
        }
        
        this.wsReconnectAttempts++;
        const delay = this.wsReconnectDelay * Math.min(this.wsReconnectAttempts, 5);
        console.log(`[Metro] Reconnecting in ${delay}ms (attempt ${this.wsReconnectAttempts})`);
        
        setTimeout(() => {
            if (this.useBackend) {
                this.connectToBackend();
            }
        }, delay);
    }

    handleBackendUpdate(data) {
        this.lastBackendUpdate = new Date();
        
        if (data.type === 'update') {
            const source = data.source;
            
            if (source === 'simulation' && data.train) {
                // Backend simulation data
                const train = data.train;
                
                // Update position if not currently in local simulation
                if (!this.isMoving || this.useBackend) {
                    this.currentStationIndex = train.currentStationIndex;
                    this.direction = train.direction;
                    
                    // Update delay
                    if (train.delay !== undefined) {
                        this.setDelay(train.delay);
                    }
                    
                    // Update countdown
                    if (train.arrivalSeconds !== undefined) {
                        this.arrivalCountdown = train.arrivalSeconds;
                        this.totalTravelTime = 90; // Standard travel time
                        this.isMoving = train.progress > 0 && train.progress < 1;
                    }
                    
                    this.updateDisplay();
                }
            } else if (source === 'gtfs-rt' && data.trains) {
                // Real GTFS-RT data
                const trains = data.trains;
                if (trains.length > 0) {
                    // Use first train for display
                    const nextTrain = trains[0];
                    
                    // Convert arrival minutes to display
                    this.arrivalCountdown = nextTrain.arrival_min * 60;
                    this.totalTravelTime = Math.max(this.arrivalCountdown, 90);
                    this.direction = nextTrain.direction;
                    
                    if (nextTrain.delay) {
                        this.setDelay(nextTrain.delay);
                    }
                    
                    this.updateDisplay();
                }
            }
            
            this.updateConnectionIndicator();
        }
    }

    updateConnectionIndicator() {
        const t = this.translations[this.language];
        const indicator = document.getElementById('connection-indicator');
        
        if (indicator) {
            let text = '';
            let className = 'connection-indicator';
            
            switch (this.connectionStatus) {
                case 'connected':
                    text = this.useBackend ? t.connected : t.simulation;
                    className += ' connected';
                    break;
                case 'connecting':
                    text = t.connecting;
                    className += ' connecting';
                    break;
                case 'disconnected':
                default:
                    text = t.disconnected;
                    className += ' disconnected';
                    break;
            }
            
            indicator.textContent = text;
            indicator.className = className;
        }
    }

    setupControls() {
        const t = this.translations[this.language];
        const controlsHTML = `
            <div class="simulation-controls">
                <div class="connection-indicator disconnected" id="connection-indicator">${t.disconnected}</div>
                <button id="btn-mode" class="control-btn mode-btn">🔄 Simulace</button>
                <button id="btn-start" class="control-btn">${t.start}</button>
                <button id="btn-pause" class="control-btn">${t.pause}</button>
                <button id="btn-reset" class="control-btn">${t.reset}</button>
                <button id="btn-reverse" class="control-btn">${t.reverse}</button>
                <div class="start-selector" id="start-selector-container">
                    <label>Výchozí:</label>
                    <select id="start-selector">
                        <!-- Bude naplněno JavaScriptem -->
                    </select>
                </div>
                <div class="terminal-selector" id="terminal-selector-container">
                    <label>Konečná:</label>
                    <select id="terminal-selector">
                        <!-- Bude naplněno JavaScriptem -->
                    </select>
                </div>
                <button id="btn-language" class="control-btn lang-btn">${t.language}</button>
                <div class="speed-control">
                    <label>${t.speed} <span id="speed-value">1x</span></label>
                    <input type="range" id="speed-slider" min="1" max="20" value="1">
                </div>
                <div class="delay-indicator" id="delay-indicator">
                    <span class="delay-icon">⏱</span>
                    <span id="delay-text">${t.noDelay}</span>
                </div>
                <div class="status-display">
                    <span id="status-text">${t.ready}</span>
                </div>
            </div>
        `;
        
        const container = document.querySelector('.display-container');
        if (container) {
            container.insertAdjacentHTML('beforeend', controlsHTML);
            
            document.getElementById('btn-start')?.addEventListener('click', () => this.startSimulation());
            document.getElementById('btn-pause')?.addEventListener('click', () => this.togglePause());
            document.getElementById('btn-reset')?.addEventListener('click', () => this.resetSimulation());
            document.getElementById('btn-reverse')?.addEventListener('click', () => this.reverseDirection());
            document.getElementById('btn-language')?.addEventListener('click', () => this.toggleLanguage());
            document.getElementById('btn-mode')?.addEventListener('click', () => this.toggleMode());
            document.getElementById('speed-slider')?.addEventListener('input', (e) => this.setSpeed(e.target.value));
            document.getElementById('terminal-selector')?.addEventListener('change', (e) => this.setCustomTerminal(e.target.value));
            document.getElementById('start-selector')?.addEventListener('change', (e) => this.setStartStation(e.target.value));
            
            // Naplnit dropdown pro výběr konečné a výchozí stanice
            this.updateStartSelector();
            this.updateTerminalSelector();
        }
        
        // Aktualizuj tlačítko režimu
        this.updateModeButton();
    }

    // Aktualizace dropdownu pro výběr výchozí stanice
    updateStartSelector() {
        const selector = document.getElementById('start-selector');
        if (!selector) return;
        
        const config = this.linesConfig[this.currentLine];
        const possibleTerminals = config.possibleTerminals || [];
        const stations = config.stations;
        
        // Vymazat současné možnosti
        selector.innerHTML = '';
        
        // Přidat výchozí možnost (konečná stanice podle směru)
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = this.direction === 'last' ? config.terminals.first : config.terminals.last;
        selector.appendChild(defaultOption);
        
        // Přidat všechny možné výchozí stanice (possibleTerminals)
        possibleTerminals.forEach(terminalId => {
            const stationIdx = stations.findIndex(s => s.id === terminalId);
            if (stationIdx === -1) return;
            
            const station = stations[stationIdx];
            
            // Přeskočit skutečné konečné stanice (ty jsou už ve výchozí možnosti)
            if (stationIdx === 0 || stationIdx === stations.length - 1) return;
            
            // Podle směru zobrazit pouze stanice, které jsou "za námi" (mohou být výchozí)
            let isValid = false;
            if (this.direction === 'last' && stationIdx < this.stations.length - 1) {
                // Směr k poslední stanici - můžeme začít z jakékoli stanice před konečnou
                isValid = true;
            } else if (this.direction === 'first' && stationIdx > 0) {
                // Směr k první stanici - můžeme začít z jakékoli stanice za první
                isValid = true;
            }
            
            if (isValid) {
                const option = document.createElement('option');
                option.value = terminalId;
                option.textContent = station.name;
                if (this.customStartStation === terminalId) {
                    option.selected = true;
                }
                selector.appendChild(option);
            }
        });
    }

    // Nastavení vlastní výchozí stanice
    setStartStation(stationId) {
        if (!stationId) {
            this.customStartStation = null;
            // Reset na výchozí pozici
            if (this.direction === 'last') {
                this.currentStationIndex = 0;
            } else {
                this.currentStationIndex = this.stations.length - 1;
            }
            console.log(`[Metro] Výchozí stanice: výchozí konečná`);
        } else {
            this.customStartStation = stationId;
            const stationIdx = this.stations.findIndex(s => s.id === stationId);
            if (stationIdx !== -1) {
                this.currentStationIndex = stationIdx;
                const station = this.stations[stationIdx];
                console.log(`[Metro] Výchozí stanice změněna na: ${station?.name || stationId}`);
            }
        }
        this.updateDisplay();
        this.updateTerminalSelector(); // Aktualizovat možné konečné podle nové pozice
    }

    // Aktualizace dropdownu pro výběr konečné stanice
    updateTerminalSelector() {
        const selector = document.getElementById('terminal-selector');
        if (!selector) return;
        
        const config = this.linesConfig[this.currentLine];
        const possibleTerminals = config.possibleTerminals || [];
        
        // Vymazat současné možnosti
        selector.innerHTML = '';
        
        // Přidat výchozí možnost (celá linka)
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = this.direction === 'last' ? config.terminals.last : config.terminals.first;
        selector.appendChild(defaultOption);
        
        // Získat stanice podle směru
        const stations = config.stations;
        const currentIdx = this.currentStationIndex;
        
        // Filtrovat možné konečné podle směru
        possibleTerminals.forEach(terminalId => {
            const stationIdx = stations.findIndex(s => s.id === terminalId);
            if (stationIdx === -1) return;
            
            const station = stations[stationIdx];
            
            // Přeskočit konečné stanice (ty jsou vždy výchozí)
            if (stationIdx === 0 || stationIdx === stations.length - 1) return;
            
            // Podle směru zobrazit pouze stanice, které jsou "před námi"
            let isValid = false;
            if (this.direction === 'last' && stationIdx > currentIdx) {
                isValid = true;
            } else if (this.direction === 'first' && stationIdx < currentIdx) {
                isValid = true;
            }
            
            if (isValid) {
                const option = document.createElement('option');
                option.value = terminalId;
                option.textContent = station.name;
                if (this.customTerminal === terminalId) {
                    option.selected = true;
                }
                selector.appendChild(option);
            }
        });
    }

    // Nastavení vlastní konečné stanice
    setCustomTerminal(terminalId) {
        if (!terminalId) {
            this.customTerminal = null;
            console.log(`[Metro] Konečná: výchozí`);
        } else {
            this.customTerminal = terminalId;
            const station = this.stations.find(s => s.id === terminalId);
            console.log(`[Metro] Konečná změněna na: ${station?.name || terminalId}`);
        }
        this.updateDirectionDisplay();
        this.updateStationStyles();
        this.updatePassedLine();
    }

    // Získání aktuální konečné stanice (s ohledem na vlastní konečnou)
    getCurrentTerminal() {
        if (this.customTerminal) {
            const station = this.stations.find(s => s.id === this.customTerminal);
            return station ? station.name : this.linesConfig[this.currentLine].terminals[this.direction];
        }
        return this.linesConfig[this.currentLine].terminals[this.direction];
    }

    // Získání indexu konečné stanice
    getTerminalIndex() {
        if (this.customTerminal) {
            const idx = this.stations.findIndex(s => s.id === this.customTerminal);
            if (idx !== -1) return idx;
        }
        return this.direction === 'last' ? this.stations.length - 1 : 0;
    }

    // Přepnutí mezi simulací a API režimem
    toggleMode() {
        this.useBackend = !this.useBackend;
        
        if (this.useBackend) {
            // Připojit k backendu
            this.connectToBackend();
        } else {
            // Odpojit od backendu a přepnout na simulaci
            if (this.ws) {
                this.ws.close();
                this.ws = null;
            }
            this.connectionStatus = 'disconnected';
            this.updateConnectionIndicator();
            
            // Resetovat simulaci
            this.resetSimulation();
        }
        
        this.updateModeButton();
        console.log(`[Metro] Režim přepnut na: ${this.useBackend ? 'API' : 'Simulace'}`);
    }

    // Aktualizace tlačítka režimu
    updateModeButton() {
        const btn = document.getElementById('btn-mode');
        if (btn) {
            if (this.useBackend) {
                btn.textContent = '📡 API';
                btn.classList.add('api-mode');
                btn.classList.remove('sim-mode');
            } else {
                btn.textContent = '🔄 Simulace';
                btn.classList.add('sim-mode');
                btn.classList.remove('api-mode');
            }
        }
    }

    // Přepnutí jazyka
    toggleLanguage() {
        this.language = this.language === 'cs' ? 'en' : 'cs';
        this.updateAllLabels();
    }

    // Aktualizace všech textů podle jazyka
    updateAllLabels() {
        const t = this.translations[this.language];
        
        // Ovládací tlačítka
        const startBtn = document.getElementById('btn-start');
        const pauseBtn = document.getElementById('btn-pause');
        const resetBtn = document.getElementById('btn-reset');
        const reverseBtn = document.getElementById('btn-reverse');
        const langBtn = document.getElementById('btn-language');
        
        if (startBtn) startBtn.textContent = t.start;
        if (pauseBtn) pauseBtn.textContent = this.isPaused ? t.resume : t.pause;
        if (resetBtn) resetBtn.textContent = t.reset;
        if (reverseBtn) reverseBtn.textContent = t.reverse;
        if (langBtn) langBtn.textContent = t.language;
        
        // Info panel labely
        const nextLabel = document.querySelector('.next-label');
        const arrivalLabel = document.querySelector('.arrival-label');
        const arrivalUnit = document.querySelector('.arrival-unit');
        
        if (nextLabel) nextLabel.textContent = t.nextStation;
        if (arrivalLabel) arrivalLabel.textContent = t.arrivalIn;
        if (arrivalUnit) arrivalUnit.textContent = t.min;
        
        // Delay indicator
        this.updateDelayIndicator();
        
        // Speed label
        const speedLabel = document.querySelector('.speed-control label');
        if (speedLabel) {
            speedLabel.innerHTML = `${t.speed} <span id="speed-value">${this.simulationSpeed}x</span>`;
        }
        
        // Status aktualizace
        if (!this.isMoving) {
            this.updateStatus(t.ready);
        }
    }

    // Nastavení zpoždění
    setDelay(seconds) {
        this.delay = seconds;
        this.isDelayed = seconds > 0;
        this.updateDelayIndicator();
    }

    // Aktualizace indikátoru zpoždění
    updateDelayIndicator() {
        const t = this.translations[this.language];
        const delayText = document.getElementById('delay-text');
        const delayIndicator = document.getElementById('delay-indicator');
        
        if (delayText && delayIndicator) {
            if (this.delay > 0) {
                const mins = Math.floor(this.delay / 60);
                const secs = this.delay % 60;
                delayText.textContent = `+${mins}:${secs.toString().padStart(2, '0')}`;
                delayIndicator.classList.add('delayed');
            } else {
                delayText.textContent = t.noDelay;
                delayIndicator.classList.remove('delayed');
            }
        }
    }

    updateClock() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('cs-CZ', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        const clockEl = document.querySelector('.time');
        if (clockEl) {
            clockEl.textContent = timeStr;
        }
    }

    renderStations() {
        const stationsContainer = document.querySelector('.stations');
        if (!stationsContainer) return;
        
        stationsContainer.innerHTML = '';
        
        this.stations.forEach((station, index) => {
            const stationEl = document.createElement('div');
            stationEl.className = 'station';
            stationEl.dataset.stationIndex = index;
            
            // Přidání transfer tříd pro barvu kolečka
            if (station.transfer && station.transfer.length > 0) {
                stationEl.classList.add('transfer');
                // Přidání specifické třídy pro barvu podle přestupu na jinou linku metra
                if (station.transfer.includes('A')) stationEl.classList.add('transfer-a');
                if (station.transfer.includes('B')) stationEl.classList.add('transfer-b');
                if (station.transfer.includes('C')) stationEl.classList.add('transfer-c');
                if (station.transfer.includes('D')) stationEl.classList.add('transfer-d');
            }
            
            // Kolečko stanice
            const dot = document.createElement('div');
            dot.className = 'station-dot';
            
            // Název stanice s inline ikonami metra
            const name = document.createElement('div');
            name.className = 'station-name';
            name.innerHTML = station.name + this.generateMetroIcons(station);
            
            // Ikony pod linkou (vlak, autobus, letiště, ZOO)
            const belowIcons = this.generateBelowLineIcons(station);
            
            stationEl.appendChild(dot);
            stationEl.appendChild(name);
            if (belowIcons) {
                stationEl.insertAdjacentHTML('beforeend', belowIcons);
            }
            
            // Click handler pro nastavení aktuální stanice
            stationEl.addEventListener('click', () => {
                this.setCurrentStation(index);
            });
            
            stationsContainer.appendChild(stationEl);
        });
    }

    // Generování ikon metra (A, B, C, D) - zůstávají vedle názvu
    generateMetroIcons(station) {
        if (!station.transfer || station.transfer.length === 0) return '';
        
        let html = '<span class="transfer-inline">';
        
        station.transfer.forEach(t => {
            if (t === 'A' || t === 'B' || t === 'C' || t === 'D') {
                html += `<span class="icon metro-icon">${this.icons['metro' + t]}</span>`;
            }
        });
        
        html += '</span>';
        
        // Pokud nejsou žádné metro ikony, vrátíme prázdný string
        if (html === '<span class="transfer-inline"></span>') return '';
        
        return html;
    }

    // Generování ikon pod linkou (vlak, autobus, letiště, ZOO)
    generateBelowLineIcons(station) {
        if (!station.transfer || station.transfer.length === 0) return null;
        
        let icons = [];
        
        station.transfer.forEach(t => {
            switch(t) {
                case 'train':
                    icons.push(`<span class="below-icon">${this.icons.train}</span>`);
                    break;
                case 'bus':
                    icons.push(`<span class="below-icon">${this.icons.bus}</span>`);
                    break;
                case 'bus-airport':
                    icons.push(`<span class="below-icon airport">${this.icons.busAirport}</span>`);
                    break;
                case 'bus-zoo':
                    icons.push(`<span class="below-icon zoo"><span class="text-badge">ZOO</span></span>`);
                    break;
            }
        });
        
        if (icons.length === 0) return null;
        
        return `<div class="below-line-icons">${icons.join('')}</div>`;
    }

    generateInlineIcons(station) {
        // Tato metoda je nyní nahrazena generateMetroIcons() a generateBelowLineIcons()
        // Ponecháno pro zpětnou kompatibilitu, ale volá nové metody
        return this.generateMetroIcons(station);
    }

    updateDisplay() {
        this.updateStationStyles();
        this.updatePassedLine();
        this.updateNextStationInfo();
        this.updateDirectionDisplay();
    }

    updateStationStyles() {
        const stationEls = document.querySelectorAll('.station');
        const terminalIndex = this.getTerminalIndex();
        
        stationEls.forEach((el, index) => {
            el.classList.remove('current', 'passed', 'arriving', 'disabled');
            
            const station = this.stations[index];
            if (station.transfer && station.transfer.length > 0) {
                el.classList.add('transfer');
                station.transfer.forEach(t => {
                    if (t === 'A') el.classList.add('transfer-a');
                    if (t === 'B') el.classList.add('transfer-b');
                    if (t === 'D') el.classList.add('transfer-d');
                });
            }
            
            // Kontrola zda je stanice za vlastní konečnou (disabled)
            if (this.customTerminal) {
                if (this.direction === 'last' && index > terminalIndex) {
                    el.classList.add('disabled');
                } else if (this.direction === 'first' && index < terminalIndex) {
                    el.classList.add('disabled');
                }
            }
            
            // 'last' = směr k poslední stanici, 'first' = směr k první stanici
            if (this.direction === 'last') {
                if (index < this.currentStationIndex) {
                    el.classList.add('passed');
                } else if (index === this.currentStationIndex) {
                    el.classList.add('current');
                }
            } else {
                if (index > this.currentStationIndex) {
                    el.classList.add('passed');
                } else if (index === this.currentStationIndex) {
                    el.classList.add('current');
                }
            }
            
            const nextIndex = this.getNextStationIndex();
            if (index === nextIndex && this.isMoving && this.arrivalCountdown <= 5 && this.arrivalCountdown > 0) {
                el.classList.add('arriving');
            }
        });
    }

    getNextStationIndex() {
        if (this.direction === 'last') {
            return this.currentStationIndex + 1;
        } else {
            return this.currentStationIndex - 1;
        }
    }

    getTravelTimeToNextStation() {
        const nextIndex = this.getNextStationIndex();
        
        if (nextIndex < 0 || nextIndex >= this.stations.length) {
            return 0;
        }
        
        if (this.direction === 'last') {
            return this.stations[this.currentStationIndex].travelTime;
        } else {
            return this.stations[nextIndex].travelTime;
        }
    }

    updatePassedLine() {
        const passedLine = document.querySelector('.route-line-passed');
        const disabledLine = document.querySelector('.route-line-disabled');
        const routeLine = document.querySelector('.route-line');
        if (!passedLine || !routeLine) return;
        
        const totalStations = this.stations.length - 1;
        const terminalIndex = this.getTerminalIndex();
        
        // Získej skutečnou šířku linky (bez paddingu 50px na každé straně)
        const lineWidth = routeLine.offsetWidth;
        
        let progressOffset = 0;
        if (this.isMoving && this.totalTravelTime > 0 && this.arrivalCountdown > 0) {
            const progress = 1 - (this.arrivalCountdown / this.totalTravelTime);
            progressOffset = (progress / totalStations) * lineWidth;
        }
        
        // 'last' = směr k poslední stanici (doprava)
        if (this.direction === 'last') {
            const passedWidth = (this.currentStationIndex / totalStations) * lineWidth + progressOffset;
            passedLine.style.left = '50px';
            passedLine.style.right = 'auto';
            passedLine.style.width = `${Math.min(Math.max(passedWidth, 0), lineWidth)}px`;
            
            // Disabled část za vlastní konečnou (začíná UPROSTŘED kolečka konečné stanice)
            if (disabledLine && this.customTerminal && terminalIndex < totalStations) {
                // Šířka disabled části = od terminálu do konce
                const disabledWidth = ((totalStations - terminalIndex) / totalStations) * lineWidth;
                disabledLine.style.left = 'auto';
                disabledLine.style.right = '50px';
                disabledLine.style.width = `${Math.max(disabledWidth, 0)}px`;
            } else if (disabledLine) {
                disabledLine.style.width = '0px';
            }
        } else {
            // 'first' = směr k první stanici (doleva)
            const passedWidth = ((totalStations - this.currentStationIndex) / totalStations) * lineWidth + progressOffset;
            passedLine.style.left = 'auto';
            passedLine.style.right = '50px';
            passedLine.style.width = `${Math.min(Math.max(passedWidth, 0), lineWidth)}px`;
            
            // Disabled část za vlastní konečnou (při směru doleva - začíná UPROSTŘED kolečka konečné)
            if (disabledLine && this.customTerminal && terminalIndex > 0) {
                // Šířka disabled části = od začátku do terminálu
                const disabledWidth = (terminalIndex / totalStations) * lineWidth;
                disabledLine.style.left = '50px';
                disabledLine.style.right = 'auto';
                disabledLine.style.width = `${Math.max(disabledWidth, 0)}px`;
            } else if (disabledLine) {
                disabledLine.style.width = '0px';
            }
        }
    }

    updateNextStationInfo() {
        const t = this.translations[this.language];
        const nextNameEl = document.querySelector('.next-name');
        const arrivalEl = document.querySelector('.arrival-value');
        const nextLabel = document.querySelector('.next-label');
        const arrivalLabel = document.querySelector('.arrival-label');
        const arrivalUnit = document.querySelector('.arrival-unit');
        
        const currentStation = this.stations[this.currentStationIndex];
        const nextIndex = this.getNextStationIndex();
        const nextStation = nextIndex >= 0 && nextIndex < this.stations.length 
            ? this.stations[nextIndex] 
            : null;
        
        // Zobrazení podle stavu vlaku
        if (this.isAtStation) {
            // Vlak je ve stanici
            if (nextLabel) nextLabel.textContent = t.atStation;
            if (nextNameEl) nextNameEl.textContent = currentStation.name;
            if (arrivalLabel) arrivalLabel.textContent = t.nextStation.replace(':', '');
            if (arrivalEl) arrivalEl.textContent = nextStation ? nextStation.name : t.terminus;
            if (arrivalUnit) arrivalUnit.textContent = '';
        } else {
            // Vlak je v pohybu
            if (nextLabel) nextLabel.textContent = t.nextStation;
            if (nextNameEl) nextNameEl.textContent = nextStation ? nextStation.name : t.terminus;
            if (arrivalLabel) arrivalLabel.textContent = t.arrivalIn;
            if (arrivalUnit) arrivalUnit.textContent = t.min;
            
            if (arrivalEl) {
                if (this.isMoving && this.arrivalCountdown > 0) {
                    const displayTime = Math.max(0, this.arrivalCountdown);
                    const minutes = Math.floor(displayTime / 60);
                    const secs = Math.floor(displayTime % 60);
                    arrivalEl.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
                } else if (this.isMoving) {
                    arrivalEl.textContent = '0:00';
                } else {
                    arrivalEl.textContent = '--:--';
                }
            }
        }
    }

    updateDirectionDisplay() {
        const directionText = document.querySelector('.direction-text');
        const terminusEl = document.getElementById('terminus');
        
        if (directionText || terminusEl) {
            const terminus = this.getCurrentTerminal();
            const arrow = this.direction === 'last' ? '→' : '←';
            
            if (terminusEl) {
                terminusEl.textContent = terminus;
                const arrowEl = document.querySelector('.direction-arrow');
                if (arrowEl) arrowEl.textContent = arrow;
            } else if (directionText) {
                directionText.innerHTML = `<span class="direction-arrow">${arrow}</span><span id="terminus">${terminus}</span>`;
            }
        }
    }

    updateStatus(text) {
        const statusEl = document.getElementById('status-text');
        if (statusEl) {
            statusEl.textContent = text;
        }
    }

    startSimulation() {
        const t = this.translations[this.language];
        if (this.countdownInterval) return;
        
        this.isMoving = true;
        this.isPaused = false;
        this.updateStatus(t.running);
        
        this.moveToNextStation();
    }

    moveToNextStation() {
        const t = this.translations[this.language];
        const nextIndex = this.getNextStationIndex();
        const terminalIndex = this.getTerminalIndex();
        
        // Kontrola zda jsme na konečné (vlastní nebo výchozí)
        if (nextIndex < 0 || nextIndex >= this.stations.length) {
            this.arriveAtTerminus();
            return;
        }
        
        // Kontrola zda jsme dosáhli vlastní konečné
        if (this.customTerminal) {
            if (this.direction === 'last' && this.currentStationIndex >= terminalIndex) {
                this.arriveAtTerminus();
                return;
            }
            if (this.direction === 'first' && this.currentStationIndex <= terminalIndex) {
                this.arriveAtTerminus();
                return;
            }
        }
        
        this.isAtStation = false; // Vlak vyjíždí ze stanice
        this.totalTravelTime = this.getTravelTimeToNextStation();
        this.arrivalCountdown = this.totalTravelTime;
        
        const nextStation = this.stations[nextIndex];
        this.updateStatus(`${t.next} ${nextStation.name}`);
        
        this.countdownInterval = setInterval(() => {
            if (this.isPaused) return;
            
            const decrement = (this.tickInterval / 1000) * this.simulationSpeed;
            this.arrivalCountdown -= decrement;
            
            if (this.arrivalCountdown <= 0) {
                this.arrivalCountdown = 0;
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                this.arriveAtStation(nextIndex);
            }
            
            this.updateDisplay();
        }, this.tickInterval);
    }

    arriveAtStation(stationIndex) {
        const t = this.translations[this.language];
        this.currentStationIndex = stationIndex;
        this.isAtStation = true; // Vlak dorazil do stanice
        const station = this.stations[stationIndex];
        
        this.updateStatus(`${t.station} ${station.name}`);
        this.arrivalCountdown = 0;
        this.totalTravelTime = 0;
        this.updateDisplay();
        this.updateTerminalSelector(); // Aktualizuj dostupné konečné
        
        // Přehrání zvuku příjezdu (volitelné)
        this.playArrivalSound();
        
        // Kontrola zda jsme dosáhli vlastní konečné
        if (this.customTerminal && this.stations[stationIndex].id === this.customTerminal) {
            this.arriveAtTerminus();
            return;
        }
        
        const stopTime = (this.stationStopTime / this.simulationSpeed) * 1000;
        
        setTimeout(() => {
            if (!this.isPaused && this.isMoving) {
                this.moveToNextStation();
            }
        }, stopTime);
    }

    // Zvukový efekt příjezdu (volitelný)
    playArrivalSound() {
        // Pokud chcete zvuk, odkomentujte:
        // const audio = new Audio('sounds/arrival.mp3');
        // audio.volume = 0.3;
        // audio.play().catch(() => {});
    }

    arriveAtTerminus() {
        const t = this.translations[this.language];
        this.isMoving = false;
        this.arrivalCountdown = 0;
        this.totalTravelTime = 0;
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        const terminus = this.getCurrentTerminal();
        this.updateStatus(`${t.terminus}: ${terminus}`);
        this.updateDisplay();
        
        const waitTime = (30 / this.simulationSpeed) * 1000;
        setTimeout(() => {
            if (!this.isMoving) {
                this.reverseDirection();
                const t2 = this.translations[this.language];
                this.updateStatus(t2.readyToDepart);
            }
        }, waitTime);
    }

    togglePause() {
        const t = this.translations[this.language];
        this.isPaused = !this.isPaused;
        
        const pauseBtn = document.getElementById('btn-pause');
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? t.resume : t.pause;
        }
        
        this.updateStatus(this.isPaused ? t.paused : t.running);
    }

    resetSimulation() {
        const t = this.translations[this.language];
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // Nastav na vlastní výchozí stanici nebo první/poslední podle směru
        if (this.customStartStation) {
            const stationIdx = this.stations.findIndex(s => s.id === this.customStartStation);
            if (stationIdx !== -1) {
                this.currentStationIndex = stationIdx;
            } else if (this.direction === 'last') {
                this.currentStationIndex = 0;
            } else {
                this.currentStationIndex = this.stations.length - 1;
            }
        } else if (this.direction === 'last') {
            this.currentStationIndex = 0;
        } else {
            this.currentStationIndex = this.stations.length - 1;
        }
        
        this.isMoving = false;
        this.isPaused = false;
        this.arrivalCountdown = 0;
        this.totalTravelTime = 0;
        
        this.updateDisplay();
        this.updateStatus(t.ready);
        
        const pauseBtn = document.getElementById('btn-pause');
        if (pauseBtn) {
            pauseBtn.textContent = t.pause;
        }
    }

    reverseDirection() {
        const t = this.translations[this.language];
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // Přepni směr: 'last' <-> 'first'
        this.direction = this.direction === 'last' ? 'first' : 'last';
        
        // Resetuj vlastní konečnou a výchozí při obratu
        this.customTerminal = null;
        this.customStartStation = null;
        
        // Nastav na správnou výchozí stanici podle nového směru
        if (this.direction === 'last') {
            this.currentStationIndex = 0;
        } else {
            this.currentStationIndex = this.stations.length - 1;
        }
        
        this.isMoving = false;
        this.arrivalCountdown = 0;
        this.totalTravelTime = 0;
        
        this.updateDisplay();
        this.updateStartSelector();
        this.updateTerminalSelector();
        
        // Zobraz nový koncový terminus
        const newTerminus = this.getCurrentTerminal();
        this.updateStatus(`${t.direction} ${newTerminus}`);
        
        const pauseBtn = document.getElementById('btn-pause');
        if (pauseBtn) {
            pauseBtn.textContent = t.pause;
        }
    }

    setSpeed(speed) {
        this.simulationSpeed = parseInt(speed);
        
        const speedValue = document.getElementById('speed-value');
        if (speedValue) {
            speedValue.textContent = `${this.simulationSpeed}x`;
        }
    }

    setCurrentStation(index) {
        if (index >= 0 && index < this.stations.length) {
            this.currentStationIndex = index;
            this.updateDisplay();
        }
    }
}

// Inicializace
document.addEventListener('DOMContentLoaded', () => {
    window.metroMap = new MetroMap();
});
