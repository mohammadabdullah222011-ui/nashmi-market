import { Router } from "express";
import { db } from "../lib/database.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// POST /api/contact (public - from store)
router.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      res.status(400).json({ error: "جميع الحقول مطلوبة" });
      return;
    }
    const msg = await db.createContactMessage({ name, email, message });
    res.status(201).json({ success: true, id: msg.id });
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// GET /api/contact (admin)
router.get("/contact", requireAuth, async (req, res) => {
  try {
    const messages = await db.getContactMessages();
    res.json(messages);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// PUT /api/contact/:id/read (admin)
router.put("/contact/:id/read", requireAuth, async (req, res) => {
  try {
    const updated = await db.markContactMessageRead(Number(req.params.id));
    if (!updated) { res.status(404).json({ error: "الرسالة غير موجودة" }); return; }
    res.json(updated);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
