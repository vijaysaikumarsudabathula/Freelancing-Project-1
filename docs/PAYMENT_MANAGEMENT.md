# Payment Management System - Admin Documentation

## Overview

The Payment Management system in the Admin Dashboard allows you to configure and manage all payment-related settings for your business. This includes:

- **UPI Payments** - Configure UPI ID and QR code for mobile payment
- **Bank Transfers** - Add complete bank details for direct transfers
- **Card Payments** - Enable/disable card payment options
- **Order Amount Limits** - Set minimum and maximum order values
- **Payment Method Controls** - Turn payment methods on/off

---

## Accessing Payment Settings

### Method 1: From Admin Dashboard
1. Log in to your Admin Dashboard
2. Go to the **Payments** tab
3. Click the **"Configure Payment Methods & Settings"** button

### Method 2: Quick Access Button
- In the Admin Control Center header, click the **💳 Payment Setup** button

---

## Configuration Tabs

### 1. 📱 UPI Settings

#### UPI ID Configuration
- **Field**: UPI ID
- **Example**: `merchant@okhdfcbank` or `business@paytm`
- **Purpose**: This is the UPI address displayed to customers
- **Note**: Ensure the UPI ID is active and can receive payments

#### UPI QR Code
- **Upload**: Click to upload your UPI QR code image
- **Supported Formats**: JPG, PNG, WebP
- **Max Size**: 5MB
- **Preview**: The QR code will display as a preview after upload

**How it works:**
- Customers will see this QR code at checkout
- They can scan it with any UPI app to make payment
- The QR code is stored securely with your configuration

---

### 2. 🏦 Bank Details

Configure your bank account for customer bank transfers:

#### Required Fields:
- **Account Holder Name** - Your registered business name or individual name
- **Bank Name** - e.g., HDFC Bank, SBI, Axis Bank
- **Account Number** - Your full bank account number
- **IFSC Code** - The 11-character IFSC code of your bank branch
- **Branch Name** (Optional) - Your bank branch location

#### Information Preview:
After filling in the bank details, you'll see a summary card showing all the information that will be displayed to customers.

**Important:**
- Double-check all details before saving
- Incorrect bank details may result in payment failures
- Customers will use these details to transfer money manually

---

### 3. ⚙️ Payment Settings

#### Payment Method Controls

**💳 Card Payment**
- Turn on/off to allow credit/debit card payments
- When enabled: Show card payment option at checkout
- When disabled: Hide card payment option

**📱 UPI Payment**
- Turn on/off to allow UPI payments
- When enabled: Display UPI QR code at checkout
- When disabled: Hide UPI option
- Requires: UPI ID must be filled in UPI Settings tab

**🏦 Bank Transfer**
- Turn on/off to allow direct bank transfers
- When enabled: Display bank details at checkout
- When disabled: Hide bank transfer option
- Requires: All bank details must be filled in Bank Details tab

#### Order Amount Limits

**Minimum Order Amount (₹)**
- Set the lowest amount customers can order
- Example: 100 (customers must order at least ₹100)
- Default: 100

**Maximum Order Amount (₹)**
- Set the highest amount customers can order
- Example: 100000 (customers cannot order more than ₹100,000)
- Default: 100000

**Notes:**
- Minimum must be less than Maximum
- Works across all payment methods
- You can change these anytime

#### Payment Page Description
- Custom message displayed on the payment page
- Example: "Select your preferred payment method. All payments are secure."
- Optional field
- HTML tags are not supported (plain text only)

---

## How Configuration Affects Customers

### At Checkout
1. Customer views the Payment Methods page
2. Only **enabled** payment methods appear
3. Customer selects their preferred method:
   - **Card**: Direct card payment form
   - **UPI**: Displays your QR code to scan
   - **Bank**: Shows your bank account details

### Order Amount Validation
- System checks if order is within min-max range
- If not, shows error: "Order amount not within allowed range"
- Customer must adjust the order to proceed

---

## Saving Configuration

### Steps:
1. Fill in all desired payment details
2. Enable/disable payment methods as needed
3. Set order amount limits
4. Click **"💾 Save Payment Configuration"** button
5. Wait for ✅ success message

### What Gets Saved:
- **Locally**: Saved to browser localStorage (works offline)
- **Server**: Also synced to server (if available)
- **Automatic Fallback**: If server is down, localStorage is still used

### Validation:
Before saving, the system checks:
- At least one payment method is enabled
- UPI ID is filled (if UPI is enabled)
- Bank details are complete (if bank transfer is enabled)
- Minimum amount < Maximum amount

---

## Best Practices

✅ **Do's:**
- Keep bank details updated and accurate
- Regularly check your UPI QR code is working
- Set realistic order limits based on your capacity
- Test each payment method after setup
- Use descriptive payment page message

❌ **Don'ts:**
- Don't enable a method without proper setup (e.g., UPI without QR)
- Don't set unrealistic order limits
- Don't share your payment screenshots publicly
- Don't forget to save changes
- Don't enable methods if they're not currently operational

---

## Troubleshooting

### "At least one payment method must be enabled"
**Issue**: You tried to save without enabling any payment method
**Solution**: Check at least one payment method checkbox

### "UPI ID is required when UPI payment is enabled"
**Issue**: UPI is enabled but UPI ID field is empty
**Solution**: Go to UPI Settings tab and fill in your UPI ID

### "Bank account details are incomplete"
**Issue**: Bank transfer is enabled but some bank fields are missing
**Solution**: Fill all required bank fields (Name, Account, IFSC)

### QR Code not uploading
**Issue**: Image file too large or wrong format
**Solution**: 
- Use JPG or PNG format
- Keep file under 5MB
- Try a different image if format is correct

### Minimum amount greater than maximum
**Issue**: Min amount is set higher than Max amount
**Solution**: Ensure Min < Max (e.g., Min: 100, Max: 5000)

---

## Security Notes

⚠️ **Important:**
- All configuration is accessible only to admins
- Bank details are stored securely
- QR codes are base64 encoded in storage
- Configuration is cached locally for downtime resilience
- Always use HTTPS in production

---

## Advanced Information

### File Locations:
- **Component**: `/frontend/src/components/PaymentSettings.tsx`
- **Service**: `/frontend/src/services/paymentAdmin.ts`
- **Storage**: LocalStorage key = `paymentConfig`

### API Endpoints (if backend is available):
- `GET /api/payment-config` - Fetch configuration
- `POST /api/payment-config` - Save configuration

### Data Structure:
```typescript
{
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
```

---

## Support & Updates

For issues or questions:
1. Check the Troubleshooting section above
2. Verify all required fields are filled
3. Clear browser cache and try again
4. Contact technical support if problem persists

---

**Last Updated**: February 2026
**Version**: 1.0
