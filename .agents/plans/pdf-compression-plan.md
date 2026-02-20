# خطة تنفيذ ضغط ملفات PDF — Client-Side Compression

## نظرة عامة

إضافة آلية ضغط ملفات PDF في متصفح المستخدم (Client-Side) قبل رفعها إلى Supabase Storage، باستخدام مكتبة `@quicktoolsone/pdf-compress` (WebAssembly). الهدف تقليل حجم الملف بأقصى درجة ممكنة مع الحفاظ على الجودة والوضوح.

---

## البنية الحالية للملفات المعنية

### 1. `src/components/admin/BookletManager.tsx` (Client Component)

- يحتوي على نموذج رفع الكتيبات (form).
- الدالة `handleUpload(formData)` تُرسل الـ FormData مباشرة إلى Server Action.
- الملف فيه: عنوان + اختيار PDF + رابط خارجي + زر Submit.

### 2. `src/app/admin/(protected)/booklets/actions.ts` (Server Action)

- الدالة `uploadBooklet(formData)` تستقبل FormData وترفع الملف إلى Supabase Storage.
- الحد الأقصى حالياً: 250MB.

### 3. `src/lib/LanguageContext.tsx`

- نظام الترجمة. يجب إضافة مفاتيح جديدة للنصوص المتعلقة بالضغط.

---

## المراحل التفصيلية

---

### المرحلة 1: تثبيت المكتبة

```bash
npm install @quicktoolsone/pdf-compress
```

> **ملاحظة:** إذا لم تكن المكتبة متاحة أو بها مشاكل، البديل هو استخدام `pdf-lib` مع ضغط يدوي للصور.
> في هذه الحالة:
>
> ```bash
> npm install pdf-lib
> ```

---

### المرحلة 2: إنشاء Utility للضغط

**ملف جديد:** `src/lib/pdfCompressor.ts`

```typescript
/**
 * PDF Compression Utility (Client-Side)
 * يعمل في المتصفح فقط — لا يمكن استخدامه في Server Components.
 */

export interface CompressionResult {
    originalSize: number;
    compressedSize: number;
    compressedFile: File;
    compressionRatio: number; // e.g., 0.65 means 65% of original
}

export type CompressionLevel = "lossless" | "balanced" | "max";

export async function compressPDF(
    file: File,
    level: CompressionLevel = "balanced",
    onProgress?: (percent: number) => void
): Promise<CompressionResult> {
    const originalSize = file.size;

    try {
        // الخيار الأول: @quicktoolsone/pdf-compress
        const { compress } = await import("@quicktoolsone/pdf-compress");
        
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const result = await compress(uint8Array, {
            preset: level, // "lossless" | "balanced" | "max"
            onProgress: (p: number) => {
                onProgress?.(Math.round(p * 100));
            },
        });

        const compressedBlob = new Blob([result], { type: "application/pdf" });
        const compressedFile = new File([compressedBlob], file.name, {
            type: "application/pdf",
        });

        return {
            originalSize,
            compressedSize: compressedFile.size,
            compressedFile,
            compressionRatio: compressedFile.size / originalSize,
        };
    } catch (error) {
        console.warn("PDF compression failed, using original file:", error);
        // إذا فشل الضغط، أعد الملف الأصلي
        return {
            originalSize,
            compressedSize: originalSize,
            compressedFile: file,
            compressionRatio: 1,
        };
    }
}

/**
 * Helper: تنسيق حجم الملف للعرض (bytes → MB/KB)
 */
export function formatFileSize(bytes: number): string {
    if (bytes >= 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }
    return (bytes / 1024).toFixed(1) + " KB";
}
```

> **ملاحظة مهمة:** إذا لم تعمل مكتبة `@quicktoolsone/pdf-compress` بشكل صحيح (لأنها جديدة)، استخدم الخيار البديل التالي باستخدام `pdf-lib`:

```typescript
// --- البديل باستخدام pdf-lib ---
import { PDFDocument } from "pdf-lib";

export async function compressPDF(
    file: File,
    level: CompressionLevel = "balanced",
    onProgress?: (percent: number) => void
): Promise<CompressionResult> {
    const originalSize = file.size;
    onProgress?.(10);

    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(30);

    const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
    });
    onProgress?.(50);

    // إزالة البيانات غير الضرورية
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("");
    pdfDoc.setCreator("");
    onProgress?.(70);

    // حفظ مع ضغط داخلي
    const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,        // ضغط بنية الملف
        addDefaultPage: false,
        objectsPerTick: 100,
    });
    onProgress?.(90);

    const compressedBlob = new Blob([compressedBytes], { type: "application/pdf" });
    const compressedFile = new File([compressedBlob], file.name, {
        type: "application/pdf",
    });
    onProgress?.(100);

    return {
        originalSize,
        compressedSize: compressedFile.size,
        compressedFile,
        compressionRatio: compressedFile.size / originalSize,
    };
}
```

---

### المرحلة 3: تعديل `BookletManager.tsx`

**الملف:** `src/components/admin/BookletManager.tsx`

#### التغييرات المطلوبة

**3.1 — إضافة imports جديدة (أعلى الملف):**

```typescript
import { compressPDF, formatFileSize, CompressionLevel } from "@/lib/pdfCompressor";
```

**3.2 — إضافة States جديدة (بعد السطر 15 تقريباً، مع States الموجودة):**

```typescript
const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("balanced");
const [compressionProgress, setCompressionProgress] = useState<number>(0);
const [compressionResult, setCompressionResult] = useState<{
    originalSize: number;
    compressedSize: number;
    ratio: number;
} | null>(null);
const [isCompressing, setIsCompressing] = useState(false);
```

**3.3 — تعديل دالة `handleUpload` (الأسطر 22-38):**

استبدل الدالة بالكامل بالتالي:

```typescript
async function handleUpload(formData: FormData) {
    setIsUploading(true);
    setError(null);
    setCompressionResult(null);

    try {
        // التحقق من وجود ملف PDF محلي
        const pdfFile = formData.get("pdf") as File | null;

        if (pdfFile && pdfFile.size > 0 && pdfFile.name !== "undefined") {
            // -- مرحلة الضغط --
            setIsCompressing(true);
            setCompressionProgress(0);

            const result = await compressPDF(
                pdfFile,
                compressionLevel,
                (progress) => setCompressionProgress(progress)
            );

            setCompressionResult({
                originalSize: result.originalSize,
                compressedSize: result.compressedSize,
                ratio: result.compressionRatio,
            });
            setIsCompressing(false);

            // استبدال الملف الأصلي بالملف المضغوط في FormData
            const newFormData = new FormData();
            newFormData.set("title", formData.get("title") as string);
            newFormData.set("pdf", result.compressedFile);
            // الاحتفاظ بالرابط الخارجي إن وجد
            const extUrl = formData.get("externalUrl");
            if (extUrl) newFormData.set("externalUrl", extUrl as string);

            const uploadResult = await uploadBooklet(newFormData);
            if (uploadResult?.error) {
                setError(uploadResult.error);
            } else {
                (document.getElementById("upload-form") as HTMLFormElement).reset();
                setCompressionResult(null);
                router.refresh();
            }
        } else {
            // رابط خارجي فقط — لا يوجد ضغط
            const result = await uploadBooklet(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                (document.getElementById("upload-form") as HTMLFormElement).reset();
                router.refresh();
            }
        }
    } catch (e: any) {
        setError(e.message || "Upload failed");
        setIsCompressing(false);
    } finally {
        setIsUploading(false);
    }
}
```

**3.4 — إضافة UI للضغط (في الـ JSX، بعد حقل اختيار الملف مباشرة — بعد السطر 108 تقريباً):**

أضف هذا الكود بعد `</input>` الخاص بملف الـ PDF:

```tsx
{/* Compression Level Selector */}
<div className="mt-3">
    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
        {t("compress.level")}
    </label>
    <div className="flex gap-2">
        {(["lossless", "balanced", "max"] as const).map((level) => (
            <button
                key={level}
                type="button"
                onClick={() => setCompressionLevel(level)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    compressionLevel === level
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-600 hover:border-blue-400"
                }`}
            >
                {t(`compress.${level}` as any)}
            </button>
        ))}
    </div>
</div>
```

**3.5 — إضافة شريط التقدم والنتيجة (قبل زر Submit مباشرةً — قبل السطر 136 تقريباً):**

```tsx
{/* Compression Progress */}
{isCompressing && (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl space-y-3">
        <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {t("compress.compressing")} {compressionProgress}%
            </span>
        </div>
        <div className="w-full bg-blue-100 dark:bg-blue-900/40 rounded-full h-2">
            <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${compressionProgress}%` }}
            ></div>
        </div>
    </div>
)}

{/* Compression Result */}
{compressionResult && !isCompressing && (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600 text-lg">✓</span>
            <span className="text-sm font-bold text-green-700 dark:text-green-300">
                {t("compress.done")}
            </span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
                <p className="text-zinc-500 text-xs">{t("compress.before")}</p>
                <p className="font-bold text-zinc-800 dark:text-zinc-200">
                    {formatFileSize(compressionResult.originalSize)}
                </p>
            </div>
            <div>
                <p className="text-zinc-500 text-xs">{t("compress.after")}</p>
                <p className="font-bold text-green-600">
                    {formatFileSize(compressionResult.compressedSize)}
                </p>
            </div>
            <div>
                <p className="text-zinc-500 text-xs">{t("compress.saved")}</p>
                <p className="font-bold text-blue-600">
                    {Math.round((1 - compressionResult.ratio) * 100)}%
                </p>
            </div>
        </div>
    </div>
)}
```

**3.6 — تعديل نص زر Submit (السطر 141):**

```tsx
{isCompressing
    ? t("compress.compressing") + "..."
    : isUploading
    ? "Uploading..."
    : "Submit Booklet"}
```

---

### المرحلة 4: إضافة مفاتيح الترجمة

**الملف:** `src/lib/LanguageContext.tsx`

أضف بعد مجموعة `delete.*` (بعد السطر 77):

```typescript
// Compression
"compress.level": { ar: "مستوى الضغط", en: "Compression Level" },
"compress.lossless": { ar: "بدون فقدان", en: "Lossless" },
"compress.balanced": { ar: "متوازن", en: "Balanced" },
"compress.max": { ar: "أقصى ضغط", en: "Maximum" },
"compress.compressing": { ar: "جاري الضغط...", en: "Compressing..." },
"compress.done": { ar: "تم الضغط بنجاح!", en: "Compression Complete!" },
"compress.before": { ar: "قبل", en: "Before" },
"compress.after": { ar: "بعد", en: "After" },
"compress.saved": { ar: "وفرت", en: "Saved" },
```

---

### المرحلة 5: التحقق والاختبار

#### خطوات الاختبار

1. شغّل `npm run dev`.
2. ادخل لوحة التحكم → صفحة الكتيبات → نموذج الرفع.
3. اختر مستوى الضغط (الافتراضي: "متوازن").
4. ارفع ملف PDF لا يقل حجمه عن 5MB.
5. تأكد من:
   - ظهور شريط التقدم أثناء الضغط.
   - ظهور النتيجة (الحجم قبل/بعد + النسبة المئوية).
   - رفع الملف المضغوط بنجاح إلى Supabase.
   - عرض الكتيب في مكتبة الكتيبات بدون مشاكل.
   - الصفحة الأولى تظهر كـ Thumbnail.

#### حالات الحافة (Edge Cases)

- ملف صغير (أقل من 1MB): الضغط قد لا يُحسّن شيئاً — يجب أن يعمل بدون خطأ.
- ملف كبير جداً (100MB+): يجب أن يعمل الـ progress bar بسلاسة.
- فشل الضغط: يجب أن يتم تجاوزه ورفع الملف الأصلي (fallback).
- رابط خارجي فقط: لا يجب أن يظهر الضغط (يُتجاوز).

---

## هيكل الملفات النهائي

```
src/
├── lib/
│   ├── LanguageContext.tsx        ← تعديل (إضافة مفاتيح ترجمة compress.*)
│   └── pdfCompressor.ts          ← ملف جديد (utility الضغط)
├── components/
│   └── admin/
│       └── BookletManager.tsx     ← تعديل (UI + منطق الضغط)
```

---

## ملخص الأوامر

```bash
# 1. تثبيت المكتبة
npm install @quicktoolsone/pdf-compress

# 2. البديل إذا لم تعمل المكتبة أعلاه
npm install pdf-lib
```

---

## ترتيب التنفيذ

| الخطوة | الملف | الوصف |
|---|---|---|
| 1 | Terminal | `npm install @quicktoolsone/pdf-compress` |
| 2 | `src/lib/pdfCompressor.ts` | إنشاء ملف جديد بالكود الموجود أعلاه |
| 3 | `src/lib/LanguageContext.tsx` | إضافة مفاتيح الترجمة (9 مفاتيح جديدة) |
| 4 | `src/components/admin/BookletManager.tsx` | إضافة imports + states + تعديل handleUpload + إضافة UI |
| 5 | اختبار | رفع ملف PDF والتحقق من الضغط والعرض |

---

## ملاحظات للوكلاء المنفذين

1. **لا تعدل `actions.ts`** — Server Action يبقى كما هو، الضغط يتم في المتصفح قبل إرسال الملف.
2. **استخدم `"use client"` فقط** — كل كود الضغط يعمل في المتصفح.
3. **Fallback إلزامي** — إذا فشل الضغط لأي سبب، يجب رفع الملف الأصلي بدون خطأ.
4. **اختبر المكتبة أولاً** — إذا `@quicktoolsone/pdf-compress` لم تعمل، انتقل مباشرة لبديل `pdf-lib`.
5. **لا تنسَ** إضافة مفاتيح الترجمة قبل استخدام `t("compress.*")` لتجنب أخطاء TypeScript.
