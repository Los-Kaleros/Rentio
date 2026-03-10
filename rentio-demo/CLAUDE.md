# Rentio — CLAUDE.md (AI Agent & Developer Context)

## Čo je Rentio

Rentio je webová platforma pre krátkodobé prenájmy nehnuteľností — obojstranný marketplace spájajúci **prenajímateľov** (majiteľov nehnuteľností) s **hosťami** (záujemcami o ubytovanie). Systém automatizuje celý proces od vyhľadania, cez rezerváciu s dočasným zamknutím termínu, až po platbu a hodnotenie.

Tento repozitár obsahuje **demo implementáciu** jadra systému. Slúži ako základ pre ďalší vývoj a ukážku architektúry.

---

## Architektúra projektu

```
rentio-demo/
├── frontend/          React + Vite + Tailwind CSS
├── backend/           Flask REST API + SQLAlchemy
├── database/          SQL schéma, migrácie, seed dáta
├── docker-compose.yml PostgreSQL + TimescaleDB
├── CLAUDE.md          tento súbor
└── README.md          developer onboarding
```

### Tech stack

| Vrstva      | Technológia                        | Dôvod                                         |
|-------------|------------------------------------|-----------------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS     | Rýchly vývoj, komponentová architektúra       |
| Backend     | Flask 3 + SQLAlchemy + Flask-JWT   | Jednoduchý, dobre čitateľný Python REST API   |
| Databáza    | PostgreSQL 16 + TimescaleDB        | ACID transakcie + time-series analytika       |
| Dev prostredie | Docker Compose                  | Jednoduchý lokálny setup bez inštalácií       |

---

## Kľúčové business pravidlá (kritické pre AI agentov)

1. **Anti-overbooking**: Rezervácia musí prebehnúť v ACID transakcii s pesimistickým zamknutím riadku (`SELECT ... FOR UPDATE`). Nikdy nepovoliť dva `Confirmed` záznamy pre rovnakú nehnuteľnosť v prekrývajúcich sa termínoch.

2. **Životný cyklus rezervácie**: `Pending` → `Confirmed` → `Cancelled`. Stav `Pending` expiruje po 15 minútach (CRON job). Priamy prechod z `Pending` do `Cancelled` je povolený.

3. **Dostupnosť termínov**: Nikdy sa neukladá staticky. Vždy sa počíta dynamicky: termín je voľný ak neexistuje `Confirmed` alebo aktívna `Pending` rezervácia, ktorá ho pokrýva.

4. **TimescaleDB**: Tabuľka `booking_events` je hypertable rozdelená podľa `event_time`. Používa sa výlučne na analytiku (trendy rezervácií, vyťaženosť, príjmy). Neslúži na core business logiku.

5. **Autentifikácia**: JWT tokeny, refresh token v httpOnly cookie. Heslá hašované bcrypt.

---

## Moduly systému (mapovanie na SWI dokument)

| Modul (SWI)              | Backend súbory                          | Frontend komponenty                  |
|--------------------------|-----------------------------------------|--------------------------------------|
| Správa identit           | `routes/auth.py`, `models/user.py`      | `AuthModal`, `context/AuthContext`   |
| Správa nehnuteľností     | `routes/properties.py`, `models/property.py` | `PropertyList`, `PropertyCard`  |
| Rezervačný modul         | `routes/reservations.py`, `models/reservation.py` | `ReservationModal`        |
| Platobný modul           | `routes/payments.py` (stub)             | `PaymentStep`                        |
| Modul hodnotenia         | `routes/reviews.py`, `models/review.py` | `ReviewCard`                         |
| Admin panel              | `routes/admin.py`                       | `AdminDashboard`                     |

---

## API endpointy (REST)

### Autentifikácia
```
POST /api/auth/register     Registrácia nového užívateľa
POST /api/auth/login        Prihlásenie, vracia JWT
POST /api/auth/logout       Odhlásenie (invalidácia refresh tokenu)
GET  /api/auth/me           Info o prihlásenom užívateľovi
```

### Nehnuteľnosti
```
GET  /api/properties              Zoznam s filtrami (?city=&guests=&date_from=&date_to=)
POST /api/properties              Vytvorenie inzerátu (Prenajímateľ)
GET  /api/properties/:id          Detail nehnuteľnosti
PUT  /api/properties/:id          Úprava (len vlastník)
GET  /api/properties/:id/availability  Voľné termíny v danom mesiaci
```

### Rezervácie
```
POST /api/reservations            Vytvorenie rezervácie (zamkne termín, stav: Pending)
GET  /api/reservations/:id        Detail rezervácie
POST /api/reservations/:id/confirm  Potvrdenie po úspešnej platbe (stav: Confirmed)
POST /api/reservations/:id/cancel  Zrušenie
GET  /api/users/me/reservations   Moje rezervácie
```

### Analytika (TimescaleDB)
```
GET /api/analytics/bookings-over-time   Trend rezervácií (hypertable query)
GET /api/analytics/occupancy/:id        Vyťaženosť nehnuteľnosti po mesiacoch
```

---

## Databázová schéma (skrátený prehľad)

```sql
users(id PK, email UNIQUE, password_hash, name, role, created_at)
properties(id PK, owner_id FK, title, description, city, price_per_night, max_guests, status)
reservations(id PK, guest_id FK, property_id FK, date_from, date_to, total_price, status, created_at)
reviews(id PK, reservation_id FK UNIQUE, author_id FK, rating, text, created_at)
booking_events(event_time, event_type, reservation_id, property_id, amount) -- TimescaleDB hypertable
```

---

## Ako pridávať nové funkcie (konvencie)

### Backend
- Každý modul = vlastný Blueprint v `backend/routes/`
- Modely v `backend/models/` — jeden súbor per entita
- Validácia vstupu cez `marshmallow` schémy
- Chybové odpovede vždy vo formáte `{"error": "popis", "code": "ERROR_CODE"}`

### Frontend
- Komponenty v `frontend/src/components/` — PascalCase
- API volania výlučne cez `frontend/src/api/client.js`
- Globálny stav (auth, user) cez React Context (`AuthContext`)
- Tailwind triedy — mobile-first prístup

### Git konvencie
- Branch naming: `feature/nazov-funkcie`, `fix/popis-opravy`
- Commit správy: `feat:`, `fix:`, `docs:`, `chore:`

---

## Lokálny development — rýchly štart

```bash
# 1. Databáza
docker-compose up -d

# 2. Backend
cd backend && pip install -r requirements.txt
cp .env.example .env
flask db upgrade
flask seed          # naplní demo dáta
flask run

# 3. Frontend
cd frontend && npm install && npm run dev
```

App beží na: `http://localhost:5173` (frontend) + `http://localhost:5000` (API)

---

## Kontext pre AI agentov

- Primárny jazyk: **slovenčina/čeština** pre dokumentáciu, **angličtina** pre kód
- Tento projekt je semestrálna práca predmetu **SWI** na **VŠB-FEI**
- Zadanie: fáza 1 — špecifikácia (FURPS, Use Case, scénáre) je v `../SWI_extracted/main.tex`
- Demo implementuje Use Cases: UC1 (registrácia), UC2 (inzerát), UC3 (rezervácia + platba)
- **Neimplementovať** platobnú bránu naostro — stub/mock je postačujúci pre demo
