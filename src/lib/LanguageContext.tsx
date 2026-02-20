"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Lang = "ar" | "en";

const translations = {
    // Navbar
    "nav.portfolio": { ar: "المعرض", en: "Portfolio" },
    "nav.booklets": { ar: "الكتيبات", en: "Booklets" },
    "nav.admin": { ar: "لوحة التحكم", en: "Admin Login" },

    // Gallery
    "gallery.noProjects": { ar: "لا توجد مشاريع بعد.", en: "No projects yet." },
    "gallery.loginHint": { ar: "سجل دخول كأدمن لإضافة مشاريع.", en: "Log in as admin to add gallery projects." },
    "gallery.exploreNow": { ar: "استعرض الآن", en: "Explore Now" },
    "gallery.image": { ar: "صورة", en: "image" },
    "gallery.images": { ar: "صور", en: "images" },
    "gallery.noImage": { ar: "لا توجد صورة", en: "No image" },
    "gallery.noImages": { ar: "لا توجد صور", en: "No images" },

    // Booklets page
    "booklets.title": { ar: "مكتبة الكتيبات التفاعلية", en: "Interactive Booklets Library" },
    "booklets.subtitle": { ar: "استعرض أحدث الكتيبات والإصدارات التفاعلية. انقر على أي كتيب لتصفحه بتجربة قراءة ثلاثية الأبعاد ممتعة.", en: "Browse the latest interactive booklets and publications. Click on any booklet for an immersive 3D reading experience." },
    "booklets.noBooklets": { ar: "لا توجد كتيبات", en: "No booklets" },
    "booklets.noBookletsHint": { ar: "لم يتم رفع أي كتيبات حتى الآن.", en: "No booklets have been uploaded yet." },
    "booklets.readBooklet": { ar: "قراءة الكتيب", en: "Read Booklet" },

    // PDF Viewer
    "pdf.prev": { ar: "◀ السابق", en: "◀ Prev" },
    "pdf.next": { ar: "التالي ▶", en: "Next ▶" },
    "pdf.twoPages": { ar: "صفحتين", en: "Two Pages" },
    "pdf.singlePage": { ar: "صفحة واحدة", en: "Single Page" },
    "pdf.twoPageTitle": { ar: "عرض صفحتين", en: "Show Two Pages" },
    "pdf.singlePageTitle": { ar: "عرض صفحة واحدة", en: "Show Single Page" },
    "pdf.share": { ar: "مشاركة", en: "Share" },
    "pdf.loading": { ar: "جاري التحميل...", en: "Loading..." },
    "pdf.loadingReader": { ar: "جاري تهيئة القارئ...", en: "Initializing reader..." },
    "pdf.errorLoading": { ar: "فشل تحميل الـ PDF", en: "Failed to load PDF" },

    // Share Modal
    "share.title": { ar: "مشاركة الكتيب", en: "Share Booklet" },
    "share.copyDirect": { ar: "نسخ الرابط المباشر", en: "Copy Direct Link" },
    "share.copy": { ar: "نسخ", en: "Copy" },
    "share.copied": { ar: "✓ تم النسخ", en: "✓ Copied" },
    "share.advanced": { ar: "إعدادات متقدمة", en: "Advanced Settings" },
    "share.tempLink": { ar: "رابط مؤقت", en: "Temporary Link" },
    "share.expiresAfter": { ar: "ينتهي بعد", en: "Expires after" },
    "share.days": { ar: "يوم", en: "days" },
    "share.secretCode": { ar: "رمز سري", en: "Secret Code" },
    "share.enterSecret": { ar: "أدخل الرمز السري...", en: "Enter secret code..." },
    "share.generate": { ar: "إنشاء رابط المشاركة", en: "Generate Share Link" },
    "share.generating": { ar: "جاري الإنشاء...", en: "Generating..." },
    "share.success": { ar: "✓ تم إنشاء الرابط بنجاح", en: "✓ Link created successfully" },
    "share.done": { ar: "✓ تم", en: "✓ Done" },
    "share.expiresIn": { ar: "ينتهي بعد", en: "Expires in" },
    "share.day": { ar: "يوم", en: "day(s)" },
    "share.protected": { ar: "محمي برمز سري", en: "Protected by secret code" },
    "share.error": { ar: "حدث خطأ أثناء إنشاء الرابط", en: "Error creating share link" },

    // Shared page
    "shared.checking": { ar: "جاري التحقق من الرابط...", en: "Verifying link..." },
    "shared.expired": { ar: "انتهت الصلاحية", en: "Link Expired" },
    "shared.expiredHint": { ar: "هذا الرابط لم يعد صالحاً. يرجى طلب رابط جديد من صاحب الكتيب.", en: "This link is no longer valid. Please request a new link from the booklet owner." },
    "shared.needsCode": { ar: "محمي برمز سري", en: "Protected by Secret Code" },
    "shared.needsCodeHint": { ar: "يرجى إدخال الرمز السري للوصول إلى هذا الكتيب", en: "Please enter the secret code to access this booklet" },
    "shared.enterCode": { ar: "أدخل الرمز السري...", en: "Enter secret code..." },
    "shared.open": { ar: "فتح الكتيب", en: "Open Booklet" },
    "shared.invalid": { ar: "رابط غير صالح", en: "Invalid Link" },
    "shared.invalidHint": { ar: "الرابط المطلوب غير موجود أو غير صالح.", en: "The requested link does not exist or is invalid." },

    // Delete modal
    "delete.title": { ar: "تأكيد الحذف", en: "Confirm Delete" },
    "delete.confirm": { ar: "هل أنت متأكد من حذف هذا الكتيب؟", en: "Are you sure you want to delete this booklet?" },
    "delete.cancel": { ar: "إلغاء", en: "Cancel" },
    "delete.yes": { ar: "نعم، احذف", en: "Yes, Delete" },
    "delete.bookletTitle": { ar: "حذف الكتيب", en: "Delete Booklet" },
} as const;

type TranslationKey = keyof typeof translations;

interface LanguageContextType {
    lang: Lang;
    toggleLang: () => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Lang>("en");

    const toggleLang = useCallback(() => {
        setLang((prev) => (prev === "ar" ? "en" : "ar"));
    }, []);

    const t = useCallback(
        (key: TranslationKey): string => {
            return translations[key]?.[lang] ?? key;
        },
        [lang]
    );

    return (
        <LanguageContext.Provider value={{ lang, toggleLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLang() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLang must be used within a LanguageProvider");
    }
    return context;
}
