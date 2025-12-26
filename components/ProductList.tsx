
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  isLoading?: boolean;
}

const Skeleton: React.FC<{ className?: string, circle?: boolean }> = ({ className, circle }) => (
  <div className={`relative overflow-hidden bg-[#5D7C52]/5 ${circle ? 'rounded-full' : 'rounded-2xl'} ${className}`}>
    <div className="absolute inset-0 shimmer-bg"></div>
  </div>
);

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  onAddToCart, 
  wishlist = [], 
  onToggleWishlist,
  isLoading = false
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
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

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const handleAddToCart = (product: Product) => {
    setAddingToCartId(product.id);
    onAddToCart(product);
    setTimeout(() => {
      setAddingToCartId(null);
    }, 2000);
  };

  const toggleDescription = (id: string) => {
    setExpandedDescriptions(prev => ({ ...prev, [id]: !prev[id] }));
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
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A4C639] mb-4 block">Nature's Best</span>
            <h2 className="text-5xl md:text-6xl font-bold text-[#4A3728] mb-6 serif leading-tight">Artisanal Choice <br /><span className="italic font-normal">Eco Tableware.</span></h2>
            <p className="text-[#5D7C52] font-medium text-lg leading-relaxed">
              Every piece supports a circular economy. Clearly crafted for sustainability.
            </p>
          </div>
          
          <div className="w-full lg:w-auto self-end">
            <div className="relative" ref={dropdownRef}>
              <div className="mb-3 ml-6">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#A4C639]">Filter by Category</span>
              </div>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`group w-full lg:w-[340px] flex items-center justify-between p-2 pr-8 rounded-[2rem] bg-white border-2 transition-all shadow-xl hover:shadow-[#A4C639]/10 ${isDropdownOpen ? 'border-[#5D7C52] ring-4 ring-[#5D7C52]/5' : 'border-[#5D7C52]/10'}`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center text-2xl shadow-inner transition-colors ${isDropdownOpen ? 'bg-[#5D7C52] text-white' : 'bg-[#FAF9F6] text-[#5D7C52]'}`}>
                    {activeCategoryData.icon}
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#4A3728] block leading-none mb-1">
                      {activeCategoryData.label}
                    </span>
                    <span className="text-[9px] font-bold text-[#A4C639] uppercase tracking-widest opacity-80">
                      Explore artifacts
                    </span>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-transform duration-500 ${isDropdownOpen ? 'rotate-180 border-[#5D7C52] bg-[#5D7C52] text-white' : 'border-[#5D7C52]/10 group-hover:border-[#5D7C52]/30'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-4 w-full bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(74,55,40,0.2)] border border-[#5D7C52]/10 p-4 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group/item ${
                          activeCategory === cat.id 
                            ? 'bg-[#5D7C52] text-white' 
                            : 'text-[#5D7C52] hover:bg-[#FAF9F6]'
                        }`}
                      >
                        <span className="flex items-center gap-5">
                          <span className={`text-xl transition-transform group-hover/item:scale-125 ${activeCategory === cat.id ? 'scale-110' : ''}`}>{cat.icon}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                        </span>
                        {activeCategory === cat.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[3rem] p-8 h-[550px] border border-[#5D7C52]/5 flex flex-col">
                <Skeleton className="w-full h-64 mb-8 organic-shape" />
                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-1/4 ml-4" />
                  </div>
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
                <Skeleton className="h-16 w-full mt-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredProducts.map(product => {
              const isWishlisted = wishlist.includes(product.id);
              const isRecentlyAdded = addingToCartId === product.id;
              const isImageLoaded = loadedImages[product.id];
              const isExpanded = expandedDescriptions[product.id];
              const hasLongDescription = product.description && product.description.length > 100;
              
              return (
                <div key={product.id} className="group flex flex-col h-full bg-white rounded-[3rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#5D7C52]/5 animate-in fade-in zoom-in duration-500">
                  <div className="relative h-64 mb-8 overflow-hidden organic-shape shadow-lg bg-[#FAF9F6] border-4 border-white">
                    {!isImageLoaded && <Skeleton className="absolute inset-0 z-10" />}
                    
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      onLoad={() => handleImageLoad(product.id)}
                      className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${isImageLoaded ? 'opacity-100' : 'opacity-0 scale-95'}`}
                    />
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(product.id); }}
                      className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all z-20 ${isWishlisted ? 'bg-red-500 text-white shadow-lg' : 'bg-white/90 text-[#5D7C52] hover:bg-white'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex-1 px-2 mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="max-w-[70%]">
                        <h3 className="text-xl font-bold serif text-[#4A3728] leading-tight mb-1">{product.name}</h3>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#A4C639]">{product.category}</span>
                      </div>
                      <span className="text-2xl font-bold text-[#5D7C52] serif">₹{product.price}</span>
                    </div>

                    <div className={`transition-all duration-500 ${isExpanded ? 'mb-4' : 'h-[4.5rem] mb-4'} relative overflow-hidden`}>
                      {(!product.description || product.description === "") ? (
                        <div className="space-y-3 py-2">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-[90%]" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      ) : (
                        <div>
                          <p className={`text-[#5D7C52]/70 text-sm leading-relaxed italic transition-all duration-500 ${isExpanded ? 'opacity-100' : 'line-clamp-3'}`}>
                            {product.description}
                          </p>
                          {hasLongDescription && (
                            <button 
                              onClick={() => toggleDescription(product.id)}
                              className="mt-3 text-[10px] font-black uppercase tracking-widest text-[#A4C639] hover:text-[#5D7C52] transition-colors flex items-center gap-1 group"
                            >
                              {isExpanded ? 'Read Less' : 'Read More'}
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'group-hover:translate-x-1'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {product.benefits && product.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#5D7C52]/5">
                        {product.benefits.map((benefit, bIdx) => (
                          <div 
                            key={bIdx}
                            className="group/benefit relative flex items-center gap-1.5 px-3 py-1.5 bg-[#A4C639]/10 rounded-full border border-transparent hover:border-[#A4C639]/30 transition-all cursor-default"
                          >
                            <svg className="w-3 h-3 text-[#5D7C52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#5D7C52]">
                              {benefit}
                            </span>
                            
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#4A3728] text-white text-[8px] rounded opacity-0 group-hover/benefit:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Verified Heritage Standard
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-6 border-t border-[#5D7C52]/5">
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={isRecentlyAdded}
                      className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl transition-all duration-300 flex items-center justify-center gap-3 transform active:scale-95 ${
                        isRecentlyAdded 
                          ? 'bg-[#5D7C52] text-white cursor-default' 
                          : 'bg-[#A4C639] hover:bg-[#5D7C52] text-white hover:shadow-[#A4C639]/40'
                      }`}
                    >
                      {isRecentlyAdded ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductList;
