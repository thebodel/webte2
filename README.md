 Obedové menu v okolí fakulty

Klientská webová stránka pre WEBTE1 zadanie 2. Stránka načítava obedové menu z troch zdrojov:

- Eat & Meet - https://eatandmeet.sk/
- Mlynská Koliba - https://mlynskakoliba.sk/#done
- Reštaurácia Riviera - https://restauraciariviera.sk/obedove-menu/

 Spracovanie dát

Každá reštaurácia má vlastnú funkciu na spracovanie HTML v súbore `js/data.js`.
Všetky parsery vracajú rovnakú štruktúru dát, aby sa menu mohlo zobrazovať jednotným spôsobom.
Cudzie HTML sa nevkladá priamo do stránky; pomocou `DOMParser` sa z neho vyberú iba potrebné údaje.
Kniznice
- Bootstrap 5.3.3 
- Day.js 1.11.13 .

Font

Projekt používa lokálny font Inter cez `@font-face` v `css/styles.css`.
Súbory `Inter-Regular.woff2` a `Inter-SemiBold.woff2` sú uložené v priečinku `assets/fonts/`.
Licencia fontu Inter: SIL Open Font License 1.1.

Pouzil LLM pri navrhu struktury a upravach kodu, vysledok som priebezne kontroloval a upravoval rucne.
