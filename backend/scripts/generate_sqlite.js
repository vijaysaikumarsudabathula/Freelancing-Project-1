import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';

(async () => {
  try {
    const SQL = await initSqlJs({ locateFile: (f) => path.resolve('./node_modules/sql.js/dist/sql-wasm.wasm') });
    const db = new SQL.Database();

    const sqlPath = path.resolve(process.cwd(), 'db', 'deepthi.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error('deepthi.sql not found at', sqlPath);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    db.run(sql);

    const u8 = db.export();
    const outPath = path.resolve(process.cwd(), 'db', 'deepthi.sqlite');
    fs.writeFileSync(outPath, Buffer.from(u8));
    console.log('Created SQLite DB at', outPath);
  } catch (e) {
    console.error('Failed to generate sqlite file:', e);
    process.exit(1);
  }
})();
