import { Router } from "express";
import { db } from "../lib/database.js";

const router = Router();

// GET /api/settings
router.get("/settings", async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json(settings);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// PUT /api/settings
router.put("/settings", async (req, res) => {
  try {
    const { instagram, facebook, showInstagram, showFacebook, storeName, storePhone, storeEmail, storeAddress } = req.body;
    const updated = await db.updateSettings({
      instagram,
      facebook,
      showInstagram,
      showFacebook,
      storeName,
      storePhone,
      storeEmail,
      storeAddress,
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
