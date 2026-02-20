"use client";

import React, { useEffect, useRef, useState } from "react";

interface PDFThumbnailProps {
    pdfUrl: string;
}

export default function PDFThumbnail({ pdfUrl }: PDFThumbnailProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isCancelled = false;
        let renderTask: any = null;

        const loadThumbnail = async () => {
            try {
                if (!canvasRef.current || isCancelled) return;

                const pdfjsLib = await import("pdfjs-dist");
                pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

                const loadingTask = pdfjsLib.getDocument({
                    url: pdfUrl,
                    wasmUrl: "/",
                } as any);

                const pdf = await loadingTask.promise;
                if (isCancelled) return;

                const page = await pdf.getPage(1);
                if (isCancelled) return;

                const viewport = page.getViewport({ scale: 1.5 }); // Good resolution scale
                const canvas = canvasRef.current;
                const context = canvas.getContext("2d");

                if (!context || !canvas) return;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };

                renderTask = page.render(renderContext as any);
                await renderTask.promise;

                if (!isCancelled) {
                    setLoading(false);
                }
            } catch (err: any) {
                if (err?.name === "RenderingCancelledException") {
                    // Ignore cancellation errors
                    return;
                }
                console.error("Error generating PDF thumbnail:", err);
                if (!isCancelled) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        if (pdfUrl) {
            loadThumbnail();
        }

        return () => {
            isCancelled = true;
            if (renderTask) {
                renderTask.cancel();
            }
        };
    }, [pdfUrl]);

    return (
        <div className="w-full h-full relative bg-zinc-100 flex items-center justify-center">
            {loading && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 z-10">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 bg-zinc-100 z-10">
                    <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-xs font-medium uppercase tracking-wider">Preview Unavailable</span>
                </div>
            )}

            <canvas
                ref={canvasRef}
                className={`w-full h-full object-cover transition-opacity duration-500 ${loading || error ? "opacity-0" : "opacity-100"}`}
            />
        </div>
    );
}
