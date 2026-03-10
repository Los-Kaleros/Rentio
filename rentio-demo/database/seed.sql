-- Rentio — demo seed dáta
-- Heslá sú bcrypt hash pre "demo1234"

INSERT INTO users (email, password_hash, name, role) VALUES
  ('host@rentio.demo',  '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36p7GmTVwLbMnH6Z5Lq5Bm6', 'Jana Horáčková', 'guest'),
  ('owner@rentio.demo', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36p7GmTVwLbMnH6Z5Lq5Bm6', 'Peter Novák',    'owner'),
  ('admin@rentio.demo', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36p7GmTVwLbMnH6Z5Lq5Bm6', 'Admin Rentio',   'admin');

INSERT INTO properties (owner_id, title, description, city, address, price_per_night, max_guests, status) VALUES
  (2, 'Útulný apartmán v centre Prahy',
      'Krásny 2-izbový apartmán priamo na Starometskom námestí. Výhľad na Orloj, plne vybavená kuchyňa.',
      'Praha', 'Staroměstské náměstí 12', 2800.00, 4, 'active'),
  (2, 'Moderný byt pri Václavskom námestí',
      'Štýlový byt po kompletnej rekonštrukcii. 5 minút pešo od metra Muzeum.',
      'Praha', 'Václavské náměstí 54', 1950.00, 2, 'active'),
  (2, 'Chata v Krkonoších s krbom',
      'Romantická horská chata pre 6 osôb. Sauna, krb, terasa s výhľadom na hory.',
      'Špindlerův Mlýn', 'Horská 8', 4500.00, 6, 'active'),
  (2, 'Loftový byt — Brno centrum',
      'Priestranný industriálny loft 80m². Ideálny pre firemné pobyty aj rodiny.',
      'Brno', 'Náměstí Svobody 3', 2200.00, 5, 'active'),
  (2, 'Štúdio pri mori — Chorvátsko',
      'Klimatizované štúdio 50m od pláže v Splite. Parkovanie v cene.',
      'Split', 'Ulica Mira 21', 3100.00, 2, 'active');
