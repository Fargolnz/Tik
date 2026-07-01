import { Router } from "express";
import db from "./db.js";
import { authMiddleware } from "./auth.js";

const router = Router();

router.get("/", authMiddleware, (req, res) => {
  try {
    const items = db.prepare("SELECT * FROM checklist_items WHERE user_id = ? ORDER BY id").all(req.user.id);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/", authMiddleware, (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Items must be an array" });
    }

    const deleteStmt = db.prepare("DELETE FROM checklist_items WHERE user_id = ?");
    const insertStmt = db.prepare(
      "INSERT INTO checklist_items (user_id, item_id, title, description, category, priority, quantity, checked, customizable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    const transaction = db.transaction(() => {
      deleteStmt.run(req.user.id);
      for (const item of items) {
        insertStmt.run(
          req.user.id,
          item.item_id || item.id,
          item.title,
          item.description || "",
          item.category || "سایر",
          item.priority || "medium",
          item.quantity || "",
          item.checked ? 1 : 0,
          item.customizable ? 1 : 0
        );
      }
    });

    transaction();
    res.json({ items: db.prepare("SELECT * FROM checklist_items WHERE user_id = ? ORDER BY id").all(req.user.id) });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
