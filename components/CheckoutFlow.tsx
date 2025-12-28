
import React, { useState } from 'react';
import { OrderDetails, CartItem } from '../types';

interface CheckoutFlowProps {
  items: CartItem[];
  onComplete: (details: OrderDetails) => void;
  onCancel: () => void;
}

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ items, onComplete, onCancel }) => {
  const [step, setStep] = useState<'shipping' | 'payment' | 'processing' | 'success'>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [formData, setFormData] = useState<OrderDetails>({
    email: '', address: '', city: '', zipCode: '',
    cardName: '', cardNumber: '', expiry: '', cvv: ''
  });
  const [upiId, setUpiId] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const shipping = subtotal > 1000 ? 0 : 99;
  const total = subtotal + tax + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'shipping') {
      setStep('payment');
    } else if (step === 'payment') {
      setStep('processing');
      // Simulate bank delay
      setTimeout(() => setStep('success'), 2500);
    }
  };

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 z-[100] bg-[#FAF9F6] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-[#2D5A27] border-t-transparent rounded-full animate-spin mb-8"></div>
        <h2 className="text-4xl font-bold serif text-[#4A3728] text-center mb-4">Please Wait...</h2>
        <p className="text-[#2D5A27] font-medium opacity-60">Connecting to secure payment gateway</p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-[100] bg-[#FAF9F6] flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center glass-card p-16 bg-white shadow-2xl rounded-[3rem] border-8 border-white">
          <div className="w-24 h-24 bg-[#A4C639]/20 rounded-full flex items-center justify-center mx-auto mb-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#2D5A27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-5xl font-bold mb-6 serif text-[#4A3728]">Thank You!</h2>
          <p className="text-[#2D5A27] text-lg mb-12 font-medium">
            Your payment was successful. We will send it soon to <br /> <span className="font-bold text-[#4A3728]">{formData.address}</span>
          </p>
          <button onClick={() => onComplete(formData)} className="w-full btn-leaf py-6 font-black uppercase tracking-[0.3em] shadow-2xl">
            View Order Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#FAF9F6] overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-bold serif text-[#4A3728]">Checkout</h1>
          <button onClick={onCancel} className="text-[#2D5A27] font-bold flex items-center gap-2 px-6 py-3 bg-white border border-[#2D5A27]/10 rounded-2xl hover:shadow-md transition-all">
            ✕ Close
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-16">
          <div className="flex-1">
            {/* Step Progress Bar */}
            <div className="flex items-center gap-4 mb-12">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${step === 'shipping' ? 'bg-[#2D5A27] text-white' : 'bg-[#A4C639] text-white'}`}>1</div>
              <div className={`h-1 flex-1 rounded-full ${step === 'payment' ? 'bg-[#A4C639]' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${step === 'payment' ? 'bg-[#2D5A27] text-white' : 'bg-gray-200 text-gray-400'}`}>2</div>
            </div>

            <form onSubmit={handleNext} className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-xl border border-[#2D5A27]/5">
              {step === 'shipping' ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-3xl font-bold serif text-[#4A3728] mb-4">Delivery Details</h2>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 ml-2">Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-6 bg-[#FAF9F6] rounded-2xl outline-none border-2 border-transparent focus:border-[#A4C639] transition-all" placeholder="Enter your Email" />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 ml-2">Address</label>
                    <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full p-6 bg-[#FAF9F6] rounded-2xl outline-none border-2 border-transparent focus:border-[#A4C639] transition-all" placeholder="Your Home Address" />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 ml-2">City</label>
                      <input required name="city" value={formData.city} onChange={handleInputChange} className="w-full p-6 bg-[#FAF9F6] rounded-2xl outline-none border-2 border-transparent focus:border-[#A4C639] transition-all" placeholder="City" />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 ml-2">Pin Code</label>
                      <input required name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="w-full p-6 bg-[#FAF9F6] rounded-2xl outline-none border-2 border-transparent focus:border-[#A4C639] transition-all" placeholder="6 digits" />
                    </div>
                  </div>
                  <button type="submit" className="w-full btn-leaf py-7 font-black uppercase tracking-[0.3em] text-sm mt-4 shadow-xl">
                    Next: Payment Section
                  </button>
                </div>
              ) : (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-3xl font-bold serif text-[#4A3728] mb-4">Payment Section</h2>
                  
                  <div className="flex gap-4 p-2 bg-[#FAF9F6] rounded-[2.5rem] border border-[#2D5A27]/5">
                    <button 
                      type="button" 
                      onClick={() => setPaymentMethod('card')} 
                      className={`flex-1 py-5 rounded-3xl font-bold text-[10px] uppercase tracking-widest transition-all ${paymentMethod === 'card' ? 'bg-white shadow-md text-[#2D5A27]' : 'text-[#2D5A27]/40 hover:text-[#2D5A27]'}`}
                    >
                      Credit / Debit Card
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setPaymentMethod('upi')} 
                      className={`flex-1 py-5 rounded-3xl font-bold text-[10px] uppercase tracking-widest transition-all ${paymentMethod === 'upi' ? 'bg-white shadow-md text-[#2D5A27]' : 'text-[#2D5A27]/40 hover:text-[#2D5A27]'}`}
                    >
                      UPI (GPay/PhonePe)
                    </button>
                  </div>

                  {paymentMethod === 'card' ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 ml-2">Name on Card</label>
                        <input required name="cardName" value={formData.cardName} onChange={handleInputChange} className="w-full p-6 bg-[#FAF9F6] rounded-2xl outline-none border-2 border-transparent focus:border-[#A4C639] transition-all" placeholder="Full Name" />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 ml-2">Card Number</label>
                        <input required name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} className="w-full p-6 bg-[#FAF9F6] rounded-2xl outline-none border-2 border-transparent focus:border-[#A4C639] transition-all" placeholder="16 Digits" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 ml-2">Expiry Date</label>
                          <input required name="expiry" value={formData.expiry} onChange={handleInputChange} className="w-full p-6 bg-[#FAF9F6] rounded-2xl outline-none border-2 border-transparent focus:border-[#A4C639] transition-all" placeholder="MM / YY" />
                        </div>
                        <div className="space-y-4">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 ml-2">CVV</label>
                          <input required name="cvv" value={formData.cvv} onChange={handleInputChange} className="w-full p-6 bg-[#FAF9F6] rounded-2xl outline-none border-2 border-transparent focus:border-[#A4C639] transition-all" placeholder="3 Digits" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-2">
                      <div className="bg-[#FAF9F6] p-10 rounded-[3rem] border-2 border-dashed border-[#A4C639]/30">
                        <p className="text-sm font-bold text-[#4A3728] mb-6">Enter your UPI ID below</p>
                        <input 
                          value={upiId} 
                          onChange={(e) => setUpiId(e.target.value)} 
                          className="w-full p-6 bg-white rounded-2xl outline-none text-center text-xl font-bold text-[#2D5A27]" 
                          placeholder="username@bank" 
                        />
                        <p className="text-[10px] text-[#2D5A27]/40 mt-4 font-black uppercase tracking-widest">Example: 9876543210@ybl</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-6 pt-4">
                    <button type="button" onClick={() => setStep('shipping')} className="px-10 py-6 border-2 border-[#2D5A27]/10 rounded-2xl font-bold text-[#2D5A27] hover:bg-gray-50 transition-all text-[10px] uppercase tracking-widest">Back</button>
                    <button type="submit" className="flex-1 btn-leaf py-6 font-black uppercase tracking-[0.3em] text-sm shadow-xl">
                      Pay Total ₹{total}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          <aside className="xl:w-[400px] shrink-0">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-[#2D5A27]/5 sticky top-24">
              <h3 className="text-2xl font-bold serif text-[#4A3728] mb-8">Selected Items</h3>
              <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center group">
                    <img src={item.image} className="w-16 h-16 organic-shape object-cover border border-[#2D5A27]/5 shadow-sm" alt={item.name} />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-[#4A3728]">{item.name}</p>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#A4C639]">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-8 space-y-4">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-gray-200">Hidden</span>
                </div>
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-[#A4C639]">FREE</span> : 'Calculated'}</span>
                </div>
                <div className="flex justify-between font-black text-3xl pt-8 text-[#2D5A27] border-t border-[#2D5A27]/5">
                  <span className="serif">Total</span>
                  <span>₹{total}</span>
                </div>
                <p className="text-[9px] font-bold text-[#2D5A27]/40 uppercase tracking-widest text-center mt-4">Safe & Secure Payment</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFlow;
