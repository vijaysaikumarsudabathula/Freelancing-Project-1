
import React, { useState, useRef } from 'react';
import { Product, Order, OrderStatus } from '../types';
import { generateProductImage, refineImagePrompt } from '../services/geminiService';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, 
  orders, 
  onUpdateOrderStatus,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}) => {
  const [tab, setTab] = useState<'orders' | 'inventory'>('orders');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [inlinePriceEditId, setInlinePriceEditId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefiningAI, setIsRefiningAI] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'plates' as Product['category'],
    description: '',
    imagePrompt: '',
    imageUrl: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalProducts = products.length;
  const totalValue = products.reduce((acc, p) => acc + Number(p.price), 0);
  
  const categoryStats = products.reduce((acc, p) => {
    const cat = p.category || 'other';
    if (!acc[cat]) acc[cat] = { count: 0, value: 0 };
    acc[cat].count += 1;
    acc[cat].value += Number(p.price);
    return acc;
  }, {} as Record<string, { count: number, value: number }>);

  const openEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      imagePrompt: '',
      imageUrl: product.image
    });
    setIsAdding(true);
  };

  const startInlinePriceEdit = (product: Product) => {
    setInlinePriceEditId(product.id);
    setTempPrice(product.price.toString());
  };

  const saveInlinePrice = (product: Product) => {
    const newPrice = Number(tempPrice);
    if (!isNaN(newPrice) && newPrice >= 0) {
      onUpdateProduct({ ...product, price: newPrice });
    }
    setInlinePriceEditId(null);
  };

  const closeModals = () => {
    setIsAdding(false);
    setEditingProductId(null);
    setFormData({ name: '', price: '', category: 'plates', description: '', imagePrompt: '', imageUrl: '' });
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
    }
    setIsGenerating(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) return alert("Please provide an image.");
    
    const productData: Product = {
      id: editingProductId || Date.now().toString(),
      name: formData.name,
      price: Number(formData.price),
      category: formData.category,
      description: formData.description,
      image: formData.imageUrl,
      benefits: ['Biodegradable', 'Chemical Free', 'Artisan Pressed']
    };
    
    if (editingProductId) {
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }
    
    closeModals();
  };

  return (
    <div className="min-h-screen pt-12 pb-24 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A4C639] block">LeafyLife Console</span>
              <span className="px-2 py-0.5 bg-[#5D7C52]/10 rounded-md text-[8px] font-black text-[#5D7C52] border border-[#5D7C52]/10">SQLITE 3.0</span>
            </div>
            <h1 className="text-5xl font-bold serif text-[#4A3728]">Admin Dashboard</h1>
          </div>
          <div className="flex bg-white p-2 rounded-2xl border border-[#5D7C52]/10 shadow-sm">
            <button onClick={() => setTab('orders')} className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${tab === 'orders' ? 'bg-[#5D7C52] text-white' : 'text-[#5D7C52]/40 hover:text-[#5D7C52]'}`}>Order Flow</button>
            <button onClick={() => setTab('inventory')} className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${tab === 'inventory' ? 'bg-[#5D7C52] text-white' : 'text-[#5D7C52]/40 hover:text-[#5D7C52]'}`}>Inventory Control</button>
          </div>
        </header>

        {tab === 'orders' ? (
          <div className="space-y-10 animate-fade-in">
            {orders.length === 0 ? (
              <div className="glass-card p-20 text-center text-[#5D7C52]/40 serif italic text-xl">The order stream is currently still.</div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="glass-card p-8 border-[#5D7C52]/5 bg-white shadow-sm overflow-hidden group">
                  <div className="flex flex-col xl:flex-row gap-10">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-8">
                        <span className="px-4 py-1.5 bg-[#A4C639]/10 text-[#5D7C52] text-[10px] font-black tracking-widest rounded-lg">ID: {order.id.split('-')[1]}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#5D7C52]/40">{order.date}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-[#FAF9F6] p-8 rounded-[2rem] border border-[#5D7C52]/10 mb-8">
                        <div>
                          <span className="text-[9px] font-black uppercase text-[#A4C639] mb-2 block">Customer</span>
                          <h3 className="text-xl font-bold serif text-[#4A3728] break-all">{order.customerEmail}</h3>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase text-[#A4C639] mb-2 block">Shipping To</span>
                          <p className="text-sm font-semibold text-[#5D7C52] italic leading-relaxed">{order.shippingAddress}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center gap-4 bg-[#FAF9F6] p-3 rounded-2xl border border-[#5D7C52]/5">
                            <img src={item.image} className="w-12 h-12 organic-shape object-cover border-2 border-white" alt={item.name} />
                            <div><p className="text-[10px] font-bold text-[#4A3728]">{item.name}</p><span className="text-[9px] font-black text-[#A4C639]">x{item.quantity}</span></div>
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
                          <button key={status} onClick={() => onUpdateOrderStatus(order.id, status)} className={`px-3 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${order.status === status ? 'bg-[#5D7C52] text-white border-[#5D7C52] shadow-lg' : 'bg-white border-[#5D7C52]/10 text-[#5D7C52]/40 hover:bg-[#FAF9F6]'}`}>{status}</button>
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
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
              <div className="md:col-span-3 glass-card p-10 bg-white border-[#5D7C52]/5 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  <svg className="w-32 h-32 text-[#5D7C52]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A4C639] block mb-4">Unique Artifacts</span>
                <span className="text-7xl font-bold serif text-[#4A3728] leading-none">{totalProducts}</span>
                <span className="block text-[10px] font-bold text-[#5D7C52] mt-4 uppercase tracking-widest italic opacity-60">SQL Indexed</span>
              </div>

              <div className="md:col-span-4 glass-card p-10 bg-[#5D7C52] text-white border-none shadow-xl relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                  <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                  </svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A4C639] block mb-4">Stock Valuation</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold serif opacity-60">₹</span>
                  <span className="text-6xl font-bold serif">{totalValue.toLocaleString()}</span>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10">
                   <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Assets monitored live</p>
                </div>
              </div>

              <div className="md:col-span-5 glass-card p-10 bg-white border-[#5D7C52]/5 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A4C639] block mb-6">Category Composition</span>
                <div className="grid grid-cols-2 gap-4">
                  {(Object.entries(categoryStats) as [string, { count: number, value: number }][]).map(([cat, stats]) => (
                    <div key={cat} className="flex items-center justify-between p-4 bg-[#FAF9F6] rounded-2xl border border-[#5D7C52]/5 hover:bg-white hover:border-[#A4C639]/30 transition-all">
                      <div>
                        <span className="text-[9px] font-black uppercase text-[#4A3728] block mb-1 capitalize">{cat}</span>
                        <span className="text-[10px] font-bold text-[#A4C639]">₹{stats.value.toLocaleString()}</span>
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
              <div onClick={() => setIsAdding(true)} className="glass-card p-10 flex flex-col items-center justify-center border-2 border-dashed border-[#A4C639]/30 bg-white hover:bg-[#A4C639]/5 transition-all cursor-pointer h-[480px] group">
                <div className="w-20 h-20 organic-shape bg-[#5D7C52] text-white flex items-center justify-center text-4xl font-bold mb-8 group-hover:scale-110 transition-transform shadow-lg">+</div>
                <h3 className="text-2xl font-bold serif text-[#4A3728]">Introduce Artifact</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mt-4">Draft Nature's Next Creation</p>
              </div>

              {products.map(product => (
                <div key={product.id} className="glass-card p-6 bg-white border-[#5D7C52]/5 relative group overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 h-[480px] flex flex-col">
                  <div className="absolute top-6 right-6 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => openEditModal(product)} className="w-10 h-10 rounded-full bg-white shadow-xl text-[#5D7C52] hover:bg-[#FAF9F6] flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button onClick={() => onDeleteProduct(product.id)} className="w-10 h-10 rounded-full bg-white shadow-xl text-red-400 hover:bg-red-50 flex items-center justify-center">✕</button>
                  </div>
                  <div className="w-full h-56 mb-8 overflow-hidden organic-shape border-4 border-[#FAF9F6] shadow-inner">
                    <img src={product.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={product.name} />
                  </div>
                  <div className="flex-1 px-2">
                    <h4 className="text-xl font-bold serif text-[#4A3728] mb-2 leading-tight">{product.name}</h4>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#A4C639] bg-[#A4C639]/10 px-3 py-1 rounded-md mb-6 inline-block capitalize">{product.category}</span>
                    <p className="text-[10px] text-[#5D7C52]/60 italic line-clamp-2 leading-relaxed mb-6">{product.description}</p>
                  </div>
                  
                  {/* Enhanced Inline Price Editor */}
                  <div className="flex justify-between items-center mt-auto pt-6 border-t border-[#5D7C52]/5 px-2">
                    <div className="flex-1">
                      {inlinePriceEditId === product.id ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#5D7C52]/40">₹</span>
                            <input 
                              autoFocus
                              type="number" 
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveInlinePrice(product);
                                if (e.key === 'Escape') setInlinePriceEditId(null);
                              }}
                              className="w-24 pl-6 pr-2 py-1 bg-[#FAF9F6] border-2 border-[#A4C639] rounded-lg text-sm font-bold text-[#5D7C52] outline-none"
                            />
                          </div>
                          <button onClick={() => saveInlinePrice(product)} className="w-8 h-8 rounded-lg bg-[#5D7C52] text-white flex items-center justify-center hover:bg-[#4A3728] transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          </button>
                          <button onClick={() => setInlinePriceEditId(null)} className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => startInlinePriceEdit(product)}
                          className="group/price flex items-center gap-2 hover:bg-[#FAF9F6] px-2 py-1 rounded-lg transition-all"
                        >
                          <span className="text-2xl font-bold text-[#5D7C52] serif">₹{product.price}</span>
                          <svg className="w-3 h-3 text-[#A4C639] opacity-0 group-hover/price:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#A4C639]"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#A4C639]/50"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FAF9F6] w-full max-w-2xl rounded-[3rem] shadow-2xl animate-slide-up border border-[#5D7C52]/20 max-h-[95vh] overflow-y-auto">
            <div className="p-8 md:p-16">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-bold serif text-[#4A3728]">{editingProductId ? 'Refine Artifact' : 'Manifest Creation'}</h2>
                <button onClick={closeModals} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#5D7C52]/40 mb-3">Artifact Identity</label>
                    <input required value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full p-5 bg-white border border-[#5D7C52]/10 rounded-2xl outline-none font-bold text-[#4A3728]" placeholder="Name" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#5D7C52]/40 mb-3">Market Value (₹)</label>
                    <input required type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} className="w-full p-5 bg-white border border-[#5D7C52]/10 rounded-2xl outline-none font-bold text-[#4A3728]" placeholder="299" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-[#A4C639] mb-4">Imaging Studio</label>
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                       <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 py-5 px-6 border-2 border-dashed border-[#5D7C52]/20 rounded-2xl font-black text-[10px] uppercase tracking-widest text-[#5D7C52] hover:bg-white transition-all flex items-center justify-center gap-3">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         Upload from Device
                       </button>
                       <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                       
                       <div className="flex-1 relative">
                          <input value={formData.imagePrompt} onChange={(e) => setFormData(prev => ({ ...prev, imagePrompt: e.target.value }))} className="w-full p-5 bg-white border border-[#5D7C52]/10 rounded-2xl outline-none text-sm pr-12" placeholder="AI Image Prompt..." />
                          <button type="button" onClick={handleMagicPrompt} disabled={isRefiningAI} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D7C52]">{isRefiningAI ? '...' : '✨'}</button>
                       </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center bg-white p-6 rounded-[2.5rem] border border-[#5D7C52]/5">
                      <div className="flex-1 w-full space-y-4">
                        <button type="button" onClick={handleGenerateImage} disabled={isGenerating || !formData.imagePrompt.trim()} className="w-full py-5 bg-[#5D7C52] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                          {isGenerating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Generate Professional Shot'}
                        </button>
                      </div>
                      <div className="w-48 h-48 organic-shape bg-[#FAF9F6] flex items-center justify-center overflow-hidden border-4 border-white shadow-xl relative">
                        {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Artifact" /> : <span className="text-[9px] text-gray-300 font-black uppercase">Studio View</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full btn-leaf py-6 rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl">
                  {editingProductId ? 'Confirm Refinement' : 'Confirm Creation'}
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
