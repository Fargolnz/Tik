import { useState } from "react";
import { motion } from "motion/react";
import {
  Download,
  ClipboardList,
  Zap,
  BookOpen,
  Settings,
  Info,
  Mail,
  Shield,
  ShieldCheck,
  ChevronLeft,
  X,
} from "lucide-react";
import { ChecklistItem, ActionItem, UserProfile } from "./data";

interface ToolkitTabProps {
  items: ChecklistItem[];
  actions: ActionItem[];
  profile: UserProfile | null;
  onOpenSettings: () => void;
}

export function ToolkitTab({ items, actions, profile, onOpenSettings }: ToolkitTabProps) {
  const [showExport, setShowExport] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const downloadTxt = (type: "checklist" | "actions") => {
    const data = type === "checklist" ? items : actions;
    let content = "";
    if (type === "checklist") {
      content += "چک‌لیست اضطراری شخصی\n═════════════════\n\n";
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
    } else {
      content += "برنامه اقدامات اضطراری\n══════════════════════\n\n";
      const phases: { key: string; label: string }[] = [
        { key: "before", label: "قبل از بحران" },
        { key: "during", label: "حین بحران" },
        { key: "after", label: "پس از بحران" },
      ];
      for (const { key, label } of phases) {
        content += `▶ ${label}\n`;
        actions
          .filter((a) => a.phase === key)
          .forEach((a) => {
            content += `  ${a.checked ? "✓" : "○"} ${a.title}\n     ${a.description}\n\n`;
          });
      }
    }
    content += `\nتهیه‌شده توسط سامانه تیک | ${new Date().toLocaleDateString("fa-IR")}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = type === "checklist" ? "checklist-emergency.txt" : "actions-emergency.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJson = (type: "checklist" | "actions") => {
    const data = type === "checklist" ? { profile, checklist: items } : { profile, actions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = type === "checklist" ? "checklist-emergency.json" : "actions-emergency.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadHtml = (type: "checklist" | "actions") => {
    let html = `<!DOCTYPE html><html dir="rtl" lang="fa"><head><meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700&display=swap" rel="stylesheet">
    <style>body{font-family:'Vazirmatn',sans-serif;background:#F7F5F0;color:#1A1A2E;max-width:600px;margin:0 auto;padding:24px}h1{color:#C0392B;border-bottom:2px solid #C0392B;padding-bottom:8px}h2{color:#2C3E50;margin-top:24px}.item{display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid #EDE9E0}.check{width:20px;height:20px;border:2px solid #ccc;border-radius:4px;flex-shrink:0}.checked{background:#27AE60;border-color:#27AE60}.qty{color:#7A7A8C;font-size:0.85rem}.footer{margin-top:32px;color:#7A7A8C;font-size:0.82rem;text-align:center}</style></head><body>
    <h1>${type === "checklist" ? "📋 چک‌لیست اضطراری شخصی" : "⚡ برنامه اقدامات اضطراری"}</h1>`;

    if (type === "checklist") {
      const categories = Array.from(new Set(items.map((i) => i.category)));
      for (const cat of categories) {
        html += `<h2>${cat}</h2>`;
        items
          .filter((i) => i.category === cat)
          .forEach((item) => {
            html += `<div class="item"><div class="check ${item.checked ? "checked" : ""}"></div><div><div>${item.title}</div>${item.quantity ? `<div class="qty">${item.quantity}</div>` : ""}</div></div>`;
          });
      }
    } else {
      const phases: { key: string; label: string; icon: string }[] = [
        { key: "before", label: "قبل از بحران", icon: "🛡️" },
        { key: "during", label: "حین بحران", icon: "⚡" },
        { key: "after", label: "پس از بحران", icon: "🔄" },
      ];
      for (const { key, label, icon } of phases) {
        html += `<h2>${icon} ${label}</h2>`;
        actions
          .filter((a) => a.phase === key)
          .forEach((a) => {
            html += `<div class="item"><div class="check ${a.checked ? "checked" : ""}"></div><div><div>${a.title}</div><div class="qty">${a.description}</div></div></div>`;
          });
      }
    }
    html += `<div class="footer">تهیه‌شده توسط سامانه تیک | ${new Date().toLocaleDateString("fa-IR")}</div></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = type === "checklist" ? "checklist-emergency.html" : "actions-emergency.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toolItems = [
    {
      icon: <Settings size={20} color="#7A7A8C" />,
      title: "تنظیمات",
      desc: "مدیریت حساب کاربری",
      bg: "#7A7A8C20",
      onClick: onOpenSettings,
    },
    {
      icon: <Download size={20} color="#E91E63" />,
      title: "دانلودها",
      desc: "خروجی گرفتن از چک‌لیست و اقدامات",
      bg: "#FCE4EC",
      onClick: () => setShowExport(true),
    },
    {
      icon: <BookOpen size={20} color="#2980B9" />,
      title: "راهنمای اضطراری",
      desc: "نکات مهم در شرایط بحرانی",
      bg: "#EBF5FB",
      onClick: () => setShowGuide(true),
    },
    {
      icon: <Mail size={20} color="#8E44AD" />,
      title: "ارتباط با ما",
      desc: "پیشنهادات و انتقادات",
      bg: "#F4ECF7",
      onClick: () => setShowContact(true),
    },
    {
      icon: <Shield size={20} color="#E67E22" />,
      title: "حریم خصوصی",
      desc: "سیاست حفظ اطلاعات",
      bg: "#FEF5E7",
      onClick: () => setShowPrivacy(true),
    },
    {
      icon: <Info size={20} color="#C0392B" />,
      title: "درباره تیک",
      desc: "نسخه ۲.۰.۰",
      bg: "#FDEDEC",
      onClick: () => setShowAbout(true),
    },
  ];

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
        <h1 style={{ color: "white", fontSize: "1.25rem", fontWeight: 700 }}>
          ابزارها
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-3">
          {toolItems.map((item, i) => (
            <motion.button
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={item.onClick}
              className="flex items-center justify-between p-4 rounded-2xl text-right transition-all active:scale-95"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: item.bg }}
                >
                  {item.icon}
                </div>
                <div>
                  <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                    {item.desc}
                  </p>
                </div>
              </div>
              <ChevronLeft size={16} color="var(--muted-foreground)" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <Modal onClose={() => setShowExport(false)} title="دانلود">
          <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginBottom: 16, textAlign: "center" }}>
            فرمت و نوع فایل را انتخاب کنید
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground)", marginBottom: 8, paddingRight: 2 }}>
                📄 TXT
              </p>
              <div className="flex gap-2">
                <ExportBtn
                  icon={<ClipboardList size={18} />}
                  label="چک‌لیست"
                  onClick={() => downloadTxt("checklist")}
                  color="#C0392B"
                />
                <ExportBtn
                  icon={<Zap size={18} />}
                  label="اقدامات"
                  onClick={() => downloadTxt("actions")}
                  color="#C0392B"
                />
              </div>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground)", marginBottom: 8, paddingRight: 2 }}>
                📋 JSON
              </p>
              <div className="flex gap-2">
                <ExportBtn
                  icon={<ClipboardList size={18} />}
                  label="چک‌لیست"
                  onClick={() => downloadJson("checklist")}
                  color="#27AE60"
                />
                <ExportBtn
                  icon={<Zap size={18} />}
                  label="اقدامات"
                  onClick={() => downloadJson("actions")}
                  color="#27AE60"
                />
              </div>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground)", marginBottom: 8, paddingRight: 2 }}>
                🌐 HTML
              </p>
              <div className="flex gap-2">
                <ExportBtn
                  icon={<ClipboardList size={18} />}
                  label="چک‌لیست"
                  onClick={() => downloadHtml("checklist")}
                  color="#2980B9"
                />
                <ExportBtn
                  icon={<Zap size={18} />}
                  label="اقدامات"
                  onClick={() => downloadHtml("actions")}
                  color="#2980B9"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Guide Modal */}
      {showGuide && (
        <Modal onClose={() => setShowGuide(false)} title="راهنمای اضطراری">
          <div className="flex flex-col gap-4" style={{ fontSize: "0.85rem", color: "var(--foreground)", lineHeight: 1.8 }}>
            <div className="p-3 rounded-xl" style={{ backgroundColor: "#FFF3E0", border: "1px solid #FFB74D" }}>
              <p style={{ fontWeight: 700, color: "#E65100", marginBottom: 4 }}>📞 شماره‌های اضطراری</p>
              <p>۱۱۵ - اورژانس</p>
              <p>۱۲۵ - آتش‌نشانی</p>
              <p>۱۱۰ - پلیس</p>
              <p>۱۳۷ - هلال احمر</p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: "#EBF5FB", border: "1px solid #85C1E9" }}>
              <p style={{ fontWeight: 700, color: "#1A5276", marginBottom: 4 }}>🎒 کیف اضطراری (۷۲ ساعت)</p>
              <p>محتويات کیف را در یک کوله‌پشتی کوچک و قابل حمل قرار دهید و در دسترس نگه دارید. شامل آب، غذای کنسروی، چراغ‌قوه، باتری، رادیو، جعبه کمک‌های اولیه، داروهای ضروری، مدارک مهم، پول نقد و پاوربانک.</p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: "#EAFAF1", border: "1px solid #82E0AA" }}>
              <p style={{ fontWeight: 700, color: "#1E8449", marginBottom: 4 }}>📍 نقطه تجمع خانواده</p>
              <p>یک مکان مشخص در خارج از منزل (مثل پارک نزدیک) و یک مکان خارج از محله تعیین کنید. مطمئن شوید همه اعضای خانواده این مکان‌ها را می‌دانند.</p>
            </div>
          </div>
        </Modal>
      )}

      {/* About Modal */}
      {showAbout && (
        <Modal onClose={() => setShowAbout(false)} title="درباره تیک">
          <div className="text-center py-2">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--primary)" }}>
              <ShieldCheck size={32} color="white" />
            </div>
            <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--foreground)" }}>تیک</p>
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: 4 }}>نسخه ۲.۰.۰</p>
            <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", marginTop: 12, lineHeight: 1.8 }}>
              سامانه هوشمند آمادگی در برابر بحران‌های جنگ
            </p>
            <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: 8, lineHeight: 1.7 }}>
              با تکمیل پرسشنامه خانواده، چک‌لیست و برنامه اقدام شخصی‌سازی‌شده دریافت کنید.
            </p>
          </div>
        </Modal>
      )}

      {/* Contact Modal */}
      {showContact && (
        <Modal onClose={() => setShowContact(false)} title="ارتباط با ما">
          <div className="flex flex-col gap-4">
            <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", lineHeight: 1.7 }}>
              برای ارسال پیشنهادات، انتقادات یا گزارش مشکلات می‌توانید از راه‌های زیر با ما در ارتباط باشید:
            </p>
            <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--foreground)", fontWeight: 600 }}>📧 ایمیل</p>
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", direction: "ltr", textAlign: "right" }}>support@tik-app.ir</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--foreground)", fontWeight: 600 }}>🌐 وبسایت</p>
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", direction: "ltr", textAlign: "right" }}>https://tik-app.ir</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <Modal onClose={() => setShowPrivacy(false)} title="حریم خصوصی">
          <div className="flex flex-col gap-3" style={{ fontSize: "0.82rem", lineHeight: 1.8 }}>
            {[
              "اطلاعات شما در امنیت کامل ذخیره می‌شود و بدون رضایت شما در اختیار شخص ثالث قرار نخواهد گرفت.",
              "شماره تلفن شما تنها برای احراز هویت استفاده می‌شود.",
              "اطلاعات خانواده و چک‌لیست‌ها تنها نزد شما و سرور امن ذخیره می‌شود.",
              "شما می‌توانید در هر زمان حساب خود را حذف کنید.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)", fontSize: "0.72rem", fontWeight: 700 }}
                >
                  {i + 1}
                </div>
                <p style={{ color: "var(--muted-foreground)" }}>{text}</p>
              </div>
            ))}
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textAlign: "center", marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
              آخرین به‌روزرسانی: تیر ۱۴۰۵
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="rounded-3xl p-6 w-full max-w-sm"
        style={{
          backgroundColor: "var(--card)",
          fontFamily: "'Vazirmatn', sans-serif",
          maxWidth: "430px",
        }}
        dir="rtl"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)" }}>
            {title}
          </h3>
          <button onClick={onClose}>
            <X size={20} color="var(--muted-foreground)" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function ExportBtn({
  icon,
  label,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-2 p-3.5 rounded-2xl transition-all active:scale-95"
      style={{
        backgroundColor: `${color}10`,
        border: `1px solid ${color}30`,
      }}
    >
      <span style={{ color }}>{icon}</span>
      <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--foreground)" }}>
        {label}
      </span>
    </button>
  );
}
