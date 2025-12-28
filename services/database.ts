
import { Product, Order, User } from '../types';

let db: any = null;
const SQLITE_DATA_KEY = 'deepthi_harvest_db_v6'; // Version bump for schema changes

const INITIAL_PRODUCTS: Product[] = [
  // Leaf Plates
  {
    id: 'plate-12',
    name: 'Buffet Leaf Plate (12")',
    name_te: 'బఫే ఆకు ప్లేట్ (12 అంగుళాలు)',
    price: 450,
    category: 'plates',
    description: 'Standard size buffet plates. 100% natural and sturdy for heavy meals.',
    description_te: 'ప్రామాణిక పరిమాణం బఫే ప్లేట్లు. 100% సహజమైనవి మరియు భోజనానికి బలమైనవి.',
    image: 'https://images.unsplash.com/photo-1616612693441-17f160683050?auto=format&fit=crop&q=80&w=800',
    benefits: ['Chemical-free', 'Sturdy', 'Compostable']
  },
  {
    id: 'plate-14',
    name: 'Large Buffet Plate (14")',
    name_te: 'పెద్ద బఫే ప్లేట్ (14 అంగుళాలు)',
    price: 550,
    category: 'plates',
    description: 'Extra large plates for grand weddings and full meals.',
    description_te: 'పెద్ద వివాహాలు మరియు పూర్తి భోజనం కోసం అదనపు పెద్ద ప్లేట్లు.',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    benefits: ['Grand size', 'Heavy duty', 'Eco-safe']
  },
  {
    id: 'plate-10',
    name: 'Medium Snack Plate (10")',
    name_te: 'మధ్యస్థ స్నాక్ ప్లేట్ (10 అంగుళాలు)',
    price: 350,
    category: 'plates',
    description: 'Perfect for breakfast, snacks, and small gatherings.',
    description_te: 'అల్పాహారం, స్నాక్స్ మరియు చిన్న వేడుకల కోసం పరిపూర్ణమైనది.',
    image: 'https://images.unsplash.com/photo-1591871937573-748af09698d7?auto=format&fit=crop&q=80&w=800',
    benefits: ['Lightweight', 'Bio-degradable', 'Natural texture']
  },
  {
    id: 'vistarakulu',
    name: 'Classic Vistarakulu',
    name_te: 'క్లాసిక్ విస్తరాకులు',
    price: 300,
    category: 'plates',
    description: 'Traditional hand-stitched leaf plates for authentic table meals.',
    description_te: 'ప్రామాణిక భోజనం కోసం సాంప్రదాయకంగా కుట్టిన విస్తరాకులు.',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800',
    benefits: ['Traditional', 'Organic', 'Plastic-free']
  },
  // Doppalu (Bowls)
  {
    id: 'doppa-big',
    name: 'Prasadam Round Doppa (Big)',
    name_te: 'ప్రసాదం రౌండ్ డొప్ప (పెద్దది)',
    price: 250,
    category: 'bowls',
    description: 'Large round doppalu for serving rice or large portions of sweets.',
    description_te: 'అన్నం లేదా పెద్ద మొత్తంలో స్వీట్లు వడ్డించడానికి పెద్ద రౌండ్ డొప్పలు.',
    image: 'https://images.unsplash.com/photo-1621275012574-d42f5f3e0d86?auto=format&fit=crop&q=80&w=800',
    benefits: ['Leak-proof', 'Heat resistant', 'Natural']
  },
  {
    id: 'doppa-medium',
    name: 'Prasadam Doppa (Medium)',
    name_te: 'ప్రసాదం డొప్ప (మధ్యస్థం)',
    price: 180,
    category: 'bowls',
    description: 'Ideal for curries, dal, and evening snacks.',
    description_te: 'కూరలు, పప్పు మరియు సాయంత్రం స్నాక్స్ కోసం అనువైనది.',
    image: 'https://images.unsplash.com/photo-1591871937573-748af09698d7?auto=format&fit=crop&q=80&w=800',
    benefits: ['Standard size', 'Toxin-free', 'Eco-friendly']
  },
  {
    id: 'doppa-small',
    name: 'Prasadam Doppa (Small)',
    name_te: 'ప్రసాదం డొప్ప (చిన్నది)',
    price: 120,
    category: 'bowls',
    description: 'Small cups for liquid prasadam, curd, or pickles.',
    description_te: 'లిక్విడ్ ప్రసాదం, పెరుగు లేదా పచ్చళ్ల కోసం చిన్న కప్పులు.',
    image: 'https://images.unsplash.com/photo-1566453916943-41c0993952d9?auto=format&fit=crop&q=80&w=800',
    benefits: ['Compact', 'Zero waste', 'Safe for kids']
  },
  // Organic Food
  {
    id: 'forest-honey',
    name: 'Raw Forest Honey',
    name_te: 'అడవి తేనె (పచ్చిది)',
    price: 850,
    category: 'organic',
    description: 'Pure, unprocessed honey collected directly from dense forests.',
    description_te: 'దట్టమైన అడవుల నుండి నేరుగా సేకరించిన స్వచ్ఛమైన, ప్రాసెస్ చేయని తేనె.',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800',
    benefits: ['Medicinal', 'Antioxidant rich', 'Forest source']
  },
  {
    id: 'pulses-millets',
    name: 'Organic Pulses & Millets',
    name_te: 'సేంద్రీయ పప్పులు & చిరుధాన్యాలు',
    price: 280,
    category: 'organic',
    description: 'High-fiber ancient grains and pulses grown without pesticides.',
    description_te: 'క్రిమిసంహారకాలు లేకుండా పండించిన పీచు అధికంగా ఉండే పురాతన ధాన్యాలు మరియు పప్పులు.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    benefits: ['High Fiber', 'Non-GMO', 'Nutrient dense']
  },
  {
    id: 'pressed-oils',
    name: 'Cold Pressed Oils',
    name_te: 'కోల్డ్ ప్రెస్డ్ నూనెలు',
    price: 420,
    category: 'organic',
    description: 'Naturally extracted oils that retain all vital nutrients and aroma.',
    description_te: 'అన్ని ముఖ్యమైన పోషకాలు మరియు సువాసనను కలిగి ఉండే సహజంగా సేకరించిన నూనెలు.',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800',
    benefits: ['Zero heat', 'Heart healthy', 'Pure extraction']
  },
  // Earthenware
  {
    id: 'clay-tea-glass',
    name: 'Clay Tea Glass (Set of 6)',
    name_te: 'మట్టి టీ గ్లాసులు (6 సెట్)',
    price: 220,
    category: 'earthenware',
    description: 'Earthy aroma tea glasses for an authentic experience.',
    description_te: 'ప్రామాణిక అనుభవం కోసం మట్టి సువాసన గల టీ గ్లాసులు.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800',
    benefits: ['Alkaline pH', 'Natural cooling', 'Eco-chic']
  },
  {
    id: 'clay-water-glass',
    name: 'Clay Water Glass',
    name_te: 'మట్టి వాటర్ గ్లాస్',
    price: 80,
    category: 'earthenware',
    description: 'Naturally cool water in every sip with our clay glasses.',
    description_te: 'మా మట్టి గ్లాసులతో ప్రతి సిప్‌లో సహజంగా చల్లని నీరు.',
    image: 'https://images.unsplash.com/photo-1581572881241-30379d3be7c4?auto=format&fit=crop&q=80&w=800',
    benefits: ['Mineral rich', 'Cooling', 'Artisan made']
  },
  {
    id: 'clay-bottle',
    name: 'Earthen Water Bottle',
    name_te: 'మట్టి వాటర్ బాటిల్',
    price: 350,
    category: 'earthenware',
    description: 'Self-cooling water bottle. The healthiest way to store water.',
    description_te: 'సెల్ఫ్ కూలింగ్ వాటర్ బాటిల్. నీటిని నిల్వ చేయడానికి అత్యంత ఆరోగ్యకరమైన మార్గం.',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=800',
    benefits: ['Chemical-free storage', 'Self-cooling', 'Handcrafted']
  }
];

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
        paymentId TEXT
      );
      
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        password TEXT,
        role TEXT,
        joinedDate TEXT
      );

      CREATE TABLE IF NOT EXISTS session (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        user_data TEXT
      );
    `);

    seedProducts();
    // Default Admins
    db.run("INSERT OR REPLACE INTO users (id, name, email, password, role, joinedDate) VALUES (?, ?, ?, ?, ?, ?)", 
      ['u-admin-1', 'K. Latha', 'latha@gmail.com', 'deepthi@1234', 'admin', new Date().toISOString()]);
    db.run("INSERT OR REPLACE INTO users (id, name, email, password, role, joinedDate) VALUES (?, ?, ?, ?, ?, ?)", 
      ['u-admin-2', 'Vijay', 'vijay@gmail.com', 'vijay@567', 'admin', new Date().toISOString()]);
    
    saveDatabase();
  }
  return db;
}

function seedProducts() {
  INITIAL_PRODUCTS.forEach(p => {
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
      if (col === 'items') obj[col] = JSON.parse(row[i]);
      else obj[col] = row[i];
    });
    return obj as Order;
  });
}

export function addOrder(o: Order) {
  db.run(`INSERT INTO orders (id, total, status, date, customerEmail, shippingAddress, items, paymentMethod, paymentId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [o.id, o.total, o.status, o.date, o.customerEmail, o.shippingAddress, JSON.stringify(o.items), o.paymentMethod, o.paymentId]
  );
  saveDatabase();
}

export function updateOrderStatus(id: string, status: string) {
  db.run("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
  saveDatabase();
}

export function getUsers(): User[] {
  if (!db) return [];
  const res = db.exec("SELECT * FROM users");
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => {
      obj[col] = row[i];
    });
    return obj as User;
  });
}

export function findUserByEmail(email: string): User | null {
  if (!db) return null;
  const res = db.exec("SELECT * FROM users WHERE UPPER(email) = UPPER(?)", [email]);
  if (res.length === 0) return null;
  const columns = res[0].columns;
  const values = res[0].values[0];
  const obj: any = {};
  columns.forEach((col: string, i: number) => {
    obj[col] = values[i];
  });
  return obj as User;
}

export function addUser(u: User) {
  db.run("INSERT OR REPLACE INTO users (id, name, email, password, role, joinedDate) VALUES (?, ?, ?, ?, ?, ?)",
    [u.id, u.name, u.email, u.password || '', u.role, u.joinedDate]);
  saveDatabase();
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
