-- Schema for Deepthi app
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT,
  name_te TEXT,
  price REAL,
  category TEXT,
  description TEXT,
  description_te TEXT,
  image TEXT,
  benefits TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  total REAL,
  status TEXT,
  date TEXT,
  customerEmail TEXT,
  customerId TEXT,
  shippingAddress TEXT,
  items TEXT,
  paymentMethod TEXT,
  paymentId TEXT,
  trackingId TEXT,
  trackingHistory TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  password TEXT,
  role TEXT,
  joinedDate TEXT,
  lastLogin TEXT
);

CREATE TABLE IF NOT EXISTS session (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  user_data TEXT
);

CREATE TABLE IF NOT EXISTS saved_cards (
  id TEXT PRIMARY KEY,
  userId TEXT,
  last4 TEXT,
  brand TEXT,
  expiry TEXT
);

CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  userId TEXT,
  name TEXT,
  phone TEXT,
  area TEXT,
  landmark TEXT,
  city TEXT,
  zip TEXT,
  type TEXT
);

CREATE TABLE IF NOT EXISTS saved_carts (
  id TEXT PRIMARY KEY,
  userId TEXT,
  name TEXT,
  items TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  userId TEXT,
  productId TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS bulk_requests (
  id TEXT PRIMARY KEY,
  customerEmail TEXT,
  items TEXT,
  quantity TEXT,
  status TEXT,
  date TEXT
);

-- Seed admin user (demo only - plaintext password)
INSERT OR REPLACE INTO users (id, name, email, password, role, joinedDate) VALUES (
  'admin-default-1', 'Vijay', 'vijay@gmail.com', 'vijay@567', 'admin', datetime('now')
);

-- Seed products
INSERT OR REPLACE INTO products (id, name, name_te, price, category, description, description_te, image, benefits) VALUES
('p1', 'Buffet Leaf Plate 12"', 'బఫే లీఫ్ ప్లేట్ 12"', 15, 'plates', 'Sustainable 12-inch buffet plate made from premium leaf. Perfect for lunch and dinner.', '12 అంగుళాల బఫే లీఫ్ ప్లేట్. భోజనానికి మరియు విందులకు అనుకూలం.', '/images/tiffin-plates-12inches.jpeg', '["100% Biodegradable","Plastic Free","Natural Aroma"]'),
('p2', 'Buffet Leaf Plate 14"', 'బఫే లీఫ్ ప్లేట్ 14"', 18, 'plates', 'Extra-large 14-inch buffet plate for heavy festival meals. Hand-pressed organic leaf.', '14 అంగుళాల పెద్ద బఫే లీఫ్ ప్లేట్. పండుగ భోజనాలకు అనుకూలం.', '/images/buffet-leaf-plate-14.jpg', '["Heavy Duty","Heat Resistant","Compostable"]'),
('p4', 'Prasadam Round Doppalu (Big)', 'ప్రసాదం రౌండ్ డొప్పలు (పెద్దవి)', 10, 'bowls', 'Large traditional round leaf bowls for temple offerings and full meals.', 'పెద్ద సైజు ప్రసాదం డొప్పలు. గుడి ప్రసాదం మరియు భోజనానికి అనుకూలం.', '/images/prasadam-round-cups.jpeg', '["Sturdy Design","Traditional","Zero Leakage"]'),
('p8', 'Organic Forest Honey', 'అడవి తేనె', 580, 'organic', 'Pure, raw organic honey collected directly from deep forest regions.', 'అడవి నుండి సేకరించిన స్వచ్ఛమైన తేనె. ఎటువంటి కల్తీ లేనిది.', '/images/organic-forest-honey.jpg', '["Unprocessed","Medicinal","Wild Sourced"]');

-- Sample demo customer removed by request (previous 'u-cust-1' entries deleted)
-- If you want to re-add demo customers, add INSERTs here with IDs that follow the 'cust-' prefix to keep formats consistent.

COMMIT;
