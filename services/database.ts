
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
      {
        id: 'p1',
        name: 'Buffet Leaf Plate 12"',
        name_te: 'బఫే లీఫ్ ప్లేట్ 12"',
        price: 15,
        category: 'plates',
        description: 'Sustainable 12-inch buffet plate made from premium leaf. Perfect for lunch and dinner.',
        description_te: '12 అంగుళాల బఫే లీఫ్ ప్లేట్. భోజనానికి మరియు విందులకు అనుకూలం.',
        // Changed to local folder path
        image: './product-images/p1.jpg',
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
        image: './product-images/p2.jpg',
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
        image: './product-images/p4.jpg',
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
        image: './product-images/p8.jpg',
        benefits: ['Unprocessed', 'Medicinal', 'Wild Sourced']
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
  // Ensure image path is correctly formatted if it's just a filename
  const finalImagePath = (p.image.startsWith('http') || p.image.startsWith('./') || p.image.startsWith('data:')) 
    ? p.image 
    : `./product-images/${p.image}`;

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
