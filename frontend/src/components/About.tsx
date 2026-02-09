
import React from 'react';
import { Language } from '../types';

interface AboutProps {
  onReadMore?: (blogId: string) => void;
  lang?: Language;
}

const About: React.FC<AboutProps> = ({ onReadMore, lang = 'en' }) => {
  const t = {
    en: {
      advantageTitle: "Caring Environment: No Plastic",
      advantageDesc: "Deepthi Enterprises is dedicated to providing eco-friendly alternatives. Our products are 100% natural, ensuring a healthy environment for future generations.",
      readMore: "View Details",
      platesTitle: "Buffet Leaf Plates",
      platesDesc: "Premium quality leaf plates available in 10\", 12\", and 14\" sizes. Completely biodegradable.",
      bowlsTitle: "Prasadam Doppalu",
      bowlsDesc: "Traditional round doppalu in big, small, and medium sizes. Pure leaf construction.",
      organicTitle: "Forest Harvests",
      organicDesc: "Organic forest honey, cold-pressed oils, and nutritional pulses and millets.",
      productsTitle: "Products Available:",
      productsList: [
        'Buffet Leaf Plates — 10\", 12\" and 14\"',
        'Prasadam Round Doppalu — Big, Small and Medium',
        'Vistaraku (table meals plates)',
        'Organic Honey collected from Forest',
        'Earthen Tea Glasses, Water Glasses and Water Bottles',
        'Organic Pulses and Millets',
        'Cold Pressed Oils'
      ]
    },
    te: {
      advantageTitle: "పర్యావరణంపై శ్రద్ధ: ప్లాస్టిక్ లేదు",
      advantageDesc: "దీప్తి ఎంటర్‌ప్రైజెస్ పర్యావరణ అనుకూల ఉత్పత్తులను అందించడానికి అంకితం చేయబడింది. మా వస్తువులు 100% సహజమైనవి.",
      readMore: "వివరాలు చూడండి",
      platesTitle: "బఫే లీఫ్ ప్లేట్లు",
      platesDesc: "10\", 12\", మరియు 14\" సైజులలో లభించే ప్రీమియం ఆకు ప్లేట్లు.",
      bowlsTitle: "ప్రసాదం డొప్పలు",
      bowlsDesc: "పెద్ద, చిన్న మరియు మధ్యస్థ సైజులలో సంప్రదాయ రౌండ్ డొప్పలు.",
      organicTitle: "అడవి ఉత్పత్తులు",
      organicDesc: "స్వచ్ఛమైన అడవి తేనె, గానుగ నూనెలు మరియు చిరుధాన్యాలు.",
      productsTitle: "లభ్య ఉత్పత్తులు:",
      productsList: [
        'బఫే లీఫ్ ప్లేట్లు — 10\", 12\" మరియు 14\"',
        'ప్రసాదం రౌండ్ డొప్పలు — పెద్ద, చిన్న మరియు మధ్యస్థ',
        'విస్తరకులు (టేబుల్ మీల్స్ కోసం)',
        'అడవి నుండి సేకరించిన సహజ తేనె',
        'మట్టి టీ గ్లాసులు, వాటర్ గ్లాసులు మరియు వాటర్ బాటిల్స్',
        'సేంద్రియ పప్పులు మరియు మిల్లెట్స్',
        'కోల్డ్- ప్రెస్ నూనెలు'
      ]
    }
  }[lang];

  return (
    <div className="animate-fade-in">
      <section className="relative py-32 bg-[#F9F8F3] overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-4 block">Our Identity</span>
          <h1 className="text-7xl font-bold serif mb-8 text-[#4A3728]">Deepthi Enterprises <br /><span className="italic font-normal">Caring Environment.</span></h1>
          <p className="text-xl text-[#2D5A27] max-w-2xl mx-auto italic leading-relaxed font-bold">
            "Eco-friendly Products – No Plastic"
          </p>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-20 items-center">
          <div className="flex-1 space-y-10">
            <h2 className="text-5xl font-bold serif text-[#2D5A27]">Our Mission</h2>
            <div className="space-y-6">
              <p className="text-lg text-[#4A3728]/80 leading-relaxed font-medium">
                Under the leadership of K. Latha, Deepthi Enterprises has grown into a trusted name for traditional and sustainable products in Hyderabad. We specialize in leaf-based tableware that honors our cultural heritage while protecting our planet from plastic waste.
              </p>
              <p className="text-lg text-[#4A3728]/80 leading-relaxed font-medium">
                Our range extends beyond tableware to include earthen products and forest-sourced organic foods, ensuring that every purchase you make supports a cleaner, healthier ecosystem.
              </p>
              <div className="mt-6 p-8 bg-white rounded-2xl border border-[#EDECE8] shadow-sm">
                <h3 className="text-2xl font-bold text-[#2D5A27] mb-4">Community & Sustainability</h3>
                <p className="text-lg text-[#4A3728]/80 leading-relaxed font-medium mb-4">
                  Harnessing traditional knowledge and sustainable resources, Deepthi Enterprises supports community-led eco-innovations.
                </p>
                <p className="text-lg text-[#4A3728]/80 leading-relaxed font-medium mb-4">
                  With rising awareness of plastic’s adverse environmental impact, demand for eco-friendly alternatives is growing — people are choosing sustainable options instead of plastic.
                </p>
                <p className="text-lg text-[#4A3728]/80 leading-relaxed font-medium mb-4">
                  The use of machinery has improved product quality, enabling the creation of refined goods that appeal to modern buyers while retaining traditional methods.
                </p>
                <p className="text-lg text-[#4A3728]/80 leading-relaxed font-medium">
                  Tribal women are turning a long-standing practice into livelihood: producing and selling “Vistaraku” (locally known as “Addakulu”), eco-friendly dining plates that provide self-employment opportunities and promote environmental responsibility.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-[#5D7C52]/10">
              <div className="group">
                <h4 className="text-4xl font-bold text-[#2D5A27] serif mb-2">100%</h4>
                <p className="text-[10px] text-[#A4C639] font-black uppercase tracking-widest">Plastic Free</p>
              </div>
              <div className="group">
                <h4 className="text-4xl font-bold text-[#2D5A27] serif mb-2">Forest</h4>
                <p className="text-[10px] text-[#A4C639] font-black uppercase tracking-widest">Sourced Honey</p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="relative group">
              <div className="organic-shape overflow-hidden shadow-2xl relative z-10 border-8 border-white">
                <img src="/images/menu.png" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Nature" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#FAF9F6] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-24">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-4 block">Natural Excellence</span>
            <h2 className="text-5xl md:text-6xl font-bold serif text-[#2D5A27] mb-8">{t.advantageTitle}</h2>
            <p className="text-[#4A3728]/60 text-lg max-w-2xl mx-auto font-medium">{t.advantageDesc}</p>
          </div>

          <div className="flex justify-center">
            <div className="bg-white rounded-[3.5rem] p-10 shadow-sm transition-all duration-500 w-full max-w-3xl border border-[#2D5A27]/5">
              <h3 className="text-3xl font-bold serif text-[#4A3728] mb-6">{t.productsTitle}</h3>
              <ul className="text-sm text-[#2D5A27]/80 leading-relaxed font-medium space-y-3 pl-4 list-disc">
                {(t as any).productsList.map((p: string, idx: number) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
