
export type UserRole = 'customer' | 'admin' | null;

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: 'plates' | 'bowls' | 'cutlery' | 'sets';
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
  name: string;
  email: string;
  role: UserRole;
}

export type View = 'home' | 'shop' | 'about' | 'impact' | 'contact' | 'admin' | 'my-orders';
