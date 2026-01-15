
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

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'out-for-delivery' | 'delivered' | 'cancelled';

export interface TrackingEvent {
  status: OrderStatus;
  timestamp: string;
  location?: string;
  note?: string;
}

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
  trackingId?: string;
  trackingHistory: TrackingEvent[];
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

export interface BulkRequest {
  id: string;
  customerEmail: string;
  items: string;
  quantity: string;
  status: 'pending' | 'quoted' | 'confirmed';
  date: string;
}

export interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
}

export interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  area: string;
  landmark: string;
  city: string;
  zip: string;
  type: 'home' | 'work';
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  joinedDate: string;
  lastLogin?: string;
}

export type View = 'home' | 'shop' | 'about' | 'impact' | 'contact' | 'admin' | 'my-orders' | 'bulk-enquiry' | 'blog-detail' | 'customer-dashboard' | 'saved-orders';
