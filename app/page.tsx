'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import SearchForm from '@/components/search-form';
import ResultPreview from '@/components/result-preview';
import LpSections from '@/components/lp-sections';
import { Company, SearchFilters } from '@/lib/types';

import JsonLd from '@/components/json-ld';

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [samples, setSamples] = useState<Company[]>([]);
    const [searched, setSearched] = useState(false);
    const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null);

    const fetchCompanies = async (filters: SearchFilters) => {
        setLoading(true);
        setSearched(true);
        setCurrentFilters(filters);

        // Smooth scroll to results
        setTimeout(() => {
            const resultsEl = document.getElementById('results');
            if (resultsEl) {
                // Offset for sticky header
                const y = resultsEl.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 500);

        try {
            let query = supabase
                .from('companies')
                .select('*', { count: 'exact' });

            // Apply filters
            // Apply filters
            if (filters.keyword) {
                // Expanded search: company name, description, and keyword1-5
                const kw = filters.keyword;
                query = query.or(`company_name.ilike.%${kw}%,description.ilike.%${kw}%,keyword1.ilike.%${kw}%,keyword2.ilike.%${kw}%,keyword3.ilike.%${kw}%,keyword4.ilike.%${kw}%,keyword5.ilike.%${kw}%`);
            }

            if (filters.industry.length > 0) {
                query = query.in('industry', filters.industry);
            }

            if (filters.region.length > 0) {
                // Region column is empty, so we filter by address containing the prefecture name
                // Supabase .or() syntax for multiple conditions: 'col.op.val,col.op.val'
                const orClause = filters.region.map(r => `address.ilike.%${r}%`).join(',');
                query = query.or(orClause);
            }

            // SNS Filters: Check if URL is not null AND followers > 0 (or user specified min)
            if (filters.sns.length > 0) {
                filters.sns.forEach(sns => {
                    if (sns === 'instagram') {
                        query = query.not('insta_url', 'is', null);
                        query = query.gte('insta_followers', filters.minFollowers || 1);
                    }
                    if (sns === 'tiktok') {
                        query = query.not('tiktok_url', 'is', null);
                        query = query.gte('tiktok_followers', filters.minFollowers || 1);
                    }
                    if (sns === 'youtube') {
                        query = query.not('youtube_url', 'is', null);
                        query = query.gte('youtube_subscribers', filters.minFollowers || 1);
                    }
                });
            }

            // Get samples (limit 5) and total count
            // Note: for security/preview, we only fetch 5
            const { data, count, error } = await query.range(0, 4);

            if (error) throw error;

            setTotalCount(count ?? 0);
            setSamples(data as Company[]);

        } catch (error) {
            console.error('Error fetching companies:', JSON.stringify(error, null, 2));
            if (error instanceof Error) console.error('Error message:', error.message);
            alert('検索中にエラーが発生しました。');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!currentFilters || totalCount < 100) return;

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filters: currentFilters,
                    count: totalCount
                })
            });

            const data = await response.json();
            if (data.url) {
                // Google Ads Conversion Tracking (Purchase)
                const reportConversion = (url: string) => {
                    let called = false;
                    const callback = () => {
                        if (!called) {
                            called = true;
                            window.location.href = url;
                        }
                    };

                    const gtag = (window as any).gtag;
                    if (typeof gtag === 'function') {
                        gtag('event', 'conversion', {
                            'send_to': 'AW-17913025594/GWmkCOv8s-4bELqozN1C',
                            'value': 1.0,
                            'currency': 'JPY',
                            'transaction_id': '',
                            'event_callback': callback
                        });
                        // Fallback timeout in case callback doesn't fire
                        setTimeout(callback, 2000);
                    } else {
                        callback();
                    }
                };

                reportConversion(data.url);
            } else {
                alert('決済セッションの作成に失敗しました。');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('決済処理中にエラーが発生しました。');
        }
    };

    // Initial fetch (optional)
    useEffect(() => {
        // fetchCompanies({ industry: [], region: [], sns: [] });
    }, []);

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            <JsonLd />
            {/* Header (Transparent/Overlay or Sticky) */}
            <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* <img src="/logo.png" alt="Acalist Logo" className="w-8 h-8 rounded-lg object-contain" /> */}
                        {/* Text Logo for Uber style simplicity */}
                        <span className="text-2xl font-black tracking-tighter text-[#06C167]">
                            Acalist.
                        </span>
                    </div>
                    <nav className="text-sm font-bold text-gray-600">
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative bg-[#06C167] pt-16 pb-32 lg:pt-24 lg:pb-40 overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/5 rounded-full blur-3xl"></div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-5xl mx-auto">
                            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                                SNSアカウントのリスト作成を<br className="hidden md:block" />
                                <span className="text-black/80">もっとシンプルに。</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/90 mb-10 font-bold max-w-2xl">
                                SNSアカウント（Instagram, TikTok, YouTube）を持つ企業を検索。<br />
                                会員登録不要。1件15円。即ダウンロード。
                            </p>

                            {/* Search Form Container */}
                            <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 md:p-6 transform transition-transform hover:scale-[1.005]">
                                <SearchForm onSearch={fetchCompanies} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Anchor */}
                <div id="results" className="scroll-mt-24"></div>

                {/* Main Content Area */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Results Section */}
                    {searched && (
                        <div className="mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold text-gray-900">検索結果</h2>
                                {/* You could put sort options here */}
                            </div>

                            {/* Uses ResultPreview but ideally we'd restyle it to be full width or a grid of cards */}
                            {/* For now, just render it. The component itself might need 'w-full' tweaking */}
                            <ResultPreview
                                count={totalCount}
                                loading={loading}
                                samples={samples}
                                onCheckout={handleCheckout}
                            />
                        </div>
                    )}

                    {/* LP Sections (Always visible or only when not searched? Uber keeps scrolling for info) */}
                    <div className={searched ? "mt-24" : "mt-0"}>
                        <LpSections />
                    </div>
                </div>
            </main>
        </div>
    );
}
