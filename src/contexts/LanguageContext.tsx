import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "ar" | "en";

const translations = {
  ar: {
    home: "الرئيسية",
    archive: "الأرشيف",
    timeline: "الجدول الزمني",
    map: "الخريطة",
    heritage: "التراث غير المادي",
    about: "عن المنصة",
    search: "بحث",
    searchArchive: "ابحث في الأرشيف...",
    filters: "فلاتر",
    clear: "مسح",
    loading: "جاري التحميل...",
    results: "نتيجة",
    favorites: "المفضلة",
    dashboard: "لوحة التحكم",
    signOut: "تسجيل الخروج",
    signIn: "تسجيل الدخول",
    governorate: "المحافظة",
    heritageCategory: "فئة التراث",
    tags: "الوسوم",
    timeEra: "الحقبة الزمنية",
    noResults: "لا توجد نتائج مطابقة.",
    resetFilters: "إعادة ضبط جميع الفلاتر",
    overview: "نظرة عامة",
    saved: "محفوظة",
    save: "حفظ",
    share: "مشاركة",
    year: "السنة",
    photographer: "المصور",
    coordinates: "الإحداثيات",
    comments: "التعليقات",
    addComment: "أضف تعليقك...",
    sending: "جاري الإرسال...",
    send: "إرسال",
    loginToComment: "سجّل دخولك للتعليق",
    anonymous: "مجهول",
    noComments: "لا توجد تعليقات بعد.",
    relatedPhotos: "صور ذات صلة",
    adminDashboard: "لوحة القيادة",
    usersList: "المستخدمون",
    uploadPhoto: "رفع صورة جديدة",
    date: "التاريخ",
    status: "الحالة",
    settings: "الإعدادات",
    backToSite: "العودة للموقع",
    adminPanel: "لوحة الإدارة",
    statsPanel: "لوحة الإحصائيات",
    photos: "الصور",
    taxonomy: "المحافظات والوسوم",
  },
  en: {
    home: "Home",
    archive: "Archive",
    timeline: "Timeline",
    map: "Map",
    heritage: "Intangible Heritage",
    about: "About",
    search: "Search",
    searchArchive: "Search in archive...",
    filters: "Filters",
    clear: "Clear",
    loading: "Loading...",
    results: "results",
    favorites: "Favorites",
    dashboard: "Dashboard",
    signOut: "Sign Out",
    signIn: "Sign In",
    governorate: "Governorate",
    heritageCategory: "Category",
    tags: "Tags",
    timeEra: "Time Era",
    noResults: "No matching results.",
    resetFilters: "Reset all filters",
    overview: "Overview",
    saved: "Saved",
    save: "Save",
    share: "Share",
    year: "Year",
    photographer: "Photographer",
    coordinates: "Coordinates",
    comments: "Comments",
    addComment: "Add your comment...",
    sending: "Sending...",
    send: "Send",
    loginToComment: "Sign in to comment",
    anonymous: "Anonymous",
    noComments: "No comments yet.",
    relatedPhotos: "Related Photos",
    adminDashboard: "Dashboard",
    usersList: "Users",
    uploadPhoto: "Upload Photo",
    date: "Date",
    status: "Status",
    settings: "Settings",
    backToSite: "Back to site",
    adminPanel: "Admin Panel",
    statsPanel: "Statistics",
    photos: "Photos",
    taxonomy: "Locations & Tags",
  }
};

type TranslationKey = keyof typeof translations.ar;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, fallbackAr?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");

  useEffect(() => {
    const saved = localStorage.getItem("felen-lang") as Language;
    if (saved && (saved === "ar" || saved === "en")) {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("felen-lang", lang);
  };

  const t = (key: TranslationKey, fallbackAr?: string) => {
    const val = translations[language][key];
    if (val) return val;
    return language === "ar" ? (fallbackAr || key) : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
