import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'deepthi.db');

async function clearDatabase() {
  return new Promise((resolve, reject) => {
    // Delete existing database file
    if (fs.existsSync(DB_PATH)) {
      try {
        fs.unlinkSync(DB_PATH);
        console.log('✓ Deleted existing database file');
      } catch (err) {
        console.error('Error deleting database:', err);
        reject(err);
        return;
      }
    }

    // Create fresh database with tables
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error creating new database:', err);
        reject(err);
        return;
      }

      console.log('✓ Created fresh database');

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
            unit TEXT NOT NULL,
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
            userId TEXT,
            productName TEXT NOT NULL,
            quantity TEXT NOT NULL,
            requirements TEXT,
            status TEXT DEFAULT 'pending',
            createdAt TEXT NOT NULL
          )
        `);

        // Login history table (audit)
        db.run(`
          CREATE TABLE IF NOT EXISTS login_history (
            id TEXT PRIMARY KEY,
            userId TEXT,
            email TEXT,
            status TEXT NOT NULL,
            notes TEXT,
            timestamp TEXT NOT NULL,
            createdAt TEXT NOT NULL
          )
        `, () => {
          console.log('✓ Created all database tables');

          // Add Vijay as admin user
          const vijayId = uuidv4();
          const now = new Date().toISOString();
          
          db.run(
            `INSERT INTO users (id, email, name, password, phone, role, joinedDate, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [vijayId, 'vijay@deepthi.com', 'Vijay Admin', 'admin123', '+91 9876543210', 'admin', now, now],
            (err) => {
              if (err) {
                console.error('Error inserting Vijay user:', err);
                reject(err);
                return;
              }
              console.log('✓ Added Vijay as admin user');
              console.log('\n✅ Database cleared successfully!');
              console.log('\nAdmin Login Credentials:');
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('Email: vijay@deepthi.com');
              console.log('Password: admin123');
              console.log('Role: Admin');
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
              
              db.close(() => {
                resolve();
              });
            }
          );
        });
      });
    });
  });
}

// Run the cleanup
clearDatabase()
  .then(() => {
    console.log('🎉 Database reset complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error resetting database:', err);
    process.exit(1);
  });
