/**
 * Metro Praha - Displej zamknutý na konkrétní soupravu
 * 
 * PRODUKČNÍ VERZE PRO KONKRÉTNÍ VLAK:
 * - Displej je zamknutý na konkrétní soupravu dle vehicle_id
 * - Bez ovládacích prvků
 * - Automatické připojení k API s filtrováním dle train ID
 * - Automatický fullscreen režim
 * - Fallback na simulaci při výpadku API nebo nenalezení vlaku
 * 
 * URL parametry:
 *   ?train=VEHICLE_ID    - ID soupravy z GTFS-RT (POVINNÉ pro reálná data)
 *   ?line=A|B|C          - Výběr linky (výchozí: C)
 *   ?backend=url         - URL backendu (výchozí: localhost:8000)
 *   ?terminal=station-id - Vlastní konečná stanice
 *   ?lang=cs|en          - Jazyk (výchozí: cs)
 *   ?direction=first|last - Počáteční směr (výchozí: last)
 *   ?simulation=true     - Vynuceně simulační režim
 *   ?debug=true          - Zapne debug výpisy
 */

class MetroTrainLocked {
    constructor() {
        // Konfigurace všech linek metra
        this.linesConfig = {
            'A': {
                color: '#00A651',
                textColor: '#FFFFFF',
                terminals: { first: 'Nemocnice Motol', last: 'Depo Hostivař' },
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
                possibleTerminals: ['zlicin', 'nove-butovice', 'smichovske-nadrazi', 'florenc-b', 'ceskomoravska', 'vysocanska', 'cerny-most'],
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
        
        // URL parametry
        this.params = new URLSearchParams(window.location.search);
        
        // Train ID - klíčový parametr pro zamknutí na soupravu
        this.trainId = this.params.get('train') || null;
        this.trainFound = false;
        this.lastTrainUpdate = null;
        
        // Aktuální linka
        this.currentLine = this.getLineFromUrl() || 'C';
        this.stations = this.linesConfig[this.currentLine].stations;
        
        // Stav aplikace
        this.direction = this.params.get('direction') || 'last';
        this.isMoving = false;
        this.isAtStation = true;
        this.arrivalCountdown = 0;
        this.totalTravelTime = 0;
        
        // Vlastní výchozí stanice
        this.customStartStation = this.params.get('start') || null;
        this.currentStationIndex = this.getStartStationIndex();
        
        // Vlastní konečná stanice
        this.customTerminal = this.params.get('terminal') || null;
        
        // Jazyk
        this.language = this.params.get('lang') || 'cs';
        this.translations = {
            cs: {
                nextStation: 'Příští stanice:',
                atStation: 'Ve stanici:',
                arrivalIn: 'Příjezd za:',
                departsIn: 'Odjezd za:',
                min: 'min',
                terminus: 'Konečná',
                noDelay: 'Bez zpoždění',
                trainNotFound: 'Souprava nenalezena',
                simulation: 'Simulace',
                connected: 'Online',
                searching: 'Hledám...'
            },
            en: {
                nextStation: 'Next station:',
                atStation: 'At station:',
                arrivalIn: 'Arriving in:',
                departsIn: 'Departing in:',
                min: 'min',
                terminus: 'Terminus',
                noDelay: 'On time',
                trainNotFound: 'Train not found',
                simulation: 'Simulation',
                connected: 'Online',
                searching: 'Searching...'
            }
        };
        
        // SVG ikony
        this.icons = {
            train: `<svg viewBox="0 0 24 24"><path d="M12 2C8 2 4 2.5 4 6v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l1.5-2h5l1.5 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm2 0V6h5v5h-5zm3.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
            bus: `<svg viewBox="0 0 24 24"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>`,
            busAirport: `<svg viewBox="0 0 32 24"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" fill="#fff"/><path d="M28 10v-1.5l-5-3V2.5c0-.55-.45-1-1-1s-1 .45-1 1v3l-5 3V10l5-1.5v4l-1.5 1v1.5l2.5-.75 2.5.75v-1.5l-1.5-1v-4l5 1.5z" fill="#0066CC"/></svg>`,
            metroA: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#00A651" stroke="#000" stroke-width="1"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold" font-family="Arial">A</text></svg>`,
            metroB: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#FFD500" stroke="#000" stroke-width="1"/><text x="12" y="16" text-anchor="middle" fill="#000" font-size="14" font-weight="bold" font-family="Arial">B</text></svg>`,
            metroC: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#E62F23" stroke="#000" stroke-width="1"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold" font-family="Arial">C</text></svg>`
        };
        
        // Backend připojení
        this.backendUrl = this.getBackendUrl();
        this.useBackend = !this.params.has('simulation');
        this.connectionStatus = 'disconnected'; // disconnected, connecting, connected, simulation
        
        // API polling
        this.apiPollingActive = false;
        this.apiPollTimeout = null;
        this.apiPollRate = 3000; // Poll každé 3 sekundy pro rychlejší detekci vlaku
        
        // Smooth animace
        this.animationFrame = null;
        this.lastFrameTime = 0;
        this.smoothProgress = 0;
        this.targetProgress = 0;
        
        // Simulační fallback
        this.tickInterval = 50;
        this.simulationSpeed = 1;
        this.stationStopTime = 15;
        
        // Debug mode
        this.debug = this.params.has('debug');
        
        this.init();
    }

    log(message, data = null) {
        if (this.debug) {
            if (data) {
                console.log(`[Metro Train-Locked] ${message}`, data);
            } else {
                console.log(`[Metro Train-Locked] ${message}`);
            }
        }
    }

    getLineFromUrl() {
        const line = this.params.get('line');
        if (line && this.linesConfig[line.toUpperCase()]) {
            return line.toUpperCase();
        }
        return null;
    }

    getBackendUrl() {
        const backend = this.params.get('backend');
        if (backend) {
            return backend.startsWith('http') ? backend : `http://${backend}`;
        }
        return `http://${window.location.hostname}:8000`;
    }

    getStartStationIndex() {
        if (this.customStartStation) {
            const idx = this.stations.findIndex(s => s.id === this.customStartStation);
            if (idx !== -1) {
                this.log(`Výchozí stanice: ${this.stations[idx].name}`);
                return idx;
            }
        }
        return this.direction === 'last' ? 0 : this.stations.length - 1;
    }

    init() {
        console.log('[Metro Train-Locked] Inicializace...');
        console.log(`[Metro Train-Locked] Train ID: ${this.trainId || 'NENÍ ZADÁNO'}`);
        console.log(`[Metro Train-Locked] Linka: ${this.currentLine}`);
        console.log(`[Metro Train-Locked] Backend: ${this.backendUrl}`);
        
        // Zobrazit Train ID badge
        this.updateTrainIdBadge();
        
        // Nastavit barvy linky
        this.updateLineColors();
        
        // Vytvořit disabled line element
        this.createDisabledLineElement();
        
        // Vykreslit stanice
        this.renderStations();
        
        // Spustit hodiny
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        
        // Aktualizovat displej
        this.updateDisplay();
        
        // Spustit simulaci jako základ
        this.log('Spouštění smooth simulace');
        this.startSimulation();
        
        // Připojit k API pokud máme train ID
        if (this.useBackend) {
            if (this.trainId) {
                this.connectionStatus = 'searching';
                this.updateConnectionStatus();
            }
            this.startApiPolling();
        } else {
            this.connectionStatus = 'simulation';
            this.updateConnectionStatus();
        }
        
        // Automatické přepnutí do fullscreen
        this.requestFullscreen();
    }

    updateTrainIdBadge() {
        const trainIdEl = document.getElementById('train-id');
        const trainLabelEl = document.querySelector('.train-label');
        
        if (trainIdEl) {
            if (this.trainId) {
                // Zkrátit trip_id pro zobrazení - vzít jen číslo tripu
                const parts = this.trainId.split('_');
                const tripNum = parts[1] || this.trainId;
                trainIdEl.textContent = `#${tripNum}`;
                trainIdEl.title = this.trainId; // Celé ID jako tooltip
            } else {
                trainIdEl.textContent = 'DEMO';
            }
        }
        
        if (trainLabelEl) {
            trainLabelEl.textContent = this.trainId ? 'Spoj:' : 'Režim:';
        }
    }

    updateConnectionStatus() {
        const statusEl = document.getElementById('connection-status');
        const statusText = document.getElementById('status-text');
        const t = this.translations[this.language];
        
        if (!statusEl || !statusText) return;
        
        statusEl.classList.remove('online', 'offline', 'searching');
        
        switch (this.connectionStatus) {
            case 'connected':
                statusEl.classList.add('online');
                statusText.textContent = t.connected;
                break;
            case 'searching':
                statusEl.classList.add('searching');
                statusText.textContent = t.searching;
                break;
            case 'simulation':
                statusEl.classList.add('offline');
                statusText.textContent = t.simulation;
                break;
            case 'train-not-found':
                statusEl.classList.add('offline');
                statusText.textContent = t.trainNotFound;
                break;
            default:
                statusEl.classList.add('offline');
                statusText.textContent = 'Offline';
        }
    }

    requestFullscreen() {
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => {
                this.log('Fullscreen vyžaduje uživatelskou interakci');
            });
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
        
        document.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                elem.requestFullscreen?.().catch(() => {});
            }
        }, { once: true });
    }

    updateLineColors() {
        const config = this.linesConfig[this.currentLine];
        const root = document.documentElement;
        
        root.style.setProperty('--line-color', config.color);
        root.style.setProperty('--line-text-color', config.textColor);
        
        const lineBadge = document.querySelector('.line-badge');
        if (lineBadge) {
            lineBadge.textContent = this.currentLine;
            lineBadge.style.background = config.color;
            lineBadge.style.color = config.textColor;
        }
        
        const routeLine = document.querySelector('.route-line');
        if (routeLine) {
            routeLine.style.background = config.color;
        }
    }

    createDisabledLineElement() {
        const routeContainer = document.querySelector('.route-container');
        if (!routeContainer) return;
        
        if (!document.querySelector('.route-line-disabled')) {
            const disabledLine = document.createElement('div');
            disabledLine.className = 'route-line-disabled';
            routeContainer.appendChild(disabledLine);
        }
    }

    // ====== REST API POLLING PRO KONKRÉTNÍ VLAK ======
    
    async startApiPolling() {
        this.log('Spouštění REST API polling');
        this.apiPollingActive = true;
        this.pollApi();
    }
    
    stopApiPolling() {
        this.apiPollingActive = false;
        if (this.apiPollTimeout) {
            clearTimeout(this.apiPollTimeout);
            this.apiPollTimeout = null;
        }
    }
    
    async pollApi() {
        if (!this.apiPollingActive) return;
        
        try {
            // Endpoint s filtrováním podle train ID
            let url = `${this.backendUrl}/api/metro/line/${this.currentLine}`;
            
            // Pokud máme train ID, přidáme ho jako parametr
            if (this.trainId) {
                url += `?train=${encodeURIComponent(this.trainId)}`;
            }
            
            this.log(`Polling API: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.handleApiResponse(data);
            
        } catch (error) {
            console.error('[Metro Train-Locked] API polling chyba:', error);
            
            // Pokud selhalo připojení, přepnout na simulaci
            if (this.connectionStatus !== 'simulation') {
                this.connectionStatus = 'simulation';
                this.updateConnectionStatus();
            }
        }
        
        // Naplánovat další poll
        this.apiPollTimeout = setTimeout(() => this.pollApi(), this.apiPollRate);
    }
    
    handleApiResponse(data) {
        if (!data.ok || !data.trains || data.trains.length === 0) {
            this.log('API: žádná data nebo prázdný seznam vlaků');
            
            // Vlak nenalezen
            if (this.trainId && this.connectionStatus !== 'train-not-found') {
                this.connectionStatus = 'train-not-found';
                this.updateConnectionStatus();
            }
            return;
        }
        
        let train = null;
        
        // Hledej náš konkrétní vlak podle train ID
        if (this.trainId) {
            train = data.trains.find(t => t.vehicle_id === this.trainId);
            
            if (!train) {
                this.log(`Vlak ${this.trainId} nenalezen v odpovědi`, data.trains.map(t => t.vehicle_id));
                
                // Vlak není v aktuálních datech
                if (this.trainFound) {
                    // Vlak byl dříve nalezen, ale teď ne - možná je v depu
                    this.log('Vlak ztracen - pravděpodobně v depu nebo mimo provoz');
                }
                
                this.trainFound = false;
                this.connectionStatus = 'train-not-found';
                this.updateConnectionStatus();
                return;
            }
        } else {
            // Bez train ID vezmi první vlak (fallback)
            train = data.trains[0];
        }
        
        // Vlak nalezen!
        this.trainFound = true;
        this.lastTrainUpdate = new Date();
        this.connectionStatus = 'connected';
        this.updateConnectionStatus();
        
        this.log('Vlak nalezen:', train);
        
        // Aktualizuj stav podle dat z API
        this.updateFromTrainData(train);
    }
    
    updateFromTrainData(train) {
        // Směr jízdy - určíme z headsign (konečná stanice)
        if (train.headsign) {
            const headsignIndex = this.findStationIndex(train.headsign);
            if (headsignIndex !== -1) {
                // Směr podle pozice konečné
                const midpoint = Math.floor(this.stations.length / 2);
                this.direction = headsignIndex > midpoint ? 'last' : 'first';
            }
        }
        
        // Příští stanice - použij next_station_name z API
        const nextStationName = train.next_station_name || train.next_station;
        if (nextStationName) {
            const nextStationIndex = this.findStationIndex(nextStationName);
            
            if (nextStationIndex !== -1) {
                // Stav vlaku: at_stop = ve stanici, on_track = mezi stanicemi
                if (train.state === 'at_stop') {
                    // Vlak stojí ve stanici
                    this.currentStationIndex = nextStationIndex;
                    this.isAtStation = true;
                    this.isMoving = false;
                } else {
                    // Vlak je mezi stanicemi - aktuální je o jednu zpět
                    this.currentStationIndex = this.direction === 'last' 
                        ? Math.max(0, nextStationIndex - 1)
                        : Math.min(this.stations.length - 1, nextStationIndex + 1);
                    this.isAtStation = false;
                    this.isMoving = true;
                    
                    // Nastav čas příjezdu (default 60s pokud není známý)
                    if (this.arrivalCountdown <= 0) {
                        this.arrivalCountdown = 60;
                        this.totalTravelTime = 90;
                    }
                }
            }
        }
        
        // Čas příjezdu - pokud API poskytuje
        if (train.arrival_min !== undefined) {
            const newArrival = train.arrival_min * 60;
            
            // Smooth aktualizace
            if (this.isMoving && this.arrivalCountdown > 0) {
                const diff = newArrival - this.arrivalCountdown;
                if (Math.abs(diff) > 30) {
                    this.arrivalCountdown = newArrival;
                } else {
                    this.arrivalCountdown += diff * 0.3;
                }
            } else {
                this.arrivalCountdown = newArrival;
            }
            
            this.totalTravelTime = Math.max(this.arrivalCountdown, 90);
        }
        
        // Zpoždění
        if (train.delay !== undefined) {
            this.delay = train.delay;
        }
        
        // Cílová stanice (konečná) - použij headsign
        if (train.headsign) {
            const terminalIndex = this.findStationIndex(train.headsign);
            if (terminalIndex !== -1) {
                this.customTerminal = this.stations[terminalIndex].id;
            }
        }
        
        this.log(`Updated: station=${this.stations[this.currentStationIndex]?.name}, next=${nextStationName}, direction=${this.direction}, atStation=${this.isAtStation}`);
        
        this.updateDisplay();
    }
    
    findStationIndex(stationName) {
        // Hledej podle názvu nebo ID
        return this.stations.findIndex(s => 
            s.name === stationName || 
            s.id === stationName ||
            s.name.toLowerCase() === stationName.toLowerCase() ||
            this.normalizeStationName(s.name) === this.normalizeStationName(stationName)
        );
    }
    
    normalizeStationName(name) {
        // Normalizace názvu stanice pro porovnání
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');
    }

    // ====== SIMULACE (FALLBACK) ======

    startSimulation() {
        if (this.animationFrame) return;
        
        this.log('Spouštění smooth simulace');
        this.isMoving = true;
        this.lastFrameTime = performance.now();
        this.moveToNextStation();
    }
    
    animationLoop(currentTime) {
        if (!this.isMoving) {
            this.animationFrame = null;
            return;
        }
        
        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        
        if (this.arrivalCountdown > 0) {
            this.arrivalCountdown -= deltaTime * this.simulationSpeed;
            
            if (this.arrivalCountdown <= 0) {
                this.arrivalCountdown = 0;
                const nextIndex = this.getNextStationIndex();
                this.arriveAtStation(nextIndex);
                return;
            }
        }
        
        this.updateDisplay();
        this.animationFrame = requestAnimationFrame((t) => this.animationLoop(t));
    }

    moveToNextStation() {
        const nextIndex = this.getNextStationIndex();
        const terminalIndex = this.getTerminalIndex();
        
        if (nextIndex < 0 || nextIndex >= this.stations.length) {
            this.arriveAtTerminus();
            return;
        }
        
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
        
        this.isAtStation = false;
        this.smoothProgress = 0;
        this.targetProgress = 0;
        this.totalTravelTime = this.getTravelTimeToNextStation();
        this.arrivalCountdown = this.totalTravelTime;
        
        this.lastFrameTime = performance.now();
        if (!this.animationFrame) {
            this.animationFrame = requestAnimationFrame((t) => this.animationLoop(t));
        }
    }

    arriveAtStation(stationIndex) {
        this.currentStationIndex = stationIndex;
        this.arrivalCountdown = 0;
        this.totalTravelTime = 0;
        this.smoothProgress = 0;
        this.targetProgress = 0;
        this.isAtStation = true;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        this.updateDisplay();
        
        if (this.customTerminal && this.stations[stationIndex].id === this.customTerminal) {
            this.arriveAtTerminus();
            return;
        }
        
        const stopTime = (this.stationStopTime / this.simulationSpeed) * 1000;
        setTimeout(() => {
            if (this.isMoving) {
                this.moveToNextStation();
            }
        }, stopTime);
    }

    arriveAtTerminus() {
        this.isMoving = false;
        this.arrivalCountdown = 0;
        this.totalTravelTime = 0;
        this.smoothProgress = 0;
        this.targetProgress = 0;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        this.updateDisplay();
        
        const waitTime = 30000 / this.simulationSpeed;
        setTimeout(() => {
            this.reverseDirection();
            this.startSimulation();
        }, waitTime);
    }

    reverseDirection() {
        this.direction = this.direction === 'last' ? 'first' : 'last';
        this.customTerminal = null;
        
        if (this.direction === 'last') {
            this.currentStationIndex = 0;
        } else {
            this.currentStationIndex = this.stations.length - 1;
        }
        
        this.arrivalCountdown = 0;
        this.totalTravelTime = 0;
        this.updateDisplay();
    }

    // ====== POMOCNÉ METODY ======

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

    getNextStationIndex() {
        return this.direction === 'last' 
            ? this.currentStationIndex + 1 
            : this.currentStationIndex - 1;
    }

    getTravelTimeToNextStation() {
        const nextIndex = this.getNextStationIndex();
        if (nextIndex < 0 || nextIndex >= this.stations.length) return 0;
        
        return this.direction === 'last' 
            ? this.stations[this.currentStationIndex].travelTime 
            : this.stations[nextIndex].travelTime;
    }

    getCurrentTerminal() {
        if (this.customTerminal) {
            const station = this.stations.find(s => s.id === this.customTerminal);
            return station ? station.name : this.linesConfig[this.currentLine].terminals[this.direction];
        }
        return this.linesConfig[this.currentLine].terminals[this.direction];
    }

    getTerminalIndex() {
        if (this.customTerminal) {
            const idx = this.stations.findIndex(s => s.id === this.customTerminal);
            if (idx !== -1) return idx;
        }
        return this.direction === 'last' ? this.stations.length - 1 : 0;
    }

    // ====== VYKRESLOVÁNÍ ======

    renderStations() {
        const stationsContainer = document.querySelector('.stations');
        if (!stationsContainer) return;
        
        stationsContainer.innerHTML = '';
        
        this.stations.forEach((station, index) => {
            const stationEl = document.createElement('div');
            stationEl.className = 'station';
            stationEl.dataset.stationIndex = index;
            
            if (station.transfer && station.transfer.length > 0) {
                stationEl.classList.add('transfer');
                if (station.transfer.includes('A')) stationEl.classList.add('transfer-a');
                if (station.transfer.includes('B')) stationEl.classList.add('transfer-b');
                if (station.transfer.includes('C')) stationEl.classList.add('transfer-c');
                if (station.transfer.includes('D')) stationEl.classList.add('transfer-d');
            }
            
            const dot = document.createElement('div');
            dot.className = 'station-dot';
            
            const name = document.createElement('div');
            name.className = 'station-name';
            name.innerHTML = station.name + this.generateMetroIcons(station);
            
            const belowIcons = this.generateBelowLineIcons(station);
            
            stationEl.appendChild(dot);
            stationEl.appendChild(name);
            if (belowIcons) {
                stationEl.insertAdjacentHTML('beforeend', belowIcons);
            }
            
            stationsContainer.appendChild(stationEl);
        });
    }

    generateMetroIcons(station) {
        if (!station.transfer || station.transfer.length === 0) return '';
        
        let html = '<span class="transfer-inline">';
        
        station.transfer.forEach(t => {
            if (t === 'A' || t === 'B' || t === 'C' || t === 'D') {
                html += `<span class="icon metro-icon">${this.icons['metro' + t]}</span>`;
            }
        });
        
        html += '</span>';
        
        if (html === '<span class="transfer-inline"></span>') return '';
        
        return html;
    }

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

    updateDisplay() {
        this.updateStationStyles();
        this.updatePassedLine();
        this.updateNextStationInfo();
        this.updateDirectionDisplay();
        this.broadcastStationUpdate();
    }
    
    broadcastStationUpdate() {
        if (!this.params.has('broadcast') && window.parent === window) {
            return;
        }
        
        const currentStation = this.stations[this.currentStationIndex];
        const nextIndex = this.getNextStationIndex();
        const nextStation = (nextIndex >= 0 && nextIndex < this.stations.length) 
            ? this.stations[nextIndex] 
            : null;
        
        const message = {
            type: 'metro-station-update',
            trainId: this.trainId,
            currentStation: currentStation ? currentStation.name : null,
            currentStationId: currentStation ? currentStation.id : null,
            nextStation: nextStation ? nextStation.name : null,
            nextStationId: nextStation ? nextStation.id : null,
            direction: this.direction,
            line: this.currentLine,
            isMoving: this.isMoving,
            isAtStation: this.isAtStation,
            arrivalCountdown: this.arrivalCountdown,
            connectionStatus: this.connectionStatus
        };
        
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(message, '*');
        }
    }

    updateStationStyles() {
        const stationEls = document.querySelectorAll('.station');
        const terminalIndex = this.getTerminalIndex();
        
        stationEls.forEach((el, index) => {
            el.classList.remove('current', 'passed', 'arriving', 'disabled');
            
            if (this.customTerminal) {
                if (this.direction === 'last' && index > terminalIndex) {
                    el.classList.add('disabled');
                } else if (this.direction === 'first' && index < terminalIndex) {
                    el.classList.add('disabled');
                }
            }
            
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

    updatePassedLine() {
        const passedLine = document.querySelector('.route-line-passed');
        const disabledLine = document.querySelector('.route-line-disabled');
        const routeLine = document.querySelector('.route-line');
        if (!passedLine || !routeLine) return;
        
        const totalStations = this.stations.length - 1;
        const terminalIndex = this.getTerminalIndex();
        const lineWidth = routeLine.offsetWidth;
        
        let progressOffset = 0;
        if (this.isMoving && this.totalTravelTime > 0) {
            const rawProgress = 1 - (this.arrivalCountdown / this.totalTravelTime);
            this.targetProgress = Math.max(0, Math.min(1, rawProgress));
            
            const lerpFactor = 0.15;
            this.smoothProgress += (this.targetProgress - this.smoothProgress) * lerpFactor;
            
            progressOffset = (this.smoothProgress / totalStations) * lineWidth;
        } else {
            this.smoothProgress = 0;
            this.targetProgress = 0;
        }
        
        if (this.direction === 'last') {
            const passedWidth = (this.currentStationIndex / totalStations) * lineWidth + progressOffset;
            passedLine.style.left = '50px';
            passedLine.style.right = 'auto';
            passedLine.style.width = `${Math.min(Math.max(passedWidth, 0), lineWidth)}px`;
            
            if (disabledLine && this.customTerminal && terminalIndex < totalStations) {
                const disabledWidth = ((totalStations - terminalIndex) / totalStations) * lineWidth;
                disabledLine.style.left = 'auto';
                disabledLine.style.right = '50px';
                disabledLine.style.width = `${Math.max(disabledWidth, 0)}px`;
            } else if (disabledLine) {
                disabledLine.style.width = '0px';
            }
        } else {
            const passedWidth = ((totalStations - this.currentStationIndex) / totalStations) * lineWidth + progressOffset;
            passedLine.style.left = 'auto';
            passedLine.style.right = '50px';
            passedLine.style.width = `${Math.min(Math.max(passedWidth, 0), lineWidth)}px`;
            
            if (disabledLine && this.customTerminal && terminalIndex > 0) {
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
        
        if (this.isAtStation) {
            if (nextLabel) nextLabel.textContent = t.atStation;
            if (nextNameEl) nextNameEl.textContent = currentStation.name;
            if (arrivalLabel) arrivalLabel.textContent = t.nextStation.replace(':', '');
            if (arrivalEl) arrivalEl.textContent = nextStation ? nextStation.name : t.terminus;
            if (arrivalUnit) arrivalUnit.textContent = '';
        } else {
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
        const terminusEl = document.getElementById('terminus');
        const arrowEl = document.querySelector('.direction-arrow');
        
        if (terminusEl) {
            terminusEl.textContent = this.getCurrentTerminal();
        }
        
        if (arrowEl) {
            arrowEl.textContent = this.direction === 'last' ? '→' : '←';
        }
    }
}

// ====== INICIALIZACE ======
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Metro Train-Locked] Metro Praha - Displej zamknutý na soupravu');
    window.metroTrainLocked = new MetroTrainLocked();
});
