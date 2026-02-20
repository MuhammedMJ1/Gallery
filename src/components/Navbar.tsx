"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/LanguageContext";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { lang, toggleLang, t } = useLang();

    const navItems = [
        { name: t("nav.portfolio"), href: "/" },
        { name: t("nav.booklets"), href: "/booklets" },
        { name: t("nav.admin"), href: "/admin/login" },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="relative w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
                                    <Image src="/Logo.png" alt="MJ Logo" fill priority className="object-contain" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-extrabold text-zinc-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                                        Muhammed MJ
                                    </span>
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium mt-1">
                                        Graphic Designer
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Language Toggle + Hamburger */}
                        <div className="flex items-center gap-3">
                            {/* Language Toggle Button */}
                            <button
                                onClick={toggleLang}
                                className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-bold transition-colors border border-zinc-200"
                                title={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
                            >
                                {lang === "ar" ? "EN" : "عربي"}
                            </button>

                            {/* Hamburger Button */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-md"
                                aria-label="Toggle menu"
                            >
                                <div className="w-6 h-5 flex flex-col justify-between items-end relative">
                                    <span
                                        className={`block h-0.5 bg-current transition-all duration-300 ease-in-out ${isOpen ? "w-6 rotate-45 translate-y-2.5 absolute" : "w-6"
                                            }`}
                                    />
                                    <span
                                        className={`block h-0.5 w-4 bg-current transition-all duration-300 ease-in-out ${isOpen ? "opacity-0" : "opacity-100"
                                            }`}
                                    />
                                    <span
                                        className={`block h-0.5 bg-current transition-all duration-300 ease-in-out ${isOpen ? "w-6 -rotate-45 -translate-y-2 absolute bottom-0" : "w-5"
                                            }`}
                                    />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Full Screen Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "-100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-8"
                    >
                        {navItems.map((item, index) => {
                            const isActive = pathname === item.href;
                            return (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`text-4xl font-bold transition-colors ${isActive
                                            ? "text-blue-600"
                                            : "text-gray-800 hover:text-blue-500"
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
