
import React from 'react';
import { Language } from '../types';

interface HeroProps {
  onExplore?: () => void;
  onStory?: () => void;
  lang?: Language;
}

const Hero: React.FC<HeroProps> = ({ onExplore, lang = 'en' }) => {
  const t = {
    en: {
      title: "Sustainable Tableware for the Conscious Home",
      subtitle: "100% Natural. Biodegradable. Chemical Free.",
      cta: "Shop the Collection"
    },
    te: {
      title: "పర్యావరణ హితమైన ఆకు ప్లేట్లు",
      subtitle: "100% సహజం. ప్లాస్టిక్ లేదు.",
      cta: "వస్తువులను చూడండి"
    }
  }[lang];

  return (
    <section className="relative min-h-[75vh] md:h-[85vh] flex items-center justify-center bg-[#FAF9F6] overflow-hidden pt-16 md:pt-20 px-4">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover opacity-20"
          alt="Natural Background"
        />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center animate-fade-in">
        <span className="text-[7px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-[#108242] mb-4 md:mb-6 block">Premium Leaf Craftsmanship</span>
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold serif text-[#333] mb-6 md:mb-8 leading-tight">
          {t.title}
        </h1>
        <p className="text-sm md:text-lg lg:text-xl text-[#108242] mb-8 md:mb-12 font-medium italic">
          {t.subtitle}
        </p>
        <button 
          onClick={onExplore}
          className="px-8 md:px-12 py-3 md:py-5 bg-[#108242] text-white text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#A4C639] transition-all duration-500 shadow-xl active:scale-95"
        >
          {t.cta}
        </button>
      </div>

      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 hidden sm:flex">
        <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 md:h-12 bg-[#108242]"></div>
      </div>
    </section>
  );
};

export default Hero;
