import { Router } from "express";
import { db } from "../lib/database.js";

const router = Router();

// POST /api/orders (authenticated users)
router.post("/orders", async (req, res) => {
  try {
    const { items, phone, customerName, address, paymentMethod } = req.body as { items: { product_id: number; quantity: number }[]; phone?: string; customerName?: string; address?: string; paymentMethod?: string };
    if (!items?.length) {
      res.status(400).json({ error: "الطلب فارغ" });
      return;
    }

    // Calculate total
    let total = 0;
    const enrichedItems: { product_id: number; quantity: number; price: number }[] = [];
    for (const item of items) {
      const product = await db.getProductById(item.product_id);
      if (!product) continue;
      enrichedItems.push({ product_id: item.product_id, quantity: item.quantity, price: product.price });
      total += product.price * item.quantity;
    }

    // Create order with items
    const orderItems = await Promise.all(enrichedItems.map(async item => {
      const product = await db.getProductById(item.product_id);
      return {
        productId: item.product_id,
        name: product?.name || `منتج #${item.product_id}`,
        price: item.price,
        quantity: item.quantity,
        imageUrl: product?.imageUrl || "",
      };
    }));

    const order = await db.createOrder({
      userId: null,
      total,
      customerName: customerName?.trim() || "عميل",
      phone: phone?.trim() || "",
      address: address?.trim() || "",
      paymentMethod: paymentMethod || "cash",
      items: orderItems,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// GET /api/orders/my (current user's orders)
router.get("/orders/my", async (_req, res) => {
  try {
    const orders = await db.getOrders();
    res.json(orders);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// POST /api/orders/manual (admin creates manual order)
router.post("/orders/manual", async (req, res) => {
  try {
    const { customerName, total, status, items, phone, address } = req.body as { customerName: string; total: number; status: string; items?: { productId: number; name: string; price: number; quantity: number; imageUrl: string }[]; phone?: string; address?: string };
    if (!customerName || total === undefined) {
      res.status(400).json({ error: "اسم العميل والمبلغ مطلوبان" });
      return;
    }
    const order = await db.createOrder({
      userId: null,
      total: Number(total),
      status: status || "pending",
      customerName,
      phone: phone || "",
      address: address || "",
      items: items || [],
    });
    res.status(201).json(order);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// GET /api/orders (admin)
router.get("/orders", async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.json(orders);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// GET /api/orders/:id (admin)
router.get("/orders/:id", async (req, res) => {
  try {
    const order = await db.getOrderById(Number(req.params.id));
    if (!order) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
    res.json(order);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// PUT /api/orders/:id (admin - edit order)
router.put("/orders/:id", async (req, res) => {
  try {
    const { customerName, phone, address, total, status } = req.body;
    const updated = await db.updateOrder(Number(req.params.id), { customerName, phone, address, total, status });
    if (!updated) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
    res.json(updated);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// DELETE /api/orders/:id (admin)
router.delete("/orders/:id", async (req, res) => {
  try {
    const deleted = await db.deleteOrder(Number(req.params.id));
    if (!deleted) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// PUT /api/orders/:id/status (admin)
router.put("/orders/:id/status", async (req, res) => {
  try {
    const updated = await db.updateOrderStatus(Number(req.params.id), req.body.status);
    if (!updated) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
    
    // تسجيل المبيعات تلقائياً عند تغيير الحالة إلى "مكتمل"
    if (req.body.status === "completed") {
      console.log(`📊 تسجيل مبيعات جديدة للطلب #${updated.id}: ${updated.total} JD`);
      // هنا يمكن إضافة كود لتسجيل المبيعات في قاعدة البيانات
    }
    
    res.json(updated);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
