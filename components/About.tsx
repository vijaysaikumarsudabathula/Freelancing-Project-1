
import React from 'react';
import { Language } from '../types';

interface AboutProps {
  onReadMore?: (blogId: string) => void;
  lang?: Language;
}

const About: React.FC<AboutProps> = ({ onReadMore, lang = 'en' }) => {
  const t = {
    en: {
      advantageTitle: "Nature's Pure Advantage",
      advantageDesc: "Why Deepthi products are better for your health and the environment than any modern alternative.",
      readMore: "Read Full Science Blog",
      platesTitle: "Health Shield Plates",
      platesDesc: "Chemical-free dining that protects your body from toxins found in plastic.",
      bowlsTitle: "Healing Earthenware",
      bowlsDesc: "Clay naturally balances water pH and keeps it cool without electricity.",
      organicTitle: "Raw Forest Purity",
      organicDesc: "Forest-harvested honey and oils that retain 100% of their life-essence."
    },
    te: {
      advantageTitle: "ప్రకృతి యొక్క స్వచ్ఛమైన ప్రయోజనం",
      advantageDesc: "ఆధునిక ప్రత్యామ్నాయాల కంటే దీప్తి ఉత్పత్తులు మీ ఆరోగ్యానికి మరియు పర్యావరణానికి ఎందుకు మేలు చేస్తాయో తెలుసుకోండి.",
      readMore: "పూర్తి బ్లాగ్ చదవండి",
      platesTitle: "హెల్త్ షీల్డ్ ప్లేట్లు",
      platesDesc: "ప్లాస్టిక్‌లో ఉండే విషపదార్థాల నుండి మీ శరీరాన్ని రక్షించే రసాయన రహిత భోజనం.",
      bowlsTitle: "స్వస్థత చేకూర్చే మట్టి పాత్రలు",
      bowlsDesc: "మట్టి సహజంగా నీటి pH ని సమతుల్యం చేస్తుంది మరియు విద్యుత్తు లేకుండా చల్లగా ఉంచుతుంది.",
      organicTitle: "స్వచ్ఛమైన అడవి తేనె",
      organicDesc: "100% జీవ సారాన్ని కలిగి ఉండే అడవి తేనె మరియు నూనెలు."
    }
  }[lang];

  return (
    <div className="animate-fade-in">
      <section className="relative py-32 bg-[#F9F8F3] overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-4 block">How we began</span>
          <h1 className="text-7xl font-bold serif mb-8 text-[#4A3728]">Love the Earth. <br /><span className="italic font-normal">For the Future.</span></h1>
          <p className="text-xl text-[#2D5A27] max-w-2xl mx-auto italic leading-relaxed">
            "Deepthi Enterprises is here to help. We make items that return to the earth."
          </p>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-20 items-center">
          <div className="flex-1 space-y-10">
            <h2 className="text-5xl font-bold serif text-[#2D5A27]">Why we started</h2>
            <div className="space-y-6">
              <p className="text-lg text-[#4A3728]/80 leading-relaxed font-medium">
                We started in 2021. We saw too much plastic waste at parties and weddings. We wanted to find a better way. We chose to use leaves from palm trees and ancient materials like clay.
              </p>
              <p className="text-lg text-[#4A3728]/80 leading-relaxed font-medium">
                Today, we take what nature provides - leaves, honey, oil, and clay - and bring them to your home without additives. This helps the workers and the earth.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-[#5D7C52]/10">
              <div className="group">
                <h4 className="text-4xl font-bold text-[#2D5A27] serif mb-2">100%</h4>
                <p className="text-[10px] text-[#A4C639] font-black uppercase tracking-widest">Real Nature Items</p>
              </div>
              <div className="group">
                <h4 className="text-4xl font-bold text-[#2D5A27] serif mb-2">Zero</h4>
                <p className="text-[10px] text-[#A4C639] font-black uppercase tracking-widest">Bad Chemicals</p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="relative group">
              <div className="organic-shape overflow-hidden shadow-2xl relative z-10 border-8 border-white">
                <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Nature" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#FAF9F6] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-24">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-4 block">Product Benefits</span>
            <h2 className="text-5xl md:text-6xl font-bold serif text-[#2D5A27] mb-8">{t.advantageTitle}</h2>
            <p className="text-[#4A3728]/60 text-lg max-w-2xl mx-auto font-medium">{t.advantageDesc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { id: 'areca-plates', title: t.platesTitle, desc: t.platesDesc, icon: "🍽️", img: "https://images.unsplash.com/photo-1616612693441-17f160683050?auto=format&fit=crop&q=80&w=400" },
              { id: 'purity', title: t.bowlsTitle, desc: t.bowlsDesc, icon: "🏺", img: "https://images.unsplash.com/photo-1581572881241-30379d3be7c4?auto=format&fit=crop&q=80&w=400" },
              { id: 'organic-honey', title: t.organicTitle, desc: t.organicDesc, icon: "🍯", img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=400" }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-[3.5rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center group border border-[#2D5A27]/5">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-10 border-4 border-[#FAF9F6] shadow-xl group-hover:scale-110 transition-transform">
                  <img src={item.img} className="w-full h-full object-cover" alt={item.title} />
                </div>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold serif text-[#4A3728] mb-4">{item.title}</h3>
                <p className="text-sm text-[#2D5A27]/60 leading-relaxed font-medium mb-10 flex-1">{item.desc}</p>
                <button 
                  onClick={() => onReadMore?.(item.id)}
                  className="w-full py-4 bg-[#FAF9F6] text-[#2D5A27] rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-[#2D5A27] hover:text-white transition-all shadow-sm"
                >
                  {t.readMore}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
