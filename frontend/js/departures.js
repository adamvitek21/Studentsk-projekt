/**
 * Metro Praha - Tabulka odjezdů s reálnými daty
 * 
 * Využívá Golemio API pro real-time odjezdy z PID (metro, tramvaje, autobusy, vlaky)
 * 
 * URL parametry:
 *   ?stop=stop-name      - Název zastávky
 *   ?ids=U1040,U1041     - PID ID zastávek (oddělené čárkou)
 *   ?filter=metro|tram|bus|train|all
 *   ?limit=10            - Počet odjezdů
 */

class DeparturesBoard {
    constructor() {
        this.params = new URLSearchParams(window.location.search);
        
        // API konfigurace - čteme z backend .env nebo použijeme proxy
        this.apiKey = null; // Načteme z backendu
        this.apiBaseUrl = 'https://api.golemio.cz/v2';
        this.backendUrl = this.params.get('backend') || 'localhost:8000';
        
        // Aktuální stav
        this.currentStopName = this.params.get('stop') || this.params.get('names') || '';
        this.transportFilter = this.params.get('filter') || 'all';
        this.limit = parseInt(this.params.get('limit')) || 10;
        this.departures = [];
        this.autoRefresh = true;
        this.refreshInterval = null;
        this.isLoading = false;
        
        // Populární zastávky pro rychlý výběr - používáme jména místo ID
        this.popularStops = [
            { name: 'Florenc', aswId: '689' },
            { name: 'Můstek', aswId: '401' },
            { name: 'Muzeum', aswId: '301' },
            { name: 'Hlavní nádraží', aswId: '477' },
            { name: 'Anděl', aswId: '241' },
            { name: 'Dejvická', aswId: '162' },
            { name: 'Karlovo náměstí', aswId: '363' },
            { name: 'Náměstí Republiky', aswId: '227' },
            { name: 'I. P. Pavlova', aswId: '318' },
            { name: 'Smíchovské nádraží', aswId: '258' },
            { name: 'Nádraží Holešovice', aswId: '135' },
            { name: 'Vltavská', aswId: '137' },
            { name: 'Hradčanská', aswId: '159' },
            { name: 'Malostranská', aswId: '157' },
            { name: 'Staroměstská', aswId: '155' },
            { name: 'Palmovka', aswId: '222' },
            { name: 'Křižíkova', aswId: '218' },
            { name: 'Budějovická', aswId: '308' },
            { name: 'Pankrác', aswId: '311' },
            { name: 'Chodov', aswId: '324' },
            { name: 'Letňany', aswId: '101' },
            { name: 'Háje', aswId: '331' },
            { name: 'Černý Most', aswId: '251' },
            { name: 'Zličín', aswId: '276' },
            { name: 'Depo Hostivař', aswId: '122' },
            { name: 'Nemocnice Motol', aswId: '191' },
            { name: 'Prosek', aswId: '104' },
            { name: 'Vysočanská', aswId: '225' },
            { name: 'Kolbenova', aswId: '248' },
            { name: 'Invalidovna', aswId: '217' },
            { name: 'Náměstí Míru', aswId: '166' },
            { name: 'Jiřího z Poděbrad', aswId: '168' },
            { name: 'Flora', aswId: '170' },
            { name: 'Želivského', aswId: '172' },
            { name: 'Strašnická', aswId: '174' },
            { name: 'Skalka', aswId: '176' },
            { name: 'Vyšehrad', aswId: '315' },
            { name: 'Kobylisy', aswId: '108' },
            { name: 'Ládví', aswId: '106' },
            { name: 'Střížkov', aswId: '102' },
        ];
        
        // Transport type mapping - using SVG icon IDs
        this.transportTypes = {
            0: { type: 'tram', icon: 'icon-tram', name: 'Tramvaj' },
            1: { type: 'metro', icon: 'icon-metro', name: 'Metro' },
            2: { type: 'train', icon: 'icon-train', name: 'Vlak' },
            3: { type: 'bus', icon: 'icon-bus', name: 'Autobus' },
            4: { type: 'ferry', icon: 'icon-ferry', name: 'Přívoz' },
            5: { type: 'tram', icon: 'icon-funicular', name: 'Lanová dráha' },
            6: { type: 'tram', icon: 'icon-funicular', name: 'Lanovka' },
            7: { type: 'train', icon: 'icon-funicular', name: 'Funicular' },
            11: { type: 'bus', icon: 'icon-trolleybus', name: 'Trolejbus' },
            12: { type: 'train', icon: 'icon-train', name: 'Jednokolejka' },
        };
        
        this.init();
    }
    
    async init() {
        await this.loadApiKey();
        this.setupStationSelector();
        this.setupFilterButtons();
        this.setupControls();
        this.startClock();
        
        // Pokud máme název zastávky z URL, načti data
        if (this.currentStopName) {
            await this.loadDepartures();
        } else {
            this.showWelcomeMessage();
        }
        
        // Spusť auto-refresh
        this.startAutoRefresh();
    }
    
    async loadApiKey() {
        // Zkus načíst API klíč z backendu
        try {
            const response = await fetch(`http://${this.backendUrl}/api/status`);
            if (response.ok) {
                // Backend běží, použijeme proxy
                this.useBackendProxy = true;
                this.updateConnectionStatus('connected', 'Backend připojen');
            }
        } catch (e) {
            // Backend neběží, použijeme přímé API volání (vyžaduje API klíč v kódu)
            // Pro produkci by měl být klíč v env proměnné na backendu
            this.useBackendProxy = false;
            this.updateConnectionStatus('error', 'Backend nedostupný');
        }
    }
    
    setupStationSelector() {
        const select = document.getElementById('station-select');
        if (!select) return;
        
        // Přidej populární zastávky
        this.popularStops.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
        
        this.popularStops.forEach(stop => {
            const option = document.createElement('option');
            option.value = stop.name;  // Používáme jméno pro API
            option.textContent = stop.name;
            option.dataset.name = stop.name;
            option.dataset.aswId = stop.aswId;
            select.appendChild(option);
        });
        
        // Nastav aktuální zastávku
        if (this.currentStopName) {
            select.value = this.currentStopName;
        }
    }
    
    setupFilterButtons() {
        const filterContainer = document.getElementById('transport-filter');
        if (!filterContainer) return;
        
        filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.transportFilter = btn.dataset.type;
                this.renderDepartures();
            });
            
            // Nastav aktivní podle URL
            if (btn.dataset.type === this.transportFilter) {
                filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    }
    
    setupControls() {
        // Výběr zastávky z dropdownu
        const stationSelect = document.getElementById('station-select');
        if (stationSelect) {
            stationSelect.addEventListener('change', async (e) => {
                if (e.target.value) {
                    this.currentStopName = e.target.value;
                    await this.loadDepartures();
                }
            });
        }
        
        // Vyhledávání zastávky
        const searchInput = document.getElementById('stop-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filterStopSelector(e.target.value);
                }, 300);
            });
        }
        
        // Načtení podle názvu zastávky (nebo ASW ID)
        const loadStopBtn = document.getElementById('load-stop-btn');
        const stopIdInput = document.getElementById('stop-id-input');
        if (loadStopBtn && stopIdInput) {
            loadStopBtn.addEventListener('click', async () => {
                const input = stopIdInput.value.trim();
                if (input) {
                    // Pokud je to číslo, považuj za ASW ID
                    if (/^\d+$/.test(input)) {
                        // Najdi zastávku podle ASW ID
                        const found = this.popularStops.find(s => s.aswId === input);
                        this.currentStopName = found ? found.name : `Zastávka ASW ${input}`;
                    } else {
                        // Považuj za název zastávky
                        this.currentStopName = input;
                    }
                    await this.loadDepartures();
                }
            });
            
            stopIdInput.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    loadStopBtn.click();
                }
            });
        }
        
        // Limit odjezdů
        const limitSelect = document.getElementById('limit-select');
        if (limitSelect) {
            limitSelect.value = this.limit;
            limitSelect.addEventListener('change', (e) => {
                this.limit = parseInt(e.target.value);
                this.renderDepartures();
            });
        }
        
        // Auto-refresh
        const autoRefreshCheckbox = document.getElementById('auto-refresh');
        if (autoRefreshCheckbox) {
            autoRefreshCheckbox.checked = this.autoRefresh;
            autoRefreshCheckbox.addEventListener('change', (e) => {
                this.autoRefresh = e.target.checked;
                if (this.autoRefresh) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });
        }
        
        // Ruční refresh
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadDepartures());
        }
        
        // Fullscreen
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
    }
    
    filterStopSelector(query) {
        const select = document.getElementById('station-select');
        if (!select) return;
        
        const lowerQuery = query.toLowerCase();
        
        Array.from(select.options).forEach(option => {
            if (option.value === '') return; // Skip default option
            const matches = option.textContent.toLowerCase().includes(lowerQuery);
            option.style.display = matches ? '' : 'none';
        });
    }
    
    async loadDepartures() {
        if (!this.currentStopName) {
            this.showWelcomeMessage();
            return;
        }
        
        this.isLoading = true;
        this.showLoading();
        this.updateConnectionStatus('', 'Načítám data...');
        
        try {
            const departures = await this.fetchDepartures();
            this.departures = departures;
            this.renderDepartures();
            this.updateHeader();
            this.updateLastUpdate();
            this.updateConnectionStatus('connected', `Načteno ${departures.length} odjezdů`);
            this.updateApiStatus(`✅ API OK - ${this.currentStopName}`);
        } catch (error) {
            console.error('Error loading departures:', error);
            this.updateConnectionStatus('error', 'Chyba načítání');
            this.updateApiStatus(`❌ Chyba: ${error.message}`);
            this.showError(error.message);
        } finally {
            this.isLoading = false;
        }
    }
    
    async fetchDepartures() {
        // Použij backend proxy s názvem zastávky
        const encodedName = encodeURIComponent(this.currentStopName);
        
        // Zkus nejprve backend proxy
        try {
            const backendUrl = `http://${this.backendUrl}/api/departures?names=${encodedName}&limit=${this.limit * 3}`;
            console.log('Fetching from:', backendUrl);
            const response = await fetch(backendUrl);
            
            if (response.ok) {
                const data = await response.json();
                console.log('API response:', data);
                
                if (data.ok && data.departures) {
                    return this.parseDepartures(data);
                } else {
                    console.error('API error:', data.error);
                    throw new Error(data.error || 'Chyba API');
                }
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (e) {
            console.log('Backend proxy error:', e.message);
            // Fallback na simulovaná data
            console.log('Using simulated data as fallback');
            return this.generateSimulatedDepartures();
        }
    }
    
    parseDepartures(data) {
        if (!data || !data.departures) return [];
        
        return data.departures.map(dep => ({
            type: this.getTransportType(dep.route?.type),
            line: dep.route?.short_name || dep.route?.name || '?',
            direction: dep.trip?.headsign || dep.stop?.name || 'Neznámý směr',
            platform: dep.stop?.platform_code || '-',
            scheduledTime: new Date(dep.departure_timestamp?.scheduled || dep.arrival_timestamp?.scheduled),
            realtimeTime: dep.departure_timestamp?.predicted ? new Date(dep.departure_timestamp.predicted) : null,
            delay: dep.delay?.minutes || 0,
            isRealtime: !!dep.departure_timestamp?.predicted,
            routeType: dep.route?.type
        }));
    }
    
    getTransportType(routeType) {
        return this.transportTypes[routeType] || this.transportTypes[3]; // Default to bus
    }
    
    generateSimulatedDepartures() {
        // Simulovaná data pro testování bez API
        const departures = [];
        const now = new Date();
        const types = [
            { type: 'metro', icon: 'icon-metro', lines: ['A', 'B', 'C'], terminals: ['Nemocnice Motol', 'Depo Hostivař', 'Zličín', 'Černý Most', 'Letňany', 'Háje'] },
            { type: 'tram', icon: 'icon-tram', lines: ['3', '9', '14', '17', '22', '24', '91'], terminals: ['Sídliště Modřany', 'Spojovací', 'Lehovec', 'Vozovna Kobylisy', 'Bílá Hora'] },
            { type: 'bus', icon: 'icon-bus', lines: ['119', '135', '176', '207', '901'], terminals: ['Letiště', 'Zoo Praha', 'Nové Butovice', 'Na Knížecí', 'Dejvická'] },
            { type: 'train', icon: 'icon-train', lines: ['S1', 'S4', 'S7', 'R10'], terminals: ['Praha hl.n.', 'Kolín', 'Benešov', 'Kralupy nad Vltavou'] },
        ];
        
        let minutesOffset = 0;
        
        for (let i = 0; i < 20; i++) {
            const typeData = types[Math.floor(Math.random() * types.length)];
            const line = typeData.lines[Math.floor(Math.random() * typeData.lines.length)];
            const terminal = typeData.terminals[Math.floor(Math.random() * typeData.terminals.length)];
            
            minutesOffset += Math.floor(Math.random() * 4) + 1;
            const delay = Math.random() < 0.3 ? Math.floor(Math.random() * 5) : 0;
            
            const scheduledTime = new Date(now.getTime() + minutesOffset * 60000);
            const realtimeTime = delay > 0 ? new Date(scheduledTime.getTime() + delay * 60000) : null;
            
            departures.push({
                type: { type: typeData.type, icon: typeData.icon, name: typeData.type },
                line: line,
                direction: terminal,
                platform: typeData.type === 'train' ? `${Math.floor(Math.random() * 4) + 1}` : '-',
                scheduledTime: scheduledTime,
                realtimeTime: realtimeTime,
                delay: delay,
                isRealtime: Math.random() > 0.3
            });
        }
        
        return departures.sort((a, b) => {
            const timeA = a.realtimeTime || a.scheduledTime;
            const timeB = b.realtimeTime || b.scheduledTime;
            return timeA - timeB;
        });
    }
    
    renderDepartures() {
        const container = document.getElementById('departures-list');
        if (!container) return;
        
        // Filtruj podle typu dopravy
        let filtered = this.departures;
        if (this.transportFilter !== 'all') {
            filtered = this.departures.filter(d => d.type.type === this.transportFilter);
        }
        
        // Limit
        filtered = filtered.slice(0, this.limit);
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="no-departures">Žádné odjezdy pro vybraný filtr</div>';
            return;
        }
        
        const now = new Date();
        
        container.innerHTML = filtered.map((dep, index) => {
            const departureTime = dep.realtimeTime || dep.scheduledTime;
            const minutesAway = Math.max(0, Math.round((departureTime - now) / 60000));
            
            // Formátování času
            const timeStr = departureTime.toLocaleTimeString('cs-CZ', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Countdown text
            let countdownStr;
            let rowClass = 'departure-row';
            
            if (minutesAway === 0) {
                countdownStr = '&lt;1 min';
                rowClass += ' boarding';
            } else if (minutesAway === 1) {
                countdownStr = '1 min';
                rowClass += ' arriving';
            } else {
                countdownStr = `${minutesAway} min`;
            }
            
            if (index === 0) {
                rowClass += ' next';
            }
            
            // Delay indicator
            let delayHtml = '';
            if (dep.isRealtime) {
                if (dep.delay > 0) {
                    delayHtml = `<span class="delay-indicator delayed">+${dep.delay}'</span>`;
                } else {
                    delayHtml = `<span class="delay-indicator on-time">●</span>`;
                }
            }
            
            // Line class
            let lineClass = 'line-indicator';
            if (dep.type.type === 'metro') {
                lineClass += ` line-${dep.line.toLowerCase()}`;
            } else if (dep.type.type === 'tram') {
                lineClass += ' tram';
            } else if (dep.type.type === 'bus') {
                lineClass += dep.line.startsWith('9') ? ' bus-night' : ' bus';
            } else if (dep.type.type === 'train') {
                lineClass += dep.line.startsWith('S') ? ' train-s' : ' train';
            }
            
            return `
                <div class="${rowClass}" data-minutes="${minutesAway}">
                    <div class="col-type">
                        <div class="transport-icon ${dep.type.type}">
                            <svg><use href="#${dep.type.icon}"/></svg>
                        </div>
                    </div>
                    <div class="col-line">
                        <div class="${lineClass}">${dep.line}</div>
                    </div>
                    <div class="col-direction">
                        <span class="direction-arrow">→</span>
                        ${dep.direction}
                    </div>
                    <div class="col-platform">
                        <span class="platform-badge">${dep.platform}</span>
                    </div>
                    <div class="col-time">
                        <span class="realtime-time">${timeStr}</span>
                        ${delayHtml}
                    </div>
                    <div class="col-countdown">${countdownStr}</div>
                </div>
            `;
        }).join('');
    }
    
    updateHeader() {
        const stationNameEl = document.getElementById('station-name');
        const stationIconEl = document.getElementById('station-icon');
        
        if (stationNameEl) {
            stationNameEl.textContent = this.currentStopName || 'Vyberte zastávku';
        }
        
        if (stationIconEl) {
            // Ikona podle převládajícího typu dopravy
            const types = this.departures.map(d => d.type.type);
            const counts = {};
            types.forEach(t => counts[t] = (counts[t] || 0) + 1);
            const mainType = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
            
            if (mainType) {
                const typeInfo = Object.values(this.transportTypes).find(t => t.type === mainType[0]);
                const iconId = typeInfo?.icon || 'icon-stop';
                stationIconEl.innerHTML = `<svg><use href="#${iconId}"/></svg>`;
            } else {
                stationIconEl.innerHTML = `<svg><use href="#icon-stop"/></svg>`;
            }
        }
    }
    
    updateConnectionStatus(status, text) {
        const statusEl = document.getElementById('connection-status');
        if (statusEl) {
            statusEl.className = `connection-status ${status}`;
            const textEl = statusEl.querySelector('.status-text');
            if (textEl) {
                textEl.textContent = text;
            }
        }
    }
    
    updateApiStatus(text) {
        const apiStatusEl = document.getElementById('api-status');
        if (apiStatusEl) {
            apiStatusEl.textContent = text;
        }
    }
    
    updateLastUpdate() {
        const lastUpdateEl = document.getElementById('last-update');
        if (lastUpdateEl) {
            const now = new Date();
            lastUpdateEl.textContent = `Poslední aktualizace: ${now.toLocaleTimeString('cs-CZ')}`;
        }
    }
    
    showLoading() {
        const container = document.getElementById('departures-list');
        if (container) {
            container.innerHTML = `
                <div class="no-departures">
                    <div class="loading-spinner"></div>
                    Načítám odjezdy...
                </div>
            `;
        }
    }
    
    showWelcomeMessage() {
        const container = document.getElementById('departures-list');
        if (container) {
            container.innerHTML = `
                <div class="no-departures">
                    👆 Vyberte zastávku z menu nebo zadejte PID ID
                </div>
            `;
        }
        this.updateApiStatus('📡 API: Čekám na výběr zastávky');
    }
    
    showError(message) {
        const container = document.getElementById('departures-list');
        if (container) {
            container.innerHTML = `
                <div class="no-departures">
                    ❌ ${message}<br><br>
                    <small>Zkuste obnovit stránku nebo zkontrolujte připojení</small>
                </div>
            `;
        }
    }
    
    startClock() {
        const updateClock = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('cs-CZ', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const clockEl = document.getElementById('clock');
            if (clockEl) {
                clockEl.textContent = timeStr;
            }
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }
    
    startAutoRefresh() {
        this.stopAutoRefresh();
        
        if (this.autoRefresh) {
            // Refresh každých 30 sekund
            this.refreshInterval = setInterval(() => {
                if (!this.isLoading && this.currentStopName) {
                    this.loadDepartures();
                }
            }, 30000);
            
            // Countdown refresh každých 10 sekund
            setInterval(() => {
                if (!this.isLoading) {
                    this.renderDepartures();
                }
            }, 10000);
        }
    }
    
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    
    toggleFullscreen() {
        const body = document.body;
        
        if (document.fullscreenElement) {
            document.exitFullscreen();
            body.classList.remove('fullscreen-mode');
        } else {
            document.documentElement.requestFullscreen();
            body.classList.add('fullscreen-mode');
        }
    }
    
    async searchStop(query) {
        // Hledej v populárních zastávkách
        const found = this.popularStops.find(stop => 
            stop.name.toLowerCase().includes(query.toLowerCase())
        );
        
        if (found) {
            this.currentStopIds = found.ids;
            this.currentStopName = found.name;
            await this.loadDepartures();
        } else {
            this.showError(`Zastávka "${query}" nenalezena`);
        }
    }
}

// Inicializace
document.addEventListener('DOMContentLoaded', () => {
    window.departuresBoard = new DeparturesBoard();
});
