import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "アカリスト | 企業SNSリスト作成ツール",
    description: "企業SNSのリスト作成を好きな条件で好きなだけ。会員登録不要で即購入可能な営業リスト作成ツールです。",
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
