# Uživatelská příručka - Metro Praha Displej

## Úvod

Aplikace Metro Praha Displej je informační systém zobrazující aktuální pozice vlaků pražského metra na linkách A, B a C. Systém je navržen pro průmyslové displeje ve stanicích metra, ale lze jej používat i ve webovém prohlížeči.

---

## Dostupné verze aplikace

| Verze | URL | Popis |
|-------|-----|-------|
| **Vývojová metro** | `metro-map.html` | S ovládacím panelem |
| **Produkční metro** | `metro-production.html` | Fixní 4096×607px, bez ovládání |
| **Vývojová odjezdy** | `departures.html` | Tabulka odjezdů s ovládáním |
| **Produkční odjezdy** | `departures-production.html` | Fixní rozlišení |
| **Kombinovaný** | `combined-production.html` | Metro mapa + odjezdy střídavě |

---

## Rychlý start

### Spuštění aplikace

1. Otevřete webový prohlížeč
2. Přejděte na adresu:
   - **Linka C (výchozí):** `http://localhost:5002/metro-map.html`
   - **Linka A:** `http://localhost:5002/metro-map.html?line=A`
   - **Linka B:** `http://localhost:5002/metro-map.html?line=B`

### Produkční verze (doporučeno pro displeje)

```
http://localhost:5002/metro-production.html?line=C
http://localhost:5002/combined-production.html?line=C
http://localhost:5002/departures-production.html?stop=Florenc
```

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

## Kombinovaný displej (NOVÉ)

Kombinovaný displej automaticky střídá metro mapu a tabulku odjezdů.

### Spuštění

```
http://localhost:5002/combined-production.html?line=C
http://localhost:5002/combined-production.html?line=C&debug=true
```

### Konfigurace časování

| Parametr | Výchozí | Popis |
|----------|---------|-------|
| `metroTime` | 15 | Čas zobrazení metro mapy (sekundy) |
| `departuresTime` | 5 | Čas zobrazení odjezdů (sekundy) |

**Příklad:**
```
?line=C&metroTime=20&departuresTime=10
```

### Automatická synchronizace

Kombinovaný displej automaticky:
1. Sleduje aktuální stanici z metro mapy
2. Při přepnutí na odjezdy zobrazí odjezdy ze stanice, kam vlak právě přijíždí
3. Dynamicky aktualizuje odjezdy podle pohybu vlaku

### Debug režim

Přidejte `&debug=true` pro zobrazení:
- Aktuální zobrazení (metro/departures)
- Zbývající čas do přepnutí
- Aktuální sledovaná stanice

---

## Tabulka odjezdů (NOVÉ)

Zobrazuje real-time odjezdy ze zastávek PID (metro, tramvaje, autobusy, vlaky).

### Spuštění

```
http://localhost:5002/departures-production.html?stop=Florenc
http://localhost:5002/departures-production.html?stop=Muzeum&limit=8
```

### Parametry

| Parametr | Výchozí | Popis |
|----------|---------|-------|
| `stop` | Florenc | Název zastávky |
| `limit` | 10 | Počet zobrazených odjezdů |
| `refresh` | 30 | Interval obnovení (sekundy) |

### Zobrazované informace

- Typ dopravy (ikona: metro, tramvaj, autobus, vlak)
- Číslo linky
- Cílová stanice
- Čas odjezdu
- Odpočet do odjezdu

---

## Produkční nasazení

### Doporučené nastavení pro průmyslové displeje

1. Použijte **fixní rozlišení 4096×607px**
2. Použijte produkční verze (`*-production.html`)
3. Nastavte prohlížeč do fullscreen režimu (F11)
4. Zakažte screensaver a usínání displeje

### Příklady konfigurace

**Jen metro mapa:**
```
metro-production.html?line=C&lang=cs
```

**Kombinovaný displej (doporučeno):**
```
combined-production.html?line=C&metroTime=15&departuresTime=5
```

**Jen odjezdy:**
```
departures-production.html?stop=Florenc&limit=10&refresh=30
```

---

*Uživatelská příručka verze 2.0*
*Aktualizováno: 7. února 2026*
