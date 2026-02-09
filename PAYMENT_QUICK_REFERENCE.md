# Payment Management System - Quick Reference

## 🚀 Quick Start (30 seconds)

1. **Go to Admin Dashboard** → Click **💳 Payment Setup** button
2. **Fill in payment details**:
   - Add UPI ID
   - Upload QR code
   - Add bank details (optional)
3. **Configure settings**:
   - Enable/disable payment methods
   - Set min/max order amounts
4. **Click "Save"** → Done! ✅

---

## 📋 Checklist

- [ ] UPI ID: Added ✓
- [ ] QR Code: Uploaded ✓
- [ ] Bank Details: Filled (if using) ✓
- [ ] Payment Methods: Configured ✓
- [ ] Order Limits: Set ✓
- [ ] Configuration: Saved ✓

---

## 💡 Common Tasks

### Add UPI Payment
```
1. Admin Dashboard → 💳 Payment Setup
2. Click "📱 UPI Settings" tab
3. Enter UPI ID
4. Upload QR code image
5. Save
```

### Add Bank Transfer
```
1. Admin Dashboard → 💳 Payment Setup
2. Click "🏦 Bank Details" tab
3. Fill all bank details
4. Go to "⚙️ Payment Settings"
5. Enable "🏦 Bank Transfer"
6. Save
```

### Set Order Limits
```
1. Admin Dashboard → 💳 Payment Setup
2. Click "⚙️ Payment Settings" tab
3. Set Minimum Order Amount
4. Set Maximum Order Amount
5. Save
```

### Disable a Payment Method
```
1. Admin Dashboard → 💳 Payment Setup
2. Click "⚙️ Payment Settings" tab
3. Toggle OFF the method you want to disable
4. Save
```

---

## 🎨 What Admin Users See

**At Dashboard:**
```
┌─────────────────────────────────────┐
│ Admin Control Center                │
│ [Orders] [Inventory] [Payments]...  │
│                    [💳 Payment Setup]
│                                     │
└─────────────────────────────────────┘
```

**Payment Settings Modal:**
```
┌──────────────────────────────────────────┐
│ Payment Management                    [X]│
│                                          │
│ [📱 UPI Settings] [🏦 Bank Details]     │
│ [⚙️ Payment Settings]                    │
│                                          │
│ [UPI ID input field]                    │
│ [QR Code upload]                        │
│ [QR Preview]                            │
│                                          │
│ [💾 Save Payment Configuration]         │
└──────────────────────────────────────────┘
```

---

## 🔧 What Developers Need to Know

### Import and Use:
```typescript
// Get config
import { getPaymentConfigForCheckout } from '../services/paymentAdmin';
const config = await getPaymentConfigForCheckout();

// Validate amount
import { isOrderAmountValid } from '../services/paymentAdmin';
if (!isOrderAmountValid(config, amount)) {
  // Show error
}

// Check which methods are enabled
if (config.upiPaymentEnabled) { /* show UPI */ }
if (config.cardPaymentEnabled) { /* show card */ }
if (config.bankTransferEnabled) { /* show bank */ }
```

### Display UPI QR:
```typescript
{config.upiQrCode && (
  <img src={config.upiQrCode} alt="UPI QR" />
)}
```

### Display Bank Details:
```typescript
Account: {config.bankAccountName}
Bank: {config.bankName}
Account #: {config.bankAccountNumber}
IFSC: {config.bankIFSC}
```

---

## 📱 What Customers See (After Integration)

### At Checkout:
```
Payment Method Selection:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
○ 💳 Credit/Debit Card

○ 📱 UPI Payment
  [QR Code Image]
  UPI ID: merchant@upi

○ 🏦 Bank Transfer
  Account: Business Name
  Bank: HDFC Bank
  Account #: 1234567890
  IFSC: HDFC0001234
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total: ₹ 1,500

[Proceed to Payment]
```

---

## ✅ Validation Rules

When saving, ensure:
```
✓ At least ONE method is enabled
✓ If UPI enabled: UPI ID is filled
✓ If Bank enabled: All bank fields are filled
✓ Min Order < Max Order
✓ QR image is valid (JPG/PNG, <5MB)
```

---

## 🚨 Error Messages & Solutions

| Error | Solution |
|-------|----------|
| "At least one payment method..." | Enable at least one method |
| "UPI ID is required..." | Go to UPI Settings, fill UPI ID |
| "Bank details required..." | Go to Bank Details, fill all fields |
| "Minimum amount must be less..." | Set Min < Max |
| "QR Code not uploading" | Check file format (JPG/PNG) & size (<5MB) |

---

## 🔐 Security Reminders

- ✅ Use in admin panel only (requires auth)
- ✅ Stored safely in localStorage
- ✅ Backend API should have admin auth
- ✅ Use HTTPS in production
- ✅ Don't share QR code screenshots

---

## 📊 Data Structure

```typescript
{
  // UPI
  upiId: "merchant@bank",
  upiQrCode: "data:image/png;base64,...",
  
  // Bank
  bankAccountName: "Business Name",
  bankAccountNumber: "1234567890",
  bankIFSC: "HDFC0001234",
  bankName: "HDFC Bank",
  bankBranch: "Chennai",
  
  // Methods
  cardPaymentEnabled: true,
  upiPaymentEnabled: true,
  bankTransferEnabled: false,
  
  // Limits
  minOrderAmount: 100,
  maxOrderAmount: 100000,
  
  // Message
  paymentDescription: "Secure payment..."
}
```

---

## 🧪 Testing Checklist

- [ ] Can access 💳 Payment Setup button
- [ ] Can upload QR code and see preview
- [ ] Can fill and save UPI settings
- [ ] Can fill and save bank details
- [ ] Can enable/disable payment methods
- [ ] Can set order limits
- [ ] Success message shows on save
- [ ] Config loads on page reload
- [ ] Works with small screen sizes
- [ ] All validation rules work

---

## 📞 Need Help?

1. **Admin Users**: Read `docs/PAYMENT_MANAGEMENT.md`
2. **Developers**: Read `docs/PAYMENT_INTEGRATION_GUIDE.md`
3. **Backend Setup**: Check `backend/payment-config-api.example.js`
4. **FAQ**: See troubleshooting section in PAYMENT_MANAGEMENT.md

---

## ⚡ Performance Tips

- Config loads from localStorage (fast)
- QR code converted to base64 (inline)
- ~50KB total storage
- Works offline with localStorage
- Backend optional (nice to have)

---

## 🎯 Next Steps After Setup

1. **Test Payment Methods**: Verify each enabled method works
2. **Update Checkout**: Add payment config to checkout page
3. **Set Order Limits**: Adjust min/max based on business needs
4. **Train Team**: Show admin users how to manage payment settings
5. **Monitor**: Check that customers see correct payment options

---

## 📌 Key Files

| File | Purpose |
|------|---------|
| `PaymentSettings.tsx` | Admin UI component |
| `paymentAdmin.ts` | Service functions |
| `AdminDashboard.tsx` | Dashboard integration |
| `payment-config-api.example.js` | Backend API example |
| `PAYMENT_MANAGEMENT.md` | User guide |
| `PAYMENT_INTEGRATION_GUIDE.md` | Dev guide |

---

## 🎉 You're All Set!

Your payment management system is ready!

**Start here**: Admin Dashboard → **💳 Payment Setup**

---

**Version**: 1.0 | **Status**: Production Ready ✅ | **Updated**: Feb 2026
