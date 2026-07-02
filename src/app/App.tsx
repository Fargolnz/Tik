import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  ClipboardList,
  Zap,
  Home,
  User,
  Wrench,
  X,
  FileText,
  FileSpreadsheet,
  Globe,
} from "lucide-react";
import { SplashScreen } from "./components/SplashScreen";
import { AuthPage } from "./components/AuthPage";
import { Questionnaire } from "./components/Questionnaire";
import { ChecklistView } from "./components/ChecklistView";
import { ActionsView } from "./components/ActionsView";
import { HomeTab } from "./components/HomeTab";
import { ProfileTab } from "./components/ProfileTab";
import { ToolkitTab } from "./components/ToolkitTab";
import { SettingsModal } from "./components/SettingsModal";
import {
  UserProfile,
  ChecklistItem,
  ActionItem,
  generateChecklist,
  generateActions,
  toPersianNumber,
} from "./components/data";
import { api, getStoredToken, clearToken, UserData } from "./api";

type Screen = "splash" | "auth" | "questionnaire" | "main";
type Tab = "home" | "checklist" | "actions" | "profile" | "toolkit";

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [showDownload, setShowDownload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const token = getStoredToken();
    if (token) {
      api.auth
        .me()
        .then((res) => {
          setUser(res.user);
          return Promise.all([api.profile.get(), api.checklist.get(), api.actions.get()]);
        })
        .then(([profileRes, checklistRes, actionsRes]) => {
          if (profileRes.profile) {
            const p = profileRes.profile;
            setProfile({
              familyCount: p.familyCount,
              hasChild: Boolean(p.hasChild),
              childCount: p.childCount,
              hasElderly: Boolean(p.hasElderly),
              elderlyCount: p.elderlyCount,
              hasDisease: Boolean(p.hasDisease),
              diseases: Array.isArray(p.diseases) ? p.diseases : [],
              hasPet: Boolean(p.hasPet),
              petCount: p.petCount,
              livingType: p.livingType as UserProfile["livingType"],
              floor: p.floor,
              hasElevator: Boolean(p.hasElevator),
              hasToolsKnowledge: Boolean(p.hasToolsKnowledge),
              hasFirstAid: Boolean(p.hasFirstAid),
            });
          }
          setChecklist(
            checklistRes.items.map((i) => ({
              id: i.item_id,
              title: i.title,
              description: i.description,
              category: i.category,
              priority: i.priority as "high" | "medium" | "low",
              quantity: i.quantity,
              checked: Boolean(i.checked),
              customizable: Boolean(i.customizable),
            }))
          );
          setActions(
            actionsRes.items.map((a) => ({
              id: a.action_id,
              phase: a.phase as "before" | "during" | "after",
              title: a.title,
              description: a.description ?? "",
              priority: a.priority as "high" | "medium" | "low",
              checked: Boolean(a.checked),
            }))
          );
        })
        .catch(() => {
          clearToken();
        })
        .finally(() => {
          setLoadingData(false);
          setScreen("splash");
        });
    } else {
      setLoadingData(false);
      setScreen("splash");
    }
  }, []);

  const handleAuthenticated = () => {
    api.auth
      .me()
      .then((res) => {
        setUser(res.user);
        return Promise.all([api.profile.get(), api.checklist.get(), api.actions.get()]);
      })
      .then(([profileRes, checklistRes, actionsRes]) => {
        if (profileRes.profile) {
          const p = profileRes.profile;
          setProfile({
            familyCount: p.familyCount,
            hasChild: Boolean(p.hasChild),
            childCount: p.childCount,
            hasElderly: Boolean(p.hasElderly),
            elderlyCount: p.elderlyCount,
            hasDisease: Boolean(p.hasDisease),
            diseases: Array.isArray(p.diseases) ? p.diseases : [],
            hasPet: Boolean(p.hasPet),
            petCount: p.petCount,
            livingType: p.livingType as UserProfile["livingType"],
            floor: p.floor,
            hasElevator: Boolean(p.hasElevator),
            hasToolsKnowledge: Boolean(p.hasToolsKnowledge),
            hasFirstAid: Boolean(p.hasFirstAid),
          });
        }
        setChecklist(
          checklistRes.items.map((i) => ({
            id: i.item_id,
            title: i.title,
            description: i.description,
            category: i.category,
            priority: i.priority as "high" | "medium" | "low",
            quantity: i.quantity,
            checked: Boolean(i.checked),
            customizable: Boolean(i.customizable),
          }))
        );
        setActions(
          actionsRes.items.map((a) => ({
            id: a.action_id,
            phase: a.phase as "before" | "during" | "after",
            title: a.title,
            description: a.description ?? "",
            priority: a.priority as "high" | "medium" | "low",
            checked: Boolean(a.checked),
          }))
        );
      })
      .catch(() => {})
      .finally(() => {
        setScreen("main");
      });
  };

  const handleProfileComplete = async (p: UserProfile) => {
    setGenerating(true);
    setProfile(p);
    const cl = generateChecklist(p);
    const ac = generateActions(p);
    setChecklist(cl);
    setActions(ac);

    try {
      await api.profile.save({
        ...p,
        hasChild: p.hasChild ? 1 : 0,
        hasElderly: p.hasElderly ? 1 : 0,
        hasDisease: p.hasDisease ? 1 : 0,
        hasPet: p.hasPet ? 1 : 0,
        hasElevator: p.hasElevator ? 1 : 0,
        hasToolsKnowledge: p.hasToolsKnowledge ? 1 : 0,
        hasFirstAid: p.hasFirstAid ? 1 : 0,
      });
      await api.checklist.save(
        cl.map((i) => ({
          item_id: i.id,
          title: i.title,
          description: i.description || "",
          category: i.category,
          priority: i.priority,
          quantity: i.quantity || "",
          checked: i.checked ? 1 : 0,
          customizable: i.customizable ? 1 : 0,
        }))
      );
      await api.actions.save(
        ac.map((a) => ({
          action_id: a.id,
          phase: a.phase,
          title: a.title,
          description: a.description,
          priority: a.priority,
          checked: a.checked ? 1 : 0,
        }))
      );
    } catch (e) {
      console.error("Failed to save data", e);
    }

    setTimeout(() => {
      setGenerating(false);
      setScreen("main");
      setActiveTab("home");
    }, 1200);
  };

  const handleChecklistUpdate = async (items: ChecklistItem[]) => {
    setChecklist(items);
    try {
      await api.checklist.save(
        items.map((i) => ({
          item_id: i.id,
          title: i.title,
          description: i.description || "",
          category: i.category,
          priority: i.priority,
          quantity: i.quantity || "",
          checked: i.checked ? 1 : 0,
          customizable: i.customizable ? 1 : 0,
        }))
      );
    } catch (e) {
      console.error("Failed to save checklist", e);
    }
  };

  const handleActionsUpdate = async (items: ActionItem[]) => {
    setActions(items);
    try {
      await api.actions.save(
        items.map((a) => ({
          action_id: a.id,
          phase: a.phase,
          title: a.title,
          description: a.description,
          priority: a.priority,
          checked: a.checked ? 1 : 0,
        }))
      );
    } catch (e) {
      console.error("Failed to save actions", e);
    }
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
    setProfile(null);
    setChecklist([]);
    setActions([]);
    setScreen("splash");
    initialized.current = false;
  };

  const handleRegenerate = () => {
    setScreen("questionnaire");
  };

  const handleUpdateUser = async (fullName: string) => {
    if (!user) return;
    try {
      const res = await api.auth.updateProfile({ full_name: fullName });
      setUser(res.user);
    } catch (e) {
      console.error("Failed to update user", e);
    }
  };

  const handleStart = () => {
    const token = getStoredToken();
    if (token && user) {
      setScreen("main");
      setActiveTab("home");
    } else {
      setScreen("auth");
    }
  };

  const handleSkipAuth = () => {
    setScreen("main");
  };

  const navTabs = [
    {
      key: "checklist" as Tab,
      icon: <ClipboardList size={20} />,
      label: "چک‌لیست",
      badge: checklist.filter((i) => !i.checked).length,
    },
    {
      key: "actions" as Tab,
      icon: <Zap size={20} />,
      label: "اقدامات",
      badge: actions.filter((a) => !a.checked).length,
    },
    { key: "home" as Tab, icon: <Home size={26} />, label: "خانه", isHome: true },
    { key: "profile" as Tab, icon: <User size={20} />, label: "پروفایل" },
    { key: "toolkit" as Tab, icon: <Wrench size={20} />, label: "ابزارها" },
  ];

  if (loadingData) {
    return (
      <div
        className="size-full flex items-center justify-center"
        style={{ backgroundColor: "#E8E4DC" }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: "100%",
            maxWidth: "430px",
            height: "100%",
            maxHeight: "900px",
            backgroundColor: "var(--background)",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <ShieldCheck size={24} color="white" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="size-full flex items-center justify-center"
      style={{ backgroundColor: "#E8E4DC", fontFamily: "'Vazirmatn', sans-serif" }}
    >
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
              <SplashScreen onStart={handleStart} />
            </motion.div>
          )}

          {screen === "auth" && (
            <motion.div
              key="auth"
              className="absolute inset-0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <AuthPage onAuthenticated={handleAuthenticated} />
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

          {screen === "main" && !generating && user && (
            <motion.div
              key="main"
              className="absolute inset-0 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {activeTab === "home" && (
                    <motion.div
                      key="home"
                      className="absolute inset-0"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.2 }}
                    >
                      <HomeTab
                        user={user}
                        profile={profile}
                        checklist={checklist}
                        actions={actions}
                        onNavigateToChecklist={() => setActiveTab("checklist")}
                        onNavigateToActions={() => setActiveTab("actions")}
                        onNavigateToQuestionnaire={() => setScreen("questionnaire")}
                      />
                    </motion.div>
                  )}

                  {activeTab === "checklist" && (
                    <motion.div
                      key="checklist"
                      className="absolute inset-0"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.2 }}
                    >
                      {profile && checklist.length > 0 ? (
                        <ChecklistView
                          items={checklist}
                          onUpdate={handleChecklistUpdate}
                          onDownload={() => setShowDownload(true)}
                        />
                      ) : (
                        <EmptyState
                          title="چک‌لیست آماده نشده"
                          desc="ابتدا پرسشنامه خانواده را تکمیل کنید تا چک‌لیست آماده شود"
                          onAction={() => setScreen("questionnaire")}
                          actionLabel="پر کردن پرسشنامه"
                        />
                      )}
                    </motion.div>
                  )}

                  {activeTab === "actions" && (
                    <motion.div
                      key="actions"
                      className="absolute inset-0"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.2 }}
                    >
                      {profile && actions.length > 0 ? (
                        <ActionsView
                          actions={actions}
                          onUpdate={handleActionsUpdate}
                          onDownload={() => setShowDownload(true)}
                        />
                      ) : (
                        <EmptyState
                          title="اقدامات آماده نشده"
                          desc="ابتدا پرسشنامه خانواده را تکمیل کنید تا اقدامات لازم مشخص شود"
                          onAction={() => setScreen("questionnaire")}
                          actionLabel="پر کردن پرسشنامه"
                        />
                      )}
                    </motion.div>
                  )}

                  {activeTab === "profile" && (
                    <motion.div
                      key="profile"
                      className="absolute inset-0"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProfileTab
                        user={user}
                        profile={profile}
                        onLogout={handleLogout}
                        onRegenerate={handleRegenerate}
                        onUpdateUser={handleUpdateUser}
                        onNavigateToQuestionnaire={() => setScreen("questionnaire")}
                        onOpenSettings={() => setShowSettings(true)}
                      />
                    </motion.div>
                  )}

                  {activeTab === "toolkit" && (
                    <motion.div
                      key="toolkit"
                      className="absolute inset-0"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ToolkitTab
                        items={checklist}
                        actions={actions}
                        profile={profile}
                        onOpenSettings={() => setShowSettings(true)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom navigation - 5 tabs */}
              <div
                className="flex items-center justify-center px-1 py-1"
                style={{
                  backgroundColor: "var(--card)",
                  borderTop: "1px solid var(--border)",
                  paddingBottom: "max(2px, env(safe-area-inset-bottom))",
                }}
                dir="rtl"
              >
                {navTabs.map((tab) => (
                  <NavTab
                    key={tab.key}
                    active={activeTab === tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    icon={tab.icon}
                    label={tab.label}
                    badge={tab.badge}
                    isHome={tab.isHome}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Questionnaire screen — rendered outside AnimatePresence for reliable visibility */}
        {screen === "questionnaire" && user && (
          <motion.div
            key="questionnaire"
            className="absolute inset-0"
            style={{ zIndex: 50 }}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Questionnaire onComplete={handleProfileComplete} onCancel={() => setScreen("main")} initialProfile={profile} />
          </motion.div>
        )}

      </div>

      {/* Modals - rendered outside overflow-hidden container */}
      {profile && (
        <DownloadModal
          isOpen={showDownload}
          onClose={() => setShowDownload(false)}
          items={checklist}
          actions={actions}
          profile={profile}
          mode={activeTab === "checklist" ? "checklist" : "actions"}
        />
      )}

      {user && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          user={user}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

function NavTab({
  active,
  onClick,
  icon,
  label,
  badge,
  isHome,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  isHome?: boolean;
}) {
  if (isHome) {
    return (
      <button
        onClick={onClick}
        className="relative flex-shrink-0 flex flex-col items-center justify-center transition-all active:scale-90"
        style={{
          width: 60,
          height: 60,
          borderRadius: "1.25rem",
          backgroundColor: "var(--primary)",
          color: "white",
          boxShadow: "0 4px 20px rgba(192,57,43,0.35)",
          fontFamily: "'Vazirmatn', sans-serif",
          transform: "translateY(-8px)",
        }}
      >
        {icon}
        <span
          style={{
            fontSize: "0.58rem",
            fontWeight: 700,
            marginTop: 2,
          }}
        >
          {label}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all active:scale-95 relative"
      style={{
        color: "var(--muted-foreground)",
          fontFamily: "'Vazirmatn', sans-serif",
      }}
    >
      {icon}
      <span style={{ fontSize: "0.62rem", fontWeight: 700, marginTop: 1 }}>{label}</span>
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 w-5 h-1 rounded-full"
          style={{ backgroundColor: "var(--primary)" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      {badge !== undefined && badge > 0 && (
        <span
          className="absolute top-0.5 left-1/2 w-4 h-4 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "var(--primary)",
            color: "white",
            fontSize: "0.55rem",
            fontWeight: 700,
            transform: "translateX(8px)",
          }}
        >
          {badge > 99 ? `${toPersianNumber(99)}+` : toPersianNumber(badge)}
        </span>
      )}
    </button>
  );
}

function EmptyState({
  title,
  desc,
  onAction,
  actionLabel,
}: {
  title: string;
  desc: string;
  onAction: () => void;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "var(--muted)" }}
      >
        <ClipboardList size={36} color="var(--muted-foreground)" />
      </div>
      <div className="text-center">
        <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--foreground)" }}>
          {title}
        </p>
        <p className="mt-1" style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
          {desc}
        </p>
      </div>
      <button
        onClick={onAction}
        className="px-8 py-3.5 rounded-2xl text-white transition-all active:scale-95"
        style={{
          backgroundColor: "var(--primary)",
          fontSize: "0.95rem",
          fontWeight: 600,
          fontFamily: "'Vazirmatn', sans-serif",
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function DownloadModal({
  isOpen,
  onClose,
  items,
  actions,
  profile,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: ChecklistItem[];
  actions: ActionItem[];
  profile: UserProfile;
  mode: "checklist" | "actions";
}) {
  if (!isOpen) return null;

  const downloadTxt = () => {
    let content = "";
    if (mode === "checklist") {
      content += "چک‌لیست اضطراری شخصی\n═══════════════════════════\n\n";
      const categories = Array.from(new Set(items.map((i) => i.category)));
      for (const cat of categories) {
        content += `▶ ${cat}\n`;
        items
          .filter((i) => i.category === cat)
          .forEach((item) => {
            content += `  ${item.checked ? "✓" : "○"} ${item.title}${item.quantity ? ` — ${item.quantity}` : ""}\n`;
          });
        content += "\n";
      }
      content += `\nپیشرفت: ${toPersianNumber(items.filter((i) => i.checked).length)} از ${toPersianNumber(items.length)} آیتم تهیه شده\n`;
    } else {
      content += "برنامه اقدامات اضطراری\n═══════════════════════════\n\n";
      const phases = [
        { key: "before", label: "قبل از بحران" },
        { key: "during", label: "حین بحران" },
        { key: "after", label: "پس از بحران" },
      ];
      for (const { key, label } of phases) {
        content += `▶ ${label}\n`;
        actions
          .filter((a) => a.phase === key)
          .forEach((action) => {
            content += `  ${action.checked ? "✓" : "○"} ${action.title}\n     ${action.description}\n\n`;
          });
      }
      content += `\nپیشرفت: ${toPersianNumber(actions.filter((i) => i.checked).length)} از ${toPersianNumber(actions.length)} آیتم تهیه شده\n`;
    }
    content += `\nتهیه‌شده توسط سامانه تیک | ${new Date().toLocaleDateString("fa-IR")}\n`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === "checklist" ? "checklist-emergency.txt" : "actions-emergency.txt";
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const downloadJson = () => {
    const data = mode === "checklist"
      ? { profile, checklist: items, exportDate: new Date().toISOString() }
      : { profile, actions, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === "checklist" ? "checklist-emergency.json" : "actions-emergency.json";
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const downloadHtml = () => {
    let html = `<!DOCTYPE html><html dir="rtl" lang="fa"><head><meta charset="UTF-8"><title>${mode === "checklist" ? "چک‌لیست اضطراری" : "اقدامات اضطراری"}</title>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700&display=swap" rel="stylesheet">
<style>body{font-family:'Vazirmatn',sans-serif;background:#F7F5F0;color:#1A1A2E;max-width:600px;margin:0 auto;padding:24px}h1{color:#C0392B;border-bottom:2px solid #C0392B;padding-bottom:8px}h2{color:#2C3E50;margin-top:24px}.item{display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid #EDE9E0}.check{width:20px;height:20px;border:2px solid #ccc;border-radius:4px;flex-shrink:0}.checked{background:#27AE60;border-color:#27AE60}.qty{color:#7A7A8C;font-size:0.85rem}.desc{color:#7A7A8C;font-size:0.85rem;margin-top:4px}.footer{margin-top:32px;color:#7A7A8C;font-size:0.82rem;text-align:center}</style></head><body>
<h1>${mode === "checklist" ? "📋 چک‌لیست اضطراری شخصی" : "⚡ برنامه اقدامات اضطراری"}</h1>
<p>برای خانواده ${toPersianNumber(profile.familyCount)} نفره</p>`;
    if (mode === "checklist") {
      const categories = Array.from(new Set(items.map((i) => i.category)));
      for (const cat of categories) {
        html += `<h2>${cat}</h2>`;
        items.filter((i) => i.category === cat).forEach((item) => {
          html += `<div class="item"><div class="check ${item.checked ? "checked" : ""}"></div><div><div>${item.title}</div>${item.quantity ? `<div class="qty">${item.quantity}</div>` : ""}${item.description ? `<div class="desc">${item.description}</div>` : ""}</div></div>`;
        });
      }
    } else {
      const phases = [
        { key: "before", label: "قبل از بحران", icon: "🛡️" },
        { key: "during", label: "حین بحران", icon: "⚡" },
        { key: "after", label: "پس از بحران", icon: "🔄" },
      ];
      for (const { key, label, icon } of phases) {
        html += `<h2>${icon} ${label}</h2>`;
        actions.filter((a) => a.phase === key).forEach((action) => {
          html += `<div class="item"><div class="check ${action.checked ? "checked" : ""}"></div><div><div>${action.title}</div><div class="desc">${action.description}</div></div></div>`;
        });
      }
    }
    html += `<div class="footer">تهیه‌شده توسط سامانه تیک | ${new Date().toLocaleDateString("fa-IR")}</div></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === "checklist" ? "checklist-emergency.html" : "actions-emergency.html";
    link.click();
    URL.revokeObjectURL(url);
    onClose();
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
              }}
              dir="rtl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
            <div className="flex justify-between items-center mb-5">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)" }}>
                دانلود
              </h3>
              <button onClick={onClose}>
                <X size={20} color="var(--muted-foreground)" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <DownloadBtn icon={<FileText size={22} color="#C0392B" />} title="فایل TXT" desc="قابل چاپ و اشتراک‌گذاری" action={downloadTxt} />
              <DownloadBtn icon={<FileSpreadsheet size={22} color="#27AE60"/>} title="فایل JSON" desc="برای بازگردانی و ویرایش" action={downloadJson} />
              <DownloadBtn icon={<Globe size={22} color="#2980B9"/>} title="فایل HTML" desc="با قالب‌بندی زیبا برای چاپ" action={downloadHtml} />
            </div>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DownloadBtn({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc: string; action: () => void }) {
  return (
    <button
      onClick={action}
      className="flex items-center gap-4 p-4 rounded-2xl text-right transition-all active:scale-95"
      style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)", fontFamily: "'Vazirmatn', sans-serif" }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--card)" }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}>{title}</p>
        <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{desc}</p>
      </div>
    </button>
  );
}
