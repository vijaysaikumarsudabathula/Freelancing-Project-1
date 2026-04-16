
import React from 'react';
import { Language } from '../types';

interface FooterProps {
  lang?: Language;
  onNavigate?: (view: any) => void;
}

const Footer: React.FC<FooterProps> = ({ lang = 'en', onNavigate }) => {
  const t = {
    en: {
      brand: "DEEPTHI",
      newsletterTitle: "Join the Eco-Movement",
      newsletterDesc: "Subscribe for sustainable living tips and exclusive product releases.",
      newsletterBtn: "Subscribe",
      shop: "Our Wholesale",
      about: "About Us",
      impact: "Sustainability",
      bulk: "Wholesale",
      contact: "Contact",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      shipping: "Shipping Information",
      faq: "Common Questions",
      address: "Plot No. 145, Thirumalanagar Colony, Near Dhanusnagar, Balapur Mandal, Hyderabad – 500059",
      copyright: "© 2024 Deepthi. Crafted with care for the planet.",
    },
    te: {
      brand: "దీప్తి",
      newsletterTitle: "మాతో చేరండి",
      newsletterDesc: "పర్యావరణ హితమైన చిట్కాలు మరియు కొత్త ఉత్పత్తుల కోసం సబ్‌స్క్రయిబ్ చేయండి.",
      newsletterBtn: "సబ్‌స్క్రయిబ్",
      shop: "ఉత్పత్తులు",
      about: "మా గురించి",
      impact: "పర్యావరణం",
      bulk: "బల్క్ ఆర్డర్స్",
      contact: "సంప్రదించండి",
      privacy: "ప్రైవసీ పాలసీ",
      terms: "నిబంధనలు",
      shipping: "షిప్పింగ్ వివరాలు",
      faq: "ప్రశ్నలు",
      address: "ప్లాట్ నెం. 145, తిరుమలనగర్ కాలనీ, ధనుష్‌నగర్ దగ్గర, బాలాపూర్ మండలం, హైదరాబాద్ - 500059",
      copyright: "© 2024 దీప్తి. పర్యావరణం కోసం ప్రేమతో రూపొందించబడింది.",
    }
  }[lang];

  return (
    <footer className="bg-white border-t-2 border-[#FAF9F6] pt-16 sm:pt-24 md:pt-32 pb-8 sm:pb-12 md:pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 md:gap-16 mb-12 md:mb-24">
          
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-5 space-y-8 sm:space-y-10 md:space-y-12">
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2D5A27] serif mb-2 sm:mb-4">{t.brand}</h3>
              <div className="h-1 w-12 bg-[#A4C639] rounded-full"></div>
            </div>
            
            <div className="max-w-md">
              <h4 className="text-base sm:text-lg font-bold text-[#4A3728] mb-2 sm:mb-4">{t.newsletterTitle}</h4>
              <p className="text-xs sm:text-sm text-gray-400 mb-6 sm:mb-8 leading-relaxed font-medium">
                {t.newsletterDesc}
              </p>
              <form className="relative flex group" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="w-full bg-[#FAF9F6] border-b-2 border-gray-100 py-3 sm:py-4 px-2 outline-none focus:border-[#2D5A27] transition-all text-xs sm:text-sm font-medium"
                />
                <button className="absolute right-0 bottom-0 py-3 sm:py-4 px-3 sm:px-6 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#2D5A27] hover:text-[#A4C639] transition-colors whitespace-nowrap">
                  {t.newsletterBtn}
                </button>
              </form>
            </div>
          </div>

          {/* Navigation Links Grid - Responsive */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-8 md:gap-12 border-l border-gray-50 pl-3 sm:pl-6 md:pl-8 lg:pl-16">
            
            {/* Quick Links */}
            <div className="space-y-6 sm:space-y-8">
              <h4 className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-[#A4C639]">
                Menu
              </h4>
              <ul className="space-y-2 sm:space-y-4">
                {[
                  { label: t.shop, view: 'shop' },
                  { label: t.about, view: 'about' },
                  { label: t.impact, view: 'impact' },
                  { label: t.bulk, view: 'bulk-enquiry' }
                ].map((link) => (
                  <li key={link.label}>
                    <button 
                      onClick={() => onNavigate?.(link.view as any)}
                      className="text-xs sm:text-sm font-bold text-[#4A3728]/60 hover:text-[#2D5A27] transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Information */}
            <div className="space-y-6 sm:space-y-8 col-span-2 md:col-span-1">
              <h4 className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-[#A4C639]">
                Reach Out
              </h4>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-1">
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-300">Call</p>
                  <p className="text-xs sm:text-sm font-bold text-[#4A3728]">+91 8367382095</p>
                  <p className="text-xs sm:text-sm font-bold text-[#4A3728]">+91 9010613584</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-300">Email</p>
                  <p className="text-xs sm:text-sm font-bold text-[#2D5A27]/80 truncate">support@deepthienterprise.com</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-300">Office</p>
                  <p className="text-xs sm:text-sm font-medium text-[#4A3728]/60 leading-relaxed max-w-[200px]">
                    {t.address}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar - Enhanced with better spacing */}
        <div className="pt-6 sm:pt-8 md:pt-12 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-6">
          <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] text-center sm:text-left">
            {t.copyright}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-[#A4C639] rounded-full"></span>
              <span className="text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/40">Sustainable</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-[#A4C639] rounded-full"></span>
              <span className="text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/40">Hyderabad</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
