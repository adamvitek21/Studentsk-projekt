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
        
        // SVG ikony
        this.icons = {
            train: `<svg viewBox="0 0 24 24"><path d="M12 2C8 2 4 2.5 4 6v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l1.5-2h5l1.5 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm2 0V6h5v5h-5zm3.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
            bus: `<svg viewBox="0 0 24 24"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>`,
            info: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
            plane: `<svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`
        };
        
        this.init();
    }

    init() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        this.renderStations();
        this.updateDisplay();
        this.setupControls();
    }

    setupControls() {
        const controlsHTML = `
            <div class="simulation-controls">
                <button id="btn-start" class="control-btn">▶ Start</button>
                <button id="btn-pause" class="control-btn">⏸ Pauza</button>
                <button id="btn-reset" class="control-btn">↺ Reset</button>
                <button id="btn-reverse" class="control-btn">⇄ Otočit směr</button>
                <div class="speed-control">
                    <label>Rychlost: <span id="speed-value">1x</span></label>
                    <input type="range" id="speed-slider" min="1" max="20" value="1">
                </div>
                <div class="status-display">
                    <span id="status-text">Připraveno</span>
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
            document.getElementById('speed-slider')?.addEventListener('input', (e) => this.setSpeed(e.target.value));
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
            
            // Přidání transfer tříd
            if (station.transfer && station.transfer.length > 0) {
                classes.push('transfer');
                
                station.transfer.forEach(t => {
                    if (t === 'A') classes.push('transfer-a');
                    if (t === 'B') classes.push('transfer-b');
                    if (t === 'D') classes.push('transfer-d');
                });
            }
            
            // Generování transfer badges
            const transferBadges = this.generateTransferBadges(station);
            
            return `
                <div class="${classes.join(' ')}" data-station-index="${index}">
                    <div class="station-dot"></div>
                    <div class="station-name">${station.name}</div>
                    ${transferBadges}
                </div>
            `;
        }).join('');
    }

    generateTransferBadges(station) {
        if (!station.transfer || station.transfer.length === 0) return '';
        
        let content = '<div class="transfer-lines">';
        
        // Rozdělíme ikony do řádků
        // První řádek: metro linky a vlak
        let row1 = [];
        // Druhý řádek: autobusy a info
        let row2 = [];
        
        station.transfer.forEach(t => {
            if (t === 'A') {
                row1.push(`<div class="transfer-badge line-a">A</div>`);
            } else if (t === 'B') {
                row1.push(`<div class="transfer-badge line-b">B</div>`);
            } else if (t === 'D') {
                row1.push(`<div class="transfer-badge line-d">D</div>`);
            } else if (t === 'train') {
                row1.push(`<div class="transfer-icon">${this.icons.train}</div>`);
            } else if (t === 'info') {
                row1.push(`<div class="transfer-icon">${this.icons.info}</div>`);
            } else if (t === 'bus-zoo') {
                row2.push(`<div class="transfer-icon">${this.icons.bus}</div>`);
                row2.push(`<span class="transfer-text-badge zoo">ZOO</span>`);
            } else if (t === 'bus-airport') {
                row2.push(`<div class="transfer-icon">${this.icons.bus}</div>`);
                row2.push(`<div class="transfer-icon">${this.icons.plane}</div>`);
            }
        });
        
        // Přidání řádků
        if (row1.length > 0) {
            content += `<div class="transfer-row">${row1.join('')}</div>`;
        }
        if (row2.length > 0) {
            content += `<div class="transfer-row">${row2.join('')}</div>`;
        }
        
        content += '</div>';
        return content;
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
            
            // Zachování transfer tříd
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
            
            // Blikání při příjezdu
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
        const nextNameEl = document.querySelector('.next-name');
        const arrivalEl = document.querySelector('.arrival-value');
        
        const nextIndex = this.getNextStationIndex();
        
        if (nextIndex >= 0 && nextIndex < this.stations.length && nextNameEl) {
            nextNameEl.textContent = this.stations[nextIndex].name;
        } else if (nextNameEl) {
            nextNameEl.textContent = 'Konečná';
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
        if (this.countdownInterval) return;
        
        this.isMoving = true;
        this.isPaused = false;
        this.updateStatus('Jede...');
        
        this.moveToNextStation();
    }

    moveToNextStation() {
        const nextIndex = this.getNextStationIndex();
        
        if (nextIndex < 0 || nextIndex >= this.stations.length) {
            this.arriveAtTerminus();
            return;
        }
        
        this.totalTravelTime = this.getTravelTimeToNextStation();
        this.arrivalCountdown = this.totalTravelTime;
        
        const nextStation = this.stations[nextIndex];
        this.updateStatus(`Příští: ${nextStation.name}`);
        
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
        this.currentStationIndex = stationIndex;
        const station = this.stations[stationIndex];
        
        this.updateStatus(`Stanice: ${station.name}`);
        this.arrivalCountdown = 0;
        this.totalTravelTime = 0;
        this.updateDisplay();
        
        const stopTime = (this.stationStopTime / this.simulationSpeed) * 1000;
        
        setTimeout(() => {
            if (!this.isPaused && this.isMoving) {
                this.moveToNextStation();
            }
        }, stopTime);
    }

    arriveAtTerminus() {
        this.isMoving = false;
        this.arrivalCountdown = 0;
        this.totalTravelTime = 0;
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        const terminus = this.direction === 'haje' ? 'Háje' : 'Letňany';
        this.updateStatus(`Konečná: ${terminus}`);
        this.updateDisplay();
        
        const waitTime = (30 / this.simulationSpeed) * 1000;
        setTimeout(() => {
            if (!this.isMoving) {
                this.reverseDirection();
                this.updateStatus('Připraveno k odjezdu');
            }
        }, waitTime);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        const pauseBtn = document.getElementById('btn-pause');
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? '▶ Pokračovat' : '⏸ Pauza';
        }
        
        this.updateStatus(this.isPaused ? 'Pozastaveno' : 'Jede...');
    }

    resetSimulation() {
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
        this.updateStatus('Připraveno');
        
        const pauseBtn = document.getElementById('btn-pause');
        if (pauseBtn) {
            pauseBtn.textContent = '⏸ Pauza';
        }
    }

    reverseDirection() {
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
        this.updateStatus(`Směr: ${newTerminus}`);
        
        const pauseBtn = document.getElementById('btn-pause');
        if (pauseBtn) {
            pauseBtn.textContent = '⏸ Pauza';
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