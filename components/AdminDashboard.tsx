
import React, { useState, useMemo } from 'react';
import { Product, Order, OrderStatus, Language, User } from '../types';
import { generateProductImage, refineImagePrompt } from '../services/geminiService';
import { getUsers, updateOrderStatus } from '../services/database';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, trackingId?: string) => void;
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
  const [useLocalFolder, setUseLocalFolder] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '', name_te: '', price: '0', category: 'plates' as Product['category'],
    description: '', description_te: '', imagePrompt: '', imageUrl: ''
  });

  const [orderTrackingInput, setOrderTrackingInput] = useState<Record<string, string>>({});

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
    if (url) {
      setFormData(prev => ({ ...prev, imageUrl: url }));
      setUseLocalFolder(false); // Switch to URL mode if AI generates an image
    }
    setIsGenerating(false);
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalImage = formData.imageUrl;
    // If using local folder and just provided a filename, format it
    if (useLocalFolder && finalImage && !finalImage.startsWith('http') && !finalImage.startsWith('./') && !finalImage.startsWith('data:')) {
      finalImage = `./product-images/${finalImage}`;
    }

    const productData: Product = {
      id: editingProductId || `p-${Date.now()}`,
      name: formData.name,
      name_te: formData.name_te,
      price: Number(formData.price),
      category: formData.category,
      description: formData.description,
      description_te: formData.description_te,
      image: finalImage || './product-images/placeholder.jpg',
      benefits: ['100% Biodegradable', 'Handcrafted', 'Eco-safe']
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
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A4C639] mb-2 block">Enterprise Management</span>
            <h1 className="text-4xl font-bold serif text-[#4A3728]">Admin Control Center</h1>
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
              <div key={order.id} className="bg-white p-10 rounded-[3rem] border border-[#2D5A27]/5 shadow-sm hover:shadow-2xl transition-all">
                <div className="flex flex-col lg:flex-row justify-between gap-12">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-8">
                      <span className="bg-[#A4C639]/10 text-[#2D5A27] text-[10px] font-black px-5 py-2 rounded-xl">ORD: #{order.id.slice(-8)}</span>
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{order.date}</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-md ${order.status === 'delivered' ? 'bg-[#A4C639]' : 'bg-[#2D5A27]'} text-white`}>{order.status}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                      <div>
                        <p className="text-[9px] font-black text-[#A4C639] uppercase tracking-widest mb-2">Customer Details</p>
                        <p className="font-bold text-[#4A3728] text-lg">{order.customerEmail}</p>
                        <p className="text-sm text-gray-400 mt-2 leading-relaxed">{order.shippingAddress}</p>
                      </div>
                      <div className="space-y-4">
                        <p className="text-[9px] font-black text-[#A4C639] uppercase tracking-widest mb-2">Tracking Management</p>
                        <input 
                          type="text" 
                          placeholder="Assign Tracking ID (e.g. DT-12345)" 
                          value={orderTrackingInput[order.id] || order.trackingId || ''}
                          onChange={(e) => setOrderTrackingInput({...orderTrackingInput, [order.id]: e.target.value})}
                          className="w-full p-4 bg-[#FAF9F6] border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#A4C639]"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-[#A4C639] uppercase tracking-widest mb-4">Items Purchased</p>
                      <div className="flex flex-wrap gap-4">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100">
                            <img src={item.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                            <div>
                               <p className="text-xs font-bold text-[#4A3728]">{item.name}</p>
                               <p className="text-[10px] font-black text-[#A4C639]">x{item.quantity} • ₹{item.price * item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-72 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-10 lg:pt-0 lg:pl-10">
                    <p className="text-[10px] font-black text-[#2D5A27]/30 uppercase tracking-[0.2em] mb-4">Set Dispatch Phase</p>
                    {(['pending', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'] as OrderStatus[]).map(s => (
                      <button 
                        key={s} 
                        onClick={() => onUpdateOrderStatus(order.id, s, orderTrackingInput[order.id])}
                        className={`w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${order.status === s ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-[#2D5A27]/20'}`}
                      >
                        {s.replace(/-/g, ' ')}
                      </button>
                    ))}
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
              className="w-full py-16 rounded-[4rem] border-4 border-dashed border-[#A4C639]/30 hover:bg-[#A4C639]/5 transition-all group flex flex-col items-center justify-center gap-6"
            >
              <div className="w-20 h-20 bg-[#2D5A27] text-white rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-xl">+</div>
              <p className="font-bold serif text-[#2D5A27] text-2xl">Create New Harvest Item</p>
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {products.map(p => (
                <div key={p.id} className="bg-white p-8 rounded-[3.5rem] border border-[#2D5A27]/5 relative group overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
                  <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-all z-20">
                    <button onClick={() => { setEditingProductId(p.id); setFormData({...p, price: p.price.toString(), imagePrompt: '', imageUrl: p.image}); setIsAdding(true); }} className="w-12 h-12 bg-white rounded-xl shadow-xl flex items-center justify-center text-[#2D5A27] hover:scale-110">✎</button>
                    <button onClick={() => onDeleteProduct(p.id)} className="w-12 h-12 bg-white rounded-xl shadow-xl flex items-center justify-center text-red-500 hover:scale-110">✕</button>
                  </div>
                  <div className="h-64 rounded-[2.5rem] overflow-hidden mb-8">
                     <img src={p.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.name} />
                  </div>
                  <h3 className="text-2xl font-bold serif text-[#4A3728] mb-2">{p.name}</h3>
                  <p className="text-[12px] font-black text-[#A4C639] uppercase tracking-[0.2em] mb-4">Price: ₹{p.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'payments' && (
          <div className="animate-fade-in space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-[#2D5A27] p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 transform scale-150 rotate-12">💰</div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-4 relative z-10">Gross Ecosystem Revenue</p>
                    <h2 className="text-6xl font-bold serif relative z-10">₹{totalRevenue.toLocaleString()}</h2>
                </div>
                <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#2D5A27]/40 mb-4">Active Transactions</p>
                    <h2 className="text-5xl font-bold serif text-[#4A3728]">{orders.length} <span className="text-lg font-sans text-gray-300 ml-4 italic">Settled Successfully</span></h2>
                </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="animate-fade-in space-y-10">
            <h2 className="text-3xl font-bold serif text-[#4A3728]">Registry of Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {users.map(u => (
                <div key={u.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all">
                  <div className="w-20 h-20 bg-[#FAF9F6] rounded-full flex items-center justify-center text-3xl mb-6 shadow-inner border-2 border-white">👤</div>
                  <h4 className="font-bold text-[#4A3728] text-lg mb-1">{u.name}</h4>
                  <p className="text-[10px] text-gray-300 font-medium mb-6 truncate w-full">{u.email}</p>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg ${u.role === 'admin' ? 'bg-[#2D5A27] text-white' : 'bg-[#A4C639] text-white'}`}>{u.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-[4rem] shadow-2xl border border-[#2D5A27]/20 max-h-[90vh] overflow-y-auto">
            <div className="p-12 md:p-16">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-bold serif text-[#4A3728]">{editingProductId ? 'Refine Harvest Item' : 'New Harvest Discovery'}</h2>
                <button onClick={closeModals} className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">✕</button>
              </div>
              <form onSubmit={handleSubmitProduct} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-3 ml-2">Market Name (EN)</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-6 bg-[#FAF9F6] rounded-[2rem] outline-none font-bold text-sm border border-transparent focus:border-[#A4C639]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-3 ml-2">Telugu Identity (TE)</label>
                    <input value={formData.name_te} onChange={e => setFormData({...formData, name_te: e.target.value})} className="w-full p-6 bg-[#FAF9F6] rounded-[2rem] outline-none font-bold text-sm border border-transparent focus:border-[#A4C639]" />
                  </div>
                </div>
                
                <div className="flex gap-4 p-2 bg-[#FAF9F6] rounded-2xl">
                   <button 
                    type="button" 
                    onClick={() => setUseLocalFolder(true)} 
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${useLocalFolder ? 'bg-[#2D5A27] text-white shadow-lg' : 'text-[#2D5A27]/40'}`}
                   >
                     Local Folder (./product-images/)
                   </button>
                   <button 
                    type="button" 
                    onClick={() => setUseLocalFolder(false)} 
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!useLocalFolder ? 'bg-[#2D5A27] text-white shadow-lg' : 'text-[#2D5A27]/40'}`}
                   >
                     Direct Web Link
                   </button>
                </div>

                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-3 ml-2">
                     {useLocalFolder ? "Image Filename (e.g. leaf-plate.jpg)" : "Full Image URL"}
                   </label>
                   <input 
                    required 
                    value={formData.imageUrl} 
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                    placeholder={useLocalFolder ? "e.g. item1.png" : "https://example.com/image.jpg"}
                    className="w-full p-6 bg-[#FAF9F6] rounded-[2rem] outline-none font-bold text-sm border border-transparent focus:border-[#A4C639]" 
                   />
                   {useLocalFolder && <p className="mt-2 text-[9px] text-[#A4C639] font-bold px-4">Place this image in your 'product-images' folder.</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-3 ml-2">Price Value (₹)</label>
                    <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-6 bg-[#FAF9F6] rounded-[2rem] outline-none font-bold text-sm border border-transparent focus:border-[#A4C639]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-3 ml-2">Classification</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full p-6 bg-[#FAF9F6] rounded-[2rem] outline-none font-bold text-sm border border-transparent focus:border-[#A4C639]">
                      <option value="plates">Areca Plates</option>
                      <option value="bowls">Areca Bowls</option>
                      <option value="organic">Organic Harvest</option>
                      <option value="earthenware">Earthenware</option>
                    </select>
                  </div>
                </div>

                <div className="bg-[#FAF9F6] p-10 rounded-[4rem] border border-[#2D5A27]/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#A4C639] mb-6">Visual Intelligence (Gemini AI)</p>
                   <div className="flex flex-col md:flex-row gap-10 items-center">
                     <div className="flex-1 w-full space-y-4">
                        <input value={formData.imagePrompt} onChange={e => setFormData({...formData, imagePrompt: e.target.value})} className="w-full p-6 bg-white rounded-2xl text-xs outline-none border border-gray-100" placeholder="Describe the organic aesthetic..." />
                        <div className="flex gap-4">
                           <button type="button" onClick={handleMagicPrompt} disabled={isRefiningAI} className="flex-1 py-4 bg-white border border-[#2D5A27]/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-[#FAF9F6] transition-all">{isRefiningAI ? 'Refining...' : 'Refine Prompt'}</button>
                           <button type="button" onClick={handleGenerateImage} disabled={isGenerating} className="flex-1 py-4 bg-[#2D5A27] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl">{isGenerating ? 'Synthesizing...' : 'Generate Art'}</button>
                        </div>
                     </div>
                   </div>
                </div>
                <button type="submit" className="w-full py-7 bg-[#2D5A27] text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:shadow-[#2D5A27]/30 transition-all transform active:scale-95">Commit to Inventory</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
