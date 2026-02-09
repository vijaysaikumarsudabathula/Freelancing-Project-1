import fs from 'fs';
import initSqlJs from 'sql.js';
import path from 'path';

async function removeUser(email) {
  const wasmPath = path.resolve('node_modules/sql.js/dist/sql-wasm.wasm');
  const SQL = await initSqlJs({ locateFile: (file) => wasmPath });
  const filePath = './db/deepthi.sqlite';
  if (!fs.existsSync(filePath)) {
    console.error('DB file not found:', filePath);
    process.exit(1);
  }
  const buf = fs.readFileSync(filePath);
  const db = new SQL.Database(new Uint8Array(buf));

  const stmt = db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)");
  stmt.bind([email]);
  if (!stmt.step()) {
    console.log('No user found with email', email);
    stmt.free();
    return;
  }
  const row = stmt.getAsObject();
  stmt.free();
  const userId = row.id;
  console.log('Found user id', userId, '- deleting user and associated data');

  db.run("DELETE FROM addresses WHERE userId = ?", [userId]);
  db.run("DELETE FROM saved_cards WHERE userId = ?", [userId]);
  db.run("DELETE FROM saved_carts WHERE userId = ?", [userId]);
  db.run("DELETE FROM favorites WHERE userId = ?", [userId]);
  db.run("DELETE FROM orders WHERE customerId = ? OR LOWER(customerEmail) = LOWER(?)", [userId, email]);
  db.run("DELETE FROM users WHERE id = ?", [userId]);

  const out = db.export();
  fs.writeFileSync(filePath, Buffer.from(out));
  console.log('User and dependent rows removed. DB saved to', filePath);
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node remove_user_from_sqlite.js <email>');
  process.exit(1);
}
removeUser(email).catch(e => { console.error(e); process.exit(1); });