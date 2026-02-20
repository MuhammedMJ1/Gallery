import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/lib/LanguageContext";
import Footer from "@/components/Footer";

const ghroobArabic = localFont({
  src: [
    { path: "../../public/fonts/itfGhroobArabic-Light.otf", weight: "300" },
    { path: "../../public/fonts/itfGhroobArabic-Regular.otf", weight: "400" },
    { path: "../../public/fonts/itfGhroobArabic-Medium.otf", weight: "500" },
    { path: "../../public/fonts/itfGhroobArabic-Bold.otf", weight: "700" },
    { path: "../../public/fonts/itfGhroobArabic-ExtraBold.otf", weight: "800" },
  ],
  variable: "--font-ghroob",
});

export const metadata: Metadata = {
  title: "Muhammed MJ - Graphic Designer",
  description: "Portfolio of Muhammed MJ, Graphic Designer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ghroobArabic.variable} font-sans antialiased bg-gray-50 pt-16`}
      >
        <LanguageProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
