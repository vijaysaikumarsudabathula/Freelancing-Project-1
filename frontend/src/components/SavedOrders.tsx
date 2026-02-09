
import React, { useState, useEffect } from 'react';
import { Order, Language, Product } from '../types';
import { resolveProductImage } from '../services/imageHelper';
import * as DB from '../services/database';

interface SavedOrdersProps {
  orders: Order[];
  wishlistProducts?: Product[];
  onAddToCart?: (p: Product) => void;
  onRemoveFromWishlist?: (id: string) => void;
  lang?: Language;
  onLogin: () => void;
  isLoggedIn: boolean;
  onOrdersRefresh?: (orders: Order[]) => void;
}

const SavedOrders: React.FC<SavedOrdersProps> = ({ 
  orders, 
  wishlistProducts = [], 
  onAddToCart,
  onRemoveFromWishlist,
  lang = 'en', 
  onLogin, 
  isLoggedIn,
  onOrdersRefresh
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'purchased' | 'wishlist'>('purchased');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Auto-refresh orders every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updatedOrders = await DB.getOrdersAsync();
        if (onOrdersRefresh) {
          onOrdersRefresh(updatedOrders);
        }
        setLastRefreshTime(new Date());
      } catch (err) {
        console.error('Error refreshing orders:', err);
      }
    }, 10000); // Refresh every 10 seconds
    
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [onOrdersRefresh]);

  const handleManualRefresh = async () => {
    try {
      const updatedOrders = await DB.getOrdersAsync();
      if (onOrdersRefresh) {
        onOrdersRefresh(updatedOrders);
      }
      setLastRefreshTime(new Date());
    } catch (err) {
      console.error('Error refreshing orders:', err);
    }
  };

  const t = {
    en: {
      title: "My Activity",
      subtitle: "Track your past purchases and view your saved interests.",
      noOrders: "No orders found in your history.",
      noWishlist: "You haven't saved any products yet.",
      loginPrompt: "Please login to view your orders and wishlist.",
      loginBtn: "Login / Sign Up",
      id: "Order ID",
      date: "Date",
      status: "Status",
      total: "Total",
      track: "Track Order",
      hide: "Hide Tracking",
      tabPurchased: "Purchased",
      tabWishlist: "Saved Items",
      addToCart: "Add to Cart",
      remove: "Remove"
    },
    te: {
      title: "నా కార్యకలాపాలు",
      subtitle: "మీ పాత ఆర్డర్లు మరియు సేవ్ చేసిన వస్తువులను ఇక్కడ చూడండి.",
      noOrders: "మీ ఖాతాలో ఎటువంటి ఆర్డర్లు లేవు.",
      noWishlist: "మీరు ఇంకా ఎటువంటి వస్తువులను సేవ్ చేయలేదు.",
      loginPrompt: "మీ ఆర్డర్లను చూడటానికి దయచేసి లాగిన్ అవ్వండి.",
      loginBtn: "లాగిన్ / రిజిస్టర్",
      id: "ఆర్డర్ ID",
      date: "తేదీ",
      status: "స్థితి",
      total: "మొత్తం",
      track: "ట్రాక్ చేయండి",
      hide: "వివరాలు దాచు",
      tabPurchased: "కొన్నవి",
      tabWishlist: "సేవ్ చేసినవి",
      addToCart: "కార్ట్‌కు జోడించు",
      remove: "తొలగించు"
    }
  }[lang];

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-white rounded-[3rem] shadow-sm border border-gray-100 max-w-2xl mx-auto my-24">
        <div className="w-20 h-20 bg-[#FAF9F6] rounded-full flex items-center justify-center text-3xl mb-8">📦</div>
        <h2 className="text-3xl font-bold serif text-[#4A3728] mb-4">{t.title}</h2>
        <p className="text-gray-400 mb-10 text-center font-medium">{t.loginPrompt}</p>
        <button 
          onClick={onLogin}
          className="px-12 py-5 bg-[#2D5A27] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:shadow-[#2D5A27]/20 active:scale-95 transition-all"
        >
          {t.loginBtn}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 animate-fade-in">
      <div className="mb-16">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-4 block">Personal space</span>
            <h2 className="text-5xl font-bold serif text-[#4A3728] mb-4">{t.title}</h2>
            <p className="text-[#2D5A27]/60 font-medium">{t.subtitle}</p>
          </div>
          <button
            onClick={handleManualRefresh}
            className="px-6 py-3 bg-[#A4C639] text-white rounded-2xl text-[8px] font-black uppercase tracking-widest hover:shadow-lg transition-all active:scale-95"
            title="Refresh orders to see latest updates from admin"
          >
            🔄 Refresh Now
          </button>
        </div>
        {lastRefreshTime && (
          <p className="text-[8px] text-gray-400 mt-4">Last updated: {lastRefreshTime.toLocaleTimeString()}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-[#FAF9F6] p-2 rounded-[2.5rem] mb-12 max-w-md border border-[#2D5A27]/5">
        <button 
          onClick={() => setActiveTab('purchased')}
          className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'purchased' ? 'bg-[#2D5A27] text-white shadow-xl' : 'text-[#2D5A27]/40 hover:text-[#2D5A27]'}`}
        >
          {t.tabPurchased}
        </button>
        <button 
          onClick={() => setActiveTab('wishlist')}
          className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'wishlist' ? 'bg-[#2D5A27] text-white shadow-xl' : 'text-[#2D5A27]/40 hover:text-[#2D5A27]'}`}
        >
          {t.tabWishlist} ({wishlistProducts.length})
        </button>
      </div>

      <div className="space-y-8">
        {activeTab === 'purchased' ? (
          orders.length > 0 ? (
            orders.map(order => (
              <div key={order.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#A4C639]">{t.id}: #{order.id.slice(-8)}</p>
                    <h3 className="text-xl font-bold text-[#4A3728]">{order.items[0].name} {order.items.length > 1 ? `+ ${order.items.length - 1} more` : ''}</h3>
                    <p className="text-xs text-gray-400">{t.date}: {order.date}</p>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-2">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white ${order.status === 'delivered' ? 'bg-[#A4C639]' : 'bg-[#2D5A27]'}`}>
                      {order.status.replace(/-/g, ' ')}
                    </span>
                    <p className="text-xl font-bold text-[#2D5A27] mt-1">₹{order.total}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                  className="mt-10 text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/60 hover:text-[#2D5A27] transition-all flex items-center gap-2"
                >
                  {selectedOrderId === order.id ? t.hide : t.track}
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${selectedOrderId === order.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {selectedOrderId === order.id && (
                  <div className="mt-12 pt-12 border-t border-gray-50 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="relative space-y-12">
                      <div className="absolute left-4 top-2 bottom-2 w-1 bg-gray-50"></div>
                      {(order.trackingHistory || []).map((event, idx) => (
                        <div key={idx} className="relative flex items-center gap-10 group">
                          <div className={`w-8 h-8 rounded-full border-4 border-white relative z-10 shadow-sm ${idx === 0 ? 'bg-[#A4C639]' : 'bg-[#2D5A27]/10'}`}></div>
                          <div>
                            <p className="text-xs font-bold text-[#4A3728] uppercase tracking-wider">{event.status.replace(/-/g, ' ')}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{new Date(event.timestamp).toLocaleString()}</p>
                            {event.note && <p className="text-[10px] text-[#2D5A27]/60 mt-1 italic">"{event.note}"</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-gray-50">
              <p className="text-2xl font-bold serif text-gray-300 italic">{t.noOrders}</p>
            </div>
          )
        ) : (
          wishlistProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlistProducts.map(product => (
                <div key={product.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col group animate-in zoom-in-95 duration-300">
                    <div className="relative h-64 mb-8 overflow-hidden rounded-[2.5rem] bg-[#FAF9F6]">
                    <img src={resolveProductImage(product.image, product.id)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} onError={(e) => { const t = e.currentTarget as HTMLImageElement; console.warn('Image load failed:', t.src); t.src = '/images/deepthi-logo.png'; }} />
                  </div>
                  <h3 className="text-xl font-bold serif text-[#4A3728] mb-1">{lang === 'te' ? product.name_te : product.name}</h3>
                  <p className="text-lg font-bold text-[#2D5A27] mb-8">₹{product.price}</p>
                  
                  <div className="mt-auto flex gap-4">
                    <button 
                      onClick={() => onAddToCart?.(product)}
                      className="flex-1 py-4 bg-[#2D5A27] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:shadow-[#2D5A27]/20 transition-all"
                    >
                      {t.addToCart}
                    </button>
                    <button 
                      onClick={() => onRemoveFromWishlist?.(product.id)}
                      className="px-6 py-4 bg-red-50 text-red-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                    >
                      {t.remove}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-gray-50">
              <p className="text-2xl font-bold serif text-gray-300 italic">{t.noWishlist}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SavedOrders;
