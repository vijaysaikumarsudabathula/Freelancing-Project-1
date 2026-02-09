import { User } from '../types';

let adminDb: any = null;
let AdminSQL: any = null;

export async function initAdminDatabase() {
  if (adminDb) return adminDb;
  if (!AdminSQL) {
    AdminSQL = await (window as any).initSqlJs({
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm`
    });
  }

  // Attempt to restore admin DB from IndexedDB, otherwise create a fresh in-memory DB.
  const saved = await (async function loadSavedAdmin() {
    try {
      return await loadFromIDB('admin-db');
    } catch (e) {
      return null;
    }
  })();

  if (saved && saved.byteLength) {
    adminDb = new AdminSQL.Database(new Uint8Array(saved));
  } else {
    adminDb = new AdminSQL.Database();
  }

  // Ensure schema exists
  adminDb.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      password TEXT,
      role TEXT,
      joinedDate TEXT,
      lastLogin TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_images (
      id TEXT PRIMARY KEY,
      adminId TEXT,
      filename TEXT,
      url TEXT,
      metadata TEXT,
      uploadedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT
    );
  `);

  // Seed a default admin if not present (helpful for first-time setup)
  try {
    const existing = findAdminByEmail('vijay@gmail.com');
    if (!existing) {
      addAdmin({
        id: 'admin-default-1',
        name: 'Vijay',
        email: 'vijay@gmail.com',
        password: 'vijay@567', // NOTE: stored as plain text for demo; hash in production
        role: 'admin',
        joinedDate: new Date().toISOString(),
        lastLogin: ''
      });
      // Persist after seeding the admin
      saveAdminDatabase();
    }
  } catch (e) {
    // non-fatal
    console.warn('Admin seed failed', e);
  }

  return adminDb;
}

export function exportAdminDatabase(): Uint8Array {
  if (!adminDb) return new Uint8Array();
  return adminDb.export();
}

// IDB helpers (local to admin DB)
function openAdminIDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = window.indexedDB.open('deepthi-admin-db', 1);
    req.onupgradeneeded = () => {
      try { req.result.createObjectStore('files'); } catch (e) { /* ignore */ }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function saveAdminToIDB(key: string, buffer: ArrayBuffer | ArrayBufferLike) {
  return openAdminIDB().then(dbConn => new Promise<void>((resolve, reject) => {
    const tx = dbConn.transaction('files', 'readwrite');
    tx.objectStore('files').put(buffer, key);
    tx.oncomplete = () => { dbConn.close(); resolve(); };
    tx.onerror = () => { dbConn.close(); reject(tx.error); };
  }));
}

function loadFromIDB(key: string) {
  return openAdminIDB().then(dbConn => new Promise<ArrayBuffer | null>((resolve, reject) => {
    const tx = dbConn.transaction('files', 'readonly');
    const req = tx.objectStore('files').get(key);
    req.onsuccess = () => { dbConn.close(); resolve(req.result || null); };
    req.onerror = () => { dbConn.close(); reject(req.error); };
  }));
}

let adminBackupTimer: number | null = null;

/** Persist the admin DB to IndexedDB and create periodic timestamped backups */
export function saveAdminDatabase() {
  try {
    if (!adminDb) return;
    const u8 = adminDb.export();
    const buffer = u8 instanceof Uint8Array ? u8.buffer : (u8 as ArrayBuffer);
    saveAdminToIDB('admin-db', buffer as ArrayBuffer).catch(e => console.warn('Failed to persist admin DB to IndexedDB', e));

    // Create a timestamped backup key (prune older backups later if needed)
    const ts = Date.now();
    saveAdminToIDB(`admin-backup-${ts}`, buffer as ArrayBuffer).catch(e => console.warn('Failed to write backup', e));

    // Dispatch event so UI refreshes
    try { window.dispatchEvent(new Event('deepthi-admin-db-changed')); } catch (e) {}

    // Start periodic backup timer if not already running (e.g., every 10 minutes)
    if (!adminBackupTimer) {
      adminBackupTimer = window.setInterval(() => {
        try {
          const u = adminDb.export();
          const b = u instanceof Uint8Array ? u.buffer : (u as ArrayBuffer);
          saveAdminToIDB(`admin-backup-${Date.now()}`, b as ArrayBuffer).catch(() => {});
        } catch (e) { /* ignore */ }
      }, 10 * 60 * 1000) as unknown as number;
    }
  } catch (e) {
    console.warn('saveAdminDatabase error', e);
  }
}
export function downloadAdminDatabase(filename = 'admin.sqlite') {
  const u8 = exportAdminDatabase();
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

export async function importAdminDatabase(bytes: Uint8Array | ArrayBuffer) {
  if (!AdminSQL) {
    AdminSQL = await (window as any).initSqlJs({
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm`
    });
  }
  const arr = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
  adminDb = new AdminSQL.Database(arr);

  try {
    const buf = arr.buffer ? arr.buffer : (arr as any);
    saveAdminToIDB('admin-db', buf as ArrayBuffer).catch(e => console.warn('persist after import failed', e));
  } catch (e) {
    console.warn('persist after import failed', e);
  }
  try { window.dispatchEvent(new Event('deepthi-admin-db-changed')); } catch (e) {}

  // Ensure full persistence with backup
  saveAdminDatabase();

  return adminDb;
}

export function runAdminSql(sql: string) {
  if (!adminDb) return null;
  try {
    const res = adminDb.exec(sql);
    // Check if this is a write operation (DML/DDL)
    const isWrite = /^\s*(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|PRAGMA)/i.test(sql);
    if (isWrite) {
      saveAdminDatabase(); // Auto-persist write operations
    }
    return res;
  } catch (e) {
    try {
      adminDb.run(sql);
      const isWrite = /^\s*(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|PRAGMA)/i.test(sql);
      if (isWrite) {
        saveAdminDatabase(); // Auto-persist write operations
      }
      return { ok: true };
    } catch (er) {
      return { error: String(er) };
    }
  }
}

export function getAdminTableList() {
  if (!adminDb) return [];
  const res = adminDb.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;");
  if (!res || res.length === 0) return [];
  return res[0].values.map((r: any[]) => r[0]);
}

export function getAdminTableContents(table: string) {
  if (!adminDb) return { columns: [], values: [] };
  try {
    const res = adminDb.exec(`SELECT * FROM ${table} LIMIT 2000`);
    if (!res || res.length === 0) return { columns: [], values: [] };
    return { columns: res[0].columns, values: res[0].values };
  } catch (e) {
    return { columns: [], values: [] };
  }
}

export function addAdmin(a: User) {
  if (!adminDb) return;
  // enforce admin id prefix
  if (!a.id || !a.id.startsWith('admin-')) a.id = `admin-${Date.now()}`;
  if (!a.joinedDate) a.joinedDate = new Date().toISOString();
  adminDb.run("INSERT OR REPLACE INTO admins (id, name, email, password, role, joinedDate, lastLogin) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [a.id, a.name, a.email, a.password || '', a.role, a.joinedDate, a.lastLogin || '']);
  saveAdminDatabase();
}

export function findAdminByEmail(email: string) {
  if (!adminDb) return null;
  try {
    const stmt = adminDb.prepare("SELECT * FROM admins WHERE UPPER(email) = UPPER(?)");
    stmt.bind([email]);
    const hasRow = stmt.step();
    if (!hasRow) { stmt.free(); return null; }
    const row = stmt.getAsObject();
    stmt.free();
    return row as User;
  } catch (e) {
    console.warn('findAdminByEmail error', e);
    return null;
  }
}

export function addAdminImage(adminId: string, img: { id: string; filename: string; url: string; metadata?: any }) {
  if (!adminDb) return;
  adminDb.run("INSERT OR REPLACE INTO admin_images (id, adminId, filename, url, metadata, uploadedAt) VALUES (?, ?, ?, ?, ?, ?)",
    [img.id, adminId, img.filename, img.url, JSON.stringify(img.metadata || {}), new Date().toISOString()]);
  saveAdminDatabase();
}

export function getAdminImages(adminId?: string) {
  if (!adminDb) return [];
  if (adminId) {
    const res = adminDb.exec("SELECT * FROM admin_images WHERE adminId = ? ORDER BY uploadedAt DESC", [adminId]);
    if (res.length === 0) return [];
    const columns = res[0].columns;
    return res[0].values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
      if (obj.metadata) obj.metadata = JSON.parse(obj.metadata);
      return obj;
    });
  }
  const res = adminDb.exec("SELECT * FROM admin_images ORDER BY uploadedAt DESC");
  if (res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    if (obj.metadata) obj.metadata = JSON.parse(obj.metadata);
    return obj;
  });
}

export function setActiveAdmin(a: User | null) {
  if (!adminDb) return;
  if (a) {
    adminDb.run("INSERT OR REPLACE INTO admin_session (id, data) VALUES (1, ?)", [JSON.stringify(a)]);
  } else {
    adminDb.run("DELETE FROM admin_session WHERE id = 1");
  }
  saveAdminDatabase();
}

export function getActiveAdmin() {
  if (!adminDb) return null;
  const res = adminDb.exec("SELECT data FROM admin_session WHERE id = 1");
  if (res.length === 0) return null;
  return JSON.parse(res[0].values[0][0]);
}
