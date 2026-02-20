"use client";

import React from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/LanguageContext';

export default function Footer() {
    const { lang } = useLang();
    const handle = "MuhammedMJ94";

    const socialLinks = [
        {
            name: "Telegram",
            href: `https://t.me/${handle}`,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                </svg>
            ),
            hoverClass: "hover:text-[#0088cc]", // Telegram blue
        },
        {
            name: "Facebook",
            href: `https://facebook.com/${handle}`,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
            ),
            hoverClass: "hover:text-[#1877F2]", // Facebook blue
        },
        {
            name: "Instagram",
            href: `https://instagram.com/${handle}`,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
            ),
            hoverClass: "hover:text-[#E4405F]", // Instagram brand color
        },
    ];

    return (
        <footer className="mt-auto bg-white border-t border-zinc-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-6">

                {/* Logo & Handle */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xl font-extrabold text-zinc-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                        Muhammed MJ
                    </span>
                    <span className="text-zinc-500 font-medium">@{handle}</span>
                </div>

                {/* Social Icons */}
                <div className="flex gap-6">
                    {socialLinks.map((social) => (
                        <a
                            key={social.name}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-zinc-400 transition-all duration-300 hover:scale-110 ${social.hoverClass}`}
                            aria-label={`Follow on ${social.name}`}
                        >
                            {social.icon}
                        </a>
                    ))}
                </div>

                {/* Copyright */}
                <p className="text-sm text-zinc-500 font-medium mt-4">
                    {lang === "ar"
                        ? `© ${new Date().getFullYear()} جميع الحقوق محفوظة.`
                        : `© ${new Date().getFullYear()} All rights reserved.`}
                </p>
            </div>
        </footer>
    );
}
