import Link from 'next/link';

export default function SiteFooter() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex justify-center md:justify-start space-x-6 md:order-2">
                        <Link href="/legal/commercial" className="text-gray-400 hover:text-gray-500 text-sm">
                            特定商取引法に基づく表記
                        </Link>
                        <Link href="/legal/terms" className="text-gray-400 hover:text-gray-500 text-sm">
                            利用規約
                        </Link>
                        <Link href="/legal/privacy" className="text-gray-400 hover:text-gray-500 text-sm">
                            プライバシーポリシー
                        </Link>
                    </div>
                    <div className="mt-8 md:mt-0 md:order-1">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg"></div>
                            <span className="text-lg font-bold text-gray-900">J-Corp DB</span>
                        </div>
                        <p className="text-center md:text-left text-base text-gray-400">
                            &copy; {new Date().getFullYear()} Sales List Platform. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
