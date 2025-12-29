
import React, { useState, useMemo } from 'react';
import { User, Order, Language, Product, OrderStatus } from '../types';
import Logo from './Logo';
import ProductList from './ProductList';

interface CustomerDashboardProps {
  user: User;
  orders: Order[];
  products: Product[];
  onAddToCart: (p: Product) => void;
  lang?: Language;
  onLogout: () => void;
  onShop: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

type Tab = 'overview' | 'store' | 'orders' | 'profile';

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ 
  user, 
  orders, 
  products,
  onAddToCart,
  lang = 'en', 
  onLogout,
  searchQuery = '',
  onSearchChange
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const userOrders = useMemo(() => orders.filter(o => o.customerEmail === user.email), [orders, user.email]);

  const t = {
    en: {
      overview: "Home Feed",
      store: "Shop Collection",
      orders: "My Orders",
      profile: "Settings",
      welcome: `Hello, ${user.name.split(' ')[0]}`,
      trending: "Recommended Organic Finds",
      logout: "Log Out",
      searchPlaceholder: "Search for eco-conscious items...",
      tracking: "Real-time Tracking",
      orderHistory: "Order History"
    },
    te: {
      overview: "హోమ్",
      store: "దుకాణం",
      orders: "ఆర్డర్లు",
      profile: "ప్రొఫైల్",
      welcome: `నమస్కారం, ${user.name.split(' ')[0]}`,
      trending: "మీ కోసం సిఫార్సులు",
      logout: "లాగ్ అవుట్",
      searchPlaceholder: "వస్తువులను వెతకండి...",
      tracking: "ట్రాకింగ్ వివరాలు",
      orderHistory: "గత ఆర్డర్లు"
    }
  }[lang];

  const sidebar = [
    { id: 'overview', icon: '🏠', label: t.overview },
    { id: 'store', icon: '🛍️', label: t.store },
    { id: 'orders', icon: '📦', label: t.orders },
    { id: 'profile', icon: '⚙️', label: t.profile },
  ];

  const renderTracking = (order: Order) => (
    <div className="bg-[#FAF9F6] p-8 rounded-[2.5rem] border border-gray-100 mt-6 animate-in fade-in slide-in-from-top-4">
      <h5 className="text-[10px] font-black uppercase tracking-widest text-[#A4C639] mb-8">{t.tracking}</h5>
      <div className="space-y-10 relative">
        <div className="absolute left-4 top-2 bottom-2 w-1 bg-gray-100"></div>
        {order.trackingHistory.map((event, idx) => (
          <div key={idx} className="relative flex items-center gap-8 group">
            <div className={`w-8 h-8 rounded-full border-4 border-[#FAF9F6] relative z-10 transition-colors ${idx === 0 ? 'bg-[#A4C639]' : 'bg-[#2D5A27]'}`}></div>
            <div>
              <p className="text-xs font-bold text-[#4A3728] uppercase">{event.status.replace(/-/g, ' ')}</p>
              <p className="text-[10px] text-gray-400 font-medium">{new Date(event.timestamp).toLocaleString()}</p>
              {event.location && <p className="text-[9px] text-[#A4C639] font-black uppercase mt-1 tracking-widest">📍 {event.location}</p>}
            </div>
          </div>
        ))}
      </div>
      {order.trackingId && (
        <div className="mt-10 pt-6 border-t border-gray-100">
           <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Courier Tracking ID</p>
           <p className="font-bold text-[#2D5A27] text-lg">{order.trackingId}</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'store':
        return (
          <div className="animate-fade-in -mt-16">
            <div className="mb-12 flex justify-center">
               <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => onSearchChange?.(e.target.value)} 
                placeholder={t.searchPlaceholder}
                className="w-full max-w-2xl p-6 bg-white border border-gray-100 rounded-[2rem] shadow-xl outline-none focus:ring-4 focus:ring-[#A4C639]/10"
               />
            </div>
            <ProductList products={products} onAddToCart={onAddToCart} lang={lang} />
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-8 animate-fade-in">
             <h2 className="text-4xl font-bold serif text-[#4A3728] mb-12">{t.orderHistory}</h2>
             {userOrders.map(order => (
               <div key={order.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-24 h-24 bg-[#FAF9F6] rounded-3xl flex-shrink-0 overflow-hidden border border-gray-50 shadow-inner">
                      <img src={order.items[0].image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#A4C639]">ID: #{order.id.slice(-8)}</span>
                        <span className="text-[10px] font-bold text-gray-300">{order.date}</span>
                        <span className={`px-4 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-[#A4C639]' : 'bg-[#2D5A27]'} text-white`}>{order.status}</span>
                      </div>
                      <h4 className="text-xl font-bold text-[#4A3728] serif">{order.items[0].name} {order.items.length > 1 ? `& ${order.items.length - 1} more items` : ''}</h4>
                      <p className="text-lg font-bold text-[#2D5A27] mt-3">₹{order.total}</p>
                      
                      <div className="mt-8 flex gap-4">
                        <button 
                          onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                          className="px-8 py-3 bg-[#FAF9F6] text-[#2D5A27] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2D5A27] hover:text-white transition-all shadow-sm"
                        >
                          {selectedOrderId === order.id ? 'Hide Tracking' : 'Track Package'}
                        </button>
                        <button className="px-8 py-3 border border-[#2D5A27]/10 text-[#2D5A27]/60 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FAF9F6] transition-all">Get Invoice</button>
                      </div>

                      {selectedOrderId === order.id && renderTracking(order)}
                    </div>
                  </div>
               </div>
             ))}
             {userOrders.length === 0 && <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-gray-50 text-gray-300 italic serif text-2xl">Your forest harvest awaits. Start shopping today.</div>}
          </div>
        );
      case 'profile':
        return (
          <div className="animate-fade-in space-y-12">
             <h2 className="text-4xl font-bold serif text-[#4A3728]">Account Settings</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
                   <h4 className="text-2xl font-bold serif text-[#2D5A27] mb-8">Personal Information</h4>
                   <div className="space-y-6">
                      <div className="p-6 bg-[#FAF9F6] rounded-3xl">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#A4C639] mb-1">Display Name</p>
                        <p className="font-bold text-[#4A3728]">{user.name}</p>
                      </div>
                      <div className="p-6 bg-[#FAF9F6] rounded-3xl">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#A4C639] mb-1">Registered Email</p>
                        <p className="font-bold text-[#4A3728]">{user.email}</p>
                      </div>
                      <div className="p-6 bg-[#FAF9F6] rounded-3xl">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#A4C639] mb-1">Member Since</p>
                        <p className="font-bold text-[#4A3728]">{new Date(user.joinedDate).toLocaleDateString()}</p>
                      </div>
                   </div>
                </div>
                <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                   <div>
                      <h4 className="text-2xl font-bold serif text-[#2D5A27] mb-6">Security & Session</h4>
                      <p className="text-sm text-gray-400 font-medium leading-relaxed mb-8 italic">Your account is secured with end-to-end encryption. Last signed in from this browser on {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Today'}.</p>
                   </div>
                   <button onClick={onLogout} className="w-full py-5 bg-red-50 text-red-500 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-100 active:scale-95 transition-all">Sign Out Everywhere</button>
                </div>
             </div>
          </div>
        );
      case 'overview':
      default:
        return (
          <div className="space-y-16 animate-fade-in">
            {/* Amazon-style Hero Banner */}
            <div className="bg-gradient-to-r from-[#2D5A27] to-[#1a3817] p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center group">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 max-w-xl">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-6 block">Premium Member Deals</span>
                <h2 className="text-5xl md:text-6xl font-bold serif mb-6">{t.welcome}!</h2>
                <p className="text-white/70 font-medium mb-10 text-lg leading-relaxed">Discover 100% natural Areca leaf collections. Plastic-free dining redefined for your home and events.</p>
                <button onClick={() => setActiveTab('store')} className="bg-[#A4C639] text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-[#A4C639]/40 active:scale-95 transition-all">Browse Full Store</button>
              </div>
              <div className="hidden lg:block opacity-10 transform scale-150 rotate-12 -mr-32 group-hover:rotate-[15deg] transition-transform duration-1000">
                <Logo className="w-80 h-80" showText={false} />
              </div>
            </div>

            {/* Quick Actions / Categories */}
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100">
               <h3 className="text-2xl font-bold serif mb-10 text-[#4A3728]">{t.trending}</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
                  {products.slice(0, 4).map(p => (
                    <div key={p.id} onClick={() => setActiveTab('store')} className="group cursor-pointer">
                       <div className="aspect-square bg-[#FAF9F6] rounded-[3rem] overflow-hidden mb-6 border border-gray-50 shadow-sm relative">
                          <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-black text-[#2D5A27] shadow-lg">₹{p.price}</div>
                       </div>
                       <p className="text-[11px] font-black uppercase tracking-wider text-[#4A3728] truncate text-center group-hover:text-[#A4C639] transition-colors">{lang === 'te' ? p.name_te : p.name}</p>
                    </div>
                  ))}
               </div>
               <button onClick={() => setActiveTab('store')} className="w-full mt-12 py-6 border-2 border-dashed border-gray-100 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-[#2D5A27] hover:border-[#2D5A27]/20 transition-all">Explore Entire Inventory →</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-white border-r border-gray-100 h-screen fixed top-0 left-0 pt-32 p-10 z-40 hidden lg:flex flex-col justify-between shadow-sm">
        <nav className="space-y-4">
           {sidebar.map(item => (
             <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-6 px-8 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-[#2D5A27] text-white shadow-2xl translate-x-2' : 'text-[#2D5A27]/30 hover:bg-[#FAF9F6] hover:text-[#2D5A27]'}`}
             >
               <span className="text-2xl">{item.icon}</span>
               {item.label}
             </button>
           ))}
        </nav>
        <button onClick={onLogout} className="w-full px-8 py-6 border-2 border-red-50 text-red-400 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-4 active:scale-95 shadow-red-50 shadow-lg">
          <span className="text-lg">⏻</span> {t.logout}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-80 p-8 lg:p-20 mt-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto pb-32">
          <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
             <div>
                <h1 className="text-5xl font-bold serif text-[#4A3728] mb-2">{t.welcome}</h1>
                <div className="flex items-center gap-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A4C639] flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-[#A4C639] rounded-full animate-ping"></span> Enterprise Harvest Portal
                  </p>
                  <span className="h-4 w-px bg-gray-200"></span>
                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">v3.1 Secure</span>
                </div>
             </div>
             {activeTab !== 'store' && (
               <button 
                onClick={() => setActiveTab('store')} 
                className="px-12 py-5 bg-[#2D5A27] text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-[#2D5A27]/30 active:scale-95 transition-all"
               >
                 Shop Collection
               </button>
             )}
          </header>

          {renderContent()}

          {/* Commerce Badges */}
          <div className="mt-32 pt-16 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-12 opacity-40 hover:opacity-100 transition-all duration-700">
             <div className="flex items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm">
                <div className="w-16 h-16 rounded-[1.5rem] bg-[#FAF9F6] flex items-center justify-center text-3xl shadow-inner border border-white">🛡️</div>
                <div>
                   <p className="text-[11px] font-black uppercase tracking-widest text-[#4A3728]">End-to-End Security</p>
                   <p className="text-[9px] font-bold text-gray-400">Military-Grade Transaction Logic</p>
                </div>
             </div>
             <div className="flex items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm">
                <div className="w-16 h-16 rounded-[1.5rem] bg-[#FAF9F6] flex items-center justify-center text-3xl shadow-inner border border-white">🌳</div>
                <div>
                   <p className="text-[11px] font-black uppercase tracking-widest text-[#4A3728]">Verified Organic</p>
                   <p className="text-[9px] font-bold text-gray-400">100% Sustainably Harvested</p>
                </div>
             </div>
             <div className="flex items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm">
                <div className="w-16 h-16 rounded-[1.5rem] bg-[#FAF9F6] flex items-center justify-center text-3xl shadow-inner border border-white">⚡</div>
                <div>
                   <p className="text-[11px] font-black uppercase tracking-widest text-[#4A3728]">Rapid Dispatch</p>
                   <p className="text-[9px] font-bold text-gray-400">24-48h Forest-to-Door Processing</p>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
