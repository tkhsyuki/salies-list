import Link from 'next/link';

export default function SiteFooter() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="md:flex md:items-center md:justify-between">
                    {/* Branding */}
                    <div className="mt-8 md:mt-0 md:order-1">
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                            <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-md"></div>
                            <span className="font-bold text-lg text-gray-800">アカリスト</span>
                        </div>
                    </div>

                    {/* Legal Links */}
                    <div className="flex gap-6 text-sm text-gray-500 md:order-2">
                        <Link href="/legal/terms" className="hover:text-gray-900">利用規約</Link>
                        <Link href="/legal/privacy" className="hover:text-gray-900">プライバシーポリシー</Link>
                        <Link href="/legal/commercial" className="hover:text-gray-900">特定商取引法に基づく表記</Link>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} Acalist. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
