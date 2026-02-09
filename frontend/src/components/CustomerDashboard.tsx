
import React, { useState, useMemo, useEffect } from 'react';
import { User, Order, Language, Product, OrderStatus } from '../types';
import Logo from './Logo';
import ProductList from './ProductList';
import * as DB from '../services/database';

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
  onOrdersRefresh?: (orders: Order[]) => void;
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
  onSearchChange,
  onOrdersRefresh
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Auto-refresh orders every 10 seconds when on orders tab
  useEffect(() => {
    if (activeTab === 'orders') {
      const interval = setInterval(async () => {
        try {
          const updatedOrders = await DB.getOrdersAsync();
          if (onOrdersRefresh) {
            onOrdersRefresh(updatedOrders);
          }
        } catch (err) {
          console.error('Error refreshing orders:', err);
        }
      }, 10000); // Refresh every 10 seconds
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) clearInterval(refreshInterval);
      setRefreshInterval(null);
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [activeTab, onOrdersRefresh]);

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
    <div className="bg-[#FAF9F6] p-6 md:p-8 rounded-lg md:rounded-[2.5rem] border border-gray-100 mt-4 md:mt-6 animate-in fade-in slide-in-from-top-4">
      <h5 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#A4C639] mb-6 md:mb-8">{t.tracking}</h5>
      <div className="space-y-6 md:space-y-10 relative">
        <div className="absolute left-3 md:left-4 top-2 bottom-2 w-1 bg-gray-100"></div>
        {order.trackingHistory.map((event, idx) => (
          <div key={idx} className="relative flex items-start gap-4 md:gap-8 group">
            <div className={`w-6 md:w-8 h-6 md:h-8 rounded-full border-4 border-[#FAF9F6] relative z-10 transition-colors flex-shrink-0 mt-1 ${idx === 0 ? 'bg-[#A4C639]' : 'bg-[#2D5A27]'}`}></div>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] md:text-xs font-bold text-[#4A3728] uppercase">{event.status.replace(/-/g, ' ')}</p>
              <p className="text-[7px] md:text-[10px] text-gray-400 font-medium">{new Date(event.timestamp).toLocaleString()}</p>
              {event.location && <p className="text-[7px] md:text-[9px] text-[#A4C639] font-black uppercase mt-1 tracking-widest break-words">📍 {event.location}</p>}
            </div>
          </div>
        ))}
      </div>
      {order.trackingId && (
        <div className="mt-6 md:mt-10 pt-4 md:pt-6 border-t border-gray-100">
           <p className="text-[7px] md:text-[9px] font-black text-gray-300 uppercase tracking-widest">Courier Tracking ID</p>
           <p className="font-bold text-[#2D5A27] text-sm md:text-lg break-all">{order.trackingId}</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'store':
        return (
          <div className="animate-fade-in -mt-8 sm:-mt-10 md:-mt-12 lg:-mt-16">
            <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 flex justify-center px-2">
               <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => onSearchChange?.(e.target.value)} 
                placeholder={t.searchPlaceholder}
                className="w-full max-w-2xl p-2 sm:p-3 md:p-5 lg:p-6 bg-white border border-gray-100 rounded-lg md:rounded-[1.5rem] lg:rounded-[2rem] shadow-xl outline-none focus:ring-2 md:focus:ring-4 focus:ring-[#A4C639]/10 text-xs sm:text-sm md:text-base"
               />
            </div>
            <ProductList products={products} onAddToCart={onAddToCart} lang={lang} />
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 animate-fade-in">
             <h2 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-bold serif text-[#4A3728] mb-4 sm:mb-6 md:mb-8 lg:mb-12">{t.orderHistory}</h2>
             {userOrders.map(order => (
               <div key={order.id} className="bg-white p-3 sm:p-4 md:p-6 lg:p-10 rounded-lg sm:rounded-xl md:rounded-[2rem] lg:rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                  <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 lg:gap-8 items-start">
                      <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-[#FAF9F6] rounded-lg md:rounded-2xl lg:rounded-3xl flex-shrink-0 overflow-hidden border border-gray-50 shadow-inner">
                        <img src={order.items[0].image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 mb-2 md:mb-3">
                          <span className="text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#A4C639] whitespace-nowrap">ORD: #{order.id.slice(-8)}</span>
                          <span className="text-[7px] sm:text-[8px] md:text-[10px] font-bold text-gray-300 whitespace-nowrap">{order.date}</span>
                          <span className={`px-1.5 sm:px-2 md:px-4 py-0.5 md:py-1 rounded-lg text-[6px] sm:text-[7px] md:text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${order.status === 'delivered' ? 'bg-[#A4C639]' : 'bg-[#2D5A27]'} text-white`}>{order.status}</span>
                        </div>
                        <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#4A3728] serif line-clamp-2 mb-1">{order.items[0].name} {order.items.length > 1 ? `& ${order.items.length - 1} more` : ''}</h4>
                        <p className="text-sm sm:text-base md:text-lg font-bold text-[#2D5A27]">₹{order.total}</p>
                      </div>
                    </div>
                      
                    <div className="flex gap-2 md:gap-3 flex-wrap">
                      <button 
                        onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                        className="px-3 sm:px-4 md:px-8 py-1.5 sm:py-2 md:py-3 bg-[#FAF9F6] text-[#2D5A27] rounded-lg md:rounded-xl lg:rounded-2xl text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-[#2D5A27] hover:text-white transition-all shadow-sm flex-shrink-0"
                      >
                        {selectedOrderId === order.id ? 'Hide' : 'Track'}
                      </button>
                      <button className="px-3 sm:px-4 md:px-8 py-1.5 sm:py-2 md:py-3 border border-[#2D5A27]/10 text-[#2D5A27]/60 rounded-lg md:rounded-xl lg:rounded-2xl text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-[#FAF9F6] transition-all flex-shrink-0">Invoice</button>
                    </div>

                    {selectedOrderId === order.id && renderTracking(order)}
                  </div>
               </div>
             ))}
             {userOrders.length === 0 && <div className="text-center py-10 sm:py-12 md:py-16 lg:py-24 bg-white rounded-lg md:rounded-[2rem] lg:rounded-[3rem] border-2 md:border-4 border-dashed border-gray-50 text-gray-300 italic serif text-sm sm:text-base md:text-lg lg:text-2xl">Start shopping today.</div>}
          </div>
        );
      case 'profile':
        return (
          <div className="animate-fade-in space-y-6 md:space-y-8 lg:space-y-12">
             <h2 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-bold serif text-[#4A3728]">Account</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-10">
                <div className="bg-white p-4 sm:p-6 md:p-8 lg:p-12 rounded-lg md:rounded-[2rem] lg:rounded-[3.5rem] border border-gray-100 shadow-sm">
                   <h4 className="text-base sm:text-lg md:text-2xl font-bold serif text-[#2D5A27] mb-4 md:mb-6 lg:mb-8">Personal</h4>
                   <div className="space-y-3 md:space-y-4 lg:space-y-6">
                      <div className="p-3 sm:p-4 md:p-6 bg-[#FAF9F6] rounded-lg md:rounded-2xl lg:rounded-3xl">
                        <p className="text-[6px] sm:text-[7px] md:text-[9px] font-black uppercase tracking-widest text-[#A4C639] mb-1">Name</p>
                        <p className="font-bold text-[#4A3728] text-xs sm:text-sm md:text-base truncate">{user.name}</p>
                      </div>
                      <div className="p-3 sm:p-4 md:p-6 bg-[#FAF9F6] rounded-lg md:rounded-2xl lg:rounded-3xl">
                        <p className="text-[6px] sm:text-[7px] md:text-[9px] font-black uppercase tracking-widest text-[#A4C639] mb-1">Email</p>
                        <p className="font-bold text-[#4A3728] text-xs sm:text-sm md:text-base break-all">{user.email}</p>
                      </div>
                      <div className="p-3 sm:p-4 md:p-6 bg-[#FAF9F6] rounded-lg md:rounded-2xl lg:rounded-3xl">
                        <p className="text-[6px] sm:text-[7px] md:text-[9px] font-black uppercase tracking-widest text-[#A4C639] mb-1">Joined</p>
                        <p className="font-bold text-[#4A3728] text-xs sm:text-sm md:text-base">{new Date(user.joinedDate).toLocaleDateString()}</p>
                      </div>
                   </div>
                </div>
                <div className="bg-white p-4 sm:p-6 md:p-8 lg:p-12 rounded-lg md:rounded-[2rem] lg:rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                   <div>
                      <h4 className="text-base sm:text-lg md:text-2xl font-bold serif text-[#2D5A27] mb-3 md:mb-4 lg:mb-6">Security</h4>
                      <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-sm text-gray-400 font-medium leading-relaxed mb-4 md:mb-6 lg:mb-8 italic">Your account is secured with encryption.</p>
                   </div>
                   <button onClick={onLogout} className="w-full py-3 sm:py-4 md:py-5 lg:py-5 bg-red-50 text-red-500 rounded-lg md:rounded-[1.5rem] lg:rounded-[2rem] text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100 active:scale-95 transition-all">Log Out</button>
                </div>
             </div>
          </div>
        );
      case 'overview':
      default:
        return (
          <div className="space-y-8 md:space-y-10 lg:space-y-12 xl:space-y-16 animate-fade-in">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-[#2D5A27] to-[#1a3817] p-4 sm:p-6 md:p-10 lg:p-12 xl:p-16 rounded-lg md:rounded-[2rem] lg:rounded-[3rem] xl:rounded-[4rem] text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6 lg:gap-8 xl:gap-12 group">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex-1 w-full">
                <span className="text-[6px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-2 sm:mb-3 md:mb-4 lg:mb-6 block">Premium Deals</span>
                <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold serif mb-2 sm:mb-3 md:mb-4 lg:mb-6 line-clamp-3">{t.welcome}!</h2>
                <p className="text-white/70 font-medium mb-4 sm:mb-5 md:mb-8 lg:mb-10 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed">100% Natural Areca Leaf. Plastic-free dining for your home and events.</p>
                <button onClick={() => setActiveTab('store')} className="bg-[#A4C639] text-white px-6 sm:px-8 md:px-12 py-2 sm:py-3 md:py-4 lg:py-5 rounded-lg md:rounded-[1.5rem] lg:rounded-[2rem] font-black uppercase tracking-widest text-[8px] sm:text-[9px] md:text-[11px] shadow-2xl shadow-[#A4C639]/40 active:scale-95 transition-all">Shop</button>
              </div>
              <div className="hidden lg:block opacity-5 transform scale-110 lg:scale-125 rotate-12 -mr-12 lg:-mr-20 xl:-mr-32 group-hover:rotate-[15deg] transition-transform duration-1000 flex-shrink-0">
                <Logo className="w-48 lg:w-72 h-48 lg:h-72" showText={false} />
              </div>
            </div>

            {/* Quick Actions / Trending */}
            <div className="bg-white p-4 sm:p-6 md:p-10 lg:p-12 rounded-lg md:rounded-[2rem] lg:rounded-[3rem] xl:rounded-[4rem] shadow-sm border border-gray-100">
               <h3 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold serif mb-4 sm:mb-6 md:mb-8 lg:mb-10 text-[#4A3728]">{t.trending}</h3>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-8">
                  {products.slice(0, 3).map(p => (
                    <div key={p.id} onClick={() => setActiveTab('store')} className="group cursor-pointer">
                       <div className="aspect-square bg-[#FAF9F6] rounded-lg md:rounded-[2rem] lg:rounded-[3rem] overflow-hidden mb-2 md:mb-4 lg:mb-6 border border-gray-50 shadow-sm relative">
                          <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute bottom-1 md:bottom-3 lg:bottom-4 right-1 md:right-3 lg:right-4 bg-white/90 backdrop-blur px-1.5 md:px-2 lg:px-3 py-0.5 md:py-1 rounded-lg md:rounded-lg lg:rounded-xl text-[7px] md:text-[9px] lg:text-[10px] font-black text-[#2D5A27] shadow-lg">₹{p.price}</div>
                       </div>
                       <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase tracking-wider text-[#4A3728] truncate text-center group-hover:text-[#A4C639] transition-colors">{lang === 'te' ? p.name_te : p.name}</p>
                    </div>
                  ))}
               </div>
               <button onClick={() => setActiveTab('store')} className="w-full mt-6 md:mt-10 lg:mt-12 py-3 md:py-4 lg:py-6 border-2 border-dashed border-gray-100 rounded-lg md:rounded-[1.5rem] lg:rounded-[2rem] text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-[#2D5A27] hover:border-[#2D5A27]/20 transition-all">Explore All →</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 xl:w-72 bg-white border-b lg:border-r border-gray-100 lg:h-screen lg:fixed lg:top-0 lg:left-0 lg:pt-20 sm:pt-24 lg:pt-32 p-2 sm:p-3 md:p-4 lg:p-10 z-40 lg:flex flex-col justify-between shadow-sm">
        <nav className="space-y-0.5 lg:space-y-2">
           {sidebar.map(item => (
             <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-2 sm:gap-3 lg:gap-6 px-2 sm:px-3 md:px-4 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-5 rounded-lg lg:rounded-[2rem] text-[7px] sm:text-[8px] md:text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-[#2D5A27] text-white shadow-2xl translate-x-1 lg:translate-x-2' : 'text-[#2D5A27]/30 hover:bg-[#FAF9F6] hover:text-[#2D5A27]'}`}
             >
               <span className="text-sm sm:text-base md:text-lg lg:text-2xl flex-shrink-0">{item.icon}</span>
               <span className="hidden sm:inline">{item.label}</span>
             </button>
           ))}
        </nav>
        <button onClick={onLogout} className="w-full px-2 sm:px-3 md:px-4 lg:px-8 py-2 sm:py-3 md:py-4 lg:py-6 border-2 border-red-50 text-red-400 rounded-lg lg:rounded-[2rem] text-[6px] sm:text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 active:scale-95 shadow-red-50 shadow-lg flex-shrink-0">
          <span className="text-sm sm:text-base md:text-lg">⏻</span> <span className="hidden sm:inline">Log Out</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 xl:ml-72 p-2 sm:p-3 md:p-6 lg:p-12 xl:p-20 mt-2 overflow-y-auto">
        <div className="max-w-6xl mx-auto pb-20 md:pb-24 lg:pb-32">
          <header className="mb-6 sm:mb-8 md:mb-12 lg:mb-16 xl:mb-20 flex flex-col gap-3 sm:gap-4 md:gap-6 lg:gap-8">
             <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold serif text-[#4A3728] mb-1 md:mb-2">{t.welcome}</h1>
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
                  <p className="text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-[#A4C639] flex items-center gap-1 md:gap-2 lg:gap-3 whitespace-nowrap">
                    <span className="w-1.5 md:w-2 h-1.5 md:h-2 bg-[#A4C639] rounded-full animate-ping"></span> Portal
                  </p>
                  <span className="h-3 w-px bg-gray-200"></span>
                  <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Secure</span>
                </div>
             </div>
             {activeTab !== 'store' && (
               <button 
                onClick={() => setActiveTab('store')} 
                className="px-6 sm:px-8 md:px-12 py-2 sm:py-3 md:py-4 lg:py-5 bg-[#2D5A27] text-white rounded-lg md:rounded-[1.5rem] lg:rounded-[2rem] text-[7px] sm:text-[8px] md:text-[10px] lg:text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-[#2D5A27]/30 active:scale-95 transition-all w-full md:w-auto"
               >
                 Shop
               </button>
             )}
          </header>

          {renderContent()}

          {/* Commerce Badges */}
          <div className="mt-16 md:mt-20 lg:mt-32 pt-8 md:pt-12 lg:pt-16 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 lg:gap-12 opacity-40 hover:opacity-100 transition-all duration-700">
             <div className="flex items-center gap-3 sm:gap-4 md:gap-6 bg-white p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] lg:rounded-[3rem] shadow-sm">
                <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 rounded-lg md:rounded-[1.5rem] bg-[#FAF9F6] flex-shrink-0 flex items-center justify-center text-2xl md:text-3xl shadow-inner border border-white">🛡️</div>
                <div>
                   <p className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#4A3728]">Security</p>
                   <p className="text-[7px] sm:text-[8px] md:text-[9px] font-bold text-gray-400">Military-Grade</p>
                </div>
             </div>
             <div className="flex items-center gap-3 sm:gap-4 md:gap-6 bg-white p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] lg:rounded-[3rem] shadow-sm">
                <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 rounded-lg md:rounded-[1.5rem] bg-[#FAF9F6] flex-shrink-0 flex items-center justify-center text-2xl md:text-3xl shadow-inner border border-white">🌳</div>
                <div>
                   <p className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#4A3728]">Organic</p>
                   <p className="text-[7px] sm:text-[8px] md:text-[9px] font-bold text-gray-400">100% Verified</p>
                </div>
             </div>
             <div className="flex items-center gap-3 sm:gap-4 md:gap-6 bg-white p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] lg:rounded-[3rem] shadow-sm">
                <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 rounded-lg md:rounded-[1.5rem] bg-[#FAF9F6] flex-shrink-0 flex items-center justify-center text-2xl md:text-3xl shadow-inner border border-white">⚡</div>
                <div>
                   <p className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#4A3728]">Dispatch</p>
                   <p className="text-[7px] sm:text-[8px] md:text-[9px] font-bold text-gray-400">24-48h Delivery</p>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
