
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
      <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 md:w-20 h-16 md:h-20 bg-[#A4C639] rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 text-white text-2xl md:text-3xl">✓</div>
          <h2 className="text-2xl md:text-4xl font-bold serif mb-3 md:mb-4">Payment Successful</h2>
          <p className="text-xs md:text-sm text-gray-500 mb-6 md:mb-10">Thank you for choosing Vistaraku. Your eco-friendly order is being prepared.</p>
          <button onClick={() => {
            // Log the successful transaction with order details
            const orderId = `ord-${Date.now()}`;
            const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0) + Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.05) + (items.reduce((sum, item) => sum + item.price * item.quantity, 0) > 1500 ? 0 : 150);
            // Correct arg order: (userId, orderId, amount, paymentMethod, status)
            await logTransaction(user?.id || null, orderId, total, paymentMethod, 'completed');
            await logActivity(user?.id || null, 'ORDER_PLACED', `Order placed: ${orderId}`, { orderId, total, paymentMethod, items: items.length, customerEmail: formData.email });
            onComplete(formData);
          }} className="w-full py-3 md:py-5 bg-[#108242] text-white font-bold uppercase tracking-widest text-[7px] md:text-[10px] rounded-lg">Track Order</button>
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
                      <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-6 md:mb-10">
                        {paymentConfig.cardPaymentEnabled && (
                          <button 
                            type="button" 
                            onClick={() => { setPaymentMethod('card'); setAmountError(''); }} 
                            className={`flex-1 py-3 md:py-4 border text-[7px] sm:text-[8px] md:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${paymentMethod === 'card' ? 'border-[#108242] bg-[#108242]/10 text-[#108242] shadow-md' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                          >
                            💳 Card
                          </button>
                        )}
                        {paymentConfig.upiPaymentEnabled && (
                          <button 
                            type="button" 
                            onClick={() => { setPaymentMethod('upi'); setAmountError(''); }} 
                            className={`flex-1 py-3 md:py-4 border text-[7px] sm:text-[8px] md:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${paymentMethod === 'upi' ? 'border-[#108242] bg-[#108242]/10 text-[#108242] shadow-md' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                          >
                            📱 UPI
                          </button>
                        )}
                        {paymentConfig.bankTransferEnabled && (
                          <button 
                            type="button" 
                            onClick={() => { setPaymentMethod('bank'); setAmountError(''); }} 
                            className={`flex-1 py-3 md:py-4 border text-[7px] sm:text-[8px] md:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${paymentMethod === 'bank' ? 'border-[#108242] bg-[#108242]/10 text-[#108242] shadow-md' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                          >
                            🏦 Bank
                          </button>
                        )}
                      </div>

                      {/* UPI Payment Method */}
                      {paymentMethod === 'upi' && paymentConfig.upiPaymentEnabled && (
                        <div className="mb-6 md:mb-10 p-4 md:p-8 bg-[#FAF9F6] rounded-lg border border-gray-100">
                          <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-[#108242] mb-3 md:mb-4">📱 UPI Payment Details</p>
                          
                          {paymentConfig.upiQrCode ? (
                            <div className="text-center space-y-4 md:space-y-6">
                              <div>
                                <img 
                                  src={paymentConfig.upiQrCode} 
                                  alt="UPI QR Code" 
                                  className="w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48 mx-auto border-2 border-white rounded-lg shadow-lg"
                                />
                              </div>
                              <div>
                                <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">UPI ID:</p>
                                <p className="font-bold text-[#108242] text-sm md:text-lg break-all">{paymentConfig.upiId}</p>
                              </div>
                              <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200">
                                <p className="text-[7px] md:text-xs text-gray-500 mb-1 md:mb-2">Scan with:</p>
                                <p className="text-[8px] md:text-[10px] font-semibold text-gray-700">Google Pay • PhonePe • Paytm • BHIM</p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6 md:py-8 bg-white rounded-lg border-2 border-dashed border-gray-200">
                              <p className="text-gray-400 text-xs md:text-sm">QR Code not configured</p>
                              <p className="text-[8px] md:text-[10px] text-gray-400 mt-2">Ask administrator to upload QR code</p>
                            </div>
                          )}

                          {paymentConfig.paymentDescription && (
                            <p className="text-[7px] md:text-xs text-gray-600 mt-4 md:mt-6 p-2 md:p-3 bg-blue-50 rounded border border-blue-100">
                              ℹ️ {paymentConfig.paymentDescription}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Card Payment Method */}
                      {paymentMethod === 'card' && paymentConfig.cardPaymentEnabled && (
                        <div className="space-y-3 md:space-y-6 mb-6 md:mb-10">
                          <div>
                            <label className="block text-[7px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Card Number</label>
                            <input required name="cardNumber" className="w-full p-3 md:p-4 border border-gray-200 bg-[#FAF9F6] text-xs md:text-sm outline-none focus:border-[#108242] focus:bg-white rounded-lg" placeholder="1234 5678 9012 3456" />
                          </div>
                          <div className="grid grid-cols-2 gap-3 md:gap-6">
                            <div>
                              <label className="block text-[7px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Expiry</label>
                              <input required name="expiry" className="w-full p-3 md:p-4 border border-gray-200 bg-[#FAF9F6] text-xs md:text-sm outline-none focus:border-[#108242] focus:bg-white rounded-lg" placeholder="MM / YY" />
                            </div>
                            <div>
                              <label className="block text-[7px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">CVV</label>
                              <input required name="cvv" className="w-full p-3 md:p-4 border border-gray-200 bg-[#FAF9F6] text-xs md:text-sm outline-none focus:border-[#108242] focus:bg-white rounded-lg" placeholder="123" />
                            </div>
                          </div>

                          {paymentConfig.paymentDescription && (
                            <p className="text-[7px] md:text-xs text-gray-600 p-2 md:p-3 bg-blue-50 rounded border border-blue-100">
                              ℹ️ {paymentConfig.paymentDescription}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Bank Transfer Payment Method */}
                      {paymentMethod === 'bank' && paymentConfig.bankTransferEnabled && (
                        <div className="mb-6 md:mb-10 p-4 md:p-8 bg-[#FAF9F6] rounded-lg border border-gray-100">
                          <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-[#108242] mb-4 md:mb-6">🏦 Bank Transfer Details</p>
                          
                          {paymentConfig.bankAccountName && paymentConfig.bankAccountNumber ? (
                            <div className="space-y-2 md:space-y-4 bg-white p-4 md:p-6 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-center pb-2 md:pb-3 border-b text-xs md:text-sm">
                                <span className="text-[7px] md:text-[10px] font-bold text-gray-500 uppercase">Account Holder</span>
                                <span className="font-semibold text-gray-900">{paymentConfig.bankAccountName}</span>
                              </div>
                              <div className="flex justify-between items-center pb-2 md:pb-3 border-b text-xs md:text-sm">
                                <span className="text-[7px] md:text-[10px] font-bold text-gray-500 uppercase">Bank Name</span>
                                <span className="font-semibold text-gray-900">{paymentConfig.bankName}</span>
                              </div>
                              <div className="flex justify-between items-center pb-2 md:pb-3 border-b text-xs md:text-sm">
                                <span className="text-[7px] md:text-[10px] font-bold text-gray-500 uppercase">Account Number</span>
                                <span className="font-mono font-semibold text-gray-900 text-xs md:text-sm">{paymentConfig.bankAccountNumber}</span>
                              </div>
                              <div className="flex justify-between items-center pb-2 md:pb-3 border-b text-xs md:text-sm">
                                <span className="text-[7px] md:text-[10px] font-bold text-gray-500 uppercase">IFSC Code</span>
                                <span className="font-mono font-semibold text-gray-900 text-xs md:text-sm">{paymentConfig.bankIFSC}</span>
                              </div>
                              {paymentConfig.bankBranch && (
                                <div className="flex justify-between items-center text-xs md:text-sm">
                                  <span className="text-[7px] md:text-[10px] font-bold text-gray-500 uppercase">Branch</span>
                                  <span className="font-semibold text-gray-900">{paymentConfig.bankBranch}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-6 md:py-8 bg-white rounded-lg border-2 border-dashed border-gray-200">
                              <p className="text-gray-400 text-xs md:text-sm">Bank details not configured</p>
                              <p className="text-[7px] md:text-[10px] text-gray-400 mt-2">Ask administrator to configure bank details</p>
                            </div>
                          )}

                          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-[7px] md:text-[10px] font-bold text-yellow-800 uppercase mb-1 md:mb-2">⚠️ Important</p>
                            <p className="text-[7px] md:text-xs text-yellow-800">Please transfer exact amount and include Order ID in payment reference. Mark as complete once transferred.</p>
                          </div>

                          {paymentConfig.paymentDescription && (
                            <p className="text-[7px] md:text-xs text-gray-600 mt-4 md:mt-4 p-2 md:p-3 bg-blue-50 rounded border border-blue-100">
                              ℹ️ {paymentConfig.paymentDescription}
                            </p>
                          )}
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
