# Rentio 🏠

**Platforma pre krátkodobé prenájmy nehnuteľností**
Semestrálny projekt predmetu **SWI** — VŠB-TUO, Fakulta elektrotechniky a informatiky

---

## O projekte

Rentio je obojstranný marketplace spájajúci **prenajímateľov** a **hostí** — podobne ako Airbnb. Umožňuje zverejniť nehnuteľnosť, vyhľadávať ubytovanie, rezervovať termín a sledovať analytiku.

Repozitár obsahuje:
- **Dokumentáciu fázy 1** — špecifikácia požiadaviek (FURPS, Use Case diagramy, scénáre) v LaTeX
- **Demo webovú aplikáciu** — plne funkčný fullstack prototyp (`rentio-demo/`)

---

## Tím

| Meno | Login VŠB |
|------|-----------|
| Matúš Budoš | BUD0081 |
| Kristián Válek | VAL0556 |
| Vojtěch Lisztwan | LIS0168 |

---

## Štruktúra repozitára

```
Rentio/
├── SWI_extracted/          Dokumentácia — LaTeX zdroj (main.tex)
│   └── main.tex            Kompletná spec: FURPS, UC diagramy, scénáre
│
└── rentio-demo/            Demo webová aplikácia
    ├── frontend/           React 18 + Vite + Tailwind CSS
    ├── backend/            Flask 3 REST API + SQLAlchemy
    ├── database/           PostgreSQL schéma + seed dáta
    ├── docker-compose.yml  TimescaleDB lokálne prostredie
    ├── README.md           Návod na spustenie demo
    └── CLAUDE.md           Kontext pre AI agentov a developerov
```

---

## Demo aplikácia

### Tech stack

| Vrstva | Technológia |
|--------|-------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Flask 3, SQLAlchemy, Flask-JWT-Extended |
| Databáza | PostgreSQL 16 + TimescaleDB |
| Infraštruktúra | Docker Compose |

### Kľúčové funkcie

- Prihlásenie a registrácia (JWT, role: hosť / prenajímateľ / admin)
- Prehľad a filtrovanie nehnuteľností
- 3-krokový rezervačný flow s blokovaním termínu na 15 minút
- Anti-overbooking cez ACID transakcie a pesimistické zamykanie
- Admin panel so zoznamom všetkých rezervácií
- Time-series analytika cez TimescaleDB (`time_bucket`)

### Rýchly štart

```bash
git clone https://github.com/Los-Kaleros/Rentio.git
cd Rentio/rentio-demo

# Databáza
docker-compose up -d

# Backend (Python 3.11+)
cd backend && pip install -r requirements.txt
cp .env.example .env
flask run --port 5001

# Frontend (Node 20+)
cd frontend && npm install && npm run dev
```

App beží na **http://localhost:5173**

### Demo účty

| Rola | Email | Heslo |
|------|-------|-------|
| Hosť | `host@rentio.demo` | `demo1234` |
| Prenajímateľ | `owner@rentio.demo` | `demo1234` |
| Admin | `admin@rentio.demo` | `demo1234` |

---

## Dokumentácia

Fáza 1 špecifikácie je vypracovaná v LaTeX (`SWI_extracted/main.tex`) a zahŕňa:

- Popis systému a cieľov projektu
- Analýzu zainteresovaných strán
- Tabuľku FURPS požiadaviek (Functionality, Usability, Reliability, Performance, Supportability)
- Use Case diagram (TikZ) — modul správy identit
- 3 kompletné scénáre s vetvením a rozšíreniami:
  - UC1 — Registrácia užívateľa
  - UC2 — Zverejnenie nehnuteľnosti
  - UC3 — Rezervácia a platba

---

## Licencia

Projekt slúži výlučne na akademické účely v rámci predmetu SWI.
