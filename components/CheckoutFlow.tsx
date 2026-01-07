
import React, { useState } from 'react';
import { OrderDetails, CartItem } from '../types';

interface CheckoutFlowProps {
  items: CartItem[];
  onComplete: (details: OrderDetails) => void;
  onCancel: () => void;
}

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ items, onComplete, onCancel }) => {
  const [step, setStep] = useState<'shipping' | 'payment' | 'processing' | 'success'>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [formData, setFormData] = useState<OrderDetails>({
    email: '', address: '', city: '', zipCode: '',
    cardName: '', cardNumber: '', expiry: '', cvv: ''
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + Math.round(subtotal * 0.05) + (subtotal > 1500 ? 0 : 150);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'shipping') setStep('payment');
    else {
      setStep('processing');
      setTimeout(() => setStep('success'), 2000);
    }
  };

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#108242] border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-sm font-bold tracking-widest text-[#108242] uppercase">Securely Processing Payment...</p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#A4C639] rounded-full flex items-center justify-center mx-auto mb-8 text-white text-3xl">✓</div>
          <h2 className="text-4xl font-bold serif mb-4">Payment Successful</h2>
          <p className="text-gray-500 mb-10">Thank you for choosing Vistaraku. Your eco-friendly order is being prepared.</p>
          <button onClick={() => onComplete(formData)} className="w-full py-5 bg-[#108242] text-white font-bold uppercase tracking-widest text-[10px]">Track Order</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#FAF9F6] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-16 border-b pb-8">
          <h1 className="text-3xl font-bold serif text-[#108242]">Checkout</h1>
          <button onClick={onCancel} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors">✕ Close</button>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1">
            <form onSubmit={handleNext} className="space-y-12">
              {step === 'shipping' ? (
                <div className="bg-white p-10 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold serif mb-8">Shipping Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <input required name="email" value={formData.email} onChange={handleInputChange} className="w-full p-4 border border-gray-100 bg-[#FAF9F6] text-sm outline-none focus:border-[#108242]" placeholder="Email Address" />
                    <input required name="cardName" value={formData.cardName} onChange={handleInputChange} className="w-full p-4 border border-gray-100 bg-[#FAF9F6] text-sm outline-none focus:border-[#108242]" placeholder="Full Name" />
                  </div>
                  <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full p-4 border border-gray-100 bg-[#FAF9F6] text-sm outline-none focus:border-[#108242] mb-6" placeholder="Street Address" />
                  <div className="grid grid-cols-2 gap-6">
                    <input required name="city" value={formData.city} onChange={handleInputChange} className="w-full p-4 border border-gray-100 bg-[#FAF9F6] text-sm outline-none focus:border-[#108242]" placeholder="City" />
                    <input required name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="w-full p-4 border border-gray-100 bg-[#FAF9F6] text-sm outline-none focus:border-[#108242]" placeholder="Pincode" />
                  </div>
                  <button type="submit" className="w-full mt-10 py-6 bg-[#108242] text-white font-bold uppercase tracking-widest text-[10px]">Continue to Payment</button>
                </div>
              ) : (
                <div className="bg-white p-10 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold serif mb-8">Select Payment Method</h2>
                  <div className="flex gap-4 mb-10">
                    <button type="button" onClick={() => setPaymentMethod('upi')} className={`flex-1 py-4 border text-[10px] font-bold uppercase tracking-widest ${paymentMethod === 'upi' ? 'border-[#108242] bg-[#108242]/5 text-[#108242]' : 'border-gray-100 text-gray-400'}`}>UPI / QR</button>
                    <button type="button" onClick={() => setPaymentMethod('card')} className={`flex-1 py-4 border text-[10px] font-bold uppercase tracking-widest ${paymentMethod === 'card' ? 'border-[#108242] bg-[#108242]/5 text-[#108242]' : 'border-gray-100 text-gray-400'}`}>Card</button>
                  </div>

                  {paymentMethod === 'upi' ? (
                    <div className="text-center py-6 bg-[#FAF9F6] border-2 border-dashed border-gray-100 mb-8">
                      <div className="w-32 h-32 bg-white border border-gray-100 mx-auto mb-4 flex items-center justify-center p-2">
                        {/* Simulated QR */}
                        <div className="w-full h-full bg-gray-900 opacity-80 grid grid-cols-4 grid-rows-4 gap-1 p-1">
                          {Array.from({length: 16}).map((_, i) => <div key={i} className={`bg-white ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-20'}`}></div>)}
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scan with GPay, PhonePe, or Paytm</p>
                    </div>
                  ) : (
                    <div className="space-y-6 mb-8">
                      <input required name="cardNumber" className="w-full p-4 border border-gray-100 bg-[#FAF9F6] text-sm outline-none focus:border-[#108242]" placeholder="Card Number" />
                      <div className="grid grid-cols-2 gap-6">
                        <input required name="expiry" className="w-full p-4 border border-gray-100 bg-[#FAF9F6] text-sm outline-none focus:border-[#108242]" placeholder="MM / YY" />
                        <input required name="cvv" className="w-full p-4 border border-gray-100 bg-[#FAF9F6] text-sm outline-none focus:border-[#108242]" placeholder="CVV" />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep('shipping')} className="flex-1 py-6 border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-400">Back</button>
                    <button type="submit" className="flex-[2] py-6 bg-[#108242] text-white font-bold uppercase tracking-widest text-[10px]">Pay ₹{total.toLocaleString()}</button>
                  </div>
                </div>
              )}
            </form>
          </div>

          <aside className="lg:w-[350px]">
            <div className="bg-white p-10 border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold serif mb-8 pb-4 border-b">Order Summary</h3>
              <div className="space-y-6 mb-10 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} className="w-12 h-12 object-cover border" alt="" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#333] mb-1">{item.name}</p>
                      <p className="text-[10px] text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-6 border-t text-sm">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-[#108242] text-lg mt-4"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFlow;
