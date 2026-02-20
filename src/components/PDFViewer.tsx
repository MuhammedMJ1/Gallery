"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import ShareModal from "@/components/ShareModal";
import { useLang } from "@/lib/LanguageContext";

interface PDFViewerProps {
    pdfUrl: string;
    isAdmin?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, isAdmin = false }) => {
    const [pages, setPages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [singlePage, setSinglePage] = useState(true); // default: single page fills screen
    const [aspectRatio, setAspectRatio] = useState(1.414); // default A4
    const [showShare, setShowShare] = useState(false);
    const flipBookRef = useRef<any>(null);
    const { t } = useLang();

    // Calculate dimensions based on mode
    const getDims = useCallback(() => {
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const availH = screenH - 60; // reserve for controls

        let pageW: number, pageH: number;

        if (singlePage) {
            // Single page fills the entire screen
            pageW = screenW - 20;
            pageH = pageW / aspectRatio;
            if (pageH > availH) {
                pageH = availH;
                pageW = pageH * aspectRatio;
            }
        } else {
            // Two pages side by side
            pageW = (screenW / 2) - 10;
            pageH = pageW / aspectRatio;
            if (pageH > availH) {
                pageH = availH;
                pageW = pageH * aspectRatio;
            }
        }

        return { width: Math.round(pageW), height: Math.round(pageH) };
    }, [singlePage, aspectRatio]);

    const [dims, setDims] = useState({ width: 500, height: 700 });

    // Recalculate dims when mode changes
    useEffect(() => {
        if (pages.length > 0) {
            setDims(getDims());
        }
    }, [singlePage, getDims, pages.length]);

    // 🔒 Block right-click, keyboard shortcuts, and drag
    useEffect(() => {
        const blockContextMenu = (e: MouseEvent) => e.preventDefault();
        const blockKeys = (e: KeyboardEvent) => {
            if (
                (e.ctrlKey && (e.key === "s" || e.key === "p" || e.key === "u")) ||
                (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) ||
                e.key === "F12"
            ) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        const blockDrag = (e: DragEvent) => e.preventDefault();

        document.addEventListener("contextmenu", blockContextMenu);
        document.addEventListener("keydown", blockKeys);
        document.addEventListener("dragstart", blockDrag);

        return () => {
            document.removeEventListener("contextmenu", blockContextMenu);
            document.removeEventListener("keydown", blockKeys);
            document.removeEventListener("dragstart", blockDrag);
        };
    }, []);

    useEffect(() => {
        const loadPdf = async () => {
            try {
                setLoading(true);

                const pdfjsLib = await import("pdfjs-dist");
                pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

                const loadingTask = pdfjsLib.getDocument({
                    url: pdfUrl,
                    wasmUrl: "/",
                } as any);
                const pdf = await loadingTask.promise;
                const totalPages = pdf.numPages;

                // Get first page dimensions
                const firstPage = await pdf.getPage(1);
                const firstViewport = firstPage.getViewport({ scale: 1 });
                const ratio = firstViewport.width / firstViewport.height;
                setAspectRatio(ratio);

                // Render all pages
                const scale = 2;
                const pageImages: string[] = [];
                for (let i = 1; i <= totalPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale });
                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d");

                    if (context) {
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        const renderTask = page.render({
                            canvasContext: context,
                            viewport: viewport,
                        } as any);
                        await renderTask.promise;
                        pageImages.push(canvas.toDataURL("image/jpeg", 0.92));
                    }
                }

                setPages(pageImages);

                // Calculate initial dims (single page mode)
                const screenW = window.innerWidth;
                const screenH = window.innerHeight;
                const availH = screenH - 60;
                let pageW = screenW - 20;
                let pageH = pageW / ratio;
                if (pageH > availH) {
                    pageH = availH;
                    pageW = pageH * ratio;
                }
                setDims({ width: Math.round(pageW), height: Math.round(pageH) });
            } catch (error) {
                console.error("Error loading PDF:", error);
            } finally {
                setLoading(false);
            }
        };

        if (pdfUrl) {
            loadPdf();
        }
    }, [pdfUrl]);

    if (loading) {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-300 font-medium text-lg">{t("pdf.loading")}</p>
                </div>
            </div>
        );
    }

    if (pages.length === 0) {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-gray-900">
                <p className="text-red-400 text-xl">{t("pdf.errorLoading")}</p>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
            {/* Flipbook */}
            <div className="flex-1 flex items-center justify-center w-full" key={singlePage ? "single" : "double"}>
                <HTMLFlipBook
                    width={dims.width}
                    height={dims.height}
                    size="fixed"
                    minWidth={dims.width}
                    maxWidth={dims.width}
                    minHeight={dims.height}
                    maxHeight={dims.height}
                    maxShadowOpacity={0.5}
                    showCover={true}
                    mobileScrollSupport={true}
                    className="book-wrapper"
                    style={{}}
                    ref={flipBookRef}
                    startPage={0}
                    drawShadow={true}
                    flippingTime={800}
                    usePortrait={singlePage}
                    startZIndex={0}
                    autoSize={false}
                    clickEventForward={true}
                    useMouseEvents={true}
                    swipeDistance={30}
                    showPageCorners={true}
                    disableFlipByClick={false}
                >
                    {pages.map((imgSrc, index) => (
                        <div key={index} className="page bg-white">
                            <img
                                src={imgSrc}
                                alt={`Page ${index + 1}`}
                                className="w-full h-full object-contain bg-white"
                                draggable={false}
                            />
                        </div>
                    ))}
                </HTMLFlipBook>
            </div>

            {/* Bottom controls */}
            <div className="h-[60px] flex items-center justify-center gap-4">
                <button
                    onClick={() => flipBookRef.current?.pageFlip()?.flipPrev()}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium backdrop-blur-sm border border-white/20"
                >
                    {t("pdf.prev")}
                </button>

                {/* Toggle single/double page */}
                <button
                    onClick={() => setSinglePage(!singlePage)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium backdrop-blur-sm border border-white/20 flex items-center gap-2"
                    title={singlePage ? t("pdf.twoPageTitle") : t("pdf.singlePageTitle")}
                >
                    {singlePage ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="3" width="8" height="18" rx="1" />
                                <rect x="14" y="3" width="8" height="18" rx="1" />
                            </svg>
                            <span className="text-sm">{t("pdf.twoPages")}</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="5" y="3" width="14" height="18" rx="1" />
                            </svg>
                            <span className="text-sm">{t("pdf.singlePage")}</span>
                        </>
                    )}
                </button>

                {/* Share button - admin only */}
                {isAdmin && (
                    <button
                        onClick={() => setShowShare(true)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium backdrop-blur-sm border border-white/20 flex items-center gap-2"
                        title={t("pdf.share")}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                        <span className="text-sm">{t("pdf.share")}</span>
                    </button>
                )}

                <button
                    onClick={() => flipBookRef.current?.pageFlip()?.flipNext()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/30"
                >
                    {t("pdf.next")}
                </button>
            </div>

            {/* Share Modal */}
            {showShare && (
                <ShareModal pdfUrl={pdfUrl} onClose={() => setShowShare(false)} />
            )}
        </div>
    );
};

export default PDFViewer;
