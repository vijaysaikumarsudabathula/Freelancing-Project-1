
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <section className="py-24 bg-[#F9F8F3]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold serif mb-8">Our Earth-First Journey</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto italic">
            "We do not inherit the earth from our ancestors, we borrow it from our children."
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-20 items-center">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-bold serif text-[#2D5A27]">Why We Started</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              LeafyLife began in 2021 when our founders noticed the staggering amount of single-use plastic waste at traditional celebrations. They looked back at India's heritage and saw the Areca palm leaf—a gift from nature that was being overlooked.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We decided to bridge the gap between ancient wisdom and modern convenience. Today, we process thousands of fallen leaves into premium tableware, providing employment to rural artisans and a guilt-free dining experience to thousands of customers.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6">
              <div>
                <h4 className="text-3xl font-bold text-[#2D5A27]">100%</h4>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Natural Raw Material</p>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-[#2D5A27]">Zero</h4>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Chemical Treatments</p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200" className="rounded-[3rem] shadow-2xl relative z-10" />
              <div className="absolute -bottom-6 -right-6 w-full h-full bg-[#E8F3E6] rounded-[3rem] -z-0"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#2D5A27] text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold serif mb-16">The Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: "Collection", desc: "Naturally fallen leaves are gathered by local farmers." },
              { title: "Sanitization", desc: "Pressure cleaned and heat-treated for purity." },
              { title: "Molding", desc: "Heat-pressed into elegant shapes with zero chemicals." },
              { title: "Finishing", desc: "Smooth-edged and UV-sterilized for food safety." }
            ].map((step, i) => (
              <div key={i} className="space-y-4">
                <div className="text-5xl font-bold opacity-20">0{i+1}</div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-white/70">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
