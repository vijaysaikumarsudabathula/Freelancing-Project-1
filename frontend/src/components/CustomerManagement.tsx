import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { getUsersAsync, addUser, deleteUser, getAddresses, getOrdersByUser, getLoginHistory, getActivityLog } from '../services/database';

const CustomerManagement: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [tab, setTab] = useState<'customers' | 'logins' | 'activity'>('customers');
  const [customers, setCustomers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => { refreshList(); }, []);

  const refreshList = async () => {
    setLoading(true);
    try {
      const all = await getUsersAsync();
      setCustomers(all.filter(u => u.role === 'customer'));
    } catch (err) {
      console.error('Error loading customers:', err);
    }
    setLoading(false);
  };

  const loadLoginHistory = async () => {
    setLoginHistoryLoading(true);
    try {
      const logins = await getLoginHistory();
      setLoginHistory(logins);
    } catch (err) {
      console.error('Error loading login history:', err);
    }
    setLoginHistoryLoading(false);
  };

  const loadActivityLog = async () => {
    setActivityLoading(true);
    try {
      const activities = await getActivityLog();
      setActivityLog(activities);
    } catch (err) {
      console.error('Error loading activity log:', err);
    }
    setActivityLoading(false);
  };

  useEffect(() => {
    if (tab === 'logins') {
      loadLoginHistory();
    } else if (tab === 'activity') {
      loadActivityLog();
    }
  }, [tab]);

  const selectCustomer = async (u: User) => {
    setSelected(u);
    setForm({ name: u.name, email: u.email, password: u.password || '' });
    try {
      const addr = await getAddresses(u.id);
      setAddresses(addr);
      const ord = await getOrdersByUser(u.id);
      setOrders(ord as any[]);
    } catch (err) {
      console.error('Error loading customer details:', err);
    }
  };

  const save = async () => {
    if (!selected) return;
    try {
      setLoading(true);
      const updated: User = { ...selected, name: form.name, email: form.email.toLowerCase(), password: form.password };
      await addUser(updated);
      await refreshList();
      setSelected(updated);
    } catch (err) {
      console.error('Error saving customer:', err);
      alert('Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    if (!confirm(`Delete customer ${selected.name} (${selected.email})? This will remove addresses and saved items.`)) return;
    try {
      setLoading(true);
      await deleteUser(selected.id);
      setSelected(null);
      await refreshList();
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert('Failed to delete customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setTab('customers')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            tab === 'customers'
              ? 'border-[#2D5A27] text-[#2D5A27]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          👥 Customers
        </button>
        <button
          onClick={() => setTab('logins')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            tab === 'logins'
              ? 'border-[#2D5A27] text-[#2D5A27]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          🔐 Login History
        </button>
        <button
          onClick={() => setTab('activity')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            tab === 'activity'
              ? 'border-[#2D5A27] text-[#2D5A27]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📋 Activity Log
        </button>
        <button 
          onClick={onClose} 
          className="ml-auto px-3 py-2 rounded border hover:bg-gray-50 text-sm"
        >
          ✕ Close
        </button>
      </div>

      {/* Customers Tab */}
      {tab === 'customers' && (
        <div className="w-full flex gap-6">
          <aside className="w-80 bg-[#FAF9F6] p-4 rounded-lg border">
            <div className="mb-4 flex items-center justify-between">
              <strong className="text-sm">Customers</strong>
              <button onClick={refreshList} disabled={loading} className="px-2 py-1 rounded border text-xs disabled:opacity-50">
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-auto">
              {customers.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => selectCustomer(c)} 
                  className={`text-left px-3 py-2 rounded transition-all ${selected?.id === c.id ? 'bg-[#2D5A27] text-white' : 'bg-white border hover:border-[#2D5A27]'}`}
                >
                  {c.name} 
                  <div className="text-[10px] text-gray-400">{c.email}</div>
                </button>
              ))}
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">Customer: {selected ? selected.name : '—'}</h3>
                {selected && <div className="text-sm text-gray-500">ID: <code>{selected.id}</code> • Role: <strong>{selected.role}</strong></div>}
              </div>
              <div className="flex gap-2">
                {selected && <button onClick={remove} disabled={loading} className="px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">Delete</button>}
              </div>
            </div>

            {selected ? (
              <div>
                <div className="mb-6 bg-white p-4 rounded border">
                  <h4 className="font-bold mb-2">Edit</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input 
                      value={form.name} 
                      onChange={e => setForm({...form, name: e.target.value})} 
                      className="p-2 border rounded" 
                      placeholder="Full name"
                      disabled={loading}
                    />
                    <input 
                      value={form.email} 
                      onChange={e => setForm({...form, email: e.target.value})} 
                      className="p-2 border rounded" 
                      placeholder="Email"
                      disabled={loading}
                    />
                    <input 
                      value={form.password} 
                      onChange={e => setForm({...form, password: e.target.value})} 
                      className="p-2 border rounded" 
                      placeholder="Password"
                      disabled={loading}
                    />
                  </div>
                  <div className="mt-3">
                    <button onClick={save} disabled={loading} className="px-4 py-2 rounded bg-[#2D5A27] text-white hover:bg-[#1a3f1c] disabled:opacity-50">
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-bold mb-3">Addresses ({addresses.length})</h4>
                    {addresses.length === 0 ? (
                      <p className="text-sm text-gray-400">No addresses saved.</p>
                    ) : (
                      <ul className="text-sm space-y-2">
                        {addresses.map((a: any) => (
                          <li key={a.id} className="border p-2 rounded text-xs">
                            <div className="font-semibold">{a.name}</div>
                            <div className="text-gray-600">{a.address}</div>
                            <div className="text-gray-500">{a.city}, {a.state} {a.pincode}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-bold mb-3">Orders ({orders.length})</h4>
                    {orders.length === 0 ? (
                      <p className="text-sm text-gray-400">No orders placed.</p>
                    ) : (
                      <ul className="text-sm space-y-2">
                        {orders.map(o => (
                          <li key={o.id} className="border p-2 rounded text-xs">
                            <div className="font-semibold">#{o.id?.slice(-8)}</div>
                            <div>₹{o.total} • <span className="uppercase font-bold">{o.status}</span></div>
                            <div className="text-gray-500">{o.date}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white border rounded text-sm text-gray-500">Select a customer to view details and edit.</div>
            )}
          </main>
        </div>
      )}

      {/* Login History Tab */}
      {tab === 'logins' && (
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Login History</h3>
            <button 
              onClick={loadLoginHistory} 
              disabled={loginHistoryLoading}
              className="px-3 py-2 rounded border hover:bg-gray-50 text-sm disabled:opacity-50"
            >
              {loginHistoryLoading ? '⏳ Loading...' : '🔄 Refresh'}
            </button>
          </div>
          
          {loginHistoryLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5A27]"></div>
              <p className="mt-4 text-gray-500">Loading login history...</p>
            </div>
          ) : loginHistory.length === 0 ? (
            <div className="p-6 bg-white border rounded text-center text-gray-500">No login records found</div>
          ) : (
            <div className="bg-white rounded border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#FAF9F6] border-b">
                    <tr>
                      <th className="text-left p-3">User Email</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Timestamp</th>
                      <th className="text-left p-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.map((log: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-[#FAF9F6]">
                        <td className="p-3 font-semibold">{log.email || 'N/A'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-3 text-gray-500 text-xs max-w-xs">{log.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity Log Tab */}
      {tab === 'activity' && (
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Activity Log</h3>
            <button 
              onClick={loadActivityLog} 
              disabled={activityLoading}
              className="px-3 py-2 rounded border hover:bg-gray-50 text-sm disabled:opacity-50"
            >
              {activityLoading ? '⏳ Loading...' : '🔄 Refresh'}
            </button>
          </div>
          
          {activityLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5A27]"></div>
              <p className="mt-4 text-gray-500">Loading activity log...</p>
            </div>
          ) : activityLog.length === 0 ? (
            <div className="p-6 bg-white border rounded text-center text-gray-500">No activity records found</div>
          ) : (
            <div className="bg-white rounded border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#FAF9F6] border-b">
                    <tr>
                      <th className="text-left p-3">User</th>
                      <th className="text-left p-3">Activity Type</th>
                      <th className="text-left p-3">Description</th>
                      <th className="text-left p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLog.map((log: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-[#FAF9F6]">
                        <td className="p-3 font-semibold text-xs">{log.userId?.slice(-8) || 'N/A'}</td>
                        <td className="p-3 text-xs">
                          <span className="px-2 py-1 rounded bg-[#A4C639]/20 text-[#2D5A27] font-bold">
                            {log.activityType}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600 text-xs max-w-xs">{log.description}</td>
                        <td className="p-3 text-gray-500 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
