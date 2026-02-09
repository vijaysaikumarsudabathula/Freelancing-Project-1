const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5001/api';

// ==================== USERS ====================
export async function createUser(userData: any) {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getUser(id: string) {
  const res = await fetch(`${API_URL}/users/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getUserByEmail(email: string) {
  const res = await fetch(`${API_URL}/users/email/${email}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateUser(id: string, updates: any) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteUser(id: string) {
  const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ==================== PRODUCTS ====================
export async function createProduct(productData: any) {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getProducts() {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getProduct(id: string) {
  const res = await fetch(`${API_URL}/products/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateProduct(id: string, updates: any) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ==================== ORDERS ====================
export async function createOrder(orderData: any) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getOrders() {
  const res = await fetch(`${API_URL}/orders`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getOrder(id: string) {
  const res = await fetch(`${API_URL}/orders/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getOrdersByUser(userId: string) {
  const res = await fetch(`${API_URL}/orders/user/${userId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateOrder(id: string, updates: any) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ==================== ADDRESSES ====================
export async function createAddress(addressData: any) {
  const res = await fetch(`${API_URL}/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(addressData)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAddressesByUser(userId: string) {
  const res = await fetch(`${API_URL}/addresses/user/${userId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteAddress(id: string) {
  const res = await fetch(`${API_URL}/addresses/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ==================== AUDIT LOGS ====================
export async function logLogin(loginData: any) {
  const res = await fetch(`${API_URL}/audit/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getLoginHistory() {
  const res = await fetch(`${API_URL}/audit/login`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function logActivity(activityData: any) {
  const res = await fetch(`${API_URL}/audit/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activityData)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getActivityLog() {
  const res = await fetch(`${API_URL}/audit/activity`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function logTransaction(transactionData: any) {
  const res = await fetch(`${API_URL}/audit/transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transactionData)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTransactionLog() {
  const res = await fetch(`${API_URL}/audit/transaction`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ==================== HEALTH CHECK ====================
export async function checkServerHealth() {
  try {
    const res = await fetch(`${API_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
