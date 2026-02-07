/**
 * Metro Praha - Produkční displej pouze s odjezdy
 * 
 * URL parametry:
 *   ?stop=stop-name      - Název zastávky (výchozí: Florenc)
 *   ?backend=url         - URL backendu (výchozí: localhost:8000)
 *   ?limit=10            - Počet odjezdů (výchozí: 10)
 *   ?refresh=30          - Interval obnovení v sekundách (výchozí: 30)
 */

class DeparturesProductionBoard {
    constructor() {
        this.params = new URLSearchParams(window.location.search);
        
        // Konfigurace
        this.stationName = this.params.get('stop') || 'Florenc';
        this.backendUrl = this.params.get('backend') || 'localhost:8000';
        this.departuresLimit = parseInt(this.params.get('limit')) || 10;
        this.refreshInterval = parseInt(this.params.get('refresh')) || 30;
        
        // Data
        this.departures = [];
        
        // Transport type mapping
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
    
    init() {
        this.updateStationName();
        this.startClock();
        this.loadDepartures();
        
        // Pravidelná aktualizace
        setInterval(() => this.loadDepartures(), this.refreshInterval * 1000);
        
        console.log(`Production departures started for: ${this.stationName}`);
    }
    
    updateStationName() {
        const el = document.getElementById('station-name');
        if (el) {
            el.textContent = this.stationName;
        }
    }
    
    async loadDepartures() {
        try {
            const protocol = this.backendUrl.startsWith('http') ? '' : 'http://';
            const url = `${protocol}${this.backendUrl}/api/departures?names=${encodeURIComponent(this.stationName)}&limit=${this.departuresLimit * 2}`;
            console.log('Loading departures from:', url);
            
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                if (data.ok && data.departures) {
                    this.departures = this.parseDepartures(data);
                    this.renderDepartures();
                    this.updateConnectionStatus('connected', `${this.departures.length} odjezdů`);
                } else {
                    throw new Error('Invalid data format');
                }
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (e) {
            console.log('Departures fetch error:', e);
            this.updateConnectionStatus('error', 'Offline');
            // Použij simulovaná data
            this.departures = this.generateSimulatedDepartures();
            this.renderDepartures();
        }
    }
    
    parseDepartures(data) {
        if (!data || !data.departures) return [];
        
        return data.departures.map(dep => ({
            type: this.transportTypes[dep.route?.type] || this.transportTypes[3],
            line: dep.route?.short_name || '?',
            direction: dep.trip?.headsign || 'Neznámý směr',
            platform: dep.stop?.platform_code || '-',
            scheduledTime: new Date(dep.departure_timestamp?.scheduled || dep.arrival_timestamp?.scheduled),
            realtimeTime: dep.departure_timestamp?.predicted ? new Date(dep.departure_timestamp.predicted) : null,
            delay: dep.delay?.minutes || 0,
            isRealtime: !!dep.departure_timestamp?.predicted
        }));
    }
    
    generateSimulatedDepartures() {
        const departures = [];
        const now = new Date();
        const types = [
            { type: 'metro', icon: 'icon-metro', lines: ['A', 'B', 'C'] },
            { type: 'tram', icon: 'icon-tram', lines: ['3', '9', '14', '17', '22'] },
            { type: 'bus', icon: 'icon-bus', lines: ['119', '135', '176'] },
        ];
        
        let minutesOffset = 1;
        
        for (let i = 0; i < this.departuresLimit; i++) {
            const typeData = types[Math.floor(Math.random() * types.length)];
            const line = typeData.lines[Math.floor(Math.random() * typeData.lines.length)];
            
            minutesOffset += Math.floor(Math.random() * 4) + 1;
            const scheduledTime = new Date(now.getTime() + minutesOffset * 60000);
            
            departures.push({
                type: { type: typeData.type, icon: typeData.icon },
                line: line,
                direction: 'Simulovaný směr',
                platform: '-',
                scheduledTime: scheduledTime,
                realtimeTime: null,
                delay: 0,
                isRealtime: false
            });
        }
        
        return departures;
    }
    
    renderDepartures() {
        const container = document.getElementById('departures-list');
        if (!container) return;
        
        const filtered = this.departures.slice(0, this.departuresLimit);
        const now = new Date();
        
        container.innerHTML = filtered.map((dep, index) => {
            const departureTime = dep.realtimeTime || dep.scheduledTime;
            const minutesAway = Math.max(0, Math.round((departureTime - now) / 60000));
            
            const timeStr = departureTime.toLocaleTimeString('cs-CZ', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            let countdownStr = minutesAway === 0 ? '<1 min' : `${minutesAway} min`;
            let rowClass = 'departure-row';
            if (index === 0) rowClass += ' next';
            
            let delayHtml = '';
            if (dep.isRealtime) {
                delayHtml = dep.delay > 0 
                    ? `<span class="delay-indicator delayed">+${dep.delay}'</span>`
                    : `<span class="delay-indicator on-time">●</span>`;
            }
            
            let lineClass = 'line-indicator';
            if (dep.type.type === 'metro') {
                lineClass += ` line-${dep.line.toLowerCase()}`;
            } else if (dep.type.type === 'tram') {
                lineClass += ' tram';
            } else if (dep.type.type === 'bus') {
                lineClass += dep.line.startsWith('9') ? ' bus-night' : ' bus';
            } else if (dep.type.type === 'train') {
                lineClass += ' train';
            }
            
            return `
                <div class="${rowClass}">
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
    
    updateConnectionStatus(status, text) {
        const statusEl = document.getElementById('connection-status');
        if (statusEl) {
            statusEl.className = `connection-status ${status}`;
            const textEl = statusEl.querySelector('.status-text');
            if (textEl) textEl.textContent = text;
        }
    }
    
    startClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }
    
    updateClock() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('cs-CZ', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const clockEl = document.getElementById('clock');
        if (clockEl) clockEl.textContent = timeStr;
    }
}

// Inicializace
document.addEventListener('DOMContentLoaded', () => {
    window.departuresBoard = new DeparturesProductionBoard();
});
