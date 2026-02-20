"use client";

import { useState, useEffect } from "react";
import { uploadBooklet, deleteBooklet } from "@/app/admin/(protected)/booklets/actions";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LanguageContext";

export default function BookletManager({ initialBooklets }: { initialBooklets: any[] }) {
    const [booklets, setBooklets] = useState(initialBooklets);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bookletToDelete, setBookletToDelete] = useState<{ id: string, title: string, url: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const { t } = useLang();

    // Keep local state in sync with server props
    useEffect(() => {
        setBooklets(initialBooklets);
    }, [initialBooklets]);

    async function handleUpload(formData: FormData) {
        setIsUploading(true);
        setError(null);
        try {
            const result = await uploadBooklet(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                // Clear form
                (document.getElementById("upload-form") as HTMLFormElement).reset();
                router.refresh();
            }
        } catch (e: any) {
            setError(e.message || "Upload failed");
        } finally {
            setIsUploading(false);
        }
    }

    async function handleDeleteConfirm() {
        if (!bookletToDelete) return;
        setIsDeleting(true);

        try {
            const { id, url } = bookletToDelete;
            // Optimistic update
            setBooklets(booklets.filter(b => b.id !== id));
            setBookletToDelete(null); // Close modal immediately

            const result = await deleteBooklet(id, url);
            if (result?.error) {
                alert(result.error);
                // Revert if error
                setBooklets(initialBooklets);
            } else {
                router.refresh();
            }
        } catch (e: any) {
            alert("Failed to delete");
            setBooklets(initialBooklets);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="space-y-8">
            {/* Upload Form */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Add New Booklet</h2>
                <p className="text-sm text-zinc-500 mb-6 font-medium">
                    You can either upload a PDF file directly (up to 250MB) or provide a direct external URL (like Google Drive).
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                        {error}
                    </div>
                )}

                <form id="upload-form" action={handleUpload} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Annual Report 2024"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                        <div>
                            <label htmlFor="pdf" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                                1. Upload Local PDF
                            </label>
                            <input
                                type="file"
                                id="pdf"
                                name="pdf"
                                accept="application/pdf"
                                className="w-full text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-zinc-800 dark:file:text-zinc-300"
                            />
                        </div>

                        <div className="relative flex flex-col justify-center translate-y-2 md:translate-y-0 text-center">
                            <span className="text-sm font-medium text-zinc-400">--- OR ---</span>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="externalUrl" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                                2. Use External URL (For Large Files / Google Drive)
                            </label>
                            <input
                                type="url"
                                id="externalUrl"
                                name="externalUrl"
                                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://drive.google.com/uc?export=download&id=YOUR_FILE_ID"
                            />

                            <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-3 rounded-lg shadow-sm">
                                <strong className="text-blue-600 dark:text-blue-400 block mb-1">💡 How to use Google Drive links:</strong>
                                1. Upload your PDF to Google Drive and ensure Share settings are <strong>&quot;Anyone with the link&quot;</strong>.<br />
                                2. Copy the link: <code>https://drive.google.com/file/d/<b>1a2B3...</b>/view?usp=sharing</code><br />
                                3. Paste it below and we will automatically convert it to a direct download link for you!
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading}
                        className="w-full sm:w-auto px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 transition disabled:opacity-50"
                    >
                        {isUploading ? "Processing..." : "Submit Booklet"}
                    </button>
                </form>
            </div>

            {/* Booklets List */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-zinc-100">Uploaded Booklets</h2>

                {booklets.length === 0 ? (
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">No booklets uploaded yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {booklets.map((booklet) => (
                            <div key={booklet.id} className="relative border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex flex-col justify-between group">
                                {/* Delete button - top right corner */}
                                <button
                                    onClick={() => setBookletToDelete({ id: booklet.id, title: booklet.title, url: booklet.pdf_url })}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md flex items-center justify-center text-sm font-bold transition-all hover:scale-110 z-10"
                                    title={t("delete.bookletTitle")}
                                >
                                    ✕
                                </button>
                                <div>
                                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate pr-6" title={booklet.title}>
                                        {booklet.title}
                                    </h3>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {new Date(booklet.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <a
                                        href={booklet.pdf_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium"
                                    >
                                        View File
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {bookletToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden scale-in-center animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t("delete.title")}</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {t("delete.confirm")}
                                <br />
                                <strong className="text-zinc-800 dark:text-zinc-200 mt-2 block break-all">&quot;{bookletToDelete.title}&quot;</strong>
                            </p>
                        </div>
                        <div className="flex border-t border-zinc-100 dark:border-zinc-800/50">
                            <button
                                onClick={() => setBookletToDelete(null)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-4 font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                                {t("delete.cancel")}
                            </button>
                            <div className="w-px bg-zinc-100 dark:bg-zinc-800/50"></div>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-4 font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    t("delete.yes")
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
