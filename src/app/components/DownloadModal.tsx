import { motion, AnimatePresence } from "motion/react";
import { X, FileText, FileSpreadsheet } from "lucide-react";
import { ChecklistItem, ActionItem, UserProfile } from "./data";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ChecklistItem[];
  actions: ActionItem[];
  profile: UserProfile;
  mode: "checklist" | "actions";
}

export function DownloadModal({ isOpen, onClose, items, actions, profile, mode }: DownloadModalProps) {
  const downloadTxt = () => {
    let content = "";

    if (mode === "checklist") {
      content += "چک‌لیست اضطراری شخصی\n";
      content += "═══════════════════════════\n\n";

      const categories = Array.from(new Set(items.map((i) => i.category)));
      for (const cat of categories) {
        content += `▶ ${cat}\n`;
        const catItems = items.filter((i) => i.category === cat);
        for (const item of catItems) {
          const check = item.checked ? "✓" : "○";
          content += `  ${check} ${item.title}`;
          if (item.quantity) content += ` — ${item.quantity}`;
          content += "\n";
        }
        content += "\n";
      }

      const checked = items.filter((i) => i.checked).length;
      content += `\nپیشرفت: ${checked} از ${items.length} آیتم تهیه شده\n`;
    } else {
      content += "برنامه اقدامات اضطراری\n";
      content += "═══════════════════════════\n\n";

      const phases: Array<{ key: "before" | "during" | "after"; label: string }> = [
        { key: "before", label: "قبل از بحران" },
        { key: "during", label: "حین بحران" },
        { key: "after", label: "پس از بحران" },
      ];

      for (const { key, label } of phases) {
        content += `▶ ${label}\n`;
        const phaseActions = actions.filter((a) => a.phase === key);
        for (const action of phaseActions) {
          const check = action.checked ? "✓" : "○";
          content += `  ${check} ${action.title}\n`;
          content += `     ${action.description}\n\n`;
        }
      }
    }

    content += `\nتاریخ تهیه: ${new Date().toLocaleDateString("fa-IR")}\n`;

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
    const data =
      mode === "checklist"
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
    let html = `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
<meta charset="UTF-8">
<title>${mode === "checklist" ? "چک‌لیست اضطراری" : "اقدامات اضطراری"}</title>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Vazirmatn', sans-serif; background: #F7F5F0; color: #1A1A2E; max-width: 600px; margin: 0 auto; padding: 24px; }
  h1 { color: #C0392B; border-bottom: 2px solid #C0392B; padding-bottom: 8px; }
  h2 { color: #2C3E50; margin-top: 24px; }
  .item { display: flex; align-items: flex-start; gap: 8px; padding: 8px 0; border-bottom: 1px solid #EDE9E0; }
  .check { width: 20px; height: 20px; border: 2px solid #ccc; border-radius: 4px; flex-shrink: 0; margin-top: 2px; }
  .checked { background: #27AE60; border-color: #27AE60; }
  .qty { color: #7A7A8C; font-size: 0.85rem; }
  .badge-high { background: #FDEDEC; color: #C0392B; padding: 2px 8px; border-radius: 99px; font-size: 0.72rem; font-weight: 700; }
  .desc { color: #7A7A8C; font-size: 0.85rem; margin-top: 4px; }
  .footer { margin-top: 32px; color: #7A7A8C; font-size: 0.82rem; text-align: center; }
</style>
</head>
<body>
<h1>${mode === "checklist" ? "📋 چک‌لیست اضطراری شخصی" : "⚡ برنامه اقدامات اضطراری"}</h1>
<p>خانواده ${profile.familyCount} نفره | ${profile.livingType === "apartment" ? "آپارتمان" : "خانه ویلایی"}</p>
`;

    if (mode === "checklist") {
      const categories = Array.from(new Set(items.map((i) => i.category)));
      for (const cat of categories) {
        html += `<h2>${cat}</h2>`;
        const catItems = items.filter((i) => i.category === cat);
        for (const item of catItems) {
          html += `<div class="item">
<div class="check ${item.checked ? "checked" : ""}"></div>
<div>
  <div>${item.title} ${item.priority === "high" ? '<span class="badge-high">ضروری</span>' : ""}</div>
  ${item.quantity ? `<div class="qty">${item.quantity}</div>` : ""}
  ${item.description ? `<div class="desc">${item.description}</div>` : ""}
</div>
</div>`;
        }
      }
    } else {
      const phases: Array<{ key: "before" | "during" | "after"; label: string; icon: string }> = [
        { key: "before", label: "قبل از بحران", icon: "🛡️" },
        { key: "during", label: "حین بحران", icon: "⚡" },
        { key: "after", label: "پس از بحران", icon: "🔄" },
      ];
      for (const { key, label, icon } of phases) {
        html += `<h2>${icon} ${label}</h2>`;
        const phaseActions = actions.filter((a) => a.phase === key);
        for (const action of phaseActions) {
          html += `<div class="item">
<div class="check ${action.checked ? "checked" : ""}"></div>
<div>
  <div>${action.title} ${action.priority === "high" ? '<span class="badge-high">ضروری</span>' : ""}</div>
  <div class="desc">${action.description}</div>
</div>
</div>`;
        }
      }
    }

    html += `<div class="footer">تهیه‌شده توسط اپ آمادگی اضطراری | ${new Date().toLocaleDateString("fa-IR")}</div>
</body></html>`;

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
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6"
            style={{
              backgroundColor: "var(--card)",
              maxWidth: "430px",
              margin: "0 auto",
              fontFamily: "'Vazirmatn', sans-serif",
            }}
            dir="rtl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
              {[
                {
                  icon: <FileText size={22} color="#C0392B" />,
                  title: "فایل متنی (.txt)",
                  desc: "قابل چاپ و اشتراک‌گذاری",
                  action: downloadTxt,
                },
                {
                  icon: <FileSpreadsheet size={22} color="#27AE60" />,
                  title: "فایل JSON (قابل ویرایش)",
                  desc: "برای بازگردانی و ویرایش در اپ",
                  action: downloadJson,
                },
                {
                  icon: <span style={{ fontSize: "1.4rem" }}>🌐</span>,
                  title: "فایل HTML (قابل چاپ)",
                  desc: "با قالب‌بندی زیبا برای چاپ",
                  action: downloadHtml,
                },
              ].map((opt) => (
                <button
                  key={opt.title}
                  onClick={opt.action}
                  className="flex items-center gap-4 p-4 rounded-2xl text-right transition-all active:scale-95"
                  style={{
                    backgroundColor: "var(--muted)",
                    border: "1px solid var(--border)",
                    fontFamily: "'Vazirmatn', sans-serif",
                  }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--card)" }}>
                    {opt.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}>
                      {opt.title}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                      {opt.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}