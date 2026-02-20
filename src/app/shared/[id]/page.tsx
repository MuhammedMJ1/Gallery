"use client";

import React, { useState, useEffect } from "react";
import { validateShareLink } from "@/app/api/share/actions";
import { useParams, useRouter } from "next/navigation";
import { useLang } from "@/lib/LanguageContext";

export default function SharedPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [status, setStatus] = useState<"loading" | "needsCode" | "error" | "expired">("loading");
    const [errorMsg, setErrorMsg] = useState("");
    const [secretCode, setSecretCode] = useState("");
    const [checking, setChecking] = useState(false);
    const { t } = useLang();

    const checkLink = async (code?: string) => {
        setChecking(true);
        const result = await validateShareLink(id, code);
        setChecking(false);

        if (result.success && result.pdfUrl) {
            router.replace(`/pdf?url=${encodeURIComponent(result.pdfUrl)}`);
        } else if (result.requiresCode) {
            setStatus("needsCode");
            if (result.error) setErrorMsg(result.error);
        } else if (result.expired) {
            setStatus("expired");
        } else {
            setStatus("error");
            setErrorMsg(result.error || t("shared.invalid"));
        }
    };

    useEffect(() => {
        if (id) checkLink();
    }, [id]);

    const handleSubmitCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (secretCode.trim()) {
            setErrorMsg("");
            checkLink(secretCode.trim());
        }
    };

    // Loading
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-300 font-medium text-lg">{t("shared.checking")}</p>
                </div>
            </div>
        );
    }

    // Expired
    if (status === "expired") {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 max-w-sm w-full text-center space-y-4">
                    <div className="text-6xl">⏱️</div>
                    <h1 className="text-2xl font-bold text-white">{t("shared.expired")}</h1>
                    <p className="text-gray-400">{t("shared.expiredHint")}</p>
                </div>
            </div>
        );
    }

    // Needs secret code
    if (status === "needsCode") {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 max-w-sm w-full space-y-6">
                    <div className="text-center space-y-2">
                        <div className="text-5xl">🔑</div>
                        <h1 className="text-2xl font-bold text-white">{t("shared.needsCode")}</h1>
                        <p className="text-gray-400 text-sm">{t("shared.needsCodeHint")}</p>
                    </div>

                    <form onSubmit={handleSubmitCode} className="space-y-4">
                        <input
                            type="text"
                            value={secretCode}
                            onChange={(e) => setSecretCode(e.target.value)}
                            placeholder={t("shared.enterCode")}
                            className="w-full bg-gray-700 text-white rounded-xl py-3 px-4 border border-gray-600 focus:border-blue-500 focus:outline-none text-center text-lg tracking-widest placeholder:text-gray-500 placeholder:tracking-normal"
                            dir="ltr"
                            autoFocus
                        />
                        {errorMsg && (
                            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
                        )}
                        <button
                            type="submit"
                            disabled={checking || !secretCode.trim()}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {checking ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                t("shared.open")
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Error
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 max-w-sm w-full text-center space-y-4">
                <div className="text-6xl">❌</div>
                <h1 className="text-2xl font-bold text-white">{t("shared.invalid")}</h1>
                <p className="text-gray-400">{errorMsg || t("shared.invalidHint")}</p>
            </div>
        </div>
    );
}
