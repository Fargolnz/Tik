import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "tik-secret-key-change-in-production";
const OTP_PREFIX = "TIK";

function generateToken(user) {
  return jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: "30d" });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function generateOtpCode() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
}

router.post("/register", (req, res) => {
  try {
    const { full_name, phone, password } = req.body;
    if (!full_name || !phone || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (phone.length < 10) {
      return res.status(400).json({ error: "Invalid phone number" });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters" });
    }

    const existing = db.prepare("SELECT id FROM users WHERE phone = ?").get(phone);
    if (existing) {
      return res.status(409).json({ error: "این شماره تلفن قبلا ثبت‌نام کرده است" });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare("INSERT INTO users (full_name, phone, password_hash) VALUES (?, ?, ?)").run(full_name, phone, hash);
    const user = db.prepare("SELECT id, full_name, phone, created_at FROM users WHERE id = ?").get(result.lastInsertRowid);
    const token = generateToken(user);

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: "Phone and password are required" });
    }

    const user = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone);
    if (!user) {
      return res.status(401).json({ error: "شماره تلفن یا رمز عبور اشتباه است" });
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "شماره تلفن یا رمز عبور اشتباه است" });
    }

    const token = generateToken(user);
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/send-otp", (req, res) => {
  try {
    const { phone, register } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone is required" });
    }

    if (register) {
      const existing = db.prepare("SELECT id FROM users WHERE phone = ?").get(phone);
      if (existing) {
        return res.status(409).json({ error: "این شماره تلفن قبلا ثبت‌نام کرده است" });
      }
    }

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    db.prepare("INSERT INTO otp_codes (phone, code, expires_at) VALUES (?, ?, ?)").run(phone, code, expiresAt);

    console.log(`[OTP] Code for ${phone}: ${code}`);

    res.json({ message: "کد تأیید ارسال شد", code_debug: code });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verify-otp", (req, res) => {
  try {
    const { phone, code, create_user } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: "Phone and code are required" });
    }

    const otp = db.prepare(
      "SELECT * FROM otp_codes WHERE phone = ? AND code = ? AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1"
    ).get(phone, code);

    if (!otp) {
      return res.status(401).json({ error: "کد نامعتبر یا منقضی شده است" });
    }

    db.prepare("UPDATE otp_codes SET used = 1 WHERE id = ?").run(otp.id);

    let user = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone);
    if (!user && create_user !== false) {
      const result = db.prepare("INSERT INTO users (full_name, phone, password_hash) VALUES (?, ?, ?)").run(`User ${phone.slice(-4)}`, phone, bcrypt.hashSync(phone, 10));
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
    }

    if (!user) {
      return res.json({ verified: true });
    }

    const token = generateToken(user);
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token, is_new: !user.full_name.startsWith("User ") });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/forgot-password", (req, res) => {
  try {
    const { phone, code, new_password } = req.body;
    if (!phone || !code || !new_password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const otp = db.prepare(
      "SELECT * FROM otp_codes WHERE phone = ? AND code = ? AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1"
    ).get(phone, code);

    if (!otp) {
      return res.status(401).json({ error: "کد نامعتبر یا منقضی شده است" });
    }

    db.prepare("UPDATE otp_codes SET used = 1 WHERE id = ?").run(otp.id);

    const hash = bcrypt.hashSync(new_password, 10);
    db.prepare("UPDATE users SET password_hash = ? WHERE phone = ?").run(hash, phone);

    res.json({ message: "رمز عبور با موفقیت تغییر کرد" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", authMiddleware, (req, res) => {
  try {
    const user = db.prepare("SELECT id, full_name, phone, created_at FROM users WHERE id = ?").get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/change-password", authMiddleware, (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (new_password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters" });
    }
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    if (!bcrypt.compareSync(current_password, user.password_hash)) {
      return res.status(401).json({ error: "رمز عبور فعلی اشتباه است" });
    }
    const hash = bcrypt.hashSync(new_password, 10);
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, req.user.id);
    res.json({ message: "رمز عبور با موفقیت تغییر کرد" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/account", authMiddleware, (req, res) => {
  try {
    const user = db.prepare("SELECT phone FROM users WHERE id = ?").get(req.user.id);
    if (user) {
      db.prepare("DELETE FROM otp_codes WHERE phone = ?").run(user.phone);
    }
    db.prepare("DELETE FROM users WHERE id = ?").run(req.user.id);
    res.json({ message: "حساب کاربری با موفقیت حذف شد" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/profile", authMiddleware, (req, res) => {
  try {
    const { full_name } = req.body;
    if (full_name) {
      db.prepare("UPDATE users SET full_name = ? WHERE id = ?").run(full_name, req.user.id);
    }
    const user = db.prepare("SELECT id, full_name, phone, created_at FROM users WHERE id = ?").get(req.user.id);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router, authMiddleware };
