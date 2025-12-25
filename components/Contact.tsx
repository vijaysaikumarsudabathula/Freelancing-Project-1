
import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#2D5A27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-4xl font-bold serif mb-4">Message Received!</h2>
        <p className="text-gray-600 mb-8">Thank you for reaching out. Our eco-specialist will get back to you within 24 hours.</p>
        <button onClick={() => setSubmitted(false)} className="text-[#2D5A27] font-bold border-b-2 border-[#2D5A27]">Send another message</button>
      </div>
    );
  }

  return (
    <section className="py-24 bg-white animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <h1 className="text-5xl font-bold mb-8 serif">Get in Touch</h1>
            <p className="text-lg text-gray-600 mb-12">
              Have questions about our sustainable processes or bulk orders for events? 
              We're here to help you make your next gathering eco-friendly.
            </p>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#F9F8F3] rounded-full flex items-center justify-center text-[#2D5A27]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Main Studio</h4>
                  <p className="text-gray-500">123 Green Earth Way, Sustainability Hub<br />Bangalore, KA 560001</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#F9F8F3] rounded-full flex items-center justify-center text-[#2D5A27]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Phone</h4>
                  <p className="text-gray-500">+91 98765 43210 (Mon-Sat, 10am-6pm)</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#F9F8F3] p-10 rounded-[2rem] space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                <input required className="w-full p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#2D5A27]" placeholder="Jane" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                <input required className="w-full p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#2D5A27]" placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <input required type="email" className="w-full p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#2D5A27]" placeholder="jane@example.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
              <textarea required rows={4} className="w-full p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#2D5A27]" placeholder="How can we help?"></textarea>
            </div>
            <button type="submit" className="w-full bg-[#2D5A27] text-white py-4 rounded-xl font-bold hover:bg-[#1a3817] transition-all">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
