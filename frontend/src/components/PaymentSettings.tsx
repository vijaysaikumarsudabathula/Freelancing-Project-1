import React, { useState, useEffect } from 'react';
import { savePaymentConfig, getPaymentConfig, validatePaymentConfig } from '../services/paymentAdmin';

export interface PaymentConfig {
  upiId: string;
  upiQrCode: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIFSC: string;
  bankName: string;
  bankBranch: string;
  cardPaymentEnabled: boolean;
  upiPaymentEnabled: boolean;
  bankTransferEnabled: boolean;
  minOrderAmount: number;
  maxOrderAmount: number;
  paymentDescription: string;
}

interface PaymentSettingsProps {
  onSave?: (config: PaymentConfig) => void;
}

const PaymentSettings: React.FC<PaymentSettingsProps> = ({ onSave }) => {
  const [config, setConfig] = useState<PaymentConfig>({
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

  const [activeTab, setActiveTab] = useState<'upi' | 'bank' | 'settings'>('upi');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [qrPreview, setQrPreview] = useState<string>('');

  // Load payment config from localStorage/server on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const saved = await getPaymentConfig();
        if (saved) {
          setConfig(saved);
          if (saved.upiQrCode) {
            setQrPreview(saved.upiQrCode);
          }
        }
      } catch (error) {
        console.error('Error loading payment config:', error);
        // Try localStorage as fallback
        try {
          const localSaved = localStorage.getItem('paymentConfig');
          if (localSaved) {
            const parsed = JSON.parse(localSaved);
            setConfig(parsed);
            if (parsed.upiQrCode) {
              setQrPreview(parsed.upiQrCode);
            }
          }
        } catch (e) {
          console.error('Error loading from localStorage:', e);
        }
      }
    };
    loadConfig();
  }, []);

  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setQrPreview(result);
      setConfig(prev => ({ ...prev, upiQrCode: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (key: keyof PaymentConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate configuration
      const validation = validatePaymentConfig(config);
      if (!validation.valid) {
        setSuccessMessage(`❌ Validation Error: ${validation.errors[0]}`);
        setTimeout(() => setSuccessMessage(''), 4000);
        return;
      }
      
      // Save configuration
      const success = await savePaymentConfig(config);

      if (success) {
        setSuccessMessage('✅ Payment Configuration Saved Successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        if (onSave) {
          setTimeout(() => onSave(config), 1500);
        }
      } else {
        setSuccessMessage('❌ Failed to save payment configuration');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving payment config:', error);
      setSuccessMessage('❌ Error saving configuration. Try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10">
      {successMessage && (
        <div className="bg-[#A4C639]/10 border border-[#A4C639] text-[#2D5A27] px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl text-sm md:text-base font-semibold animate-pulse">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 md:gap-3 bg-white p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-[#2D5A27]/10 shadow-sm">
        {(['upi', 'bank', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === tab
                ? 'bg-[#2D5A27] text-white shadow-md'
                : 'text-[#2D5A27]/40 hover:text-[#2D5A27]'
            }`}
          >
            {tab === 'upi' && '📱 UPI Settings'}
            {tab === 'bank' && '🏦 Bank Details'}
            {tab === 'settings' && '⚙️ Payment Settings'}
          </button>
        ))}
      </div>

      {/* UPI Settings Tab */}
      {activeTab === 'upi' && (
        <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border border-[#2D5A27]/5 shadow-sm space-y-8">
          <div>
            <h3 className="text-lg md:text-2xl font-bold text-[#4A3728] mb-4 md:mb-6">UPI Payment Configuration</h3>
            <p className="text-[10px] md:text-xs text-gray-500 mb-6 md:mb-8">Configure your UPI ID and QR code for customer payments</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
            {/* UPI ID Input */}
            <div>
              <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 md:mb-3">UPI ID</label>
              <input
                type="text"
                placeholder="example@upi"
                value={config.upiId}
                onChange={(e) => handleInputChange('upiId', e.target.value)}
                className="w-full p-3 md:p-4 bg-[#FAF9F6] border border-gray-100 rounded-lg md:rounded-2xl outline-none text-xs md:text-sm focus:ring-2 focus:ring-[#A4C639]"
              />
              <p className="text-[7px] md:text-[9px] text-gray-400 mt-2">Example: merchant@okhdfcbank</p>
            </div>

            {/* QR Code Upload */}
            <div>
              <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 md:mb-3">UPI QR Code</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleQRUpload}
                className="w-full p-3 md:p-4 bg-[#FAF9F6] border border-gray-100 rounded-lg md:rounded-2xl text-[8px] md:text-xs cursor-pointer file:cursor-pointer file:border-0 file:bg-[#A4C639]/20 file:text-[#2D5A27] file:font-bold file:px-4 file:py-2 file:rounded-lg"
              />
              <p className="text-[7px] md:text-[9px] text-gray-400 mt-2">Supports JPG, PNG, WebP (Max 5MB)</p>
            </div>
          </div>

          {/* QR Code Preview */}
          {qrPreview && (
            <div className="mt-8 p-6 md:p-10 bg-[#FAF9F6] rounded-2xl md:rounded-[2.5rem] border border-gray-100 flex flex-col items-center">
              <p className="text-[8px] md:text-xs font-bold text-[#2D5A27]/40 uppercase tracking-widest mb-4">QR Code Preview</p>
              <img src={qrPreview} alt="UPI QR Code" className="w-40 md:w-56 h-40 md:h-56 border-4 border-white rounded-xl md:rounded-2xl shadow-lg" />
              <p className="text-[10px] md:text-xs text-gray-500 mt-4 text-center">This QR code will be displayed at checkout</p>
            </div>
          )}
        </div>
      )}

      {/* Bank Details Tab */}
      {activeTab === 'bank' && (
        <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border border-[#2D5A27]/5 shadow-sm space-y-8">
          <div>
            <h3 className="text-lg md:text-2xl font-bold text-[#4A3728] mb-4 md:mb-6">Bank Transfer Details</h3>
            <p className="text-[10px] md:text-xs text-gray-500 mb-6 md:mb-8">Add your bank account details for direct transfers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 md:mb-3">Account Holder Name</label>
              <input
                type="text"
                placeholder="Your Full Name"
                value={config.bankAccountName}
                onChange={(e) => handleInputChange('bankAccountName', e.target.value)}
                className="w-full p-3 md:p-4 bg-[#FAF9F6] border border-gray-100 rounded-lg md:rounded-2xl outline-none text-xs md:text-sm focus:ring-2 focus:ring-[#A4C639]"
              />
            </div>

            <div>
              <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 md:mb-3">Bank Name</label>
              <input
                type="text"
                placeholder="e.g., HDFC Bank, SBI"
                value={config.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                className="w-full p-3 md:p-4 bg-[#FAF9F6] border border-gray-100 rounded-lg md:rounded-2xl outline-none text-xs md:text-sm focus:ring-2 focus:ring-[#A4C639]"
              />
            </div>

            <div>
              <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 md:mb-3">Account Number</label>
              <input
                type="text"
                placeholder="1234567890123456"
                value={config.bankAccountNumber}
                onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                className="w-full p-3 md:p-4 bg-[#FAF9F6] border border-gray-100 rounded-lg md:rounded-2xl outline-none text-xs md:text-sm focus:ring-2 focus:ring-[#A4C639]"
              />
            </div>

            <div>
              <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 md:mb-3">IFSC Code</label>
              <input
                type="text"
                placeholder="HDFC0001234"
                value={config.bankIFSC}
                onChange={(e) => handleInputChange('bankIFSC', e.target.value)}
                className="w-full p-3 md:p-4 bg-[#FAF9F6] border border-gray-100 rounded-lg md:rounded-2xl outline-none text-xs md:text-sm focus:ring-2 focus:ring-[#A4C639]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 md:mb-3">Branch Name</label>
              <input
                type="text"
                placeholder="e.g., Chennai Main Branch"
                value={config.bankBranch}
                onChange={(e) => handleInputChange('bankBranch', e.target.value)}
                className="w-full p-3 md:p-4 bg-[#FAF9F6] border border-gray-100 rounded-lg md:rounded-2xl outline-none text-xs md:text-sm focus:ring-2 focus:ring-[#A4C639]"
              />
            </div>
          </div>

          {/* Bank Details Preview */}
          {config.bankAccountName && config.bankAccountNumber && (
            <div className="mt-8 p-6 md:p-8 bg-gradient-to-br from-[#2D5A27] to-[#1f3a1a] rounded-2xl md:rounded-[2.5rem] text-white">
              <p className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-[#A4C639] mb-4">Bank Details Summary</p>
              <div className="space-y-3">
                <p className="text-sm md:text-base"><span className="font-bold">Account Holder:</span> {config.bankAccountName}</p>
                <p className="text-sm md:text-base"><span className="font-bold">Bank:</span> {config.bankName || 'Not Set'}</p>
                <p className="text-sm md:text-base"><span className="font-bold">Account Number:</span> {config.bankAccountNumber}</p>
                <p className="text-sm md:text-base"><span className="font-bold">IFSC Code:</span> {config.bankIFSC || 'Not Set'}</p>
                <p className="text-sm md:text-base"><span className="font-bold">Branch:</span> {config.bankBranch || 'Not Set'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border border-[#2D5A27]/5 shadow-sm space-y-8">
          <div>
            <h3 className="text-lg md:text-2xl font-bold text-[#4A3728] mb-4 md:mb-6">Payment Method Settings</h3>
            <p className="text-[10px] md:text-xs text-gray-500 mb-6 md:mb-8">Control which payment methods are available to customers</p>
          </div>

          {/* Payment Methods Toggle */}
          <div className="space-y-4">
            {/* Card Payment Toggle */}
            <button
              onClick={() => handleInputChange('cardPaymentEnabled', !config.cardPaymentEnabled)}
              className="w-full flex items-center justify-between p-4 md:p-6 bg-[#FAF9F6] rounded-lg md:rounded-2xl border border-gray-100 hover:border-[#A4C639] transition-all active:scale-95"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-lg md:text-2xl">💳</span>
                <div className="text-left">
                  <p className="font-bold text-[#4A3728] text-sm md:text-base">Card Payment</p>
                  <p className="text-[7px] md:text-[10px] text-gray-400">Credit/Debit card payments</p>
                </div>
              </div>
              <div 
                className="relative inline-flex items-center h-6 md:h-8 w-11 md:w-14 rounded-full flex-shrink-0 transition-colors"
                style={{backgroundColor: config.cardPaymentEnabled ? '#A4C639' : '#ccc'}}
              >
                <span
                  className={`inline-block h-4 md:h-6 w-4 md:w-6 rounded-full bg-white transition-transform ${
                    config.cardPaymentEnabled ? 'translate-x-6 md:translate-x-7' : 'translate-x-0.5 md:translate-x-1'
                  }`}
                />
              </div>
            </button>

            {/* UPI Payment Toggle */}
            <button
              onClick={() => handleInputChange('upiPaymentEnabled', !config.upiPaymentEnabled)}
              className="w-full flex items-center justify-between p-4 md:p-6 bg-[#FAF9F6] rounded-lg md:rounded-2xl border border-gray-100 hover:border-[#A4C639] transition-all active:scale-95"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-lg md:text-2xl">📱</span>
                <div className="text-left">
                  <p className="font-bold text-[#4A3728] text-sm md:text-base">UPI Payment</p>
                  <p className="text-[7px] md:text-[10px] text-gray-400">UPI & Mobile wallet payments</p>
                </div>
              </div>
              <div 
                className="relative inline-flex items-center h-6 md:h-8 w-11 md:w-14 rounded-full flex-shrink-0 transition-colors"
                style={{backgroundColor: config.upiPaymentEnabled ? '#A4C639' : '#ccc'}}
              >
                <span
                  className={`inline-block h-4 md:h-6 w-4 md:w-6 rounded-full bg-white transition-transform ${
                    config.upiPaymentEnabled ? 'translate-x-6 md:translate-x-7' : 'translate-x-0.5 md:translate-x-1'
                  }`}
                />
              </div>
            </button>

            {/* Bank Transfer Toggle */}
            <button
              onClick={() => handleInputChange('bankTransferEnabled', !config.bankTransferEnabled)}
              className="w-full flex items-center justify-between p-4 md:p-6 bg-[#FAF9F6] rounded-lg md:rounded-2xl border border-gray-100 hover:border-[#A4C639] transition-all active:scale-95"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-lg md:text-2xl">🏦</span>
                <div className="text-left">
                  <p className="font-bold text-[#4A3728] text-sm md:text-base">Bank Transfer</p>
                  <p className="text-[7px] md:text-[10px] text-gray-400">Direct bank account transfer</p>
                </div>
              </div>
              <div 
                className="relative inline-flex items-center h-6 md:h-8 w-11 md:w-14 rounded-full flex-shrink-0 transition-colors"
                style={{backgroundColor: config.bankTransferEnabled ? '#A4C639' : '#ccc'}}
              >
                <span
                  className={`inline-block h-4 md:h-6 w-4 md:w-6 rounded-full bg-white transition-transform ${
                    config.bankTransferEnabled ? 'translate-x-6 md:translate-x-7' : 'translate-x-0.5 md:translate-x-1'
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Order Amount Limits */}
          <div className="pt-6 md:pt-8 border-t border-gray-100">
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-4 md:mb-6">Order Amount Limits</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-[8px] md:text-[10px] font-bold text-[#2D5A27]/40 mb-2">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  value={config.minOrderAmount}
                  onChange={(e) => handleInputChange('minOrderAmount', parseInt(e.target.value) || 0)}
                  className="w-full p-3 md:p-4 bg-[#FAF9F6] border border-gray-100 rounded-lg md:rounded-2xl outline-none text-xs md:text-sm focus:ring-2 focus:ring-[#A4C639]"
                />
              </div>
              <div>
                <label className="block text-[8px] md:text-[10px] font-bold text-[#2D5A27]/40 mb-2">Maximum Order Amount (₹)</label>
                <input
                  type="number"
                  value={config.maxOrderAmount}
                  onChange={(e) => handleInputChange('maxOrderAmount', parseInt(e.target.value) || 100000)}
                  className="w-full p-3 md:p-4 bg-[#FAF9F6] border border-gray-100 rounded-lg md:rounded-2xl outline-none text-xs md:text-sm focus:ring-2 focus:ring-[#A4C639]"
                />
              </div>
            </div>
          </div>

          {/* Payment Description */}
          <div className="pt-6 md:pt-8 border-t border-gray-100">
            <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 md:mb-3">Payment Page Description</label>
            <textarea
              placeholder="Display message for payment methods..."
              value={config.paymentDescription}
              onChange={(e) => handleInputChange('paymentDescription', e.target.value)}
              rows={4}
              className="w-full p-3 md:p-4 bg-[#FAF9F6] border border-gray-100 rounded-lg md:rounded-2xl outline-none text-xs md:text-sm focus:ring-2 focus:ring-[#A4C639] font-sans"
            />
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`w-full py-4 md:py-6 rounded-lg md:rounded-2xl text-sm md:text-base font-black uppercase tracking-widest transition-all ${
          isSaving
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#A4C639] text-white hover:bg-[#96b830] shadow-lg hover:shadow-xl'
        }`}
      >
        {isSaving ? '⏳ Saving...' : '💾 Save Payment Configuration'}
      </button>
    </div>
  );
};

export default PaymentSettings;
