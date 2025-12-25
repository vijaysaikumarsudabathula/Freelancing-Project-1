
import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, User, Order, OrderStatus, View, OrderDetails } from './types';
import Hero from './components/Hero';
import ProductList from './components/ProductList';
import CartDrawer from './components/CartDrawer';
import CheckoutFlow from './components/CheckoutFlow';
import EcoAssistant from './components/EcoAssistant';
import Impact from './components/Impact';
import About from './components/About';
import Contact from './components/Contact';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Areca Premium Round Plate (10")',
    price: 349,
    category: 'plates',
    description: 'Our signature product. Hand-pressed from naturally fallen areca leaves. Incredibly durable and 100% compostable.',
    image: 'https://images.unsplash.com/photo-1616612693441-17f160683050?auto=format&fit=crop&q=80&w=800',
    benefits: ['Microwave Safe', 'Heat Resistant', 'Leak Proof']
  },
  {
    id: '2',
    name: 'Areca Square Deep Bowl',
    price: 199,
    category: 'bowls',
    description: 'Perfect for salads, desserts, or gravies. Unique natural grain textures on every single bowl.',
    image: 'https://images.unsplash.com/photo-1591871937573-748af09698d7?auto=format&fit=crop&q=80&w=800',
    benefits: ['Eco Friendly', 'Unique Texture', 'Odorless']
  },
  {
    id: '3',
    name: 'Birchwood Artisanal Cutlery',
    price: 249,
    category: 'cutlery',
    description: 'A set of 12 smooth-finish forks and spoons. A plastic-free alternative that looks stunning on any table.',
    image: 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?auto=format&fit=crop&q=80&w=800',
    benefits: ['BPA Free', 'Smooth Finish', 'Compostable']
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [cartAnimate, setCartAnimate] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentView === 'shop') {
      setIsLoadingCatalog(true);
      const timer = setTimeout(() => setIsLoadingCatalog(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    // Trigger notification and icon animation
    setShowCartNotification(true);
    setCartAnimate(true);
    setTimeout(() => {
      setShowCartNotification(false);
      setCartAnimate(false);
    }, 2000);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setShowLogin(false);
    if (userData.role === 'admin') setCurrentView('admin');
    else setCurrentView('home');
  };

  const handleLogout = () => {
    setUser(null);
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
    setOrders(prev => [newOrder, ...prev]);
    setCartItems([]);
    setIsCheckoutOpen(false);
    setCurrentView('my-orders');
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const filteredProductsBySearch = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const renderView = () => {
    if (user?.role === 'admin' && currentView === 'admin') {
      return (
        <AdminDashboard 
          products={products}
          orders={orders}
          onUpdateOrderStatus={updateOrderStatus}
          onAddProduct={(p) => setProducts([p, ...products])}
          onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
      case 'my-orders':
        return (
          <div className="py-24 max-w-5xl mx-auto px-4 animate-fade-in">
            <div className="flex justify-between items-end mb-16">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A4C639] mb-4 block">Your Journey</span>
                <h2 className="text-6xl font-bold serif text-[#4A3728]">Order History</h2>
              </div>
              <p className="text-[#5D7C52]/60 font-medium italic">Tracing your contribution to the earth.</p>
            </div>
            
            {orders.filter(o => o.customerEmail === user?.email).length === 0 ? (
              <div className="glass-card p-24 text-center">
                 <div className="text-6xl mb-6 opacity-20">📦</div>
                 <h3 className="text-2xl font-bold serif text-[#4A3728] mb-4">No active harvests found</h3>
                 <button onClick={() => setCurrentView('shop')} className="text-[#A4C639] font-black uppercase tracking-widest text-xs border-b-2 border-[#A4C639]/30 pb-1">Start Shopping</button>
              </div>
            ) : (
              <div className="space-y-10">
                {orders.filter(o => o.customerEmail === user?.email).map(order => (
                  <div key={order.id} className="glass-card p-10 border-[#5D7C52]/5 bg-white shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full border shadow-sm ${
                         order.status === 'delivered' ? 'bg-[#A4C639] text-white border-[#A4C639]' : 'bg-white text-[#5D7C52] border-[#5D7C52]/10'
                       }`}>{order.status}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                      <div className="md:col-span-3">
                        <div className="flex gap-4 items-baseline mb-8">
                          <h4 className="text-2xl font-bold serif text-[#4A3728]">Order #{order.id.split('-')[1]}</h4>
                          <span className="text-[10px] font-black text-[#A4C639] uppercase tracking-widest">{order.date}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-6 mb-10">
                          {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-2xl border border-[#5D7C52]/5">
                              <img src={item.image} className="w-14 h-14 organic-shape object-cover border-2 border-white shadow-sm" alt={item.name} />
                              <div>
                                <p className="text-[11px] font-bold text-[#4A3728] leading-tight mb-1">{item.name}</p>
                                <span className="text-[10px] font-black text-[#A4C639] uppercase tracking-widest">Qty: {item.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-8 border-t border-[#5D7C52]/5">
                          <div className="flex items-center gap-6">
                            <div className="flex-1 h-2 bg-[#FAF9F6] rounded-full overflow-hidden relative">
                              <div className={`absolute left-0 top-0 h-full bg-[#5D7C52] transition-all duration-1000 ${
                                order.status === 'pending' ? 'w-1/4' : 
                                order.status === 'processing' ? 'w-1/2' : 
                                order.status === 'shipped' ? 'w-3/4' : 'w-full'
                              }`}></div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5D7C52]/40 whitespace-nowrap">Tracking Status</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#FAF9F6] p-8 rounded-[2.5rem] border border-[#5D7C52]/5 text-center flex flex-col justify-center">
                        <span className="text-[9px] font-black text-[#5D7C52]/30 uppercase tracking-[0.4em] mb-2 block">Value</span>
                        <span className="text-4xl font-bold text-[#5D7C52] serif">₹{order.total}</span>
                        <p className="text-[8px] font-bold text-[#A4C639] uppercase mt-4 tracking-widest">Digital Invoice Sent</p>
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
              <div className="w-12 h-12 bg-[#5D7C52] organic-shape flex items-center justify-center text-white font-bold text-2xl serif group-hover:rotate-12 transition-transform shadow-lg">L</div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-[#4A3728] serif tracking-tight leading-none">LeafyLife</span>
                <span className="text-[8px] font-black text-[#A4C639] uppercase tracking-[0.4em] mt-1">Heritage Store</span>
              </div>
            </button>
            
            <div className="hidden lg:flex space-x-12">
              {[
                { id: 'home', label: 'Home', roles: ['customer', null] },
                { id: 'shop', label: 'Catalog', roles: ['customer', null] },
                { id: 'admin', label: 'Dashboard', roles: ['admin'] },
                { id: 'my-orders', label: 'My Orders', roles: ['customer'] },
                { id: 'contact', label: 'Concierge', roles: ['customer', null] }
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
              <button onClick={() => setIsAssistantOpen(true)} className="group relative">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#5D7C52]/5 transition-all text-[#5D7C52]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-[#4A3728] text-white text-[8px] font-bold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">Eco AI Chat</span>
              </button>

              {user?.role !== 'admin' && (
                <>
                  <button onClick={() => { setCurrentView('shop'); }} className="relative group text-[#5D7C52]">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#5D7C52]/5 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${wishlist.length > 0 ? 'text-red-500 fill-red-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    {wishlist.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-lg ring-2 ring-white animate-in zoom-in duration-300">
                        {wishlist.length}
                      </span>
                    )}
                  </button>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setIsCartOpen(true)} 
                      className={`relative group text-[#5D7C52] transition-all duration-300 ${cartAnimate ? 'scale-110 -translate-y-1' : ''}`}
                    >
                      <div className={`w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#5D7C52]/5 transition-all ${cartAnimate ? 'bg-[#A4C639]/10' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${cartAnimate ? 'rotate-12' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      {cartItems.length > 0 && (
                        <span className={`absolute -top-1 -right-1 bg-[#A4C639] text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-lg ring-2 ring-white transition-all duration-300 ${cartAnimate ? 'scale-125' : 'scale-100'}`}>
                          {cartItems.reduce((a, b) => a + b.quantity, 0)}
                        </span>
                      )}
                    </button>
                    
                    {/* Positioned Cart Addition Floating Toast Message closer to the cart icon */}
                    {showCartNotification && (
                      <div className="absolute top-14 right-0 z-[100] bg-[#4A3728] text-white text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-500 flex items-center gap-3 border border-white/10 whitespace-nowrap origin-top-right">
                        <span className="flex items-center justify-center w-5 h-5 bg-[#A4C639] rounded-full">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        Harvested! 🌿
                      </div>
                    )}
                  </div>
                </>
              )}

              {user ? (
                <div className="flex items-center gap-5 pl-8 border-l border-[#5D7C52]/10 h-10">
                  <div className="text-right">
                    <p className="text-[7px] font-black uppercase tracking-widest text-[#A4C639] leading-none mb-1">{user.role}</p>
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
                  className="px-8 py-3.5 bg-[#5D7C52] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:shadow-[#5D7C52]/20 hover:-translate-y-1 transition-all"
                >
                  Portal Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 min-h-screen">{renderView()}</main>

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
      
      <footer className="bg-white py-32 border-t border-[#5D7C52]/10 mt-auto relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-20 relative z-10">
          <div className="col-span-1 md:col-span-2 space-y-10">
            <h3 className="text-6xl font-bold serif text-[#4A3728]">LeafyLife.</h3>
            <p className="text-[#5D7C52]/60 text-xl max-w-sm leading-relaxed font-medium">Empowering local artisans while restoring balance to our modern dinner tables.</p>
          </div>
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.5em] mb-10 text-[#A4C639]">Artifacts</h4>
            <ul className="space-y-5 text-xs font-bold text-[#5D7C52] uppercase tracking-widest">
              <li><button onClick={() => setCurrentView('shop')} className="hover:text-[#A4C639] transition-all">Palm Plates</button></li>
              <li><button onClick={() => setCurrentView('shop')} className="hover:text-[#A4C639] transition-all">Artisan Bowls</button></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
