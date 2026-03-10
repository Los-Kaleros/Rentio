-- Rentio — databázová schéma
-- PostgreSQL 16 + TimescaleDB

CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- ── Užívatelia ──────────────────────────────────────────────
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'guest'
                  CHECK (role IN ('guest', 'owner', 'admin')),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Nehnuteľnosti ───────────────────────────────────────────
CREATE TABLE properties (
    id               SERIAL PRIMARY KEY,
    owner_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title            VARCHAR(200) NOT NULL,
    description      TEXT,
    city             VARCHAR(100) NOT NULL,
    address          VARCHAR(255),
    price_per_night  NUMERIC(10, 2) NOT NULL CHECK (price_per_night > 0),
    max_guests       SMALLINT NOT NULL CHECK (max_guests > 0),
    status           VARCHAR(20) NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'inactive', 'draft')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Rezervácie ──────────────────────────────────────────────
CREATE TABLE reservations (
    id           SERIAL PRIMARY KEY,
    guest_id     INTEGER NOT NULL REFERENCES users(id),
    property_id  INTEGER NOT NULL REFERENCES properties(id),
    date_from    DATE NOT NULL,
    date_to      DATE NOT NULL,
    total_price  NUMERIC(10, 2) NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    expires_at   TIMESTAMPTZ,   -- pre pending rezervácie (15 min timeout)
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT no_past_dates CHECK (date_from >= CURRENT_DATE),
    CONSTRAINT valid_range   CHECK (date_to > date_from)
);

-- Index pre rýchlu kontrolu dostupnosti termínov
CREATE INDEX idx_reservations_property_dates
    ON reservations (property_id, date_from, date_to)
    WHERE status IN ('pending', 'confirmed');

-- ── Hodnotenia ──────────────────────────────────────────────
CREATE TABLE reviews (
    id             SERIAL PRIMARY KEY,
    reservation_id INTEGER UNIQUE NOT NULL REFERENCES reservations(id),
    author_id      INTEGER NOT NULL REFERENCES users(id),
    rating         SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text           TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TimescaleDB — booking_events hypertable ─────────────────
-- Používa sa výlučne na analytiku, nie na core business logiku
CREATE TABLE booking_events (
    event_time     TIMESTAMPTZ NOT NULL,
    event_type     VARCHAR(30) NOT NULL,   -- 'reservation_created', 'confirmed', 'cancelled'
    reservation_id INTEGER,
    property_id    INTEGER,
    guest_id       INTEGER,
    amount         NUMERIC(10, 2),
    metadata       JSONB
);

SELECT create_hypertable('booking_events', 'event_time');

CREATE INDEX idx_booking_events_property
    ON booking_events (property_id, event_time DESC);
