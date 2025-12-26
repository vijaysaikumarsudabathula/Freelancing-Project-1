
import { Product, Order, User } from '../types';

let db: any = null;

const SQLITE_DATA_KEY = 'leafylife_sqlite_db';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Areca Premium Round Plate (10")',
    price: 349,
    category: 'plates',
    description: 'Our signature product. Hand-pressed from naturally fallen areca leaves. Incredibly durable and 100% compostable.',
    image: 'https://images.unsplash.com/photo-1616612693441-17f160683050?auto=format&fit=crop&q=80&w=800',
    benefits: ['Microwave Safe', 'Heat Resistant', 'Leak Proof']
  },
  {
    id: '2',
    name: 'Areca Square Deep Bowl',
    price: 199,
    category: 'bowls',
    description: 'Perfect for salads, desserts, or gravies. Unique natural grain textures on every single bowl.',
    image: 'https://images.unsplash.com/photo-1591871937573-748af09698d7?auto=format&fit=crop&q=80&w=800',
    benefits: ['Eco Friendly', 'Unique Texture', 'Odorless']
  },
  {
    id: '3',
    name: 'Birchwood Artisanal Cutlery',
    price: 249,
    category: 'cutlery',
    description: 'A set of 12 smooth-finish forks and spoons. A plastic-free alternative that looks stunning on any table.',
    image: 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?auto=format&fit=crop&q=80&w=800',
    benefits: ['BPA Free', 'Smooth Finish', 'Compostable']
  },
  {
    id: '4',
    name: 'The Heritage Gifting Set',
    price: 1499,
    category: 'sets',
    description: 'A curated collection of our finest pieces, perfect for housewarmings or eco-conscious celebrations.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
    benefits: ['Gift Wrapped', 'Premium Assortment', 'Eco-Certified']
  },
  {
    id: '5',
    name: 'Areca Rectangular Party Platter',
    price: 499,
    category: 'plates',
    description: 'Extra large surface area for appetizers and sharing. Robust enough to hold heavy organic meals.',
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=800',
    benefits: ['Extra Large', 'Bending Resistant', 'Natural Finish']
  },
  {
    id: '6',
    name: 'Mini Areca Dessert Bowls (Set of 6)',
    price: 399,
    category: 'bowls',
    description: 'Charming small bowls for sweets, condiments, or tapas. A delightful addition to any high-tea.',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&q=80&w=800',
    benefits: ['Petite Size', 'Stacks Easily', 'Bio-Degradable']
  },
  {
    id: '7',
    name: 'Polished Bamboo Straws',
    price: 159,
    category: 'cutlery',
    description: 'Reusable, naturally anti-bacterial bamboo straws. Comes with a natural fiber cleaning brush.',
    image: 'https://images.unsplash.com/photo-1516211697506-8360bd773497?auto=format&fit=crop&q=80&w=800',
    benefits: ['Reusable', 'Anti-Bacterial', 'Travel Friendly']
  },
  {
    id: '8',
    name: 'Eco-Picnic Picnic Box (Serves 4)',
    price: 899,
    category: 'sets',
    description: 'The ultimate outdoor dining companion. Includes plates, bowls, and cutlery for four people.',
    image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=800',
    benefits: ['All-in-One', 'Compact Packaging', 'Waste-Free']
  },
  {
    id: '9',
    name: 'Areca Deep Rim Pasta Plate',
    price: 279,
    category: 'plates',
    description: 'Designed specifically for liquid-based dishes like pasta or risotto. Elegant raised edges.',
    image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800',
    benefits: ['Spill Proof', 'Sturdy Rim', 'Natural Scent']
  },
  {
    id: '10',
    name: 'Hand-Carved Coconut Bowl',
    price: 549,
    category: 'bowls',
    description: 'Upcycled coconut shells, polished with organic virgin coconut oil. Tropical aesthetics for your home.',
    image: 'https://images.unsplash.com/photo-1516746826332-ddc7d85d462b?auto=format&fit=crop&q=80&w=800',
    benefits: ['Upcycled', 'Oil Polished', 'Long Lasting']
  },
  {
    id: '11',
    name: 'Birchwood Dessert Spoons',
    price: 129,
    category: 'cutlery',
    description: 'Dainty spoons for gelatos and mousses. Perfectly smooth and safe for children.',
    image: 'https://images.unsplash.com/photo-1594913785162-e6785b48dea5?auto=format&fit=crop&q=80&w=800',
    benefits: ['Smooth Edges', 'Kid Safe', 'Lightweight']
  },
  {
    id: '12',
    name: 'The Wedding Banquet Pack',
    price: 4999,
    category: 'sets',
    description: 'Bulk collection for large events. Contains 100 premium plates and cutlery sets.',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800',
    benefits: ['Bulk Savings', 'Uniform Quality', 'Eco-Impact']
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
        price REAL,
        category TEXT,
        description TEXT,
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
        items TEXT
      );
      
      CREATE TABLE IF NOT EXISTS wishlist (
        productId TEXT PRIMARY KEY
      );

      CREATE TABLE IF NOT EXISTS session (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        user_data TEXT
      );
    `);

    INITIAL_PRODUCTS.forEach(p => {
      db.run(`INSERT INTO products (id, name, price, category, description, image, benefits) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [p.id, p.name, p.price, p.category, p.description, p.image, JSON.stringify(p.benefits)]
      );
    });
    
    saveDatabase();
  }

  return db;
}

function saveDatabase() {
  if (!db) return;
  const binaryArray = db.export();
  const array = Array.from(binaryArray);
  localStorage.setItem(SQLITE_DATA_KEY, JSON.stringify(array));
}

export function getProducts(): Product[] {
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
  db.run(`INSERT OR REPLACE INTO products (id, name, price, category, description, image, benefits) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [p.id, p.name, p.price, p.category, p.description, p.image, JSON.stringify(p.benefits)]
  );
  saveDatabase();
}

export function deleteProduct(id: string) {
  db.run("DELETE FROM products WHERE id = ?", [id]);
  saveDatabase();
}

export function getOrders(): Order[] {
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
  db.run(`INSERT INTO orders (id, total, status, date, customerEmail, shippingAddress, items) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [o.id, o.total, o.status, o.date, o.customerEmail, o.shippingAddress, JSON.stringify(o.items)]
  );
  saveDatabase();
}

export function updateOrderStatus(id: string, status: string) {
  db.run("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
  saveDatabase();
}

export function getWishlist(): string[] {
  const res = db.exec("SELECT productId FROM wishlist");
  if (res.length === 0) return [];
  return res[0].values.map((row: any[]) => row[0]);
}

export function toggleWishlistDB(id: string) {
  const res = db.exec("SELECT * FROM wishlist WHERE productId = ?", [id]);
  if (res.length > 0) {
    db.run("DELETE FROM wishlist WHERE productId = ?", [id]);
  } else {
    db.run("INSERT INTO wishlist (productId) VALUES (?)", [id]);
  }
  saveDatabase();
}

export function getActiveUser(): User | null {
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
