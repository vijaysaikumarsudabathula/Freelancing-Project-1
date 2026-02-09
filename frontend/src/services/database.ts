import { Product, Order, User, BulkRequest, SavedCard, OrderStatus } from '../../../types';
import * as api from './api';

let userDb: any = null;
let UserSQL: any = null;
let userBackupTimer: number | null = null;

// ==================== DATABASE INITIALIZATION ====================
export async function initDatabase() {
  if (userDb) return userDb;
  
  if (!UserSQL) {
    UserSQL = await (window as any).initSqlJs({
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm`
    });
  }

  // Try to restore user DB from IndexedDB
  const saved = await (async function loadSavedUser() {
    try {
      return await loadUserFromIDB('user-db');
    } catch (e) {
      console.warn('Failed to load user DB from IDB:', e);
      return null;
    }
  })();

  if (saved && saved.byteLength) {
    userDb = new UserSQL.Database(new Uint8Array(saved));
  } else {
    userDb = new UserSQL.Database();
  }

  // Ensure schema exists
  userDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      password TEXT,
      phone TEXT,
      role TEXT,
      joinedDate TEXT,
      createdAt TEXT,
      lastLogin TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      name_te TEXT,
      price REAL,
      category TEXT,
      description TEXT,
      description_te TEXT,
      image TEXT,
      benefits TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      userId TEXT,
      customerEmail TEXT,
      items TEXT,
      total REAL,
      status TEXT,
      shippingAddress TEXT,
      trackingId TEXT,
      trackingHistory TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      isDefault INTEGER,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS saved_cards (
      id TEXT PRIMARY KEY,
      userId TEXT,
      cardNumber TEXT,
      cardHolder TEXT,
      expiryDate TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      userId TEXT,
      productId TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS saved_carts (
      id TEXT PRIMARY KEY,
      userId TEXT,
      items TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS bulk_requests (
      id TEXT PRIMARY KEY,
      userId TEXT,
      productName TEXT,
      quantity TEXT,
      requirements TEXT,
      status TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS login_history (
      id TEXT PRIMARY KEY,
      userId TEXT,
      email TEXT,
      status TEXT,
      notes TEXT,
      ipAddress TEXT,
      userAgent TEXT,
      timestamp TEXT
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      userId TEXT,
      activityType TEXT,
      description TEXT,
      metadata TEXT,
      timestamp TEXT
    );

    CREATE TABLE IF NOT EXISTS transaction_log (
      id TEXT PRIMARY KEY,
      userId TEXT,
      orderId TEXT,
      amount REAL,
      paymentMethod TEXT,
      status TEXT,
      description TEXT,
      timestamp TEXT
    );
  `);

  console.log('✅ User database initialized');
  return userDb;
}

// IDB helpers for user DB
function openUserIDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = window.indexedDB.open('deepthi-user-db', 1);
    req.onupgradeneeded = () => {
      try { req.result.createObjectStore('files'); } catch (e) { /* ignore */ }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function saveUserToIDB(key: string, buffer: ArrayBuffer | ArrayBufferLike) {
  return openUserIDB().then(dbConn => new Promise<void>((resolve, reject) => {
    const tx = dbConn.transaction('files', 'readwrite');
    tx.objectStore('files').put(buffer, key);
    tx.oncomplete = () => { dbConn.close(); resolve(); };
    tx.onerror = () => { dbConn.close(); reject(tx.error); };
  }));
}

function loadUserFromIDB(key: string) {
  return openUserIDB().then(dbConn => new Promise<ArrayBuffer | null>((resolve, reject) => {
    const tx = dbConn.transaction('files', 'readonly');
    const req = tx.objectStore('files').get(key);
    req.onsuccess = () => { dbConn.close(); resolve(req.result || null); };
    req.onerror = () => { dbConn.close(); reject(req.error); };
  }));
}

export function saveUserDatabase() {
  try {
    if (!userDb) return;
    const u8 = userDb.export();
    const buffer = u8 instanceof Uint8Array ? u8.buffer : (u8 as ArrayBuffer);
    saveUserToIDB('user-db', buffer as ArrayBuffer).catch(e => console.warn('Failed to persist user DB to IndexedDB', e));

    const ts = Date.now();
    saveUserToIDB(`user-backup-${ts}`, buffer as ArrayBuffer).catch(e => console.warn('Failed to write backup', e));

    try { window.dispatchEvent(new Event('deepthi-db-changed')); } catch (e) {}

    if (!userBackupTimer) {
      userBackupTimer = window.setInterval(() => {
        try {
          const u = userDb.export();
          const b = u instanceof Uint8Array ? u.buffer : (u as ArrayBuffer);
          saveUserToIDB(`user-backup-${Date.now()}`, b as ArrayBuffer).catch(() => {});
        } catch (e) { /* ignore */ }
      }, 10 * 60 * 1000) as unknown as number;
    }
  } catch (e) {
    console.warn('saveUserDatabase error', e);
  }
}

export function exportUserDatabase(): Uint8Array {
  if (!userDb) return new Uint8Array();
  return userDb.export();
}

export function downloadDatabase(filename = 'user.sqlite') {
  const u8 = exportUserDatabase();
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

export async function importDatabase(bytes: Uint8Array | ArrayBuffer) {
  if (!UserSQL) {
    UserSQL = await (window as any).initSqlJs({
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm`
    });
  }
  const arr = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
  userDb = new UserSQL.Database(arr);

  try {
    const buf = arr.buffer ? arr.buffer : (arr as any);
    saveUserToIDB('user-db', buf as ArrayBuffer).catch(e => console.warn('persist after import failed', e));
  } catch (e) {
    console.warn('persist after import failed', e);
  }
  try { window.dispatchEvent(new Event('deepthi-db-changed')); } catch (e) {}

  saveUserDatabase();
  return userDb;
}

export function runSql(sql: string) {
  if (!userDb) return null;
  try {
    const res = userDb.exec(sql);
    const isWrite = /^\s*(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|PRAGMA)/i.test(sql);
    if (isWrite) {
      saveUserDatabase();
    }
    return res;
  } catch (e) {
    try {
      userDb.run(sql);
      const isWrite = /^\s*(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|PRAGMA)/i.test(sql);
      if (isWrite) {
        saveUserDatabase();
      }
      return { ok: true };
    } catch (er) {
      return { error: String(er) };
    }
  }
}

export function getTableList(): string[] {
  if (!userDb) return [];
  const res = userDb.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;");
  if (!res || res.length === 0) return [];
  return res[0].values.map((r: any[]) => r[0]);
}

export function getTableContents(table: string) {
  if (!userDb) return { columns: [], values: [] };
  try {
    const res = userDb.exec(`SELECT * FROM ${table} LIMIT 2000`);
    if (!res || res.length === 0) return { columns: [], values: [] };
    return { columns: res[0].columns, values: res[0].values };
  } catch (e) {
    return { columns: [], values: [] };
  }
}


// ==================== USERS ====================
export function getUsers(): User[] {
  try {
    if (!userDb) return [];
    const res = userDb.exec("SELECT * FROM users LIMIT 2000");
    if (!res || res.length === 0) return [];
    return res[0].values.map((row: any[]) => ({
      id: row[0],
      email: row[1],
      name: row[2],
      role: row[5],
      joinedDate: row[6],
      createdAt: row[7],
      lastLogin: row[8]
    } as User));
  } catch (e) {
    console.warn('getUsers error:', e);
    return [];
  }
}

export function getProducts(): Product[] {
  try {
    if (!userDb) return [];
    const res = userDb.exec("SELECT * FROM products LIMIT 2000");
    if (!res || res.length === 0) return [];
    return res[0].values.map((row: any[]) => ({
      id: row[0],
      name: row[1],
      name_te: row[2],
      price: row[3],
      category: row[4],
      description: row[5],
      description_te: row[6],
      image: row[7],
      benefits: row[8],
      createdAt: row[9]
    } as Product));
  } catch (e) {
    console.warn('getProducts error:', e);
    return [];
  }
}

export function getOrders(): Order[] {
  try {
    if (!userDb) return [];
    const res = userDb.exec("SELECT * FROM orders LIMIT 2000");
    if (!res || res.length === 0) return [];
    return res[0].values.map((row: any[]) => ({
      id: row[0],
      customerEmail: row[2],
      items: row[3],
      total: row[4],
      status: row[5],
      shippingAddress: row[6],
      trackingId: row[7],
      createdAt: row[9]
    } as any as Order));
  } catch (e) {
    console.warn('getOrders error:', e);
    return [];
  }
}

export function getActiveUser(): User | null {
  try {
    const stored = localStorage.getItem('deepthi_active_user');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.warn('getActiveUser error:', e);
    return null;
  }
}

export async function getUsersAsync(): Promise<User[]> {
  try {
    return await api.getUsers();
  } catch (e) {
    console.warn('Failed to fetch users via API:', e);
    return getUsers(); // Fallback to local DB
  }
}

export async function addUser(user: Omit<User, 'id'>): Promise<User> {
  try {
    return await api.createUser({
      email: user.email,
      name: user.name,
      password: (user as any).password || 'default',
      role: user.role
    });
  } catch (e) {
    console.warn('Failed to add user via API:', e);
    throw e;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    return await api.deleteUser(userId);
  } catch (e) {
    console.warn('Failed to delete user:', e);
    throw e;
  }
}

export async function updateUserAsync(userId: string, updates: any): Promise<User> {
  try {
    return await api.updateUser(userId, updates);
  } catch (e) {
    console.warn('Failed to update user:', e);
    throw e;
  }
}

export function setActiveUserDB(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem('deepthi_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('deepthi_active_user');
    }
  } catch (e) {
    console.warn('setActiveUserDB error:', e);
  }
}

export async function updateUserLastLogin(userId: string, timestamp: string) {
  try {
    return await api.updateUser(userId, { lastLogin: timestamp });
  } catch (e) {
    console.warn('Failed to update last login:', e);
  }
}

// ==================== PRODUCTS ====================
export async function addProduct(product: Product): Promise<void> {
  try {
    await api.createProduct({
      id: product.id,
      name: product.name,
      name_te: product.name_te,
      price: product.price,
      category: product.category,
      description: product.description,
      description_te: product.description_te,
      image: product.image,
      benefits: product.benefits
    });
  } catch (e) {
    console.warn('Failed to add product:', e);
    throw e;
  }
}

export function saveProduct(product: Product): void {
  addProduct(product).catch(e => console.error('Error saving product:', e));
}

export async function getProductsAsync(): Promise<Product[]> {
  try {
    return await api.getProducts();
  } catch (e) {
    console.warn('Failed to fetch products:', e);
    return [];
  }
}

export async function updateProduct(product: Product): Promise<void> {
  try {
    await api.updateProduct(product.id, {
      name: product.name,
      name_te: product.name_te,
      price: product.price,
      category: product.category,
      description: product.description,
      description_te: product.description_te,
      image: product.image,
      benefits: product.benefits
    });
  } catch (e) {
    console.warn('Failed to update product:', e);
    throw e;
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  try {
    await api.deleteProduct(productId);
  } catch (e) {
    console.warn('Failed to delete product:', e);
    throw e;
  }
}

// ==================== ORDERS ====================
export async function addOrder(order: Order): Promise<void> {
  try {
    await api.createOrder({
      userId: (order as any).customerId || (order as any).userId || null,
      customerEmail: order.customerEmail,
      items: order.items,
      total: order.total,
      status: order.status,
      shippingAddress: order.shippingAddress,
      trackingId: order.trackingId,
      trackingHistory: (order as any).trackingHistory || []
    });
  } catch (e) {
    console.warn('Failed to add order:', e);
    throw e;
  }
}

export async function getOrdersAsync(): Promise<Order[]> {
  try {
    return await api.getOrders();
  } catch (e) {
    console.warn('Failed to fetch orders:', e);
    return [];
  }
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  try {
    return await api.getOrdersByUser(userId);
  } catch (e) {
    console.warn('Failed to fetch user orders:', e);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, trackingId?: string): Promise<void> {
  try {
    await api.updateOrder(orderId, { status, trackingId });
  } catch (e) {
    console.warn('Failed to update order status:', e);
    throw e;
  }
}

// ==================== ADDRESSES ====================
export async function addAddress(userId: string, address: any): Promise<void> {
  try {
    await api.createAddress({
      userId,
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
  } catch (e) {
    console.warn('Failed to add address:', e);
    throw e;
  }
}

export async function getAddresses(userId: string): Promise<any[]> {
  try {
    return await api.getAddressesByUser(userId);
  } catch (e) {
    console.warn('Failed to fetch addresses:', e);
    return [];
  }
}

export async function deleteAddress(addressId: string): Promise<void> {
  try {
    await api.deleteAddress(addressId);
  } catch (e) {
    console.warn('Failed to delete address:', e);
    throw e;
  }
}

export async function addSavedCard(userId: string, card: any): Promise<void> {
  try {
    await logActivity(userId, 'CARD_SAVED', `Card ending in ${card.cardNumber?.slice(-4)} saved`);
  } catch (e) {
    console.warn('Failed to save card:', e);
  }
}

// ==================== AUDIT LOGGING ====================
export async function logLogin(userId: string | null, email: string | null, status: 'success' | 'failed', notes?: string): Promise<void> {
  try {
    await api.logLogin({
      userId: userId || null,
      email: email || null,
      status,
      notes: notes || null
    });
  } catch (e) {
    console.warn('Failed to log login:', e);
  }
}

export async function getLoginHistory(): Promise<any[]> {
  try {
    return await api.getLoginHistory();
  } catch (e) {
    console.warn('Failed to fetch login history:', e);
    return [];
  }
}

export async function logActivity(userId: string, activityType: string, description?: string, metadata?: any): Promise<void> {
  try {
    await api.logActivity({
      userId,
      activityType,
      description: description || null,
      metadata: metadata || {}
    });
  } catch (e) {
    console.warn('Failed to log activity:', e);
  }
}

export async function getActivityLog(userId?: string, limit?: number): Promise<any[]> {
  try {
    const allLogs = await api.getActivityLog();
    if (userId) {
      return allLogs.filter((log: any) => log.userId === userId).slice(0, limit || 100);
    }
    return allLogs.slice(0, limit || 100);
  } catch (e) {
    console.warn('Failed to fetch activity log:', e);
    return [];
  }
}

export async function logTransaction(userId: string, orderId: string | null, amount: number, paymentMethod?: string, status?: string): Promise<void> {
  try {
    await api.logTransaction({
      userId,
      orderId: orderId || null,
      amount,
      paymentMethod: paymentMethod || null,
      status: status || 'completed',
      description: null
    });
  } catch (e) {
    console.warn('Failed to log transaction:', e);
  }
}

export async function getTransactionLog(userId?: string, limit?: number): Promise<any[]> {
  try {
    const allLogs = await api.getTransactionLog();
    if (userId) {
      return allLogs.filter((log: any) => log.userId === userId).slice(0, limit || 100);
    }
    return allLogs.slice(0, limit || 100);
  } catch (e) {
    console.warn('Failed to fetch transaction log:', e);
    return [];
  }
}

// ==================== FAVORITES & CARTS ====================
export async function addFavorite(userId: string, productId: string): Promise<void> {
  try {
    await logActivity(userId, 'FAVORITE_ADDED', `Added product to favorites`);
  } catch (e) {
    console.warn('Failed to add favorite:', e);
  }
}

export async function removeFavorite(userId: string, productId: string): Promise<void> {
  try {
    await logActivity(userId, 'FAVORITE_REMOVED', `Removed product from favorites`);
  } catch (e) {
    console.warn('Failed to remove favorite:', e);
  }
}

export async function addSavedCart(userId: string, items: any[]): Promise<void> {
  try {
    await logActivity(userId, 'CART_SAVED', 'Saved cart items', { itemCount: items.length });
  } catch (e) {
    console.warn('Failed to save cart:', e);
  }
}

export async function getSavedCart(userId: string): Promise<any[]> {
  try {
    await logActivity(userId, 'CART_LOADED', 'Retrieved saved cart');
    return [];
  } catch (e) {
    console.warn('Failed to load cart:', e);
    return [];
  }
}

// ==================== BULK REQUESTS ====================
export async function addBulkRequest(userId: string, productName: string, quantity: string, requirements?: string): Promise<void> {
  try {
    await logActivity(userId, 'BULK_REQUEST', `Bulk request for ${productName}`, { quantity, requirements });
  } catch (e) {
    console.warn('Failed to add bulk request:', e);
  }
}

export async function getBulkRequests(userId?: string): Promise<BulkRequest[]> {
  try {
    if (!userDb) return [];
    const sql = userId ? `SELECT * FROM bulk_requests WHERE userId = '${userId}' LIMIT 2000` : `SELECT * FROM bulk_requests LIMIT 2000`;
    const res = userDb.exec(sql);
    if (!res || res.length === 0) return [];
    return res[0].values.map((row: any[]) => ({
      id: row[0],
      userId: row[1],
      productName: row[2],
      quantity: row[3],
      requirements: row[4],
      status: row[5],
      createdAt: row[6]
    } as any as BulkRequest));
  } catch (e) {
    console.warn('Failed to get bulk requests:', e);
    return [];
  }
}

// ==================== UTILITY FUNCTIONS ====================
export function saveDatabase(): void {
  try {
    saveUserDatabase();
    console.log('✅ Database auto-saved');
  } catch (e) {
    console.warn('Failed to save database:', e);
  }
}

