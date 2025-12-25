
import React from 'react';

const Impact: React.FC = () => {
  const stats = [
    { label: 'Plastic Replaced', value: '2.5M+', unit: 'pieces', icon: '🍃' },
    { label: 'Water Saved', value: '150K', unit: 'liters', icon: '💧' },
    { label: 'Artisans Supported', value: '500+', unit: 'families', icon: '🤝' },
    { label: 'Waste Reduced', value: '45', unit: 'tons', icon: '🌍' },
  ];

  return (
    <section id="impact" className="py-24 bg-[#2D5A27] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 serif">Our Collective Impact</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Every purchase you make contributes to a larger movement of restoring our planet's health.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl text-center hover:bg-white/20 transition-all cursor-default group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm uppercase tracking-widest text-white/60 mb-1">{stat.unit}</div>
              <div className="text-lg font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Impact;
