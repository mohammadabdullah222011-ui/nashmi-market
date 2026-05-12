import { db as drizzleDb, usersTable, productsTable, ordersTable, orderItemsTable, settingsTable, type InsertSettings, type Settings } from "@workspace/db";
import { eq, desc, count, sql, inArray } from "drizzle-orm";

// In-memory notifications (no DB table yet)
interface AdminNotification {
  id: number;
  type: "new_order" | "status_change" | "info";
  title: string;
  desc: string;
  orderId?: number;
  read: boolean;
  createdAt: string;
}

let notifications: AdminNotification[] = [];
let nextNotifId = 1;

async function enrichOrderItems(orderId: number): Promise<{ productId: number; name: string; price: number; quantity: number; imageUrl: string }[]> {
  const items = await drizzleDb.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
  return Promise.all(items.map(async (item) => {
    const product = await drizzleDb.select().from(productsTable).where(eq(productsTable.id, item.productId)).limit(1).then(r => r[0]);
    return {
      productId: item.productId,
      name: product?.name || `منتج #${item.productId}`,
      price: item.price,
      quantity: item.quantity,
      imageUrl: product?.imageUrl || "",
    };
  }));
}

async function getOrderByIdRaw(id: number) {
  const rows = await drizzleDb.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
  return rows[0] ?? null;
}

async function getOrderById(id: number) {
  const row = await getOrderByIdRaw(id);
  if (!row) return null;
  const items = await enrichOrderItems(id);
  return { ...row, items };
}

export const db = {
  // ── Users ──────────────────────────────────────────────
  getUsers: () => drizzleDb.select().from(usersTable).orderBy(desc(usersTable.createdAt)),

  getUserById: async (id: number) => {
    const rows = await drizzleDb.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    return rows[0] ?? null;
  },

  getUserByEmail: async (email: string) => {
    const rows = await drizzleDb.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    return rows[0] ?? null;
  },

  createUser: async (user: { name: string; email: string; password: string; role: string }) => {
    const rows = await drizzleDb.insert(usersTable).values(user).returning();
    return rows[0];
  },

  updateUserRole: async (id: number, role: string) => {
    const rows = await drizzleDb.update(usersTable).set({ role }).where(eq(usersTable.id, id)).returning();
    return rows[0] ?? null;
  },

  updateUserPassword: async (id: number, password: string) => {
    const rows = await drizzleDb.update(usersTable).set({ password }).where(eq(usersTable.id, id)).returning();
    return rows[0] ?? null;
  },

  // ── Products ───────────────────────────────────────────
  getProducts: () => drizzleDb.select().from(productsTable).orderBy(desc(productsTable.createdAt)),

  getProductById: async (id: number) => {
    const rows = await drizzleDb.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
    return rows[0] ?? null;
  },

  createProduct: async (product: {
    name: string; description: string; price: number; imageUrl: string;
    stock: number; category: string; badge?: string | null;
  }) => {
    const rows = await drizzleDb.insert(productsTable).values({ ...product, rating: 5, reviews: 0 }).returning();
    return rows[0];
  },

  updateProduct: async (id: number, updates: Record<string, unknown>) => {
    const rows = await drizzleDb.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
    return rows[0] ?? null;
  },

  deleteProduct: async (id: number) => {
    const result = await drizzleDb.delete(productsTable).where(eq(productsTable.id, id)).returning();
    return result.length > 0;
  },

  // ── Orders ─────────────────────────────────────────────
  getOrders: async () => {
    const orders = await drizzleDb.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    return Promise.all(orders.map(async (o) => {
      const items = await enrichOrderItems(o.id);
      return { ...o, items };
    }));
  },

  getOrderById: getOrderById,

  getOrdersByUserId: async (userId: number) => {
    const orders = await drizzleDb.select().from(ordersTable).where(eq(ordersTable.userId, userId));
    return Promise.all(orders.map(async (o) => {
      const items = await enrichOrderItems(o.id);
      return { ...o, items };
    }));
  },

  createOrder: async (order: {
    userId: number | null; total: number; status?: string;
    customerName: string; phone?: string; address?: string; paymentMethod?: string;
    items: { productId: number; name: string; price: number; quantity: number; imageUrl: string }[];
  }) => {
    const rows = await drizzleDb.insert(ordersTable).values({
      userId: order.userId,
      total: order.total,
      status: order.status || "pending",
      customerName: order.customerName,
      phone: order.phone || "",
      address: order.address || "",
      paymentMethod: order.paymentMethod || "cash",
      createdAt: new Date().toISOString(),
    }).returning();
    const newOrder = rows[0];

    if (order.items.length > 0) {
      await drizzleDb.insert(orderItemsTable).values(
        order.items.map(item => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        }))
      );
    }

    notifications.push({
      id: nextNotifId++,
      type: "new_order",
      title: "🛒 طلب جديد",
      desc: `طلب #${String(newOrder.id).padStart(4, "0")} من ${newOrder.customerName} — ${newOrder.total.toLocaleString("en")} JD`,
      orderId: newOrder.id,
      read: false,
      createdAt: new Date().toISOString(),
    });

    return { ...newOrder, phone: order.phone || "", address: order.address || "", paymentMethod: order.paymentMethod || "cash", items: order.items };
  },

  updateOrderStatus: async (id: number, status: string) => {
    const before = await getOrderById(id);
    const rows = await drizzleDb.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
    const order = rows[0] ?? null;
    if (order && before && before.status !== status) {
      notifications.push({
        id: nextNotifId++,
        type: "status_change",
        title: "📦 تغيير حالة الطلب",
        desc: `الطلب #${String(order.id).padStart(4, "0")} تغير من "${before.status}" إلى "${status}"`,
        orderId: order.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    return order;
  },

  // ── Notifications ──────────────────────────────────────
  getNotifications: () => notifications,
  getUnreadCount: () => notifications.filter(n => !n.read).length,
  markNotificationsRead: () => { notifications.forEach(n => { n.read = true; }); },

  // ── Stats ──────────────────────────────────────────────
  getUserStats: async () => {
    const [userCount] = await drizzleDb.select({ value: count() }).from(usersTable);
    const [orderCount] = await drizzleDb.select({ value: count() }).from(ordersTable);
    const [rev] = await drizzleDb.select({ value: sql<number>`COALESCE(SUM(${ordersTable.total}), 0)` }).from(ordersTable);
    const [productCount] = await drizzleDb.select({ value: count() }).from(productsTable);
    const recentOrders = await drizzleDb.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5);

    return {
      totalUsers: Number(userCount.value),
      totalOrders: Number(orderCount.value),
      totalRevenue: Number(rev.value),
      totalProducts: Number(productCount.value),
      recentOrders,
    };
  },

  // ── Settings ──────────────────────────────────────────
  getSettings: async () => {
    const rows = await drizzleDb.select().from(settingsTable).limit(1);
    if (rows.length > 0) return rows[0];
    const [row] = await drizzleDb.insert(settingsTable).values({}).returning();
    return row;
  },

  updateSettings: async (data: Partial<InsertSettings>) => {
    const rows = await drizzleDb.select().from(settingsTable).limit(1);
    let row = rows[0];
    if (!row) {
      [row] = await drizzleDb.insert(settingsTable).values(data as InsertSettings).returning();
    } else {
      [row] = await drizzleDb.update(settingsTable).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(settingsTable.id, row.id)).returning();
    }
    return row;
  },
};
