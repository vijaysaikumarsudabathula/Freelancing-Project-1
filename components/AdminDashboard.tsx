
import React, { useState, useRef, useMemo } from 'react';
import { Product, Order, OrderStatus, Language, User } from '../types';
import { generateProductImage, refineImagePrompt } from '../services/geminiService';
import { getUsers } from '../services/database';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  lang?: Language;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, 
  orders, 
  onUpdateOrderStatus,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  lang = 'en'
}) => {
  const [tab, setTab] = useState<'orders' | 'inventory' | 'payments' | 'users'>('orders');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefiningAI, setIsRefiningAI] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', name_te: '', price: '0', category: 'plates' as Product['category'],
    description: '', description_te: '', imagePrompt: '', imageUrl: ''
  });

  const users = useMemo(() => getUsers(), [orders]);
  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);

  const closeModals = () => {
    setIsAdding(false);
    setEditingProductId(null);
    setFormData({ name: '', name_te: '', price: '0', category: 'plates', description: '', description_te: '', imagePrompt: '', imageUrl: '' });
  };

  const handleMagicPrompt = async () => {
    if (!formData.name.trim()) return;
    setIsRefiningAI(true);
    const refined = await refineImagePrompt(formData.name);
    setFormData(prev => ({ ...prev, imagePrompt: refined }));
    setIsRefiningAI(false);
  };

  const handleGenerateImage = async () => {
    if (!formData.imagePrompt.trim()) return;
    setIsGenerating(true);
    const url = await generateProductImage(formData.imagePrompt);
    if (url) setFormData(prev => ({ ...prev, imageUrl: url }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: editingProductId || `p-${Date.now()}`,
      name: formData.name,
      name_te: formData.name_te,
      price: Number(formData.price),
      category: formData.category,
      description: formData.description,
      description_te: formData.description_te,
      image: formData.imageUrl || 'https://via.placeholder.com/300',
      benefits: ['Biodegradable', 'Handcrafted', 'Eco-safe']
    };
    if (editingProductId) onUpdateProduct(productData);
    else onAddProduct(productData);
    closeModals();
  };

  return (
    <div className="min-h-screen pt-12 pb-24 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A4C639] mb-2 block">Admin Command Center</span>
            <h1 className="text-4xl font-bold serif text-[#4A3728]">Store Management</h1>
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl border border-[#2D5A27]/10 shadow-sm overflow-x-auto">
            {['orders', 'inventory', 'payments', 'users'].map((t) => (
              <button 
                key={t}
                onClick={() => setTab(t as any)} 
                className={`px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${tab === t ? 'bg-[#2D5A27] text-white shadow-md' : 'text-[#2D5A27]/40 hover:text-[#2D5A27]'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </header>

        {tab === 'orders' && (
          <div className="space-y-8 animate-fade-in">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border border-[#2D5A27]/5 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="bg-[#A4C639]/10 text-[#2D5A27] text-[10px] font-black px-4 py-1.5 rounded-lg">ORD: {order.id.slice(-6)}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{order.date}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <p className="text-[9px] font-black text-[#A4C639] uppercase tracking-widest mb-1">Customer</p>
                        <p className="font-bold text-[#4A3728]">{order.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-[#A4C639] uppercase tracking-widest mb-1">Address</p>
                        <p className="text-sm font-medium text-gray-500 italic">{order.shippingAddress}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-3 bg-[#FAF9F6] p-3 rounded-xl border border-[#2D5A27]/5">
                          <img src={item.image} className="w-10 h-10 rounded-lg object-cover" alt={item.name} />
                          <span className="text-[11px] font-bold text-[#4A3728]">{item.name} <span className="text-[#A4C639]">x{item.quantity}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:w-64 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-[#2D5A27]/30 uppercase tracking-widest mb-2">Update Status</p>
                      {(['pending', 'processing', 'shipped', 'delivered'] as OrderStatus[]).map(s => (
                        <button 
                          key={s} 
                          onClick={() => onUpdateOrderStatus(order.id, s)}
                          className={`w-full py-2.5 rounded-xl text-[8px] font-bold uppercase tracking-widest transition-all border ${order.status === s ? 'bg-[#2D5A27] text-white border-[#2D5A27]' : 'bg-white border-gray-100 text-gray-400 hover:border-[#2D5A27]/20'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'inventory' && (
          <div className="animate-fade-in space-y-12">
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-10 rounded-[3rem] border-4 border-dashed border-[#A4C639]/30 hover:bg-[#A4C639]/5 transition-all group flex flex-col items-center justify-center gap-4"
            >
              <div className="w-16 h-16 bg-[#2D5A27] text-white rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">+</div>
              <p className="font-bold serif text-[#2D5A27] text-xl">Add New Nature Item</p>
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-[3rem] border border-[#2D5A27]/5 relative group overflow-hidden">
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                    <button onClick={() => { setEditingProductId(p.id); setFormData({...p, price: p.price.toString(), imagePrompt: ''}); setIsAdding(true); }} className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-[#2D5A27] hover:scale-110">✎</button>
                    <button onClick={() => onDeleteProduct(p.id)} className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-red-500 hover:scale-110">✕</button>
                  </div>
                  <img src={p.image} className="w-full h-56 object-cover rounded-[2.5rem] mb-6" alt={p.name} />
                  <h3 className="text-xl font-bold serif text-[#4A3728] mb-1">{p.name}</h3>
                  <p className="text-[10px] font-black text-[#A4C639] uppercase tracking-widest mb-4">₹{p.price}</p>
                  <p className="text-xs text-gray-400 line-clamp-2 italic">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'payments' && (
          <div className="animate-fade-in space-y-8">
            <div className="bg-[#2D5A27] p-10 rounded-[3rem] text-white flex justify-between items-center shadow-xl">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A4C639] mb-2">Total Revenue Generated</p>
                 <h2 className="text-5xl font-bold serif">₹{totalRevenue.toLocaleString()}</h2>
               </div>
               <div className="text-right">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A4C639] mb-2">Successful Payments</p>
                 <h2 className="text-4xl font-bold serif">{orders.length}</h2>
               </div>
            </div>
            <div className="bg-white rounded-[3rem] border border-[#2D5A27]/5 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-[#FAF9F6] border-b">
                  <tr>
                    {['Transaction ID', 'Customer', 'Method', 'Date', 'Amount'].map(h => (
                      <th key={h} className="p-6 text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-6 text-[11px] font-bold text-[#4A3728]">{o.paymentId || 'PAY-REF-001'}</td>
                      <td className="p-6 text-[11px] font-medium text-gray-500">{o.customerEmail}</td>
                      <td className="p-6">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400">{o.paymentMethod || 'CARD'}</span>
                      </td>
                      <td className="p-6 text-[11px] text-gray-400">{o.date}</td>
                      <td className="p-6 text-[11px] font-black text-[#2D5A27]">₹{o.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {users.map(u => (
                <div key={u.id} className="bg-white p-8 rounded-[2.5rem] border border-[#2D5A27]/5 flex items-center gap-6 shadow-sm">
                  <div className="w-16 h-16 bg-[#FAF9F6] rounded-full flex items-center justify-center text-2xl border border-white shadow-inner">👤</div>
                  <div>
                    <h4 className="font-bold text-[#4A3728]">{u.name}</h4>
                    <p className="text-[10px] text-gray-400 font-medium mb-2">{u.email}</p>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-md ${u.role === 'admin' ? 'bg-[#2D5A27] text-white' : 'bg-[#A4C639] text-white'}`}>{u.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-[#2D5A27]/20 max-h-[90vh] overflow-y-auto">
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold serif text-[#4A3728]">{editingProductId ? 'Edit Nature Item' : 'New Nature Item'}</h2>
                <button onClick={closeModals} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">Name (EN)</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-[#FAF9F6] rounded-2xl outline-none font-bold text-sm" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">Name (TE)</label>
                    <input value={formData.name_te} onChange={e => setFormData({...formData, name_te: e.target.value})} className="w-full p-4 bg-[#FAF9F6] rounded-2xl outline-none font-bold text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">Price (₹)</label>
                    <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-4 bg-[#FAF9F6] rounded-2xl outline-none font-bold text-sm" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full p-4 bg-[#FAF9F6] rounded-2xl outline-none font-bold text-sm">
                      <option value="plates">Plates</option>
                      <option value="bowls">Bowls</option>
                      <option value="organic">Organic</option>
                    </select>
                  </div>
                </div>
                <div>
                   <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">Description (EN)</label>
                   <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-[#FAF9F6] rounded-2xl outline-none text-sm h-24" />
                </div>
                <div className="bg-[#FAF9F6] p-6 rounded-[2.5rem] border border-[#2D5A27]/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#A4C639] mb-4">Gemini AI Studio</p>
                   <div className="flex flex-col md:flex-row gap-6 items-center">
                     <div className="flex-1 w-full space-y-3">
                        <input value={formData.imagePrompt} onChange={e => setFormData({...formData, imagePrompt: e.target.value})} className="w-full p-4 bg-white rounded-xl text-xs outline-none" placeholder="Describe the product for AI..." />
                        <div className="flex gap-2">
                           <button type="button" onClick={handleMagicPrompt} disabled={isRefiningAI} className="flex-1 py-3 bg-white border border-[#2D5A27]/10 rounded-xl text-[8px] font-black uppercase tracking-widest">{isRefiningAI ? '...' : 'Magic Prompt'}</button>
                           <button type="button" onClick={handleGenerateImage} disabled={isGenerating} className="flex-1 py-3 bg-[#2D5A27] text-white rounded-xl text-[8px] font-black uppercase tracking-widest">{isGenerating ? 'Generating...' : 'Create Image'}</button>
                        </div>
                     </div>
                     <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-lg">
                        {formData.imageUrl && <img src={formData.imageUrl} className="w-full h-full object-cover" />}
                     </div>
                   </div>
                </div>
                <button type="submit" className="w-full py-5 bg-[#2D5A27] text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-xl hover:shadow-[#2D5A27]/30 transition-all">Save Changes</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
