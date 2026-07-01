import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { toPersianNumber } from "./data";

interface SplashScreenProps {
  onStart: () => void;
}

export function SplashScreen({ onStart }: SplashScreenProps) {
  return (
    <div
      className="flex flex-col items-center justify-between h-full bg-background px-6 py-12"
      dir="rtl"
      style={{ fontFamily: "'Vazirmatn', sans-serif" }}
    >
      <div />

      <motion.div
        className="flex flex-col items-center gap-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg"
          style={{ backgroundColor: "var(--primary)" }}
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
        >
          <ShieldCheck size={48} color="white" strokeWidth={1.5} />
        </motion.div>

        <div className="flex flex-col gap-2">
          <h1
            className="text-foreground"
            style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.3 }}
          >
           تیک
          </h1>
          <p
            className="text-muted-foreground leading-relaxed"
            style={{ fontSize: "0.95rem" }}
          >
            چک‌لیست هوشمند و شخصی‌سازی‌شده
            <br />
            برای آمادگی در برابر بحران‌های جنگ
          </p>
        </div>

        <div className="flex gap-3 mt-2">
          {["اقلام ضروری خانواده", "راهنمای اقدامات اضطراری"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--muted-foreground)",
                fontSize: "0.75rem",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="w-full flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl text-white transition-all active:scale-95"
          style={{
            backgroundColor: "var(--primary)",
            fontSize: "1rem",
            fontWeight: 600,
            fontFamily: "'Vazirmatn', sans-serif",
          }}
        >
          شروع کنید
        </button>

        <p className="text-center text-muted-foreground" style={{ fontSize: "0.75rem" }}>
          Tik v{toPersianNumber("1.0.0")}
        </p>
      </motion.div>
    </div>
  );
}
