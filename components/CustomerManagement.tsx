import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { getUsersAsync, addUser, deleteUser, getAddresses, getOrdersByUser } from '../services/database';

const CustomerManagement: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

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
            <button onClick={onClose} className="px-3 py-2 rounded border hover:bg-gray-50">Close</button>
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
  );
};

export default CustomerManagement;
