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

            // SNS Filters: Check if URL is not null
            if (filters.sns.length > 0) {
                filters.sns.forEach(sns => {
                    if (sns === 'instagram') {
                        query = query.not('insta_url', 'is', null);
                        if (filters.minFollowers) query = query.gte('insta_followers', filters.minFollowers);
                    }
                    if (sns === 'tiktok') {
                        query = query.not('tiktok_url', 'is', null);
                        if (filters.minFollowers) query = query.gte('tiktok_followers', filters.minFollowers);
                    }
                    if (sns === 'youtube') {
                        query = query.not('youtube_url', 'is', null);
                        if (filters.minFollowers) query = query.gte('youtube_subscribers', filters.minFollowers);
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
                window.location.href = data.url;
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
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <JsonLd />
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Acalist Logo" className="w-8 h-8 rounded-lg object-contain" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-lime-600 to-emerald-600">
                            アカリスト
                        </span>
                    </div>
                    <nav className="text-sm font-medium text-gray-500">
                        For Marketers & Sales
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 sm:text-5xl">
                        SNSアカウントを持つ企業のリストを<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-emerald-500">
                            会員登録不要で即ダウンロード
                        </span>
                    </h1>
                    <p className="max-w-xl mx-auto text-lg text-gray-600">
                        業種・地域・フォロワー数など、好きな条件でピンポイント検索。<br />
                        営業に必要なリストを、1件15円から今すぐ入手できます。
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Search Form */}
                    <div className="lg:col-span-7">
                        <SearchForm onSearch={fetchCompanies} />
                    </div>

                    {/* Right: Preview & Purchase */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-24">
                            <ResultPreview
                                count={totalCount}
                                loading={loading}
                                samples={samples}
                                onCheckout={handleCheckout}
                            />
                        </div>
                    </div>
                </div>

                {/* LP Sections (Features, Steps, FAQ) */}
                <LpSections />
            </main>
        </div>
    );
}
