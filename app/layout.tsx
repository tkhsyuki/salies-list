import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "アカリスト | 企業SNSリスト作成ツール",
    description: "企業SNS（Instagram/インスタ・TikTok・YouTube・X）の営業リスト作成ツール。フォロワー数やアカウント有無で絞り込み、会員登録不要で即ダウンロード。1件15円からの高精度な企業リスト。",
    keywords: ["SNS", "TikTok", "Instagram", "インスタ", "YouTube", "営業リスト", "フォロワー", "アカウント", "企業リスト", "Acalist"],
    metadataBase: new URL('https://acalist.jp'),
    openGraph: {
        title: "アカリスト | 企業SNSリスト作成ツール",
        description: "企業SNS（Instagram/インスタ・TikTok・YouTube・X）の営業リスト作成ツール。フォロワー数やアカウント有無で絞り込み、会員登録不要で即ダウンロード。",
        url: 'https://acalist.jp',
        siteName: 'Acalist',
        locale: 'ja_JP',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "アカリスト | 企業SNSリスト作成ツール",
        description: "企業SNS（Instagram/インスタ・TikTok・YouTube・X）の営業リスト作成ツール。フォロワー数やアカウント有無で絞り込み、会員登録不要で即ダウンロード。",
    },
};

import Analytics from "@/components/analytics";
import SiteFooter from "@/components/site-footer";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body className={inter.className}>
                <Analytics />
                <div className="flex flex-col min-h-screen">
                    {children}
                    <SiteFooter />
                </div>
            </body>
        </html>
    );
}
