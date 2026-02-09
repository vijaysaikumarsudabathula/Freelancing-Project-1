
import { Product, Order, User, BulkRequest, SavedCard, OrderStatus, TrackingEvent } from '../types';

let db: any = null;
let SQL: any = null;

export async function initDatabase() {
  if (db) return db;
  if (!SQL) {
    SQL = await (window as any).initSqlJs({
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm`
    });
  }

  // Attempt to load a previously persisted DB from IndexedDB so user data persists across reloads.
  const saved = await (async function loadSaved() {
    try {
      return await loadFromIDB('user-db');
    } catch (e) {
      return null;
    }
  })();

  if (saved && saved.byteLength) {
    db = new SQL.Database(new Uint8Array(saved));
  } else {
    db = new SQL.Database();
  }

  // Ensure our application schema exists (idempotent)
  db.run(`
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
    
    -- Orders store purchases; customerEmail is kept for backward compatibility
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

    -- Saved cards for users (for convenience only; do NOT store raw card numbers in production)
    CREATE TABLE IF NOT EXISTS saved_cards (
      id TEXT PRIMARY KEY,
      userId TEXT,
      last4 TEXT,
      brand TEXT,
      expiry TEXT
    );

    -- Saved addresses
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

    -- Saved carts / saved orders (user can save a cart for later checkout)
    CREATE TABLE IF NOT EXISTS saved_carts (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT,
      items TEXT,
      createdAt TEXT
    );

    -- Favorites / wishlist
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      userId TEXT,
      productId TEXT,
      createdAt TEXT
    );

    -- Bulk requests from customers
    CREATE TABLE IF NOT EXISTS bulk_requests (
      id TEXT PRIMARY KEY,
      customerEmail TEXT,
      items TEXT,
      quantity TEXT,
      status TEXT,
      date TEXT
    );

    -- Audit log: every login event with timestamp, user info, IP attempt
    CREATE TABLE IF NOT EXISTS login_history (
      id TEXT PRIMARY KEY,
      userId TEXT,
      email TEXT,
      loginTime TEXT,
      status TEXT,
      device TEXT,
      notes TEXT
    );

    -- Activity log: every transaction, update, action
    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      userId TEXT,
      activityType TEXT,
      description TEXT,
      timestamp TEXT,
      details TEXT
    );

    -- Transaction log: detailed payment/order transactions
    CREATE TABLE IF NOT EXISTS transaction_log (
      id TEXT PRIMARY KEY,
      orderId TEXT,
      userId TEXT,
      amount REAL,
      paymentMethod TEXT,
      status TEXT,
      timestamp TEXT,
      notes TEXT
    );
  `);

  seedInitialData();
  // Note: We intentionally do NOT persist to localStorage. Use explicit export/import to manage DB files.
  return db;
}

/** Basic IndexedDB helpers for storing the binary DB file locally */
function openIDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = window.indexedDB.open('deepthi-db', 1);
    req.onupgradeneeded = () => {
      try { req.result.createObjectStore('files'); } catch (e) { /* ignore */ }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function saveToIDB(key: string, buffer: ArrayBuffer | ArrayBufferLike) {
  return openIDB().then(dbConn => new Promise<void>((resolve, reject) => {
    const tx = dbConn.transaction('files', 'readwrite');
    tx.objectStore('files').put(buffer, key);
    tx.oncomplete = () => { dbConn.close(); resolve(); };
    tx.onerror = () => { dbConn.close(); reject(tx.error); };
  }));
}

function loadFromIDB(key: string) {
  return openIDB().then(dbConn => new Promise<ArrayBuffer | null>((resolve, reject) => {
    const tx = dbConn.transaction('files', 'readonly');
    const req = tx.objectStore('files').get(key);
    req.onsuccess = () => { dbConn.close(); resolve(req.result || null); };
    req.onerror = () => { dbConn.close(); reject(req.error); };
  }));
}

/** Persist the in-memory DB to IndexedDB in the background and notify listeners */
function saveDatabase() {
  try {
    if (!db) return;
    const u8 = db.export();
    const buffer = u8 instanceof Uint8Array ? u8.buffer : (u8 as ArrayBuffer);
    saveToIDB('user-db', buffer as ArrayBuffer).catch(e => console.warn('Failed to persist DB to IndexedDB', e));
    // Notify other UI components that DB changed
    try { window.dispatchEvent(new Event('deepthi-db-changed')); } catch (e) { }
  } catch (e) {
    console.warn('saveDatabase error', e);
  }
}

function seedInitialData() {
    // Admin setup
    db.run("INSERT OR REPLACE INTO users (id, name, email, password, role, joinedDate) VALUES (?, ?, ?, ?, ?, ?)", 
      ['u-admin-1', 'Vijay', 'vijay@gmail.com', 'vijay@123', 'admin', new Date().toISOString()]);

    const initialProducts: Product[] = [
      {
        id: 'p1',
        name: 'Buffet Leaf Plate 12"',
        name_te: 'బఫే లీఫ్ ప్లేట్ 12"',
        price: 15,
        category: 'plates',
        description: 'Sustainable 12-inch buffet plate made from premium leaf. Perfect for lunch and dinner.',
        description_te: '12 అంగుళాల బఫే లీఫ్ ప్లేట్. భోజనానికి మరియు విందులకు అనుకూలం.',
        // Changed to local folder path
        image: '/images/tiffin-plates-12inches.jpeg',
        benefits: ['100% Biodegradable', 'Plastic Free', 'Natural Aroma']
      },
      {
        id: 'p2',
        name: 'Buffet Leaf Plate 14"',
        name_te: 'బఫే లీఫ్ ప్లేట్ 14"',
        price: 18,
        category: 'plates',
        description: 'Extra-large 14-inch buffet plate for heavy festival meals. Hand-pressed organic leaf.',
        description_te: '14 అంగుళాల పెద్ద బఫే లీఫ్ ప్లేట్. పండుగ భోజనాలకు అనుకూలం.',
        image: '/images/buffet-leaf-plate-14.jpg',
        benefits: ['Heavy Duty', 'Heat Resistant', 'Compostable']
      },
      {
        id: 'p4',
        name: 'Prasadam Round Doppalu (Big)',
        name_te: 'ప్రసాదం రౌండ్ డొప్పలు (పెద్దవి)',
        price: 10,
        category: 'bowls',
        description: 'Large traditional round leaf bowls for temple offerings and full meals.',
        description_te: 'పెద్ద సైజు ప్రసాదం డొప్పలు. గుడి ప్రసాదం మరియు భోజనానికి అనుకూలం.',
        image: '/images/prasadam-round-cups.jpeg',
        benefits: ['Sturdy Design', 'Traditional', 'Zero Leakage']
      },
      {
        id: 'p8',
        name: 'Organic Forest Honey',
        name_te: 'అడవి తేనె',
        price: 580,
        category: 'organic',
        description: 'Pure, raw organic honey collected directly from deep forest regions.',
        description_te: 'అడవి నుండి సేకరించిన స్వచ్ఛమైన తేనె. ఎటువంటి కల్తీ లేనిది.',
        image: '/images/organic-forest-honey.jpg',
        benefits: ['Unprocessed', 'Medicinal', 'Wild Sourced']
      }
      ,
      {
        id: 'p3',
        name: 'Buffet Leaf Plate 10"',
        name_te: 'బఫే లీఫ్ ప్లేట్ 10"',
        price: 12,
        category: 'plates',
        description: 'Compact 10-inch leaf plate suitable for small meals and events.',
        description_te: 'చిన్న భోజనాలకు అనుకూలమైన 10 ఇంచ్ ఆకు ప్లేట్.',
        image: '/images/buffet-leaf-plate-10.jpg',
        benefits: ['Compostable', 'Lightweight']
      },
      {
        id: 'p5',
        name: 'Prasadam Round Doppalu (Small)',
        name_te: 'ప్రసాదం రౌండ్ డొప్పలు (చిన్నవి)',
        price: 6,
        category: 'bowls',
        description: 'Small round leaf bowls for prasadam and small servings.',
        description_te: 'ప్రసాదం కోసం చిన్న రౌండ్ డొప్పలు.',
        image: '/images/prasadam-round-small.jpeg',
        benefits: ['Traditional', 'Leakproof']
      },
      {
        id: 'p6',
        name: 'Prasadam Round Doppalu (Medium)',
        name_te: 'ప్రసాదం రౌండ్ డొప్పలు (మధ్యస్థ)',
        price: 8,
        category: 'bowls',
        description: 'Medium sized traditional leaf bowls for family meals.',
        description_te: 'ఇలా మధ్యస్థ పరిమాణంలో ఉన్న డొప్పలు వివాహాలకు మరియు కుటుంబ భోజనాలకు.',
        image: '/images/prasadam-round-medium.jpeg',
        benefits: ['Sturdy', 'Eco-friendly']
      },
      {
        id: 'p9',
        name: 'Vistaraku (Table Meals)',
        name_te: 'విస్తరకు (టేబుల్ భోజనాలు)',
        price: 20,
        category: 'plates',
        description: 'Vistaraku plates designed for full-course table meals.',
        description_te: 'పూర్తి టేబుల్ భోజనాలకు అనుకూలమైన విస్తరకు ప్లేట్లు.',
        image: '/images/vistaraku-table-meals.jpg',
        benefits: ['Durable', 'Traditional']
      },
      {
        id: 'p10',
        name: 'Earthen Tea/Water Glasses & Bottles',
        name_te: 'మట్టి టీ/వాటర్ గ్లాసులు మరియు బాటిల్స్',
        price: 120,
        category: 'earthen',
        description: 'Handmade earthen tea glasses, water glasses and bottles for natural cooling.',
        description_te: 'స్వభావిక శీతలీకరణ కోసం మట్టి గ్లాసులు మరియు బాటిల్స్.',
        image: '/images/earthen-glasses.jpg',
        benefits: ['Handmade', 'Natural Cooling']
      },
      {
        id: 'p11',
        name: 'Organic Pulses & Millets',
        name_te: 'సేంద్రీయ పప్పులు మరియు మిల్లెట్స్',
        price: 120,
        category: 'food',
        description: 'Locally sourced organic pulses and nutritious millets.',
        description_te: 'ప్రాంతీయంగా ఉత్పత్తిచేసిన సేంద్రియ పప్పులు మరియు పోషక మిల్లెట్స్.',
        image: '/images/pulses-millets.jpg',
        benefits: ['Organic', 'Nutrient Rich']
      },
      {
        id: 'p12',
        name: 'Cold Pressed Oils',
        name_te: 'కోల్డ్ ప్రెస్డ్ నూనెలు',
        price: 250,
        category: 'oil',
        description: 'Healthy cold-pressed oils retaining natural nutrients and flavour.',
        description_te: 'ప్రाकृतिक పోషకాలను మరియు రుచిని నిలుపుకునే కోల్డ్-ప్రెస్డ్ నూనెలు.',
        image: '/images/cold-pressed-oils.jpg',
        benefits: ['Unrefined', 'Nutrient Rich']
      }
    ];

    initialProducts.forEach(p => {
      db.run(`INSERT OR REPLACE INTO products (id, name, name_te, price, category, description, description_te, image, benefits) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.name_te, p.price, p.category, p.description, p.description_te, p.image, JSON.stringify(p.benefits)]
      );
    });
}

/** Export the current DB as Uint8Array (SQLite file bytes) */
export function exportDatabase(): Uint8Array {
  if (!db) return new Uint8Array();
  return db.export();
}

/** Trigger a download of the DB file */
export function downloadDatabase(filename = 'deepthi.sqlite') {
  const u8 = exportDatabase();
  if (!u8 || u8.length === 0) return;
  const buffer = u8 instanceof Uint8Array ? (u8.buffer as ArrayBuffer) : (u8 as ArrayBuffer);
  const blob = new Blob([buffer], { type: 'application/x-sqlite3' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Import a DB from a Uint8Array or ArrayBuffer */
export async function importDatabase(bytes: Uint8Array | ArrayBuffer) {
  if (!SQL) {
    SQL = await (window as any).initSqlJs({
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm`
    });
  }
  const arr = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
  db = new SQL.Database(arr);

  // Run lightweight migrations to ensure our app tables exist
  try {
    const info = db.exec("PRAGMA table_info('orders')");
    if (info && info.length > 0) {
      const cols = info[0].values.map((r: any[]) => r[1]);
      if (!cols.includes('customerId')) {
        db.run("ALTER TABLE orders ADD COLUMN customerId TEXT");
      }
    }

    db.run(`
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
    `);
  } catch (e) {
    console.warn('DB import/migration issue', e);
  }

  // Persist the imported DB to IndexedDB
  saveDatabase();
  return db;
}

/** Execute arbitrary SQL and return results (use with care) */
export function runSql(sql: string) {
  if (!db) return null;
  try {
    const res = db.exec(sql);
    // Check if this is a write operation (DML/DDL)
    const isWrite = /^\s*(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|PRAGMA)/i.test(sql);
    if (isWrite) {
      saveDatabase(); // Auto-persist write operations
    }
    return res; // array of results for SELECT
  } catch (e) {
    // Try non-select statement
    try {
      db.run(sql);
      const isWrite = /^\s*(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|PRAGMA)/i.test(sql);
      if (isWrite) {
        saveDatabase(); // Auto-persist write operations
      }
      return { ok: true };
    } catch (er) {
      return { error: String(er) };
    }
  }
}

/** List non-internal tables */
export function getTableList() {
  if (!db) return [];
  const res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;");
  if (!res || res.length === 0) return [];
  return res[0].values.map((r: any[]) => r[0]);
}

/** Return entire table contents (limited to 2000 rows) */
export function getTableContents(table: string) {
  if (!db) return { columns: [], values: [] };
  try {
    const res = db.exec(`SELECT * FROM ${table} LIMIT 2000`);
    if (!res || res.length === 0) return { columns: [], values: [] };
    return { columns: res[0].columns, values: res[0].values };
  } catch (e) {
    return { columns: [], values: [] };
  }
}

export function getProducts(): Product[] {
  if (!db) return [];
  const res = db.exec("SELECT * FROM products");
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => {
      if (col === 'benefits') obj[col] = JSON.parse(row[i]);
      else obj[col] = row[i];
    });
    // Runtime fix: if image is a placeholder logo, replace with mapped product image
    const productImageMap: Record<string, string> = {
      'p1': '/images/tiffin-plates-12inches.jpeg',
      'p2': '/images/buffet-leaf-plate-14.jpg',
      'p4': '/images/prasadam-round-cups.jpeg',
      'p8': '/images/organic-forest-honey.jpg'
    };
    if (typeof obj.image === 'string' && obj.image.includes('deepthi-logo')) {
      if (productImageMap[obj.id]) obj.image = productImageMap[obj.id];
    }
    return obj as Product;
  });
}

export function saveProduct(p: Product) {
  // Ensure image path is correctly formatted if it's just a filename
  const finalImagePath = (p.image.startsWith('http') || p.image.startsWith('/') || p.image.startsWith('data:') || p.image.includes('/images/'))
    ? p.image
    : `/images/${p.image}`;

  db.run(`INSERT OR REPLACE INTO products (id, name, name_te, price, category, description, description_te, image, benefits) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [p.id, p.name, p.name_te, p.price, p.category, p.description, p.description_te, finalImagePath, JSON.stringify(p.benefits)]
  );
  saveDatabase();
}

export function deleteProduct(id: string) {
  db.run("DELETE FROM products WHERE id = ?", [id]);
  saveDatabase();
}

export function getOrders(): Order[] {
  if (!db) return [];
  const res = db.exec("SELECT * FROM orders ORDER BY date DESC");
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => {
      if (col === 'items' || col === 'trackingHistory') obj[col] = JSON.parse(row[i] || '[]');
      else obj[col] = row[i];
    });
    // Fix images inside order items if they reference the placeholder logo
    const productImageMap: Record<string, string> = {
      'p1': '/images/tiffin-plates-12inches.jpeg',
      'p2': '/images/buffet-leaf-plate-14.jpg',
      'p4': '/images/prasadam-round-cups.jpeg',
      'p8': '/images/organic-forest-honey.jpg'
    };
    if (Array.isArray(obj.items)) {
      obj.items = obj.items.map((it: any) => {
        if (it && typeof it.image === 'string' && it.image.includes('deepthi-logo')) {
          if (productImageMap[it.id]) it.image = productImageMap[it.id];
        }
        return it;
      });
    }
    return obj as Order;
  });
}

export function addOrder(o: Order) {
  // If customerId exists on order, persist it as well
  db.run(`INSERT INTO orders (id, total, status, date, customerEmail, customerId, shippingAddress, items, paymentMethod, paymentId, trackingId, trackingHistory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      o.id, o.total, o.status, o.date, o.customerEmail, (o as any).customerId || '', o.shippingAddress, 
      JSON.stringify(o.items), o.paymentMethod, o.paymentId, o.trackingId || '', 
      JSON.stringify(o.trackingHistory || [{ status: 'pending', timestamp: new Date().toISOString() }])
    ]
  );
  // Log order creation
  logActivity((o as any).customerId || o.customerEmail, 'ORDER_CREATED', `Order created: ${o.id}`, { orderId: o.id, total: o.total, itemCount: o.items.length });
  logTransaction(o.id, (o as any).customerId || o.customerEmail, o.total, o.paymentMethod || 'unknown', 'completed', 'Order placed');
  saveDatabase();
}

export function updateOrderStatus(id: string, status: OrderStatus, trackingId?: string) {
  const currentOrders = getOrders();
  const order = currentOrders.find(o => o.id === id);
  if (!order) return;

  const newEvent: TrackingEvent = {
    status,
    timestamp: new Date().toISOString(),
    location: 'Hyderabad Processing Facility'
  };

  const updatedHistory = [...order.trackingHistory, newEvent];

  db.run("UPDATE orders SET status = ?, trackingId = ?, trackingHistory = ? WHERE id = ?", [
    status, 
    trackingId || order.trackingId || '', 
    JSON.stringify(updatedHistory), 
    id
  ]);
  saveDatabase();
}

export function findUserByEmail(email: string): User | null {
  if (!db) return null;
  try {
    // Use a prepared statement and binding to avoid issues with exec parameter support
    const stmt = db.prepare("SELECT * FROM users WHERE UPPER(email) = UPPER(?)");
    stmt.bind([email]);
    const hasRow = stmt.step();
    if (!hasRow) { stmt.free(); return null; }
    const row = stmt.getAsObject();
    stmt.free();
    return row as User;
  } catch (e) {
    console.warn('findUserByEmail error', e);
    return null;
  }
}

export function addUser(u: User) {
  // Enforce ID format by role
  if (!u.id || (u.role === 'customer' && !u.id.startsWith('cust-')) || (u.role === 'admin' && !u.id.startsWith('admin-'))) {
    if (u.role === 'admin') u.id = `admin-${Date.now()}`;
    else if (u.role === 'customer') u.id = `cust-${Date.now()}`;
    else u.id = `u-${Date.now()}`;
  }
  if (!u.joinedDate) u.joinedDate = new Date().toISOString();

  db.run("INSERT OR REPLACE INTO users (id, name, email, password, role, joinedDate, lastLogin) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [u.id, u.name, u.email, u.password || '', u.role, u.joinedDate, u.lastLogin || '']);
  saveDatabase();
}

/** Remove a user by email (and associated dependent records) */
export function deleteUserByEmail(email: string) {
  if (!db) return false;
  try {
    const u = findUserByEmail(email);
    if (!u) return false;
    deleteUser(u.id);
    saveDatabase();
    try { window.dispatchEvent(new Event('deepthi-db-changed')); } catch (e) {}
    return true;
  } catch (e) {
    console.warn('deleteUserByEmail error', e);
    return false;
  }
}

export function getUsers(): User[] {
  if (!db) return [];
  const res = db.exec("SELECT * FROM users");
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    return obj as User;
  });
}

export function getActiveUser(): User | null {
  if (!db) return null;
  const res = db.exec("SELECT user_data FROM session WHERE id = 1");
  if (res.length === 0) return null;
  return JSON.parse(res[0].values[0][0]);
}

export function setActiveUserDB(user: User | null) {
  if (user) {
    db.run("INSERT OR REPLACE INTO session (id, user_data) VALUES (1, ?)", [JSON.stringify(user)]);
  } else {
    db.run("DELETE FROM session WHERE id = 1");
  }
  saveDatabase();
}

/** Saved cards */
export function getSavedCards(userId: string): SavedCard[] {
  if (!db) return [];
  const res = db.exec("SELECT * FROM saved_cards WHERE userId = ?", [userId]);
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    return obj as SavedCard;
  });
}

export function addSavedCard(userId: string, card: SavedCard) {
  db.run("INSERT OR REPLACE INTO saved_cards (id, userId, last4, brand, expiry) VALUES (?, ?, ?, ?, ?)",
    [card.id, userId, card.last4, card.brand, card.expiry]);
  // Log card update (never log full card number for security)
  logActivity(userId, 'CARD_SAVED', `Card saved: ${card.brand} ending in ${card.last4}`, { brand: card.brand, last4: card.last4 });
  saveDatabase();
}

export function deleteSavedCard(id: string) {
  db.run("DELETE FROM saved_cards WHERE id = ?", [id]);
  saveDatabase();
}

/** Addresses */
export function getAddresses(userId: string) {
  if (!db) return [];
  const res = db.exec("SELECT * FROM addresses WHERE userId = ?", [userId]);
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    return obj;
  });
}

export function addAddress(userId: string, addr: any) {
  db.run("INSERT OR REPLACE INTO addresses (id, userId, name, phone, area, landmark, city, zip, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [addr.id, userId, addr.name, addr.phone, addr.area, addr.landmark, addr.city, addr.zip, addr.type]);
  // Log address update
  logActivity(userId, 'ADDRESS_ADDED', `Address added: ${addr.city}, ${addr.type}`, { address: addr });
  saveDatabase();
}

export function deleteAddress(id: string) {
  db.run("DELETE FROM addresses WHERE id = ?", [id]);
  saveDatabase();
}

/** Favorites / wishlist */
export function getFavorites(userId: string) {
  if (!db) return [];
  const res = db.exec("SELECT * FROM favorites WHERE userId = ? ORDER BY createdAt DESC", [userId]);
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    return obj;
  });
}

export function addFavorite(userId: string, productId: string) {
  const id = `fav-${userId}-${productId}`;
  db.run("INSERT OR REPLACE INTO favorites (id, userId, productId, createdAt) VALUES (?, ?, ?, ?)", [id, userId, productId, new Date().toISOString()]);
  logActivity(userId, 'FAVORITE_ADDED', `Added product ${productId} to favorites`, { productId });
  saveDatabase();
}

export function removeFavorite(id: string) {
  db.run("DELETE FROM favorites WHERE id = ?", [id]);
  saveDatabase();
}

/** Saved carts (saved orders) */
export function getSavedCarts(userId: string) {
  if (!db) return [];
  const res = db.exec("SELECT * FROM saved_carts WHERE userId = ? ORDER BY createdAt DESC", [userId]);
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    if (obj.items) obj.items = JSON.parse(obj.items);
    return obj;
  });
}

export function addSavedCart(userId: string, cart: any) {
  db.run("INSERT OR REPLACE INTO saved_carts (id, userId, name, items, createdAt) VALUES (?, ?, ?, ?, ?)",
    [cart.id, userId, cart.name || 'Saved cart', JSON.stringify(cart.items || []), cart.createdAt || new Date().toISOString()]);
  logActivity(userId, 'CART_SAVED', `Cart saved: ${cart.name || 'Saved cart'} with ${(cart.items || []).length} items`, { cartName: cart.name });
  saveDatabase();
}

export function deleteSavedCart(id: string) {
  db.run("DELETE FROM saved_carts WHERE id = ?", [id]);
  saveDatabase();
}

/** Bulk requests */
export function getBulkRequests() {
  if (!db) return [];
  const res = db.exec("SELECT * FROM bulk_requests ORDER BY date DESC");
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    return obj as BulkRequest;
  });
}

export function addBulkRequest(b: BulkRequest) {
  db.run("INSERT OR REPLACE INTO bulk_requests (id, customerEmail, items, quantity, status, date) VALUES (?, ?, ?, ?, ?, ?)",
    [b.id, b.customerEmail, b.items, b.quantity, b.status, b.date]);
  saveDatabase();
}

/** Get orders for a user (supports both old email-based and new customerId-based orders) */
export function getOrdersByUser(userIdOrEmail: string) {
  if (!db) return [];
  // try to match by customerId first
  let res = db.exec("SELECT * FROM orders WHERE customerId = ? ORDER BY date DESC", [userIdOrEmail]);
  if (res.length === 0) {
    res = db.exec("SELECT * FROM orders WHERE UPPER(customerEmail) = UPPER(?) ORDER BY date DESC", [userIdOrEmail]);
  }
  if (res.length === 0) return [];
  const columns = res[0].columns;
  const orders = res[0].values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => {
      if (col === 'items' || col === 'trackingHistory') obj[col] = JSON.parse(row[i] || '[]');
      else obj[col] = row[i];
    });
    return obj as Order;
  });
  return orders;
}

/** Remove a user (and associated session) */
export function deleteUser(id: string) {
  db.run("DELETE FROM users WHERE id = ?", [id]);
  // optionally remove addresses, saved_cards, saved_carts, favorites
  db.run("DELETE FROM addresses WHERE userId = ?", [id]);
  db.run("DELETE FROM saved_cards WHERE userId = ?", [id]);
  db.run("DELETE FROM saved_carts WHERE userId = ?", [id]);
  db.run("DELETE FROM favorites WHERE userId = ?", [id]);
  saveDatabase();
}

/** Delete an order by id */
export function deleteOrder(id: string) {
  db.run("DELETE FROM orders WHERE id = ?", [id]);
  saveDatabase();
}
/** =============== AUDIT & ACTIVITY LOGGING =============== */

/** Log every login event with timestamp */
export function logLogin(userId: string, email: string, status: 'success' | 'failed' = 'success', notes: string = '') {
  if (!db) return;
  const id = `login-${Date.now()}`;
  const loginTime = new Date().toISOString();
  db.run(`INSERT INTO login_history (id, userId, email, loginTime, status, device, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, email, loginTime, status, 'web', notes]);
  saveDatabase();
}

/** Get all login history for a user */
export function getLoginHistory(userId?: string) {
  if (!db) return [];
  let sql = "SELECT * FROM login_history";
  let params: any[] = [];
  if (userId) {
    sql += " WHERE userId = ?";
    params = [userId];
  }
  sql += " ORDER BY loginTime DESC LIMIT 1000";
  const res = db.exec(sql, params);
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    return obj;
  });
}

/** Log activity: signup, update profile, add address, etc. */
export function logActivity(userId: string, activityType: string, description: string, details: any = {}) {
  if (!db) return;
  const id = `activity-${Date.now()}`;
  const timestamp = new Date().toISOString();
  db.run(`INSERT INTO activity_log (id, userId, activityType, description, timestamp, details) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, userId, activityType, description, timestamp, JSON.stringify(details)]);
  saveDatabase();
}

/** Get activity log for a user */
export function getActivityLog(userId?: string, limit: number = 500) {
  if (!db) return [];
  let sql = "SELECT * FROM activity_log";
  let params: any[] = [];
  if (userId) {
    sql += " WHERE userId = ?";
    params = [userId];
  }
  sql += ` ORDER BY timestamp DESC LIMIT ${limit}`;
  const res = db.exec(sql, params);
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => {
      obj[col] = col === 'details' ? JSON.parse(row[i] || '{}') : row[i];
    });
    return obj;
  });
}

/** Log transaction: payment, order placed, refund, etc. */
export function logTransaction(orderId: string, userId: string, amount: number, paymentMethod: string, status: 'pending' | 'completed' | 'failed' = 'completed', notes: string = '') {
  if (!db) return;
  const id = `txn-${Date.now()}`;
  const timestamp = new Date().toISOString();
  db.run(`INSERT INTO transaction_log (id, orderId, userId, amount, paymentMethod, status, timestamp, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, orderId, userId, amount, paymentMethod, status, timestamp, notes]);
  saveDatabase();
}

/** Get transaction history */
export function getTransactionLog(userId?: string, limit: number = 500) {
  if (!db) return [];
  let sql = "SELECT * FROM transaction_log";
  let params: any[] = [];
  if (userId) {
    sql += " WHERE userId = ?";
    params = [userId];
  }
  sql += ` ORDER BY timestamp DESC LIMIT ${limit}`;
  const res = db.exec(sql, params);
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    return obj;
  });
}