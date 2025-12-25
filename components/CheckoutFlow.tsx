
import React, { useState } from 'react';
import { OrderDetails, CartItem } from '../types';

interface CheckoutFlowProps {
  items: CartItem[];
  onComplete: (details: OrderDetails) => void;
  onCancel: () => void;
}

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ items, onComplete, onCancel }) => {
  const [step, setStep] = useState<'shipping' | 'payment' | 'processing' | 'success'>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'net'>('card');
  const [formData, setFormData] = useState<OrderDetails>({
    email: '', address: '', city: '', zipCode: '',
    cardName: '', cardNumber: '', expiry: '', cvv: ''
  });
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 1000 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'shipping') setStep('payment');
    else if (step === 'payment') {
      setStep('processing');
      setTimeout(() => setStep('success'), 4000);
    }
  };

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 z-[100] bg-[#FAF9F6] flex flex-col items-center justify-center p-4">
        <div className="relative w-40 h-40 mb-12">
           <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M20,80 Q50,85 80,80" stroke="#4A3728" strokeWidth="4" fill="none" />
              <path d="M50,80 Q48,60 50,40" stroke="#5D7C52" strokeWidth="3" fill="none" className="branch-grow" />
              <path d="M50,40 Q65,30 60,15" stroke="#A4C639" strokeWidth="2" fill="none" className="leaf-appear" style={{ animationDelay: '1.5s' }} />
              <path d="M50,40 Q35,30 40,15" stroke="#A4C639" strokeWidth="2" fill="none" className="leaf-appear" style={{ animationDelay: '2.0s' }} />
           </svg>
        </div>
        <h2 className="text-4xl font-bold serif text-[#4A3728] text-center mb-4">Securing Your Order...</h2>
        <div className="flex items-center gap-3 bg-white/50 px-6 py-3 rounded-full border border-[#5D7C52]/10">
           <span className="w-2 h-2 bg-[#A4C639] rounded-full animate-ping"></span>
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#5D7C52]">Encryption Active</span>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-[100] bg-[#FAF9F6] flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center glass-card p-16 border-[#A4C639]/30 relative overflow-hidden bg-white shadow-2xl rounded-[3rem]">
          <div className="w-28 h-28 bg-[#A4C639]/20 organic-shape flex items-center justify-center mx-auto mb-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-[#5D7C52]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-5xl font-bold mb-6 serif text-[#4A3728]">Order Successful!</h2>
          <p className="text-[#5D7C52] text-lg mb-12 font-medium leading-relaxed max-w-sm mx-auto">
            Your journey toward sustainable living has begun. A confirmation has been sent to <br /><span className="font-bold border-b-2 border-[#A4C639]">{formData.email}</span>
          </p>
          <button 
            onClick={() => onComplete(formData)}
            className="w-full btn-leaf py-6 font-black uppercase tracking-[0.3em] shadow-2xl"
          >
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#FAF9F6] overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-20 lg:py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A4C639] mb-4 block">LeafyLife Heritage Payment</span>
            <h1 className="text-6xl font-bold serif text-[#4A3728]">Complete Your <br /><span className="italic font-normal">Purchase.</span></h1>
          </div>
          <button onClick={onCancel} className="group flex items-center gap-3 px-8 py-4 bg-white border border-[#5D7C52]/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#5D7C52] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Exit Checkout
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-20">
          <div className="flex-1">
            <nav className="flex gap-16 mb-16 relative overflow-x-auto pb-4 custom-scrollbar">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#5D7C52]/5 -translate-y-1/2 -z-10"></div>
              <div className={`flex items-center gap-4 px-6 py-2 bg-[#FAF9F6] z-10 whitespace-nowrap ${step === 'shipping' ? 'text-[#5D7C52]' : 'text-[#5D7C52]/30'}`}>
                <span className={`w-10 h-10 flex items-center justify-center rounded-full text-[12px] font-black ${step === 'shipping' ? 'bg-[#5D7C52] text-white shadow-lg' : 'bg-[#5D7C52]/10'}`}>1</span>
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Shipping Details</span>
              </div>
              <div className={`flex items-center gap-4 px-6 py-2 bg-[#FAF9F6] z-10 whitespace-nowrap ${step === 'payment' ? 'text-[#5D7C52]' : 'text-[#5D7C52]/30'}`}>
                <span className={`w-10 h-10 flex items-center justify-center rounded-full text-[12px] font-black ${step === 'payment' ? 'bg-[#5D7C52] text-white shadow-lg' : 'bg-[#5D7C52]/10'}`}>2</span>
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Secure Payment</span>
              </div>
            </nav>

            <form onSubmit={handleNext} className="glass-card p-12 space-y-10 bg-white shadow-2xl rounded-[3rem] border border-[#5D7C52]/5">
              {step === 'shipping' ? (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-3 ml-2">Email for Updates</label>
                       <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-6 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none transition-all font-bold text-[#4A3728]" placeholder="hello@world.com" />
                     </div>
                     <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-3 ml-2">Phone Number</label>
                       <input required type="tel" className="w-full p-6 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none transition-all font-bold text-[#4A3728]" placeholder="+91 00000 00000" />
                     </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-3 ml-2">Full Shipping Address</label>
                    <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full p-6 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none transition-all font-bold text-[#4A3728]" placeholder="House No, Street, Landmarks" />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-3 ml-2">City</label>
                      <input required name="city" value={formData.city} onChange={handleInputChange} className="w-full p-6 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none transition-all font-bold text-[#4A3728]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-3 ml-2">Pincode</label>
                      <input required name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="w-full p-6 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none transition-all font-bold text-[#4A3728]" />
                    </div>
                  </div>
                  <button type="submit" className="w-full btn-leaf py-7 font-black uppercase tracking-[0.3em] shadow-xl group rounded-2xl">
                    Proceed to Payment Gate
                  </button>
                </div>
              ) : (
                <div className="space-y-12 animate-fade-in">
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl flex flex-wrap gap-2">
                    {[
                      { id: 'card', label: 'Credit/Debit', icon: '💳' },
                      { id: 'upi', label: 'UPI / GPay', icon: '⚡' },
                      { id: 'net', label: 'Net Banking', icon: '🏦' }
                    ].map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`flex-1 min-w-[120px] p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                          paymentMethod === method.id 
                            ? 'bg-[#5D7C52] text-white border-[#5D7C52] shadow-xl scale-[1.02]' 
                            : 'bg-white border-[#5D7C52]/5 text-[#5D7C52] hover:border-[#5D7C52]/20'
                        }`}
                      >
                        <span className="text-3xl">{method.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{method.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="min-h-[300px] border-t-2 border-dashed border-[#5D7C52]/5 pt-10">
                    {paymentMethod === 'card' && (
                      <div className="space-y-6 animate-fade-in">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-3 ml-2">Name on Card</label>
                          <input required name="cardName" value={formData.cardName} onChange={handleInputChange} className="w-full p-6 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none transition-all font-bold uppercase text-[#4A3728]" placeholder="AS PRINTED ON CARD" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-3 ml-2">16-Digit Card Number</label>
                          <input required name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} className="w-full p-6 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none transition-all font-bold text-[#4A3728]" placeholder="XXXX XXXX XXXX XXXX" />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-3 ml-2">Expiry Date</label>
                            <input required name="expiry" value={formData.expiry} onChange={handleInputChange} className="w-full p-6 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none transition-all font-bold text-[#4A3728]" placeholder="MM / YY" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-3 ml-2">Security Code (CVV)</label>
                            <input required name="cvv" value={formData.cvv} onChange={handleInputChange} className="w-full p-6 bg-[#FAF9F6] rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none transition-all font-bold text-[#4A3728]" placeholder="***" />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'upi' && (
                      <div className="space-y-8 animate-fade-in">
                        <div className="bg-[#FAF9F6] p-10 rounded-[2.5rem] border border-dashed border-[#5D7C52]/20 text-center">
                          <div className="flex justify-center gap-6 mb-8">
                             <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#5D7C52]/5"><img src="https://img.icons8.com/color/48/google-pay.png" className="h-10" alt="GPay" /></div>
                             <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#5D7C52]/5"><img src="https://img.icons8.com/color/48/phone-pe.png" className="h-10" alt="PhonePe" /></div>
                             <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#5D7C52]/5"><img src="https://img.icons8.com/color/48/paytm.png" className="h-10" alt="Paytm" /></div>
                          </div>
                          <h4 className="text-xl font-bold serif text-[#4A3728] mb-4">Pay via VPA (UPI ID)</h4>
                          <input 
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full max-w-sm p-6 bg-white rounded-2xl border-2 border-transparent focus:border-[#A4C639] outline-none transition-all font-bold text-center text-[#4A3728] shadow-sm text-lg"
                            placeholder="username@bankid"
                          />
                          <p className="text-[10px] text-[#5D7C52]/60 mt-6 font-bold uppercase tracking-widest leading-relaxed">
                            Open your UPI app after clicking authorize <br /> to approve the pending harvest payment.
                          </p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'net' && (
                      <div className="space-y-8 animate-fade-in">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/40 mb-4 ml-2">Select Your Institution</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {[
                            { name: 'HDFC Bank', icon: '🏦' },
                            { name: 'ICICI Bank', icon: '🏦' },
                            { name: 'SBI', icon: '🏦' },
                            { name: 'Axis Bank', icon: '🏦' },
                            { name: 'Kotak', icon: '🏦' },
                            { name: 'Others', icon: '🌐' }
                          ].map(bank => (
                            <button
                              key={bank.name}
                              type="button"
                              onClick={() => setSelectedBank(bank.name)}
                              className={`p-6 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 ${
                                selectedBank === bank.name ? 'bg-[#5D7C52] text-white border-[#5D7C52] shadow-lg' : 'bg-[#FAF9F6] border-[#5D7C52]/5 text-[#5D7C52] hover:bg-white'
                              }`}
                            >
                              <span className="text-xl opacity-40">{bank.icon}</span>
                              {bank.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-6 pt-10">
                    <div className="flex flex-wrap items-center justify-between p-6 bg-[#A4C639]/5 rounded-2xl border border-[#A4C639]/10 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#A4C639] rounded-full flex items-center justify-center text-white shadow-sm">
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                        </div>
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-widest text-[#5D7C52] block">Verified Secure</span>
                          <span className="text-[9px] text-[#5D7C52]/60 font-bold uppercase tracking-tighter">AES-256 BANK GRADE SECURITY</span>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <img src="https://img.icons8.com/color/48/visa.png" className="h-6 opacity-60 hover:opacity-100 transition-opacity" alt="Visa" />
                        <img src="https://img.icons8.com/color/48/mastercard.png" className="h-6 opacity-60 hover:opacity-100 transition-opacity" alt="Mastercard" />
                        <img src="https://img.icons8.com/color/48/upi.png" className="h-6 opacity-60 hover:opacity-100 transition-opacity" alt="UPI" />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t border-[#5D7C52]/10">
                      <button type="button" onClick={() => setStep('shipping')} className="px-10 py-6 rounded-2xl font-black uppercase tracking-[0.2em] bg-white border border-[#5D7C52]/10 text-[#5D7C52]/40 hover:text-[#5D7C52] transition-all text-xs">Back to Shipping</button>
                      <button type="submit" className="flex-1 btn-leaf py-6 font-black uppercase tracking-[0.3em] shadow-2xl text-lg rounded-2xl">
                        Authorize ₹{total}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          <aside className="xl:w-[450px]">
            <div className="glass-card p-12 border-[#5D7C52]/10 sticky top-10 bg-white shadow-2xl rounded-[3rem]">
              <div className="flex items-center justify-between mb-10 border-b border-[#5D7C52]/10 pb-6">
                <h3 className="text-3xl font-bold serif text-[#4A3728]">Order Artifacts</h3>
                <span className="text-[10px] font-black text-[#A4C639] uppercase tracking-widest bg-[#A4C639]/10 px-4 py-1.5 rounded-full">
                  {items.reduce((a, b) => a + b.quantity, 0)} Units
                </span>
              </div>

              <div className="space-y-6 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar mb-10">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center group">
                    <div className="w-16 h-16 organic-shape overflow-hidden border-2 border-[#FAF9F6] shadow-md flex-shrink-0">
                      <img src={item.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={item.name} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#4A3728] leading-tight line-clamp-1">{item.name}</p>
                      <p className="text-[9px] text-[#5D7C52]/60 font-medium italic">QTY {item.quantity}</p>
                    </div>
                    <span className="text-xs font-black text-[#5D7C52]">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 pt-10 border-t-2 border-dashed border-[#5D7C52]/10 bg-[#FAF9F6]/50 p-6 rounded-2xl">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/60">
                  <span>Cart Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/60">
                  <span>GST (Tax 5%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/60">
                  <span>Green Shipping</span>
                  <span className={shipping === 0 ? "text-[#A4C639]" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-4xl font-bold text-[#4A3728] pt-8 serif border-t border-[#5D7C52]/10 mt-4">
                  <span>Total</span>
                  <span className="text-[#5D7C52]">₹{total}</span>
                </div>
              </div>
              
              <p className="text-[8px] text-center text-[#5D7C52]/40 font-black uppercase tracking-[0.4em] mt-10">Sustainable Packaging Guaranteed</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFlow;
