
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  isLoading?: boolean;
}

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-[#5D7C52]/5 rounded-xl ${className}`}></div>
);

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  onAddToCart, 
  wishlist = [], 
  onToggleWishlist,
  isLoading = false
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'all', label: 'All Artifacts', icon: '🌿' },
    { id: 'wishlist', label: 'Saved Items', icon: '❤️' },
    { id: 'plates', label: 'Premium Plates', icon: '🍽️' },
    { id: 'bowls', label: 'Artisan Bowls', icon: '🥣' },
    { id: 'cutlery', label: 'Birch Cutlery', icon: '🍴' },
    { id: 'sets', label: 'Gifting Sets', icon: '🎁' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDescription = (id: string) => {
    setExpandedDescriptions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const handleAddToCart = (product: Product) => {
    setAddingToCartId(product.id);
    onAddToCart(product);
    // Reset state after 2 seconds
    setTimeout(() => {
      setAddingToCartId(null);
    }, 2000);
  };

  const getProductCount = (categoryId: string) => {
    return products.filter(p => {
      if (categoryId === 'all') return true;
      if (categoryId === 'wishlist') return wishlist.includes(p.id);
      return p.category === categoryId;
    }).length;
  };

  const filteredProducts = products.filter(p => {
    let categoryMatch = activeCategory === 'all' || p.category === activeCategory;
    if (activeCategory === 'wishlist') categoryMatch = wishlist.includes(p.id);
    return categoryMatch;
  });

  const activeCategoryData = categories.find(c => c.id === activeCategory) || categories[0];

  return (
    <section id="shop" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-24 gap-12">
          <div className="max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A4C639] mb-4 block">Seasonal Selection</span>
            <h2 className="text-5xl md:text-6xl font-bold text-[#4A3728] mb-6 serif leading-tight">Tableware for <br /><span className="italic font-normal">Modern Living.</span></h2>
            <p className="text-[#5D7C52] font-medium text-lg leading-relaxed">
              Explore our curated collection of Areca artifacts, crafted with the precision of nature and the heart of heritage.
            </p>
          </div>
          
          <div className="w-full lg:w-auto space-y-10">
            <div className="relative" ref={dropdownRef}>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A4C639] mb-3 block">Filter by Category</span>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full lg:w-80 flex items-center justify-between px-8 py-5 rounded-[1.5rem] bg-white border-2 transition-all shadow-sm hover:shadow-lg ${isDropdownOpen ? 'border-[#5D7C52] ring-4 ring-[#5D7C52]/5' : 'border-[#5D7C52]/10'}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl opacity-70">{activeCategoryData.icon}</span>
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#4A3728]">{activeCategoryData.label}</span>
                    <span className="block text-[8px] font-bold text-[#A4C639] uppercase tracking-tighter">
                      {isLoading ? 'Scanning forest...' : `${getProductCount(activeCategory)} Artifacts found`}
                    </span>
                  </div>
                </div>
                <svg className={`w-4 h-4 text-[#5D7C52] transition-transform duration-500 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-3 w-full bg-white rounded-[2.5rem] shadow-2xl border border-[#5D7C52]/10 p-4 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${
                          activeCategory === cat.id 
                            ? 'bg-[#5D7C52] text-white shadow-md' 
                            : 'text-[#5D7C52] hover:bg-[#FAF9F6]'
                        }`}
                      >
                        <span className="flex items-center gap-4">
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-md ${
                          activeCategory === cat.id ? 'bg-white/20' : 'bg-[#5D7C52]/5'
                        }`}>
                          {getProductCount(cat.id)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col h-full bg-white rounded-[3rem] p-6 border border-[#5D7C52]/5 shadow-sm">
                <Skeleton className="h-[24rem] organic-shape mb-8" />
                <div className="px-2 space-y-4 mb-8">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                <Skeleton className="h-14 w-full mt-auto" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-32 text-center glass-card border-dashed border-[#5D7C52]/20 animate-fade-in">
            <div className="text-7xl mb-6 opacity-30">{activeCategory === 'wishlist' ? '❤️' : '🍃'}</div>
            <h3 className="text-2xl font-bold serif text-[#4A3728] mb-2">
              {activeCategory === 'wishlist' ? 'Your Wishlist is Empty' : 'No items match your criteria'}
            </h3>
            <p className="text-[#5D7C52]/60 font-medium">
              Try adjusting your filters to discover more sustainable treasures.
            </p>
            <button 
              onClick={() => { setActiveCategory('all'); }}
              className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#A4C639] border-b-2 border-[#A4C639]/30 pb-1 hover:text-[#5D7C52] hover:border-[#5D7C52] transition-all"
            >
              Reset Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {filteredProducts.map(product => {
              const isWishlisted = wishlist.includes(product.id);
              const isExpanded = expandedDescriptions[product.id];
              const isImageLoaded = loadedImages[product.id];
              const isRecentlyAdded = addingToCartId === product.id;
              
              return (
                <div key={product.id} className="group flex flex-col h-full animate-fade-in bg-white rounded-[3rem] p-6 shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#5D7C52]/5">
                  <div className="relative h-[24rem] mb-8 overflow-hidden organic-shape shadow-lg bg-white border-4 border-white transition-all duration-700">
                    {!isImageLoaded && <Skeleton className="absolute inset-0 z-10 w-full h-full" />}
                    
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      onLoad={() => handleImageLoad(product.id)}
                      className={`w-full h-full object-cover transition-all duration-[800ms] cubic-bezier(0.25, 0.46, 0.45, 0.94) group-hover:scale-[1.12] group-hover:brightness-[1.05] ${
                        isImageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#4A3728]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist?.(product.id);
                      }}
                      className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl z-20 ${
                        isWishlisted 
                          ? 'bg-red-500 text-white scale-110' 
                          : 'bg-white/90 backdrop-blur-md text-[#5D7C52] hover:bg-white hover:scale-110'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex-1 px-2 mb-8">
                    <div className="flex justify-between items-start mb-4">
                      <div className="max-w-[70%]">
                        <h3 className="text-2xl font-bold serif text-[#4A3728] leading-tight mb-1">{product.name}</h3>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#A4C639]">{product.category}</span>
                      </div>
                      <span className="text-2xl font-bold text-[#5D7C52] serif">₹{product.price}</span>
                    </div>

                    <div className="relative">
                      <p className={`text-[#5D7C52]/70 text-sm leading-relaxed mb-2 italic transition-all duration-500 ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {product.description}
                      </p>
                      <button 
                        onClick={() => toggleDescription(product.id)}
                        className="text-[9px] font-black uppercase tracking-widest text-[#A4C639] hover:text-[#5D7C52] transition-colors mb-6"
                      >
                        {isExpanded ? 'Show Less' : 'Read More Details'}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {product.benefits.map((benefit, i) => (
                        <span key={i} className="text-[8px] font-black uppercase tracking-[0.2em] text-[#5D7C52] bg-[#FAF9F6] border border-[#5D7C52]/10 px-3 py-1.5 rounded-lg shadow-sm">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="relative group/btn">
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={isRecentlyAdded}
                      className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl mt-auto transition-all duration-700 flex items-center justify-center gap-3 transform active:scale-90 relative overflow-hidden ${
                        isRecentlyAdded 
                          ? 'bg-[#5D7C52] text-white scale-[1.05] shadow-[#5D7C52]/30 cursor-default' 
                          : 'bg-[#A4C639] hover:bg-[#5D7C52] text-white hover:shadow-[#A4C639]/40 border-2 border-white/20'
                      }`}
                    >
                      {isRecentlyAdded ? (
                        <div className="flex items-center gap-2 animate-in zoom-in spin-in-1 duration-500 z-10">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                          </svg>
                          Added to Bag!
                        </div>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add to Cart
                        </>
                      )}
                      
                      {isRecentlyAdded && (
                        <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
                          <div className="h-full bg-white animate-[progress_2s_linear_forwards]"></div>
                        </div>
                      )}
                    </button>
                    
                    {/* Visual burst effect on click */}
                    {isRecentlyAdded && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[#A4C639] rounded-full animate-[burst_0.6s_ease-out_forwards]"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[#5D7C52] rounded-full animate-[burst_0.6s_ease-out_0.1s_forwards]"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes burst {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(40); opacity: 0; }
        }
      `}</style>
    </section>
  );
};

export default ProductList;
