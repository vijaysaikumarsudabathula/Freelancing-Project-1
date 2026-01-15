import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'deepthi.db');

export function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }

      db.serialize(() => {
        // Users table
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            phone TEXT,
            role TEXT DEFAULT 'customer',
            joinedDate TEXT NOT NULL,
            lastLogin TEXT,
            createdAt TEXT NOT NULL
          )
        `);

        // Products table
        db.run(`
          CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            name_te TEXT,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            description_te TEXT,
            image TEXT,
            benefits TEXT,
            createdAt TEXT NOT NULL
          )
        `);

        // Orders table
        db.run(`
          CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            userId TEXT,
            customerEmail TEXT NOT NULL,
            items TEXT NOT NULL,
            total REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            date TEXT NOT NULL,
            shippingAddress TEXT,
            trackingHistory TEXT,
            trackingId TEXT,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
          )
        `);

        // Addresses table
        db.run(`
          CREATE TABLE IF NOT EXISTS addresses (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            pincode TEXT NOT NULL,
            isDefault INTEGER DEFAULT 0,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
          )
        `);

        // Saved cards table
        db.run(`
          CREATE TABLE IF NOT EXISTS saved_cards (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            cardNumber TEXT NOT NULL,
            cardholderName TEXT NOT NULL,
            expiryDate TEXT NOT NULL,
            cvv TEXT NOT NULL,
            isDefault INTEGER DEFAULT 0,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
          )
        `);

        // Favorites table
        db.run(`
          CREATE TABLE IF NOT EXISTS favorites (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            productId TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id),
            FOREIGN KEY (productId) REFERENCES products(id)
          )
        `);

        // Saved carts table
        db.run(`
          CREATE TABLE IF NOT EXISTS saved_carts (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            items TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
          )
        `);

        // Bulk requests table
        db.run(`
          CREATE TABLE IF NOT EXISTS bulk_requests (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            productName TEXT NOT NULL,
            quantity TEXT NOT NULL,
            requirements TEXT,
            status TEXT DEFAULT 'pending',
            createdAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
          )
        `);

        // Login history table (audit)
        db.run(`
          CREATE TABLE IF NOT EXISTS login_history (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            email TEXT,
            status TEXT NOT NULL,
            notes TEXT,
            timestamp TEXT NOT NULL,
            createdAt TEXT NOT NULL
          )
        `);

        // Activity log table (audit)
        db.run(`
          CREATE TABLE IF NOT EXISTS activity_log (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            activityType TEXT NOT NULL,
            description TEXT,
            metadata TEXT,
            timestamp TEXT NOT NULL,
            createdAt TEXT NOT NULL
          )
        `);

        // Transaction log table (audit)
        db.run(`
          CREATE TABLE IF NOT EXISTS transaction_log (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            orderId TEXT,
            amount REAL NOT NULL,
            paymentMethod TEXT,
            status TEXT NOT NULL,
            description TEXT,
            timestamp TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id),
            FOREIGN KEY (orderId) REFERENCES orders(id)
          )
        `);

        // Seed admin user
        const adminId = 'admin-001';
        db.run(
          `INSERT OR IGNORE INTO users (id, email, name, password, role, joinedDate, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [adminId, 'vijay@gmail.com', 'Vijay', 'vijay@567', 'admin', new Date().toISOString(), new Date().toISOString()],
          (err) => {
            if (err) console.error('Error seeding admin:', err);
          }
        );

        // Seed sample products
        const products = [
          {
            id: 'prod-1',
            name: 'Eco Plates',
            name_te: 'ఈకో ప్లేట్లు',
            price: 250,
            category: 'plates',
            description: '100% biodegradable areca plates',
            image: '/images/deepthi-logo.png'
          },
          {
            id: 'prod-2',
            name: 'Organic Bowls',
            name_te: 'ఆర్గానిక్ బౌల్‌లు',
            price: 180,
            category: 'bowls',
            description: 'Handcrafted organic bowls',
            image: '/images/deepthi-logo.png'
          },
          {
            id: 'prod-3',
            name: 'Earthenware Set',
            name_te: 'మట్టి సెట్',
            price: 450,
            category: 'earthenware',
            description: 'Traditional earthenware collection',
            image: '/images/deepthi-logo.png'
          },
          {
            id: 'prod-4',
            name: 'Organic Harvest',
            name_te: 'ఆర్గానిక్ లంచ్',
            price: 320,
            category: 'organic',
            description: 'Fresh organic harvest items',
            image: '/images/deepthi-logo.png'
          }
        ];

        products.forEach(product => {
          db.run(
            `INSERT OR IGNORE INTO products (id, name, name_te, price, category, description, image, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [product.id, product.name, product.name_te, product.price, product.category, product.description, product.image, new Date().toISOString()],
            (err) => {
              if (err) console.error('Error seeding product:', err);
            }
          );
        });

        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
            reject(err);
          } else {
            console.log('Database initialized successfully at:', DB_PATH);
            resolve();
          }
        });
      });
    });
  });
}

export function getDatabase() {
  return new sqlite3.Database(DB_PATH);
}

export function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.run(query, params, function(err) {
      db.close();
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.get(query, params, (err, row) => {
      db.close();
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.all(query, params, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}
