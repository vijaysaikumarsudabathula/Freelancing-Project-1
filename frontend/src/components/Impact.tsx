
import React from 'react';

const Impact: React.FC = () => {
  const stats = [
    { label: 'Plastic Stopped', value: '2.5M+', unit: 'items', icon: '🍃' },
    { label: 'Water Saved', value: '150K', unit: 'buckets', icon: '💧' },
    { label: 'Workers Helped', value: '500+', unit: 'families', icon: '🤝' },
    { label: 'Waste Stopped', value: '45', unit: 'tons', icon: '🌍' },
  ];

  return (
    <section id="impact" className="relative py-16 sm:py-24 md:py-32 lg:py-40 bg-[#2D5A27] text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200" 
          className="w-full h-full object-cover opacity-20 scale-110" 
          alt="" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2D5A27] via-transparent to-[#2D5A27]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24">
          <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-2 sm:mb-3 md:mb-4 block">Our results</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 serif">How we help the earth</h2>
          <p className="text-white/70 max-w-2xl mx-auto text-xs sm:text-sm md:text-base lg:text-lg font-medium leading-relaxed px-2">
            Every time you buy from us, you help keep the earth clean. We show you how much plastic we stop together.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="group relative">
               <div className="absolute inset-0 bg-white/5 rounded-2xl md:rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="bg-white/10 backdrop-blur-md p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl md:rounded-2xl lg:rounded-[3rem] text-center hover:bg-white/20 transition-all border border-white/10 relative z-10 h-full flex flex-col justify-center">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">{stat.icon}</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 serif">{stat.value}</div>
                <div className="text-[7px] sm:text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-[#A4C639] mb-2 sm:mb-3 md:mb-4 font-black">{stat.unit}</div>
                <div className="text-sm sm:text-base md:text-lg lg:text-xl font-medium tracking-tight opacity-90">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 text-center">
           <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 px-4 sm:px-6 md:px-10 py-3 sm:py-4 md:py-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg md:rounded-2xl lg:rounded-[2rem]">
              <p className="text-xs sm:text-sm md:text-base font-bold text-white/80">Join <span className="text-[#A4C639]">15,000+</span> people helping nature.</p>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Impact;
