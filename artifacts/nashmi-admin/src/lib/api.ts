const BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || "https://nashmi-market.onrender.com/api";

function getToken(): string | null {
  return localStorage.getItem("nashmi_admin_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  try {
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
  } catch (err: any) {
    console.warn("API Error:", err);
    throw err;
  }
}

export const adminApi = {
  login: async (email: string, password: string) => {
    return req<{ token: string; user: { id: number; name: string; email: string; role: string } }>(
      "POST",
      "/auth/login",
      { email, password },
    );
  },

  getProducts: () => req<AdminProduct[]>("GET", "/products"),

  addProduct: (data: Partial<AdminProduct>) => req<AdminProduct>("POST", "/products", data),

  updateProduct: (id: number, data: Partial<AdminProduct>) => req<AdminProduct>("PUT", `/products/${id}`, data),

  deleteProduct: (id: number) => req<{ success: boolean }>("DELETE", `/products/${id}`),

  getOrders: () => req<AdminOrder[]>("GET", "/orders"),

  getOrderDetail: (id: number) => req<AdminOrder>("GET", `/orders/${id}`),

  updateOrderStatus: (id: number, status: string) => req<AdminOrder>("PUT", `/orders/${id}/status`, { status }),

  createManualOrder: (customerName: string, total: number, status: string, items?: OrderItem[]) =>
    req<AdminOrder>("POST", "/orders/manual", { customerName, total, status, items }),

  getUsers: () => req<AdminUser[]>("GET", "/users"),

  updateUserRole: (id: number, role: string, password?: string) =>
    req<{ id: number; name: string; email: string; role: string }>("PUT", `/users/${id}/role`, { role, password }),

  dashboard: () => req<DashboardData>("GET", "/dashboard"),

  // Settings
  getSettings: () => req<AdminSettings>("GET", "/settings"),
  updateSettings: (data: Partial<AdminSettings>) => req<AdminSettings>("PUT", "/settings", data),

  // Contact Messages
  getContactMessages: () => req<ContactMessage[]>("GET", "/contact"),
  markContactMessageRead: (id: number) => req<ContactMessage>("PUT", `/contact/${id}/read`),

  // Notifications
  getNotifications: () => req<AdminNotification[]>("GET", "/notifications"),
  getUnreadCount: () => req<{ count: number }>("GET", "/notifications/unread-count"),
  markNotificationsRead: () => req<{ success: boolean }>("POST", "/notifications/read"),
};

export interface AdminProduct {
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

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface AdminOrder {
  id: number;
  userId: number | null;
  total: number;
  status: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
}

export interface AdminNotification {
  id: number;
  type: "new_order" | "status_change" | "info";
  title: string;
  desc: string;
  orderId?: number;
  read: boolean;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export interface AdminSettings {
  id: number;
  instagram: string;
  facebook: string;
  discord: string;
  showInstagram: number;
  showFacebook: number;
  showDiscord: number;
  storeName: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  read: number;
  createdAt: string;
}

export interface DashboardData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: AdminOrder[];
}

