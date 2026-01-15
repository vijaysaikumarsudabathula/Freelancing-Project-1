
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
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement | null>(null);
  const logoutTimerRef = useRef<number | null>(null);

  const t = {
    en: { 
      navHome: "Home", 
      navShop: "Collections", 
      navSaved: "My Orders", 
      navBulk: "Bulk Enquiries",
      login: "Member Access", 
      loading: "Harvesting quality items...",
      copyright: "© 2024 Deepthi Enterprises",
      sessionExpMsg: "Session expired for security."
    },
    te: { 
      navHome: "హోమ్", 
      navShop: "వస్తువులు", 
      navSaved: "నా ఆర్డర్లు", 
      navBulk: "బల్క్ ఆర్డర్",
      login: "లాగిన్", 
      loading: "సిద్ధమవుతోంది...",
      copyright: "© 2024 దీప్తి ఎంటర్‌ప్రైజెస్",
      sessionExpMsg: "సెషన్ గడువు ముగిసింది."
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
      try {
        await DB.initDatabase();
        const dbProducts = await DB.getProductsAsync();
        setProducts(dbProducts);
        const dbOrders = await DB.getOrdersAsync();
        setOrders(dbOrders);
        
        const savedCart = localStorage.getItem('deepthi_cart');
        if (savedCart) setCartItems(JSON.parse(savedCart));

        const savedLater = localStorage.getItem('deepthi_saved_later');
        if (savedLater) setSavedItems(JSON.parse(savedLater));

        const savedWishlist = localStorage.getItem('deepthi_wishlist');
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
        
        setTimeout(() => setIsDBReady(true), 800);
      } catch (err) {
        console.error('❌ Failed to initialize database:', err);
        alert('⚠️ Backend server not running!\n\nPlease start the server:\ncd server && npm start');
        setTimeout(() => setIsDBReady(true), 800);
      }
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

  const placeOrder = async (orderDetails: OrderDetails) => {
    try {
      const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
      const tax = Math.round(subtotal * 0.05);
      const shipping = subtotal > 1500 ? 0 : 150;
      const total = subtotal + tax + shipping;
      
      const orderId = `ORD-${Date.now()}`;
      const newOrder: Order = {
        id: orderId,
        items: [...cartItems],
        total,
        status: 'pending',
        date: new Date().toLocaleDateString('en-IN'),
        customerEmail: user?.email || orderDetails.email,
        ...(user ? { customerId: user.id } : {}),
        shippingAddress: orderDetails.address,
        paymentMethod: orderDetails.cardNumber ? 'card' : 'upi',
        paymentId: `PAY-${Math.floor(Math.random() * 1000000)}`,
        trackingHistory: [{ status: 'pending', timestamp: new Date().toISOString(), note: 'Order received. Awaiting dispatch.' }]
      } as Order & { customerId?: string };

      // Save order to database
      await DB.addOrder(newOrder);

      // If logged in, save shipping address and card summary
      if (user) {
        const addr = {
          id: `addr-${Date.now()}`,
          name: orderDetails.cardName || user.name,
          phone: '',
          address: orderDetails.address,
          city: orderDetails.city || '',
          state: '',
          pincode: orderDetails.zipCode || '',
          isDefault: false
        };
        await DB.addAddress(user.id, addr);

        if (orderDetails.cardNumber && orderDetails.cardNumber.length >= 4) {
          const last4 = orderDetails.cardNumber.slice(-4);
          const card = { id: `card-${Date.now()}`, last4, brand: 'card', expiry: orderDetails.expiry };
          await DB.addSavedCard(user.id, card);
        }
      }

      // Refresh orders list
      const updatedOrders = await DB.getOrdersAsync();
      setOrders(updatedOrders);
      
      setCartItems([]);
      setIsCheckoutOpen(false);
      setCurrentView('saved-orders');
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: OrderStatus, trackingId?: string) => {
    try {
      await DB.updateOrderStatus(id, status, trackingId);
      const updatedOrders = await DB.getOrdersAsync();
      setOrders(updatedOrders);
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    DB.setActiveUserDB(userData);
    setShowLogin(false);
    if (userData.role === 'admin') setCurrentView('admin');
    else setCurrentView('home');
  };

  // Ensure we scroll to the top whenever the view changes so new pages start at the top
  useEffect(() => {
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  }, [currentView]);

  // Close user dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!userDropdownRef.current) return;
      if (e.target instanceof Node && !userDropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowUserDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#108242] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#108242]">{t.loading}</p>
        </div>
      </div>
    );

    if (user?.role === 'admin' && currentView === 'admin') return (
      <div className="pt-24">
        <AdminDashboard products={products} orders={orders} onUpdateOrderStatus={handleUpdateOrderStatus} onAddProduct={p => { DB.addProduct(p).then(() => { DB.getProductsAsync().then(setProducts); }); }} onUpdateProduct={p => { DB.updateProduct(p).then(() => { DB.getProductsAsync().then(setProducts); }); }} onDeleteProduct={id => { DB.deleteProduct(id).then(() => { DB.getProductsAsync().then(setProducts); }); }} lang={currentLang} />
      </div>
    );

    switch (currentView) {
      case 'shop': return (
        <div className="pt-24 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <h1 className="text-5xl font-bold serif text-[#4A3728] mb-12 text-center">Our Collections</h1>
            <div className="flex justify-center mb-12">
               <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder={currentLang === 'en' ? "What are you looking for?" : "వస్తువులను వెతకండి..."} 
                className="w-full max-w-xl p-6 bg-white border border-[#108242]/10 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-[#A4C639] text-sm font-medium"
               />
            </div>
          </div>
          <ProductList products={filteredProducts} onAddToCart={addToCart} lang={currentLang} isLoading={!isDBReady} wishlist={wishlist} onToggleWishlist={toggleWishlist} />
        </div>
      );
      case 'bulk-enquiry': return <div className="pt-24"><BulkEnquiry /></div>;
      case 'saved-orders': 
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
      default: return (
        <div className="animate-fade-in">
          <Hero 
            onExplore={() => setCurrentView('shop')} 
            onStory={() => setCurrentView('about')}
            lang={currentLang} 
          />
          <Impact />
          <div className="py-32">
             <div className="max-w-7xl mx-auto px-4 text-center mb-20">
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-4 block">Hand-Picked for You</span>
               <h2 className="text-5xl font-bold serif text-[#4A3728]">Selected Discoveries</h2>
             </div>
             <ProductList products={products.slice(0, 4)} onAddToCart={addToCart} lang={currentLang} isLoading={!isDBReady} wishlist={wishlist} onToggleWishlist={toggleWishlist} />
             <div className="text-center mt-20">
               <button onClick={() => setCurrentView('shop')} className="btn-leaf px-12 py-5 text-[10px] font-black uppercase tracking-widest shadow-2xl">View Entire Catalog</button>
             </div>
          </div>
          <About lang={currentLang} />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <nav className="fixed top-0 w-full z-[60] bg-white/90 backdrop-blur-xl border-b border-[#108242]/5 flex flex-col">
        <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center py-3 md:py-4">
          <button onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); }} className="flex items-center group scale-75 md:scale-100">
            <img
              src="/scr/images/deepthi-logo.png"
              alt="Deepthi"
              className="w-16 md:w-24 h-auto object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/deepthi-logo.png'; }}
            />
          </button>
          
          <div className="hidden lg:flex items-center space-x-12">
            {[
              { id: 'home', label: t.navHome },
              { id: 'shop', label: t.navShop },
              { id: 'saved-orders', label: t.navSaved },
              { id: 'bulk-enquiry', label: t.navBulk }
            ].map(link => (
              <button 
                key={link.id}
                onClick={() => setCurrentView(link.id as any)}
                className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-[#108242] ${currentView === link.id ? 'text-[#108242] border-b-2 border-[#A4C639] pb-1' : 'text-[#108242]/30'}`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 md:space-x-6">
            <div className="hidden sm:flex bg-[#FAF9F6] border border-gray-100 rounded-2xl p-1 shadow-inner">
              <button 
                onClick={() => setCurrentLang('en')} 
                className={`px-2 md:px-4 py-2 rounded-xl text-[8px] md:text-[9px] font-black transition-all ${currentLang === 'en' ? 'bg-[#108242] text-white shadow-lg' : 'text-gray-400 hover:text-[#108242]'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setCurrentLang('te')} 
                className={`px-2 md:px-4 py-2 rounded-xl text-[8px] md:text-[9px] font-black transition-all ${currentLang === 'te' ? 'bg-[#108242] text-white shadow-lg' : 'text-gray-400 hover:text-[#108242]'}`}
              >
                TE
              </button>
            </div>

            <button onClick={() => setIsCartOpen(true)} className={`relative p-2 md:p-3 rounded-full hover:bg-[#FAF9F6] transition-all ${cartAnimate ? 'scale-110' : ''}`}>
              <svg className="h-5 md:h-6 w-5 md:w-6 text-[#108242]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 bg-[#A4C639] text-white text-[7px] md:text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartItems.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>

            {user ? (
              <div ref={userDropdownRef} className="flex items-center gap-2 md:gap-4 border-l border-gray-100 pl-2 md:pl-6 relative">
                <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="w-8 md:w-10 h-8 md:h-10 bg-[#FAF9F6] rounded-full flex items-center justify-center text-lg md:text-xl hover:scale-105 transition-transform border border-gray-100 shadow-sm">👤</button>
                
                {showUserDropdown && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#108242]/10 overflow-hidden z-50 min-w-40 md:min-w-48">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#2D5A27]">{user.name}</p>
                      <p className="text-[7px] md:text-[8px] text-gray-400 mt-1 truncate">{user.email}</p>
                    </div>
                    
                    <button 
                      onClick={() => { setCurrentView('saved-orders'); setShowUserDropdown(false); }} 
                      className="w-full px-4 py-3 text-left text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-[#2D5A27] hover:bg-[#FAF9F6] transition-colors border-b border-gray-50"
                    >
                      📦 My Orders
                    </button>
                    
                    {user.role === 'admin' && (
                      <button 
                        onClick={() => { setCurrentView('admin'); setShowUserDropdown(false); }} 
                        className="w-full px-4 py-3 text-left text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-[#A4C639] hover:bg-[#FAF9F6] transition-colors border-b border-gray-50"
                      >
                        ⚙️ Admin Dashboard
                      </button>
                    )}
                    
                    <button 
                      onClick={() => { handleLogout(); setShowUserDropdown(false); }} 
                      className="w-full px-4 py-3 text-left text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setShowLogin(true)} className="hidden sm:block px-4 md:px-8 py-2 md:py-4 bg-[#108242] text-white rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#108242]/20 hover:-translate-y-0.5 transition-all">
                {t.login}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#FAF9F6] transition-all"
            >
              <svg className="w-6 h-6 text-[#108242]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-4">
            {[
              { id: 'home', label: t.navHome },
              { id: 'shop', label: t.navShop },
              { id: 'saved-orders', label: t.navSaved },
              { id: 'bulk-enquiry', label: t.navBulk }
            ].map(link => (
              <button 
                key={link.id}
                onClick={() => { setCurrentView(link.id as any); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${currentView === link.id ? 'bg-[#108242] text-white' : 'text-[#108242]/60 hover:bg-[#FAF9F6]'}`}
              >
                {link.label}
              </button>
            ))}
            <div className="flex gap-2 pt-3 border-t border-gray-100 sm:hidden">
              <button 
                onClick={() => { setCurrentLang('en'); setIsMobileMenuOpen(false); }} 
                className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all ${currentLang === 'en' ? 'bg-[#108242] text-white' : 'bg-[#FAF9F6] text-gray-400'}`}
              >
                EN
              </button>
              <button 
                onClick={() => { setCurrentLang('te'); setIsMobileMenuOpen(false); }} 
                className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all ${currentLang === 'te' ? 'bg-[#108242] text-white' : 'bg-[#FAF9F6] text-gray-400'}`}
              >
                TE
              </button>
            </div>
            {!user && (
              <button onClick={() => { setShowLogin(true); setIsMobileMenuOpen(false); }} className="w-full mt-2 px-4 py-3 bg-[#108242] text-white rounded-xl text-[9px] font-black uppercase tracking-widest sm:hidden">
                {t.login}
              </button>
            )}
          </div>
        )}
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
      {isCheckoutOpen && <CheckoutFlow items={cartItems} onComplete={placeOrder} onCancel={() => setIsCheckoutOpen(false)} user={user} onLoginRequired={() => { setIsCheckoutOpen(false); setShowLogin(true); }} />}
    </div>
  );
};

export default App;
