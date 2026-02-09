import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, runQuery, getQuery, allQuery } from './db.js';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Email transporter configuration for Titan Email
const transporter = nodemailer.createTransport({
  host: 'mail.titan.email',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'support@deepthienterprise.com',
    pass: process.env.EMAIL_PASS || 'your-email-password-here'
  }
});

// Test email connection
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️  Titan Email not configured properly:', error.message);
    console.log('📧 Emails will be logged to console only.');
    console.log('💡 Set EMAIL_USER and EMAIL_PASS environment variables with your Titan Email credentials.');
  } else {
    console.log('✅ Titan Email service ready to send');
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Initialize database on startup
await initializeDatabase();

// ==================== USERS ====================
app.post('/api/users', async (req, res) => {
  try {
    const { email, name, password, phone, role = 'customer' } = req.body;
    const id = `cust-${uuidv4()}`;
    const now = new Date().toISOString();
    
    await runQuery(
      `INSERT INTO users (id, email, name, password, phone, role, joinedDate, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, email, name, password, phone || null, role, now, now]
    );
    
    res.json({ id, email, name, password, phone, role, joinedDate: now, createdAt: now });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await allQuery(`SELECT * FROM users`);
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await getQuery(`SELECT * FROM users WHERE id = ?`, [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/users/email/:email', async (req, res) => {
  try {
    const user = await getQuery(`SELECT * FROM users WHERE email = ?`, [req.params.email]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, password, phone, role, lastLogin } = req.body;
    const updates = [];
    const values = [];
    
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (password !== undefined) { updates.push('password = ?'); values.push(password); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (role !== undefined) { updates.push('role = ?'); values.push(role); }
    if (lastLogin !== undefined) { updates.push('lastLogin = ?'); values.push(lastLogin); }
    
    if (updates.length === 0) return res.json({ message: 'No updates' });
    
    values.push(req.params.id);
    await runQuery(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    
    const user = await getQuery(`SELECT * FROM users WHERE id = ?`, [req.params.id]);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await runQuery(`DELETE FROM users WHERE id = ?`, [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== PRODUCTS ====================
app.post('/api/products', async (req, res) => {
  try {
    const { id, name, name_te, price, category, description, description_te, image, benefits } = req.body;
    const productId = id || `p-${uuidv4()}`;
    const now = new Date().toISOString();
    
    await runQuery(
      `INSERT INTO products (id, name, name_te, price, category, description, description_te, image, benefits, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [productId, name, name_te || null, price, category, description || null, description_te || null, image || null, JSON.stringify(benefits || []), now]
    );
    
    res.json({ id: productId, name, name_te, price, category, description, description_te, image, benefits });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await allQuery(`SELECT * FROM products`);
    res.json(products.map(p => ({ ...p, benefits: p.benefits ? JSON.parse(p.benefits) : [] })));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await getQuery(`SELECT * FROM products WHERE id = ?`, [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ ...product, benefits: product.benefits ? JSON.parse(product.benefits) : [] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { name, name_te, price, category, description, description_te, image, benefits } = req.body;
    const updates = [];
    const values = [];
    
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (name_te !== undefined) { updates.push('name_te = ?'); values.push(name_te); }
    if (price !== undefined) { updates.push('price = ?'); values.push(price); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (description_te !== undefined) { updates.push('description_te = ?'); values.push(description_te); }
    if (image !== undefined) { updates.push('image = ?'); values.push(image); }
    if (benefits !== undefined) { updates.push('benefits = ?'); values.push(JSON.stringify(benefits)); }
    
    if (updates.length === 0) return res.json({ message: 'No updates' });
    
    values.push(req.params.id);
    await runQuery(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);
    
    const product = await getQuery(`SELECT * FROM products WHERE id = ?`, [req.params.id]);
    res.json({ ...product, benefits: product.benefits ? JSON.parse(product.benefits) : [] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await runQuery(`DELETE FROM products WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== ORDERS ====================
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, customerEmail, items, total, status, shippingAddress, trackingId, trackingHistory } = req.body;
    const orderId = `ord-${uuidv4()}`;
    const now = new Date().toISOString();
    
    await runQuery(
      `INSERT INTO orders (id, userId, customerEmail, items, total, status, date, shippingAddress, trackingHistory, trackingId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, userId, customerEmail, JSON.stringify(items), total, status || 'pending', now, shippingAddress || null, JSON.stringify(trackingHistory || []), trackingId || null, now]
    );
    
    res.json({ id: orderId, userId, customerEmail, items, total, status: status || 'pending', date: now, shippingAddress, trackingId, trackingHistory: trackingHistory || [] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await allQuery(`SELECT * FROM orders`);
    res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items), trackingHistory: o.trackingHistory ? JSON.parse(o.trackingHistory) : [] })));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await getQuery(`SELECT * FROM orders WHERE id = ?`, [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ ...order, items: JSON.parse(order.items), trackingHistory: order.trackingHistory ? JSON.parse(order.trackingHistory) : [] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const orders = await allQuery(`SELECT * FROM orders WHERE userId = ?`, [req.params.userId]);
    res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { status, trackingId, shippingAddress } = req.body;
    const updates = [];
    const values = [];
    
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (trackingId !== undefined) { updates.push('trackingId = ?'); values.push(trackingId); }
    if (shippingAddress !== undefined) { updates.push('shippingAddress = ?'); values.push(shippingAddress); }
    
    if (updates.length === 0) return res.json({ message: 'No updates' });
    
    values.push(req.params.id);
    await runQuery(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, values);
    
    const order = await getQuery(`SELECT * FROM orders WHERE id = ?`, [req.params.id]);
    res.json({ ...order, items: JSON.parse(order.items) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== ADDRESSES ====================
app.post('/api/addresses', async (req, res) => {
  try {
    const { userId, name, phone, address, city, state, pincode, isDefault } = req.body;
    const addressId = `addr-${uuidv4()}`;
    const now = new Date().toISOString();
    
    await runQuery(
      `INSERT INTO addresses (id, userId, name, phone, address, city, state, pincode, isDefault, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [addressId, userId, name, phone, address, city, state, pincode, isDefault ? 1 : 0, now]
    );
    
    res.json({ id: addressId, userId, name, phone, address, city, state, pincode, isDefault });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/addresses/user/:userId', async (req, res) => {
  try {
    const addresses = await allQuery(`SELECT * FROM addresses WHERE userId = ?`, [req.params.userId]);
    res.json(addresses.map(a => ({ ...a, isDefault: a.isDefault === 1 })));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/addresses/:id', async (req, res) => {
  try {
    await runQuery(`DELETE FROM addresses WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== AUDIT LOGS ====================
app.post('/api/audit/login', async (req, res) => {
  try {
    const { userId, email, status, notes } = req.body;
    const logId = `log-${uuidv4()}`;
    const now = new Date().toISOString();
    
    await runQuery(
      `INSERT INTO login_history (id, userId, email, status, notes, timestamp, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [logId, userId || null, email || null, status, notes || null, now, now]
    );
    
    res.json({ id: logId, userId, email, status, notes, timestamp: now });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/audit/login', async (req, res) => {
  try {
    const logs = await allQuery(`SELECT * FROM login_history ORDER BY timestamp DESC LIMIT 100`);
    res.json(logs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/audit/activity', async (req, res) => {
  try {
    const { userId, activityType, description, metadata } = req.body;
    const logId = `act-${uuidv4()}`;
    const now = new Date().toISOString();
    
    await runQuery(
      `INSERT INTO activity_log (id, userId, activityType, description, metadata, timestamp, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [logId, userId, activityType, description || null, JSON.stringify(metadata || {}), now, now]
    );
    
    res.json({ id: logId, userId, activityType, description, metadata, timestamp: now });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/audit/activity', async (req, res) => {
  try {
    const logs = await allQuery(`SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 100`);
    res.json(logs.map(l => ({ ...l, metadata: l.metadata ? JSON.parse(l.metadata) : {} })));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/audit/transaction', async (req, res) => {
  try {
    const { userId, orderId, amount, paymentMethod, status, description } = req.body;
    const logId = `txn-${uuidv4()}`;
    const now = new Date().toISOString();
    
    await runQuery(
      `INSERT INTO transaction_log (id, userId, orderId, amount, paymentMethod, status, description, timestamp, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [logId, userId, orderId || null, amount, paymentMethod || null, status, description || null, now, now]
    );
    
    res.json({ id: logId, userId, orderId, amount, paymentMethod, status, description, timestamp: now });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/audit/transaction', async (req, res) => {
  try {
    const logs = await allQuery(`SELECT * FROM transaction_log ORDER BY timestamp DESC LIMIT 100`);
    res.json(logs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== ENHANCED PAYMENT & TRANSACTION APIS ====================
// Get detailed transaction logs with user and order information
app.get('/api/transactions/detailed', async (req, res) => {
  try {
    const transactions = await allQuery(`
      SELECT 
        t.id, 
        t.userId, 
        t.orderId, 
        t.amount, 
        t.paymentMethod, 
        t.status,
        t.description,
        t.timestamp,
        u.email as customerEmail,
        u.name as customerName,
        u.phone as customerPhone,
        o.customerEmail as orderEmail
      FROM transaction_log t
      LEFT JOIN users u ON t.userId = u.id
      LEFT JOIN orders o ON t.orderId = o.id
      ORDER BY t.timestamp DESC
      LIMIT 200
    `);
    res.json(transactions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update transaction status
app.put('/api/transactions/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    
    await runQuery(
      `UPDATE transaction_log SET status = ? WHERE id = ?`,
      [status, req.params.id]
    );
    
    const transaction = await getQuery(
      `SELECT * FROM transaction_log WHERE id = ?`,
      [req.params.id]
    );
    res.json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get transaction statistics
app.get('/api/transactions/stats', async (req, res) => {
  try {
    const stats = await getQuery(`
      SELECT 
        COUNT(*) as totalTransactions,
        SUM(amount) as totalAmount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedCount,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingCount,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failedCount
      FROM transaction_log
    `);
    res.json(stats);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get login history for a user
app.get('/api/audit/logins', async (req, res) => {
  try {
    const logins = await allQuery(`
      SELECT 
        l.*,
        u.name as userName,
        u.email as userEmail
      FROM login_history l
      LEFT JOIN users u ON l.userId = u.id
      ORDER BY l.timestamp DESC
      LIMIT 500
    `);
    res.json(logins);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get user activity summary
app.get('/api/users/:id/activity', async (req, res) => {
  try {
    const userId = req.params.id;
    const logins = await allQuery(`
      SELECT 
        'login' as type,
        timestamp as eventDate,
        status as details
      FROM login_history
      WHERE userId = ?
      ORDER BY timestamp DESC
      LIMIT 100
    `, [userId]);
    
    const orders = await allQuery(`
      SELECT 
        'order' as type,
        date as eventDate,
        status as details
      FROM orders
      WHERE userId = ?
      ORDER BY date DESC
      LIMIT 100
    `, [userId]);
    
    const activity = [...logins, ...orders].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()).slice(0, 100);
    res.json(activity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== BULK ENQUIRY ====================
app.post('/api/send-bulk-enquiry', async (req, res) => {
  try {
    const { name, company, email, phone, quantity, eventType, message } = req.body;
    
    // Validate form data
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Log to database
    const enquiryId = `enq-${uuidv4()}`;
    const now = new Date().toISOString();
    
    await runQuery(
      `INSERT INTO bulk_requests (id, userId, productName, quantity, requirements, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [enquiryId, phone, eventType, quantity || '', `Name: ${name}, Email: ${email}, Company: ${company || ''}, Phone: ${phone}, Message: ${message || ''}`, 'pending', now]
    );

    // Send Email
    sendEmailNotification({
      name,
      company,
      email,
      phone,
      quantity,
      eventType,
      message,
      enquiryId
    });

    // Send SMS
    sendSMSNotification({
      phone,
      name,
      enquiryId
    });

    res.json({ success: true, message: 'Bulk enquiry received. We will contact you soon!', enquiryId });
  } catch (err) {
    console.error('Error in bulk enquiry:', err);
    res.status(500).json({ error: 'Failed to process bulk enquiry' });
  }
});

// Get all bulk requests for admin
app.get('/api/bulk-requests', async (req, res) => {
  try {
    const requests = await allQuery(`SELECT * FROM bulk_requests ORDER BY createdAt DESC`);
    res.json(requests.map(r => ({
      id: r.id,
      customerPhone: r.userId,
      eventType: r.productName,
      quantity: r.quantity,
      details: r.requirements,
      status: r.status,
      createdAt: r.createdAt
    })));
  } catch (err) {
    console.error('Error fetching bulk requests:', err);
    res.status(500).json({ error: 'Failed to fetch bulk requests' });
  }
});

// Update bulk request status for admin
app.put('/api/bulk-requests/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await runQuery(`UPDATE bulk_requests SET status = ? WHERE id = ?`, [status, id]);
    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    console.error('Error updating bulk request:', err);
    res.status(500).json({ error: 'Failed to update bulk request' });
  }
});

// Email notification function
function sendEmailNotification({ name, company, email, phone, quantity, eventType, message, enquiryId }) {
  try {
    const emailBody = `
BULK ENQUIRY RECEIVED
=====================
Enquiry ID: ${enquiryId}
Timestamp: ${new Date().toISOString()}

CUSTOMER DETAILS:
Name: ${name}
Company: ${company || 'N/A'}
Email: ${email}
Phone: ${phone}

ENQUIRY DETAILS:
Event Type: ${eventType}
Quantity: ${quantity || 'Not specified'}
Message: ${message || 'N/A'}

ACTION REQUIRED:
Please contact the customer at ${phone} or ${email} to process this bulk order.
Assign the enquiry to a sales representative and follow up within 24 hours.
    `;

    // Send email to support team
    const mailOptions = {
      from: process.env.EMAIL_USER || 'support@deepthienterprise.com',
      to: 'support@deepthienterprise.com',
      subject: `🎉 New Bulk Enquiry - ${name} - ${enquiryId}`,
      text: emailBody,
      html: `
        <h2 style="color: #2D5A27;">BULK ENQUIRY RECEIVED</h2>
        <p><strong>Enquiry ID:</strong> ${enquiryId}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        
        <h3 style="color: #4A3728;">CUSTOMER DETAILS:</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Company:</strong> ${company || 'N/A'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        
        <h3 style="color: #4A3728;">ENQUIRY DETAILS:</h3>
        <p><strong>Event Type:</strong> ${eventType}</p>
        <p><strong>Quantity:</strong> ${quantity || 'Not specified'}</p>
        <p><strong>Message:</strong> ${message || 'N/A'}</p>
        
        <h3 style="color: #2D5A27;">ACTION REQUIRED:</h3>
        <p>Please contact the customer at <strong>${phone}</strong> or <strong>${email}</strong> to process this bulk order.</p>
        <p>Assign the enquiry to a sales representative and follow up within 24 hours.</p>
        
        <hr style="border: none; border-top: 1px solid #A4C639; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated message from Deepthi Enterprises Bulk Order System</p>
      `
    };

    // Send email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.warn('⚠️  Email sending failed:', err.message);
        console.log('📧 EMAIL NOTIFICATION TO: support@deepthienterprise.com');
        console.log(emailBody);
      } else {
        console.log('✅ Email sent successfully to support@deepthienterprise.com');
        console.log('📧 Message ID:', info.messageId);
      }
    });

    // Also send confirmation email to customer
    const customerMailOptions = {
      from: process.env.EMAIL_USER || 'support@deepthienterprise.com',
      to: email,
      subject: `✅ Bulk Enquiry Received - Enquiry ID: ${enquiryId}`,
      text: `Dear ${name},\n\nThank you for submitting your bulk enquiry with Deepthi Enterprises.\n\nYour Enquiry ID: ${enquiryId}\n\nOur team will review your request and contact you within 24 hours.\n\nBest regards,\nDeepthi Enterprises Team`,
      html: `
        <h2 style="color: #2D5A27;">Thank You for Your Enquiry!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for submitting your bulk enquiry with Deepthi Enterprises.</p>
        <p><strong>Your Enquiry ID:</strong> <span style="background: #A4C639; padding: 5px 10px; border-radius: 5px;">${enquiryId}</span></p>
        <p>Our team will review your request and contact you within 24 hours at <strong>${phone}</strong>.</p>
        <p style="margin-top: 20px; color: #999;">
          If you have any questions, please feel free to contact us:
          <br>📞 Call: 8367382095 or 9010613584
          <br>📧 Email: support@deepthienterprise.com
        </p>
        <p>Best regards,<br><strong>Deepthi Enterprises Team</strong></p>
      `
    };

    transporter.sendMail(customerMailOptions, (err, info) => {
      if (err) {
        console.warn('⚠️  Customer confirmation email failed:', err.message);
      } else {
        console.log('✅ Customer confirmation email sent to:', email);
      }
    });

  } catch (err) {
    console.error('Error in sendEmailNotification:', err);
  }
}

// SMS notification function
function sendSMSNotification({ phone, name, enquiryId }) {
  try {
    const smsBody = `Hi ${name}, Thanks for your bulk enquiry! Our team will contact you soon on this number. Enquiry ID: ${enquiryId}. Contact: 8367382095 or 9010613584. - Deepthi Enterprises`;
    
    console.log(`📱 SMS NOTIFICATION TO: ${phone}`);
    console.log(`Message: ${smsBody}`);
    
    // Send to internal team phones
    const teamPhones = ['8367382095', '9010613584'];
    teamPhones.forEach(teamPhone => {
      const teamNotification = `New bulk enquiry from ${name} (${phone}). Enquiry ID: ${enquiryId}. Please follow up.`;
      console.log(`📱 TEAM SMS TO: ${teamPhone}`);
      console.log(`Message: ${teamNotification}`);
    });
    
    // TODO: Integrate with Twilio or other SMS service
    console.log('✅ SMS notifications ready to send to customer and team');
  } catch (err) {
    console.error('Error sending SMS:', err);
  }
}

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// ==================== SERVE STATIC FRONTEND FILES ====================
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// SPA fallback: Serve index.html for any route not matched by API endpoints
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// ==================== SERVER STARTUP WITH ERROR HANDLING ====================
const server = app.listen(PORT, () => {
  console.log(`🚀 Deepthi Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: server/deepthi.db`);
});

// Handle port already in use errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.log(`Attempting to use alternative port ${PORT + 1}...`);
    
    // Try next port
    const alternativePort = PORT + 1;
    const alternativeServer = app.listen(alternativePort, () => {
      console.log(`🚀 Deepthi Server running on http://localhost:${alternativePort}`);
      console.log(`📊 Database: server/deepthi.db`);
      console.log(`⚠️  Note: Using port ${alternativePort} instead of ${PORT}`);
    });
    
    alternativeServer.on('error', (err) => {
      console.error('❌ Could not start server on any port:', err);
      process.exit(1);
    });
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
