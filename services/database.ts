import { Product, Order, User, BulkRequest, SavedCard, OrderStatus } from '../types';
import * as api from './api';

// All operations now go through the API

// ==================== USERS ====================
export async function initDatabase() {
  const isHealthy = await api.checkServerHealth();
  if (!isHealthy) {
    console.error('⚠️  Server is not running. Please start the backend server on port 5001');
    throw new Error('Cannot connect to backend server. Make sure the server is running on port 5001');
  }
  console.log('✅ Connected to backend server');
}

export function getUsers(): User[] {
  return [];
}

export function getProducts(): Product[] {
  return [];
}

export function getOrders(): Order[] {
  return [];
}

export function getActiveUser(): User | null {
  const stored = localStorage.getItem('deepthi_active_user');
  return stored ? JSON.parse(stored) : null;
}

export async function getUsersAsync(): Promise<User[]> {
  return api.getUsers();
}

export async function addUser(user: Omit<User, 'id'>): Promise<User> {
  return api.createUser({
    email: user.email,
    name: user.name,
    password: (user as any).password || 'default',
    role: user.role
  });
}

export async function deleteUser(userId: string): Promise<void> {
  return api.deleteUser(userId);
}

export async function updateUserAsync(userId: string, updates: any): Promise<User> {
  return api.updateUser(userId, updates);
}

export function setActiveUserDB(user: User | null): void {
  if (user) {
    localStorage.setItem('deepthi_active_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('deepthi_active_user');
  }
}

export async function updateUserLastLogin(userId: string, timestamp: string) {
  return api.updateUser(userId, { lastLogin: timestamp });
}

// ==================== PRODUCTS ====================
export async function addProduct(product: Product): Promise<void> {
  await api.createProduct({
    id: product.id,
    name: product.name,
    name_te: product.name_te,
    price: product.price,
    category: product.category,
    description: product.description,
    description_te: product.description_te,
    image: product.image,
    benefits: product.benefits
  });
}

export function saveProduct(product: Product): void {
  // Async version should be used
  addProduct(product).catch(e => console.error('Error saving product:', e));
}

export async function getProductsAsync(): Promise<Product[]> {
  return api.getProducts();
}

export async function updateProduct(product: Product): Promise<void> {
  await api.updateProduct(product.id, {
    name: product.name,
    name_te: product.name_te,
    price: product.price,
    category: product.category,
    description: product.description,
    description_te: product.description_te,
    image: product.image,
    benefits: product.benefits
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  await api.deleteProduct(productId);
}

// ==================== ORDERS ====================
export async function addOrder(order: Order): Promise<void> {
  await api.createOrder({
    userId: (order as any).customerId || (order as any).userId || null,
    customerEmail: order.customerEmail,
    items: order.items,
    total: order.total,
    status: order.status,
    shippingAddress: order.shippingAddress,
    trackingId: order.trackingId,
    trackingHistory: (order as any).trackingHistory || []
  });
}

export async function getOrdersAsync(): Promise<Order[]> {
  return api.getOrders();
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  return api.getOrdersByUser(userId);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, trackingId?: string): Promise<void> {
  await api.updateOrder(orderId, { status, trackingId });
}

// ==================== ADDRESSES ====================
export async function addAddress(userId: string, address: any): Promise<void> {
  await api.createAddress({
    userId,
    name: address.name,
    phone: address.phone,
    address: address.address,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    isDefault: address.isDefault
  });
}

export async function getAddresses(userId: string): Promise<any[]> {
  return api.getAddressesByUser(userId);
}

export async function deleteAddress(addressId: string): Promise<void> {
  await api.deleteAddress(addressId);
}

export async function addSavedCard(userId: string, card: any): Promise<void> {
  await logActivity(userId, 'CARD_SAVED', `Card ending in ${card.cardNumber?.slice(-4)} saved`);
}

// ==================== AUDIT LOGGING ====================
export async function logLogin(userId: string | null, email: string | null, status: 'success' | 'failed', notes?: string): Promise<void> {
  await api.logLogin({
    userId: userId || null,
    email: email || null,
    status,
    notes: notes || null
  });
}

export async function getLoginHistory(): Promise<any[]> {
  return api.getLoginHistory();
}

export async function logActivity(userId: string, activityType: string, description?: string, metadata?: any): Promise<void> {
  await api.logActivity({
    userId,
    activityType,
    description: description || null,
    metadata: metadata || {}
  });
}

export async function getActivityLog(userId?: string, limit?: number): Promise<any[]> {
  const allLogs = await api.getActivityLog();
  if (userId) {
    return allLogs.filter((log: any) => log.userId === userId).slice(0, limit || 100);
  }
  return allLogs.slice(0, limit || 100);
}

export async function logTransaction(userId: string, orderId: string | null, amount: number, paymentMethod?: string, status?: string): Promise<void> {
  await api.logTransaction({
    userId,
    orderId: orderId || null,
    amount,
    paymentMethod: paymentMethod || null,
    status: status || 'completed',
    description: null
  });
}

export async function getTransactionLog(userId?: string, limit?: number): Promise<any[]> {
  const allLogs = await api.getTransactionLog();
  if (userId) {
    return allLogs.filter((log: any) => log.userId === userId).slice(0, limit || 100);
  }
  return allLogs.slice(0, limit || 100);
}

// ==================== PLACEHOLDER FUNCTIONS ====================
export function saveDatabase(): void {
  console.log('✅ Database auto-saved on server');
}

export async function importDatabase(data: any): Promise<void> {
  console.warn('Database import not supported in API mode');
}

export async function addFavorite(userId: string, productId: string): Promise<void> {
  await logActivity(userId, 'FAVORITE_ADDED', `Added product to favorites`);
}

export async function removeFavorite(userId: string, productId: string): Promise<void> {
  await logActivity(userId, 'FAVORITE_REMOVED', `Removed product from favorites`);
}

export async function addSavedCart(userId: string, items: any[]): Promise<void> {
  await logActivity(userId, 'CART_SAVED', 'Saved cart items', { itemCount: items.length });
}

export async function getSavedCart(userId: string): Promise<any[]> {
  await logActivity(userId, 'CART_LOADED', 'Retrieved saved cart');
  return [];
}

export async function addBulkRequest(userId: string, productName: string, quantity: string, requirements?: string): Promise<void> {
  await logActivity(userId, 'BULK_REQUEST', `Bulk request for ${productName}`, { quantity, requirements });
}

export async function getBulkRequests(userId?: string): Promise<BulkRequest[]> {
  return [];
}

// ==================== UTILITY FUNCTIONS ====================
export function getTableList(): string[] {
  return ['users', 'products', 'orders', 'addresses', 'saved_cards', 'favorites', 'saved_carts', 'bulk_requests', 'login_history', 'activity_log', 'transaction_log'];
}

export function getTableContents(tableName: string): any[] {
  console.warn(`getTableContents not supported in API mode. Use specific functions for table data.`);
  return [];
}

export function runSql(sql: string, params: any[] = []): any[] {
  console.warn('runSql is not supported in API mode. Use specific functions instead.');
  return [];
}

export async function exportDatabase(): Promise<string> {
  console.warn('exportDatabase not supported in API mode');
  return '';
}

export async function downloadDatabase(): Promise<void> {
  console.warn('downloadDatabase not supported in API mode');
}

