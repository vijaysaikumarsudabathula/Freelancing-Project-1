
import React, { useState, useEffect } from 'react';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1616612693441-17f160683050?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1591871937573-748af09698d7?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1518013391915-e44359846ffb?auto=format&fit=crop&q=80&w=1200'
];

const Hero: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden px-4 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full relative">
        
        {/* The Natural Tree Branch Animation (Left Side) */}
        <div className="absolute -left-24 lg:-left-32 top-1/2 -translate-y-1/2 w-48 h-full pointer-events-none z-0 overflow-visible">
          <svg viewBox="0 0 200 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full tree-layer-1">
            <path 
              d="M20 800 C20 600 80 500 40 400 C10 300 90 150 60 0" 
              stroke="#5D7C52" 
              strokeWidth="4" 
              strokeLinecap="round" 
              className="branch-grow"
            />
            <circle cx="85" cy="510" r="6" fill="#A4C639" className="leaf-appear" style={{ animationDelay: '1.2s' }} />
            <circle cx="-5" cy="370" r="8" fill="#5D7C52" className="leaf-appear" style={{ animationDelay: '1.8s' }} opacity="0.6" />
            <circle cx="95" cy="230" r="7" fill="#A4C639" className="leaf-appear" style={{ animationDelay: '2.4s' }} />
            <circle cx="25" cy="70" r="5" fill="#5D7C52" className="leaf-appear" style={{ animationDelay: '3.0s' }} opacity="0.4" />
          </svg>
        </div>

        <div className="relative z-10 animate-fade-in pl-8 lg:pl-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#A4C639]/15 border border-[#A4C639]/30 rounded-full mb-8">
            <span className="w-2 h-2 bg-[#A4C639] rounded-full animate-ping"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5D7C52]">The Artisan Touch</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold leading-[0.95] mb-8 serif text-[#4A3728]">
            Spirit of <br /> 
            <span className="relative inline-block mt-2">
              <span className="relative z-10 italic font-normal">the Forest.</span>
              <span className="absolute bottom-[5%] left-[-5%] w-[110%] h-[50%] bg-[#A4C639] opacity-80 -z-0 rounded-sm"></span>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl mb-12 max-w-lg text-[#5D7C52] font-medium leading-relaxed">
            Experience the sophisticated beauty of Areca palm tableware. 
            Each piece is hand-pressed, preserving the unique story written in every leaf.
          </p>
          
          <div className="flex flex-wrap gap-6">
            <button 
              onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-leaf px-10 py-5 text-sm font-bold uppercase tracking-widest shadow-xl flex items-center gap-3"
            >
              Shop Collection
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button 
              className="px-10 py-5 border-2 border-[#5D7C52]/20 rounded-2xl text-sm font-bold uppercase tracking-widest text-[#5D7C52] hover:bg-[#5D7C52]/5 transition-all bg-white/50 backdrop-blur-sm"
            >
              Our Heritage
            </button>
          </div>
        </div>

        {/* Hero Image & Artisan Hand Animation */}
        <div className="relative h-[450px] md:h-[600px] animate-fade-in [animation-delay:0.4s]">
          <div className="absolute inset-0 organic-shape overflow-hidden shadow-2xl border-[12px] border-white/50 backdrop-blur-sm group">
            {HERO_IMAGES.map((img, idx) => (
              <img 
                key={img}
                src={img} 
                alt={`Sustainable tableware ${idx + 1}`} 
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
              />
            ))}
            
            {/* Hand-Press Overlay Animation */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[#5D7C52]/10 pointer-events-none">
              <svg viewBox="0 0 200 200" className="w-32 h-32 text-white/40 animate-hand">
                <path fill="currentColor" d="M100,20 C120,20 140,40 140,80 L140,120 C140,160 120,180 100,180 C80,180 60,160 60,120 L60,80 C60,40 80,20 100,20 Z M80,80 L120,80 M80,100 L120,100" />
                <path fill="none" stroke="currentColor" strokeWidth="2" d="M50,150 Q100,180 150,150" />
              </svg>
              <span className="absolute bottom-20 text-[8px] font-black uppercase tracking-[0.4em] text-white">Artisan Pressing</span>
            </div>
          </div>
          
          {/* Floating Artisan Tag */}
          <div className="absolute -bottom-6 -right-6 glass-card p-6 shadow-xl border-[#A4C639]/30 bg-white/80 backdrop-blur-md z-20">
            <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[#A4C639] mb-1">Naturally Sourced</span>
               <span className="text-lg font-bold serif text-[#4A3728]">Areca Artifact</span>
               <div className="flex gap-1 mt-2">
                 {[1,2,3,4,5].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${i-1 === currentImageIndex ? 'bg-[#5D7C52]' : 'bg-[#A4C639]'}`}></div>)}
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
