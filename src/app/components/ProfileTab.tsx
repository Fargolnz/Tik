import { useState } from "react";
import { motion } from "motion/react";
import {
  User,
  Calendar,
  Users,
  Baby,
  Heart,
  Dog,
  Home,
  LogOut,
  RefreshCw,
  Settings,
  Edit3,
  ChevronLeft,
} from "lucide-react";
import { UserData } from "../api";
import { UserProfile, diseaseOptions, toPersianNumber } from "./data";

interface ProfileTabProps {
  user: UserData;
  profile: UserProfile | null;
  onLogout: () => void;
  onRegenerate: () => void;
  onUpdateUser: (fullName: string) => void;
  onNavigateToQuestionnaire: () => void;
  onOpenSettings: () => void;
}

export function ProfileTab({
  user,
  profile,
  onLogout,
  onRegenerate,
  onUpdateUser,
  onNavigateToQuestionnaire,
  onOpenSettings,
}: ProfileTabProps) {
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const getLivingTypeLabel = (type: string) => {
    switch (type) {
      case "apartment": return "آپارتمان";
      case "house": return "خانه ویلایی";
      case "villa": return "خانه روستایی";
      default: return "ثبت نشده";
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-background"
      dir="rtl"
      style={{ fontFamily: "'Vazirmatn', sans-serif" }}
    >
      {/* Header */}
      <div
        className="px-5 pt-8 pb-6"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <div className="flex items-center justify-between">
          <h1
            style={{ color: "white", fontSize: "1.25rem", fontWeight: 700 }}
          >
            پروفایل
          </h1>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <User size={22} color="white" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* User info card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <User size={28} color="var(--primary)" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>
                    {user.full_name}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", direction: "ltr", textAlign: "right" }}>
                    {user.phone}
                  </p>
                </div>
                <button
                  onClick={onOpenSettings}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90"
                  style={{ backgroundColor: "var(--muted)" }}
                >
                  <Settings size={15} color="var(--muted-foreground)" />
                </button>
              </div>
            </div>
          </div>

          <div
            className="flex items-center gap-2 p-3 rounded-xl"
            style={{ backgroundColor: "var(--muted)" }}
          >
            <Calendar size={14} color="var(--muted-foreground)" />
            <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
              عضویت از {new Date(user.created_at).toLocaleDateString("fa-IR")}
            </span>
          </div>
        </motion.div>

        {/* Household profile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={18} color="var(--primary)" />
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--foreground)" }}>
                پروفایل خانواده
              </span>
            </div>
            {profile && (
              <button
                onClick={onNavigateToQuestionnaire}
                className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                style={{ backgroundColor: "var(--muted)", color: "var(--primary)" }}
              >
                <Edit3 size={12} /> ویرایش
              </button>
            )}
          </div>

          {!profile ? (
            <div className="text-center py-4">
              <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                پرسشنامه خانواده تکمیل نشده
              </p>
              <button
                onClick={onNavigateToQuestionnaire}
                className="mt-3 px-5 py-2.5 rounded-xl text-white text-sm"
                style={{ backgroundColor: "var(--primary)" }}
              >
                تکمیل پرسشنامه
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Row icon={<Users size={15} />} label="تعداد اعضای خانواده" value={`${toPersianNumber(profile.familyCount)} نفر`} />
              <Row icon={<Baby size={15} />} label="کودکان" value={profile.hasChild ? `${toPersianNumber(profile.childCount)} نفر` : "ندارد"} />
              <Row icon={<Heart size={15} />} label="سالمندان" value={profile.hasElderly ? `${toPersianNumber(profile.elderlyCount)} نفر` : "ندارد"} />
              <Row icon={<Dog size={15} />} label="حیوان خانگی" value={profile.hasPet ? `${toPersianNumber(profile.petCount)} عدد` : "ندارد"} />
              <Row icon={<Home size={15} />} label="نوع مسکن" value={getLivingTypeLabel(profile.livingType)} />
              {profile.hasDisease && profile.diseases.length > 0 && (
                <div className="flex items-start gap-3 py-1.5">
                  <Heart size={15} color="var(--muted-foreground)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>بیماری‌ها: </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--foreground)" }}>
                      {profile.diseases.map((id) => diseaseOptions.find((d) => d.id === id)?.label).filter(Boolean).join("، ")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-2 mb-4"
        >
          {profile && (
            <button
              onClick={onRegenerate}
              className="flex items-center justify-between p-4 rounded-2xl transition-all active:scale-95"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#EBF5FB" }}
                >
                  <RefreshCw size={18} color="#2980B9" />
                </div>
                <div className="text-right">
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#2980B9" }}>
                    بازتولید چک‌لیست
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                    بر اساس اطلاعات جدید خانواده
                  </p>
                </div>
              </div>
              <ChevronLeft size={16} color="var(--muted-foreground)" />
            </button>
          )}

          <button
            onClick={() => setShowConfirmLogout(true)}
            className="flex items-center justify-between p-4 rounded-2xl transition-all active:scale-95"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#FDEDEC" }}
              >
                <LogOut size={18} color="#C0392B" />
              </div>
              <div className="text-right">
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#C0392B" }}>
                  خروج از حساب
                </p>
                <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                  از حساب خود خارج شوید
                </p>
              </div>
            </div>
            <ChevronLeft size={16} color="var(--muted-foreground)" />
          </button>
        </motion.div>

        {/* Logout confirmation */}
        {showConfirmLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="rounded-2xl p-6 w-full max-w-sm"
              style={{ backgroundColor: "var(--card)" }}
            >
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
                خروج از حساب
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginBottom: 20 }}>
                آیا مطمئن هستید؟ اطلاعات شما ذخیره خواهد ماند.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmLogout(false);
                    onLogout();
                  }}
                  className="flex-1 py-3 rounded-xl text-white"
                  style={{ backgroundColor: "#C0392B", fontFamily: "'Vazirmatn', sans-serif" }}
                >
                  خروج
                </button>
                <button
                  onClick={() => setShowConfirmLogout(false)}
                  className="flex-1 py-3 rounded-xl"
                  style={{ backgroundColor: "var(--muted)", color: "var(--foreground)", fontFamily: "'Vazirmatn', sans-serif" }}
                >
                  انصراف
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span style={{ color: "var(--muted-foreground)", flexShrink: 0, display: "flex" }}>
        {icon}
      </span>
      <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{label}:</span>
      <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--foreground)", marginRight: "auto" }}>
        {value}
      </span>
    </div>
  );
}
