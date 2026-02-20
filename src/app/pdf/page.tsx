import PDFViewerWrapper from "@/components/PDFViewerWrapper";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export default async function PDFViewerPage({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
    const defaultPdfUrl = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";
    const params = await searchParams;
    const pdfUrl = params?.url || defaultPdfUrl;

    // Check if user is admin
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    let isAdmin = false;
    if (token) {
        try {
            isAdmin = verifySession(token);
        } catch {
            isAdmin = false;
        }
    }

    return (
        <div className="w-screen h-screen overflow-hidden bg-gray-900">
            <PDFViewerWrapper pdfUrl={pdfUrl} isAdmin={isAdmin} />
        </div>
    );
}
