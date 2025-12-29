
import React, { useState, useRef, useEffect } from 'react';
import { Product, Language } from '../types';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  isLoading?: boolean;
  lang?: Language;
}

const ITEMS_PER_PAGE = 12;

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
  isLoading = false,
  lang = 'en'
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listTopRef = useRef<HTMLDivElement>(null);

  const t = {
    en: {
      bestFromNature: "Purely Sustainable",
      title1: "Our Collection",
      title2: "No Plastic. 100% Natural.",
      desc: "Discover premium leaf tableware, earthen pottery, and organic forest harvests selected for a caring environment.",
      added: "Added to Cart!",
      addToCart: "Add to Cart",
      success: "Successfully added to your collection.",
      readMore: "Read More",
      readLess: "Read Less",
      prev: "Prev",
      next: "Next"
    },
    te: {
      bestFromNature: "ప్రకృతి నుండి ఉత్తమమైనవి",
      title1: "మా వస్తువులు",
      title2: "ప్లాస్టిక్ లేదు. 100% సహజం.",
      desc: "పర్యావరణ హితమైన ఆకు ప్లేట్లు, మట్టి పాత్రలు మరియు అడవి ఉత్పత్తులను ఇక్కడ కనుగొనండి.",
      added: "కార్ట్‌కు జోడించబడింది!",
      addToCart: "కార్ట్‌కు జోడించు",
      success: "మీ సేకరణకు విజయవంతంగా జోడించబడింది.",
      readMore: "మరింత చదవండి",
      readLess: "తక్కువ చదవండి",
      prev: "మునుపటి",
      next: "తరువాత"
    }
  }[lang];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddToCart = (product: Product) => {
    setAddingToCartId(product.id);
    onAddToCart(product);
    setShowToast(lang === 'te' ? product.name_te : product.name);
    
    setTimeout(() => {
      setAddingToCartId(null);
    }, 1500);

    setTimeout(() => {
      setShowToast(null);
    }, 3000);
  };

  const toggleDescription = (productId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const filteredProducts = products.filter(p => {
    return activeCategory === 'all' || p.category === activeCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeCategoryData = categories.find(c => c.id === activeCategory) || categories[0];

  return (
    <section id="shop" ref={listTopRef} className="py-32 relative">
      {/* Floating Success Notification */}
      {showToast && (
        <div className="fixed top-28 right-8 z-[100] animate-in slide-in-from-right-10 fade-in duration-500">
          <div className="bg-[#2D5A27] text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-md">
            <div className="w-8 h-8 bg-[#A4C639] rounded-full flex items-center justify-center text-white font-bold">✓</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#A4C639]">{t.added}</p>
              <p className="text-sm font-bold opacity-90">{showToast}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-24 gap-12">
          <div className="max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A4C639] mb-4 block">{t.bestFromNature}</span>
            <h2 className="text-5xl md:text-6xl font-bold text-[#4A3728] mb-6 serif leading-tight">{t.title1} <br /><span className="italic font-normal">{t.title2}</span></h2>
            <p className="text-[#5D7C52] font-medium text-lg leading-relaxed">
              {t.desc}
            </p>
          </div>
          
          <div className="w-full lg:w-auto self-end">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full lg:w-[300px] flex items-center justify-between p-5 rounded-full bg-white border border-[#2D5A27]/10 shadow-sm hover:shadow-md transition-all`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl">{activeCategoryData.icon}</span>
                  <span className="font-bold text-[10px] uppercase tracking-widest text-[#2D5A27]">{activeCategoryData.label}</span>
                </div>
                <span className="text-[10px] text-[#2D5A27]/40">▼</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-3 w-full bg-white rounded-[2.5rem] shadow-2xl border border-[#2D5A27]/5 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setActiveCategory(cat.id); setIsDropdownOpen(false); setCurrentPage(1); }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeCategory === cat.id ? 'bg-[#FAF9F6] text-[#2D5A27]' : 'text-[#2D5A27]/60 hover:bg-[#FAF9F6] hover:text-[#2D5A27]'}`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-bold text-[10px] uppercase tracking-widest">{cat.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-96 rounded-[3rem]" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedProducts.map(product => {
                const isRecentlyAdded = addingToCartId === product.id;
                const isExpanded = expandedDescriptions[product.id] || false;
                const isWishlisted = wishlist.includes(product.id);
                const productName = lang === 'te' ? (product.name_te || product.name) : product.name;
                const productDesc = lang === 'te' ? (product.description_te || product.description) : product.description;

                return (
                  <div key={product.id} className="bg-white rounded-[3rem] p-6 shadow-sm border border-[#2D5A27]/5 hover:shadow-2xl transition-all duration-500 flex flex-col group relative">
                    {/* Wishlist Heart Icon */}
                    <button 
                      onClick={() => onToggleWishlist?.(product.id)}
                      className={`absolute top-10 right-10 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isWishlisted ? 'bg-[#A4C639] text-white scale-110 shadow-lg shadow-[#A4C639]/20' : 'bg-white/80 backdrop-blur text-gray-300 hover:text-red-400'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>

                    <div className="relative h-72 mb-8 overflow-hidden rounded-[2.5rem] bg-[#FAF9F6]">
                      <img 
                        src={product.image} 
                        alt={productName} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
                    </div>
                    <div className="flex-1 px-2 flex flex-col">
                      <h3 className="text-lg font-bold serif text-[#4A3728] mb-2 leading-tight">{productName}</h3>
                      <div className="relative">
                        <p className={`text-[11px] font-medium text-[#5D7C52]/60 leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {productDesc}
                        </p>
                        {productDesc.length > 60 && (
                          <button 
                            onClick={() => toggleDescription(product.id)}
                            className="mt-2 text-[9px] font-black uppercase tracking-wider text-[#A4C639] hover:text-[#2D5A27] transition-colors flex items-center gap-1"
                          >
                            {isExpanded ? t.readLess : t.readMore}
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-2 w-2 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-[#2D5A27]/5">
                      <button 
                        onClick={() => handleAddToCart(product)}
                        disabled={isRecentlyAdded}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all text-[9px] flex items-center justify-center gap-2 ${
                          isRecentlyAdded 
                          ? 'bg-[#2D5A27] text-white scale-[0.98]' 
                          : 'bg-[#A4C639] text-white hover:bg-[#2D5A27] hover:-translate-y-1'
                        }`}
                      >
                        {isRecentlyAdded ? (
                          <>
                            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">✓</span>
                            {t.added}
                          </>
                        ) : (
                          t.addToCart
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-24 flex justify-center items-center gap-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'bg-white border border-[#2D5A27]/10 text-[#2D5A27] hover:bg-[#FAF9F6]'}`}
                >
                  {t.prev}
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-12 h-12 rounded-xl text-[10px] font-black transition-all ${currentPage === page ? 'bg-[#2D5A27] text-white shadow-xl scale-110' : 'bg-white border border-[#2D5A27]/5 text-[#2D5A27]/40 hover:text-[#2D5A27] hover:bg-[#FAF9F6]'}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'bg-white border border-[#2D5A27]/10 text-[#2D5A27] hover:bg-[#FAF9F6]'}`}
                >
                  {t.next}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

const categories = [
  { id: 'all', label: 'All Items', icon: '🌿' },
  { id: 'plates', label: 'Eco Plates', icon: '🍽️' },
  { id: 'bowls', label: 'Prasadam Doppalu', icon: '🥣' },
  { id: 'organic', label: 'Forest Produce', icon: '🍯' },
  { id: 'earthenware', label: 'Earthenware', icon: '🍶' },
];

export default ProductList;
