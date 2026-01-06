# Uživatelská příručka - Metro Praha Displej

## Úvod

Aplikace Metro Praha Displej je informační systém zobrazující aktuální pozice vlaků pražského metra na linkách A, B a C. Systém je navržen pro průmyslové displeje ve stanicích metra, ale lze jej používat i ve webovém prohlížeči.

---

## Rychlý start

### Spuštění aplikace

1. Otevřete webový prohlížeč
2. Přejděte na adresu:
   - **Linka C (výchozí):** `http://localhost:5002/metro-map.html`
   - **Linka A:** `http://localhost:5002/metro-map.html?line=A`
   - **Linka B:** `http://localhost:5002/metro-map.html?line=B`

### První kroky

1. **Spusťte simulaci** kliknutím na tlačítko **▶ Start**
2. **Sledujte pohyb vlaku** mezi stanicemi
3. **Měňte směr** tlačítkem **⇄ Otočit směr**

---

## Popis obrazovky

### Hlavní části displeje

```
┌─────────────────────────────────────────────────────────────────────┐
│  [C]  A B C  → Háje                                      14:32:00   │  ← Header
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ●────●────●────●────●────●────●────●────●────●────●────●────●     │  ← Trasa
│  │    │    │    │    │    │    │    │    │    │    │    │    │     │
│ Let. Pro. Stř. Ládví Kob. N.H. Vlt. Flor.H.n. Muz. I.P.P.Vyš. ...  │  ← Stanice
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Příští stanice: Prosek              Příjezd za: 1:23 min           │  ← Info panel
└─────────────────────────────────────────────────────────────────────┘
```

### Header (záhlaví)

| Prvek | Popis |
|-------|-------|
| Badge linky | Velké kolečko s písmenem linky (A/B/C) |
| Přepínač linek | Malá tlačítka pro rychlé přepnutí linky |
| Směr | Šipka a název konečné stanice |
| Čas | Aktuální čas |

### Trasa

- **Barevná linka** - Celá trasa linky
- **Šedá část** - Projetý úsek
- **Kolečka** - Jednotlivé stanice
- **Zelené kolečko** - Aktuální pozice vlaku
- **Ikony přestupů** - Značky pod stanicemi

### Info panel

- **Příští stanice** - Název následující stanice
- **Příjezd za** - Odpočet času do příjezdu

---

## Ovládací panel

Ovládací panel se nachází v dolní části obrazovky.

### Hlavní tlačítka

| Tlačítko | Funkce |
|----------|--------|
| **▶ Start** | Spuštění simulace pohybu vlaku |
| **⏸ Pauza** | Pozastavení simulace |
| **▶ Pokračovat** | Pokračování po pauze |
| **↺ Reset** | Návrat vlaku na první stanici |
| **⇄ Otočit směr** | Změna směru jízdy vlaku |

### Nastavení rychlosti

| Tlačítko | Rychlost |
|----------|----------|
| **1×** | Normální rychlost (1 sekunda = 1 sekunda) |
| **2×** | Dvojnásobná rychlost |
| **5×** | Pětinásobná rychlost |

### Režim dat

| Tlačítko | Režim |
|----------|-------|
| **🟠 Simulace** | Simulovaná data (offline) |
| **📡 API** | Živá data z PID (vyžaduje připojení) |

### Jazyk

| Tlačítko | Jazyk |
|----------|-------|
| **🌐 EN** | Přepnutí na angličtinu |
| **🌐 CZ** | Přepnutí na češtinu |

---

## Přepínání linek

### Metoda 1: Tlačítka na displeji

Klikněte na jedno z tlačítek **A**, **B** nebo **C** v záhlaví displeje.

### Metoda 2: URL parametr

Přidejte parametr `?line=X` do URL:

```
http://localhost:5002/metro-map.html?line=A   # Linka A
http://localhost:5002/metro-map.html?line=B   # Linka B  
http://localhost:5002/metro-map.html?line=C   # Linka C
```

---

## Vlastní konečná stanice

Některé vlaky nejezdí celou trasu, ale obrací se na obratových stanicích. Tuto situaci můžete simulovat pomocí výběru vlastní konečné.

### Jak nastavit vlastní konečnou

1. Najděte dropdown **"Konečná:"** v ovládacím panelu
2. Vyberte požadovanou obratovou stanici
3. Stanice za konečnou se zobrazí šedě

### Dostupné obratové stanice

**Linka A:**
- Petřiny, Dejvická, Náměstí Míru, Želivského, Skalka

**Linka B:**
- Nové Butovice, Smíchovské nádraží, Florenc, Českomoravská, Vysočanská

**Linka C:**
- Ládví, Nádraží Holešovice, Florenc, Pražského povstání, Kačerov

### Zrušení vlastní konečné

Vyberte z dropdownu první nebo poslední stanici linky (skutečnou konečnou).

---

## Přestupní stanice

Přestupní stanice jsou označeny ikonami pod názvem stanice.

### Typy přestupů

| Ikona | Význam |
|-------|--------|
| 🟢 **A** | Přestup na linku A (zelená) |
| 🟡 **B** | Přestup na linku B (žlutá) |
| 🔴 **C** | Přestup na linku C (červená) |
| 🚂 | Přestup na vlak |
| ✈️ | Autobus na letiště (Airport Express) |

### Hlavní přestupní stanice

| Stanice | Přestupy |
|---------|----------|
| **Můstek** | Linka A ↔ B |
| **Muzeum** | Linka A ↔ C |
| **Florenc** | Linka B ↔ C, autobusové nádraží |
| **Hlavní nádraží** | Vlak, autobus na letiště |
| **Nádraží Holešovice** | Vlak |
| **Smíchovské nádraží** | Vlak |

---

## Stavy vlaku

### Stavy zobrazení

| Stav | Popis | Vizuální indikace |
|------|-------|-------------------|
| **Připraveno** | Vlak čeká na odjezd | Zelené kolečko na první stanici |
| **Jede** | Vlak je v pohybu | Odpočet času, animace |
| **Ve stanici** | Vlak je ve stanici | Zelené kolečko, pauza před odjezdem |
| **Konečná** | Vlak dorazil na konečnou | Automatický obrat směru |

### Indikátor připojení

| Indikátor | Význam |
|-----------|--------|
| 🟢 Online (PID) | Připojeno k API |
| 🟡 Připojování... | Probíhá připojení |
| 🔴 Offline | Odpojeno od API |
| 🟠 Simulace | Simulovaná data |

---

## Časté otázky (FAQ)

### Proč se vlak nepohybuje?
- Klikněte na tlačítko **▶ Start** pro spuštění simulace
- Zkontrolujte, zda není simulace pozastavena (tlačítko ⏸ Pauza)

### Jak přepnu na živá data z PID?
1. Klikněte na tlačítko **📡 API**
2. Systém se pokusí připojit k backendu
3. Stav připojení se zobrazí v indikátoru

### Proč jsou některé stanice šedé?
- Máte nastavenou vlastní konečnou stanici
- Stanice za konečnou se zobrazují šedě
- Pro zobrazení celé linky vyberte skutečnou konečnou z dropdownu

### Jak změním rychlost simulace?
- Použijte tlačítka **1×**, **2×** nebo **5×** v ovládacím panelu

### Jak se vrátím na začátek?
- Klikněte na tlačítko **↺ Reset**

---

## Klávesové zkratky

| Klávesa | Akce |
|---------|------|
| **Mezerník** | Start / Pauza |
| **R** | Reset |
| **D** | Změna směru |
| **1** | Rychlost 1× |
| **2** | Rychlost 2× |
| **3** | Rychlost 5× |

---

## Řešení problémů

### Displej se nezobrazuje správně

1. Zkontrolujte, zda používáte podporovaný prohlížeč
2. Obnovte stránku (F5 nebo Ctrl+R)
3. Vymažte cache prohlížeče

### Nelze se připojit k API

1. Zkontrolujte, zda běží backend server
2. Ověřte, že je správně nastaven API klíč
3. Zkontrolujte síťové připojení

### Čas je nesprávný

- Aplikace používá systémový čas vašeho zařízení
- Zkontrolujte nastavení času v operačním systému

---

## Kontakt a podpora

Pro hlášení chyb nebo návrhy na vylepšení navštivte:
**https://github.com/adamvitek21/Studentsk-projekt**

---

*Uživatelská příručka verze 1.0*
*Aktualizováno: 6. ledna 2026*
