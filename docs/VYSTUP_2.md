# Výstup č. 2 - Metro Praha Informační Displej

## Období: Leden - Únor 2026

---

## Shrnutí práce

V této fázi projektu jsme rozšířili informační displej metra o několik klíčových funkcí. Hlavním zaměřením bylo přidání **přestupních ikon** pod linku metra, které vizuálně zobrazují možnosti přestupu na jiné linky metra (A, B, C), vlaky a autobusy včetně Airport Express.

Další významnou funkcí je **tabulka odjezdů z příští stanice**. Systém nyní zobrazuje real-time odjezdy všech druhů dopravy (metro, tramvaje, autobusy, vlaky) z aktuální nebo příští stanice. Data jsou získávána prostřednictvím **Golemio API** (PID GTFS-RT), které poskytuje aktuální informace o pražské integrované dopravě.

Implementovali jsme také **kombinovaný produkční displej**, který automaticky střídá zobrazení metro mapy (15 sekund) a tabulky odjezdů (5 sekund). Komunikace mezi komponentami probíhá pomocí postMessage API.

Produkční verze displeje má nyní **fixní rozlišení 4096×607 pixelů** bez deformace, optimalizované pro průmyslové displeje v soupravách metra. Byly přidány **plynulé animace** pohybu vlaku pomocí requestAnimationFrame a lerp interpolace.

---

## Implementované funkce

| Funkce | Popis |
|--------|-------|
| Přestupní ikony | SVG ikony metro linek, vlaků, autobusů pod stanicemi |
| Tabulka odjezdů | Real-time odjezdy ze zastávek PID |
| Golemio API | Připojení k veřejnému API pro data PID |
| Kombinovaný displej | Střídání metro mapy a odjezdů |
| Fixní rozlišení | 4096×607px pro produkční displeje |
| Smooth animace | Plynulý pohyb pomocí requestAnimationFrame |

---

## Technologie

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: FastAPI (Python), REST API polling
- **API**: Golemio API (PID GTFS-RT)
- **Komunikace**: postMessage pro iframe komunikaci

---

*Autor: Adam Vítek*
*Datum: Únor 2026*
