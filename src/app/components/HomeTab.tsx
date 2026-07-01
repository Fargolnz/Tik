import { motion } from "motion/react";
import {
  ShieldCheck,
  ClipboardList,
  Zap,
  TrendingUp,
  ChevronLeft,
  Clock,
} from "lucide-react";
import { UserData } from "../api";
import { UserProfile, ChecklistItem, ActionItem, toPersianNumber } from "./data";

interface HomeTabProps {
  user: UserData;
  profile: UserProfile | null;
  checklist: ChecklistItem[];
  actions: ActionItem[];
  onNavigateToChecklist: () => void;
  onNavigateToActions: () => void;
  onNavigateToQuestionnaire: () => void;
}

export function HomeTab({
  user,
  profile,
  checklist,
  actions,
  onNavigateToChecklist,
  onNavigateToActions,
  onNavigateToQuestionnaire,
}: HomeTabProps) {
  const checklistProgress = checklist.length
    ? Math.round((checklist.filter((i) => i.checked).length / checklist.length) * 100)
    : 0;
  const actionsProgress = actions.length
    ? Math.round((actions.filter((a) => a.checked).length / actions.length) * 100)
    : 0;
  const overallScore = Math.round((checklistProgress + actionsProgress) / 2);
  const remainingItems = checklist.filter((i) => !i.checked).length;
  const remainingActions = actions.filter((a) => !a.checked).length;

  return (
    <div
      className="flex flex-col h-full bg-background"
      dir="rtl"
      style={{ fontFamily: "'Vazirmatn', sans-serif" }}
    >
      <div
        className="px-5 pt-8 pb-6"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}>
              خوش آمدید
            </p>
            <h1
              style={{
                color: "white",
                fontSize: "1.2rem",
                fontWeight: 700,
              }}
            >
              {user.full_name}
            </h1>
          </div>
          <motion.div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <ShieldCheck size={24} color="white" />
          </motion.div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {!profile ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-12"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <ClipboardList size={36} color="var(--muted-foreground)" />
            </div>
            <div className="text-center">
              <p
                style={{ fontSize: "1rem", fontWeight: 600, color: "var(--foreground)" }}
              >
                پرسشنامه خانواده را تکمیل کنید
              </p>
              <p
                className="mt-1"
                style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}
              >
                برای دریافت چک‌لیست شخصی، ابتدا اطلاعات خانواده خود را وارد کنید
              </p>
            </div>
            <button
              onClick={onNavigateToQuestionnaire}
              className="px-8 py-3.5 rounded-2xl text-white transition-all active:scale-95"
              style={{
                backgroundColor: "var(--primary)",
                fontSize: "0.95rem",
                fontWeight: 600,
                fontFamily: "'Vazirmatn', sans-serif",
              }}
            >
              شروع پرسشنامه
            </button>
          </motion.div>
        ) : (
          <>
            {/* Preparedness score */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 mb-4"
              style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} color="var(--primary)" />
                  <span
                    style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}
                  >
                    امتیاز آمادگی
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color:
                      overallScore >= 70
                        ? "#27AE60"
                        : overallScore >= 40
                        ? "#E67E22"
                        : "#C0392B",
                  }}
                >
                  {toPersianNumber(overallScore)}%
                </span>
              </div>
              <div
                className="w-full h-2.5 rounded-full"
                style={{ backgroundColor: "var(--muted)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallScore}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{
                    backgroundColor:
                      overallScore >= 70
                        ? "#27AE60"
                        : overallScore >= 40
                        ? "#E67E22"
                        : "#C0392B",
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                  چک‌لیست: {toPersianNumber(checklistProgress)}%
                </span>
                <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                  اقدامات: {toPersianNumber(actionsProgress)}%
                </span>
              </div>
            </motion.div>

            {/* Remaining items */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-3 mb-4"
            >
              <button
                onClick={onNavigateToChecklist}
                className="flex-1 rounded-2xl p-4 text-right transition-all active:scale-95"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: "#EBF5FB" }}
                >
                  <ClipboardList size={20} color="#2980B9" />
                </div>
                <p
                  style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}
                >
                  باقی‌مانده چک‌لیست
                </p>
                <p
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: remainingItems > 0 ? "#C0392B" : "#27AE60",
                  }}
                >
                  {toPersianNumber(remainingItems)}
                </p>
              </button>
              <button
                onClick={onNavigateToActions}
                className="flex-1 rounded-2xl p-4 text-right transition-all active:scale-95"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: "#EAFAF1" }}
                >
                  <Zap size={20} color="#27AE60" />
                </div>
                <p
                  style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}
                >
                  اقدامات باقی‌مانده
                </p>
                <p
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: remainingActions > 0 ? "#E67E22" : "#27AE60",
                  }}
                >
                  {toPersianNumber(remainingActions)}
                </p>
              </button>
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}
                >
                  اقدامات سریع
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={onNavigateToChecklist}
                  className="flex items-center justify-between p-3 rounded-xl transition-all"
                  style={{ backgroundColor: "var(--muted)" }}
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList size={16} color="var(--muted-foreground)" />
                    <span style={{ fontSize: "0.82rem", color: "var(--foreground)" }}>
                      مشاهده چک‌لیست
                    </span>
                  </div>
                  <ChevronLeft size={16} color="var(--muted-foreground)" />
                </button>
                <button
                  onClick={onNavigateToActions}
                  className="flex items-center justify-between p-3 rounded-xl transition-all"
                  style={{ backgroundColor: "var(--muted)" }}
                >
                  <div className="flex items-center gap-3">
                    <Zap size={16} color="var(--muted-foreground)" />
                    <span style={{ fontSize: "0.82rem", color: "var(--foreground)" }}>
                      مشاهده اقدامات
                    </span>
                  </div>
                  <ChevronLeft size={16} color="var(--muted-foreground)" />
                </button>
              </div>
            </motion.div>

            {/* Recent activity */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-4"
              style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} color="var(--muted-foreground)" />
                <span
                  style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}
                >
                  خلاصه وضعیت
                </span>
              </div>
              <div
                className="flex flex-col gap-2"
                style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}
              >
                <p>
                  {toPersianNumber(checklist.filter((i) => i.checked).length)} از{" "}
                  {toPersianNumber(checklist.length)} آیتم چک‌لیست تهیه شده
                </p>
                <p>
                  {toPersianNumber(actions.filter((a) => a.checked).length)} از{" "}
                  {toPersianNumber(actions.length)} اقدام انجام شده
                </p>
                <p>
                  خانواده {toPersianNumber(profile.familyCount)} نفره
                  {profile.hasChild && ` | ${toPersianNumber(profile.childCount)} کودک`}
                  {profile.hasElderly && ` | ${toPersianNumber(profile.elderlyCount)} سالمند`}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
