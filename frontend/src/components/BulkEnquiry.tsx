
import React, { useState } from 'react';

const BulkEnquiry: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enquiryId, setEnquiryId] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    quantity: '',
    eventType: 'party',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Try port 5002 first (fallback), then 5001
      let response;
      try {
        response = await fetch('http://localhost:5001/api/send-bulk-enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          signal: AbortSignal.timeout(2000)
        });
      } catch {
        // Fallback to port 5002
        response = await fetch('http://localhost:5002/api/send-bulk-enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (!response.ok) throw new Error('Failed to send enquiry');
      
      const data = await response.json();
      setEnquiryId(data.enquiryId);
      setSubmittedEmail(formData.email);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('Error sending message. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-12 sm:py-20 md:py-32 max-w-3xl mx-auto px-4 text-center animate-fade-in">
        <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-[#A4C639]/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 md:mb-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 text-[#2D5A27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold serif mb-3 sm:mb-4 md:mb-6 text-[#4A3728]">Message Sent Successfully!</h2>
        <p className="text-base sm:text-lg md:text-xl text-[#2D5A27] max-w-lg mx-auto mb-8 sm:mb-10 md:mb-12 italic">
          "Thank you. Our team will call you soon to help with your big order."
        </p>
        
        {/* Email Confirmation Box */}
        <div className="bg-[#A4C639]/10 border-2 border-[#A4C639] rounded-2xl md:rounded-3xl p-6 md:p-10 mb-8 md:mb-12">
          <div className="flex items-start gap-3 md:gap-4 mb-4">
            <div className="text-3xl md:text-4xl">📧</div>
            <div className="text-left">
              <p className="text-sm md:text-base font-bold text-[#2D5A27] mb-2">✅ Email Confirmation Sent</p>
              <p className="text-xs md:text-sm text-[#2D5A27]/70">
                A confirmation email has been sent to <strong>{submittedEmail}</strong>
              </p>
              <p className="text-xs md:text-sm text-[#2D5A27]/70 mt-2">
                <strong>Your Enquiry ID:</strong> <span className="font-mono bg-white px-2 py-1 rounded">{enquiryId}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3 md:space-y-4 mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 p-4 bg-[#FAF9F6] rounded-xl md:rounded-2xl border border-[#2D5A27]/10">
            <span className="text-xl md:text-2xl">📞</span>
            <div className="text-left">
              <p className="text-xs md:text-sm font-bold text-[#2D5A27]">Call our team:</p>
              <p className="text-sm md:text-base text-[#2D5A27] font-bold"><strong>8367382095</strong> or <strong>9010613584</strong></p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 p-4 bg-[#FAF9F6] rounded-xl md:rounded-2xl border border-[#2D5A27]/10">
            <span className="text-xl md:text-2xl">📧</span>
            <div className="text-left">
              <p className="text-xs md:text-sm font-bold text-[#2D5A27]">Or reply to the email:</p>
              <p className="text-sm md:text-base text-[#2D5A27] font-bold">support@deepthienterprise.com</p>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-white border border-[#2D5A27]/10 rounded-2xl md:rounded-3xl p-6 md:p-8 mb-8 md:mb-12">
          <h3 className="text-lg md:text-xl font-bold text-[#4A3728] mb-4">What happens next?</h3>
          <ul className="text-left space-y-3 text-xs md:text-sm text-[#2D5A27]">
            <li className="flex items-start gap-3">
              <span className="text-[#A4C639] font-bold mt-0.5">1.</span>
              <span>We review your enquiry and confirm receipt</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#A4C639] font-bold mt-0.5">2.</span>
              <span>Our team contacts you within <strong>24 hours</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#A4C639] font-bold mt-0.5">3.</span>
              <span>We prepare a customized quote for your order</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#A4C639] font-bold mt-0.5">4.</span>
              <span>Your order gets delivered on time</span>
            </li>
          </ul>
        </div>

        <button 
          onClick={() => {
            setSubmitted(false);
            setFormData({
              name: '',
              company: '',
              email: '',
              phone: '',
              quantity: '',
              eventType: 'party',
              message: ''
            });
          }}
          className="btn-leaf px-6 sm:px-8 md:px-10 py-3 md:py-5 text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-widest shadow-xl rounded-xl md:rounded-2xl"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-[#FAF9F6] pb-16 md:pb-32">
      <section className="relative py-12 sm:py-20 md:py-32 bg-[#2D5A27] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Big Order" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center text-white">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-3 sm:mb-4 md:mb-6 block">Big Orders</span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold serif mb-4 sm:mb-6 md:mb-8 leading-tight">Work With Us <br /><span className="italic font-normal text-2xl sm:text-4xl md:text-5xl">Deepthi Enterprises.</span></h1>
          <p className="text-sm sm:text-base md:text-xl text-white/70 max-w-2xl mx-auto font-medium px-2">
            We help you get many plates and bowls for your parties or weddings. No plastic.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4 text-sm">
            <p>📞 <strong>8367382095</strong> | <strong>9010613584</strong></p>
            <p>📧 <strong>support@deepthienterprise.com</strong></p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-12 md:-mt-16 relative z-20">
        <div className="bg-white rounded-2xl md:rounded-[3rem] shadow-2xl overflow-hidden border border-[#2D5A27]/10">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-2 bg-[#FAF9F6] p-6 sm:p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-[#2D5A27]/10">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold serif text-[#4A3728] mb-6 md:mb-10">Why buy <br />from us?</h3>
              <ul className="space-y-4 md:space-y-8">
                {[
                  { title: "No Plastic", desc: "All items come from real trees and plants." },
                  { title: "Good for Nature", desc: "We use methods that don't hurt the earth." },
                  { title: "Fast Help", desc: "We are here in Hyderabad to help you quickly." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 md:gap-4">
                    <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-[#A4C639] flex-shrink-0 mt-0.5 md:mt-1 flex items-center justify-center">
                      <svg className="w-2 md:w-3 h-2 md:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#4A3728] text-xs md:text-sm uppercase tracking-wide">{item.title}</h4>
                      <p className="text-[10px] md:text-xs text-[#2D5A27]/70 mt-1 font-medium">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3 p-6 sm:p-8 md:p-12">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 ml-2">Full Name</label>
                    <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 md:p-5 bg-[#FAF9F6] rounded-lg md:rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none font-bold text-[#4A3728] transition-all text-sm" placeholder="Enter your name" />
                  </div>
                  <div>
                    <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 ml-2">Company Name</label>
                    <input value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full p-3 md:p-5 bg-[#FAF9F6] rounded-lg md:rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none font-bold text-[#4A3728] transition-all text-sm" placeholder="Where do you work?" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 ml-2">Email Address</label>
                    <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 md:p-5 bg-[#FAF9F6] rounded-lg md:rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none font-bold text-[#4A3728] transition-all text-sm" placeholder="Email" />
                  </div>
                  <div>
                    <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 ml-2">Phone Number</label>
                    <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-3 md:p-5 bg-[#FAF9F6] rounded-lg md:rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none font-bold text-[#4A3728] transition-all text-sm" placeholder="Phone" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-leaf py-4 md:py-7 font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-xs md:text-sm shadow-2xl rounded-lg md:rounded-2xl mt-6 md:mt-8 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Help Request'}
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
