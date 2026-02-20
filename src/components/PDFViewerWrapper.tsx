"use client";

import dynamic from "next/dynamic";

const PDFViewerClient = dynamic(() => import("@/components/PDFViewer"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center min-h-[500px] w-full">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Loading...</p>
            </div>
        </div>
    ),
});

export default function PDFViewerWrapper({ pdfUrl, isAdmin = false }: { pdfUrl: string; isAdmin?: boolean }) {
    return <PDFViewerClient pdfUrl={pdfUrl} isAdmin={isAdmin} />;
}
