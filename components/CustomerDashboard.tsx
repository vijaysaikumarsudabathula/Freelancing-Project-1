
import React from 'react';
import { User, Order, Language } from '../types';
import Logo from './Logo';

interface CustomerDashboardProps {
  user: User;
  orders: Order[];
  lang?: Language;
  onLogout: () => void;
  onShop: () => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ 
  user, 
  orders, 
  lang = 'en', 
  onLogout,
  onShop
}) => {
  const userOrders = orders.filter(o => o.customerEmail.toLowerCase() === user.email.toLowerCase());
  
  // Calculate impact stats
  const totalItems = userOrders.reduce((sum, order) => 
    sum + order.items.reduce((count, item) => count + item.quantity, 0), 0
  );
  
  const impactMetric = totalItems * 1.5; // Estimated 1.5kg of plastic saved per item

  const t = {
    en: {
      welcome: `Namaste, ${user.name}!`,
      tag: "Your Personal Green Portal",
      impactTitle: "Your Nature Score",
      impactDesc: "Plastic waste you have prevented through Deepthi Enterprises.",
      recentOrders: "Your Recent Purchases",
      noOrders: "No natural treasures found yet.",
      shopBtn: "Discover Our Collection",
      status: "Order Status",
      logout: "Logout",
      joined: "Joined Nature"
    },
    te: {
      welcome: `నమస్తే, ${user.name}!`,
      tag: "మీ వ్యక్తిగత గ్రీన్ పోర్టల్",
      impactTitle: "మీ ప్రకృతి స్కోరు",
      impactDesc: "దీప్తి ఎంటర్‌ప్రైజెస్ ద్వారా మీరు అరికట్టిన ప్లాస్టిక్ వ్యర్థాలు.",
      recentOrders: "మీ ఇటీవలి కొనుగోళ్లు",
      noOrders: "ఇంకా ఎటువంటి వస్తువులు కనిపించలేదు.",
      shopBtn: "మా సేకరణను కనుగొనండి",
      status: "ఆర్డర్ స్థితి",
      logout: "లాగ్ అవుట్",
      joined: "ప్రకృతిలో చేరారు"
    }
  }[lang];

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-10 rounded-[3rem] border border-[#2D5A27]/5 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-[#2D5A27] rounded-full flex items-center justify-center text-4xl text-white shadow-xl overflow-hidden relative">
              <span className="relative z-10">{user.name.charAt(0)}</span>
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold serif text-[#4A3728] mb-1">{t.welcome}</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A4C639]">{t.tag}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onShop}
              className="px-8 py-4 bg-[#A4C639] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#2D5A27] transition-all"
            >
              {t.shopBtn}
            </button>
            <button 
              onClick={onLogout}
              className="px-8 py-4 border-2 border-red-50 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
            >
              {t.logout}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sidebar Stats */}
          <div className="lg:col-span-1 space-y-12">
            <div className="bg-[#2D5A27] p-12 rounded-[4rem] text-white relative overflow-hidden shadow-2xl group">
              <div className="absolute top-0 right-0 p-8 opacity-10 transform group-hover:rotate-45 transition-transform duration-1000">
                <Logo className="w-48 h-48" showText={false} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold serif mb-4">{t.impactTitle}</h3>
                <div className="text-6xl font-bold mb-4 serif text-[#A4C639]">{impactMetric.toFixed(1)}kg</div>
                <p className="text-white/60 text-sm font-medium leading-relaxed">{t.impactDesc}</p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-[#2D5A27]/5 shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-6 border-b pb-4">Account Overview</h4>
              <div className="space-y-6">
                <div>
                  <p className="text-[9px] font-bold text-[#A4C639] uppercase tracking-widest mb-1">Email Verified</p>
                  <p className="font-bold text-[#4A3728]">{user.email}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-[#A4C639] uppercase tracking-widest mb-1">{t.joined}</p>
                  <p className="font-bold text-[#4A3728]">{new Date(user.joinedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold serif text-[#4A3728]">{t.recentOrders}</h2>
              <span className="text-[10px] font-black text-[#A4C639] uppercase tracking-widest">{userOrders.length} Completed Purchases</span>
            </div>

            {userOrders.length === 0 ? (
              <div className="bg-white p-24 rounded-[4rem] text-center border-2 border-dashed border-gray-100">
                <div className="text-6xl mb-8 grayscale opacity-20">🍃</div>
                <p className="text-gray-400 font-medium italic mb-10">{t.noOrders}</p>
                <button onClick={onShop} className="px-12 py-5 bg-[#FAF9F6] text-[#2D5A27] rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#2D5A27] hover:text-white transition-all">
                  Start Your Sustainability Journey
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {userOrders.map(order => (
                  <div key={order.id} className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-[#2D5A27]/5 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#A4C639] mb-2 block">Order Reference</span>
                        <h4 className="text-2xl font-bold serif text-[#4A3728]">#ORD-{order.id.slice(-6)}</h4>
                        <p className="text-xs text-gray-400 font-medium mt-1">{order.date}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2">{t.status}</span>
                        <div className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-[#A4C639] text-white' : 'bg-[#FAF9F6] text-[#2D5A27] border border-[#2D5A27]/10'}`}>
                          {order.status}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-10 border-b border-gray-50">
                      <div className="space-y-4">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-2xl border border-white">
                            <img src={item.image} className="w-12 h-12 object-cover rounded-xl shadow-sm" alt={item.name} />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-[#4A3728]">{item.name}</p>
                              <p className="text-[10px] font-black text-[#A4C639] uppercase tracking-widest">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-[#FAF9F6] p-8 rounded-3xl flex flex-col justify-center text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2">Total Amount Paid</p>
                        <p className="text-4xl font-bold text-[#2D5A27] serif">₹{order.total}</p>
                        <p className="text-[9px] font-bold text-[#A4C639] mt-3 uppercase tracking-widest">Via {order.paymentMethod.toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <div className={`w-3 h-3 rounded-full ${order.status === 'pending' ? 'bg-[#A4C639] animate-pulse' : 'bg-[#A4C639]'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-[#A4C639]' : 'bg-gray-100'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${['shipped', 'delivered'].includes(order.status) ? 'bg-[#A4C639]' : 'bg-gray-100'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-[#A4C639]' : 'bg-gray-100'}`}></div>
                      </div>
                      <button className="text-[10px] font-black uppercase tracking-widest text-[#2D5A27] opacity-40 hover:opacity-100 transition-opacity">Track Details →</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
