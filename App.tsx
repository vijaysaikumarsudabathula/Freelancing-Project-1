
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, CartItem, User, Order, OrderStatus, View, OrderDetails } from './types';
import Hero from './components/Hero';
import ProductList from './components/ProductList';
import CartDrawer from './components/CartDrawer';
import CheckoutFlow from './components/CheckoutFlow';
import EcoAssistant from './components/EcoAssistant';
import Impact from './components/Impact';
import About from './components/About';
import Contact from './components/Contact';
import BulkEnquiry from './components/BulkEnquiry';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import * as DB from './services/database';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isDBReady, setIsDBReady] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [cartAnimate, setCartAnimate] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    const startup = async () => {
      await DB.initDatabase();
      setProducts(DB.getProducts());
      setOrders(DB.getOrders());
      setWishlist(DB.getWishlist());
      setUser(DB.getActiveUser());
      
      const savedCart = localStorage.getItem('leafylife_cart');
      if (savedCart) setCartItems(JSON.parse(savedCart));
      
      setIsDBReady(true);
    };
    startup();
  }, []);

  useEffect(() => {
    if (isDBReady) localStorage.setItem('leafylife_cart', JSON.stringify(cartItems));
  }, [cartItems, isDBReady]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentView === 'shop') {
      setIsLoadingCatalog(true);
      const timer = setTimeout(() => setIsLoadingCatalog(false), 800);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  // --- DATABASE WRAPPERS ---
  const addToCart = useCallback((product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    setShowCartNotification(true);
    setCartAnimate(true);
    setTimeout(() => {
      setShowCartNotification(false);
      setCartAnimate(false);
    }, 2000);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    DB.toggleWishlistDB(productId);
    setWishlist(DB.getWishlist());
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    DB.setActiveUserDB(userData);
    setShowLogin(false);
    if (userData.role === 'admin') setCurrentView('admin');
    else setCurrentView('home');
  };

  const handleLogout = () => {
    setUser(null);
    DB.setActiveUserDB(null);
    setCurrentView('home');
  };

  const placeOrder = (orderDetails: OrderDetails) => {
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      items: [...cartItems],
      total: cartItems.reduce((s, i) => s + i.price * i.quantity, 0) + Math.round(cartItems.reduce((s, i) => s + i.price * i.quantity, 0) * 0.05),
      status: 'pending',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      customerEmail: user?.email || 'guest@example.com',
      shippingAddress: `${orderDetails.address}, ${orderDetails.city} - ${orderDetails.zipCode}`
    };
    DB.addOrder(newOrder);
    setOrders(DB.getOrders());
    setCartItems([]);
    setIsCheckoutOpen(false);
    setCurrentView('my-orders');
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    DB.updateOrderStatus(orderId, status);
    setOrders(DB.getOrders());
  };

  const updateProduct = (updatedProduct: Product) => {
    DB.saveProduct(updatedProduct);
    setProducts(DB.getProducts());
  };

  const addProduct = (p: Product) => {
    DB.saveProduct(p);
    setProducts(DB.getProducts());
  };

  const deleteProduct = (id: string) => {
    DB.deleteProduct(id);
    setProducts(DB.getProducts());
  };

  const filteredProductsBySearch = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const renderView = () => {
    if (!isDBReady) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
           <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-4 border-[#5D7C52] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#5D7C52]">Connecting to SQLite...</p>
           </div>
        </div>
      );
    }

    if (user?.role === 'admin' && currentView === 'admin') {
      return (
        <AdminDashboard 
          products={products}
          orders={orders}
          onUpdateOrderStatus={updateOrderStatus}
          onAddProduct={addProduct}
          onUpdateProduct={updateProduct}
          onDeleteProduct={deleteProduct}
        />
      );
    }

    switch (currentView) {
      case 'home':
        return (
          <div className="animate-fade-in">
            <Hero />
            <section className="bg-white py-32">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-24 max-w-3xl mx-auto">
                   <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-4 block">Our Process</span>
                   <h2 className="text-6xl font-bold mb-10 serif text-[#4A3728]">Honoring the <br /><span className="italic font-normal">Fallen Leaf.</span></h2>
                   <p className="text-[#5D7C52] text-xl leading-relaxed">We wait for nature to provide. Each piece is a sustainable gift from the forest floor.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                  {[
                    { title: "Artisanally Pressed", desc: "Hand-pressed using techniques passed down for generations.", icon: "🍃" },
                    { title: "Purely Organic", desc: "Absolutely no dyes, waxes, or glues. Just pure leaf.", icon: "✨" },
                    { title: "Rapid Compost", desc: "Returns completely to the earth within 60 days.", icon: "♻️" }
                  ].map((feature, i) => (
                    <div key={i} className="text-center group">
                      <div className="w-24 h-24 organic-shape bg-[#FAF9F6] flex items-center justify-center mx-auto mb-10 text-4xl shadow-lg border border-white group-hover:bg-[#A4C639]/10 transition-colors">{feature.icon}</div>
                      <h3 className="text-2xl font-bold mb-6 serif text-[#4A3728]">{feature.title}</h3>
                      <p className="text-[#5D7C52]/70 leading-relaxed font-medium">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <ProductList 
              products={products.slice(0, 3)} 
              onAddToCart={addToCart} 
              wishlist={wishlist} 
              onToggleWishlist={toggleWishlist} 
            />
            <Impact />
          </div>
        );
      case 'shop':
        return (
          <div className="animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 pt-16">
              <div className="relative max-w-2xl">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for artifacts (e.g. 'Plates')..."
                  className="w-full p-6 pl-16 bg-white border border-[#5D7C52]/10 rounded-[2rem] text-sm font-bold text-[#4A3728] focus:ring-4 focus:ring-[#A4C639]/5 outline-none transition-all shadow-sm"
                />
                <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5D7C52]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <ProductList 
              products={filteredProductsBySearch} 
              onAddToCart={addToCart} 
              wishlist={wishlist} 
              onToggleWishlist={toggleWishlist}
              isLoading={isLoadingCatalog}
            />
          </div>
        );
      case 'about': return <About />;
      case 'contact': return <Contact />;
      case 'bulk-enquiry': return <BulkEnquiry />;
      case 'my-orders':
        return (
          <div className="py-24 max-w-5xl mx-auto px-4 animate-fade-in">
            <div className="flex justify-between items-end mb-16">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A4C639] mb-4 block">Order Management</span>
                <h2 className="text-6xl font-bold serif text-[#4A3728]">Purchases & Tracking</h2>
              </div>
              <div className="text-right hidden sm:block">
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-1">Authenticated as</p>
                 <p className="text-sm font-bold text-[#4A3728]">{user?.email}</p>
              </div>
            </div>
            
            {orders.filter(o => o.customerEmail === user?.email).length === 0 ? (
              <div className="glass-card p-24 text-center">
                 <div className="text-6xl mb-6 opacity-20">📦</div>
                 <h3 className="text-2xl font-bold serif text-[#4A3728] mb-4">No active harvests found</h3>
                 <p className="text-[#5D7C52]/60 mb-8 max-w-xs mx-auto">Your order history is currently empty. Start your sustainable journey today.</p>
                 <button onClick={() => setCurrentView('shop')} className="btn-leaf px-10 py-4 text-[10px] font-black uppercase tracking-widest shadow-xl">Start Shopping</button>
              </div>
            ) : (
              <div className="space-y-12">
                {orders.filter(o => o.customerEmail === user?.email).map(order => (
                  <div key={order.id} className="glass-card p-10 border-[#5D7C52]/5 bg-white shadow-sm overflow-hidden relative group hover:shadow-xl transition-all">
                    <div className="absolute top-0 right-0 p-8">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full border shadow-sm transition-colors ${
                         order.status === 'delivered' ? 'bg-[#A4C639] text-white border-[#A4C639]' : 
                         order.status === 'shipped' ? 'bg-[#5D7C52] text-white border-[#5D7C52]' :
                         order.status === 'processing' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                         'bg-[#FAF9F6] text-[#5D7C52] border-[#5D7C52]/10'
                       }`}>{order.status}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                      <div className="md:col-span-3">
                        <div className="flex gap-4 items-baseline mb-8">
                          <h4 className="text-2xl font-bold serif text-[#4A3728]">Harvest #{order.id.split('-')[1]}</h4>
                          <span className="text-[10px] font-black text-[#A4C639] uppercase tracking-widest">{order.date}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-6 mb-12">
                          {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-2xl border border-[#5D7C52]/5 group-hover:bg-white transition-colors">
                              <img src={item.image} className="w-14 h-14 organic-shape object-cover border-2 border-white shadow-sm" alt={item.name} />
                              <div>
                                <p className="text-[11px] font-bold text-[#4A3728] leading-tight mb-1">{item.name}</p>
                                <span className="text-[10px] font-black text-[#A4C639] uppercase tracking-widest">Qty: {item.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-10 border-t border-[#5D7C52]/5">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.3em] text-[#5D7C52]/40 mb-4">
                            <span>Placed</span>
                            <span>Processed</span>
                            <span>In Transit</span>
                            <span>At Doorstep</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex-1 h-1.5 bg-[#FAF9F6] rounded-full overflow-hidden relative">
                              <div className={`absolute left-0 top-0 h-full bg-[#5D7C52] transition-all duration-[2000ms] ease-out ${
                                order.status === 'pending' ? 'w-[5%]' : 
                                order.status === 'processing' ? 'w-[40%]' : 
                                order.status === 'shipped' ? 'w-[75%]' : 'w-full'
                              }`}></div>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-[#A4C639] animate-ping"></div>
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5D7C52] whitespace-nowrap">Live Updates</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#FAF9F6] p-10 rounded-[3rem] border border-[#5D7C52]/5 text-center flex flex-col justify-center group-hover:bg-white transition-colors shadow-inner">
                        <span className="text-[9px] font-black text-[#5D7C52]/30 uppercase tracking-[0.4em] mb-2 block">Value Paid</span>
                        <span className="text-5xl font-bold text-[#5D7C52] serif">₹{order.total}</span>
                        <div className="mt-8 pt-8 border-t border-[#5D7C52]/10">
                          <p className="text-[9px] font-bold text-[#A4C639] uppercase tracking-widest leading-relaxed">Tax Invoiced &<br />Eco-Certified</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default: return <Hero />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] selection:bg-[#A4C639] selection:text-white">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-[#5D7C52]/10 h-24 flex items-center transition-all">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="flex justify-between items-center">
            <button onClick={() => setCurrentView('home')} className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-[#5D7C52] organic-shape flex items-center justify-center text-white font-bold text-2xl serif group-hover:rotate-12 transition-transform shadow-lg">V</div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-[#4A3728] serif tracking-tight leading-none">Vistaraku</span>
                <span className="text-[8px] font-black text-[#A4C639] uppercase tracking-[0.4em] mt-1">Heritage Store</span>
              </div>
            </button>
            
            <div className="hidden lg:flex space-x-12">
              {[
                { id: 'home', label: 'Home', roles: ['customer', 'admin', null] },
                { id: 'shop', label: 'Store', roles: ['customer', 'admin', null] },
                { id: 'bulk-enquiry', label: 'Bulk Enquiry', roles: ['customer', 'admin', null] },
                { id: 'admin', label: 'Admin', roles: ['admin'] },
                { id: 'my-orders', label: 'Orders', roles: ['customer', 'admin'] }
              ].filter(link => !link.roles || link.roles.includes(user?.role as any)).map(page => (
                <button 
                  key={page.id}
                  onClick={() => setCurrentView(page.id as any)}
                  className={`text-[9px] font-black uppercase tracking-[0.4em] transition-all relative group h-24 flex items-center ${
                    currentView === page.id ? 'text-[#5D7C52]' : 'text-[#5D7C52]/40 hover:text-[#5D7C52]'
                  }`}
                >
                  {page.label}
                  <div className={`absolute bottom-0 left-0 h-1 bg-[#A4C639] transition-all duration-500 rounded-full ${
                    currentView === page.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></div>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setIsCartOpen(true)} 
                className={`relative group text-[#5D7C52] transition-all duration-300 ${cartAnimate ? 'scale-110 -translate-y-1' : ''}`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#5D7C52]/5 transition-all ${cartAnimate ? 'bg-[#A4C639]/10' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#A4C639] text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-lg ring-2 ring-white">
                    {cartItems.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-5 pl-8 border-l border-[#5D7C52]/10 h-10">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-[#4A3728]">{user.name.split(' ')[0]}</p>
                  </div>
                  <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center bg-red-50 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowLogin(true)}
                  className="px-8 py-3.5 bg-[#5D7C52] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:shadow-[#5D7C52]/20 transition-all"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 min-h-screen">
        {!isDBReady ? (
           <div className="min-h-[80vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#A4C639] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#5D7C52]">Spinning up SQL engine...</span>
              </div>
           </div>
        ) : renderView()}
      </main>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onUpdateQuantity={(id, delta) => setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item))}
        onRemove={(id) => setCartItems(prev => prev.filter(item => item.id !== id))}
        onCheckout={() => {
          if (!user) setShowLogin(true);
          else { setIsCartOpen(false); setIsCheckoutOpen(true); }
        }}
      />

      <EcoAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
      {showLogin && <Login onLogin={handleLogin} onCancel={() => setShowLogin(false)} />}
      {isCheckoutOpen && <CheckoutFlow items={cartItems} onComplete={placeOrder} onCancel={() => setIsCheckoutOpen(false)} />}
      
      <footer className="bg-white py-20 border-t border-[#5D7C52]/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-2 mb-6 opacity-30">
            <div className="w-1.5 h-1.5 rounded-full bg-[#5D7C52]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#5D7C52]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#5D7C52]"></div>
          </div>
          <h3 className="text-4xl font-bold serif text-[#4A3728] mb-4">Vistaraku.</h3>
          <p className="text-[#5D7C52]/60 text-sm font-medium uppercase tracking-[0.2em] mb-4">Earth Conscious Tableware</p>
          <div className="flex justify-center gap-8 text-[9px] font-bold text-[#5D7C52]/40 uppercase tracking-widest mb-8">
            <button onClick={() => setCurrentView('about')} className="hover:text-[#A4C639]">Heritage</button>
            <button onClick={() => setCurrentView('shop')} className="hover:text-[#A4C639]">Artifacts</button>
            <button onClick={() => setCurrentView('bulk-enquiry')} className="hover:text-[#A4C639]">Bulk Enquiry</button>
            <button onClick={() => setCurrentView('contact')} className="hover:text-[#A4C639]">Contact</button>
          </div>
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#FAF9F6] border border-[#5D7C52]/10 rounded-full">
            <div className="w-2 h-2 bg-[#A4C639] rounded-full"></div>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#5D7C52]/40">SQLite Relational Engine Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
