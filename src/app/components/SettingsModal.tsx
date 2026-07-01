import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Eye, EyeOff, Check, User, AlertTriangle } from "lucide-react";
import { UserData, api } from "../api";

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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (!isOpen) return null;

  const handleSaveName = async () => {
    if (!name.trim()) {
      setNameError("نام نمی‌تواند خالی باشد");
      return;
    }
    if (name.trim() === user.full_name) {
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
      return;
    }
    setSavingName(true);
    setNameError("");
    try {
      onUpdateUser(name.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } catch {
      setNameError("خطا در ذخیره نام");
    } finally {
      setSavingName(false);
    }
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

              {/* Change Name */}
              <div className="mb-6">
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>
                  تغییر نام
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--muted)" }}
                  >
                    <User size={16} color="var(--primary)" />
                  </div>
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
                </div>
                {nameError && (
                  <p style={{ fontSize: "0.75rem", color: "#C0392B", marginBottom: 6 }}>{nameError}</p>
                )}
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="w-full py-2.5 rounded-xl text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "var(--primary)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    fontFamily: "'Vazirmatn', sans-serif",
                    opacity: savingName ? 0.6 : 1,
                  }}
                >
                  {savingName ? (
                    "در حال ذخیره..."
                  ) : nameSaved ? (
                    <><Check size={16} /> ذخیره شد</>
                  ) : (
                    "ذخیره نام"
                  )}
                </button>
              </div>

              <div style={{ height: 1, backgroundColor: "var(--border)", marginBottom: 6 }} />

              {/* Change Password */}
              <div className="mb-2">
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 8, marginTop: 16 }}>
                  تغییر رمز عبور
                </p>

                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      placeholder="رمز عبور فعلی"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl outline-none"
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
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="رمز عبور جدید"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl outline-none"
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
                      onClick={() => setShowNew(!showNew)}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="تکرار رمز عبور جدید"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl outline-none"
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
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <p style={{ fontSize: "0.75rem", color: "#C0392B", marginTop: 6 }}>{passwordError}</p>
                )}

                <button
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                  className="w-full py-2.5 rounded-xl text-white transition-all active:scale-95 flex items-center justify-center gap-2 mt-3"
                  style={{
                    backgroundColor: "var(--primary)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    fontFamily: "'Vazirmatn', sans-serif",
                    opacity: savingPassword ? 0.6 : 1,
                  }}
                >
                  {savingPassword ? (
                    "در حال ذخیره..."
                  ) : passwordSaved ? (
                    <><Check size={16} /> رمز عبور تغییر کرد</>
                  ) : (
                    "تغییر رمز عبور"
                  )}
                </button>
              </div>

              <div style={{ height: 1, backgroundColor: "var(--border)", marginTop: 6, marginBottom: 16 }} />

              {/* Delete Account */}
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#C0392B", marginBottom: 8 }}>
                  حذف حساب
                </p>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2.5 rounded-xl text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: "#C0392B",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      fontFamily: "'Vazirmatn', sans-serif",
                    }}
                  >
                    <AlertTriangle size={16} />
                    حذف حساب کاربری
                  </button>
                ) : (
                  <div
                    className="rounded-xl p-4"
                    style={{ backgroundColor: "#FDEDEC", border: "1px solid #C0392B" }}
                  >
                    <p style={{ fontSize: "0.82rem", color: "#C0392B", lineHeight: 1.7, marginBottom: 12 }}>
                      آیا مطمئن هستید؟ تمام اطلاعات شما شامل پروفایل، چک‌لیست و اقدامات برای همیشه حذف خواهد شد.
                    </p>
                    {deleteError && (
                      <p style={{ fontSize: "0.75rem", color: "#C0392B", marginBottom: 8 }}>{deleteError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="flex-1 py-2.5 rounded-xl text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: "#C0392B",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          fontFamily: "'Vazirmatn', sans-serif",
                          opacity: deleting ? 0.6 : 1,
                        }}
                      >
                        {deleting ? "در حال حذف..." : "تأیید حذف"}
                      </button>
                      <button
                        onClick={() => { setShowDeleteConfirm(false); setDeleteError(""); }}
                        disabled={deleting}
                        className="flex-1 py-2.5 rounded-xl transition-all active:scale-95"
                        style={{
                          backgroundColor: "var(--muted)",
                          color: "var(--foreground)",
                          fontSize: "0.82rem",
                          fontWeight: 600,
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
