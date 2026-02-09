import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';

(async () => {
  try {
    const SQL = await initSqlJs({ locateFile: (f) => path.resolve('./node_modules/sql.js/dist/sql-wasm.wasm') });
    const dbPath = path.resolve(process.cwd(), 'db', 'deepthi.sqlite');
    if (!fs.existsSync(dbPath)) {
      console.error('DB file not found at', dbPath);
      process.exit(1);
    }
    const file = fs.readFileSync(dbPath);
    const u8 = new Uint8Array(file);
    const db = new SQL.Database(u8);

    const tablesRes = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;");
    const tables = tablesRes && tablesRes[0] ? tablesRes[0].values.map(r => r[0]) : [];
    console.log('Tables in DB:', tables.join(', '));

    const userCountRes = db.exec("SELECT COUNT(*) as c FROM users");
    const userCount = userCountRes && userCountRes[0] ? userCountRes[0].values[0][0] : 0;
    console.log('Total users:', userCount);

    const customers = db.exec("SELECT id, name, email, role, joinedDate FROM users WHERE role = 'customer'");
    if (customers && customers.length > 0) {
      console.log('Customer rows:');
      const cols = customers[0].columns;
      customers[0].values.forEach(row => {
        const obj = {};
        row.forEach((v, i) => obj[cols[i]] = v);
        console.log(obj);
      });
    } else {
      console.log('No customer rows found.');
    }

    const addr = db.exec("SELECT * FROM addresses WHERE userId = 'u-cust-1'");
    console.log('Addresses for u-cust-1:', addr && addr[0] ? addr[0].values : []);

    const cards = db.exec("SELECT * FROM saved_cards WHERE userId = 'u-cust-1'");
    console.log('Saved cards for u-cust-1:', cards && cards[0] ? cards[0].values : []);

    const orders = db.exec("SELECT id, total, status, customerEmail, customerId FROM orders WHERE customerId = 'u-cust-1'");
    console.log('Orders for u-cust-1:', orders && orders[0] ? orders[0].values : []);

  } catch (e) {
    console.error('Inspect failed:', e);
    process.exit(1);
  }
})();