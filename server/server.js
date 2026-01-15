import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, runQuery, getQuery, allQuery } from './db.js';

const app = express();
const PORT = process.env.PORT || 5001;

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

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Deepthi Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: server/deepthi.db`);
});
