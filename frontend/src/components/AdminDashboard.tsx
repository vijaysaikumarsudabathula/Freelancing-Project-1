
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Order, OrderStatus, Language, User } from '../types';
import { resolveProductImage } from '../services/imageHelper';
import { generateProductImage, refineImagePrompt } from '../services/geminiService';
import { getUsersAsync, updateUserAsync } from '../services/database';
import CustomerManagement from './CustomerManagement';
import DBSetup from './DBSetup';
import PaymentSettings from './PaymentSettings';

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
  const [tab, setTab] = useState<'orders' | 'inventory' | 'payments' | 'users' | 'bulk-requests'>('orders');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefiningAI, setIsRefiningAI] = useState(false);
  const [useLocalFolder, setUseLocalFolder] = useState(true);
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', name_te: '', price: '0', category: 'plates' as Product['category'],
    description: '', description_te: '', imagePrompt: '', imageUrl: ''
  });
  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [orderTrackingInput, setOrderTrackingInput] = useState<Record<string, string>>({});
  const [showCustomerManager, setShowCustomerManager] = useState(false);
  const [showDBSetup, setShowDBSetup] = useState(false);

  const [bulkRequests, setBulkRequests] = useState<any[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Load users from API on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setUsersLoading(true);
        const users = await getUsersAsync();
        setUsersList(users);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setUsersLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Load bulk requests when tab changes to bulk-requests
  useEffect(() => {
    if (tab === 'bulk-requests') {
      const fetchBulkRequests = async () => {
        try {
          setBulkLoading(true);
          const response = await fetch(`/api/bulk-requests`);
          if (response.ok) {
            const data = await response.json();
            setBulkRequests(data);
          }
        } catch (error) {
          console.error('Error fetching bulk requests:', error);
        } finally {
          setBulkLoading(false);
        }
      };
      fetchBulkRequests();
    }
  }, [tab]);

  const users = usersList;
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
    // If using local folder and just provided a filename, format it to /images (public)
    if (useLocalFolder && finalImage && !finalImage.startsWith('http') && !finalImage.startsWith('/') && !finalImage.startsWith('data:')) {
      finalImage = `/images/${finalImage}`;
    }

    const productData: Product = {
      id: editingProductId || `p-${Date.now()}`,
      name: formData.name,
      name_te: formData.name_te,
      price: Number(formData.price),
      category: formData.category,
      description: formData.description,
      description_te: formData.description_te,
      image: finalImage || '/images/deepthi-logo.png',
      benefits: ['100% Biodegradable', 'Handcrafted', 'Eco-safe']
    };

    if (editingProductId) onUpdateProduct(productData);
    else onAddProduct(productData);
    closeModals();
  };

  const refreshUsers = async () => {
    try {
      const users = await getUsersAsync();
      setUsersList(users);
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  };

  const handleUploadFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setFormData(prev => ({ ...prev, imageUrl: data }));
      setUseLocalFolder(false);
    };
    reader.readAsDataURL(file);
  };

  const changeUserRole = (u: User, newRole: User['role']) => {
    updateUserAsync(u.id, { role: newRole });
    refreshUsers();
  };

  return (
    <div className="min-h-screen pt-4 sm:pt-6 md:pt-12 pb-16 sm:pb-20 md:pb-24 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8">
        <header className="mb-6 sm:mb-8 md:mb-12 flex flex-col gap-4 sm:gap-6 md:gap-8">
          <div>
            <span className="text-[7px] md:text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-[#A4C639] mb-2 block">Enterprise Management</span>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold serif text-[#4A3728]">Admin Control Center</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 bg-white p-1 md:p-1.5 rounded-lg md:rounded-2xl border border-[#2D5A27]/10 shadow-sm overflow-x-auto">
            {['orders', 'inventory', 'payments', 'users', 'bulk-requests'].map((t) => (
              <button 
                key={t}
                onClick={() => setTab(t as any)} 
                className={`px-2 sm:px-4 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-xl text-[6px] sm:text-[8px] md:text-[9px] lg:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${tab === t ? 'bg-[#2D5A27] text-white shadow-md' : 'text-[#2D5A27]/40 hover:text-[#2D5A27]'}`}
              >
                {t === 'bulk-requests' ? '📋 Bulk' : t}
              </button>
            ))}
            <button onClick={() => setShowPaymentSettings(true)} className="ml-1 sm:ml-2 md:ml-4 px-1.5 sm:px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[6px] sm:text-[7px] md:text-[9px] font-bold uppercase tracking-widest bg-[#A4C639]/10 border border-[#A4C639]/30 text-[#2D5A27] hover:bg-[#A4C639]/20 transition-all whitespace-nowrap flex-shrink-0">💳 Setup</button>
            <button onClick={() => setShowCustomerManager(true)} className="ml-0.5 sm:ml-2 md:ml-4 px-1.5 sm:px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[6px] sm:text-[7px] md:text-[9px] font-bold uppercase tracking-widest bg-white border border-[#2D5A27]/10 text-[#2D5A27] hover:bg-[#FAF9F6] whitespace-nowrap flex-shrink-0">Mgmt</button>
            <button onClick={() => setShowDBSetup(true)} className="ml-0.5 sm:ml-2 md:ml-4 px-1.5 sm:px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[6px] sm:text-[7px] md:text-[9px] font-bold uppercase tracking-widest bg-white border border-[#2D5A27]/10 text-[#2D5A27] hover:bg-[#FAF9F6] whitespace-nowrap flex-shrink-0">Setup</button>
          </div>
        </header>

        {tab === 'orders' && (
          <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-3 sm:p-4 md:p-6 lg:p-10 rounded-lg sm:rounded-xl md:rounded-[3rem] border border-[#2D5A27]/5 shadow-sm hover:shadow-2xl transition-all">
                <div className="flex flex-col lg:flex-row justify-between gap-4 sm:gap-6 md:gap-12">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
                      <span className="bg-[#A4C639]/10 text-[#2D5A27] text-[7px] sm:text-[8px] md:text-[10px] font-black px-2 sm:px-3 md:px-5 py-0.5 md:py-2 rounded-lg md:rounded-xl whitespace-nowrap">ORD: #{order.id.slice(-8)}</span>
                      <span className="text-[7px] sm:text-[8px] md:text-[10px] font-bold text-gray-300 uppercase tracking-widest whitespace-nowrap">{order.date}</span>
                      <span className={`text-[6px] sm:text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 md:px-3 py-0.5 md:py-1 rounded-md ${order.status === 'delivered' ? 'bg-[#A4C639]' : 'bg-[#2D5A27]'} text-white whitespace-nowrap`}>{order.status}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-10 mb-4 sm:mb-6 md:mb-10">
                      <div>
                        <p className="text-[6px] sm:text-[7px] md:text-[9px] font-black text-[#A4C639] uppercase tracking-widest mb-1 md:mb-2">Customer Details</p>
                        <p className="font-bold text-[#4A3728] text-xs sm:text-sm md:text-lg break-all">{order.customerEmail}</p>
                        <p className="text-[9px] sm:text-[10px] md:text-sm text-gray-400 mt-1 md:mt-2 leading-relaxed">{order.shippingAddress}</p>
                      </div>
                      <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <p className="text-[6px] sm:text-[7px] md:text-[9px] font-black text-[#A4C639] uppercase tracking-widest mb-1 md:mb-2">Tracking ID</p>
                        <input 
                          type="text" 
                          placeholder="e.g. DT-12345" 
                          value={orderTrackingInput[order.id] || order.trackingId || ''}
                          onChange={(e) => setOrderTrackingInput({...orderTrackingInput, [order.id]: e.target.value})}
                          className="w-full p-2 sm:p-3 md:p-4 bg-[#FAF9F6] border border-gray-100 rounded-lg md:rounded-xl text-[7px] sm:text-[8px] md:text-xs outline-none focus:ring-2 focus:ring-[#A4C639]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:space-y-3">
                      <p className="text-[6px] sm:text-[7px] md:text-[9px] font-black text-[#A4C639] uppercase tracking-widest mb-2 md:mb-4">Items</p>
                      <div className="flex flex-wrap gap-1 md:gap-2 lg:gap-4">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center gap-1 md:gap-2 lg:gap-4 bg-[#FAF9F6] p-1.5 md:p-3 lg:p-4 rounded-lg md:rounded-2xl border border-gray-100 text-[7px] sm:text-[8px] md:text-xs">
                            <img src={resolveProductImage(item.image, item.id)} className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 rounded-lg md:rounded-xl object-cover" alt="" onError={(e) => { const t = e.currentTarget as HTMLImageElement; console.warn('Image load failed:', t.src); t.src = '/images/deepthi-logo.png'; }} />
                            <div>
                               <p className="font-bold text-[#4A3728]">{item.name}</p>
                               <p className="font-black text-[#A4C639]">x{item.quantity} • ₹{item.price * item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-72 flex flex-col gap-1 md:gap-2 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-8">
                    <p className="text-[6px] sm:text-[7px] md:text-[9px] font-black text-[#2D5A27]/30 uppercase tracking-widest mb-2 md:mb-3 whitespace-nowrap">Set Status</p>
                    {(['pending', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'] as OrderStatus[]).map(s => (
                      <button 
                        key={s} 
                        onClick={() => onUpdateOrderStatus(order.id, s, orderTrackingInput[order.id])}
                        className={`w-full py-1.5 md:py-3 lg:py-4 rounded-lg md:rounded-2xl text-[6px] sm:text-[7px] md:text-[9px] font-black uppercase tracking-widest transition-all border text-center ${order.status === s ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-[#2D5A27]/20'}`}
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
          <div className="animate-fade-in space-y-6 md:space-y-8 lg:space-y-12">
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-6 md:py-10 lg:py-16 rounded-xl md:rounded-[3rem] lg:rounded-[4rem] border-2 md:border-4 border-dashed border-[#A4C639]/30 hover:bg-[#A4C639]/5 transition-all group flex flex-col items-center justify-center gap-2 md:gap-4 lg:gap-6"
            >
              <div className="w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 bg-[#2D5A27] text-white rounded-full flex items-center justify-center text-lg md:text-3xl lg:text-4xl group-hover:scale-110 transition-transform shadow-xl">+</div>
              <p className="font-bold serif text-[#2D5A27] text-sm sm:text-base md:text-lg lg:text-2xl text-center px-2">Create New Item</p>
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-8">
              {products.map(p => (
                <div key={p.id} className="bg-white p-3 md:p-4 lg:p-8 rounded-xl md:rounded-[2rem] lg:rounded-[3.5rem] border border-[#2D5A27]/5 relative group overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
                  <div className="absolute top-3 md:top-6 lg:top-8 right-3 md:right-6 lg:right-8 flex gap-1 md:gap-2 lg:gap-3 opacity-0 group-hover:opacity-100 transition-all z-20">
                    <button onClick={() => { setEditingProductId(p.id); setFormData({...p, price: p.price.toString(), imagePrompt: '', imageUrl: p.image}); setIsAdding(true); }} className="w-7 md:w-10 lg:w-12 h-7 md:h-10 lg:h-12 bg-white rounded-lg md:rounded-xl shadow-xl flex items-center justify-center text-[#2D5A27] hover:scale-110 text-xs md:text-sm lg:text-base">✎</button>
                    <button onClick={() => onDeleteProduct(p.id)} className="w-7 md:w-10 lg:w-12 h-7 md:h-10 lg:h-12 bg-white rounded-lg md:rounded-xl shadow-xl flex items-center justify-center text-red-500 hover:scale-110 text-xs md:text-sm lg:text-base">✕</button>
                  </div>
                  <div className="h-32 sm:h-48 md:h-56 lg:h-64 rounded-lg md:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden mb-3 md:mb-6 lg:mb-8">
                     <img src={resolveProductImage(p.image, p.id)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.name} onError={(e) => { const t = e.currentTarget as HTMLImageElement; console.warn('Image load failed:', t.src); t.src = '/images/deepthi-logo.png'; }} />
                  </div>
                  <h3 className="text-sm md:text-lg lg:text-2xl font-bold serif text-[#4A3728] mb-1 md:mb-2">{p.name}</h3>
                  <p className="text-[8px] md:text-[10px] lg:text-[12px] font-black text-[#A4C639] uppercase tracking-[0.2em]">₹{p.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'payments' && (
          <div className="animate-fade-in space-y-8 md:space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
                <div className="bg-[#2D5A27] p-4 sm:p-8 md:p-12 rounded-lg md:rounded-[2rem] lg:rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 sm:p-10 md:p-12 opacity-5 transform scale-150 rotate-12">💰</div>
                    <p className="text-[6px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-2 md:mb-3 lg:mb-4 relative z-10">Revenue</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold serif relative z-10">₹{totalRevenue.toLocaleString()}</h2>
                </div>
                <div className="bg-white p-4 sm:p-8 md:p-12 rounded-lg md:rounded-[2rem] lg:rounded-[3.5rem] border border-gray-100 flex flex-col justify-center">
                    <p className="text-[6px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] text-[#2D5A27]/40 mb-2 md:mb-3 lg:mb-4">Transactions</p>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold serif text-[#4A3728]">{orders.length} <span className="text-xs sm:text-sm md:text-base lg:text-lg font-sans text-gray-300 ml-2 md:ml-3 lg:ml-4 italic">Settled</span></h2>
                </div>
            </div>

            {/* Payment Settings Button */}
            <div className="mt-6 md:mt-8 lg:mt-10">
              <button 
                onClick={() => setShowPaymentSettings(true)}
                className="w-full py-4 sm:py-6 md:py-8 lg:py-10 bg-gradient-to-r from-[#A4C639] to-[#96b830] text-[#2D5A27] rounded-lg md:rounded-[2rem] lg:rounded-[3rem] font-black text-xs sm:text-sm md:text-base lg:text-lg uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6"
              >
                <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">⚙️</span>
                <span>Configure Payment</span>
              </button>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="animate-fade-in space-y-4 md:space-y-6 lg:space-y-8">
            {usersLoading ? (
              <div className="flex items-center justify-center py-8 sm:py-12 md:py-16">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 border-b-2 border-[#2D5A27]"></div>
                  <p className="mt-2 md:mt-4 text-gray-500 font-medium text-xs md:text-sm lg:text-base">Loading users...</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white p-4 md:p-6 lg:p-8 rounded-lg md:rounded-[1.5rem] lg:rounded-[2rem] border border-gray-100 text-center">
                <p className="text-gray-500 font-medium text-xs md:text-sm lg:text-base">No users found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-8">
                {users.map(u => (
                  <div key={u.id} className="bg-white p-3 md:p-4 lg:p-6 rounded-lg md:rounded-[1.5rem] lg:rounded-[2rem] border border-gray-100 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all">
                    <div className="w-14 sm:w-16 md:w-20 h-14 sm:h-16 md:h-20 bg-[#FAF9F6] rounded-full flex items-center justify-center text-xl sm:text-2xl md:text-3xl mb-2 md:mb-3 lg:mb-4 shadow-inner border-2 border-white">👤</div>
                    <h4 className="font-bold text-[#4A3728] text-xs sm:text-sm md:text-lg mb-0.5 md:mb-1 line-clamp-2">{u.name}</h4>
                    <p className="text-[7px] sm:text-[8px] md:text-[10px] text-gray-300 font-medium mb-1 md:mb-2 truncate w-full">{u.email}</p>
                    <p className="text-[6px] sm:text-[8px] md:text-xs text-gray-400 mb-2 md:mb-3">ID: <code className="text-[5px] sm:text-[6px] md:text-[8px]">{u.id}</code></p>
                    <div className="w-full mt-1 md:mt-2">
                      <label className="text-[6px] sm:text-[7px] md:text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-1 md:mb-2 block">Role</label>
                      <div className="flex items-center justify-center gap-2 md:gap-3">
                        <select value={u.role} onChange={e => changeUserRole(u, e.target.value as any)} className="p-1 md:p-2 lg:p-3 rounded-lg md:rounded-xl bg-[#FAF9F6] border border-gray-100 text-[7px] sm:text-[8px] md:text-sm font-bold">
                          <option value="customer">customer</option>
                          <option value="admin">admin</option>
                        </select>
                      </div>
                      <p className="text-[6px] sm:text-[7px] md:text-[10px] text-gray-400 mt-1 md:mt-2 line-clamp-2">Joined: {new Date(u.joinedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'bulk-requests' && (
          <div className="animate-fade-in space-y-4 md:space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold serif text-[#4A3728]">Bulk Order Requests</h2>
              <span className="px-3 md:px-4 py-1 md:py-2 bg-[#A4C639] text-[#2D5A27] rounded-lg font-bold text-xs sm:text-sm">{bulkRequests.length} requests</span>
            </div>

            {bulkLoading ? (
              <div className="text-center py-12">
                <p className="text-[#2D5A27]/60">Loading bulk requests...</p>
              </div>
            ) : bulkRequests.length === 0 ? (
              <div className="bg-[#FAF9F6] p-8 md:p-12 rounded-2xl md:rounded-3xl text-center border border-[#2D5A27]/10">
                <p className="text-[#2D5A27]/60 mb-2">No bulk requests yet</p>
                <p className="text-[#2D5A27]/40 text-sm">Bulk orders will appear here when customers submit requests</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {bulkRequests.map((req: any) => (
                  <div key={req.id} className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-[#2D5A27]/10 shadow-sm hover:shadow-lg transition-all">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-4">
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#A4C639] mb-1">Enquiry ID</p>
                        <p className="font-mono text-xs md:text-sm font-bold text-[#2D5A27] break-all">{req.id}</p>
                      </div>
                      <div className="md:col-span-3">
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#A4C639] mb-1">Event Type</p>
                        <p className="text-xs md:text-sm font-bold text-[#4A3728] capitalize">{req.eventType}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#A4C639] mb-1">Quantity</p>
                        <p className="text-xs md:text-sm font-bold text-[#4A3728]">{req.quantity || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-3">
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#A4C639] mb-1">Status</p>
                        <select 
                          value={req.status} 
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            fetch(`/api/bulk-requests/${req.id}/status`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: newStatus })
                            }).then(() => {
                              const updated = bulkRequests.map(r => r.id === req.id ? {...r, status: newStatus} : r);
                              setBulkRequests(updated);
                            });
                          }}
                          className={`text-xs md:text-sm font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                            req.status === 'pending' ? 'bg-yellow-100 text-yellow-900 border-yellow-300' :
                            req.status === 'contacted' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                            req.status === 'quoted' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                            'bg-green-100 text-green-900 border-green-300'
                          }`}
                        >
                          <option value="pending">pending</option>
                          <option value="contacted">contacted</option>
                          <option value="quoted">quoted</option>
                          <option value="completed">completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#2D5A27]/10">
                      <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#A4C639] mb-2">Customer Details</p>
                      <p className="text-xs md:text-sm text-[#2D5A27] font-mono break-all">{req.details}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#2D5A27]/5 flex justify-between items-center">
                      <p className="text-[7px] md:text-[9px] text-[#2D5A27]/50 font-medium">
                        {req.customerPhone && (
                          <span>📞 {req.customerPhone}</span>
                        )}
                      </p>
                      <p className="text-[7px] md:text-[9px] text-[#2D5A27]/50">
                        {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>



      {/* Customer Management Modal */}
      {showCustomerManager && (
        <div className="fixed inset-0 z-[121] flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/60 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-5xl lg:max-w-6xl rounded-lg md:rounded-[1.5rem] lg:rounded-[2rem] shadow-2xl border border-[#2D5A27]/20 overflow-hidden my-4">
            <div className="p-3 sm:p-4 md:p-6 lg:p-8">
              <div className="flex justify-between items-center mb-3 md:mb-4 lg:mb-6">
                <h2 className="text-base sm:text-lg md:text-2xl font-bold">Customers</h2>
                <button onClick={() => setShowCustomerManager(false)} className="px-2 sm:px-3 md:px-4 py-1 md:py-2 rounded-lg border text-xs sm:text-sm md:text-base">Close</button>
              </div>
              <CustomerManagement onClose={() => setShowCustomerManager(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}

      {/* DB Setup Modal */}
      {showDBSetup && (
        <div className="fixed inset-0 z-[123] flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/60 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-lg md:rounded-[1.5rem] lg:rounded-[2rem] shadow-2xl border border-[#2D5A27]/20 overflow-hidden my-4">
            <div className="p-3 sm:p-4 md:p-6 lg:p-8">
              <div className="flex justify-between items-center mb-3 md:mb-4 lg:mb-6">
                <h2 className="text-base sm:text-lg md:text-2xl font-bold">DB Setup</h2>
                <button onClick={() => setShowDBSetup(false)} className="px-2 sm:px-3 md:px-4 py-1 md:py-2 rounded-lg border text-xs sm:text-sm md:text-base">Close</button>
              </div>
              <DBSetup onClose={() => setShowDBSetup(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Payment Settings Modal */}
      {showPaymentSettings && (
        <div className="fixed inset-0 z-[124] flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/60 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-4xl lg:max-w-5xl rounded-lg md:rounded-[1.5rem] lg:rounded-[2rem] shadow-2xl border border-[#2D5A27]/20 overflow-hidden my-4">
            <div className="p-3 sm:p-4 md:p-6 lg:p-12">
              <div className="flex justify-between items-start gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-10 sticky top-0 bg-white z-10">
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#4A3728]">Payment Setup</h2>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-500 mt-1 md:mt-2">Configure payment methods and QR codes</p>
                </div>
                <button 
                  onClick={() => setShowPaymentSettings(false)} 
                  className="px-2 sm:px-3 md:px-4 lg:px-6 py-1 md:py-2 lg:py-3 rounded-lg md:rounded-xl border border-gray-100 text-xs sm:text-sm md:text-base font-semibold hover:bg-gray-50 transition-all whitespace-nowrap flex-shrink-0"
                >
                  Close
                </button>
              </div>
              <div className="max-h-[calc(90vh-100px)] overflow-y-auto">
                <PaymentSettings onSave={() => setShowPaymentSettings(false)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/60 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-lg md:rounded-[2rem] lg:rounded-[4rem] shadow-2xl border border-[#2D5A27]/20 overflow-hidden my-4">
            <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmitProduct} className="space-y-4 md:space-y-6 lg:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 lg:gap-8">
                  <div>
                    <label className="block text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-1 md:mb-2 lg:mb-3 ml-2">Name (EN)</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 md:p-4 lg:p-6 bg-[#FAF9F6] rounded-lg md:rounded-[1.5rem] lg:rounded-[2rem] outline-none font-bold text-xs md:text-sm border border-transparent focus:border-[#A4C639]" />
                  </div>
                  <div>
                    <label className="block text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-1 md:mb-2 lg:mb-3 ml-2">Name (TE)</label>
                    <input value={formData.name_te} onChange={e => setFormData({...formData, name_te: e.target.value})} className="w-full p-2 md:p-4 lg:p-6 bg-[#FAF9F6] rounded-lg md:rounded-[1.5rem] lg:rounded-[2rem] outline-none font-bold text-xs md:text-sm border border-transparent focus:border-[#A4C639]" />
                  </div>
                </div>
                
                <div className="flex gap-2 md:gap-3 lg:gap-4 p-2 md:p-3 lg:p-4 bg-[#FAF9F6] rounded-lg md:rounded-xl lg:rounded-2xl">
                   <button 
                    type="button" 
                    onClick={() => setUseLocalFolder(true)} 
                    className={`flex-1 py-1.5 md:py-2 lg:py-3 rounded-lg md:rounded-xl text-[6px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${useLocalFolder ? 'bg-[#2D5A27] text-white shadow-lg' : 'text-[#2D5A27]/40'}`}
                   >
                     Local
                   </button>
                   <button 
                    type="button" 
                    onClick={() => setUseLocalFolder(false)} 
                    className={`flex-1 py-1.5 md:py-2 lg:py-3 rounded-lg md:rounded-xl text-[6px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${!useLocalFolder ? 'bg-[#2D5A27] text-white shadow-lg' : 'text-[#2D5A27]/40'}`}
                   >
                     URL
                   </button>
                </div>

                <div>
                   <label className="block text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-1 md:mb-2 lg:mb-3 ml-2">
                     {useLocalFolder ? "Image File" : "Image URL"}
                   </label>
                   <div className="flex gap-2 md:gap-3 lg:gap-4">
                     <input 
                      type="text"
                      required 
                      value={formData.imageUrl} 
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                      placeholder={useLocalFolder ? "file.png" : "https://..."}
                      className="flex-1 p-2 md:p-4 lg:p-6 bg-[#FAF9F6] rounded-lg md:rounded-[1.5rem] lg:rounded-[2rem] outline-none font-bold text-xs md:text-sm border border-transparent focus:border-[#A4C639]" 
                     />
                     {useLocalFolder && (
                       <>
                         <label className="px-3 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 bg-[#A4C639] text-white rounded-lg md:rounded-xl lg:rounded-2xl font-black text-[6px] sm:text-[7px] md:text-[9px] uppercase tracking-widest cursor-pointer hover:bg-[#A4C639]/90 transition-all shadow-lg whitespace-nowrap ">
                           📤 Upload
                           <input 
                             type="file" 
                             accept="image/*" 
                             onChange={(e) => handleUploadFile(e.target.files?.[0])} 
                             className="hidden" 
                           />
                         </label>
                       </>
                     )}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 lg:gap-8">
                   <div>
                    <label className="block text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-1 md:mb-2 lg:mb-3 ml-2">Price (₹)</label>
                    <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2 md:p-4 lg:p-6 bg-[#FAF9F6] rounded-lg md:rounded-[1.5rem] lg:rounded-[2rem] outline-none font-bold text-xs md:text-sm border border-transparent focus:border-[#A4C639]" />
                  </div>
                  <div>
                    <label className="block text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-1 md:mb-2 lg:mb-3 ml-2">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full p-2 md:p-4 lg:p-6 bg-[#FAF9F6] rounded-lg md:rounded-[1.5rem] lg:rounded-[2rem] outline-none font-bold text-xs md:text-sm border border-transparent focus:border-[#A4C639]">
                      <option value="plates">Plates</option>
                      <option value="bowls">Bowls</option>
                      <option value="organic">Organic</option>
                      <option value="earthen">Earthen</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-1 md:mb-2 lg:mb-3 ml-2">Description (EN)</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 md:p-4 lg:p-6 bg-[#FAF9F6] rounded-lg md:rounded-[1.5rem] outline-none font-bold text-xs md:text-sm border border-transparent focus:border-[#A4C639] min-h-[80px] md:min-h-[100px]" />
                </div>

                <div>
                  <label className="block text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-1 md:mb-2 lg:mb-3 ml-2">Description (TE)</label>
                  <textarea value={formData.description_te} onChange={e => setFormData({...formData, description_te: e.target.value})} className="w-full p-2 md:p-4 lg:p-6 bg-[#FAF9F6] rounded-lg md:rounded-[1.5rem] outline-none font-bold text-xs md:text-sm border border-transparent focus:border-[#A4C639] min-h-[60px] md:min-h-[80px]" />
                </div>

                <div className="bg-[#FAF9F6] p-4 md:p-6 lg:p-10 rounded-lg md:rounded-[2rem] lg:rounded-[4rem] border border-[#2D5A27]/5">
                   <p className="text-[6px] sm:text-[7px] md:text-[10px] font-black uppercase tracking-widest text-[#A4C639] mb-3 md:mb-4 lg:mb-6">AI Art</p>
                   <div className="flex flex-col gap-3 md:gap-6 lg:gap-10">
                     <div className="w-full space-y-2 md:space-y-3 lg:space-y-4">
                        <input value={formData.imagePrompt} onChange={e => setFormData({...formData, imagePrompt: e.target.value})} className="w-full p-2 md:p-4 lg:p-6 bg-white rounded-lg md:rounded-xl lg:rounded-2xl text-[7px] sm:text-[8px] md:text-xs outline-none border border-gray-100" placeholder="Describe..." />
                        <div className="flex gap-1 md:gap-2 lg:gap-4">
                           <button type="button" onClick={handleMagicPrompt} disabled={isRefiningAI} className="flex-1 py-1.5 md:py-2 lg:py-4 bg-white border border-[#2D5A27]/10 rounded-lg md:rounded-xl lg:rounded-2xl text-[6px] sm:text-[7px] md:text-[10px] font-black uppercase tracking-widest hover:bg-[#FAF9F6] transition-all">{isRefiningAI ? '...' : 'Refine'}</button>
                           <button type="button" onClick={handleGenerateImage} disabled={isGenerating} className="flex-1 py-1.5 md:py-2 lg:py-4 bg-[#2D5A27] text-white rounded-lg md:rounded-xl lg:rounded-2xl text-[6px] sm:text-[7px] md:text-[10px] font-black uppercase tracking-widest shadow-xl">{isGenerating ? '...' : 'Generate'}</button>
                        </div>
                     </div>
                   </div>
                </div>

                <div className="flex gap-3 md:gap-4 lg:gap-6">
                  <button type="submit" className="flex-1 py-3 md:py-5 lg:py-7 bg-[#2D5A27] text-white rounded-lg md:rounded-[1.5rem] lg:rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[8px] sm:text-[9px] md:text-[11px] shadow-2xl hover:shadow-[#2D5A27]/30 transition-all transform active:scale-95">
                    {editingProductId ? 'Update Product' : 'Save Product'}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeModals}
                    className="flex-1 py-3 md:py-5 lg:py-7 bg-white border-2 border-[#2D5A27] text-[#2D5A27] rounded-lg md:rounded-[1.5rem] lg:rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[8px] sm:text-[9px] md:text-[11px] hover:bg-[#FAF9F6] transition-all transform active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
