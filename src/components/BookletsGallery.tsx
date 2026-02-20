"use client";

import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";
import dynamic from "next/dynamic";

const PDFThumbnail = dynamic(() => import("./PDFThumbnail"), { ssr: false });

interface Booklet {
    id: string;
    title: string;
    pdf_url: string;
    created_at: string;
}

export default function BookletsGallery({ booklets }: { booklets: Booklet[] | null }) {
    const { lang, t } = useLang();

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/50 to-transparent">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mb-6 tracking-tight">
                        {t("booklets.title")}
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-zinc-600 leading-relaxed">
                        {t("booklets.subtitle")}
                    </p>
                </div>
            </section>

            {/* Gallery Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {!booklets || booklets.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                        <svg
                            className="mx-auto h-12 w-12 text-zinc-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-semibold text-zinc-900">{t("booklets.noBooklets")}</h3>
                        <p className="mt-1 text-sm text-zinc-500">{t("booklets.noBookletsHint")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {booklets.map((booklet) => (
                            <Link
                                key={booklet.id}
                                href={`/pdf?url=${encodeURIComponent(booklet.pdf_url)}`}
                                className="group flex flex-col bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Book Cover */}
                                <div className="aspect-[3/4] bg-zinc-100 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                    <div className="absolute inset-0 z-0">
                                        <PDFThumbnail pdfUrl={booklet.pdf_url} />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 z-0"></div>

                                    {/* Overlay read button */}
                                    <div className="absolute inset-0 bg-zinc-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <span className="px-6 py-2 bg-white text-zinc-900 font-medium rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            {t("booklets.readBooklet")}
                                        </span>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <h3 className="text-lg font-bold text-zinc-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                                        {booklet.title}
                                    </h3>
                                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                                        {new Date(booklet.created_at).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
