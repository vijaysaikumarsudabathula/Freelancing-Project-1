
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import Footer from './components/Footer';
import SavedOrders from './components/SavedOrders';
import * as DB from './services/database';

const INACTIVITY_LIMIT = 5 * 60 * 1000;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [isDBReady, setIsDBReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartAnimate, setCartAnimate] = useState(false);
  const logoutTimerRef = useRef<number | null>(null);

  const t = {
    en: { 
      navHome: "Home", 
      navShop: "Shop", 
      navSaved: "Saved Orders", 
      navBulk: "Bulk Order",
      login: "Login", 
      loading: "Setting up shop...",
      copyright: "© 2024 Deepthi Enterprises",
      sessionExpMsg: "Session expired due to inactivity."
    },
    te: { 
      navHome: "హోమ్", 
      navShop: "షాపు", 
      navSaved: "ఆర్డర్లు", 
      navBulk: "బల్క్ ఆర్డర్",
      login: "లాగిన్", 
      loading: "దుకాణం సిద్ధమవుతోంది...",
      copyright: "© 2024 దీప్తి ఎంటర్‌ప్రైజెస్",
      sessionExpMsg: "5 నిమిషాల నిష్క్రియాత్మకత కారణంగా మీరు లాగ్ అవుట్ చేయబడ్డారు."
    }
  }[currentLang];

  const handleLogout = useCallback(() => {
    setUser(null);
    DB.setActiveUserDB(null);
    setCurrentView('home');
    if (logoutTimerRef.current) window.clearTimeout(logoutTimerRef.current);
  }, []);

  const resetLogoutTimer = useCallback(() => {
    if (!user) return;
    if (logoutTimerRef.current) window.clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = window.setTimeout(() => {
      handleLogout();
      alert(t.sessionExpMsg);
    }, INACTIVITY_LIMIT);
  }, [user, handleLogout, t.sessionExpMsg]);

  useEffect(() => {
    if (user) {
      window.addEventListener('mousemove', resetLogoutTimer);
      window.addEventListener('keydown', resetLogoutTimer);
      resetLogoutTimer();
    }
    return () => {
      window.removeEventListener('mousemove', resetLogoutTimer);
      window.removeEventListener('keydown', resetLogoutTimer);
    };
  }, [user, resetLogoutTimer]);

  useEffect(() => {
    const startup = async () => {
      await DB.initDatabase();
      const dbProducts = DB.getProducts();
      setProducts(dbProducts);
      setOrders(DB.getOrders());
      const activeUser = DB.getActiveUser();
      setUser(activeUser);
      
      const savedCart = localStorage.getItem('deepthi_cart');
      if (savedCart) setCartItems(JSON.parse(savedCart));

      const savedLater = localStorage.getItem('deepthi_saved_later');
      if (savedLater) setSavedItems(JSON.parse(savedLater));

      const savedWishlist = localStorage.getItem('deepthi_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      
      setTimeout(() => setIsDBReady(true), 800);
    };
    startup();
  }, []);

  useEffect(() => {
    if (isDBReady) {
      localStorage.setItem('deepthi_cart', JSON.stringify(cartItems));
      localStorage.setItem('deepthi_saved_later', JSON.stringify(savedItems));
      localStorage.setItem('deepthi_wishlist', JSON.stringify(wishlist));
    }
  }, [cartItems, savedItems, wishlist, isDBReady]);

  const addToCart = useCallback((product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartAnimate(true);
    setTimeout(() => setCartAnimate(false), 2000);
  }, []);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const saveForLater = useCallback((item: CartItem) => {
    setCartItems(prev => prev.filter(i => i.id !== item.id));
    setSavedItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev;
      return [...prev, item];
    });
  }, []);

  const moveToCart = useCallback((item: CartItem | Product) => {
    const product = products.find(p => p.id === item.id) || item as Product;
    setSavedItems(prev => prev.filter(i => i.id !== item.id));
    addToCart(product);
  }, [addToCart, products]);

  const removeSavedItem = useCallback((id: string) => {
    setSavedItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const placeOrder = (orderDetails: OrderDetails) => {
    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = subtotal + Math.round(subtotal * 0.05);
    const orderId = `ord-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      items: [...cartItems],
      total,
      status: 'pending',
      date: new Date().toLocaleDateString('en-IN'),
      customerEmail: user?.email || orderDetails.email,
      shippingAddress: orderDetails.address,
      paymentMethod: orderDetails.cardNumber ? 'card' : 'upi',
      paymentId: `PAY-${Math.floor(Math.random() * 1000000)}`,
      trackingHistory: [{ status: 'pending', timestamp: new Date().toISOString(), note: 'Order placed and verified.' }]
    };
    DB.addOrder(newOrder);
    setOrders(DB.getOrders());
    setCartItems([]);
    setIsCheckoutOpen(false);
    setCurrentView('saved-orders');
  };

  const handleUpdateOrderStatus = (id: string, status: OrderStatus, trackingId?: string) => {
    DB.updateOrderStatus(id, status, trackingId);
    setOrders(DB.getOrders());
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    DB.setActiveUserDB(userData);
    setShowLogin(false);
    if (userData.role === 'admin') setCurrentView('admin');
    else if (currentView === 'saved-orders') setCurrentView('saved-orders');
    else setCurrentView('home');
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return products;
    return products.filter(p => 
      (currentLang === 'te' ? p.name_te : p.name).toLowerCase().includes(q)
    );
  }, [products, searchQuery, currentLang]);

  const wishlistProducts = useMemo(() => {
    return products.filter(p => wishlist.includes(p.id));
  }, [products, wishlist]);

  const userOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter(o => o.customerEmail === user.email);
  }, [orders, user]);

  const renderContent = () => {
    if (!products.length && !isDBReady) return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2D5A27] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#2D5A27]">{t.loading}</p>
        </div>
      </div>
    );

    if (user?.role === 'admin' && currentView === 'admin') return (
      <AdminDashboard products={products} orders={orders} onUpdateOrderStatus={handleUpdateOrderStatus} onAddProduct={p => { DB.saveProduct(p); setProducts(DB.getProducts()); }} onUpdateProduct={p => { DB.saveProduct(p); setProducts(DB.getProducts()); }} onDeleteProduct={id => { DB.deleteProduct(id); setProducts(DB.getProducts()); }} lang={currentLang} />
    );

    switch (currentView) {
      case 'shop': return (
        <div className="pt-24 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder={currentLang === 'en' ? "Search for eco items..." : "వస్తువులను వెతకండి..."} 
              className="w-full max-w-xl p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm outline-none focus:ring-2 focus:ring-[#A4C639]"
            />
          </div>
          <ProductList products={filteredProducts} onAddToCart={addToCart} lang={currentLang} isLoading={!isDBReady} wishlist={wishlist} onToggleWishlist={toggleWishlist} />
        </div>
      );
      case 'bulk-enquiry': return <div className="pt-24"><BulkEnquiry /></div>;
      case 'saved-orders': 
        if (!user || user.role !== 'customer') {
          setCurrentView('home');
          return null;
        }
        return (
          <div className="pt-24">
            <SavedOrders 
              orders={userOrders} 
              wishlistProducts={wishlistProducts}
              onAddToCart={addToCart}
              onRemoveFromWishlist={toggleWishlist}
              lang={currentLang} 
              isLoggedIn={!!user} 
              onLogin={() => setShowLogin(true)} 
            />
          </div>
        );
      case 'about': return <div className="pt-24"><About lang={currentLang} /></div>;
      case 'blog-detail': return <div className="pt-0"><BlogDetail blogId="areca-plates" onBack={() => setCurrentView('shop')} lang={currentLang} /></div>;
      default: return (
        <div className="animate-fade-in">
          <Hero 
            onExplore={() => setCurrentView('shop')} 
            onStory={() => setCurrentView('about')}
            lang={currentLang} 
          />
          <Impact />
          <div className="py-24">
             <div className="max-w-7xl mx-auto px-4 text-center mb-16">
               <h2 className="text-4xl font-bold serif text-[#4A3728]">Featured Items</h2>
             </div>
             {/* Only showing top 3 products on the home page as requested */}
             <ProductList products={products.slice(0, 3)} onAddToCart={addToCart} lang={currentLang} isLoading={!isDBReady} wishlist={wishlist} onToggleWishlist={toggleWishlist} />
             <div className="text-center mt-12">
               <button onClick={() => setCurrentView('shop')} className="px-10 py-5 bg-[#FAF9F6] border border-[#2D5A27]/10 text-[#2D5A27] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2D5A27] hover:text-white transition-all shadow-sm">View Entire Shop</button>
             </div>
          </div>
          <About lang={currentLang} />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <nav className="fixed top-0 w-full z-[60] bg-white/80 backdrop-blur-xl border-b border-gray-100 h-24 flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
          <button onClick={() => setCurrentView('home')} className="flex items-center group">
            <Logo className="w-10 h-10" showText={true} lang={currentLang} />
          </button>
          
          <div className="hidden lg:flex items-center space-x-10">
            {[
              { id: 'home', label: t.navHome },
              { id: 'shop', label: t.navShop },
              { id: 'saved-orders', label: t.navSaved, private: true },
              { id: 'bulk-enquiry', label: t.navBulk }
            ].filter(link => !link.private || (user && user.role === 'customer')).map(link => (
              <button 
                key={link.id}
                onClick={() => setCurrentView(link.id as any)}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-[#A4C639] ${currentView === link.id ? 'text-[#2D5A27] border-b-2 border-[#A4C639] pb-1' : 'text-[#2D5A27]/40'}`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex bg-[#FAF9F6] border border-gray-100 rounded-xl p-1 shadow-inner group hover:border-[#A4C639]/30 transition-all">
              <button 
                onClick={() => setCurrentLang('en')} 
                className={`px-4 py-2 rounded-lg text-[9px] font-black transition-all ${currentLang === 'en' ? 'bg-[#2D5A27] text-white shadow-lg' : 'text-gray-400 hover:text-[#2D5A27]'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setCurrentLang('te')} 
                className={`px-4 py-2 rounded-lg text-[9px] font-black transition-all ${currentLang === 'te' ? 'bg-[#2D5A27] text-white shadow-lg' : 'text-gray-400 hover:text-[#2D5A27]'}`}
              >
                తెలుగు
              </button>
            </div>

            <button onClick={() => setIsCartOpen(true)} className={`relative p-3 rounded-full hover:bg-gray-100 transition-all ${cartAnimate ? 'scale-110' : ''}`}>
              <svg className="h-6 w-6 text-[#2D5A27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 bg-[#A4C639] text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartItems.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
                <span className="text-[10px] font-bold text-[#2D5A27] hidden sm:block">Hello, {user.name.split(' ')[0]}</span>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-600 transition-all p-2">✕</button>
              </div>
            ) : (
              <button onClick={() => setShowLogin(true)} className="px-8 py-3.5 bg-[#2D5A27] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-0.5 transition-all">
                {t.login}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="min-h-screen pt-0">{renderContent()}</main>

      <Footer lang={currentLang} onNavigate={setCurrentView} />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        savedItems={savedItems}
        onUpdateQuantity={(id, d) => setCartItems(p => p.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))} 
        onRemove={id => setCartItems(p => p.filter(i => i.id !== id))} 
        onSaveForLater={saveForLater}
        onMoveToCart={moveToCart}
        onRemoveSaved={removeSavedItem}
        onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} 
      />
      {showLogin && <Login onLogin={handleLogin} onCancel={() => setShowLogin(false)} />}
      {isCheckoutOpen && <CheckoutFlow items={cartItems} onComplete={placeOrder} onCancel={() => setIsCheckoutOpen(false)} />}
    </div>
  );
};

export default App;
