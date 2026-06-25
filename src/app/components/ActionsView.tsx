import { useState } from "react";
import { motion } from "motion/react";
import { Check, Download } from "lucide-react";
import { ActionItem } from "./data";
import { toPersianNumber } from "./data";


interface ActionsViewProps {
  actions: ActionItem[];
  onUpdate: (actions: ActionItem[]) => void;
  onDownload: () => void;
}

const priorityColors: Record<string, string> = {
  high: "#C0392B",
  medium: "#E67E22",
  low: "#27AE60",
};

const phaseConfig = {
  before: {
    label: "قبل از بحران",
    icon: "🛡️",
    color: "#2980B9",
    bg: "#EBF5FB",
    desc: "آمادگی و پیشگیری",
  },
  during: {
    label: "حین بحران",
    icon: "⚡",
    color: "#C0392B",
    bg: "#FDEDEC",
    desc: "اقدامات فوری",
  },
  after: {
    label: "بعد از بحران",
    icon: "🔄",
    color: "#27AE60",
    bg: "#EAFAF1",
    desc: "بازیابی و ترمیم",
  },
};

export function ActionsView({ actions, onUpdate, onDownload }: ActionsViewProps) {
  const [activePhase, setActivePhase] = useState<"before" | "during" | "after">("before");

  const toggle = (id: string) => {
    onUpdate(actions.map((a) => (a.id === id ? { ...a, checked: !a.checked } : a)));
  };

  const phaseActions = actions.filter((a) => a.phase === activePhase);
  const checkedCount = phaseActions.filter((a) => a.checked).length;
  const config = phaseConfig[activePhase];

  return (
    <div
      className="flex flex-col h-full bg-background"
      dir="rtl"
      style={{ fontFamily: "'Vazirmatn', sans-serif" }}
    >
      {/* Header */}
      <div className="px-5 pt-8 pb-5" style={{ backgroundColor: config.color }}>
        <div className="flex justify-between items-center mb-1">
          <h1 style={{ color: "white", fontSize: "1.25rem", fontWeight: 700 }}>
            اقدامات اضطراری
          </h1>
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", fontFamily: "'Vazirmatn', sans-serif", fontSize: "0.8rem" }}
          >
            <Download size={14} />
            دانلود
          </button>
        </div>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem" }}>
          {toPersianNumber(checkedCount)} از {toPersianNumber(phaseActions.length)} اقدام انجام شده
        </p>
      </div>

      {/* Phase tabs */}
      <div
        className="flex px-4 py-3 gap-2"
        style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}
      >
        {(["before", "during", "after"] as const).map((phase) => {
          const pc = phaseConfig[phase];
          const pCount = toPersianNumber(actions.filter((a) => a.phase === phase && a.checked).length);
          const pTotal = toPersianNumber(actions.filter((a) => a.phase === phase).length);
          return (
            <button
              key={phase}
              onClick={() => setActivePhase(phase)}
              className="flex-1 py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all"
              style={{
                backgroundColor: activePhase === phase ? pc.bg : "transparent",
                border: `2px solid ${activePhase === phase ? pc.color : "var(--border)"}`,
                fontFamily: "'Vazirmatn', sans-serif",
              }}
            >
              <span style={{ fontSize: "1rem" }}>{pc.icon}</span>
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: activePhase === phase ? pc.color : "var(--muted-foreground)",
                }}
              >
                {pc.label.split(" ")[0]}
              </span>
              <span style={{ fontSize: "0.6rem", color: "var(--muted-foreground)" }}>
                {pCount}/{pTotal}
              </span>
            </button>
          );
        })}
      </div>

      {/* Phase description */}
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{ backgroundColor: config.bg, borderBottom: `2px solid ${config.color}20` }}
      >
        <span style={{ fontSize: "1.5rem" }}>{config.icon}</span>
        <div>
          <p style={{ fontSize: "0.9rem", fontWeight: 600, color: config.color }}>
            {config.label}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
            {config.desc}
          </p>
        </div>
      </div>

      {/* Actions list */}
      <div className="flex-1 overflow-y-auto pb-6">
        {phaseActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex gap-4 px-5 py-4"
            style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--card)" }}
          >
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <button
                onClick={() => toggle(action.id)}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all active:scale-90"
                style={{
                  backgroundColor: action.checked ? config.color : "transparent",
                  borderColor: action.checked ? config.color : "var(--border)",
                }}
              >
                {action.checked && <Check size={14} color="white" strokeWidth={3} />}
              </button>
              {index < phaseActions.length - 1 && (
                <div
                  className="w-0.5 flex-1"
                  style={{
                    backgroundColor: "var(--border)",
                    minHeight: "16px",
                  }}
                />
              )}
            </div>

            <div className="flex-1 pb-2">
              <div className="flex items-start justify-between gap-2">
                <p
                  style={{
                    fontSize: "0.92rem",
                    fontWeight: 600,
                    color: action.checked ? "var(--muted-foreground)" : "var(--foreground)",
                    textDecoration: action.checked ? "line-through" : "none",
                    lineHeight: 1.4,
                  }}
                >
                  {action.title}
                </p>
                {action.priority === "high" && (
                  <span
                    className="px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: `${priorityColors[action.priority]}15`,
                      color: priorityColors[action.priority],
                      fontSize: "0.68rem",
                      fontWeight: 700,
                    }}
                  >
                    ضروری
                  </span>
                )}
                {action.priority === "medium" && (
                  <span
                    className="px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: `${priorityColors[action.priority]}15`,
                      color: priorityColors[action.priority],
                      fontSize: "0.65rem",
                      fontWeight: 700,
                    }}
                  >
                    مهم
                  </span>
                )}
                {action.priority === "low" && (
                  <span
                    className="px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: `${priorityColors[action.priority]}15`,
                      color: priorityColors[action.priority],
                      fontSize: "0.65rem",
                      fontWeight: 700,
                    }}
                  >
                    توصیه‌شده
                  </span>
                )}
              </div>
              <p
                className="mt-1.5 leading-relaxed"
                style={{
                  fontSize: "0.8rem",
                  color: "var(--muted-foreground)",
                  lineHeight: 1.7,
                }}
              >
                {action.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
