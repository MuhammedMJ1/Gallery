"use client";

import React, { useState } from "react";
import { createShareLink } from "@/app/api/share/actions";
import { useLang } from "@/lib/LanguageContext";

interface ShareModalProps {
    pdfUrl: string;
    onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ pdfUrl, onClose }) => {
    const [useExpiry, setUseExpiry] = useState(false);
    const [expiryDays, setExpiryDays] = useState(7);
    const [useSecret, setUseSecret] = useState(false);
    const [secretCode, setSecretCode] = useState("");
    const [generatedLink, setGeneratedLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");
    const { t } = useLang();

    const handleGenerate = async () => {
        setLoading(true);
        setError("");
        try {
            const result = await createShareLink(pdfUrl, {
                expiryDays: useExpiry ? expiryDays : undefined,
                secretCode: useSecret && secretCode ? secretCode : undefined,
            });

            if (result.error) {
                setError(result.error);
            } else if (result.id) {
                const origin = window.location.origin;
                setGeneratedLink(`${origin}/shared/${result.id}`);
            }
        } catch {
            setError("حدث خطأ أثناء إنشاء الرابط");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyDirect = async () => {
        const directLink = window.location.href;
        await navigator.clipboard.writeText(directLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-md p-6 space-y-5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                        {t("share.title")}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
                </div>

                {/* Quick Copy Direct Link */}
                <button
                    onClick={handleCopyDirect}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl border border-gray-600 transition-colors group"
                >
                    <div className="flex items-center gap-3 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        <span className="font-medium">{t("share.copyDirect")}</span>
                    </div>
                    <span className="text-sm text-blue-400 group-hover:text-blue-300">
                        {copied && !generatedLink ? t("share.copied") : t("share.copy")}
                    </span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-700"></div>
                    <span className="text-xs text-gray-500 font-medium">{t("share.advanced")}</span>
                    <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                {/* Temporary Link Toggle */}
                <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            <span className="text-gray-200 font-medium">{t("share.tempLink")}</span>
                        </div>
                        <div
                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${useExpiry ? "bg-blue-600" : "bg-gray-600"}`}
                            onClick={() => setUseExpiry(!useExpiry)}
                        >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${useExpiry ? "translate-x-5" : "translate-x-0.5"}`}></div>
                        </div>
                    </label>
                    {useExpiry && (
                        <div className="flex items-center gap-3 bg-gray-700/40 rounded-xl p-3 mr-8">
                            <span className="text-gray-400 text-sm">{t("share.expiresAfter")}</span>
                            <input
                                type="number"
                                min="1"
                                max="365"
                                value={expiryDays}
                                onChange={(e) => setExpiryDays(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-16 bg-gray-600 text-white text-center rounded-lg py-1.5 border border-gray-500 focus:border-blue-500 focus:outline-none"
                                aria-label="عدد الأيام"
                            />
                            <span className="text-gray-400 text-sm">{t("share.days")}</span>
                        </div>
                    )}
                </div>

                {/* Secret Code Toggle */}
                <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            <span className="text-gray-200 font-medium">{t("share.secretCode")}</span>
                        </div>
                        <div
                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${useSecret ? "bg-blue-600" : "bg-gray-600"}`}
                            onClick={() => setUseSecret(!useSecret)}
                        >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${useSecret ? "translate-x-5" : "translate-x-0.5"}`}></div>
                        </div>
                    </label>
                    {useSecret && (
                        <div className="mr-8">
                            <input
                                type="text"
                                value={secretCode}
                                onChange={(e) => setSecretCode(e.target.value)}
                                placeholder={t("share.enterSecret")}
                                className="w-full bg-gray-700/40 text-white rounded-xl py-2.5 px-4 border border-gray-600 focus:border-blue-500 focus:outline-none placeholder:text-gray-500"
                                dir="ltr"
                            />
                        </div>
                    )}
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={loading || (useSecret && !secretCode)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {t("share.generating")}
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            {t("share.generate")}
                        </>
                    )}
                </button>

                {/* Error */}
                {error && (
                    <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                {/* Generated Link */}
                {generatedLink && (
                    <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-4 space-y-3">
                        <p className="text-green-400 text-sm font-medium text-center">{t("share.success")}</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={generatedLink}
                                readOnly
                                className="flex-1 bg-gray-700/50 text-gray-200 rounded-lg py-2 px-3 text-sm border border-gray-600 font-mono"
                                dir="ltr"
                                aria-label="رابط المشاركة"
                            />
                            <button
                                onClick={() => handleCopy(generatedLink)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                            >
                                {copied ? t("share.done") : t("share.copy")}
                            </button>
                        </div>
                        {useExpiry && (
                            <p className="text-gray-400 text-xs text-center">
                                {t("share.expiresIn")} {expiryDays} {t("share.day")}
                            </p>
                        )}
                        {useSecret && (
                            <p className="text-gray-400 text-xs text-center">
                                {t("share.protected")}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShareModal;
