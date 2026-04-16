import React, { useState } from 'react';

interface BulkEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BulkEnquiryModal: React.FC<BulkEnquiryModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enquiryId, setEnquiryId] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    usePurpose: 'wedding',
    email: '',
    phone: '',
    quantity: '',
    message: ''
  });

  const purposeOptions = [
    { value: 'wedding', label: '💍 Wedding' },
    { value: 'party', label: '🎉 Party/Event' },
    { value: 'corporate', label: '🏢 Corporate Event' },
    { value: 'catering', label: '🍽️ Catering Service' },
    { value: 'restaurant', label: '🍴 Restaurant' },
    { value: 'other', label: '📋 Other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      try {
        response = await fetch('/api/send-bulk-enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            quantity: formData.quantity,
            message: formData.message,
            eventType: formData.usePurpose
          }),
          signal: AbortSignal.timeout(2000)
        });
      } catch {
        response = await fetch('http://localhost:5002/api/send-bulk-enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            quantity: formData.quantity,
            message: formData.message,
            eventType: formData.usePurpose
          })
        });
      }

      if (!response.ok) throw new Error('Failed to send enquiry');
      
      const data = await response.json();
      setEnquiryId(data.enquiryId);
      setSubmittedEmail(formData.email);
      setSubmitted(true);
    } catch (err) {
      setError('Error sending request. Please try again or call us directly.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl md:rounded-3xl max-w-md w-full p-6 md:p-8 text-center animate-in">
          <div className="w-16 md:w-20 h-16 md:h-20 bg-[#A4C639]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 md:w-10 h-8 md:h-10 text-[#108242]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold serif mb-2 text-[#4A3728]">Request Received!</h2>
          <p className="text-xs md:text-sm text-gray-600 mb-6">
            Thank you for your bulk enquiry. Our team will contact you shortly.
          </p>

          <div className="bg-[#A4C639]/10 border border-[#A4C639]/30 rounded-xl p-4 mb-6">
            <p className="text-[8px] md:text-[9px] font-bold text-[#2D5A27] uppercase tracking-wider mb-2">Enquiry ID</p>
            <p className="font-mono text-sm md:text-base font-bold text-[#108242]">{enquiryId}</p>
            <p className="text-[8px] md:text-xs text-gray-600 mt-3">
              Confirmation email sent to: <strong>{submittedEmail}</strong>
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-[8px] md:text-xs text-blue-900">
              <strong>📞 Our team will call you at +91 {formData.phone.slice(-10)}</strong> within 24 hours to discuss your requirements.
            </p>
          </div>

          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', usePurpose: 'wedding', email: '', phone: '', quantity: '', message: '' });
              onClose();
            }}
            className="w-full py-3 md:py-4 bg-[#108242] text-white font-bold uppercase text-[8px] md:text-[9px] rounded-lg hover:bg-[#0d6233] transition-colors"
          >
            ✓ Done - Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl md:rounded-3xl max-w-2xl w-full my-8 animate-in">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b bg-gradient-to-r from-[#108242] to-[#0d6233] text-white rounded-t-2xl md:rounded-t-3xl">
          <h2 className="text-lg md:text-2xl font-bold serif">Bulk Order Enquiry</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-[#A4C639] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-4 md:space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs md:text-sm">
              {error}
            </div>
          )}

          {/* Name & Purpose */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/60 mb-2">Full Name *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className="w-full p-3 md:p-4 bg-[#FAF9F6] rounded-lg md:rounded-xl border-2 border-transparent focus:border-[#A4C639] outline-none font-semibold text-[#4A3728] text-sm"
              />
            </div>
            <div>
              <label className="block text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/60 mb-2">Use Purpose *</label>
              <select
                value={formData.usePurpose}
                onChange={(e) => setFormData({ ...formData, usePurpose: e.target.value })}
                className="w-full p-3 md:p-4 bg-[#FAF9F6] rounded-lg md:rounded-xl border-2 border-transparent focus:border-[#A4C639] outline-none font-semibold text-[#4A3728] text-sm"
              >
                {purposeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/60 mb-2">Email Address *</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full p-3 md:p-4 bg-[#FAF9F6] rounded-lg md:rounded-xl border-2 border-transparent focus:border-[#A4C639] outline-none font-semibold text-[#4A3728] text-sm"
              />
            </div>
            <div>
              <label className="block text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/60 mb-2">Phone Number *</label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-digit number"
                className="w-full p-3 md:p-4 bg-[#FAF9F6] rounded-lg md:rounded-xl border-2 border-transparent focus:border-[#A4C639] outline-none font-semibold text-[#4A3728] text-sm"
              />
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/60 mb-2">Quantity Needed *</label>
            <input
              required
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="e.g., 500 or 1000"
              className="w-full p-3 md:p-4 bg-[#FAF9F6] rounded-lg md:rounded-xl border-2 border-transparent focus:border-[#A4C639] outline-none font-semibold text-[#4A3728] text-sm"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/60 mb-2">Additional Details</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us more about your requirements..."
              rows={4}
              className="w-full p-3 md:p-4 bg-[#FAF9F6] rounded-lg md:rounded-xl border-2 border-transparent focus:border-[#A4C639] outline-none font-semibold text-[#4A3728] text-sm resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 md:gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 md:py-4 border-2 border-gray-200 text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-gray-400 rounded-lg hover:border-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 md:py-4 bg-[#108242] text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-[#0d6233] transition-colors disabled:opacity-50"
            >
              {loading ? '⏳ Sending...' : '📤 Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkEnquiryModal;
