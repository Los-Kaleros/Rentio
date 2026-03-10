# Rentio 🏠

> Platforma pre krátkodobé prenájmy nehnuteľností — semestrálny projekt SWI, VŠB-FEI

## Tím

| Meno | Login | GitHub |
|---|---|---|
| Matúš Budoš | BUD0081 | — |
| Kristián Válek | VAL0556 | [@Los-Kaleros](https://github.com/Los-Kaleros) |
| Vojtěch Lisztwan | LIS0168 | — |

---

## Čo projekt robí

Rentio je obojstranný marketplace (podobný Airbnb) kde:
- **Prenajímatelia** môžu zverejniť nehnuteľnosť, nastaviť cenu a kalendár dostupnosti
- **Hostia** môžu vyhľadávať ubytovanie, rezervovať termín a platiť online
- **Administrátor** rieši spory, moderuje obsah a sleduje systémové logy

### Kľúčové vlastnosti
- Rezervačný engine s anti-overbooking ochranou (ACID transakcie)
- Dynamický výpočet dostupnosti termínov
- Time-series analytika cez TimescaleDB
- JWT autentifikácia s rolami (Host / Prenajímateľ / Admin)

---

## Tech stack

```
Frontend:  React 18 + Vite + Tailwind CSS
Backend:   Flask 3 (Python) + SQLAlchemy + Flask-JWT-Extended
Databáza:  PostgreSQL 16 + TimescaleDB
Dev:       Docker Compose
```

---

## Rýchly štart

### Požiadavky
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Node.js 20+](https://nodejs.org/)
- [Python 3.11+](https://python.org/)

### 1. Klon repozitára
```bash
git clone https://github.com/Los-Kaleros/Rentio.git
cd Rentio/rentio-demo
```

### 2. Štart databázy
```bash
docker-compose up -d
# PostgreSQL + TimescaleDB beží na localhost:5432
```

### 3. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # uprav podľa potreby
flask db upgrade                 # vytvorí tabuľky
flask seed                       # naplní demo dáta
flask run
# API beží na http://localhost:5000
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
# App beží na http://localhost:5173
```

---

## Štruktúra projektu

```
rentio-demo/
├── frontend/
│   ├── src/
│   │   ├── components/       UI komponenty (Navbar, PropertyCard, ...)
│   │   ├── pages/            Stránky (Home, Dashboard, ...)
│   │   ├── api/              API klient (axios wrappery)
│   │   ├── context/          React Context (AuthContext)
│   │   └── hooks/            Custom hooks
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── routes/               Flask Blueprinty (auth, properties, reservations)
│   ├── models/               SQLAlchemy modely
│   ├── app.py                Vstupný bod, inicializácia Flask app
│   ├── config.py             Konfigurácia (env vars)
│   └── requirements.txt
│
├── database/
│   ├── schema.sql            Kompletná SQL schéma
│   └── seed.sql              Demo dáta
│
├── docker-compose.yml        PostgreSQL + TimescaleDB
├── CLAUDE.md                 Kontext pre AI agentov a detailná dokumentácia
└── README.md                 tento súbor
```

---

## Demo účty (po spustení `flask seed`)

| Rola | Email | Heslo |
|---|---|---|
| Host | host@rentio.demo | demo1234 |
| Prenajímateľ | owner@rentio.demo | demo1234 |
| Admin | admin@rentio.demo | demo1234 |

---

## Súvislosť so SWI dokumentom

Demo implementuje tri hlavné Use Cases z fázy 1 (dokument v `../SWI_extracted/`):

| Use Case | Popis | Status |
|---|---|---|
| UC1 — Registrácia | Registrácia a prihlásenie užívateľa | ✅ implementované |
| UC2 — Inzerát | Vytvorenie a publikácia nehnuteľnosti | ✅ implementované |
| UC3 — Rezervácia | Rezervácia termínu a platba (mock) | ✅ implementované |

---

## Prispievanie

1. Forkni repozitár / vytvor branch: `git checkout -b feature/nazov`
2. Commitni zmeny: `git commit -m "feat: popis zmeny"`
3. Otvor Pull Request na `main`

Pre detailné konvencie a architektúru pozri **[CLAUDE.md](./CLAUDE.md)**.
