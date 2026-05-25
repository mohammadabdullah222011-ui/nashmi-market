const BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || "https://nashmi-market.onrender.com/api";

function getToken(): string | null {
  return localStorage.getItem("nashmi_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  if (!text) {
    throw new Error(!res.ok ? "Action unavailable" : "Action unavailable: Empty response");
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Action unavailable: Invalid JSON response");
  }

  if (!res.ok) throw new Error(data?.error || "حدث خطأ");
  return data as T;
}

export const api = {
  // Auth
  register: async (name: string, email: string, password: string) => {
    return req<{ token: string; user: ApiUser }>("POST", "/auth/register", { name, email, password });
  },

  login: async (email: string, password: string) => {
    return req<{ token: string; user: ApiUser }>("POST", "/auth/login", { email, password });
  },

  me: () => req<ApiUser>("GET", "/auth/me"),

  // Products
  getProducts: () => req<ApiProduct[]>("GET", "/products"),
  getProduct: (id: number) => req<ApiProduct>("GET", `/products/${id}`),

  addProduct: (data: Partial<ApiProduct>) => req<ApiProduct>("POST", "/products", data),

  // Orders
  createOrder: (
    items: { product_id: number; quantity: number }[],
    phone?: string,
    customerName?: string,
    address?: string,
    paymentMethod?: string,
  ) => req<{ id: number }>("POST", "/orders", { items, phone, customerName, address, paymentMethod }),

  myOrders: () => req<ApiOrder[]>("GET", "/orders/my"),

  updateMyOrder: (id: number, data: { phone?: string; address?: string; paymentMethod?: string }) =>
    req<ApiOrder>("PUT", `/orders/my/${id}`, data),

  cancelMyOrder: (id: number) =>
    req<ApiOrder>("PUT", `/orders/my/${id}/cancel`),

  updateMyOrderItems: (id: number, items: { product_id: number; quantity: number }[]) =>
    req<ApiOrder>("PUT", `/orders/my/${id}/items`, { items }),

  // Settings
  getSettings: () => req<ApiSettings>("GET", "/settings"),

  // Admin
  adminOrders: () => req<ApiOrder[]>("GET", "/orders"),
  dashboard: () => req<DashboardData>("GET", "/dashboard"),
};

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface ApiProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
  badge?: string | null;
  rating: number;
  reviews: number;
  createdAt?: string;
}

export interface ApiOrder {
  id: number;
  userId: number | null;
  total: number;
  status: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  createdAt: string;
  items?: { productId: number; name: string; price: number; quantity: number; imageUrl: string }[];
}

export interface ApiSettings {
  id: number;
  instagram: string;
  facebook: string;
  showInstagram: number;
  showFacebook: number;
  storeName: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  updatedAt: string;
}

export interface DashboardData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: ApiOrder[];
}

