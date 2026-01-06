import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Sales List Platform",
    description: "Find and buy company data easily.",
};

import SiteFooter from "@/components/site-footer";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body className={inter.className}>
                <div className="flex flex-col min-h-screen">
                    {children}
                    <SiteFooter />
                </div>
            </body>
        </html>
    );
}
