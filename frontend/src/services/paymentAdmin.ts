import { PaymentConfig } from '../components/PaymentSettings';

// Re-export for convenience
export type { PaymentConfig };

const API_BASE = '/api';

/**
 * Get payment configuration from the server
 */
export const getPaymentConfig = async (): Promise<PaymentConfig | null> => {
  try {
    const response = await fetch(`${API_BASE}/payment-config`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching payment config:', error);
    // Return from localStorage as fallback
    try {
      const saved = localStorage.getItem('paymentConfig');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }
};

/**
 * Save payment configuration to the server
 */
export const savePaymentConfig = async (config: PaymentConfig): Promise<boolean> => {
  try {
    // First save to localStorage for immediate availability
    localStorage.setItem('paymentConfig', JSON.stringify(config));

    // Then try to save to backend
    const response = await fetch(`${API_BASE}/payment-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error saving payment config to backend:', error);
    // Configuration was still saved to localStorage, so return true
    return true;
  }
};

/**
 * Get payment configuration (for frontend, during checkout)
 * This reads from localStorage or fetches from server
 */
export const getPaymentConfigForCheckout = async (): Promise<PaymentConfig> => {
  const defaultConfig: PaymentConfig = {
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
  };

  try {
    // Try to get from server first
    const config = await getPaymentConfig();
    return config || defaultConfig;
  } catch (error) {
    console.warn('Could not fetch payment config, using defaults:', error);
    return defaultConfig;
  }
};

/**
 * Validate payment configuration
 */
export const validatePaymentConfig = (config: PaymentConfig): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (config.cardPaymentEnabled || config.upiPaymentEnabled || config.bankTransferEnabled) {
    // At least one payment method should be enabled
  } else {
    errors.push('At least one payment method must be enabled');
  }

  if (config.upiPaymentEnabled && !config.upiId) {
    errors.push('UPI ID is required when UPI payment is enabled');
  }

  if (config.bankTransferEnabled) {
    if (!config.bankAccountName) errors.push('Bank account name is required');
    if (!config.bankAccountNumber) errors.push('Bank account number is required');
    if (!config.bankIFSC) errors.push('Bank IFSC code is required');
  }

  if (config.minOrderAmount >= config.maxOrderAmount) {
    errors.push('Minimum order amount must be less than maximum order amount');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Get enabled payment methods
 */
export const getEnabledPaymentMethods = (config: PaymentConfig): string[] => {
  const methods = [];
  
  if (config.cardPaymentEnabled) methods.push('card');
  if (config.upiPaymentEnabled) methods.push('upi');
  if (config.bankTransferEnabled) methods.push('bank');
  
  return methods;
};

/**
 * Check if an order amount is within allowed limits
 */
export const isOrderAmountValid = (config: PaymentConfig, amount: number): boolean => {
  return amount >= config.minOrderAmount && amount <= config.maxOrderAmount;
};
