import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Phone, Lock, User, ArrowLeft, Mail, Eye, EyeOff } from "lucide-react";
import { api, setToken } from "../api";
import { toPersianNumber, toEnglishNumber } from "./data";

type AuthMode = "login" | "register" | "forgot";

interface AuthPageProps {
  onAuthenticated: () => void;
}

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");

  // Login state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // OTP state
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");
  const [regOtpCode, setRegOtpCode] = useState("");
  const [regOtpVerified, setRegOtpVerified] = useState(false);
  const [regStep, setRegStep] = useState<"form" | "otp" | "password">("form");
  const [regOtpLoading, setRegOtpLoading] = useState(false);

  // Forgot password state
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<"phone" | "code" | "password">("phone");

  // Common
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const togglePassword = (key: string) => setShowPasswords(p => ({ ...p, [key]: !p[key] }));

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleLogin = async () => {
    clearMessages();
    if (!loginPhone) {
      setError("لطفا شماره تلفن را وارد کنید");
      return;
    }
    setLoading(true);
    try {
      const res = await api.auth.login({ phone: loginPhone, password: loginPassword });
      setToken(res.token);
      onAuthenticated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "خطا در ورود");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    clearMessages();
    if (!loginPhone) {
      setError("لطفا شماره تلفن را وارد کنید");
      return;
    }
    setOtpLoading(true);
    try {
      await api.auth.sendOtp({ phone: loginPhone });
      setOtpSent(true);
      setSuccess("کد تأیید ارسال شد");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "خطا در ارسال کد");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    clearMessages();
    if (!otpCode) {
      setError("لطفا کد تأیید را وارد کنید");
      return;
    }
    setLoading(true);
    try {
      const res = await api.auth.verifyOtp({ phone: loginPhone, code: otpCode });
      setToken(res.token);
      onAuthenticated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "خطا در تأیید کد");
    } finally {
      setLoading(false);
    }
  };

  const handleRegSendOtp = async () => {
    clearMessages();
    if (!regName) {
      setError("لطفا نام و نام خانوادگی را وارد کنید");
      return;
    }
    if (!regPhone) {
      setError("لطفا شماره تلفن را وارد کنید");
      return;
    }
    setRegOtpLoading(true);
    try {
      await api.auth.sendOtp({ phone: regPhone, register: true });
      setRegStep("otp");
      setSuccess("کد تأیید ارسال شد");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "خطا در ارسال کد");
    } finally {
      setRegOtpLoading(false);
    }
  };

  const handleRegVerifyOtp = async () => {
    clearMessages();
    if (!regOtpCode) {
      setError("لطفا کد تأیید را وارد کنید");
      return;
    }
    setLoading(true);
    try {
      await api.auth.verifyOtp({ phone: regPhone, code: regOtpCode, create_user: false });
      setRegOtpVerified(true);
      setRegStep("password");
      setSuccess("شماره تلفن تأیید شد");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "کد نامعتبر است");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    clearMessages();
    if (!regPassword || !regPasswordConfirm) {
      setError("لطفا رمز عبور را وارد کنید");
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setError("رمز عبور با تأیید آن مطابقت ندارد");
      return;
    }
    if (regPassword.length < 4) {
      setError("رمز عبور باید حداقل ۴ کاراکتر باشد");
      return;
    }
    setLoading(true);
    try {
      const res = await api.auth.register({
        full_name: regName,
        phone: regPhone,
        password: regPassword,
      });
      setToken(res.token);
      onAuthenticated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "خطا در ثبت‌نام");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSendCode = async () => {
    clearMessages();
    if (!forgotPhone) {
      setError("لطفا شماره تلفن را وارد کنید");
      return;
    }
    setLoading(true);
    try {
      await api.auth.sendOtp({ phone: forgotPhone });
      setForgotStep("code");
      setSuccess("کد تأیید ارسال شد");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "خطا در ارسال کد");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotVerifyCode = async () => {
    clearMessages();
    if (!forgotCode) {
      setError("لطفا کد تأیید را وارد کنید");
      return;
    }
    setForgotStep("password");
  };

  const handleForgotNewPassword = async () => {
    clearMessages();
    if (!forgotPassword || forgotPassword.length < 4) {
      setError("رمز عبور باید حداقل ۴ کاراکتر باشد");
      return;
    }
    setLoading(true);
    try {
      await api.auth.forgotPassword({
        phone: forgotPhone,
        code: forgotCode,
        new_password: forgotPassword,
      });
      setSuccess("رمز عبور با موفقیت تغییر کرد");
      setTimeout(() => {
        setMode("login");
        setForgotStep("phone");
        setForgotPhone("");
        setForgotCode("");
        setForgotPassword("");
      }, 1500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "خطا در تغییر رمز");
    } finally {
      setLoading(false);
    }
  };

  const switchToRegister = () => {
    clearMessages();
    setMode("register");
  };

  const switchToLogin = () => {
    clearMessages();
    setMode("login");
  };

  const switchToForgot = () => {
    clearMessages();
    setMode("forgot");
    setForgotStep("phone");
  };

  return (
    <div
      className="flex flex-col h-full bg-background"
      dir="rtl"
      style={{ fontFamily: "'Vazirmatn', sans-serif" }}
    >
      <div className="flex-1 overflow-y-auto px-5 pt-12 pb-6">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: "var(--primary)" }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1, type: "spring" }}
          >
            <ShieldCheck size={40} color="white" strokeWidth={1.5} />
          </motion.div>

          <div className="text-center">
            <h1
              style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}
            >
              {mode === "login" ? "ورود" : mode === "register" ? "ثبت‌نام" : "بازیابی رمز عبور"}
            </h1>
            <p
              className="mt-1"
              style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}
            >
              {mode === "login"
                ? "وارد حساب کاربری خود شوید"
                : mode === "register"
                ? "حساب کاربری جدید بسازید"
                : "رمز عبور خود را بازنشانی کنید"}
            </p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4 mt-6"
            >
              {/* Login method tabs */}
              <div
                className="flex rounded-xl p-1"
                style={{ backgroundColor: "var(--muted)" }}
              >
                <button
                  onClick={() => {
                    setLoginMethod("password");
                    setOtpSent(false);
                    setOtpCode("");
                    clearMessages();
                  }}
                  className="flex-1 py-2.5 rounded-lg text-center text-sm font-medium transition-all"
                  style={{
                    backgroundColor: loginMethod === "password" ? "var(--card)" : "transparent",
                    color: loginMethod === "password" ? "var(--foreground)" : "var(--muted-foreground)",
                    boxShadow: loginMethod === "password" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  رمز عبور
                </button>
                <button
                  onClick={() => {
                    setLoginMethod("otp");
                    clearMessages();
                  }}
                  className="flex-1 py-2.5 rounded-lg text-center text-sm font-medium transition-all"
                  style={{
                    backgroundColor: loginMethod === "otp" ? "var(--card)" : "transparent",
                    color: loginMethod === "otp" ? "var(--foreground)" : "var(--muted-foreground)",
                    boxShadow: loginMethod === "otp" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  کد یک‌بارمصرف
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <label
                  style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}
                >
                  شماره تلفن
                </label>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: "var(--input-background)" }}
                >
                  <Phone size={18} color="var(--muted-foreground)" />
                  <input
                    type="tel"
                    dir="ltr"
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={toPersianNumber(loginPhone)}
                    onChange={(e) => setLoginPhone(toEnglishNumber(e.target.value))}
                    className="flex-1 bg-transparent outline-none"
                    style={{
                      color: "var(--foreground)",
                      fontSize: "0.9rem",
                      fontFamily: "'Vazirmatn', sans-serif",
                    }}
                  />
                </div>
              </div>

              {loginMethod === "password" ? (
                <>
                  <div className="flex flex-col gap-3">
                    <label
                      style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}
                    >
                      رمز عبور
                    </label>
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ backgroundColor: "var(--input-background)" }}
                    >
                      <button type="button" onClick={() => togglePassword("login")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                        {showPasswords["login"] ? <EyeOff size={18} color="var(--muted-foreground)" /> : <Eye size={18} color="var(--muted-foreground)" />}
                      </button>
                      <input
                        type={showPasswords["login"] ? "text" : "password"}
                        dir="ltr"
                        placeholder="••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="flex-1 bg-transparent outline-none"
                        style={{
                          color: "var(--foreground)",
                          fontSize: "0.9rem",
                          fontFamily: "'Vazirmatn', sans-serif",
                        }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={switchToForgot}
                    className="text-left self-start"
                    style={{ fontSize: "0.8rem", color: "var(--primary)" }}
                  >
                    رمز عبور خود را فراموش کرده‌اید؟
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  {!otpSent ? (
                    <button
                      onClick={handleSendOtp}
                      disabled={otpLoading}
                      className="w-full py-4 rounded-2xl text-white transition-all active:scale-95 disabled:opacity-50"
                      style={{
                        backgroundColor: "var(--primary)",
                        fontSize: "1rem",
                        fontWeight: 600,
                        fontFamily: "'Vazirmatn', sans-serif",
                      }}
                    >
                      {otpLoading ? "در حال ارسال..." : "ارسال کد تأیید"}
                    </button>
                  ) : (
                    <>
                      <label
                        style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}
                      >
                        کد تأیید
                      </label>
                      <div
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ backgroundColor: "var(--input-background)" }}
                      >
                        <Lock size={18} color="var(--muted-foreground)" />
                        <input
                          type="text"
                          dir="ltr"
                          placeholder="000000"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          maxLength={6}
                          className="flex-1 bg-transparent outline-none"
                          style={{
                            color: "var(--foreground)",
                            fontSize: "0.9rem",
                            fontFamily: "'Vazirmatn', sans-serif",
                            letterSpacing: "0.5em",
                          }}
                        />
                      </div>
                      <button
                        onClick={handleSendOtp}
                        disabled={otpLoading}
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--primary)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        ارسال مجدد کد
                      </button>
                    </>
                  )}
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl text-sm"
                  style={{
                    backgroundColor: "#FDEDEC",
                    color: "#C0392B",
                    border: "1px solid #F5C6CB",
                  }}
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl text-sm"
                  style={{
                    backgroundColor: "#EAFAF1",
                    color: "#27AE60",
                    border: "1px solid #A3E4D7",
                  }}
                >
                  {success}
                </motion.div>
              )}

              {loginMethod !== "otp" || otpSent ? (
                <button
                  onClick={loginMethod === "password" ? handleLogin : handleVerifyOtp}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl text-white transition-all active:scale-95 disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--primary)",
                    fontSize: "1rem",
                    fontWeight: 600,
                    fontFamily: "'Vazirmatn', sans-serif",
                  }}
                >
                  {loading ? "..." : loginMethod === "password" ? "ورود" : "تأیید کد"}
                </button>
              ) : null}

              <div className="flex items-center gap-3 my-1">
                <div
                  className="flex-1 h-px"
                  style={{ backgroundColor: "var(--border)" }}
                />
                <span
                  style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}
                >
                  یا
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ backgroundColor: "var(--border)" }}
                />
              </div>

              <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", textAlign: "center", marginBottom: "-8px" }}>
                حساب کاربری ندارید؟
              </p>
              <button
                onClick={switchToRegister}
                className="w-full py-3.5 rounded-2xl transition-all active:scale-95"
                style={{
                  backgroundColor: "var(--card)",
                  border: "2px solid var(--border)",
                  color: "var(--foreground)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  fontFamily: "'Vazirmatn', sans-serif",
                }}
              >
                ثبت‌نام
              </button>
            </motion.div>
          )}

          {mode === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4 mt-6"
            >
              {regStep === "form" && (
                <>
                  <div className="flex flex-col gap-3">
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
                      نام و نام خانوادگی
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--input-background)" }}>
                      <User size={18} color="var(--muted-foreground)" />
                      <input type="text" placeholder="مثال: فرگل" value={regName} onChange={(e) => setRegName(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ color: "var(--foreground)", fontSize: "0.9rem", fontFamily: "'Vazirmatn', sans-serif" }} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
                      شماره تلفن
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--input-background)" }}>
                      <Phone size={18} color="var(--muted-foreground)" />
                      <input type="tel" dir="ltr" placeholder="۰۹۱۲۳۴۵۶۷۸۹" value={toPersianNumber(regPhone)} onChange={(e) => setRegPhone(toEnglishNumber(e.target.value))} className="flex-1 bg-transparent outline-none" style={{ color: "var(--foreground)", fontSize: "0.9rem", fontFamily: "'Vazirmatn', sans-serif" }} />
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl text-sm" style={{ backgroundColor: "#FDEDEC", color: "#C0392B", border: "1px solid #F5C6CB" }}>
                      {error}
                    </motion.div>
                  )}

                  <button onClick={handleRegSendOtp} disabled={regOtpLoading} className="w-full py-4 rounded-2xl text-white transition-all active:scale-95 disabled:opacity-50" style={{ backgroundColor: "var(--primary)", fontSize: "1rem", fontWeight: 600, fontFamily: "'Vazirmatn', sans-serif" }}>
                    {regOtpLoading ? "..." : "ارسال کد تأیید"}
                  </button>
                </>
              )}

              {regStep === "otp" && (
                <>
                  <button onClick={() => { setRegStep("form"); setRegOtpCode(""); clearMessages(); }} style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer", textAlign: "right", padding: "4px 0", display: "flex", alignItems: "center", gap: "4px" }}>
                    <ArrowLeft size={16} /> تغییر شماره تلفن
                  </button>

                  <div className="flex flex-col gap-3">
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
                      کد تأیید
                    </label>
                    <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                      کد ۶ رقمی به شماره {toPersianNumber(regPhone)} ارسال شد
                    </p>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--input-background)" }}>
                      <Lock size={18} color="var(--muted-foreground)" />
                      <input type="text" dir="ltr" placeholder="000000" value={regOtpCode} onChange={(e) => setRegOtpCode(e.target.value)} maxLength={6} className="flex-1 bg-transparent outline-none" style={{ color: "var(--foreground)", fontSize: "0.9rem", fontFamily: "'Vazirmatn', sans-serif", letterSpacing: "0.5em" }} />
                    </div>
                  </div>

                  {success && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl text-sm" style={{ backgroundColor: "#EAFAF1", color: "#27AE60", border: "1px solid #A3E4D7" }}>
                      {success}
                    </motion.div>
                  )}

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl text-sm" style={{ backgroundColor: "#FDEDEC", color: "#C0392B", border: "1px solid #F5C6CB" }}>
                      {error}
                    </motion.div>
                  )}

                  <button onClick={handleRegVerifyOtp} disabled={loading} className="w-full py-4 rounded-2xl text-white transition-all active:scale-95 disabled:opacity-50" style={{ backgroundColor: "var(--primary)", fontSize: "1rem", fontWeight: 600, fontFamily: "'Vazirmatn', sans-serif" }}>
                    {loading ? "..." : "تأیید کد"}
                  </button>

                  <button onClick={handleRegSendOtp} disabled={regOtpLoading} style={{ fontSize: "0.8rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                    ارسال مجدد کد
                  </button>
                </>
              )}

              {regStep === "password" && (
                <>
                  {success && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl text-sm" style={{ backgroundColor: "#EAFAF1", color: "#27AE60", border: "1px solid #A3E4D7" }}>
                      ✓ {success}
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-3">
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
                      رمز عبور
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--input-background)" }}>
                      <button type="button" onClick={() => togglePassword("reg")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                        {showPasswords["reg"] ? <EyeOff size={18} color="var(--muted-foreground)" /> : <Eye size={18} color="var(--muted-foreground)" />}
                      </button>
                      <input type={showPasswords["reg"] ? "text" : "password"} dir="ltr" placeholder="حداقل ۴ کاراکتر" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ color: "var(--foreground)", fontSize: "0.9rem", fontFamily: "'Vazirmatn', sans-serif" }} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
                      تأیید رمز عبور
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--input-background)" }}>
                      <button type="button" onClick={() => togglePassword("regConfirm")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                        {showPasswords["regConfirm"] ? <EyeOff size={18} color="var(--muted-foreground)" /> : <Eye size={18} color="var(--muted-foreground)" />}
                      </button>
                      <input type={showPasswords["regConfirm"] ? "text" : "password"} dir="ltr" placeholder="••••••" value={regPasswordConfirm} onChange={(e) => setRegPasswordConfirm(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ color: "var(--foreground)", fontSize: "0.9rem", fontFamily: "'Vazirmatn', sans-serif" }} />
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl text-sm" style={{ backgroundColor: "#FDEDEC", color: "#C0392B", border: "1px solid #F5C6CB" }}>
                      {error}
                    </motion.div>
                  )}

                  <button onClick={handleRegister} disabled={loading} className="w-full py-4 rounded-2xl text-white transition-all active:scale-95 disabled:opacity-50" style={{ backgroundColor: "var(--primary)", fontSize: "1rem", fontWeight: 600, fontFamily: "'Vazirmatn', sans-serif" }}>
                    {loading ? "..." : "ثبت‌نام"}
                  </button>
                </>
              )}

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
                <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>یا</span>
                <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
              </div>

              <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", textAlign: "center", marginBottom: "-8px" }}>
                حساب کاربری دارید؟
              </p>
              <button onClick={switchToLogin} className="w-full py-3.5 rounded-2xl transition-all active:scale-95" style={{ backgroundColor: "var(--card)", border: "2px solid var(--border)", color: "var(--foreground)", fontSize: "0.9rem", fontWeight: 600, fontFamily: "'Vazirmatn', sans-serif" }}>
                ورود
              </button>
            </motion.div>
          )}

          {mode === "forgot" && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4 mt-6"
            >
              {forgotStep === "phone" && (
                <>
                  <div className="flex flex-col gap-3">
                    <label
                      style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}
                    >
                      شماره تلفن
                    </label>
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ backgroundColor: "var(--input-background)" }}
                    >
                      <Phone size={18} color="var(--muted-foreground)" />
                      <input
                        type="tel"
                        dir="ltr"
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        value={toPersianNumber(forgotPhone)}
                        onChange={(e) => setForgotPhone(toEnglishNumber(e.target.value))}
                        className="flex-1 bg-transparent outline-none"
                        style={{
                          color: "var(--foreground)",
                          fontSize: "0.9rem",
                          fontFamily: "'Vazirmatn', sans-serif",
                        }}
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl text-sm"
                      style={{
                        backgroundColor: "#FDEDEC",
                        color: "#C0392B",
                        border: "1px solid #F5C6CB",
                      }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    onClick={handleForgotSendCode}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl text-white transition-all active:scale-95 disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--primary)",
                      fontSize: "1rem",
                      fontWeight: 600,
                      fontFamily: "'Vazirmatn', sans-serif",
                    }}
                  >
                    {loading ? "..." : "ارسال کد تأیید"}
                  </button>
                </>
              )}

              {forgotStep === "code" && (
                <>
                  <div className="flex flex-col gap-3">
                    <label
                      style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}
                    >
                      کد تأیید
                    </label>
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ backgroundColor: "var(--input-background)" }}
                    >
                      <Lock size={18} color="var(--muted-foreground)" />
                      <input
                        type="text"
                        dir="ltr"
                        placeholder="000000"
                        value={forgotCode}
                        onChange={(e) => setForgotCode(e.target.value)}
                        maxLength={6}
                        className="flex-1 bg-transparent outline-none"
                        style={{
                          color: "var(--foreground)",
                          fontSize: "0.9rem",
                          fontFamily: "'Vazirmatn', sans-serif",
                          letterSpacing: "0.5em",
                        }}
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl text-sm"
                      style={{
                        backgroundColor: "#FDEDEC",
                        color: "#C0392B",
                        border: "1px solid #F5C6CB",
                      }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    onClick={handleForgotVerifyCode}
                    className="w-full py-4 rounded-2xl text-white transition-all active:scale-95"
                    style={{
                      backgroundColor: "var(--primary)",
                      fontSize: "1rem",
                      fontWeight: 600,
                      fontFamily: "'Vazirmatn', sans-serif",
                    }}
                  >
                    تأیید کد
                  </button>
                </>
              )}

              {forgotStep === "password" && (
                <>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl text-sm"
                      style={{
                        backgroundColor: "#EAFAF1",
                        color: "#27AE60",
                        border: "1px solid #A3E4D7",
                      }}
                    >
                      {success}
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-3">
                    <label
                      style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}
                    >
                      رمز عبور جدید
                    </label>
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ backgroundColor: "var(--input-background)" }}
                    >
                      <button type="button" onClick={() => togglePassword("forgot")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                        {showPasswords["forgot"] ? <EyeOff size={18} color="var(--muted-foreground)" /> : <Eye size={18} color="var(--muted-foreground)" />}
                      </button>
                      <input
                        type={showPasswords["forgot"] ? "text" : "password"}
                        dir="ltr"
                        placeholder="حداقل ۴ کاراکتر"
                        value={forgotPassword}
                        onChange={(e) => setForgotPassword(e.target.value)}
                        className="flex-1 bg-transparent outline-none"
                        style={{
                          color: "var(--foreground)",
                          fontSize: "0.9rem",
                          fontFamily: "'Vazirmatn', sans-serif",
                        }}
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl text-sm"
                      style={{
                        backgroundColor: "#FDEDEC",
                        color: "#C0392B",
                        border: "1px solid #F5C6CB",
                      }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    onClick={handleForgotNewPassword}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl text-white transition-all active:scale-95 disabled:opacity-50"
                    style={{
                      backgroundColor: "#27AE60",
                      fontSize: "1rem",
                      fontWeight: 600,
                      fontFamily: "'Vazirmatn', sans-serif",
                    }}
                  >
                    {loading ? "..." : "تغییر رمز عبور"}
                  </button>
                </>
              )}

              <button
                onClick={switchToLogin}
                className="w-full py-3.5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--card)",
                  border: "2px solid var(--border)",
                  color: "var(--muted-foreground)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  fontFamily: "'Vazirmatn', sans-serif",
                }}
              >
                <ArrowLeft size={16} />
                بازگشت به ورود
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
