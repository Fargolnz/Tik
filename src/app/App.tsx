import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, ClipboardList, Zap, RotateCcw } from "lucide-react";
import { SplashScreen } from "./components/SplashScreen";
import { Questionnaire } from "./components/Questionnaire";
import { ChecklistView } from "./components/ChecklistView";
import { ActionsView } from "./components/ActionsView";
import { DownloadModal } from "./components/DownloadModal";
import {
  UserProfile,
  ChecklistItem,
  ActionItem,
  generateChecklist,
  generateActions,
} from "./components/data";

type Screen = "splash" | "questionnaire" | "main";
type Tab = "checklist" | "actions";

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [activeTab, setActiveTab] = useState<Tab>("checklist");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [showDownload, setShowDownload] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleProfileComplete = (p: UserProfile) => {
    setGenerating(true);
    setTimeout(() => {
      setProfile(p);
      setChecklist(generateChecklist(p));
      setActions(generateActions(p));
      setGenerating(false);
      setScreen("main");
    }, 1800);
  };

  const handleReset = () => {
    setScreen("splash");
    setProfile(null);
    setChecklist([]);
    setActions([]);
  };

  return (
    <div
      className="size-full flex items-center justify-center"
      style={{ backgroundColor: "#E8E4DC", fontFamily: "'Vazirmatn', sans-serif" }}
    >
      {/* Mobile frame */}
      <div
        className="relative overflow-hidden flex flex-col"
        style={{
          width: "100%",
          maxWidth: "430px",
          height: "100%",
          maxHeight: "900px",
          backgroundColor: "var(--background)",
          boxShadow: "0 0 60px rgba(0,0,0,0.15)",
        }}
      >
        <AnimatePresence mode="wait">
          {screen === "splash" && (
            <motion.div
              key="splash"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
            >
              <SplashScreen onStart={() => setScreen("questionnaire")} />
            </motion.div>
          )}

          {screen === "questionnaire" && !generating && (
            <motion.div
              key="questionnaire"
              className="absolute inset-0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <Questionnaire onComplete={handleProfileComplete} />
            </motion.div>
          )}

          {generating && (
            <motion.div
              key="generating"
              className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-background"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              dir="rtl"
              style={{ fontFamily: "'Vazirmatn', sans-serif" }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <ShieldCheck size={32} color="white" />
              </motion.div>
              <div className="text-center">
                <p
                  style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)" }}
                >
                  در حال تهیه چک‌لیست شما...
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginTop: 6 }}>
                  آیتم‌ها بر اساس پروفایل خانواده شما
                </p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "var(--primary)" }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {screen === "main" && !generating && profile && (
            <motion.div
              key="main"
              className="absolute inset-0 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Main content */}
              <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {activeTab === "checklist" ? (
                    <motion.div
                      key="checklist"
                      className="absolute inset-0"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChecklistView
                        items={checklist}
                        onUpdate={setChecklist}
                        onDownload={() => setShowDownload(true)}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="actions"
                      className="absolute inset-0"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ActionsView
                        actions={actions}
                        onUpdate={setActions}
                        onDownload={() => setShowDownload(true)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom navigation */}
              <div
                className="flex items-center px-4 py-3 gap-2"
                style={{
                  backgroundColor: "var(--card)",
                  borderTop: "1px solid var(--border)",
                  paddingBottom: "max(12px, env(safe-area-inset-bottom))",
                }}
                dir="rtl"
              >
                <NavTab
                  active={activeTab === "checklist"}
                  onClick={() => setActiveTab("checklist")}
                  icon={<ClipboardList size={20} />}
                  label="چک‌لیست"
                  badge={checklist.filter((i) => !i.checked).length}
                />
                <NavTab
                  active={activeTab === "actions"}
                  onClick={() => setActiveTab("actions")}
                  icon={<Zap size={20} />}
                  label="اقدامات"
                  badge={actions.filter((a) => !a.checked).length}
                />
                <button
                  onClick={handleReset}
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all active:scale-90"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <RotateCcw size={20} />
                  <span style={{ fontSize: "0.7rem", fontFamily: "'Vazirmatn', sans-serif" }}>
                    شروع مجدد
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Download modal */}
        {profile && (
          <DownloadModal
            isOpen={showDownload}
            onClose={() => setShowDownload(false)}
            items={checklist}
            actions={actions}
            profile={profile}
            mode={activeTab}
          />
        )}
      </div>
    </div>
  );
}

function NavTab({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all active:scale-95 relative"
      style={{
        backgroundColor: active ? "var(--primary)" : "transparent",
        color: active ? "white" : "var(--muted-foreground)",
        fontFamily: "'Vazirmatn', sans-serif",
      }}
    >
      {icon}
      <span style={{ fontSize: "0.7rem", fontWeight: active ? 600 : 400 }}>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className="absolute top-1 left-1/2 w-4 h-4 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: active ? "rgba(255,255,255,0.3)" : "var(--primary)",
            color: "white",
            fontSize: "0.6rem",
            fontWeight: 700,
            transform: "translateX(8px)",
          }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}