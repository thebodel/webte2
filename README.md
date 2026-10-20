# Obedové menu v okolí fakulty

Klientská webová stránka pre WEBTE1 zadanie 2. Stránka načítava obedové menu z troch zdrojov:

- Eat & Meet - https://eatandmeet.sk/
- Mlynská Koliba - https://mlynskakoliba.sk/#done
- Reštaurácia Riviera - https://restauraciariviera.sk/obedove-menu/

## Spracovanie dát

Každá reštaurácia má vlastnú funkciu na spracovanie HTML v súbore `js/data.js`.
Všetky parsery vracajú rovnakú štruktúru dát, aby sa menu mohlo zobrazovať jednotným spôsobom.
Cudzie HTML sa nevkladá priamo do stránky; pomocou `DOMParser` sa z neho vyberú iba potrebné údaje.

## Knižnice

- Bootstrap 5.3.3 - základné štýly formulárov, tlačidiel a rozloženia.
- Day.js 1.11.13 - práca s dátumom cache a formátovaním času aktualizácie.

## Font

Projekt používa lokálny font Inter cez `@font-face` v `css/styles.css`.
Súbory `Inter-Regular.woff2` a `Inter-SemiBold.woff2` sú uložené v priečinku `assets/fonts/`.
Licencia fontu Inter: SIL Open Font License 1.1.

## AI

Pri príprave projektu bol použitý nástroj AI Codex.

## Validácia

Výstupy z HTML a CSS validátorov treba uložiť do priečinka `docs/`.
