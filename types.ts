
export type UserRole = 'customer' | 'admin' | null;
export type Language = 'en' | 'te';

export interface Product {
  id: string;
  name: string;
  name_te: string;
  price: number;
  description: string;
  description_te: string;
  image: string;
  category: 'plates' | 'bowls' | 'cutlery' | 'sets' | 'organic' | 'earthenware';
  benefits: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: string;
  customerEmail: string;
  shippingAddress: string;
  paymentMethod: 'card' | 'upi';
  paymentId: string;
}

export interface OrderDetails {
  email: string;
  address: string;
  city: string;
  zipCode: string;
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for customer auth
  role: UserRole;
  joinedDate: string;
}

export type View = 'home' | 'shop' | 'about' | 'impact' | 'contact' | 'admin' | 'my-orders' | 'bulk-enquiry' | 'blog-detail' | 'customer-dashboard';
