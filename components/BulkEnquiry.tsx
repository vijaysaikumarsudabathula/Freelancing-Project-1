
import React, { useState } from 'react';

const BulkEnquiry: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    quantity: '',
    eventType: 'corporate',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <div className="py-32 max-w-7xl mx-auto px-4 text-center animate-fade-in">
        <div className="w-24 h-24 bg-[#A4C639]/20 rounded-full flex items-center justify-center mx-auto mb-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#2D5A27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-5xl font-bold serif mb-6 text-[#4A3728]">Enquiry Sent Successfully</h2>
        <p className="text-xl text-[#5D7C52] max-w-lg mx-auto mb-12 italic">
          "Thank you for choosing sustainability at scale. Our wholesale specialist will contact you with a customized quote within 12 hours."
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="btn-leaf px-10 py-5 text-[10px] font-black uppercase tracking-widest shadow-xl"
        >
          Send Another Enquiry
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-[#FAF9F6] pb-32">
      <section className="relative py-32 bg-[#2D5A27] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Bulk production" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center text-white">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-6 block">B2B & Events</span>
          <h1 className="text-7xl font-bold serif mb-8 leading-tight">Bulk & Wholesale <br /><span className="italic font-normal">Partnerships.</span></h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto font-medium">
            Scaling sustainability for weddings, corporate galas, and global distribution. 
            Get artisanal quality at volume pricing.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-[#5D7C52]/10">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-2 bg-[#FAF9F6] p-12 border-b lg:border-b-0 lg:border-r border-[#5D7C52]/10">
              <h3 className="text-3xl font-bold serif text-[#4A3728] mb-10">Why Partner <br />With Us?</h3>
              <ul className="space-y-8">
                {[
                  { title: "Custom Branding", desc: "Laser engraving available for corporate gifting." },
                  { title: "Global Logistics", desc: "Carbon-neutral shipping to over 25 countries." },
                  { title: "Volume Pricing", desc: "Tiered discounts for orders above 500 units." },
                  { title: "Quality Control", desc: "Each piece UV-sterilized and hand-inspected." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#A4C639] flex-shrink-0 mt-1 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#4A3728] text-sm uppercase tracking-wide">{item.title}</h4>
                      <p className="text-xs text-[#5D7C52]/70 mt-1 font-medium">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-20 pt-10 border-t border-[#5D7C52]/10">
                <div className="p-6 bg-[#2D5A27] rounded-2xl text-white">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-2">Direct Support</p>
                  <p className="font-bold text-lg mb-1">bulk@leafylife.eco</p>
                  <p className="text-xs opacity-80">+91 98765 00001</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-2 ml-2">Full Name</label>
                    <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-5 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none font-bold text-[#4A3728] transition-all" placeholder="John Smith" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-2 ml-2">Company / Institution</label>
                    <input value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full p-5 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none font-bold text-[#4A3728] transition-all" placeholder="Eco Events Ltd." />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-2 ml-2">Email Address</label>
                    <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-5 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none font-bold text-[#4A3728] transition-all" placeholder="john@eco.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-2 ml-2">Phone Number</label>
                    <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-5 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none font-bold text-[#4A3728] transition-all" placeholder="+91 00000 00000" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-2 ml-2">Estimated Quantity</label>
                    <select value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full p-5 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none font-bold text-[#4A3728] transition-all appearance-none cursor-pointer">
                      <option value="">Select Range</option>
                      <option value="500-1000">500 - 1,000 units</option>
                      <option value="1000-5000">1,000 - 5,000 units</option>
                      <option value="5000+">5,000+ units</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-2 ml-2">Event Type</label>
                    <select value={formData.eventType} onChange={(e) => setFormData({...formData, eventType: e.target.value})} className="w-full p-5 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none font-bold text-[#4A3728] transition-all appearance-none cursor-pointer">
                      <option value="corporate">Corporate Event</option>
                      <option value="wedding">Wedding / Private Gala</option>
                      <option value="wholesale">Retail / Wholesale Resale</option>
                      <option value="export">International Export</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-2 ml-2">Specific Requirements</label>
                  <textarea rows={5} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full p-6 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none font-bold text-[#4A3728] transition-all resize-none" placeholder="Tell us more about your needs..."></textarea>
                </div>

                <button type="submit" className="w-full btn-leaf py-7 font-black uppercase tracking-[0.4em] text-sm shadow-2xl rounded-2xl">
                  Submit Enquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEnquiry;
