
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, CartItem, User, Order, OrderStatus, View, OrderDetails, Language } from './types';
import Hero from './components/Hero';
import ProductList from './components/ProductList';
import CartDrawer from './components/CartDrawer';
import CheckoutFlow from './components/CheckoutFlow';
import Impact from './components/Impact';
import About from './components/About';
import Contact from './components/Contact';
import BulkEnquiry from './components/BulkEnquiry';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import BlogDetail from './components/BlogDetail';
import Logo from './components/Logo';
import CustomerDashboard from './components/CustomerDashboard';
import * as DB from './services/database';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [selectedBlogId, setSelectedBlogId] = useState<string>('');
  const [isDBReady, setIsDBReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartAnimate, setCartAnimate] = useState(false);

  const t = {
    en: { 
      navHome: "Home", navShop: "Shop", navDashboard: "Dashboard", navOrders: "My Orders", navBulk: "Bulk", 
      login: "Login", loading: "Deepthi Enterprises is growing...", newsletterTitle: "Nature's Journal", 
      newsletterDesc: "Sign up for eco-insights and new arrivals.", subscribe: "Subscribe", 
      copyright: "© 2024 Deepthi Enterprises. Crafted with nature.", contact: "Connect", 
      links: "Navigation", ourShop: "Location" 
    },
    te: { 
      navHome: "హోమ్", navShop: "షాపు", navDashboard: "డాష్‌బోర్డ్", navOrders: "ఆర్డర్లు", navBulk: "పెద్దవి", 
      login: "లాగిన్", loading: "దీప్తి షాపు సిద్ధమవుతోంది...", newsletterTitle: "ప్రకృతి వార్తలు", 
      newsletterDesc: "కొత్త వస్తువుల అప్‌డేట్స్ పొందండి.", subscribe: "చేరండి", 
      copyright: "© 2024 దీప్తి ఎంటర్‌ప్రైజెస్. ప్రకృతితో తయారు చేయబడింది.", contact: "సంప్రదించండి", 
      links: "ముఖ్యమైనవి", ourShop: "చిరునామా" 
    }
  }[currentLang];

  useEffect(() => {
    const startup = async () => {
      await DB.initDatabase();
      setProducts(DB.getProducts());
      setOrders(DB.getOrders());
      setUser(DB.getActiveUser());
      const savedCart = localStorage.getItem('deepthi_cart');
      if (savedCart) setCartItems(JSON.parse(savedCart));
      setIsDBReady(true);
    };
    startup();
  }, []);

  useEffect(() => {
    if (isDBReady) localStorage.setItem('deepthi_cart', JSON.stringify(cartItems));
  }, [cartItems, isDBReady]);

  const addToCart = useCallback((product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartAnimate(true);
    setTimeout(() => setCartAnimate(false), 2000);
  }, []);

  const handleCheckoutIntent = () => {
    setIsCartOpen(false);
    if (!user) {
      setShowLogin(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const placeOrder = (orderDetails: OrderDetails) => {
    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax + (subtotal > 1000 ? 0 : 99);
    
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      items: [...cartItems],
      total,
      status: 'pending',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      customerEmail: user?.email || orderDetails.email,
      shippingAddress: `${orderDetails.address}, ${orderDetails.city}`,
      paymentMethod: orderDetails.cardNumber ? 'card' : 'upi',
      paymentId: `PAY-${Math.floor(Math.random() * 1000000)}`
    };
    DB.addOrder(newOrder);
    setOrders(DB.getOrders());
    setCartItems([]);
    setIsCheckoutOpen(false);
    
    if (user?.role === 'customer') {
      setCurrentView('customer-dashboard');
    } else {
      setCurrentView('home');
    }
  };

  const updateOrderStatus = (id: string, s: OrderStatus) => {
    DB.updateOrderStatus(id, s);
    setOrders(DB.getOrders());
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    DB.setActiveUserDB(userData);
    DB.addUser(userData);
    setShowLogin(false);
    
    // If user was trying to checkout, resume that flow
    if (cartItems.length > 0) {
      setIsCheckoutOpen(true);
    } else {
      if (userData.role === 'admin') setCurrentView('admin');
      else setCurrentView('customer-dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    DB.setActiveUserDB(null);
    setCurrentView('home');
  };

  const handleReadBlog = (blogId: string) => {
    setSelectedBlogId(blogId);
    setCurrentView('blog-detail');
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter(p => (currentLang === 'te' ? p.name_te : p.name).toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, searchQuery, currentLang]);

  const renderView = () => {
    if (!isDBReady) return <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]"><div className="text-center"><div className="w-16 h-16 border-4 border-[#2D5A27] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div><p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#2D5A27]">{t.loading}</p></div></div>;
    
    if (user?.role === 'admin' && currentView === 'admin') return <AdminDashboard products={products} orders={orders} onUpdateOrderStatus={updateOrderStatus} onAddProduct={p => { DB.saveProduct(p); setProducts(DB.getProducts()); }} onUpdateProduct={p => { DB.saveProduct(p); setProducts(DB.getProducts()); }} onDeleteProduct={id => { DB.deleteProduct(id); setProducts(DB.getProducts()); }} lang={currentLang} />;
    
    if (user?.role === 'customer' && currentView === 'customer-dashboard') return <CustomerDashboard user={user} orders={orders} lang={currentLang} onLogout={handleLogout} onShop={() => setCurrentView('shop')} />;

    switch (currentView) {
      case 'shop': return (
        <div className="animate-fade-in"><div className="max-w-7xl mx-auto px-4 pt-16"><div className="relative max-w-2xl"><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={currentLang === 'en' ? "Search for natural items..." : "వస్తువులను వెతకండి..."} className="w-full p-6 pl-16 bg-white border border-[#2D5A27]/10 rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-[#A4C639]/5 outline-none transition-all shadow-sm" /><svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div></div><ProductList products={filteredProducts} onAddToCart={addToCart} lang={currentLang} /></div>
      );
      case 'about': return <About onReadMore={handleReadBlog} lang={currentLang} />;
      case 'blog-detail': return <BlogDetail blogId={selectedBlogId} lang={currentLang} onBack={() => setCurrentView('about')} />;
      case 'contact': return <Contact />;
      case 'bulk-enquiry': return <BulkEnquiry />;
      default: return <div className="animate-fade-in"><Hero onExplore={() => setCurrentView('shop')} lang={currentLang} /><Impact /><About onReadMore={handleReadBlog} lang={currentLang} /></div>;
    }
  };

  const navLinks = useMemo(() => {
    const base = [
      { id: 'home', l: t.navHome },
      { id: 'shop', l: t.navShop },
      { id: 'bulk-enquiry', l: t.navBulk }
    ];
    if (user?.role === 'customer') {
      base.splice(2, 0, { id: 'customer-dashboard', l: t.navDashboard });
    }
    return base;
  }, [user, currentLang, t]);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <nav className="fixed top-0 w-full z-[60] bg-white/80 backdrop-blur-xl border-b border-[#2D5A27]/5 h-24 flex items-center transition-all">
        <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
          <button onClick={() => setCurrentView('home')} className="flex items-center group"><Logo className="w-12 h-12 transition-transform group-hover:scale-105" showText={true} /></button>
          <div className="hidden lg:flex space-x-10">
            {navLinks.map(p => (
              <button 
                key={p.id} 
                onClick={() => setCurrentView(p.id as any)} 
                className={`text-[9px] font-black uppercase tracking-[0.4em] relative group h-24 flex items-center ${currentView === p.id ? 'text-[#2D5A27]' : 'text-gray-300 hover:text-[#2D5A27]'}`}
              >
                {p.l}
                <div className={`absolute bottom-0 left-0 h-1 bg-[#A4C639] transition-all rounded-full ${currentView === p.id ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex bg-[#FAF9F6] border rounded-xl p-1"><button onClick={() => setCurrentLang('en')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${currentLang === 'en' ? 'bg-[#2D5A27] text-white shadow-md' : 'text-gray-400'}`}>EN</button><button onClick={() => setCurrentLang('te')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${currentLang === 'te' ? 'bg-[#2D5A27] text-white shadow-md' : 'text-gray-400'}`}>తెలుగు</button></div>
            <button onClick={() => setIsCartOpen(true)} className={`relative group p-2 rounded-xl hover:bg-gray-50 transition-all ${cartAnimate ? 'scale-110' : ''}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>{cartItems.length > 0 && <span className="absolute top-0 right-0 bg-[#A4C639] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{cartItems.reduce((a, b) => a + b.quantity, 0)}</span>}</button>
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-100">{user.role === 'admin' && <button onClick={() => setCurrentView('admin')} className="text-[9px] font-black uppercase tracking-widest text-[#2D5A27]">Admin Hub</button>}<button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-50 rounded-xl">✕</button></div>
            ) : <button onClick={() => setShowLogin(true)} className="px-8 py-3.5 bg-[#2D5A27] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:shadow-[#2D5A27]/20 transition-all">{t.login}</button>}
          </div>
        </div>
      </nav>

      <main className="pt-24 min-h-screen">{renderView()}</main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onUpdateQuantity={(id, d) => setCartItems(p => p.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))} onRemove={id => setCartItems(p => p.filter(i => i.id !== id))} onCheckout={handleCheckoutIntent} />
      {showLogin && <Login onLogin={handleLogin} onCancel={() => setShowLogin(false)} />}
      {isCheckoutOpen && <CheckoutFlow items={cartItems} onComplete={placeOrder} onCancel={() => setIsCheckoutOpen(false)} />}

      <footer className="bg-white border-t-[8px] border-[#2D5A27] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="space-y-6"><Logo className="w-16 h-16" showText={true} /><p className="text-sm font-medium text-gray-400 leading-relaxed italic">Crafting biodegradable solutions for a future without plastic waste. 100% natural and handcrafted.</p></div>
            <div><h4 className="text-xl font-bold serif text-[#2D5A27] mb-8">{t.links}</h4><ul className="space-y-4">{[t.navHome, t.navShop, 'About Us', 'Sustainability'].map(l => <li key={l}><button className="text-sm font-bold text-gray-500 hover:text-[#2D5A27] transition-colors">{l}</button></li>)}</ul></div>
            <div><h4 className="text-xl font-bold serif text-[#2D5A27] mb-8">{t.contact}</h4><div className="space-y-4 text-sm font-medium text-gray-500"><p className="text-lg font-black text-[#4A3728] tracking-tighter">+91 8367382095</p><p>lathadairy@gmail.com</p><p className="italic">Thirumalanagar Colony, Hyderabad.</p></div></div>
            <div><h4 className="text-xl font-bold serif text-[#2D5A27] mb-8">{t.newsletterTitle}</h4><p className="text-sm text-gray-400 mb-6 font-medium">{t.newsletterDesc}</p><div className="flex flex-col gap-3"><input type="email" placeholder="your@email.com" className="w-full p-4 bg-[#FAF9F6] border rounded-2xl outline-none focus:ring-2 focus:ring-[#A4C639] text-sm font-bold" /><button className="w-full py-4 bg-[#2D5A27] text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] shadow-lg">{t.subscribe}</button></div></div>
          </div>
          <div className="pt-12 border-t flex flex-col md:flex-row justify-between items-center gap-6"><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{t.copyright}</p><div className="flex gap-8 items-center"><span className="text-[10px] font-black text-[#A4C639] uppercase tracking-widest">Handmade with Nature</span><div className="flex gap-4 opacity-20 hover:opacity-100 transition-all cursor-help"><span title="Safe Payments">💳</span><span title="UPI Accepted">📱</span><span title="Bank Transfer">🏦</span></div></div></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
