export interface UserProfile {
  familyCount: number;
  hasChild: boolean;
  childCount: number;
  hasElderly: boolean;
  elderlyCount: number;
  hasDisease: boolean;
  diseases: string[];
  hasPet: boolean;
  petCount: number;
  livingType: "apartment" | "house" | "villa" | "";
  floor?: number;
  hasElevator?: boolean;
  hasToolsKnowledge: boolean;
  hasFirstAid: boolean;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: "high" | "medium" | "low";
  quantity?: string;
  checked: boolean;
  customizable: boolean;
}

export interface ActionItem {
  id: string;
  phase: "before" | "during" | "after";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  checked: boolean;
}

export const diseaseOptions = [
  { id: "diabetes", label: "دیابت" },
  { id: "asthma", label: "آسم" },
  { id: "heart", label: "بیماری قلبی" },
  { id: "blood_pressure", label: "فشار خون" },
  { id: "kidney", label: "بیماری کلیوی" },
  { id: "epilepsy", label: "صرع" },
  { id: "cancer", label: "سرطان" },
  { id: "mobility", label: "ناتوانی حرکتی" },
  { id: "vision", label: "نقص بینایی" },
  { id: "hearing", label: "نقص شنوایی" },
];

export function generateChecklist(profile: UserProfile): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  // آب
  const waterLiters = profile.familyCount * 0.5 * 3;
  items.push({
    id: "water",
    title: "آب آشامیدنی",
    description: "برای هر نفر ۳ لیتر در روز",
    category: "آب و غذا",
    priority: "high",
    quantity: `${waterLiters} لیتر (برای ۳ روز)`,
    checked: false,
    customizable: true,
  });

  // غذا
  items.push({
    id: "food_canned",
    title: "کنسرو و غذای آماده",
    description: "غذاهای با ماندگاری بالا",
    category: "آب و غذا",
    priority: "high",
    quantity: `${profile.familyCount * 2} وعده`,
    checked: false,
    customizable: true,
  });

  items.push({
    id: "food_dry",
    title: "بیسکوییت و خرما",
    description: "مواد غذایی خشک با ماندگاری بالا",
    category: "آب و غذا",
    priority: "high",
    quantity: `${profile.familyCount * 3 * 3} عدد برای ۳ روز`,
    checked: false,
    customizable: true,
  });

  if (profile.hasChild) {
    items.push({
      id: "baby_food",
      title: "غذای کودک و شیر خشک",
      description: "برای کودکان زیر ۳ سال",
      category: "آب و غذا",
      priority: "high",
      quantity: `ذخیره ۱ هفته‌ای برای ${profile.childCount}  کودک`,
      checked: false,
      customizable: true,
    });
  }

  // کمک‌های اولیه
  items.push({
    id: "first_aid_kit",
    title: "کیف کمک‌های اولیه",
    description: "باند، گاز، چسب زخم، قیچی، پنس",
    category: "بهداشت و درمان",
    priority: "high",
    checked: false,
    customizable: false,
  });

  items.push({
    id: "pain_killers",
    title: "داروهای عمومی",
    description: "مسکن، تب‌بر، ضدعفونی‌کننده",
    category: "بهداشت و درمان",
    priority: "high",
    checked: false,
    customizable: true,
  });

  if (profile.hasDisease && profile.diseases.length > 0) {
    items.push({
      id: "special_meds",
      title: "داروهای بیماری‌های خاص",
      description: `داروهای مورد نیاز: ${profile.diseases.join("، ")}`,
      category: "بهداشت و درمان",
      priority: "high",
      quantity: "ذخیره ۱ ماهه",
      checked: false,
      customizable: true,
    });
  }

  if (profile.diseases.includes("diabetes")) {
    items.push({
      id: "glucose_meter",
      title: "گلوکومتر و نوار قند خون",
      description: "برای پایش قند خون",
      category: "بهداشت و درمان",
      priority: "high",
      quantity: "۵۰ نوار اضافی",
      checked: false,
      customizable: true,
    });
  }

  if (profile.diseases.includes("asthma")) {
    items.push({
      id: "inhaler",
      title: "اسپری تنفسی",
      description: "برای بیمار آسمی",
      category: "بهداشت و درمان",
      priority: "high",
      quantity: "۲ عدد اضافی",
      checked: false,
      customizable: true,
    });
  }

  // روشنایی و ارتباطات
  items.push({
    id: "flashlight",
    title: "چراغ‌قوه و باتری",
    description: "برای قطعی برق",
    category: "روشنایی و ارتباطات",
    priority: "high",
    quantity: `${Math.ceil(profile.familyCount / 2)} عدد`,
    checked: false,
    customizable: true,
  });

  items.push({
    id: "candles",
    title: "شمع و فندک",
    description: "منبع نور جایگزین",
    category: "روشنایی و ارتباطات",
    priority: "medium",
    quantity: "۱۰ عدد",
    checked: false,
    customizable: true,
  });

  items.push({
    id: "radio",
    title: "رادیو باتری‌دار",
    description: "برای دریافت اخبار بدون برق",
    category: "روشنایی و ارتباطات",
    priority: "high",
    checked: false,
    customizable: false,
  });

  items.push({
    id: "powerbank",
    title: "پاور بانک",
    description: "شارژر قابل حمل برای موبایل",
    category: "روشنایی و ارتباطات",
    priority: "high",
    quantity: `${profile.familyCount > 3 ? 2 : 1} عدد`,
    checked: false,
    customizable: true,
  });

  // مدارک
  items.push({
    id: "documents",
    title: "کپی مدارک مهم",
    description: "شناسنامه، کارت ملی، سند خانه، بیمه‌نامه",
    category: "مدارک و اطلاعات",
    priority: "high",
    checked: false,
    customizable: false,
  });

  items.push({
    id: "emergency_contacts",
    title: "لیست شماره‌های اضطراری",
    description: "اورژانس، آتش‌نشانی، پلیس، بستگان",
    category: "مدارک و اطلاعات",
    priority: "high",
    checked: false,
    customizable: true,
  });

  items.push({
    id: "cash",
    title: "پول نقد",
    description: "در صورت قطع شبکه بانکی",
    category: "مدارک و اطلاعات",
    priority: "high",
    quantity: "حداقل ۵۰۰،۰۰۰ تومان",
    checked: false,
    customizable: true,
  });

  // ابزار
  items.push({
    id: "whistle",
    title: "سوت اضطراری",
    description: "برای جلب توجه در زیر آوار",
    category: "ابزار و تجهیزات",
    priority: "high",
    quantity: `${profile.familyCount} عدد`,
    checked: false,
    customizable: false,
  });

  items.push({
    id: "multi_tool",
    title: "ابزار چندکاره",
    description: "چاقو، انبر، آچار کوچک",
    category: "ابزار و تجهیزات",
    priority: "medium",
    checked: false,
    customizable: false,
  });

  items.push({
    id: "gas_shutoff",
    title: "آچار قطع گاز",
    description: "برای قطع اضطراری گاز",
    category: "ابزار و تجهیزات",
    priority: "high",
    checked: false,
    customizable: false,
  });

  items.push({
    id: "fire_extinguisher",
    title: "کپسول آتش‌نشانی خانگی",
    description: "حداقل یک عدد در منزل",
    category: "ابزار و تجهیزات",
    priority: "high",
    checked: false,
    customizable: false,
  });

  // پوشاک و محافظت
  items.push({
    id: "shoes",
    title: "کفش محکم و دستکش",
    description: "برای حرکت در آوار",
    category: "پوشاک و محافظت",
    priority: "high",
    quantity: `برای ${profile.familyCount} نفر`,
    checked: false,
    customizable: true,
  });

  items.push({
    id: "mask",
    title: "ماسک N95 یا FFP2",
    description: "در برابر گرد و غبار و گازها",
    category: "پوشاک و محافظت",
    priority: "medium",
    quantity: `${profile.familyCount} عدد`,
    checked: false,
    customizable: true,
  });

  items.push({
    id: "warm_clothes",
    title: "لباس گرم اضافی",
    description: "برای هر عضو خانواده",
    category: "پوشاک و محافظت",
    priority: "medium",
    quantity: `${profile.familyCount} دست`,
    checked: false,
    customizable: true,
  });

  if (profile.hasChild) {
    items.push({
      id: "child_items",
      title: "لوازم ضروری کودک",
      description: "پوشک، پستانک، دارو، اسباب‌بازی آرام‌بخش",
      category: "پوشاک و محافظت",
      priority: "high",
      checked: false,
      customizable: true,
    });
  }

  if (profile.hasElderly) {
    items.push({
      id: "elderly_items",
      title: "وسایل کمکی سالمند",
      description: "عصا، عینک، دندان مصنوعی، داروهای خاص",
      category: "بهداشت و درمان",
      priority: "high",
      checked: false,
      customizable: true,
    });
  }

  if (profile.hasPet) {
    items.push({
      id: "pet_supplies",
      title: "لوازم حیوان خانگی",
      description: "غذا، ظرف، قفس، مدارک واکسن",
      category: "سایر",
      priority: "medium",
      quantity: "ذخیره ۳ روزه",
      checked: false,
      customizable: true,
    });
  }

  // بهداشت
  items.push({
    id: "sanitation",
    title: "لوازم بهداشتی",
    description: "دستمال کاغذی، ژل ضدعفونی، صابون، پد بهداشتی",
    category: "بهداشت و درمان",
    priority: "medium",
    quantity: "ذخیره ۲ هفته‌ای",
    checked: false,
    customizable: true,
  });

  items.push({
    id: "blanket",
    title: "پتوی اضطراری (فویل نجات)",
    description: "برای گرم نگه داشتن آسیب‌دیدگان",
    category: "پوشاک و محافظت",
    priority: "medium",
    quantity: `${profile.familyCount} عدد`,
    checked: false,
    customizable: true,
  });

  if (profile.livingType === "apartment" && (profile.floor || 0) > 3) {
    items.push({
      id: "rope",
      title: "طناب فرار از ارتفاع",
      description: "برای فرار اضطراری از طبقات بالا",
      category: "ابزار و تجهیزات",
      priority: "high",
      quantity: `${(profile.floor || 4) * 4} متر`,
      checked: false,
      customizable: true,
    });
  }

  return items;
}

export function generateActions(profile: UserProfile): ActionItem[] {
  const actions: ActionItem[] = [];

  // Before crisis
  actions.push({
    id: "a1",
    phase: "before",
    title: "تهیه کیف اضطراری",
    description:
      "یک کوله‌پشتی آماده کنید با وسایل ضروری برای ۷۲ ساعت که همیشه قابل دسترس باشد.",
    priority: "high",
    checked: false,
  });

  actions.push({
    id: "a2",
    phase: "before",
    title: "تعیین نقطه تجمع خانوادگی",
    description:
      "یک مکان مشخص در خارج از خانه برای تجمع خانواده در صورت جدایی تعیین کنید.",
    priority: "high",
    checked: false,
  });

  actions.push({
    id: "a3",
    phase: "before",
    title: "آموزش اعضای خانواده",
    description:
      "کلیه اعضای خانواده را با مکان شیر آب، کنتور گاز و کلید برق آشنا کنید.",
    priority: "high",
    checked: false,
  });

  actions.push({
    id: "a4",
    phase: "before",
    title: "ذخیره‌سازی مواد غذایی و آب",
    description:
      "بر اساس چک‌لیست تهیه‌شده، تمام اقلام را ذخیره و تاریخ انقضا را بررسی کنید.",
    priority: "high",
    checked: false,
  });

  actions.push({
    id: "a5",
    phase: "before",
    title: "بررسی ساختمان از نظر ایمنی",
    description:
      "وسایل سنگین را مهار کنید، قفسه‌ها را محکم کنید، درزهای گازی را چک کنید.",
    priority: "medium",
    checked: false,
  });

  if (!profile.hasFirstAid) {
    actions.push({
      id: "a6",
      phase: "before",
      title: "گذراندن دوره کمک‌های اولیه",
      description:
        "دوره CPR و کمک‌های اولیه را بگذرانید. هلال احمر دوره‌های رایگان ارائه می‌دهد.",
      priority: "high",
      checked: false,
    });
  }

  actions.push({
    id: "a7",
    phase: "before",
    title: "بیمه اموال و زندگی",
    description: "بیمه زلزله و آتش‌سوزی برای منزل خود تهیه کنید.",
    priority: "medium",
    checked: false,
  });

  if (profile.hasDisease) {
    actions.push({
      id: "a8",
      phase: "before",
      title: "مشورت با پزشک برای برنامه اضطراری",
      description:
        "با پزشک خود برنامه‌ای برای مدیریت بیماری در شرایط بحران تنظیم کنید.",
      priority: "high",
      checked: false,
    });
  }

  // During crisis
  actions.push({
    id: "d1",
    phase: "during",
    title: "آرامش خود را حفظ کنید",
    description: "در بحران، آرامش مهم‌ترین عامل تصمیم‌گیری درست است.",
    priority: "high",
    checked: false,
  });

  actions.push({
    id: "d2",
    phase: "during",
    title: "قطع گاز، برق و آب",
    description:
      "بلافاصله شیر گاز، کلید اصلی برق و آب را قطع کنید تا از حوادث ثانوی جلوگیری شود.",
    priority: "high",
    checked: false,
  });

  actions.push({
    id: "d3",
    phase: "during",
    title: "رفتن به مکان امن",
    description:
      "زیر میز محکم، کنار دیوار باربر یا در چهارچوب در بایستید. از پنجره و آسانسور دوری کنید.",
    priority: "high",
    checked: false,
  });

  actions.push({
    id: "d4",
    phase: "during",
    title: "تماس با اعضای خانواده",
    description:
      "پس از مرحله اولیه، با اعضای خانواده تماس بگیرید و وضعیت را اطلاع دهید.",
    priority: "high",
    checked: false,
  });

  actions.push({
    id: "d5",
    phase: "during",
    title: "استفاده از رادیو برای اطلاعات",
    description: "رادیو را روشن کنید و دستورالعمل‌های رسمی را دنبال کنید.",
    priority: "medium",
    checked: false,
  });

  if (profile.livingType === "apartment") {
    actions.push({
      id: "d6",
      phase: "during",
      title: "تخلیه ساختمان از پله (نه آسانسور)",
      description:
        "در صورت دستور تخلیه، فقط از راه‌پله استفاده کنید. آسانسور را هرگز استفاده نکنید.",
      priority: "high",
      checked: false,
    });
  }

  // After crisis
  actions.push({
    id: "after1",
    phase: "after",
    title: "بررسی آسیب‌های ساختمان",
    description:
      "قبل از ورود، سازه را از بیرون بررسی کنید. به ترک‌های بزرگ یا آسیب‌های جدی توجه کنید.",
    priority: "high",
    checked: false,
  });

  actions.push({
    id: "after2",
    phase: "after",
    title: "ارائه کمک به مجروحین",
    description:
      "ابتدا به مصدومین رسیدگی کنید. با اورژانس ۱۱۵ تماس بگیرید.",
    priority: "high",
    checked: false,
  });

  actions.push({
    id: "after3",
    phase: "after",
    title: "ثبت خسارات",
    description: "از خرابی‌ها عکس بگیرید برای اعلام به بیمه.",
    priority: "medium",
    checked: false,
  });

  actions.push({
    id: "after4",
    phase: "after",
    title: "بازپرسازی کیف اضطراری",
    description: "پس از پایان بحران، کیف اضطراری را دوباره تجهیز کنید.",
    priority: "medium",
    checked: false,
  });

  return actions;
}