# Payment Configuration Integration Guide

## Overview

This guide explains how to integrate the Payment Management system into your checkout flow and other components.

---

## 1. Using PaymentConfig in Checkout Flow

### Import the service function

```typescript
// In CheckoutFlow.tsx or your payment page
import { getPaymentConfigForCheckout, isOrderAmountValid } from '../services/paymentAdmin';
import { PaymentConfig } from '../components/PaymentSettings';

export const CheckoutFlow: React.FC = () => {
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [orderAmount, setOrderAmount] = useState(0);
  const [amountError, setAmountError] = useState('');

  // Load payment config when component mounts
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getPaymentConfigForCheckout();
        setPaymentConfig(config);
      } catch (error) {
        console.error('Error loading payment config:', error);
      }
    };
    loadConfig();
  }, []);

  // Validate order amount against limits
  const validateAmount = (amount: number) => {
    if (!paymentConfig) return true;

    if (!isOrderAmountValid(paymentConfig, amount)) {
      setAmountError(
        `Order amount must be between ₹${paymentConfig.minOrderAmount} and ₹${paymentConfig.maxOrderAmount}`
      );
      return false;
    }

    setAmountError('');
    return true;
  };

  // ... rest of component
};
```

---

## 2. Displaying Available Payment Methods

### Based on Configuration

```typescript
const PaymentMethodSelector: React.FC<{ config: PaymentConfig }> = ({ config }) => {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | 'bank'>('card');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Select Payment Method</h3>

      {/* Card Payment Option */}
      {config.cardPaymentEnabled && (
        <button
          onClick={() => setSelectedMethod('card')}
          className={`w-full p-4 border rounded-lg ${
            selectedMethod === 'card' ? 'border-green-500 bg-green-50' : 'border-gray-200'
          }`}
        >
          💳 Credit/Debit Card
        </button>
      )}

      {/* UPI Payment Option */}
      {config.upiPaymentEnabled && (
        <button
          onClick={() => setSelectedMethod('upi')}
          className={`w-full p-4 border rounded-lg ${
            selectedMethod === 'upi' ? 'border-green-500 bg-green-50' : 'border-gray-200'
          }`}
        >
          📱 UPI Payment ({config.upiId})
        </button>
      )}

      {/* Bank Transfer Option */}
      {config.bankTransferEnabled && (
        <button
          onClick={() => setSelectedMethod('bank')}
          className={`w-full p-4 border rounded-lg ${
            selectedMethod === 'bank' ? 'border-green-500 bg-green-50' : 'border-gray-200'
          }`}
        >
          🏦 Bank Transfer ({config.bankName})
        </button>
      )}

      {/* No payment methods available */}
      {!config.cardPaymentEnabled &&
        !config.upiPaymentEnabled &&
        !config.bankTransferEnabled && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            ⚠️ No payment methods are currently available. Please try again later.
          </div>
        )}
    </div>
  );
};
```

---

## 3. Displaying UPI QR Code

### In Payment Method Section

```typescript
const UPIPaymentMethod: React.FC<{ config: PaymentConfig }> = ({ config }) => {
  return (
    <div className="space-y-4 p-6 bg-white rounded-lg border border-gray-200">
      <h4 className="font-bold">UPI Payment</h4>
      <p className="text-sm text-gray-600">
        Scan the QR code below using any UPI app to complete payment
      </p>

      {config.upiQrCode ? (
        <div className="flex flex-col items-center">
          <img
            src={config.upiQrCode}
            alt="UPI QR Code"
            className="w-48 h-48 border-2 border-gray-200 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-2">UPI ID: {config.upiId}</p>
        </div>
      ) : (
        <p className="text-center text-red-500">QR Code not available</p>
      )}

      {config.paymentDescription && (
        <p className="text-sm text-gray-600 italic text-center">
          {config.paymentDescription}
        </p>
      )}
    </div>
  );
};
```

---

## 4. Displaying Bank Transfer Details

### In Payment Method Section

```typescript
const BankTransferMethod: React.FC<{ config: PaymentConfig }> = ({ config }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg border border-gray-200">
      <h4 className="font-bold">Bank Transfer Details</h4>
      <p className="text-sm text-gray-600">
        Transfer the amount to the bank account below. Include order ID in reference.
      </p>

      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
        <InfoRow
          label="Account Holder"
          value={config.bankAccountName}
          onCopy={() => copyToClipboard(config.bankAccountName)}
        />
        <InfoRow
          label="Bank Name"
          value={config.bankName}
          onCopy={() => copyToClipboard(config.bankName)}
        />
        <InfoRow
          label="Account Number"
          value={config.bankAccountNumber}
          onCopy={() => copyToClipboard(config.bankAccountNumber)}
        />
        <InfoRow
          label="IFSC Code"
          value={config.bankIFSC}
          onCopy={() => copyToClipboard(config.bankIFSC)}
        />
        {config.bankBranch && (
          <InfoRow
            label="Branch"
            value={config.bankBranch}
            onCopy={() => copyToClipboard(config.bankBranch)}
          />
        )}
      </div>

      {config.paymentDescription && (
        <p className="text-sm text-gray-600 italic">
          {config.paymentDescription}
        </p>
      )}
    </div>
  );
};

const InfoRow: React.FC<{
  label: string;
  value: string;
  onCopy: () => void;
}> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm font-semibold text-gray-700">{label}:</span>
    <span className="text-sm text-gray-900">{value}</span>
  </div>
);
```

---

## 5. Order Amount Validation

### Before Processing Payment

```typescript
import { isOrderAmountValid } from '../services/paymentAdmin';

const processPayment = async (amount: number, config: PaymentConfig) => {
  // Check if amount is within allowed limits
  if (!isOrderAmountValid(config, amount)) {
    throw new Error(
      `Amount ₹${amount} is outside allowed range (₹${config.minOrderAmount} - ₹${config.maxOrderAmount})`
    );
  }

  // Proceed with payment processing
  // ...
};
```

---

## 6. Complete Checkout Component Example

```typescript
import React, { useState, useEffect } from 'react';
import { getPaymentConfigForCheckout, isOrderAmountValid } from '../services/paymentAdmin';
import { PaymentConfig } from '../components/PaymentSettings';

const CompleteCheckout: React.FC<{ total: number }> = ({ total }) => {
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getPaymentConfigForCheckout();
        setPaymentConfig(config);
        setLoading(false);

        // Set default to first enabled method
        if (config.cardPaymentEnabled) setSelectedMethod('card');
        else if (config.upiPaymentEnabled) setSelectedMethod('upi');
        else if (config.bankTransferEnabled) setSelectedMethod('bank');
      } catch (error) {
        console.error('Error loading config:', error);
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handlePayment = async () => {
    if (!paymentConfig) return;

    // Validate amount
    if (!isOrderAmountValid(paymentConfig, total)) {
      setAmountError(
        `Order amount must be between ₹${paymentConfig.minOrderAmount} and ₹${paymentConfig.maxOrderAmount}`
      );
      return;
    }

    // Process based on selected method
    switch (selectedMethod) {
      case 'card':
        // Call card payment API
        break;
      case 'upi':
        // Display UPI QR code
        break;
      case 'bank':
        // Display bank details
        break;
    }
  };

  if (loading) return <div>Loading payment methods...</div>;

  if (!paymentConfig) return <div>Error loading payment configuration</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="text-2xl font-bold">
        Order Total: ₹{total}
      </div>

      {amountError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {amountError}
        </div>
      )}

      {/* Payment method selector */}
      <div className="space-y-3">
        {paymentConfig.cardPaymentEnabled && (
          <button onClick={() => setSelectedMethod('card')}>Card Payment</button>
        )}
        {paymentConfig.upiPaymentEnabled && (
          <button onClick={() => setSelectedMethod('upi')}>UPI Payment</button>
        )}
        {paymentConfig.bankTransferEnabled && (
          <button onClick={() => setSelectedMethod('bank')}>Bank Transfer</button>
        )}
      </div>

      {/* Display selected payment method details */}
      {selectedMethod === 'upi' && (
        <UPIPaymentMethod config={paymentConfig} />
      )}
      {selectedMethod === 'bank' && (
        <BankTransferMethod config={paymentConfig} />
      )}

      <button onClick={handlePayment} className="w-full py-3 bg-green-500 text-white rounded-lg">
        Proceed to Payment
      </button>
    </div>
  );
};

export default CompleteCheckout;
```

---

## 7. Displaying Payment Description

### Across the Payment Page

```typescript
{paymentConfig.paymentDescription && (
  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
    <p className="text-sm">{paymentConfig.paymentDescription}</p>
  </div>
)}
```

---

## 8. Error Handling & Edge Cases

### Handle Missing Configuration

```typescript
const fallbackConfig = {
  cardPaymentEnabled: true,
  upiPaymentEnabled: false,
  bankTransferEnabled: false,
  minOrderAmount: 100,
  maxOrderAmount: 100000
};

const getPaymentConfig = async () => {
  try {
    const config = await getPaymentConfigForCheckout();
    return config || fallbackConfig;
  } catch (error) {
    console.warn('Using fallback payment config:', error);
    return fallbackConfig;
  }
};
```

### No Payment Methods Available

```typescript
if (
  !config.cardPaymentEnabled &&
  !config.upiPaymentEnabled &&
  !config.bankTransferEnabled
) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="font-bold text-red-700">Payment Service Unavailable</h3>
      <p className="text-red-600 text-sm mt-2">
        No payment methods are currently available. Please try again later.
      </p>
    </div>
  );
}
```

---

## 9. Testing Checklist

- [ ] Payment config loads on checkout page
- [ ] Order amount validation works correctly
- [ ] Only enabled payment methods are shown
- [ ] QR code displays correctly for UPI
- [ ] Bank details display correctly for bank transfer
- [ ] Payment description shows on payment page
- [ ] Works offline (uses localStorage if server is down)
- [ ] Test with amounts below minimum
- [ ] Test with amounts above maximum
- [ ] Test with order within limits
- [ ] All payment method toggles work

---

## 10. Common Implementation Issues

### Issue: QR Code not displaying
**Solution**: Ensure `upiQrCode` contains valid base64 data URL

### Issue: Bank details showing as undefined
**Solution**: Check that all required bank fields are filled in admin panel

### Issue: Validation not working
**Solution**: Ensure `isOrderAmountValid()` is called before payment

### Issue: Payment methods not updating
**Solution**: Clear browser cache and reload, or check if config was actually saved

---

## Support

For more information:
- See [PAYMENT_MANAGEMENT.md](./PAYMENT_MANAGEMENT.md) for admin guide
- See [paymentAdmin.ts](../frontend/src/services/paymentAdmin.ts) for service functions
- See [backend example](../backend/payment-config-api.example.js) for server setup

