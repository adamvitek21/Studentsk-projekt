/**
 * Metro Praha - Produkční displej pro informační panely v soupravách metra
 * 
 * PRODUKČNÍ VERZE:
 * - Bez ovládacích prvků
 * - Automatické připojení k API
 * - Automatický fullscreen režim
 * - Fallback na simulaci při výpadku API
 * 
 * URL parametry:
 *   ?line=A|B|C          - Výběr linky (výchozí: C)
 *   ?backend=url         - URL backendu (výchozí: localhost:8000)
 *   ?terminal=station-id - Vlastní konečná stanice
 *   ?lang=cs|en          - Jazyk (výchozí: cs)
 *   ?direction=first|last - Počáteční směr (výchozí: last)
 *   ?simulation=true     - Vynuceně simulační režim
 */

class MetroMapProduction {
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
        
        // Aktuální linka
        this.currentLine = this.getLineFromUrl() || 'C';
        this.stations = this.linesConfig[this.currentLine].stations;
        
        // Stav aplikace
        this.direction = this.params.get('direction') || 'last';
        this.isMoving = false;
        this.isAtStation = true; // Vlak je ve stanici (ne v pohybu)
        this.arrivalCountdown = 0;
        this.totalTravelTime = 0;
        
        // Vlastní výchozí stanice (z URL parametru 'start')
        this.customStartStation = this.params.get('start') || null;
        this.currentStationIndex = this.getStartStationIndex();
        
        // Vlastní konečná stanice
        this.customTerminal = this.params.get('terminal') || null;
        
        // Zpoždění
        this.delay = 0;
        
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
                noDelay: 'Bez zpoždění'
            },
            en: {
                nextStation: 'Next station:',
                atStation: 'At station:',
                arrivalIn: 'Arriving in:',
                departsIn: 'Departing in:',
                min: 'min',
                terminus: 'Terminus',
                noDelay: 'On time'
            }
        };
        
        // SVG ikony
        this.icons = {
            train: `<svg viewBox="0 0 24 24"><path d="M12 2C8 2 4 2.5 4 6v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l1.5-2h5l1.5 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm2 0V6h5v5h-5zm3.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
            bus: `<svg viewBox="0 0 24 24"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>`,
            plane: `<svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`,
            metroA: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#00A651" stroke="#000" stroke-width="1"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold" font-family="Arial">A</text></svg>`,
            metroB: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#FFD500" stroke="#000" stroke-width="1"/><text x="12" y="16" text-anchor="middle" fill="#000" font-size="14" font-weight="bold" font-family="Arial">B</text></svg>`,
            metroC: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#E62F23" stroke="#000" stroke-width="1"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold" font-family="Arial">C</text></svg>`
        };
        
        // Backend připojení
        this.backendUrl = this.getBackendUrl();
        this.ws = null;
        this.wsReconnectAttempts = 0;
        this.wsMaxReconnectAttempts = Infinity; // Neomezené pokusy v produkci
        this.wsReconnectDelay = 3000;
        this.useBackend = !this.params.has('simulation');
        this.connectionStatus = 'disconnected';
        
        // Simulační fallback
        this.simulationInterval = null;
        this.tickInterval = 100;
        this.simulationSpeed = 1;
        this.stationStopTime = 20;
        
        this.init();
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

    // Získání indexu výchozí stanice
    getStartStationIndex() {
        if (this.customStartStation) {
            const idx = this.stations.findIndex(s => s.id === this.customStartStation);
            if (idx !== -1) {
                console.log(`[Metro Production] Výchozí stanice: ${this.stations[idx].name}`);
                return idx;
            }
        }
        // Výchozí podle směru
        return this.direction === 'last' ? 0 : this.stations.length - 1;
    }

    init() {
        console.log('[Metro Production] Inicializace...');
        console.log(`[Metro Production] Linka: ${this.currentLine}`);
        console.log(`[Metro Production] Backend: ${this.backendUrl}`);
        console.log(`[Metro Production] Jazyk: ${this.language}`);
        
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
        
        // Připojit k API nebo spustit simulaci
        if (this.useBackend) {
            this.connectToBackend();
        } else {
            console.log('[Metro Production] Simulační režim aktivován');
            this.startSimulation();
        }
        
        // Automatické přepnutí do fullscreen
        this.requestFullscreen();
    }

    requestFullscreen() {
        // Pokus o fullscreen (může být blokován bez uživatelské interakce)
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => {
                console.log('[Metro Production] Fullscreen vyžaduje uživatelskou interakci');
            });
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        
        // Přidat listener pro fullscreen na klik
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

    // ====== BACKEND CONNECTION ======

    connectToBackend() {
        this.connectionStatus = 'connecting';
        
        const wsUrl = this.backendUrl.replace('http://', 'ws://').replace('https://', 'wss://');
        const wsEndpoint = `${wsUrl}/ws/metro/line-${this.currentLine.toLowerCase()}`;
        
        console.log(`[Metro Production] Připojování k WebSocket: ${wsEndpoint}`);
        
        try {
            this.ws = new WebSocket(wsEndpoint);
            
            this.ws.onopen = () => {
                console.log('[Metro Production] WebSocket připojen');
                this.connectionStatus = 'connected';
                this.wsReconnectAttempts = 0;
                
                // Zastavit simulaci pokud běží
                if (this.simulationInterval) {
                    clearInterval(this.simulationInterval);
                    this.simulationInterval = null;
                }
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleBackendUpdate(data);
                } catch (e) {
                    console.error('[Metro Production] Chyba parsování zprávy:', e);
                }
            };
            
            this.ws.onclose = (event) => {
                console.log(`[Metro Production] WebSocket odpojen: ${event.code}`);
                this.connectionStatus = 'disconnected';
                this.scheduleReconnect();
            };
            
            this.ws.onerror = (error) => {
                console.error('[Metro Production] WebSocket chyba:', error);
                this.connectionStatus = 'disconnected';
            };
            
        } catch (error) {
            console.error('[Metro Production] Chyba při vytváření WebSocket:', error);
            this.connectionStatus = 'disconnected';
            this.scheduleReconnect();
        }
    }

    scheduleReconnect() {
        this.wsReconnectAttempts++;
        const delay = Math.min(this.wsReconnectDelay * Math.pow(1.5, this.wsReconnectAttempts - 1), 30000);
        
        console.log(`[Metro Production] Opětovné připojení za ${Math.round(delay / 1000)}s (pokus ${this.wsReconnectAttempts})`);
        
        // Spustit simulaci jako fallback
        if (!this.simulationInterval) {
            console.log('[Metro Production] Aktivace fallback simulace');
            this.startSimulation();
        }
        
        setTimeout(() => {
            if (this.useBackend) {
                this.connectToBackend();
            }
        }, delay);
    }

    handleBackendUpdate(data) {
        if (data.type === 'update') {
            const source = data.source;
            
            if (source === 'simulation' && data.train) {
                const train = data.train;
                this.currentStationIndex = train.currentStationIndex;
                this.direction = train.direction;
                
                if (train.delay !== undefined) {
                    this.setDelay(train.delay);
                }
                
                if (train.arrivalSeconds !== undefined) {
                    this.arrivalCountdown = train.arrivalSeconds;
                    this.totalTravelTime = 90;
                    this.isMoving = train.progress > 0 && train.progress < 1;
                }
                
            } else if (source === 'gtfs-rt' && data.trains) {
                const trains = data.trains;
                if (trains.length > 0) {
                    const nextTrain = trains[0];
                    this.arrivalCountdown = nextTrain.arrival_min * 60;
                    this.totalTravelTime = Math.max(this.arrivalCountdown, 90);
                    this.direction = nextTrain.direction;
                    
                    if (nextTrain.delay) {
                        this.setDelay(nextTrain.delay);
                    }
                }
            }
            
            this.updateDisplay();
        }
    }

    // ====== SIMULACE (FALLBACK) ======

    startSimulation() {
        if (this.simulationInterval) return;
        
        console.log('[Metro Production] Spouštění simulace');
        this.isMoving = true;
        this.moveToNextStation();
    }

    moveToNextStation() {
        const nextIndex = this.getNextStationIndex();
        const terminalIndex = this.getTerminalIndex();
        
        // Kontrola konečné
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
        
        this.isAtStation = false; // Vlak vyjíždí ze stanice
        this.totalTravelTime = this.getTravelTimeToNextStation();
        this.arrivalCountdown = this.totalTravelTime;
        
        this.simulationInterval = setInterval(() => {
            const decrement = (this.tickInterval / 1000) * this.simulationSpeed;
            this.arrivalCountdown -= decrement;
            
            if (this.arrivalCountdown <= 0) {
                this.arrivalCountdown = 0;
                clearInterval(this.simulationInterval);
                this.simulationInterval = null;
                this.arriveAtStation(nextIndex);
            }
            
            this.updateDisplay();
        }, this.tickInterval);
    }

    arriveAtStation(stationIndex) {
        this.currentStationIndex = stationIndex;
        this.arrivalCountdown = 0;
        this.totalTravelTime = 0;
        this.isAtStation = true; // Vlak dorazil do stanice
        this.updateDisplay();
        
        // Kontrola vlastní konečné
        if (this.customTerminal && this.stations[stationIndex].id === this.customTerminal) {
            this.arriveAtTerminus();
            return;
        }
        
        // Zastavení na stanici
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
        
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        
        this.updateDisplay();
        
        // Otočení směru po chvíli
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

    setDelay(seconds) {
        this.delay = seconds;
        this.updateDelayBadge();
    }

    updateDelayBadge() {
        const badge = document.getElementById('delay-badge');
        if (!badge) return;
        
        if (this.delay > 0) {
            const mins = Math.ceil(this.delay / 60);
            badge.querySelector('.delay-text').textContent = `+${mins} min`;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
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
        
        stationsContainer.innerHTML = this.stations.map((station, index) => {
            let classes = ['station'];
            
            if (index < this.currentStationIndex) {
                classes.push('passed');
            } else if (index === this.currentStationIndex) {
                classes.push('current');
            }
            
            if (station.transfer && station.transfer.length > 0) {
                classes.push('transfer');
                station.transfer.forEach(t => {
                    if (t === 'A') classes.push('transfer-a');
                    if (t === 'B') classes.push('transfer-b');
                    if (t === 'C') classes.push('transfer-c');
                    if (t === 'D') classes.push('transfer-d');
                });
            }
            
            const inlineIcons = this.generateInlineIcons(station);
            
            return `
                <div class="${classes.join(' ')}" data-station-index="${index}">
                    <div class="station-dot"></div>
                    <div class="station-name">${station.name}${inlineIcons}</div>
                </div>
            `;
        }).join('');
    }

    generateInlineIcons(station) {
        if (!station.transfer || station.transfer.length === 0) return '';
        
        let html = '<span class="transfer-inline">';
        
        station.transfer.forEach(t => {
            if (t === 'A') html += `<span class="icon metro-icon">${this.icons.metroA}</span>`;
            else if (t === 'B') html += `<span class="icon metro-icon">${this.icons.metroB}</span>`;
            else if (t === 'C') html += `<span class="icon metro-icon">${this.icons.metroC}</span>`;
            else if (t === 'D') html += `<span class="badge line-d">D</span>`;
            else if (t === 'train') html += `<span class="icon">${this.icons.train}</span>`;
            else if (t === 'bus') html += `<span class="icon">${this.icons.bus}</span>`;
            else if (t === 'bus-zoo') {
                html += `<span class="icon">${this.icons.bus}</span>`;
                html += `<span class="text-badge">ZOO</span>`;
            }
            else if (t === 'bus-airport') {
                html += `<span class="icon">${this.icons.bus}</span>`;
                html += `<span class="icon">${this.icons.plane}</span>`;
            }
        });
        
        html += '</span>';
        return html;
    }

    updateDisplay() {
        this.updateStationStyles();
        this.updatePassedLine();
        this.updateNextStationInfo();
        this.updateDirectionDisplay();
        this.updateDelayBadge();
    }

    updateStationStyles() {
        const stationEls = document.querySelectorAll('.station');
        const terminalIndex = this.getTerminalIndex();
        
        stationEls.forEach((el, index) => {
            el.classList.remove('current', 'passed', 'arriving', 'disabled');
            
            // Disabled stanice za konečnou
            if (this.customTerminal) {
                if (this.direction === 'last' && index > terminalIndex) {
                    el.classList.add('disabled');
                } else if (this.direction === 'first' && index < terminalIndex) {
                    el.classList.add('disabled');
                }
            }
            
            // Projeté a aktuální
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
            
            // Animace příjezdu
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
        if (this.isMoving && this.totalTravelTime > 0 && this.arrivalCountdown > 0) {
            const progress = 1 - (this.arrivalCountdown / this.totalTravelTime);
            progressOffset = (progress / totalStations) * lineWidth;
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
    console.log('[Metro Production] Metro Praha - Produkční displej');
    window.metroMap = new MetroMapProduction();
});
