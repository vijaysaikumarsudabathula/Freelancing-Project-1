import React, { useEffect, useState } from 'react';
import { initDatabase, getTableList, runSql } from '../services/database';
import { initAdminDatabase, getAdminTableList, runAdminSql } from '../services/adminDatabase';

const USER_TABLES = [
  'products','orders','users','session','saved_cards','addresses','saved_carts','favorites','bulk_requests'
];
const ADMIN_TABLES = ['admins','admin_images','admin_session'];

const DBSetup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [userTables, setUserTables] = useState<string[]>([]);
  const [adminTables, setAdminTables] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');

  useEffect(() => { refresh(); }, []);

  const refresh = async () => {
    setMessage('Checking databases...');
    try {
      await initDatabase();
      await initAdminDatabase();
      setUserTables(getTableList());
      setAdminTables(getAdminTableList());
      setMessage('Checked.');
    } catch (e: any) {
      setMessage('Check failed: ' + e.message || e);
    }
  };

  const missingFor = (have: string[], expect: string[]) => expect.filter(t => !have.includes(t));

  const createUserSchema = () => {
    try {
      // rely on initDatabase which runs CREATE TABLE IF NOT EXISTS, but also run explicit creates to be safe
      runSql(`
        CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT, password TEXT, role TEXT, joinedDate TEXT, lastLogin TEXT);
        CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT, name_te TEXT, price REAL, category TEXT, description TEXT, description_te TEXT, image TEXT, benefits TEXT);
        CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, total REAL, status TEXT, date TEXT, customerEmail TEXT, customerId TEXT, shippingAddress TEXT, items TEXT, paymentMethod TEXT, paymentId TEXT, trackingId TEXT, trackingHistory TEXT);
        CREATE TABLE IF NOT EXISTS session (id INTEGER PRIMARY KEY CHECK (id = 1), user_data TEXT);
        CREATE TABLE IF NOT EXISTS saved_cards (id TEXT PRIMARY KEY, userId TEXT, last4 TEXT, brand TEXT, expiry TEXT);
        CREATE TABLE IF NOT EXISTS addresses (id TEXT PRIMARY KEY, userId TEXT, name TEXT, phone TEXT, area TEXT, landmark TEXT, city TEXT, zip TEXT, type TEXT);
        CREATE TABLE IF NOT EXISTS saved_carts (id TEXT PRIMARY KEY, userId TEXT, name TEXT, items TEXT, createdAt TEXT);
        CREATE TABLE IF NOT EXISTS favorites (id TEXT PRIMARY KEY, userId TEXT, productId TEXT, createdAt TEXT);
        CREATE TABLE IF NOT EXISTS bulk_requests (id TEXT PRIMARY KEY, customerEmail TEXT, items TEXT, quantity TEXT, status TEXT, date TEXT);
      `);
      setMessage('User schema ensured.');
      setTimeout(refresh, 300);
    } catch (e: any) {
      setMessage('Create failed: ' + e.message);
    }
  };

  const createAdminSchema = () => {
    try {
      runAdminSql(`
        CREATE TABLE IF NOT EXISTS admins (id TEXT PRIMARY KEY, name TEXT, email TEXT, password TEXT, role TEXT, joinedDate TEXT, lastLogin TEXT);
        CREATE TABLE IF NOT EXISTS admin_images (id TEXT PRIMARY KEY, adminId TEXT, filename TEXT, url TEXT, metadata TEXT, uploadedAt TEXT);
        CREATE TABLE IF NOT EXISTS admin_session (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT);
      `);
      setMessage('Admin schema ensured.');
      setTimeout(refresh, 300);
    } catch (e: any) {
      setMessage('Create failed: ' + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[121] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white w-full max-w-3xl rounded-lg p-6 border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Database Setup & Check</h2>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-2 border rounded">Close</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded">
            <h3 className="font-bold mb-2">User DB</h3>
            <p className="text-sm text-gray-600 mb-3">Expected tables: {USER_TABLES.join(', ')}</p>
            <p className="text-sm mb-3">Present: {userTables.length === 0 ? '—' : userTables.join(', ')}</p>
            {missingFor(userTables, USER_TABLES).length === 0 ? (
              <div className="text-sm text-green-600">All user tables present.</div>
            ) : (
              <div>
                <div className="text-sm text-red-600 mb-3">Missing: {missingFor(userTables, USER_TABLES).join(', ')}</div>
                <div className="flex gap-2">
                  <button onClick={createUserSchema} className="px-3 py-2 rounded bg-[#2D5A27] text-white">Create missing user tables</button>
                  <button onClick={refresh} className="px-3 py-2 rounded border">Re-check</button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-bold mb-2">Admin DB</h3>
            <p className="text-sm text-gray-600 mb-3">Expected tables: {ADMIN_TABLES.join(', ')}</p>
            <p className="text-sm mb-3">Present: {adminTables.length === 0 ? '—' : adminTables.join(', ')}</p>
            {missingFor(adminTables, ADMIN_TABLES).length === 0 ? (
              <div className="text-sm text-green-600">All admin tables present.</div>
            ) : (
              <div>
                <div className="text-sm text-red-600 mb-3">Missing: {missingFor(adminTables, ADMIN_TABLES).join(', ')}</div>
                <div className="flex gap-2">
                  <button onClick={createAdminSchema} className="px-3 py-2 rounded bg-[#2D5A27] text-white">Create missing admin tables</button>
                  <button onClick={refresh} className="px-3 py-2 rounded border">Re-check</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {message && <div className="mt-4 text-sm text-gray-700">{message}</div>}
      </div>
    </div>
  );
};

export default DBSetup;
