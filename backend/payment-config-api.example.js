/**
 * Backend API Routes for Payment Configuration
 * 
 * File: backend/server.js or routes/payment.js
 * 
 * This file shows example endpoints for storing and retrieving payment configuration
 * Add these routes to your Express server
 */

// Example using Express and SQLite

/*
// In your backend/server.js:

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' })); // Increased limit for QR code images

const dbPath = path.join(__dirname, 'db', 'deepthi.db');
const db = new sqlite3.Database(dbPath);

// Initialize payment config table
const initPaymentConfigTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS payment_config (
      id INTEGER PRIMARY KEY,
      upiId TEXT,
      upiQrCode LONGTEXT,
      bankAccountName TEXT,
      bankAccountNumber TEXT,
      bankIFSC TEXT,
      bankName TEXT,
      bankBranch TEXT,
      cardPaymentEnabled BOOLEAN DEFAULT 1,
      upiPaymentEnabled BOOLEAN DEFAULT 1,
      bankTransferEnabled BOOLEAN DEFAULT 0,
      minOrderAmount INTEGER DEFAULT 100,
      maxOrderAmount INTEGER DEFAULT 100000,
      paymentDescription TEXT,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating payment_config table:', err);
    } else {
      console.log('Payment config table ready');
    }
  });
};

// GET /api/payment-config - Retrieve current payment configuration
app.get('/api/payment-config', (req, res) => {
  // Only admin can access
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  db.get('SELECT * FROM payment_config ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) {
      console.error('Error fetching payment config:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.json(null);
    }

    // Convert boolean strings from SQLite to actual booleans
    res.json({
      upiId: row.upiId || '',
      upiQrCode: row.upiQrCode || '',
      bankAccountName: row.bankAccountName || '',
      bankAccountNumber: row.bankAccountNumber || '',
      bankIFSC: row.bankIFSC || '',
      bankName: row.bankName || '',
      bankBranch: row.bankBranch || '',
      cardPaymentEnabled: Boolean(row.cardPaymentEnabled),
      upiPaymentEnabled: Boolean(row.upiPaymentEnabled),
      bankTransferEnabled: Boolean(row.bankTransferEnabled),
      minOrderAmount: row.minOrderAmount || 100,
      maxOrderAmount: row.maxOrderAmount || 100000,
      paymentDescription: row.paymentDescription || ''
    });
  });
});

// POST /api/payment-config - Save payment configuration
app.post('/api/payment-config', (req, res) => {
  // Only admin can update
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const {
    upiId,
    upiQrCode,
    bankAccountName,
    bankAccountNumber,
    bankIFSC,
    bankName,
    bankBranch,
    cardPaymentEnabled,
    upiPaymentEnabled,
    bankTransferEnabled,
    minOrderAmount,
    maxOrderAmount,
    paymentDescription
  } = req.body;

  // Validation
  if (cardPaymentEnabled || upiPaymentEnabled || bankTransferEnabled) {
    // At least one payment method should be enabled - OK
  } else {
    return res.status(400).json({ error: 'At least one payment method must be enabled' });
  }

  if (upiPaymentEnabled && !upiId) {
    return res.status(400).json({ error: 'UPI ID required when UPI payment is enabled' });
  }

  if (bankTransferEnabled && (!bankAccountName || !bankAccountNumber || !bankIFSC)) {
    return res.status(400).json({ error: 'Bank details required when bank transfer is enabled' });
  }

  if (minOrderAmount >= maxOrderAmount) {
    return res.status(400).json({ error: 'Minimum amount must be less than maximum' });
  }

  // Clear existing config and insert new one
  db.run('DELETE FROM payment_config', (err) => {
    if (err) {
      console.error('Error clearing payment config:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const stmt = db.prepare(`
      INSERT INTO payment_config (
        upiId, upiQrCode, bankAccountName, bankAccountNumber,
        bankIFSC, bankName, bankBranch, cardPaymentEnabled,
        upiPaymentEnabled, bankTransferEnabled, minOrderAmount,
        maxOrderAmount, paymentDescription
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      upiId || null,
      upiQrCode || null,
      bankAccountName || null,
      bankAccountNumber || null,
      bankIFSC || null,
      bankName || null,
      bankBranch || null,
      cardPaymentEnabled ? 1 : 0,
      upiPaymentEnabled ? 1 : 0,
      bankTransferEnabled ? 1 : 0,
      minOrderAmount || 100,
      maxOrderAmount || 100000,
      paymentDescription || null
    ], function(err) {
      if (err) {
        console.error('Error saving payment config:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        success: true,
        message: 'Payment configuration saved successfully',
        id: this.lastID
      });
    });

    stmt.finalize();
  });
});

// GET /api/payment-config/public - Public endpoint for checkout page (no auth required)
app.get('/api/payment-config/public', (req, res) => {
  db.get(`
    SELECT 
      upiId, upiQrCode, bankAccountName, bankAccountNumber,
      bankIFSC, bankName, bankBranch, cardPaymentEnabled,
      upiPaymentEnabled, bankTransferEnabled, minOrderAmount,
      maxOrderAmount, paymentDescription
    FROM payment_config 
    ORDER BY id DESC LIMIT 1
  `, (err, row) => {
    if (err) {
      console.error('Error fetching payment config:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.json({
        cardPaymentEnabled: true,
        upiPaymentEnabled: true,
        bankTransferEnabled: false
      });
    }

    res.json({
      upiId: row.upiId || '',
      upiQrCode: row.upiQrCode || '',
      bankAccountName: row.bankAccountName || '',
      bankAccountNumber: row.bankAccountNumber || '',
      bankIFSC: row.bankIFSC || '',
      bankName: row.bankName || '',
      bankBranch: row.bankBranch || '',
      cardPaymentEnabled: Boolean(row.cardPaymentEnabled),
      upiPaymentEnabled: Boolean(row.upiPaymentEnabled),
      bankTransferEnabled: Boolean(row.bankTransferEnabled),
      minOrderAmount: row.minOrderAmount || 100,
      maxOrderAmount: row.maxOrderAmount || 100000,
      paymentDescription: row.paymentDescription || ''
    });
  });
});

// Initialize on startup
initPaymentConfigTable();

// Export or include in your main server setup
*/

/**
 * Alternative: Using async/await with better error handling
 */

/*
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

class PaymentConfigStore {
  constructor(db) {
    this.db = db;
    this.getAsync = promisify(db.get.bind(db));
    this.runAsync = promisify(db.run.bind(db));
  }

  async getConfig() {
    try {
      const row = await this.getAsync(
        'SELECT * FROM payment_config ORDER BY id DESC LIMIT 1'
      );
      return row || null;
    } catch (error) {
      console.error('Error fetching payment config:', error);
      throw error;
    }
  }

  async saveConfig(config) {
    const required = ['upiId', 'bankAccountName', 'bankAccountNumber'];
    
    try {
      // Delete old config
      await this.runAsync('DELETE FROM payment_config');

      // Insert new config
      const result = await this.runAsync(`
        INSERT INTO payment_config (
          upiId, upiQrCode, bankAccountName, bankAccountNumber,
          bankIFSC, bankName, bankBranch, cardPaymentEnabled,
          upiPaymentEnabled, bankTransferEnabled, minOrderAmount,
          maxOrderAmount, paymentDescription
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        config.upiId,
        config.upiQrCode,
        config.bankAccountName,
        config.bankAccountNumber,
        config.bankIFSC,
        config.bankName,
        config.bankBranch,
        config.cardPaymentEnabled ? 1 : 0,
        config.upiPaymentEnabled ? 1 : 0,
        config.bankTransferEnabled ? 1 : 0,
        config.minOrderAmount,
        config.maxOrderAmount,
        config.paymentDescription
      ]);

      return result;
    } catch (error) {
      console.error('Error saving payment config:', error);
      throw error;
    }
  }
}

module.exports = PaymentConfigStore;
*/

/**
 * Setup Instructions:
 * 
 * 1. Copy one of the above implementations to your backend server file
 * 2. Make sure to import/require your database module
 * 3. Add authentication middleware if not present
 * 4. Test the endpoints using:
 *    - GET http://localhost:3000/api/payment-config (admin only)
 *    - POST http://localhost:3000/api/payment-config (admin only)
 *    - GET http://localhost:3000/api/payment-config/public (public)
 * 5. Update the frontend to use these endpoints
 */
