import React, { useState, useEffect } from 'react';
import { Product, Language } from '../types';
import Hero from './Hero';
import Impact from './Impact';
import About from './About';
import { resolveProductImage } from '../services/imageHelper';

interface HomePageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onExplore?: () => void;
  onBulkEnquiry?: () => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  isLoading?: boolean;
  lang?: Language;
}

const HomePage: React.FC<HomePageProps> = ({
  products,
  onAddToCart,
  onExplore,
  onBulkEnquiry,
  wishlist = [],
  onToggleWishlist,
  isLoading = false,
  lang = 'en'
}) => {
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const t = {
    en: {
      allProducts: "Browse All Products",
      noPlastic: "100% Natural & Plastic-Free",
      addToCart: "Add to Cart",
      added: "Added!",
      showProducts: "NEW ARRIVALS",
      viewAllCollections: "View All Collections",
      showingProducts: "Showing all products"
    },
    te: {
      allProducts: "అన్ని ఉత్పత్తులను సరిచేయండి",
      noPlastic: "100% సహజం & ప్లాస్టిక్‌లేనిది",
      addToCart: "కార్ట్‌కు జోడించు",
      added: "జోడించారు!",
      showProducts: "కొత్త రాక",
      viewAllWholesale: "సరిఖరీదు ఉత్పత్తులు చూడండి",
      showingProducts: "అన్ని ఉత్పత్తులను చూపిస్తోంది"
    }
  }[lang];

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (!isAutoPlay || products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, products.length]);

  const handleAddToCart = (product: Product) => {
    setAddingToCartId(product.id);
    onAddToCart(product);
    setTimeout(() => setAddingToCartId(null), 600);
  };

  const goToProduct = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 8000); // Resume auto-play after 8 seconds
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 8000);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 8000);
  };

  const ProductCard = ({ product, index }: { product: Product; index: number }) => {
    const isWishlisted = wishlist.includes(product.id);
    const productName = lang === 'te' ? product.name_te : product.name;
    const isAdding = addingToCartId === product.id;

    return (
      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100/50 flex flex-col h-full">
        {/* Image Container */}
        <div className="relative w-full h-56 md:h-64 bg-gradient-to-br from-[#FAF9F6] to-[#F0EEEA] overflow-hidden flex-shrink-0">
          <img
            src={product.image}
            alt={productName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=400';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"></div>

          {/* Wishlist Button */}
          <button
            onClick={() => onToggleWishlist?.(product.id)}
            className="absolute top-3 right-3 text-xl md:text-2xl bg-white/90 backdrop-blur-sm rounded-full p-2 hover:scale-110 transition-transform shadow-md z-10"
          >
            {isWishlisted ? '❤️' : '🤍'}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-5 flex flex-col flex-grow">
          {/* Title */}
          <h3 className="text-sm md:text-base font-bold text-[#4A3728] line-clamp-2 group-hover:text-[#108242] transition-colors mb-2 flex-grow">
            {productName}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-4 line-clamp-2">
            {lang === 'te' ? product.description_te : product.description}
          </p>

          {/* Add to Cart Button */}
          <button
            onClick={() => handleAddToCart(product)}
            className={`w-full py-2.5 md:py-3 rounded-lg font-bold text-xs md:text-sm uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
              isAdding
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-[#108242] to-[#0d6233] hover:from-[#0d6233] hover:to-[#0a4a25] text-white'
            }`}
          >
            {isAdding ? (
              <>
                <span className="text-lg">✓</span>
                {t.added}
              </>
            ) : (
              <>
                <span>🛒</span>
                {t.addToCart}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      {/* 1. Hero Section */}
      <Hero
        onExplore={onExplore}
        onBulkEnquiry={onBulkEnquiry}
        lang={lang}
      />

      {/* 2. Rotating Carousel Section */}
      <section className="py-6 md:py-12 px-2 sm:px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-6 md:mb-10 text-center px-2">
            <span className="text-[8px] sm:text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-[#A4C639] mb-2 sm:mb-3 block inline-block">
              ✨ {t.showProducts}
            </span>
            <h2 className="text-xl sm:text-2xl md:text-5xl font-bold serif text-[#4A3728] mb-2 md:mb-2">
              {t.allProducts}
            </h2>
            <p className="text-[9px] sm:text-[10px] md:text-base text-gray-600">
              {t.noPlastic}
            </p>
          </div>

          {/* Carousel Container */}
          {isLoading ? (
            <div className="bg-gray-200 rounded-xl md:rounded-2xl h-56 sm:h-72 md:h-[520px] animate-pulse"></div>
          ) : products.length > 0 ? (
            <div className="relative">
              {/* Main Carousel */}
              <div className="relative h-56 sm:h-80 md:h-[520px] mb-4 md:mb-6">
                <div className="absolute inset-0 overflow-hidden rounded-xl md:rounded-2xl">
                  {/* Slides */}
                  <div
                    className="transition-transform duration-700 ease-in-out h-full"
                    style={{
                      transform: `translateX(-${currentIndex * 100}%)`,
                      display: 'flex'
                    }}
                  >
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="w-full h-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#FAF9F6] to-[#F0EEEA] overflow-y-auto"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-8 w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-8 py-3 sm:py-4 md:py-8">
                          {/* Left: Large Product Image */}
                          <div className="relative h-40 sm:h-56 md:h-96 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0">
                            <img
                              src={product.image}
                              alt={lang === 'te' ? product.name_te : product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-all"></div>
                          </div>

                          {/* Right: Product Details */}
                          <div className="flex flex-col justify-center min-w-0">
                            <h3 className="text-lg sm:text-2xl md:text-4xl font-bold text-[#4A3728] mb-2 md:mb-4 line-clamp-2">
                              {lang === 'te' ? product.name_te : product.name}
                            </h3>

                            {/* Price & Unit */}
                            <div className="mb-2 md:mb-4">
                              <p className="text-xl sm:text-2xl md:text-4xl font-black text-[#108242] mb-0.5 md:mb-1">
                                ₹{product.price}
                              </p>
                              <p className="text-xs sm:text-sm md:text-base text-gray-600 capitalize font-medium">
                                {product.unit}
                              </p>
                            </div>

                            {/* Description */}
                            <p className="text-xs sm:text-sm md:text-base text-gray-700 mb-3 md:mb-6 leading-relaxed line-clamp-2 md:line-clamp-3">
                              {lang === 'te' ? product.description_te : product.description}
                            </p>

                            {/* Benefits */}
                            <div className="mb-3 md:mb-6 flex flex-wrap gap-1 md:gap-2">
                              {product.benefits?.slice(0, 2).map((benefit, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block px-2 py-0.5 md:px-3 md:py-1 bg-[#A4C639]/20 text-[#108242] rounded-full text-[7px] sm:text-xs md:text-sm font-semibold whitespace-nowrap"
                                >
                                  {benefit}
                                </span>
                              ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 md:gap-4">
                              <button
                                onClick={() => handleAddToCart(product)}
                                className={`flex-1 py-2 md:py-4 rounded-lg font-bold text-[7px] sm:text-xs md:text-base uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-1 md:gap-2 min-h-[36px] md:min-h-[48px] ${
                                  addingToCartId === product.id
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gradient-to-r from-[#108242] to-[#0d6233] hover:from-[#0d6233] hover:to-[#0a4a25] text-white'
                                }`}
                              >
                                {addingToCartId === product.id ? (
                                  <>
                                    <span className="text-sm md:text-lg">✓</span>
                                    <span className="hidden sm:inline">{t.added}</span>
                                  </>
                                ) : (
                                  <>
                                    <span>🛒</span>
                                    <span className="hidden sm:inline">{t.addToCart}</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => onToggleWishlist?.(product.id)}
                                className="px-2 md:px-6 py-2 md:py-4 bg-white border-2 border-[#108242] text-xl md:text-2xl rounded-lg hover:bg-[#FAF9F6] transition-all shadow-md hover:shadow-lg min-h-[36px] md:min-h-[48px] flex items-center justify-center flex-shrink-0"
                              >
                                {wishlist.includes(product.id) ? '❤️' : '🤍'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons - Inside carousel area on mobile */}
                <button
                  onClick={goPrev}
                  className="absolute left-1 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-14 z-20 w-8 h-8 md:w-12 md:h-12 bg-[#108242] hover:bg-[#0d6233] text-white rounded-full flex items-center justify-center font-bold text-sm md:text-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  ❮
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-1 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-14 z-20 w-8 h-8 md:w-12 md:h-12 bg-[#108242] hover:bg-[#0d6233] text-white rounded-full flex items-center justify-center font-bold text-sm md:text-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  ❯
                </button>
              </div>

              {/* Dot Navigation */}
              <div className="flex justify-center gap-1.5 md:gap-3 mb-4 md:mb-6">
                {products.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToProduct(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentIndex
                        ? 'bg-[#108242] w-6 md:w-12 h-2 md:h-3'
                        : 'bg-gray-300 w-2 md:w-3 h-2 md:h-3 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              {/* Product Counter */}
              <div className="text-center text-xs md:text-base text-gray-600 font-medium">
                {currentIndex + 1} / {products.length}
              </div>
            </div>
          ) : (
            <div className="py-12 md:py-16 text-center">
              <p className="text-gray-500 font-medium text-sm md:text-base">
                {lang === 'en' ? 'No products available yet' : 'ఇంకా ఉత్పత్తులు అందుబాటులో లేవు'}
              </p>
            </div>
          )}

          {/* View All Button */}
          {products.length > 0 && (
            <div className="mt-6 md:mt-10 flex justify-center px-2">
              <button
                onClick={onExplore}
                className="px-6 md:px-12 py-2.5 md:py-4 bg-gradient-to-r from-[#108242] to-[#0d6233] hover:from-[#0d6233] hover:to-[#0a4a25] text-white rounded-lg md:rounded-xl font-bold text-[8px] sm:text-[10px] md:text-base uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 w-full md:w-auto"
              >
                🔍 {t.viewAllWholesale}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. Impact Section - "How we help the earth" */}
      <Impact />

      {/* 4. About Section */}
      <About lang={lang} />
    </div>
  );
};

export default HomePage;
