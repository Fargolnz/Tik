import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Edit2, Trash2, Plus, Download, ChevronDown, ChevronUp } from "lucide-react";
import { ChecklistItem } from "./data";
import { toPersianNumber } from "./data";


interface ChecklistViewProps {
  items: ChecklistItem[];
  onUpdate: (items: ChecklistItem[]) => void;
  onDownload: () => void;
}

const categoryIcons: Record<string, string> = {
  "آب و غذا": "🥫",
  "بهداشت و درمان": "💊",
  "روشنایی و ارتباطات": "🔦",
  "مدارک و اطلاعات": "📄",
  "ابزار و تجهیزات": "🔧",
  "پوشاک و وسایل": "👕",
  سایر: "📦",
};

const priorityColors: Record<string, string> = {
  high: "#C0392B",
  medium: "#E67E22",
  low: "#27AE60",
};

const priorityLabels: Record<string, string> = {
  high: "ضروری",
  medium: "مهم",
  low: "توصیه‌شده",
};

export function ChecklistView({ items, onUpdate, onDownload }: ChecklistViewProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editQty, setEditQty] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newCategory, setNewCategory] = useState("سایر");
  const [filter, setFilter] = useState<"all" | "unchecked" | "checked">("all");
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category)));
    return cats;
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "checked") return items.filter((i) => i.checked);
    return items.filter((i) => !i.checked);
  }, [items, filter]);

  const checkedCount = items.filter((i) => i.checked).length;
  const progress = Math.round((checkedCount / items.length) * 100);

  const toggle = (id: string) => {
    onUpdate(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  };

  const deleteItem = (id: string) => {
    onUpdate(items.filter((i) => i.id !== id));
  };

  const startEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditValue(item.title);
    setEditQty(item.quantity || "");
  };

  const saveEdit = (id: string) => {
    if (!editValue.trim()) return;
    onUpdate(
      items.map((i) =>
        i.id === id ? { ...i, title: editValue, quantity: editQty || undefined } : i
      )
    );
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const addItem = () => {
    if (!newTitle.trim()) return;
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      title: newTitle,
      category: newCategory,
      priority: "medium",
      quantity: newQty || undefined,
      checked: false,
      customizable: true,
    };
    onUpdate([...items, newItem]);
    setNewTitle("");
    setNewQty("");
    setShowAddForm(false);
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div
      className="flex flex-col h-full bg-background"
      dir="rtl"
      style={{ fontFamily: "'Vazirmatn', sans-serif" }}
    >
      {/* Header */}
      <div style={{ backgroundColor: "var(--primary)" }} className="px-5 pt-8 pb-5">
        <div className="flex items-center justify-between mb-3">
          <h1 style={{ color: "white", fontSize: "1.25rem", fontWeight: 700 }}>
            چک‌لیست اضطراری
          </h1>
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all active:scale-95"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", fontFamily: "'Vazirmatn', sans-serif", fontSize: "0.8rem" }}
          >
            <Download size={14} />
            دانلود
          </button>
        </div>

        {/* Progress */}
        <div className="mb-2 flex justify-between items-center">
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem" }}>
            {toPersianNumber(checkedCount)} از {toPersianNumber(items.length)} آیتم تهیه شده
          </span>
          <span style={{ color: "white", fontSize: "0.9rem", fontWeight: 700 }}>
            {toPersianNumber(progress)}٪
          </span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
          <motion.div
            className="h-full rounded-full bg-white"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div
        className="flex px-5 py-3 gap-2"
        style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}
      >
        {[
          { key: "all", label: `همه (${toPersianNumber(items.length)})` },
          { key: "unchecked", label: `باقی‌مانده (${toPersianNumber(items.length - checkedCount)})` },
          { key: "checked", label: `تهیه‌شده (${toPersianNumber(checkedCount)})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className="px-3 py-1.5 rounded-full transition-all"
            style={{
              backgroundColor: filter === f.key ? "var(--primary)" : "var(--muted)",
              color: filter === f.key ? "white" : "var(--muted-foreground)",
              fontSize: "0.75rem",
              fontFamily: "'Vazirmatn', sans-serif",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {categories.map((cat) => {
          const catItems = filtered.filter((i) => i.category === cat);
          if (catItems.length === 0) return null;
          const collapsed = collapsedCategories.has(cat);

          return (
            <div key={cat} className="mb-2">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between px-5 py-3"
                style={{
                  backgroundColor: "var(--muted)",
                  fontFamily: "'Vazirmatn', sans-serif",
                }}
              >
                <div className="flex items-center gap-2">
                  <span>{categoryIcons[cat] || "📦"}</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}>
                    {cat}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "var(--border)",
                      color: "var(--muted-foreground)",
                      fontSize: "0.7rem",
                    }}
                  >
                    {toPersianNumber(catItems.filter((i) => i.checked).length)}/{toPersianNumber(catItems.length)}
                  </span>
                </div>
                {collapsed ? (
                  <ChevronDown size={16} color="var(--muted-foreground)" />
                ) : (
                  <ChevronUp size={16} color="var(--muted-foreground)" />
                )}
              </button>

              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {catItems.map((item) => (
                      <ChecklistItemRow
                        key={item.id}
                        item={item}
                        isEditing={editingId === item.id}
                        editValue={editValue}
                        editQty={editQty}
                        onEditValueChange={setEditValue}
                        onEditQtyChange={setEditQty}
                        onToggle={() => toggle(item.id)}
                        onStartEdit={() => startEdit(item)}
                        onSaveEdit={() => saveEdit(item.id)}
                        onCancelEdit={cancelEdit}
                        onDelete={() => deleteItem(item.id)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Add Item FAB */}
      <div
        className="bottom-0 left-0 right-0 px-5 pb-6 pt-3"
        style={{
          background: "linear-gradient(to top, var(--background) 70%, transparent)",
          maxWidth: "430px",
          margin: "0 auto",
        }}
      >
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="rounded-2xl p-4 mb-3"
              style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
            >
              <input
                placeholder="نام آیتم جدید"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2 rounded-xl mb-2 outline-none"
                style={{
                  backgroundColor: "var(--input-background)",
                  color: "var(--foreground)",
                  fontSize: "0.9rem",
                  fontFamily: "'Vazirmatn', sans-serif",
                  border: "none",
                }}
                dir="rtl"
              />
              <input
                placeholder="مقدار (اختیاری)"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                className="w-full p-2 rounded-xl mb-2 outline-none"
                style={{
                  backgroundColor: "var(--input-background)",
                  color: "var(--foreground)",
                  fontSize: "0.9rem",
                  fontFamily: "'Vazirmatn', sans-serif",
                  border: "none",
                }}
                dir="rtl"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2 rounded-xl mb-3 outline-none"
                style={{
                  backgroundColor: "var(--input-background)",
                  color: "var(--foreground)",
                  fontSize: "0.9rem",
                  fontFamily: "'Vazirmatn', sans-serif",
                  border: "none",
                }}
                dir="rtl"
              >
                {Object.keys(categoryIcons).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={addItem}
                  className="flex-1 py-2.5 rounded-xl text-white"
                  style={{
                    backgroundColor: "var(--primary)",
                    fontFamily: "'Vazirmatn', sans-serif",
                    fontSize: "0.9rem",
                  }}
                >
                  افزودن
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 rounded-xl"
                  style={{
                    backgroundColor: "var(--muted)",
                    color: "var(--foreground)",
                    fontFamily: "'Vazirmatn', sans-serif",
                    fontSize: "0.9rem",
                  }}
                >
                  انصراف
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full px-32 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-white transition-all active:scale-95"
          style={{
            backgroundColor: showAddForm ? "var(--muted)" : "var(--primary)",
            color: showAddForm ? "var(--foreground)" : "white",
            fontFamily: "'Vazirmatn', sans-serif",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          <Plus size={18} />
          افزودن مورد دلخواه
        </button>
      </div>
    </div>
  );
}

function ChecklistItemRow({
  item,
  isEditing,
  editValue,
  editQty,
  onEditValueChange,
  onEditQtyChange,
  onToggle,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: {
  item: ChecklistItem;
  isEditing: boolean;
  editValue: string;
  editQty: string;
  onEditValueChange: (v: string) => void;
  onEditQtyChange: (v: string) => void;
  onToggle: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      className="flex flex-col"
      style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--card)" }}
    >
      {/* Main row */}
      <div className="flex items-start gap-3 px-5 py-3.5">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className="w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-all active:scale-90"
          style={{
            backgroundColor: item.checked ? "#27AE60" : "transparent",
            borderColor: item.checked ? "#27AE60" : "var(--border)",
          }}
        >
          {item.checked && <Check size={13} color="white" strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              style={{
                fontSize: "0.9rem",
                fontWeight: 500,
                color: item.checked ? "var(--muted-foreground)" : "var(--foreground)",
                textDecoration: item.checked ? "line-through" : "none",
              }}
            >
              {item.title}
            </p>
            <span
              className="px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${priorityColors[item.priority]}15`,
                color: priorityColors[item.priority],
                fontSize: "0.68rem",
                fontWeight: 700,
              }}
            >
              {priorityLabels[item.priority]}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {item.quantity && (
              <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                {item.quantity}
              </span>
            )}
          </div>
          {item.description && (
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: 2 }}>
              {item.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={onStartEdit}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
            style={{ backgroundColor: "var(--muted)" }}
          >
            <Edit2 size={13} color="var(--muted-foreground)" />
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
            style={{ backgroundColor: "#FFEBEE" }}
          >
            <Trash2 size={13} color="#C0392B" />
          </button>
        </div>
      </div>

      {/* Edit panel */}
      <AnimatePresence initial={false}>
        {isEditing && (
          <motion.div
            key="edit"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div className="px-5 pb-3.5 pt-2 flex flex-col gap-2">
              <input
                value={editValue}
                onChange={(e) => onEditValueChange(e.target.value)}
                placeholder="نام آیتم"
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
              <input
                value={editQty}
                onChange={(e) => onEditQtyChange(e.target.value)}
                placeholder="مقدار مورد نیاز (اختیاری)"
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
              <div className="flex gap-2">
                <button
                  onClick={onSaveEdit}
                  className="flex-1 py-2 rounded-xl text-white transition-all active:scale-95"
                  style={{
                    backgroundColor: "var(--primary)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    fontFamily: "'Vazirmatn', sans-serif",
                  }}
                >
                  ذخیره
                </button>
                <button
                  onClick={onCancelEdit}
                  className="flex-1 py-2 rounded-xl transition-all active:scale-95"
                  style={{
                    backgroundColor: "var(--muted)",
                    color: "var(--foreground)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    fontFamily: "'Vazirmatn', sans-serif",
                  }}
                >
                  انصراف
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}