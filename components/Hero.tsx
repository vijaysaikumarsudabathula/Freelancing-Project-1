
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Language } from '../types';

interface HeroProps {
  onExplore?: () => void;
  // Added onStory to fix the TypeScript error in App.tsx
  onStory?: () => void;
  lang?: Language;
}

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1616612693441-17f160683050?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1591871937573-748af09698d7?auto=format&fit=crop&q=80&w=1200'
];

const LEAF_PATHS = [
  "M10,50 Q25,0 50,0 T90,50 T50,100 T10,50 Z", // Simple leaf
  "M50,0 C20,0 0,30 0,60 C0,90 20,100 50,100 C80,100 100,90 100,60 C100,30 80,0 50,0 Z", // Rounder leaf
  "M50,0 C70,20 100,50 100,70 C100,90 80,100 50,100 C20,100 0,90 0,70 C0,50 30,20 50,0 Z" // Teardrop leaf
];

const Hero: React.FC<HeroProps> = ({ onExplore, onStory, lang = 'en' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const t = {
    en: {
      tag: "Deepthi's Natural Shop",
      title1: "Good for nature",
      title2: "No Plastic.",
      desc: "Real leaf plates and bowls from Deepthi Enterprises. We help the world by making items that have no plastic.",
      btn1: "Our Items",
      btn2: "Our Story",
      leader: "Our Leader"
    },
    te: {
      tag: "దీప్తి ప్రకృతి షాపు",
      title1: "ప్రకృతికి మంచిది",
      title2: "ప్లాస్టిక్ లేదు.",
      desc: "దీప్తి ఎంటర్‌ప్రైజెస్ నుండి నిజమైన ఆకు ప్లేట్లు మరియు గిన్నెలు. ప్లాస్టిక్ లేని వస్తువులను తయారు చేయడం ద్వారా మేము ప్రపంచానికి సహాయం చేస్తాము.",
      btn1: "మా వస్తువులు",
      btn2: "మా కథ",
      leader: "మా నాయకురాలు"
    }
  }[lang];

  // Generate falling leaves once
  const leaves = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * -20,
      swayDuration: 3 + Math.random() * 4,
      size: 15 + Math.random() * 25,
      path: LEAF_PATHS[Math.floor(Math.random() * LEAF_PATHS.length)],
      color: Math.random() > 0.5 ? '#A4C639' : '#2D5A27',
      opacity: 0.2 + Math.random() * 0.4
    }));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[95vh] flex items-center overflow-hidden px-4 py-20 lg:py-32"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* Falling Leaves */}
        {leaves.map((leaf) => (
          <div
            key={leaf.id}
            className="falling-leaf"
            style={{
              left: `${leaf.left}%`,
              animationDuration: `${leaf.duration}s`,
              animationDelay: `${leaf.delay}s`
            }}
          >
            <div 
              className="sway-wrapper"
              style={{ animationDuration: `${leaf.swayDuration}s` }}
            >
              <svg 
                width={leaf.size} 
                height={leaf.size} 
                viewBox="0 0 100 100" 
                style={{ 
                  fill: leaf.color, 
                  opacity: leaf.opacity,
                  transform: `rotate(${Math.random() * 360}deg)` 
                }}
              >
                <path d={leaf.path} />
              </svg>
            </div>
          </div>
        ))}

        <div 
          className="absolute inset-0 transition-transform duration-1000 ease-out opacity-40"
          style={{ 
            transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 30}px)`,
            background: 'radial-gradient(circle at 20% 20%, rgba(164, 198, 57, 0.2) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(45, 90, 39, 0.15) 0%, transparent 40%)'
          }}
        />
        <div 
          className="absolute -left-20 top-0 w-[600px] h-full transition-transform duration-700 ease-out opacity-20"
          style={{ 
            transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 15}px) rotate(${mousePos.x * 2}deg)` 
          }}
        >
          <svg viewBox="0 0 400 1000" className="w-full h-full text-[#2D5A27]">
            <path d="M100,1000 Q120,600 80,400 T120,0" stroke="currentColor" strokeWidth="8" fill="none" className="branch-grow" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full relative z-10">
        <div className="animate-fade-in pl-4 lg:pl-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2D5A27]/10 border border-[#2D5A27]/20 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-[#A4C639] rounded-full animate-ping"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2D5A27]">{t.tag}</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold leading-[0.95] mb-8 serif text-[#4A3728]">
            {t.title1} <br /> 
            <span className="relative inline-block mt-2">
              <span className="relative z-10 italic font-normal">{t.title2}</span>
              <span className="absolute bottom-[10%] left-[-5%] w-[110%] h-[40%] bg-[#A4C639] opacity-15 -z-0 rounded-lg"></span>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl mb-12 max-w-lg text-[#2D5A27] font-medium leading-relaxed">
            {t.desc}
          </p>
          
          <div className="flex flex-wrap gap-6">
            <button 
              onClick={() => onExplore ? onExplore() : document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-leaf px-10 py-5 text-sm font-bold uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-transform"
            >
              {t.btn1}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button 
              // Fixed: Added onClick to use the onStory prop
              onClick={() => onStory && onStory()}
              className="px-10 py-5 border-2 border-[#2D5A27]/10 rounded-2xl text-sm font-bold uppercase tracking-widest text-[#2D5A27] hover:bg-[#2D5A27]/5 transition-all bg-white/40 backdrop-blur-md"
            >
              {t.btn2}
            </button>
          </div>
        </div>

        <div 
          className="relative h-[450px] md:h-[650px] animate-fade-in [animation-delay:0.4s] group"
          style={{ 
            transform: `perspective(1000px) rotateX(${mousePos.y * -8}deg) rotateY(${mousePos.x * 8}deg)` 
          }}
        >
          <div className="absolute inset-0 organic-shape overflow-hidden shadow-[0_40px_100px_-20px_rgba(45,90,39,0.3)] border-[12px] border-white transition-all duration-700">
            {HERO_IMAGES.map((img, idx) => (
              <img 
                key={img}
                src={img} 
                alt={`Leaf Tableware ${idx + 1}`} 
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
              />
            ))}
          </div>
          
          <div 
            className="absolute -bottom-8 -right-8 glass-card p-8 shadow-2xl border-[#A4C639]/40 bg-white/90 backdrop-blur-xl z-20 transition-transform duration-300"
            style={{ 
              transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` 
            }}
          >
            <div className="flex flex-col">
               <span className="text-[9px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-2 block">Nature First</span>
               <span className="text-2xl font-bold serif text-[#4A3728]">K. Latha</span>
               <p className="text-[10px] font-bold text-[#2D5A27]/60 mt-1 italic uppercase tracking-widest">{t.leader}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
