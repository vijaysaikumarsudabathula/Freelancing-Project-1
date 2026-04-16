
import React, { useState, useEffect } from 'react';
import { OrderDetails, CartItem, User } from '../types';
import { logTransaction, logActivity } from '../services/database';
import { getPaymentConfigForCheckout, isOrderAmountValid, type PaymentConfig } from '../services/paymentAdmin';

interface CheckoutFlowProps {
  items: CartItem[];
  onComplete: (details: OrderDetails) => void;
  onCancel: () => void;
  user: User | null;
  onLoginRequired?: () => void;
}

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ items, onComplete, onCancel, user, onLoginRequired }) => {
  // Check if user is logged in, if not show login prompt
  if (!user) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-4 md:p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 md:w-20 h-16 md:h-20 bg-[#A4C639]/20 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 text-[#108242] text-2xl md:text-3xl">🔐</div>
          <h2 className="text-xl md:text-2xl font-bold serif mb-3 md:mb-4">Login Required</h2>
          <p className="text-xs md:text-sm text-gray-500 mb-6 md:mb-8">Please log in to your account to proceed with checkout and provide your shipping details.</p>
          <div className="flex gap-2 md:gap-4">
            <button onClick={onCancel} className="flex-1 py-3 md:py-4 border border-gray-200 text-[7px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:border-gray-300 rounded-lg">Cancel</button>
            <button onClick={onLoginRequired} className="flex-1 py-3 md:py-4 bg-[#108242] text-white font-bold uppercase tracking-widest text-[7px] md:text-[10px] rounded-lg">Login Now</button>
          </div>
        </div>
      </div>
    );
  }
  const [step, setStep] = useState<'shipping' | 'payment' | 'processing' | 'success'>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'bank'>('card');
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [amountError, setAmountError] = useState('');
  const [configLoading, setConfigLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OrderDetails>({
    email: '', address: '', city: '', zipCode: '',
    cardName: '', cardNumber: '', expiry: '', cvv: ''
  });

  // Load payment configuration on mount
  useEffect(() => {
    const loadPaymentConfig = async () => {
      try {
        const config = await getPaymentConfigForCheckout();
        setPaymentConfig(config);
        
        // Set default payment method based on what's enabled
        if (config.cardPaymentEnabled) {
          setPaymentMethod('card');
        } else if (config.upiPaymentEnabled) {
          setPaymentMethod('upi');
        } else if (config.bankTransferEnabled) {
          setPaymentMethod('bank');
        }
      } catch (error) {
        console.error('Error loading payment config:', error);
        // Fallback defaults
        setPaymentConfig({
          upiId: '',
          upiQrCode: '',
          bankAccountName: '',
          bankAccountNumber: '',
          bankIFSC: '',
          bankName: '',
          bankBranch: '',
          cardPaymentEnabled: true,
          upiPaymentEnabled: true,
          bankTransferEnabled: false,
          minOrderAmount: 100,
          maxOrderAmount: 100000,
          paymentDescription: ''
        });
        setPaymentMethod('card');
      } finally {
        setConfigLoading(false);
      }
    };

    loadPaymentConfig();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + Math.round(subtotal * 0.05) + (subtotal > 1500 ? 0 : 150);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'shipping') {
      setStep('payment');
    } else {
      // Validate order amount before processing payment
      if (paymentConfig && !isOrderAmountValid(paymentConfig, total)) {
        setAmountError(
          `Order amount must be between ₹${paymentConfig.minOrderAmount} and ₹${paymentConfig.maxOrderAmount}`
        );
        return;
      }
      
      setStep('processing');
      setTimeout(() => setStep('success'), 2000);
    }
  };

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-4">
        <div className="w-12 md:w-16 h-12 md:h-16 border-4 border-[#108242] border-t-transparent rounded-full animate-spin mb-4 md:mb-6"></div>
        <p className="text-xs md:text-sm font-bold tracking-widest text-[#108242] uppercase">Securely Processing Payment...</p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-[100] bg-white overflow-y-auto flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center py-8 md:py-12">
          {/* Success Icon */}
          <div className="w-16 md:w-20 h-16 md:h-20 bg-[#A4C639] rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 text-white text-2xl md:text-3xl">✓</div>
          
          <h2 className="text-2xl md:text-4xl font-bold serif mb-3 md:mb-4">Payment Submitted!</h2>
          <p className="text-xs md:text-sm text-gray-500 mb-8 md:mb-12">Thank you for choosing Deepthi Enterprises. Your eco-friendly order is almost ready!</p>

          {/* Manual Payment Confirmation Section */}
          <div className="bg-gradient-to-br from-[#108242]/10 via-[#A4C639]/10 to-transparent rounded-2xl md:rounded-3xl border-2 border-[#108242]/20 p-6 md:p-10 mb-8 md:mb-12">
            <div className="flex flex-col items-center gap-4 md:gap-6">
              {/* Phone Icon */}
              <div className="w-12 md:w-16 h-12 md:h-16 bg-[#108242] rounded-full flex items-center justify-center text-white text-2xl md:text-3xl">
                📞
              </div>

              {/* Instructions */}
              <div className="w-full">
                <h3 className="text-lg md:text-2xl font-bold serif text-[#108242] mb-2 md:mb-3">Confirm Your Payment</h3>
                <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6 leading-relaxed">
                  Since your payment is via QR code or manual transfer, please <strong className="text-[#108242]">call our team</strong> to confirm your payment and order.
                </p>

                {/* Contact Numbers */}
                <div className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                    <a 
                      href="tel:+918367382095"
                      className="flex-1 bg-white border-2 border-[#108242] p-4 md:p-6 rounded-xl md:rounded-2xl hover:bg-[#108242] hover:text-white transition-all group"
                    >
                      <p className="text-[10px] md:text-xs font-black text-[#108242]/60 group-hover:text-white/80 uppercase tracking-wider mb-1 md:mb-2">Call Now</p>
                      <p className="text-lg md:text-2xl font-bold text-[#108242] group-hover:text-white font-mono">+91 8367382095</p>
                    </a>

                    <a 
                      href="tel:+919010613584"
                      className="flex-1 bg-white border-2 border-[#108242] p-4 md:p-6 rounded-xl md:rounded-2xl hover:bg-[#108242] hover:text-white transition-all group"
                    >
                      <p className="text-[10px] md:text-xs font-black text-[#108242]/60 group-hover:text-white/80 uppercase tracking-wider mb-1 md:mb-2">Call Now</p>
                      <p className="text-lg md:text-2xl font-bold text-[#108242] group-hover:text-white font-mono">+91 9010613584</p>
                    </a>
                  </div>
                </div>

                {/* What to mention */}
                <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-[#108242]/20">
                  <p className="text-[10px] md:text-xs font-bold text-[#108242] uppercase tracking-widest mb-3 md:mb-4">When you call, mention:</p>
                  <div className="text-left bg-white p-3 md:p-4 rounded-lg md:rounded-xl border border-[#108242]/10">
                    <ul className="space-y-2 text-[8px] md:text-xs text-gray-700">
                      <li className="flex gap-2 items-start">
                        <span className="text-[#A4C639] font-bold mt-0.5">✓</span>
                        <span><strong>Order ID:</strong> You'll receive this in email shortly</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <span className="text-[#A4C639] font-bold mt-0.5">✓</span>
                        <span><strong>Your Email:</strong> {formData.email}</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <span className="text-[#A4C639] font-bold mt-0.5">✓</span>
                        <span><strong>Payment Method:</strong> {paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'bank' ? 'Bank Transfer' : 'Card'}</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <span className="text-[#A4C639] font-bold mt-0.5">✓</span>
                        <span><strong>Total Amount:</strong> ₹{total.toLocaleString()}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Process Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl md:rounded-2xl p-4 md:p-6 mb-8 md:mb-12">
            <div className="flex gap-3 md:gap-4 items-start">
              <span className="text-xl md:text-2xl flex-shrink-0">ℹ️</span>
              <div className="text-left">
                <p className="text-[9px] md:text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-2">How it works</p>
                <ol className="text-[8px] md:text-xs text-blue-800 space-y-1.5 md:space-y-2">
                  <li><strong>1.</strong> Call either of the numbers above</li>
                  <li><strong>2.</strong> Confirm your payment and order details</li>
                  <li><strong>3.</strong> Provide your Order ID (from confirmation email)</li>
                  <li><strong>4.</strong> Our team marks order as confirmed in the system</li>
                  <li><strong>5.</strong> Your order status changes to "Processing"</li>
                  <li><strong>6.</strong> You'll receive tracking updates via email & phone</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Check Email Section */}
          <div className="bg-[#A4C639]/10 border border-[#A4C639]/30 rounded-xl md:rounded-2xl p-4 md:p-6 mb-8 md:mb-12">
            <p className="text-[8px] md:text-[10px] font-bold text-[#2D5A27] uppercase tracking-wider mb-2">📧 Check Your Email</p>
            <p className="text-[8px] md:text-xs text-[#2D5A27]/80">
              A confirmation email has been sent to <strong>{formData.email}</strong> with your order details and this contact information.
            </p>
          </div>

          {/* CTA Button */}
          <button 
            onClick={async () => {
              if (isSubmitting) return;
              
              try {
                setIsSubmitting(true);
                const orderId = `ord-${Date.now()}`;
                const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0) + Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.05) + (items.reduce((sum, item) => sum + item.price * item.quantity, 0) > 1500 ? 0 : 150);
                await logTransaction(user?.id || '', orderId, total, paymentMethod, 'completed');
                await logActivity(user?.id || '', 'ORDER_PLACED', `Order placed: ${orderId}`, { orderId, total, paymentMethod, items: items.length });
                
                onComplete(formData);
              } catch (error) {
                console.error('Error completing order:', error);
                alert('Error: Please try again or contact support');
                setIsSubmitting(false);
              }
            }} 
            disabled={isSubmitting}
            className={`w-full py-3 md:py-5 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#108242] hover:bg-[#0d6233]'} text-white font-bold uppercase tracking-widest text-[7px] md:text-[10px] rounded-lg transition-all`}
          >
            {isSubmitting ? '⏳ Processing...' : '✓ Done - Close Checkout'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#FAF9F6] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-12">
        <div className="flex justify-between items-center mb-8 md:mb-16 border-b pb-4 md:pb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold serif text-[#108242]">Checkout</h1>
          <button onClick={onCancel} className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors">✕ Close</button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-12 lg:gap-16">
          <div className="flex-1">
            <form onSubmit={handleNext} className="space-y-12">
              {step === 'shipping' ? (
                <div className="bg-white p-4 sm:p-6 md:p-10 shadow-sm border border-gray-100 rounded-lg md:rounded-2xl">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold serif mb-4 md:mb-8">Shipping Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
                    <input required name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 md:p-4 border border-gray-100 bg-[#FAF9F6] text-xs md:text-sm rounded-lg outline-none focus:border-[#108242]" placeholder="Email Address" />
                    <input required name="cardName" value={formData.cardName} onChange={handleInputChange} className="w-full p-3 md:p-4 border border-gray-100 bg-[#FAF9F6] text-xs md:text-sm rounded-lg outline-none focus:border-[#108242]" placeholder="Full Name" />
                  </div>
                  <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full p-3 md:p-4 border border-gray-100 bg-[#FAF9F6] text-xs md:text-sm outline-none focus:border-[#108242] mb-3 md:mb-6 rounded-lg" placeholder="Street Address" />
                  <div className="grid grid-cols-2 gap-3 md:gap-6">
                    <input required name="city" value={formData.city} onChange={handleInputChange} className="w-full p-3 md:p-4 border border-gray-100 bg-[#FAF9F6] text-xs md:text-sm outline-none focus:border-[#108242] rounded-lg" placeholder="City" />
                    <input required name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="w-full p-3 md:p-4 border border-gray-100 bg-[#FAF9F6] text-xs md:text-sm outline-none focus:border-[#108242] rounded-lg" placeholder="Pincode" />
                  </div>
                  <button type="submit" className="w-full mt-6 md:mt-10 py-4 md:py-6 bg-[#108242] text-white font-bold uppercase tracking-widest text-[8px] sm:text-[9px] md:text-[10px] rounded-lg">Continue to Payment</button>
                </div>
              ) : (
                <div className="bg-white p-4 sm:p-6 md:p-10 shadow-sm border border-gray-100 rounded-lg md:rounded-2xl">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold serif mb-6 md:mb-8">Select Payment Method</h2>

                  {/* Amount Error Message */}
                  {amountError && (
                    <div className="mb-6 md:mb-8 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs md:text-sm font-semibold">
                      ❌ {amountError}
                    </div>
                  )}

                  {/* Payment Config not loaded */}
                  {configLoading && (
                    <div className="text-center py-6 md:py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#108242]"></div>
                      <p className="mt-3 md:mt-4 text-xs md:text-sm text-gray-500">Loading payment options...</p>
                    </div>
                  )}

                  {/* No payment methods available */}
                  {!configLoading && paymentConfig && !paymentConfig.cardPaymentEnabled && !paymentConfig.upiPaymentEnabled && !paymentConfig.bankTransferEnabled && (
                    <div className="p-4 md:p-6 bg-red-50 border border-red-200 rounded-lg text-center">
                      <p className="text-red-600 font-semibold text-sm">⚠️ No payment methods are currently available</p>
                      <p className="text-red-500 text-xs mt-2">Please try again later or contact support</p>
                    </div>
                  )}

                  {/* Payment Method Selection */}
                  {!configLoading && paymentConfig && (paymentConfig.cardPaymentEnabled || paymentConfig.upiPaymentEnabled || paymentConfig.bankTransferEnabled) && (
                    <>
                      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 md:mb-12">
                        {paymentConfig.cardPaymentEnabled && (
                          <button 
                            type="button" 
                            onClick={() => { setPaymentMethod('card'); setAmountError(''); }} 
                            className={`flex-1 py-4 md:py-5 border-2 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-xl md:rounded-2xl transition-all transform hover:scale-105 active:scale-95 ${paymentMethod === 'card' ? 'border-[#108242] bg-gradient-to-r from-[#108242] to-[#0d6233] text-white shadow-lg' : 'border-gray-200 text-gray-500 hover:border-[#108242]/50'}`}
                          >
                            <span className="text-lg md:text-2xl mr-2">💳</span> Card
                          </button>
                        )}
                        {paymentConfig.upiPaymentEnabled && (
                          <button 
                            type="button" 
                            onClick={() => { setPaymentMethod('upi'); setAmountError(''); }} 
                            className={`flex-1 py-4 md:py-5 border-2 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-xl md:rounded-2xl transition-all transform hover:scale-105 active:scale-95 ${paymentMethod === 'upi' ? 'border-[#108242] bg-gradient-to-r from-[#108242] to-[#0d6233] text-white shadow-lg' : 'border-gray-200 text-gray-500 hover:border-[#108242]/50'}`}
                          >
                            <span className="text-lg md:text-2xl mr-2">📱</span> UPI
                          </button>
                        )}
                        {paymentConfig.bankTransferEnabled && (
                          <button 
                            type="button" 
                            onClick={() => { setPaymentMethod('bank'); setAmountError(''); }} 
                            className={`flex-1 py-4 md:py-5 border-2 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-xl md:rounded-2xl transition-all transform hover:scale-105 active:scale-95 ${paymentMethod === 'bank' ? 'border-[#2D5A27] bg-gradient-to-r from-[#2D5A27] to-[#1f3a1a] text-white shadow-lg' : 'border-gray-200 text-gray-500 hover:border-[#2D5A27]/50'}`}
                          >
                            <span className="text-lg md:text-2xl mr-2">🏦</span> Bank
                          </button>
                        )}
                      </div>

                      {/* UPI Payment Method */}
                      {paymentMethod === 'upi' && paymentConfig.upiPaymentEnabled && (
                        <div className="mb-6 md:mb-10 bg-gradient-to-br from-[#108242]/5 via-[#A4C639]/5 to-transparent rounded-xl md:rounded-3xl border-2 border-[#108242]/20 overflow-hidden">
                          <div className="p-6 md:p-12">
                            <div className="flex flex-col items-center space-y-6 md:space-y-8">
                              {/* Header */}
                              <div className="text-center">
                                <div className="inline-flex items-center justify-center w-12 md:w-16 h-12 md:h-16 bg-gradient-to-br from-[#108242] to-[#0d6233] rounded-full mb-3 md:mb-4">
                                  <span className="text-2xl md:text-4xl">📱</span>
                                </div>
                                <h3 className="text-lg md:text-2xl font-bold text-[#108242] mb-2">Quick UPI Payment</h3>
                                <p className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest">Fast, Secure & Instant</p>
                              </div>

                              {/* QR Code Section */}
                              {paymentConfig.upiQrCode ? (
                                <div className="w-full max-w-sm">
                                  <div className="relative bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl border-4 border-[#108242]/10">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#A4C639]/10 to-transparent rounded-2xl md:rounded-3xl pointer-events-none"></div>
                                    <div className="relative flex items-center justify-center">
                                      <img 
                                        src={paymentConfig.upiQrCode} 
                                        alt="UPI QR Code" 
                                        className="w-48 md:w-64 h-48 md:h-64 object-contain drop-shadow-lg rounded-lg"
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-4 md:mt-6 text-center">
                                    <p className="text-[7px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Scan to Pay</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full max-w-sm">
                                  <div className="text-center py-8 md:py-12 bg-white rounded-2xl md:rounded-3xl border-2 border-dashed border-gray-300">
                                    <p className="text-gray-400 text-sm md:text-base font-semibold">⚠️ QR Code not configured</p>
                                    <p className="text-[8px] md:text-[10px] text-gray-400 mt-2">Contact administrator to upload</p>
                                  </div>
                                </div>
                              )}

                              {/* UPI ID Section */}
                              {paymentConfig.upiId && (
                                <div className="w-full max-w-sm">
                                  <div className="bg-gradient-to-r from-[#108242] to-[#0d6233] rounded-2xl md:rounded-3xl p-4 md:p-6 text-white text-center">
                                    <p className="text-[7px] md:text-[9px] font-bold uppercase tracking-widest text-[#A4C639] mb-2 md:mb-3">UPI ID</p>
                                    <p className="text-base md:text-2xl font-bold break-all font-mono">{paymentConfig.upiId}</p>
                                    <p className="text-[7px] md:text-[9px] text-[#A4C639]/80 mt-2 md:mt-3">Manually enter if needed</p>
                                  </div>
                                </div>
                              )}

                              {/* Payment Apps */}
                              <div className="w-full">
                                <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-gray-100">
                                  <p className="text-[7px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 md:mb-4">Accepted on</p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                    {[
                                      { icon: '🏦', name: 'Google Pay' },
                                      { icon: '💳', name: 'PhonePe' },
                                      { icon: '🎧', name: 'Paytm' },
                                      { icon: '📱', name: 'BHIM' }
                                    ].map((app) => (
                                      <div key={app.name} className="flex flex-col items-center">
                                        <div className="w-10 md:w-14 h-10 md:h-14 bg-gradient-to-br from-[#A4C639]/20 to-[#108242]/10 rounded-xl md:rounded-2xl flex items-center justify-center mb-2">
                                          <span className="text-lg md:text-2xl">{app.icon}</span>
                                        </div>
                                        <p className="text-[7px] md:text-[9px] font-bold text-gray-600 text-center">{app.name}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Info Banner */}
                              <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-xl md:rounded-2xl p-3 md:p-4">
                                <div className="flex gap-2 md:gap-3">
                                  <span className="text-lg md:text-xl flex-shrink-0 mt-0.5">✅</span>
                                  <div>
                                    <p className="text-[7px] md:text-[9px] font-bold text-blue-900 uppercase tracking-wider mb-1">Secure Payment</p>
                                    <p className="text-[7px] md:text-[9px] text-blue-800">Your payment is protected with bank-level encryption</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Card Payment Method */}
                      {paymentMethod === 'card' && paymentConfig.cardPaymentEnabled && (
                        <div className="mb-6 md:mb-10 bg-gradient-to-br from-[#108242]/5 via-[#FAF9F6] to-transparent rounded-xl md:rounded-3xl border-2 border-gray-100 overflow-hidden">
                          <div className="p-6 md:p-12">
                            <div className="space-y-6 md:space-y-8">
                              {/* Header */}
                              <div>
                                <div className="inline-flex items-center justify-center w-10 md:w-14 h-10 md:h-14 bg-gradient-to-br from-[#108242] to-[#0d6233] rounded-xl md:rounded-2xl mb-3 md:mb-4">
                                  <span className="text-xl md:text-3xl">💳</span>
                                </div>
                                <h3 className="text-lg md:text-2xl font-bold text-[#108242] mb-1">Card Details</h3>
                                <p className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest">All payments are encrypted & secure</p>
                              </div>

                              {/* Card Input */}
                              <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border-2 border-gray-100 hover:border-[#108242]/30 transition-all">
                                <label className="block text-[7px] md:text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3 md:mb-4">Card Number</label>
                                <input required name="cardNumber" className="w-full p-4 md:p-5 border-2 border-gray-200 bg-white text-lg md:text-xl font-mono outline-none focus:border-[#108242] focus:ring-2 focus:ring-[#108242]/20 rounded-xl md:rounded-2xl transition-all" placeholder="1234 5678 9012 3456" />
                              </div>

                              {/* Expiry & CVV */}
                              <div className="grid grid-cols-2 gap-4 md:gap-6">
                                <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border-2 border-gray-100 hover:border-[#108242]/30 transition-all">
                                  <label className="block text-[7px] md:text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3 md:mb-4">Expiry Date</label>
                                  <input required name="expiry" className="w-full p-4 md:p-5 border-2 border-gray-200 bg-white text-base md:text-lg font-bold outline-none focus:border-[#108242] focus:ring-2 focus:ring-[#108242]/20 rounded-xl md:rounded-2xl transition-all" placeholder="MM / YY" />
                                </div>
                                <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border-2 border-gray-100 hover:border-[#108242]/30 transition-all">
                                  <label className="block text-[7px] md:text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3 md:mb-4">CVV</label>
                                  <input required name="cvv" className="w-full p-4 md:p-5 border-2 border-gray-200 bg-white text-lg md:text-xl font-bold outline-none focus:border-[#108242] focus:ring-2 focus:ring-[#108242]/20 rounded-xl md:rounded-2xl transition-all text-center" placeholder="123" />
                                </div>
                              </div>

                              {/* Security Info */}
                              <div className="bg-green-50 border-2 border-green-200 rounded-xl md:rounded-2xl p-3 md:p-4 flex gap-2 md:gap-3">
                                <span className="text-lg md:text-2xl flex-shrink-0">🔒</span>
                                <div>
                                  <p className="text-[7px] md:text-[9px] font-bold text-green-900 uppercase tracking-wider mb-1">PCI Compliant</p>
                                  <p className="text-[7px] md:text-[9px] text-green-800">Your card data is never stored on our servers</p>
                                </div>
                              </div>

                              {paymentConfig.paymentDescription && (
                                <p className="text-[7px] md:text-[9px] text-gray-600 p-3 md:p-4 bg-blue-50 rounded-lg md:rounded-xl border border-blue-100">
                                  ℹ️ {paymentConfig.paymentDescription}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bank Transfer Payment Method */}
                      {paymentMethod === 'bank' && paymentConfig.bankTransferEnabled && (
                        <div className="mb-6 md:mb-10 bg-gradient-to-br from-[#2D5A27]/5 via-[#FAF9F6] to-transparent rounded-xl md:rounded-3xl border-2 border-[#2D5A27]/10 overflow-hidden">
                          <div className="p-6 md:p-12">
                            <div className="space-y-6 md:space-y-8">
                              {/* Header */}
                              <div>
                                <div className="inline-flex items-center justify-center w-10 md:w-14 h-10 md:h-14 bg-gradient-to-br from-[#2D5A27] to-[#1f3a1a] rounded-xl md:rounded-2xl mb-3 md:mb-4">
                                  <span className="text-xl md:text-3xl">🏦</span>
                                </div>
                                <h3 className="text-lg md:text-2xl font-bold text-[#2D5A27] mb-1">Bank Transfer</h3>
                                <p className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest">Direct account transfer</p>
                              </div>

                              {/* Bank Details Display */}
                              {paymentConfig.bankAccountName && paymentConfig.bankAccountNumber ? (
                                <div className="space-y-4 md:space-y-6">
                                  {/* Main Card */}
                                  <div className="bg-gradient-to-br from-[#2D5A27] to-[#1f3a1a] rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-xl border-2 border-[#A4C639]/30">
                                    <p className="text-[7px] md:text-[9px] font-bold uppercase tracking-widest text-[#A4C639] mb-4 md:mb-6 opacity-90">Account Details</p>
                                    
                                    <div className="space-y-4 md:space-y-6">
                                      <div className="pb-4 md:pb-6 border-b border-[#A4C639]/30">
                                        <p className="text-[7px] md:text-[9px] font-bold text-[#A4C639]/80 uppercase tracking-wider mb-1 md:mb-2">Account Holder</p>
                                        <p className="text-base md:text-xl font-bold">{paymentConfig.bankAccountName}</p>
                                      </div>
                                      
                                      <div className="pb-4 md:pb-6 border-b border-[#A4C639]/30">
                                        <p className="text-[7px] md:text-[9px] font-bold text-[#A4C639]/80 uppercase tracking-wider mb-1 md:mb-2">Bank Name</p>
                                        <p className="text-base md:text-lg font-semibold">{paymentConfig.bankName || 'Not Set'}</p>
                                      </div>
                                      
                                      <div className="pb-4 md:pb-6 border-b border-[#A4C639]/30">
                                        <p className="text-[7px] md:text-[9px] font-bold text-[#A4C639]/80 uppercase tracking-wider mb-1 md:mb-2">Account Number</p>
                                        <p className="text-sm md:text-lg font-mono font-bold tracking-widest">{paymentConfig.bankAccountNumber}</p>
                                      </div>
                                      
                                      <div className="pb-4 md:pb-6 border-b border-[#A4C639]/30">
                                        <p className="text-[7px] md:text-[9px] font-bold text-[#A4C639]/80 uppercase tracking-wider mb-1 md:mb-2">IFSC Code</p>
                                        <p className="text-sm md:text-lg font-mono font-bold">{paymentConfig.bankIFSC || 'Not Set'}</p>
                                      </div>
                                      
                                      {paymentConfig.bankBranch && (
                                        <div>
                                          <p className="text-[7px] md:text-[9px] font-bold text-[#A4C639]/80 uppercase tracking-wider mb-1 md:mb-2">Branch</p>
                                          <p className="text-base md:text-lg font-semibold">{paymentConfig.bankBranch}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Important Notice */}
                                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl md:rounded-2xl p-4 md:p-6">
                                    <div className="flex gap-3 md:gap-4">
                                      <span className="text-2xl md:text-3xl flex-shrink-0">⚠️</span>
                                      <div>
                                        <p className="text-[8px] md:text-[10px] font-bold text-yellow-900 uppercase tracking-wider mb-2 md:mb-3">Before Transferring</p>
                                        <ul className="text-[7px] md:text-[9px] text-yellow-800 space-y-1 md:space-y-2">
                                          <li>✓ Transfer exact amount shown</li>
                                          <li>✓ Include Order ID in payment reference</li>
                                          <li>✓ Mark payment as complete once transferred</li>
                                          <li>✓ Allow 1-2 hours for confirmation</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Additional Info */}
                                  {paymentConfig.paymentDescription && (
                                    <p className="text-[7px] md:text-[9px] text-gray-600 p-3 md:p-4 bg-blue-50 rounded-lg md:rounded-xl border border-blue-100">
                                      ℹ️ {paymentConfig.paymentDescription}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-8 md:py-12 bg-white rounded-2xl md:rounded-3xl border-2 border-dashed border-gray-300">
                                  <p className="text-gray-400 text-sm md:text-base font-semibold">⚠️ Bank details not configured</p>
                                  <p className="text-[8px] md:text-[10px] text-gray-400 mt-2">Contact administrator to configure</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Order Limits Information */}
                      {paymentConfig && (
                        <div className="mb-6 md:mb-8 p-3 md:p-4 bg-[#A4C639]/10 rounded-lg border border-[#A4C639]/30">
                          <p className="text-[7px] md:text-[10px] font-bold uppercase tracking-widest text-[#2D5A27] mb-2">💰 Order Limit</p>
                          <p className="text-[7px] md:text-xs text-gray-700">
                            Allowed order amount: ₹{paymentConfig.minOrderAmount.toLocaleString()} - ₹{paymentConfig.maxOrderAmount.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mt-6 md:mt-10">
                    <button type="button" onClick={() => setStep('shipping')} className="flex-1 py-3 md:py-6 border border-gray-200 text-[7px] sm:text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 rounded-lg">Back</button>
                    <button type="submit" className="flex-[2] py-3 md:py-6 bg-[#108242] text-white font-bold uppercase tracking-widest text-[7px] sm:text-[8px] md:text-[10px] rounded-lg hover:bg-[#0d6233] transition-all">Pay ₹{total.toLocaleString()}</button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary Sidebar - Hidden on mobile, visible on lg screens */}
          <aside className="hidden lg:block lg:w-80">
            <div className="bg-white p-6 md:p-10 border border-gray-100 rounded-lg md:rounded-2xl sticky top-24">
              <h3 className="text-lg md:text-xl font-bold serif mb-6 md:mb-8 pb-4 border-b">Order Summary</h3>
              <div className="space-y-4 md:space-y-6 mb-8 md:mb-10 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 md:gap-4">
                    <img src={item.image} className="w-10 md:w-12 h-10 md:h-12 object-cover border rounded" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-bold text-[#333] mb-1 truncate">{item.name}</p>
                      <p className="text-[7px] md:text-[10px] text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 md:space-y-3 pt-4 md:pt-6 border-t text-xs md:text-sm">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-[#108242] text-base md:text-lg mt-3 md:mt-4"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFlow;
