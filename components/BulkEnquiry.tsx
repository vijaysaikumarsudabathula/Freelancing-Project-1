
import React, { useState } from 'react';

const BulkEnquiry: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    quantity: '',
    eventType: 'party',
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
        <h2 className="text-5xl font-bold serif mb-6 text-[#4A3728]">Message Sent</h2>
        <p className="text-xl text-[#2D5A27] max-w-lg mx-auto mb-12 italic">
          "Thank you. Our team will call you soon to help with your big order."
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="btn-leaf px-10 py-5 text-[10px] font-black uppercase tracking-widest shadow-xl"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-[#FAF9F6] pb-32">
      <section className="relative py-32 bg-[#2D5A27] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Big Order" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center text-white">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-6 block">Big Orders</span>
          <h1 className="text-7xl font-bold serif mb-8 leading-tight">Work With Us <br /><span className="italic font-normal">Deepthi Enterprises.</span></h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto font-medium">
            We help you get many plates and bowls for your parties or weddings. No plastic.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-[#2D5A27]/10">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-2 bg-[#FAF9F6] p-12 border-b lg:border-b-0 lg:border-r border-[#2D5A27]/10">
              <h3 className="text-3xl font-bold serif text-[#4A3728] mb-10">Why buy <br />from us?</h3>
              <ul className="space-y-8">
                {[
                  { title: "No Plastic", desc: "All items come from real trees and plants." },
                  { title: "Good for Nature", desc: "We use methods that don't hurt the earth." },
                  { title: "Fast Help", desc: "We are here in Hyderabad to help you quickly." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#A4C639] flex-shrink-0 mt-1 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#4A3728] text-sm uppercase tracking-wide">{item.title}</h4>
                      <p className="text-xs text-[#2D5A27]/70 mt-1 font-medium">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3 p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 ml-2">Full Name</label>
                    <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-5 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none font-bold text-[#4A3728] transition-all" placeholder="Enter your name" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 ml-2">Company Name</label>
                    <input value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full p-5 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none font-bold text-[#4A3728] transition-all" placeholder="Where do you work?" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 ml-2">Email Address</label>
                    <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-5 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none font-bold text-[#4A3728] transition-all" placeholder="Email" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 ml-2">Phone Number</label>
                    <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-5 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none font-bold text-[#4A3728] transition-all" placeholder="Phone" />
                  </div>
                </div>

                <button type="submit" className="w-full btn-leaf py-7 font-black uppercase tracking-[0.4em] text-sm shadow-2xl rounded-2xl">
                  Send Help Request
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
