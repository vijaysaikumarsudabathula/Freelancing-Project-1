
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
    <section className="relative h-[85vh] flex items-center justify-center bg-[#FAF9F6] overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover opacity-20"
          alt="Natural Background"
        />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6 animate-fade-in">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#108242] mb-6 block">Premium Leaf Craftsmanship</span>
        <h1 className="text-5xl md:text-7xl font-bold serif text-[#333] mb-8 leading-tight">
          {t.title}
        </h1>
        <p className="text-xl text-[#108242] mb-12 font-medium italic">
          {t.subtitle}
        </p>
        <button 
          onClick={onExplore}
          className="px-12 py-5 bg-[#108242] text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#A4C639] transition-all duration-500 shadow-xl"
        >
          {t.cta}
        </button>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <span className="text-[8px] font-bold uppercase tracking-widest">Scroll</span>
        <div className="w-px h-12 bg-[#108242]"></div>
      </div>
    </section>
  );
};

export default Hero;
