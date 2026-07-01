import { Router } from "express";
import db from "./db.js";
import { authMiddleware } from "./auth.js";

const router = Router();

router.get("/", authMiddleware, (req, res) => {
  try {
    let profile = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(req.user.id);
    if (!profile) {
      profile = {
        user_id: req.user.id,
        familyCount: 2,
        hasChild: 0,
        childCount: 0,
        hasElderly: 0,
        elderlyCount: 0,
        hasDisease: 0,
        diseases: "[]",
        hasPet: 0,
        petCount: 0,
        livingType: "",
        floor: 1,
        hasElevator: 0,
        hasToolsKnowledge: 0,
        hasFirstAid: 0,
      };
    }
    if (typeof profile.diseases === "string") {
      profile.diseases = JSON.parse(profile.diseases);
    }
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/", authMiddleware, (req, res) => {
  try {
    const data = req.body;
    const existing = db.prepare("SELECT id FROM profiles WHERE user_id = ?").get(req.user.id);

    const diseases = typeof data.diseases === "string" ? data.diseases : JSON.stringify(data.diseases || []);

    const fields = {
      familyCount: data.familyCount ?? 2,
      hasChild: data.hasChild ? 1 : 0,
      childCount: data.childCount ?? 0,
      hasElderly: data.hasElderly ? 1 : 0,
      elderlyCount: data.elderlyCount ?? 0,
      hasDisease: data.hasDisease ? 1 : 0,
      diseases,
      hasPet: data.hasPet ? 1 : 0,
      petCount: data.petCount ?? 0,
      livingType: data.livingType || "",
      floor: data.floor ?? 1,
      hasElevator: data.hasElevator ? 1 : 0,
      hasToolsKnowledge: data.hasToolsKnowledge ? 1 : 0,
      hasFirstAid: data.hasFirstAid ? 1 : 0,
    };

    if (existing) {
      const setClause = Object.keys(fields)
        .map((k) => `${k} = ?`)
        .join(", ");
      db.prepare(`UPDATE profiles SET ${setClause}, updated_at = datetime('now') WHERE user_id = ?`).run(
        ...Object.values(fields),
        req.user.id
      );
    } else {
      db.prepare(
        `INSERT INTO profiles (user_id, ${Object.keys(fields).join(", ")}) VALUES (${[
          "?",
          ...Object.keys(fields).map(() => "?"),
        ].join(", ")})`
      ).run(req.user.id, ...Object.values(fields));
    }

    let profile = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(req.user.id);
    if (typeof profile.diseases === "string") {
      profile.diseases = JSON.parse(profile.diseases);
    }
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
