class MetroMap {
    constructor() {
        this.stations = [
            { id: 'letnany', name: 'Letňany', transfer: null, travelTime: 120 },
            { id: 'prosek', name: 'Prosek', transfer: null, travelTime: 90 },
            { id: 'strizkov', name: 'Střížkov', transfer: null, travelTime: 90 },
            { id: 'ladvi', name: 'Ládví', transfer: null, travelTime: 90 },
            { id: 'kobylisy', name: 'Kobylisy', transfer: null, travelTime: 90 },
            { id: 'nadrazi-holesovice', name: 'Nádraží Holešovice', transfer: ['train', 'bus-zoo'], travelTime: 120 },
            { id: 'vltavska', name: 'Vltavská', transfer: null, travelTime: 90 },
            { id: 'florenc', name: 'Florenc', transfer: ['B'], travelTime: 90 },
            { id: 'hlavni-nadrazi', name: 'Hlavní nádraží', transfer: ['train', 'info', 'bus-airport'], travelTime: 60 },
            { id: 'muzeum', name: 'Muzeum', transfer: ['A'], travelTime: 60 },
            { id: 'ip-pavlova', name: 'I. P. Pavlova', transfer: null, travelTime: 90 },
            { id: 'vysehrad', name: 'Vyšehrad', transfer: null, travelTime: 90 },
            { id: 'prazskeho-povstani', name: 'Pražského povstání', transfer: null, travelTime: 90 },
            { id: 'pankrac', name: 'Pankrác', transfer: ['D'], travelTime: 90 },
            { id: 'budejovicka', name: 'Budějovická', transfer: null, travelTime: 90 },
            { id: 'kacerov', name: 'Kačerov', transfer: ['train'], travelTime: 90 },
            { id: 'roztyly', name: 'Roztyly', transfer: null, travelTime: 90 },
            { id: 'chodov', name: 'Chodov', transfer: null, travelTime: 90 },
            { id: 'opatov', name: 'Opatov', transfer: null, travelTime: 90 },
            { id: 'haje', name: 'Háje', transfer: null, travelTime: 120 }
        ];
        
        this.currentStationIndex = 0;
        this.direction = 'haje';
        this.isMoving = false;
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
                arrivalIn: 'Příjezd za:',
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
                arrivalIn: 'Arriving in:',
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
            plane: `<svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`
        };
        
        this.init();
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

    init() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        this.renderStations();
        this.updateDisplay();
        this.setupControls();
        
        // Pokus o připojení k backendu
        this.connectToBackend();
    }

    // ====== Backend Connection ======
    connectToBackend() {
        const t = this.translations[this.language];
        this.connectionStatus = 'connecting';
        this.updateConnectionIndicator();
        
        const wsUrl = this.backendUrl.replace('http://', 'ws://').replace('https://', 'wss://');
        const wsEndpoint = `${wsUrl}/ws/metro/line-c`;
        
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
        if (this.wsReconnectAttempts >= this.wsMaxReconnectAttempts) {
            console.log('[Metro] Max reconnect attempts reached, falling back to simulation');
            return;
        }
        
        this.wsReconnectAttempts++;
        const delay = this.wsReconnectDelay * Math.min(this.wsReconnectAttempts, 5);
        console.log(`[Metro] Reconnecting in ${delay}ms (attempt ${this.wsReconnectAttempts})`);
        
        setTimeout(() => this.connectToBackend(), delay);
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
                <button id="btn-start" class="control-btn">${t.start}</button>
                <button id="btn-pause" class="control-btn">${t.pause}</button>
                <button id="btn-reset" class="control-btn">${t.reset}</button>
                <button id="btn-reverse" class="control-btn">${t.reverse}</button>
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
            document.getElementById('speed-slider')?.addEventListener('input', (e) => this.setSpeed(e.target.value));
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
            if (t === 'A') html += `<span class="badge line-a">A</span>`;
            else if (t === 'B') html += `<span class="badge line-b">B</span>`;
            else if (t === 'D') html += `<span class="badge line-d">D</span>`;
            else if (t === 'train') html += `<span class="icon">${this.icons.train}</span>`;
            else if (t === 'info') html += `<span class="icon">${this.icons.info}</span>`;
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
    }

    updateStationStyles() {
        const stationEls = document.querySelectorAll('.station');
        
        stationEls.forEach((el, index) => {
            el.classList.remove('current', 'passed', 'arriving');
            
            const station = this.stations[index];
            if (station.transfer && station.transfer.length > 0) {
                el.classList.add('transfer');
                station.transfer.forEach(t => {
                    if (t === 'A') el.classList.add('transfer-a');
                    if (t === 'B') el.classList.add('transfer-b');
                    if (t === 'D') el.classList.add('transfer-d');
                });
            }
            
            if (this.direction === 'haje') {
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
        if (this.direction === 'haje') {
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
        
        if (this.direction === 'haje') {
            return this.stations[this.currentStationIndex].travelTime;
        } else {
            return this.stations[nextIndex].travelTime;
        }
    }

    updatePassedLine() {
        const passedLine = document.querySelector('.route-line-passed');
        if (!passedLine) return;
        
        const totalStations = this.stations.length - 1;
        
        let progressOffset = 0;
        if (this.isMoving && this.totalTravelTime > 0 && this.arrivalCountdown > 0) {
            const progress = 1 - (this.arrivalCountdown / this.totalTravelTime);
            progressOffset = (progress / totalStations) * 100;
        }
        
        if (this.direction === 'haje') {
            const passedPercentage = (this.currentStationIndex / totalStations) * 100 + progressOffset;
            passedLine.style.left = '50px';
            passedLine.style.right = 'auto';
            passedLine.style.width = `${Math.min(Math.max(passedPercentage, 0), 100)}%`;
        } else {
            const passedPercentage = ((totalStations - this.currentStationIndex) / totalStations) * 100 + progressOffset;
            passedLine.style.left = 'auto';
            passedLine.style.right = '50px';
            passedLine.style.width = `${Math.min(Math.max(passedPercentage, 0), 100)}%`;
        }
    }

    updateNextStationInfo() {
        const t = this.translations[this.language];
        const nextNameEl = document.querySelector('.next-name');
        const arrivalEl = document.querySelector('.arrival-value');
        
        const nextIndex = this.getNextStationIndex();
        
        if (nextIndex >= 0 && nextIndex < this.stations.length && nextNameEl) {
            nextNameEl.textContent = this.stations[nextIndex].name;
        } else if (nextNameEl) {
            nextNameEl.textContent = t.terminus;
        }
        
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

    updateDirectionDisplay() {
        const directionText = document.querySelector('.direction-text');
        if (directionText) {
            const terminus = this.direction === 'haje' ? 'Háje' : 'Letňany';
            const arrow = this.direction === 'haje' ? '→' : '←';
            directionText.innerHTML = `<span class="direction-arrow">${arrow}</span>${terminus}`;
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
        
        if (nextIndex < 0 || nextIndex >= this.stations.length) {
            this.arriveAtTerminus();
            return;
        }
        
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
        const station = this.stations[stationIndex];
        
        this.updateStatus(`${t.station} ${station.name}`);
        this.arrivalCountdown = 0;
        this.totalTravelTime = 0;
        this.updateDisplay();
        
        // Přehrání zvuku příjezdu (volitelné)
        this.playArrivalSound();
        
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
        
        const terminus = this.direction === 'haje' ? 'Háje' : 'Letňany';
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
        
        if (this.direction === 'haje') {
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
        
        this.direction = this.direction === 'haje' ? 'letnany' : 'haje';
        
        if (this.direction === 'haje') {
            this.currentStationIndex = 0;
        } else {
            this.currentStationIndex = this.stations.length - 1;
        }
        
        this.isMoving = false;
        this.arrivalCountdown = 0;
        this.totalTravelTime = 0;
        
        this.updateDisplay();
        
        const newTerminus = this.direction === 'haje' ? 'Háje' : 'Letňany';
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
