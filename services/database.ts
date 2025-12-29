
import { Product, Order, User, BulkRequest, SavedCard, OrderStatus, TrackingEvent } from '../types';

let db: any = null;
const SQLITE_DATA_KEY = 'deepthi_harvest_db_v14';

export async function initDatabase() {
  if (db) return db;

  const SQL = await (window as any).initSqlJs({
    locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm`
  });

  const savedData = localStorage.getItem(SQLITE_DATA_KEY);
  
  if (savedData) {
    const u8 = new Uint8Array(JSON.parse(savedData));
    db = new SQL.Database(u8);
  } else {
    db = new SQL.Database();
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
      
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        total REAL,
        status TEXT,
        date TEXT,
        customerEmail TEXT,
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
    `);

    seedInitialData();
    saveDatabase();
  }
  return db;
}

function seedInitialData() {
    // Admin setup
    db.run("INSERT OR REPLACE INTO users (id, name, email, password, role, joinedDate) VALUES (?, ?, ?, ?, ?, ?)", 
      ['u-admin-1', 'K. Latha', 'lathadairy@gmail.com', 'deepthi@1234', 'admin', new Date().toISOString()]);

    const initialProducts: Product[] = [
      // Buffet Leaf Plates
      {
        id: 'p1',
        name: 'Buffet Leaf Plate 12"',
        name_te: 'బఫే లీఫ్ ప్లేట్ 12"',
        price: 15,
        category: 'plates',
        description: 'Sustainable 12-inch buffet plate made from premium leaf. Perfect for lunch and dinner.',
        description_te: '12 అంగుళాల బఫే లీఫ్ ప్లేట్. భోజనానికి మరియు విందులకు అనుకూలం.',
        image: 'https://images.unsplash.com/photo-1616612693441-17f160683050?auto=format&fit=crop&q=80&w=400',
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
        image: 'https://images.unsplash.com/photo-1616612693441-17f160683050?auto=format&fit=crop&q=80&w=400',
        benefits: ['Heavy Duty', 'Heat Resistant', 'Compostable']
      },
      {
        id: 'p3',
        name: 'Buffet Leaf Plate 10"',
        name_te: 'బఫే లీఫ్ ప్లేట్ 10"',
        price: 12,
        category: 'plates',
        description: 'Standard 10-inch plate suitable for breakfast and snacks.',
        description_te: '10 అంగుళాల బఫే లీఫ్ ప్లేట్. అల్పాహారం మరియు స్నాక్స్‌కు అనుకూలం.',
        image: 'https://images.unsplash.com/photo-1616612693441-17f160683050?auto=format&fit=crop&q=80&w=400',
        benefits: ['Elegant Texture', 'Toxin Free', 'Lightweight']
      },
      // Prasadam Doppalu
      {
        id: 'p4',
        name: 'Prasadam Round Doppalu (Big)',
        name_te: 'ప్రసాదం రౌండ్ డొప్పలు (పెద్దవి)',
        price: 10,
        category: 'bowls',
        description: 'Large traditional round leaf bowls for temple offerings and full meals.',
        description_te: 'పెద్ద సైజు ప్రసాదం డొప్పలు. గుడి ప్రసాదం మరియు భోజనానికి అనుకూలం.',
        image: 'https://images.unsplash.com/photo-1591871937573-748af09698d7?auto=format&fit=crop&q=80&w=400',
        benefits: ['Sturdy Design', 'Traditional', 'Zero Leakage']
      },
      {
        id: 'p5',
        name: 'Prasadam Round Doppalu (Medium)',
        name_te: 'ప్రసాదం రౌండ్ డొప్పలు (మధ్యస్థం)',
        price: 8,
        category: 'bowls',
        description: 'Medium traditional leaf bowls for daily rituals and snacks.',
        description_te: 'మధ్యస్థ సైజు ప్రసాదం డొప్పలు. నిత్య పూజలకు అనుకూలం.',
        image: 'https://images.unsplash.com/photo-1591871937573-748af09698d7?auto=format&fit=crop&q=80&w=400',
        benefits: ['Sacred Design', 'Handcrafted', 'Chemical Free']
      },
      {
        id: 'p6',
        name: 'Prasadam Round Doppalu (Small)',
        name_te: 'ప్రసాదం రౌండ్ డొప్పలు (చిన్నవి)',
        price: 6,
        category: 'bowls',
        description: 'Small traditional leaf bowls perfect for sacred offerings and light snacks.',
        description_te: 'చిన్న సైజు ప్రసాదం డొప్పలు. ప్రసాదం పంపిణీకి అనుకూలం.',
        image: 'https://images.unsplash.com/photo-1591871937573-748af09698d7?auto=format&fit=crop&q=80&w=400',
        benefits: ['Pure', 'Eco-safe', 'Compact']
      },
      // Vistarukulu
      {
        id: 'p7',
        name: 'Traditional Vistarukulu',
        name_te: 'సంప్రదాయ విస్తరాకులు',
        price: 35,
        category: 'plates',
        description: 'Traditional hand-stitched leaf plates specifically for table meals and traditional feasts.',
        description_te: 'టేబుల్ భోజనం కోసం సంప్రదాయబద్ధంగా కుట్టిన విస్తరాకులు.',
        image: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80&w=400',
        benefits: ['Authentic', 'Large Surface', 'Heritage Product']
      },
      // Organic Forest Honey
      {
        id: 'p8',
        name: 'Organic Forest Honey',
        name_te: 'అడవి తేనె',
        price: 580,
        category: 'organic',
        description: 'Pure, raw organic honey collected directly from deep forest regions. Rich in enzymes.',
        description_te: 'అడవి నుండి సేకరించిన స్వచ్ఛమైన తేనె. ఎటువంటి కల్తీ లేనిది.',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=400',
        benefits: ['Unprocessed', 'Medicinal', 'Wild Sourced']
      },
      // Earthen Products
      {
        id: 'p9',
        name: 'Earthen Tea Glass Set',
        name_te: 'మట్టి టీ గ్లాసులు',
        price: 85,
        category: 'earthenware',
        description: 'Traditional clay tea glasses that enhance the aroma and flavor of your chai.',
        description_te: 'మట్టితో చేసిన టీ గ్లాసులు. టీ రుచిని పెంచుతాయి.',
        image: 'https://images.unsplash.com/photo-1581572881241-30379d3be7c4?auto=format&fit=crop&q=80&w=400',
        benefits: ['Natural Flavor', 'Earthy Aroma', 'Sustainable']
      },
      {
        id: 'p10',
        name: 'Earthen Water Glass Set',
        name_te: 'మట్టి వాటర్ గ్లాసులు',
        price: 120,
        category: 'earthenware',
        description: 'Clay water glasses that keep water naturally cool and add essential minerals.',
        description_te: 'మట్టి వాటర్ గ్లాసులు. నీటిని సహజంగా చల్లగా ఉంచుతాయి.',
        image: 'https://images.unsplash.com/photo-1581572881241-30379d3be7c4?auto=format&fit=crop&q=80&w=400',
        benefits: ['Natural Cooling', 'Alkaline', 'Eco-friendly']
      },
      {
        id: 'p11',
        name: 'Earthen Water Bottle',
        name_te: 'మట్టి వాటర్ బాటిల్',
        price: 260,
        category: 'earthenware',
        description: 'Terracotta water bottle that naturally filters and cools your drinking water without electricity.',
        description_te: 'మట్టి వాటర్ బాటిల్. సహజ శీతలీకరణను అందిస్తుంది.',
        image: 'https://images.unsplash.com/photo-1581572881241-30379d3be7c4?auto=format&fit=crop&q=80&w=400',
        benefits: ['Zero Plastic', 'Self-Cooling', 'Ergonomic']
      },
      // Organic Pulses & Millets
      {
        id: 'p12',
        name: 'Organic Pulses & Millets',
        name_te: 'ఆర్గానిక్ పప్పులు మరియు చిరుధాన్యాలు',
        price: 195,
        category: 'organic',
        description: 'Chemical-free nutrient-rich organic pulses and millets for a healthy lifestyle.',
        description_te: 'ఆరోగ్యకరమైన ఆహారం కోసం ఆర్గానిక్ పప్పులు మరియు చిరుధాన్యాలు.',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
        benefits: ['High Protein', 'Chemical Free', 'Farmers Sourced']
      },
      // Cold Pressed Oils
      {
        id: 'p13',
        name: 'Cold Pressed Pure Oil',
        name_te: 'గానుగ నూనె',
        price: 340,
        category: 'organic',
        description: 'Pure cold-pressed oil extracted at low temperatures to retain all natural nutrients and antioxidants.',
        description_te: 'స్వచ్ఛమైన గానుగ నూనె. పోషక విలువలు తగ్గకుండా తయారు చేయబడింది.',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400',
        benefits: ['Heart Healthy', 'No Additives', 'Cold Processed']
      }
    ];

    initialProducts.forEach(p => {
      db.run(`INSERT OR REPLACE INTO products (id, name, name_te, price, category, description, description_te, image, benefits) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.name_te, p.price, p.category, p.description, p.description_te, p.image, JSON.stringify(p.benefits)]
      );
    });
}

function saveDatabase() {
  if (!db) return;
  const binaryArray = db.export();
  localStorage.setItem(SQLITE_DATA_KEY, JSON.stringify(Array.from(binaryArray)));
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
    return obj as Product;
  });
}

export function saveProduct(p: Product) {
  db.run(`INSERT OR REPLACE INTO products (id, name, name_te, price, category, description, description_te, image, benefits) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [p.id, p.name, p.name_te, p.price, p.category, p.description, p.description_te, p.image, JSON.stringify(p.benefits)]
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
    return obj as Order;
  });
}

export function addOrder(o: Order) {
  db.run(`INSERT INTO orders (id, total, status, date, customerEmail, shippingAddress, items, paymentMethod, paymentId, trackingId, trackingHistory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      o.id, o.total, o.status, o.date, o.customerEmail, o.shippingAddress, 
      JSON.stringify(o.items), o.paymentMethod, o.paymentId, o.trackingId || '', 
      JSON.stringify(o.trackingHistory || [{ status: 'pending', timestamp: new Date().toISOString() }])
    ]
  );
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
  const res = db.exec("SELECT * FROM users WHERE UPPER(email) = UPPER(?)", [email]);
  if (res.length === 0) return null;
  const columns = res[0].columns;
  const values = res[0].values[0];
  const obj: any = {};
  columns.forEach((col: string, i: number) => { obj[col] = values[i]; });
  return obj as User;
}

export function addUser(u: User) {
  db.run("INSERT OR REPLACE INTO users (id, name, email, password, role, joinedDate, lastLogin) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [u.id, u.name, u.email, u.password || '', u.role, u.joinedDate, u.lastLogin || '']);
  saveDatabase();
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
