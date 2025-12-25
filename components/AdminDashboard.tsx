
import React, { useState } from 'react';
import { Product, Order, OrderStatus } from '../types';
import { generateProductImage, refineImagePrompt } from '../services/geminiService';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, 
  orders, 
  onUpdateOrderStatus,
  onAddProduct,
  onDeleteProduct
}) => {
  const [tab, setTab] = useState<'orders' | 'inventory'>('orders');
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'plates' as Product['category'],
    description: '',
    imagePrompt: '',
    imageUrl: ''
  });

  // Comprehensive Inventory Statistics
  const totalProducts = products.length;
  const totalValue = products.reduce((acc, p) => acc + Number(p.price), 0);
  const categoryStats = products.reduce((acc: Record<string, { count: number, value: number }>, p) => {
    const cat = p.category || 'other';
    if (!acc[cat]) acc[cat] = { count: 0, value: 0 };
    acc[cat].count += 1;
    acc[cat].value += Number(p.price);
    return acc;
  }, {});

  const handleMagicPrompt = async () => {
    if (!formData.name.trim()) return;
    setIsRefining(true);
    const refined = await refineImagePrompt(formData.name);
    setFormData(prev => ({ ...prev, imagePrompt: refined }));
    setIsRefining(false);
  };

  const handleGenerateImage = async () => {
    if (!formData.imagePrompt.trim()) return;
    setIsGenerating(true);
    const url = await generateProductImage(formData.imagePrompt);
    if (url) {
      setFormData(prev => ({ ...prev, imageUrl: url }));
    }
    setIsGenerating(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) return alert("Please generate an image first.");
    
    const product: Product = {
      id: Date.now().toString(),
      name: formData.name,
      price: Number(formData.price),
      category: formData.category,
      description: formData.description,
      image: formData.imageUrl,
      benefits: ['Biodegradable', 'Chemical Free', 'Artisan Pressed']
    };
    
    onAddProduct(product);
    setIsAdding(false);
    setFormData({
      name: '',
      price: '',
      category: 'plates',
      description: '',
      imagePrompt: '',
      imageUrl: ''
    });
  };

  return (
    <div className="min-h-screen pt-12 pb-24 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A4C639] mb-4 block">LeafyLife Console</span>
            <h1 className="text-5xl font-bold serif text-[#4A3728]">Admin Dashboard</h1>
          </div>
          <div className="flex bg-white p-2 rounded-2xl border border-[#5D7C52]/10 shadow-sm">
            <button 
              onClick={() => setTab('orders')}
              className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${tab === 'orders' ? 'bg-[#5D7C52] text-white' : 'text-[#5D7C52]/40 hover:text-[#5D7C52]'}`}
            >
              Order Flow
            </button>
            <button 
              onClick={() => setTab('inventory')}
              className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${tab === 'inventory' ? 'bg-[#5D7C52] text-white' : 'text-[#5D7C52]/40 hover:text-[#5D7C52]'}`}
            >
              Inventory Control
            </button>
          </div>
        </header>

        {tab === 'orders' ? (
          <div className="space-y-10 animate-fade-in">
            {orders.length === 0 ? (
              <div className="glass-card p-20 text-center text-[#5D7C52]/40 serif italic text-xl">
                The order stream is currently still.
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="glass-card p-8 border-[#5D7C52]/5 hover:border-[#5D7C52]/20 transition-all bg-white shadow-sm hover:shadow-xl group">
                  <div className="flex flex-col xl:flex-row gap-10">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-8">
                        <span className="px-4 py-1.5 bg-[#A4C639]/10 text-[#5D7C52] text-[10px] font-black tracking-widest rounded-lg border border-[#A4C639]/20">ID: {order.id.split('-')[1]}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#5D7C52]/40 flex items-center gap-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {order.date}
                        </span>
                      </div>

                      <div className="relative overflow-hidden mb-10 bg-[#FAF9F6] rounded-[2rem] border border-[#5D7C52]/10 p-8 shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                          <div className="space-y-3">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A4C639]">Customer</span>
                            <h3 className="text-xl font-bold serif text-[#4A3728] break-all leading-tight">
                              {order.customerEmail}
                            </h3>
                          </div>
                          <div className="space-y-3">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A4C639]">Shipping To</span>
                            <p className="text-sm font-semibold text-[#5D7C52] leading-relaxed italic">
                              {order.shippingAddress}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center gap-4 bg-[#FAF9F6] p-3 pr-6 rounded-2xl border border-[#5D7C52]/5">
                            <img src={item.image} className="w-12 h-12 organic-shape object-cover border-2 border-white shadow-sm" alt={item.name} />
                            <div>
                              <p className="text-[10px] font-bold text-[#4A3728] leading-tight mb-1">{item.name}</p>
                              <span className="text-[9px] font-black text-[#A4C639] uppercase tracking-widest">x{item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="xl:w-80 border-t xl:border-t-0 xl:border-l border-[#5D7C52]/10 pt-10 xl:pt-0 xl:pl-10">
                        <div className="mb-10 p-6 bg-[#5D7C52]/5 rounded-[2rem] border border-[#5D7C52]/10 text-center">
                          <span className="text-[9px] font-black text-[#5D7C52]/40 block mb-2 uppercase tracking-[0.3em]">Total</span>
                          <span className="text-5xl font-bold text-[#5D7C52] serif">₹{order.total}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {(['pending', 'processing', 'shipped', 'delivered'] as OrderStatus[]).map(status => (
                            <button
                              key={status}
                              onClick={() => onUpdateOrderStatus(order.id, status)}
                              className={`px-3 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${
                                order.status === status 
                                  ? 'bg-[#5D7C52] text-white border-[#5D7C52] shadow-lg scale-105' 
                                  : 'bg-white border-[#5D7C52]/10 text-[#5D7C52]/40 hover:border-[#5D7C52]/40 hover:bg-[#FAF9F6]'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-16 animate-fade-in">
            {/* Inventory Summary Dashboard Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-3 glass-card p-10 bg-white border-[#5D7C52]/5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M17,8C8,10 5,16 5,16C5,16 7,20 15,20C23,20 25,14 25,14C25,14 24,8 17,8Z"/></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A4C639] block mb-4">Live Inventory</span>
                <span className="text-7xl font-bold serif text-[#4A3728] leading-none">{totalProducts}</span>
                <span className="block text-[10px] font-bold text-[#5D7C52] mt-4 uppercase tracking-widest italic opacity-60">Curated Artifacts</span>
              </div>

              <div className="md:col-span-4 glass-card p-10 bg-gradient-to-br from-[#5D7C52] to-[#4A3728] text-white border-none shadow-xl">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A4C639] block mb-4">Stock Value</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold serif opacity-60">₹</span>
                  <span className="text-6xl font-bold serif">{totalValue.toLocaleString()}</span>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Asset Valuation Breakdown</p>
                </div>
              </div>

              <div className="md:col-span-5 glass-card p-10 bg-white border-[#5D7C52]/5 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A4C639] block mb-6">Catalog Composition</span>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(categoryStats).map(([cat, stats]) => (
                    <div key={cat} className="flex items-center justify-between p-4 bg-[#FAF9F6] rounded-2xl border border-[#5D7C52]/5 group hover:bg-white hover:border-[#A4C639]/30 transition-all">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#4A3728] block mb-1 capitalize">{cat}</span>
                        <span className="text-[10px] font-bold text-[#A4C639] uppercase">₹{stats.value}</span>
                      </div>
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[11px] font-bold text-[#5D7C52] border border-[#5D7C52]/5">
                        {stats.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div 
                onClick={() => setIsAdding(true)}
                className="glass-card p-10 flex flex-col items-center justify-center border-2 border-dashed border-[#A4C639]/30 bg-white hover:bg-[#A4C639]/5 transition-all cursor-pointer group h-[450px]"
              >
                <div className="w-20 h-20 organic-shape bg-[#5D7C52] text-white flex items-center justify-center text-4xl font-bold mb-8 group-hover:scale-110 transition-transform shadow-lg">+</div>
                <h3 className="text-2xl font-bold serif text-[#4A3728]">Introduce Artifact</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mt-4">Draft Nature's Next Selection</p>
              </div>

              {products.map(product => (
                <div key={product.id} className="glass-card p-6 bg-white border-[#5D7C52]/5 relative group overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 h-[450px] flex flex-col">
                  <button onClick={() => onDeleteProduct(product.id)} className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white shadow-xl text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:scale-110 flex items-center justify-center text-xl">✕</button>
                  <div className="w-full h-56 mb-8 overflow-hidden organic-shape border-4 border-[#FAF9F6] shadow-inner relative">
                    <img src={product.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={product.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#4A3728]/20 to-transparent"></div>
                  </div>
                  <div className="flex-1 px-2">
                    <h4 className="text-xl font-bold serif text-[#4A3728] mb-2 leading-tight">{product.name}</h4>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#A4C639] bg-[#A4C639]/10 px-3 py-1 rounded-md mb-6 inline-block capitalize">{product.category}</span>
                    <p className="text-[10px] text-[#5D7C52]/60 italic line-clamp-2 leading-relaxed mb-6">{product.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-6 border-t border-[#5D7C52]/5 px-2">
                     <span className="text-2xl font-bold text-[#5D7C52] serif">₹{product.price}</span>
                     <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#A4C639]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#A4C639]/50"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#A4C639]/20"></div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#FAF9F6] w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-slide-up border border-[#5D7C52]/20 max-h-[95vh] overflow-y-auto">
            <div className="p-8 md:p-16">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-bold serif text-[#4A3728]">Manifest New Creation</h2>
                <button onClick={() => setIsAdding(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">✕</button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-3 ml-2">Artifact Identity</label>
                    <input required value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full p-5 bg-white border border-[#5D7C52]/10 rounded-2xl focus:ring-2 focus:ring-[#A4C639] outline-none transition-all font-bold text-[#4A3728]" placeholder="e.g. Lotus Edge Areca Plate" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-3 ml-2">Market Value (₹)</label>
                    <input required type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} className="w-full p-5 bg-white border border-[#5D7C52]/10 rounded-2xl focus:ring-2 focus:ring-[#A4C639] outline-none transition-all font-bold text-[#4A3728]" placeholder="299" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#A4C639] mb-4 ml-2">Artisan AI Studio</label>
                  <div className="space-y-6">
                    <div className="relative">
                      <input 
                        value={formData.imagePrompt}
                        onChange={(e) => setFormData(prev => ({ ...prev, imagePrompt: e.target.value }))}
                        className="w-full p-5 bg-white border border-[#5D7C52]/10 rounded-2xl focus:ring-2 focus:ring-[#A4C639] outline-none transition-all pr-16 font-medium text-sm" 
                        placeholder="Describe the e-commerce shot..." 
                      />
                      <button 
                        type="button" 
                        onClick={handleMagicPrompt}
                        disabled={isRefining || !formData.name}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#5D7C52] hover:bg-[#A4C639]/10 rounded-xl transition-all disabled:opacity-30"
                      >
                        {isRefining ? <div className="w-4 h-4 border-2 border-[#5D7C52] border-t-transparent rounded-full animate-spin"></div> : "✨"}
                      </button>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-8 items-center bg-white p-6 rounded-[2.5rem] border border-[#5D7C52]/5">
                      <div className="flex-1 w-full space-y-4">
                        <button 
                          type="button"
                          onClick={handleGenerateImage}
                          disabled={isGenerating || !formData.imagePrompt.trim()}
                          className="w-full py-5 px-6 bg-[#5D7C52] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#4A3728] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg"
                        >
                          {isGenerating ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Manifesting...</>
                          ) : 'Generate Professional Shot'}
                        </button>
                        <p className="text-[8px] text-[#5D7C52]/50 font-black uppercase tracking-widest leading-relaxed">
                          Gemini 2.5 Visual Engine • 4K Resolution • Artisan Textures
                        </p>
                      </div>
                      
                      <div className="w-48 h-48 organic-shape bg-[#FAF9F6] flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl relative group">
                        {formData.imageUrl ? (
                          <img src={formData.imageUrl} className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000" alt="Generated" />
                        ) : (
                          <div className="text-center">
                            <div className="text-4xl mb-2 opacity-10">🍃</div>
                            <span className="text-[9px] text-gray-300 font-black uppercase tracking-widest block">Studio View</span>
                          </div>
                        )}
                        {isGenerating && <div className="absolute inset-0 bg-[#5D7C52]/20 backdrop-blur-sm flex items-center justify-center">
                           <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={!formData.imageUrl}
                  className="w-full btn-leaf py-6 rounded-2xl font-black uppercase tracking-[0.3em] mt-8 shadow-2xl disabled:grayscale disabled:opacity-50"
                >
                  Confirm Artifact Creation
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
