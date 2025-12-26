
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <section className="relative py-32 bg-[#F9F8F3] overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-4 block">Our Origin Story</span>
          <h1 className="text-7xl font-bold serif mb-8 text-[#4A3728]">Honoring Heritage. <br /><span className="italic font-normal">Nurturing Tomorrow.</span></h1>
          <p className="text-xl text-[#5D7C52] max-w-2xl mx-auto italic leading-relaxed">
            "LeafyLife is more than a store. It is a promise to the earth, born from a desire to return to our roots."
          </p>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-20 items-center">
          <div className="flex-1 space-y-10">
            <h2 className="text-5xl font-bold serif text-[#2D5A27]">Why We Started</h2>
            <div className="space-y-6">
              <p className="text-lg text-[#4A3728]/80 leading-relaxed font-medium">
                LeafyLife began in 2021 when our founders noticed the staggering amount of single-use plastic waste at traditional celebrations. They looked back at India's heritage and saw the Areca palm leaf—a gift from nature that was being overlooked.
              </p>
              <p className="text-lg text-[#4A3728]/80 leading-relaxed font-medium">
                We decided to bridge the gap between ancient wisdom and modern convenience. Today, we process thousands of fallen leaves into premium tableware, providing employment to rural artisans and a guilt-free dining experience to thousands of customers.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-[#5D7C52]/10">
              <div className="group">
                <h4 className="text-4xl font-bold text-[#2D5A27] serif mb-2">100%</h4>
                <p className="text-[10px] text-[#A4C639] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">Natural Raw Material</p>
              </div>
              <div className="group">
                <h4 className="text-4xl font-bold text-[#2D5A27] serif mb-2">Zero</h4>
                <p className="text-[10px] text-[#A4C639] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">Chemical Treatments</p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="relative group">
              <div className="organic-shape overflow-hidden shadow-2xl relative z-10 border-8 border-white">
                <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Sustainable process" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-full h-full bg-[#E8F3E6] organic-shape -z-0 opacity-50 group-hover:rotate-6 transition-transform"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold serif text-[#4A3728] mb-4">The Artisan Gallery</h2>
            <p className="text-[#5D7C52] uppercase tracking-[0.3em] text-[10px] font-black">Snapshots of Sustainability</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 h-[400px] overflow-hidden rounded-[2rem] shadow-lg">
              <img src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="Nature" />
            </div>
            <div className="h-[400px] overflow-hidden rounded-[2rem] shadow-lg">
              <img src="https://images.unsplash.com/photo-1501166073351-20352fd2ca32?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="Process" />
            </div>
            <div className="h-[400px] overflow-hidden rounded-[2rem] shadow-lg">
              <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="Detail" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#2D5A27] text-white relative overflow-hidden">
        <div className="absolute left-0 top-0 w-64 h-64 bg-white/5 organic-shape -translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl font-bold serif mb-20">The Leaf Cycle</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { title: "Collection", desc: "Naturally fallen leaves are gathered by local farmers.", img: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=400" },
              { title: "Sanitization", desc: "Pressure cleaned and heat-treated for purity.", img: "https://images.unsplash.com/photo-1588628043003-f365773199df?auto=format&fit=crop&q=80&w=400" },
              { title: "Molding", desc: "Heat-pressed into elegant shapes with zero chemicals.", img: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=400" },
              { title: "Finishing", desc: "Smooth-edged and UV-sterilized for food safety.", img: "https://images.unsplash.com/photo-1594913785162-e6785b48dea5?auto=format&fit=crop&q=80&w=400" }
            ].map((step, i) => (
              <div key={i} className="group flex flex-col items-center">
                <div className="w-24 h-24 organic-shape overflow-hidden mb-8 border-2 border-white/20 group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <img src={step.img} className="w-full h-full object-cover" alt={step.title} />
                </div>
                <div className="text-5xl font-bold opacity-10 mb-4 serif italic">0{i+1}</div>
                <h3 className="text-xl font-bold mb-3 tracking-wide">{step.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
