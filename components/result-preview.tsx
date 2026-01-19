import { useState } from 'react';
import { Company } from '@/lib/types';
import Link from 'next/link';
import { Lock, CheckCircle } from 'lucide-react';

interface ResultPreviewProps {
    count: number;
    loading: boolean;
    samples: Company[];
    onCheckout: () => void;
}

export default function ResultPreview({ count, loading, samples, onCheckout }: ResultPreviewProps) {
    const [agreed, setAgreed] = useState(false);
    const pricePerItem = 15;
    const totalPrice = count * pricePerItem;
    const canPurchase = count >= 100;

    if (loading) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
        );
    }

    // Helper to extract prefecture from address
    const getPrefecture = (addr: string | null) => {
        if (!addr) return null;
        // Match any prefecture name occurring in the address
        // Handles "東京都", "北海道", "大阪府", "京都府"
        // And "神奈川県" (3 Kanji + 県) or "福岡県" (2 Kanji + 県)
        // Uses [一-龠] to ensure only Kanji are matched, preventing numbers like "8福岡県"
        const match = addr.match(/(北海道|東京都|大阪府|京都府|[一-龠]{2,3}県)/);
        return match ? match[0] : null;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">検索結果</h2>
                    <p className="text-sm text-gray-500 mt-1">抽出された企業リスト</p>
                </div>
                <div className="text-right">
                    <span className="block text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                        {count.toLocaleString()} <span className="text-lg text-gray-600 font-medium">件</span>
                    </span>
                </div>
            </div>

            {/* List Preview */}
            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 mb-6 pr-2 custom-scrollbar">
                {count === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        条件に一致する企業は見つかりませんでした。
                    </div>
                ) : (
                    samples.map((company) => (
                        <div key={company.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-700">{company.company_name.substring(0, 10)}...</span>
                                    <span className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">{company.industry}</span>
                                    <span className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                                        {getPrefecture(company.address) || company.region}
                                    </span>
                                </div>

                                {company.website_url && (
                                    <div className="mb-2 text-xs">
                                        <a
                                            href={company.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline flex items-center gap-1.5 w-fit"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            <span className="truncate max-w-[280px] sm:max-w-md">{company.website_url}</span>
                                        </a>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    {company.insta_url && (
                                        <span className="text-pink-500 font-medium flex items-center gap-1">
                                            Instagram <span className="text-gray-400">({company.insta_followers?.toLocaleString()})</span>
                                        </span>
                                    )}
                                    {company.tiktok_url && (
                                        <span className="text-black font-medium flex items-center gap-1">
                                            TikTok <span className="text-gray-400">({company.tiktok_followers?.toLocaleString()})</span>
                                        </span>
                                    )}
                                    {company.youtube_url && (
                                        <span className="text-red-600 font-medium flex items-center gap-1">
                                            YouTube <span className="text-gray-400">({company.youtube_subscribers?.toLocaleString()})</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Lock className="w-4 h-4 text-gray-300" />
                        </div>
                    ))
                )}
                {count > samples.length && (
                    <div className="text-center text-xs text-gray-400 py-2">
                        他 {count - samples.length} 件...
                    </div>
                )}
            </div>

            {/* Purchase Area */}
            <div className="mt-auto bg-gray-900 rounded-lg p-5 text-white">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-sm text-gray-400 mb-1">見積り金額 ({pricePerItem}円/件)</p>
                        <div className="text-3xl font-bold text-yellow-400">
                            ¥{totalPrice.toLocaleString()}
                        </div>
                    </div>
                    {!canPurchase && count > 0 && (
                        <span className="text-xs text-red-300 bg-red-900/30 px-2 py-1 rounded">
                            最低100件から購入可能です
                        </span>
                    )}
                </div>

                {/* Sample Download */}
                <a
                    href="/api/download-sample"
                    className="block w-full text-center text-sm text-lime-400 hover:text-lime-300 underline mb-6 transition-colors"
                >
                    まずは無料サンプル(3件)をダウンロード
                </a>

                <div className="mb-4 flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-300 select-none cursor-pointer">
                        <Link href="/legal/terms" target="_blank" className="underline hover:text-white">利用規約</Link>
                        に同意して購入する
                    </label>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={!canPurchase || !agreed}
                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${canPurchase && agreed
                        ? 'bg-gradient-to-r from-lime-400 to-emerald-500 text-gray-900 hover:scale-[1.02] shadow-lg'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {canPurchase ? '購入手続きへ進む' : '件数が不足しています'}
                </button>
            </div>
        </div>
    );
}
