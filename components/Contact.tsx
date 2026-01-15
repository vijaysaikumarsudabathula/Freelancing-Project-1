
import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 text-center animate-fade-in">
        <div className="w-16 md:w-20 h-16 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 md:h-10 w-8 md:w-10 text-[#2D5A27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl md:text-4xl font-bold serif mb-3 md:mb-4">Message Received!</h2>
        <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">Thank you, K. Latha and the Deepthi team will get back to you shortly.</p>
        <button onClick={() => setSubmitted(false)} className="text-[#2D5A27] font-bold border-b-2 border-[#2D5A27] text-sm md:text-base">Send another message</button>
      </div>
    );
  }

  return (
    <section className="py-12 md:py-24 bg-white animate-fade-in">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20">
          <div>
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-3 md:mb-4 block">Our Location</span>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 md:mb-8 serif text-[#4A3728]">Deepthi Enterprises</h1>
            <p className="text-sm md:text-lg text-[#2D5A27] mb-8 md:mb-12 font-medium">
              Plot No. 145, Thirumalanagar Colony, Near Dhatunagar, Balapur Mandal, Hyderabad - 500059.
            </p>
            
            <div className="space-y-6 md:space-y-8">
              <div className="flex gap-3 md:gap-4">
                <div className="w-10 md:w-12 h-10 md:h-12 bg-[#FAF9F6] rounded-full flex items-center justify-center text-[#4A3728] flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 md:h-6 w-5 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-sm md:text-lg text-[#4A3728]">Proprietor</h4>
                  <p className="text-[#2D5A27]/70 font-bold serif text-sm md:text-base">K. Latha</p>
                </div>
              </div>
              
              <div className="flex gap-3 md:gap-4">
                <div className="w-10 md:w-12 h-10 md:h-12 bg-[#FAF9F6] rounded-full flex items-center justify-center text-[#4A3728] flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 md:h-6 w-5 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-sm md:text-lg text-[#4A3728]">Contact Numbers</h4>
                  <p className="text-[#2D5A27]/70 font-bold tracking-wider text-xs md:text-base">+91 8367382095 <br /> +91 9010613584</p>
                </div>
              </div>

              <div className="flex gap-3 md:gap-4">
                <div className="w-10 md:w-12 h-10 md:h-12 bg-[#FAF9F6] rounded-full flex items-center justify-center text-[#4A3728] flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 md:h-6 w-5 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-sm md:text-lg text-[#4A3728]">Official Emails</h4>
                  <p className="text-[#2D5A27]/70 font-medium text-xs md:text-base break-all">support@deepthienterprise.com<br /> vrao_k@zohomail.com</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#FAF9F6] p-6 md:p-10 rounded-2xl md:rounded-[2rem] space-y-4 md:space-y-6 border border-[#4A3728]/5 shadow-sm">
            <h3 className="text-xl md:text-2xl font-bold serif text-[#4A3728] mb-4 md:mb-6">Send an Inquiry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-[7px] md:text-xs font-black uppercase text-[#4A3728]/40 mb-2 ml-2 tracking-widest">Name</label>
                <input required className="w-full p-2 md:p-4 rounded-lg md:rounded-xl border-none outline-none focus:ring-2 focus:ring-[#A4C639] bg-white shadow-sm text-sm" placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-[7px] md:text-xs font-black uppercase text-[#4A3728]/40 mb-2 ml-2 tracking-widest">Phone</label>
                <input required className="w-full p-2 md:p-4 rounded-lg md:rounded-xl border-none outline-none focus:ring-2 focus:ring-[#A4C639] bg-white shadow-sm text-sm" placeholder="Contact No" />
              </div>
            </div>
            <div>
              <label className="block text-[7px] md:text-xs font-black uppercase text-[#4A3728]/40 mb-2 ml-2 tracking-widest">Email</label>
              <input required type="email" className="w-full p-2 md:p-4 rounded-lg md:rounded-xl border-none outline-none focus:ring-2 focus:ring-[#A4C639] bg-white shadow-sm text-sm" placeholder="example@email.com" />
            </div>
            <div>
              <label className="block text-[7px] md:text-xs font-black uppercase text-[#4A3728]/40 mb-2 ml-2 tracking-widest">Your Message</label>
              <textarea required rows={4} className="w-full p-2 md:p-4 rounded-lg md:rounded-xl border-none outline-none focus:ring-2 focus:ring-[#A4C639] bg-white shadow-sm text-sm" placeholder="Specify items and quantity needed..."></textarea>
            </div>
            <button type="submit" className="w-full btn-leaf py-4 md:py-5 rounded-lg md:rounded-2xl font-black uppercase tracking-[0.3em] shadow-xl text-[8px] md:text-xs active:scale-95 transition-all">
              Submit Request
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
