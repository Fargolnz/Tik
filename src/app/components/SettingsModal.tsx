import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Check, Eye, EyeOff, ShieldCheck, X } from "lucide-react";
import { UserData, api } from "../api";
import { toPersianNumber } from "./data";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData;
  onUpdateUser: (fullName: string) => void;
  onLogout: () => void;
}

export function SettingsModal({ isOpen, onClose, user, onUpdateUser, onLogout }: SettingsModalProps) {
  const [name, setName] = useState(user.full_name);
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordMode, setPasswordMode] = useState<"change" | "forgot">("change");
  const [forgotStep, setForgotStep] = useState<"send" | "verify">("send");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpNewPassword, setOtpNewPassword] = useState("");
  const [otpConfirmPassword, setOtpConfirmPassword] = useState("");
  const [showOtpNew, setShowOtpNew] = useState(false);
  const [showOtpConfirm, setShowOtpConfirm] = useState(false);
  const [savingForgot, setSavingForgot] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSaved, setForgotSaved] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (!isOpen) return null;

  const handleSaveName = () => {
    if (!name.trim()) return;
    if (name.trim() !== user.full_name) {
      onUpdateUser(name.trim());
    }
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("همه فیلدها را پر کنید");
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError("رمز عبور جدید باید حداقل ۴ کاراکتر باشد");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("رمز عبور جدید و تکرار آن مطابقت ندارند");
      return;
    }
    setSavingPassword(true);
    setPasswordError("");
    try {
      await api.auth.changePassword({ current_password: currentPassword, new_password: newPassword });
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (e: any) {
      setPasswordError(e.message || "خطا در تغییر رمز عبور");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setForgotError("");
    try {
      await api.auth.sendOtp({ phone: user.phone });
      setForgotStep("verify");
    } catch (e: any) {
      setForgotError(e.message || "خطا در ارسال کد");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!otpCode || !otpNewPassword || !otpConfirmPassword) {
      setForgotError("همه فیلدها را پر کنید");
      return;
    }
    if (otpNewPassword.length < 4) {
      setForgotError("رمز عبور جدید باید حداقل ۴ کاراکتر باشد");
      return;
    }
    if (otpNewPassword !== otpConfirmPassword) {
      setForgotError("رمز عبور جدید و تکرار آن مطابقت ندارند");
      return;
    }
    setSavingForgot(true);
    setForgotError("");
    try {
      await api.auth.forgotPassword({ phone: user.phone, code: otpCode, new_password: otpNewPassword });
      setForgotSaved(true);
      setOtpCode("");
      setOtpNewPassword("");
      setOtpConfirmPassword("");
      setTimeout(() => {
        setForgotSaved(false);
        setForgotStep("send");
        setPasswordMode("change");
      }, 2000);
    } catch (e: any) {
      setForgotError(e.message || "خطا در تغییر رمز عبور");
    } finally {
      setSavingForgot(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await api.auth.deleteAccount();
      onClose();
      onLogout();
    } catch (e: any) {
      setDeleteError(e.message || "خطا در حذف حساب");
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-3xl p-6"
              style={{
                backgroundColor: "var(--card)",
                fontFamily: "'Vazirmatn', sans-serif",
                maxHeight: "85vh",
                overflowY: "auto",
              }}
              dir="rtl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)" }}>
                  تنظیمات
                </h3>
                <button onClick={onClose}>
                  <X size={20} color="var(--muted-foreground)" />
                </button>
              </div>

              {/* Name */}
              <div className="mb-5">
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>
                  نام و نام خانوادگی
                </p>
                <div className="flex items-center gap-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl outline-none"
                    style={{
                      backgroundColor: "var(--input-background)",
                      color: "var(--foreground)",
                      fontSize: "0.9rem",
                      fontFamily: "'Vazirmatn', sans-serif",
                      border: "1px solid var(--border)",
                    }}
                    dir="rtl"
                  />
                  <button
                    onClick={handleSaveName}
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                    style={{
                      backgroundColor: nameSaved ? "#27AE60" : "var(--primary)",
                      color: "white",
                    }}
                  >
                    {nameSaved ? <Check size={16} /> : <Check size={16} />}
                  </button>
                </div>
                {nameError && (
                  <p style={{ fontSize: "0.75rem", color: "#C0392B", marginTop: 4 }}>{nameError}</p>
                )}
              </div>

              <div style={{ height: 1, backgroundColor: "var(--border)", marginBottom: 5 }} />

              {/* Password */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3" style={{ marginTop: 12 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
                    رمز عبور
                  </p>
                  <button
                    onClick={() => { setPasswordMode(passwordMode === "change" ? "forgot" : "change"); setForgotError(""); setForgotStep("send"); }}
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--muted-foreground)",
                      fontWeight: 500,
                      background: "none",
                      border: "none",
                      padding: "2px 6px",
                      fontFamily: "'Vazirmatn', sans-serif",
                      cursor: "pointer",
                      textDecoration: "underline",
                      textUnderlineOffset: 2,
                    }}
                  >
                    {passwordMode === "change" ? "فراموشی رمز؟" : "تغییر با رمز فعلی"}
                  </button>
                </div>

                {passwordMode === "change" ? (
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <input
                        type={showCurrent ? "text" : "password"}
                        placeholder="رمز عبور فعلی"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl outline-none text-sm"
                        style={{
                          backgroundColor: "var(--input-background)",
                          color: "var(--foreground)",
                          fontFamily: "'Vazirmatn', sans-serif",
                          border: "1px solid var(--border)",
                        }}
                        dir="rtl"
                      />
                      <button
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        placeholder="رمز عبور جدید"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl outline-none text-sm"
                        style={{
                          backgroundColor: "var(--input-background)",
                          color: "var(--foreground)",
                          fontFamily: "'Vazirmatn', sans-serif",
                          border: "1px solid var(--border)",
                        }}
                        dir="rtl"
                      />
                      <button
                        onClick={() => setShowNew(!showNew)}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="تکرار رمز عبور جدید"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl outline-none text-sm"
                        style={{
                          backgroundColor: "var(--input-background)",
                          color: "var(--foreground)",
                          fontFamily: "'Vazirmatn', sans-serif",
                          border: "1px solid var(--border)",
                        }}
                        dir="rtl"
                      />
                      <button
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {passwordError && (
                      <p style={{ fontSize: "0.72rem", color: "#C0392B" }}>{passwordError}</p>
                    )}
                    {passwordSaved && (
                      <p style={{ fontSize: "0.72rem", color: "#27AE60" }}>رمز عبور تغییر کرد</p>
                    )}
                    <button
                      onClick={handleChangePassword}
                      disabled={savingPassword}
                      className="w-full py-2 rounded-xl transition-all active:scale-95 text-sm"
                      style={{
                        border: "1px solid #C0392B",
                        color: "#C0392B",
                        backgroundColor: "transparent",
                        fontWeight: 500,
                        fontFamily: "'Vazirmatn', sans-serif",
                        opacity: savingPassword ? 0.6 : 1,
                      }}
                    >
                      {savingPassword ? "در حال ذخیره..." : "تغییر رمز عبور"}
                    </button>
                  </div>
                ) : forgotStep === "send" ? (
                  <div>
                    <div
                      className="flex items-center gap-2 p-2.5 rounded-xl mb-2"
                      style={{ backgroundColor: "var(--muted)" }}
                    >
                      <ShieldCheck size={14} color="var(--muted-foreground)" />
                      <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                        کد تأیید به شماره {toPersianNumber(user.phone)} ارسال می‌شود
                      </span>
                    </div>
                    {forgotError && (
                      <p style={{ fontSize: "0.72rem", color: "#C0392B", marginBottom: 4 }}>{forgotError}</p>
                    )}
                    <button
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                      className="w-full py-2 rounded-xl transition-all active:scale-95 text-sm"
                      style={{
                        border: "1px solid #C0392B",
                        color: "#C0392B",
                        backgroundColor: "transparent",
                        fontWeight: 500,
                        fontFamily: "'Vazirmatn', sans-serif",
                        opacity: sendingOtp ? 0.6 : 1,
                      }}
                    >
                      {sendingOtp ? "در حال ارسال..." : "ارسال کد تأیید"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <input
                      placeholder="کد تأیید"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl outline-none text-sm"
                      style={{
                        backgroundColor: "var(--input-background)",
                        color: "var(--foreground)",
                        fontFamily: "'Vazirmatn', sans-serif",
                        border: "1px solid var(--border)",
                      }}
                      dir="rtl"
                    />
                    <div className="relative">
                      <input
                        type={showOtpNew ? "text" : "password"}
                        placeholder="رمز عبور جدید"
                        value={otpNewPassword}
                        onChange={(e) => setOtpNewPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl outline-none text-sm"
                        style={{
                          backgroundColor: "var(--input-background)",
                          color: "var(--foreground)",
                          fontFamily: "'Vazirmatn', sans-serif",
                          border: "1px solid var(--border)",
                        }}
                        dir="rtl"
                      />
                      <button
                        onClick={() => setShowOtpNew(!showOtpNew)}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {showOtpNew ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showOtpConfirm ? "text" : "password"}
                        placeholder="تکرار رمز عبور جدید"
                        value={otpConfirmPassword}
                        onChange={(e) => setOtpConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl outline-none text-sm"
                        style={{
                          backgroundColor: "var(--input-background)",
                          color: "var(--foreground)",
                          fontFamily: "'Vazirmatn', sans-serif",
                          border: "1px solid var(--border)",
                        }}
                        dir="rtl"
                      />
                      <button
                        onClick={() => setShowOtpConfirm(!showOtpConfirm)}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {showOtpConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {forgotError && (
                      <p style={{ fontSize: "0.72rem", color: "#C0392B" }}>{forgotError}</p>
                    )}
                    {forgotSaved && (
                      <p style={{ fontSize: "0.72rem", color: "#27AE60" }}>رمز عبور تغییر کرد</p>
                    )}
                    <button
                      onClick={handleForgotPassword}
                      disabled={savingForgot}
                      className="w-full py-2 rounded-xl transition-all active:scale-95 text-sm"
                      style={{
                        border: "1px solid #C0392B",
                        color: "#C0392B",
                        backgroundColor: "transparent",
                        fontWeight: 500,
                        fontFamily: "'Vazirmatn', sans-serif",
                        opacity: savingForgot ? 0.6 : 1,
                      }}
                    >
                      {savingForgot ? "در حال ذخیره..." : "تغییر رمز عبور"}
                    </button>
                  </div>
                )}
              </div>

              <div style={{ height: 1, backgroundColor: "var(--border)", marginBottom: 16 }} />

              {/* Delete Account */}
              <div>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                    style={{
                      backgroundColor: "#C0392B",
                      color: "white",
                      fontWeight: 500,
                      fontFamily: "'Vazirmatn', sans-serif",
                    }}
                  >
                    <AlertTriangle size={14} />
                    حذف حساب کاربری
                  </button>
                ) : (
                  <div className="rounded-xl p-3" style={{ backgroundColor: "#FDEDEC", border: "1px solid #C0392B" }}>
                    <p style={{ fontSize: "0.78rem", color: "#C0392B", lineHeight: 1.6, marginBottom: 10 }}>
                      تمام اطلاعات شما برای همیشه حذف خواهد شد. این اقدام قابل بازگشت نیست.
                    </p>
                    {deleteError && (
                      <p style={{ fontSize: "0.72rem", color: "#C0392B", marginBottom: 6 }}>{deleteError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="flex-1 py-2 rounded-xl text-white text-sm transition-all active:scale-95"
                        style={{
                          backgroundColor: "#C0392B",
                          fontWeight: 500,
                          fontFamily: "'Vazirmatn', sans-serif",
                          opacity: deleting ? 0.6 : 1,
                        }}
                      >
                        {deleting ? "در حال حذف..." : "تأیید حذف"}
                      </button>
                      <button
                        onClick={() => { setShowDeleteConfirm(false); setDeleteError(""); }}
                        disabled={deleting}
                        className="flex-1 py-2 rounded-xl text-sm transition-all active:scale-95"
                        style={{
                          backgroundColor: "var(--muted)",
                          color: "var(--foreground)",
                          fontWeight: 500,
                          fontFamily: "'Vazirmatn', sans-serif",
                        }}
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
