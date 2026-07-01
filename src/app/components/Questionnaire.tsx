import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { UserProfile, diseaseOptions, toPersianNumber } from "./data";

interface QuestionnaireProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

const steps = [
  "اعضای خانواده",
  "کودکان و سالمندان",
  "سلامت",
  "محل سکونت",
  "مهارت‌ها",
];

export function Questionnaire({ onComplete, initialProfile }: QuestionnaireProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(initialProfile || {
    familyCount: 2,
    hasChild: false,
    childCount: 0,
    hasElderly: false,
    elderlyCount: 0,
    hasDisease: false,
    diseases: [],
    hasPet: false,
    petCount: 0,
    livingType: "",
    floor: 1,
    hasElevator: false,
    hasToolsKnowledge: false,
    hasFirstAid: false,
  });

  const update = (updates: Partial<UserProfile>) =>
    setProfile((p) => ({ ...p, ...updates }));

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canProceed = () => {
    if (step === 3 && !profile.livingType) return false;
    return true;
  };

  return (
    <div
      className="flex flex-col h-full bg-background"
      dir="rtl"
      style={{ fontFamily: "'Vazirmatn', sans-serif" }}
    >
      {/* Header */}
      <div
        className="px-5 pt-8 pb-4"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={back} disabled={step === 0} className="opacity-80 disabled:opacity-0">
            <ChevronRight size={24} color="white" />
          </button>
          <span style={{ color: "white", fontSize: "0.85rem", opacity: 0.8 }}>
            {toPersianNumber(step + 1)} از {toPersianNumber(steps.length)}
          </span>
          <div className="w-6" />
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
          <motion.div
            className="h-full rounded-full bg-white"
            initial={false}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <motion.h2
          key={step}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mt-4 text-center"
          style={{ color: "white", fontSize: "1.25rem", fontWeight: 700 }}
        >
          {steps[step]}
        </motion.h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <Step0
                profile={profile}
                update={update}
              />
            )}
            {step === 1 && (
              <Step1 profile={profile} update={update} />
            )}
            {step === 2 && (
              <Step2 profile={profile} update={update} />
            )}
            {step === 3 && (
              <Step3 profile={profile} update={update} />
            )}
            {step === 4 && (
              <Step4 profile={profile} update={update} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
        {step < steps.length - 1 ? (
          <button
            onClick={next}
            disabled={!canProceed()}
            className="w-full py-4 rounded-2xl text-white transition-all active:scale-95 disabled:opacity-50"
            style={{
              backgroundColor: "var(--primary)",
              fontSize: "1rem",
              fontWeight: 600,
              fontFamily: "'Vazirmatn', sans-serif",
            }}
          >
            مرحله بعد
          </button>
        ) : (
          <button
            onClick={() => onComplete(profile)}
            className="w-full py-4 rounded-2xl text-white transition-all active:scale-95"
            style={{
              backgroundColor: "#27AE60",
              fontSize: "1rem",
              fontWeight: 600,
              fontFamily: "'Vazirmatn', sans-serif",
            }}
          >
            ساخت چک‌لیست من ✓
          </button>
        )}
      </div>
    </div>
  );
}

function CardOption({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-2xl text-right transition-all active:scale-95"
      style={{
        backgroundColor: selected ? "var(--primary)" : "var(--card)",
        border: `2px solid ${selected ? "var(--primary)" : "var(--border)"}`,
        color: selected ? "white" : "var(--foreground)",
        fontFamily: "'Vazirmatn', sans-serif",
      }}
    >
      {children}
    </button>
  );
}

function CounterInput({
  value,
  onChange,
  min = 1,
  max = 15,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-4 justify-center">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all active:scale-90"
        style={{
          backgroundColor: "var(--muted)",
          color: "var(--foreground)",
          fontFamily: "'Vazirmatn', sans-serif",
        }}
      >
        −
      </button>
      <span
        className="text-foreground"
        style={{ fontSize: "2rem", fontWeight: 700, minWidth: "3rem", textAlign: "center" }}
      >
        {toPersianNumber(value)}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all active:scale-90"
        style={{
          backgroundColor: "var(--primary)",
          color: "white",
          fontFamily: "'Vazirmatn', sans-serif",
        }}
      >
        +
      </button>
    </div>
  );
}

function Step0({ profile, update }: { profile: UserProfile; update: (u: Partial<UserProfile>) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-foreground" style={{ fontSize: "0.9rem", fontWeight: 600}}>
        👥 چند نفر در خانواده شما زندگی می‌کنند؟
      </p>
      <CounterInput
        value={profile.familyCount}
        onChange={(v) => update({ familyCount: v })}
      />
      <div className="flex flex-col gap-2 mt-2">
        <p className="text-foreground" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
          🐱 آیا حیوان خانگی دارید؟
        </p>
        <div className="flex gap-3">
          <CardOption
          selected={profile.hasPet} 
          onClick={() => update({ hasPet: true, petCount: Math.max(1, profile.petCount) })}>
            بله
          </CardOption>
          <CardOption 
          selected={!profile.hasPet} 
          onClick={() => update({ hasPet: false, petCount: 0 })}>
            خیر
          </CardOption>
        </div>
      </div>

      {profile.hasPet && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex flex-col gap-2"
        >
          <p className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>
            تعداد حیوانات خانگی:
          </p>
          <CounterInput
            value={profile.petCount}
            onChange={(v) => update({ petCount: v })}
            min={1}
            max={5}
          />
        </motion.div>
      )}
    </div>
  );
}

function Step1({ profile, update }: { profile: UserProfile; update: (u: Partial<UserProfile>) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-foreground" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
          👶🏻 آیا در خانواده کودک زیر ۳ سال دارید؟
        </p>
        <div className="flex gap-3">
          <CardOption 
          selected={profile.hasChild} 
          onClick={() => update({ hasChild: true, childCount: Math.max(1, profile.childCount) })}>
            <div className="flex items-center gap-2">
              <span>بله</span>
            </div>
          </CardOption>
          <CardOption
          selected={!profile.hasChild}
          onClick={() => update({ hasChild: false, childCount: 0 })}>
            خیر
          </CardOption>
        </div>
      </div>

      {profile.hasChild && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex flex-col gap-2"
        >
          <p className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>
            تعداد کودکان:
          </p>
          <CounterInput
            value={profile.childCount}
            onChange={(v) => update({ childCount: v })}
            min={1}
            max={5}
          />
        </motion.div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-foreground" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
          👵🏻 آیا در خانواده سالمند دارید؟ (بالای ۷۰ سال)
        </p>
        <div className="flex gap-3">
          <CardOption
            selected={profile.hasElderly}
            onClick={() => update({ hasElderly: true, elderlyCount: Math.max(1, profile.elderlyCount) })}
          >
            <div className="flex items-center gap-2">
              <span>بله</span>
            </div>
          </CardOption>
          <CardOption
            selected={!profile.hasElderly}
            onClick={() => update({ hasElderly: false, elderlyCount: 0 })}
          >
            خیر
          </CardOption>
        </div>
      </div>

      {profile.hasElderly && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex flex-col gap-2"
        >
          <p className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>
            تعداد سالمندان:
          </p>
          <CounterInput
            value={profile.elderlyCount}
            onChange={(v) => update({ elderlyCount: v })}
            min={1}
            max={5}
          />
        </motion.div>
      )}
    </div>
  );
}

function Step2({ profile, update }: { profile: UserProfile; update: (u: Partial<UserProfile>) => void }) {
  const toggleDisease = (id: string) => {
    const current = profile.diseases;
    const updated = current.includes(id)
      ? current.filter((d) => d !== id)
      : [...current, id];
    update({ diseases: updated, hasDisease: updated.length > 0 });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-foreground" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
          💊 آیا در خانواده بیماری خاصی وجود دارد؟
        </p>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "0.8rem" }}>
         می‌توانید چند گزینه انتخاب کنید
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {diseaseOptions.map((d) => {
          const selected = profile.diseases.includes(d.id);
          return (
            <button
              key={d.id}
              onClick={() => toggleDisease(d.id)}
              className="p-3 rounded-xl text-center transition-all active:scale-95"
              style={{
                backgroundColor: selected ? "var(--primary)" : "var(--card)",
                border: `2px solid ${selected ? "var(--primary)" : "var(--border)"}`,
                color: selected ? "white" : "var(--foreground)",
                fontSize: "0.85rem",
                fontFamily: "'Vazirmatn', sans-serif",
              }}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {profile.diseases.length === 0 && (
        <button
          className="p-3 rounded-xl text-center"
          style={{
            backgroundColor: "var(--muted)",
            color: "var(--muted-foreground)",
            fontSize: "0.85rem",
            fontFamily: "'Vazirmatn', sans-serif",
          }}
          onClick={() => {}}
        >
          بیماری خاصی ندارند ✓
        </button>
      )}
    </div>
  );
}

function Step3({ profile, update }: { profile: UserProfile; update: (u: Partial<UserProfile>) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-foreground" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
          نوع مسکن شما:
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {[
          { id: "apartment", label: "آپارتمان", icon: "🏢" },
          { id: "house", label: "خانه ویلایی", icon: "🏠" },
          { id: "villa", label: "خانه روستایی", icon: "🛖" },
        ].map((opt) => (
          <CardOption
            key={opt.id}
            selected={profile.livingType === opt.id}
            onClick={() => update({ livingType: opt.id as UserProfile["livingType"] })}
          >
            <div className="flex items-center gap-3">
              <span style={{ fontSize: "1.25rem" }}>{opt.icon}</span>
              <span style={{ fontSize: "0.95rem" }}>{opt.label}</span>
            </div>
          </CardOption>
        ))}
      </div>

      {profile.livingType === "apartment" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-3"
        >
          <p className="text-foreground" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
            طبقه چندم هستید؟
          </p>
          <CounterInput
            value={profile.floor || 1}
            onChange={(v) => update({ floor: v })}
            min={1}
            max={30}
          />
          <div className="flex flex-col gap-2">
            <p className="text-foreground" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              آسانسور دارید؟
            </p>
            <div className="flex gap-3">
              <CardOption
                selected={!!profile.hasElevator}
                onClick={() => update({ hasElevator: true })}
              >
                بله
              </CardOption>
              <CardOption
                selected={!profile.hasElevator}
                onClick={() => update({ hasElevator: false })}
              >
                خیر
              </CardOption>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Step4({ profile, update }: { profile: UserProfile; update: (u: Partial<UserProfile>) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>
        این اطلاعات به شخصی‌سازی اقدامات پیشنهادی کمک می‌کند
      </p>

      <div className="flex flex-col gap-2">
        <p className="text-foreground" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
          🩺 آیا دوره کمک‌های اولیه را گذرانده‌اید؟
        </p>
        <div className="flex gap-3">
          <CardOption
            selected={profile.hasFirstAid}
            onClick={() => update({ hasFirstAid: true })}
          >
            <div className="flex items-center gap-2">
              <span>بله</span>
            </div>
          </CardOption>
          <CardOption
            selected={!profile.hasFirstAid}
            onClick={() => update({ hasFirstAid: false })}
          >
            خیر
          </CardOption>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-foreground" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
          🔦 آیا با وسایل نجات مانند طناب و چراغ‌قوه اضطراری آشنا هستید؟
        </p>
        <div className="flex gap-3">
          <CardOption
            selected={profile.hasToolsKnowledge}
            onClick={() => update({ hasToolsKnowledge: true })}
          >
            <div className="flex items-center gap-2">
              <span>بله</span>
            </div>
          </CardOption>
          <CardOption
            selected={!profile.hasToolsKnowledge}
            onClick={() => update({ hasToolsKnowledge: false })}
          >
            خیر
          </CardOption>
        </div>
      </div>

      <div
        className="rounded-2xl p-4 mt-2"
        style={{ backgroundColor: "#FFF3E0", border: "1px solid #FFB74D" }}
      >
        <p style={{ color: "#E65100", fontSize: "0.82rem", lineHeight: 1.6 }}>
          💡 پس از تکمیل، چک‌لیست شخصی شما با بیش از ۲۰ آیتم اختصاصی آماده می‌شود.
        </p>
      </div>
    </div>
  );
}