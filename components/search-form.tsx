'use client';

import { useState } from 'react';
import { SearchFilters } from '@/lib/types';
import { Search, Filter, X } from 'lucide-react';

const INDUSTRIES = [
    'Webサービス・アプリ運営業界の会社', 'システム受託開発業界の会社', 'システム開発業界の会社',
    '家電業界の会社', '高齢者向け福祉業界の会社', 'マンション・アパート賃貸業界の会社',
    '紙媒体印刷業界の会社', 'ホテル・旅館業界の会社', 'その他不動産管理業界の会社',
    '専門事務所業界の会社', 'その他スクール業界の会社', '調剤薬局業界の会社',
    '携帯・通信回線販売代理店業界の会社', '高齢者住宅業界の会社', 'Web制作業界の会社',
    'マンション・アパート売買業界の会社', 'デザイン業界の会社', '金属加工請負業界の会社',
    '警備業界の会社', '照明器具業界の会社'
];

const REGIONS = [
    '北海道', '宮城県', '東京都', '神奈川県', '埼玉県', '千葉県',
    '愛知県', '静岡県', '大阪府', '京都府', '兵庫県', '広島県', '福岡県'
];
const SOCIALS = [
    { id: 'instagram', label: 'Instagram' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'youtube', label: 'YouTube' },
];

export default function SearchForm({ onSearch }: { onSearch: (filters: SearchFilters) => void }) {
    const [filters, setFilters] = useState<SearchFilters>({
        industry: [],
        region: [],
        sns: [],
    });

    const toggleFilter = (key: keyof SearchFilters, value: string) => {
        setFilters(prev => {
            const current = prev[key] as string[];
            const next = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [key]: next };
        });
    };

    const handleSearch = () => {
        onSearch(filters);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-lime-100">
            <div className="space-y-6">
                {/* SNS Channels (Moved to Top) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center flex-wrap gap-2">
                        SNS
                        <span className="text-xs text-gray-500 font-normal">（選択したSNSのみアカウントURLとフォロワー数がリスト化されます）</span>
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">必須</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {SOCIALS.map(sns => {
                            const isSelected = filters.sns.includes(sns.id);
                            return (
                                <label
                                    key={sns.id}
                                    className={`flex items-center space-x-2 cursor-pointer p-3 rounded-lg border transition-all ${isSelected
                                        ? 'bg-lime-50 border-lime-500 outline outline-1 outline-lime-500'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleFilter('sns', sns.id)}
                                        className="rounded text-lime-500 focus:ring-lime-200 border-gray-300"
                                    />
                                    <div className="flex items-center gap-2">
                                        {/* Icons */}
                                        {sns.id === 'instagram' && (
                                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <defs>
                                                    <linearGradient id="insta_gradient" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#f09433" />
                                                        <stop offset="0.25" stopColor="#e6683c" />
                                                        <stop offset="0.5" stopColor="#dc2743" />
                                                        <stop offset="0.75" stopColor="#cc2366" />
                                                        <stop offset="1" stopColor="#bc1888" />
                                                    </linearGradient>
                                                </defs>
                                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#insta_gradient)" strokeWidth="2" />
                                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="url(#insta_gradient)" strokeWidth="2" />
                                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="url(#insta_gradient)" strokeWidth="3" strokeLinecap="round" />
                                            </svg>
                                        )}
                                        {sns.id === 'tiktok' && (
                                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 1 0-1 13.6 6.84 6.84 0 0 0 6.46-6.86V6.66a8.55 8.55 0 0 0 3.77.83v-3.8a4.83 4.83 0 0 1 0 3z" />
                                            </svg>
                                        )}
                                        {sns.id === 'youtube' && (
                                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000" />
                                            </svg>
                                        )}
                                        <span className={`text-sm font-bold ${isSelected ? 'text-lime-700' : 'text-gray-700'}`}>{sns.label}</span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Keywords */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">フリーワード検索</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="企業概要などから検索..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lime-200 focus:border-lime-400 outline-none transition-all"
                            onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                {/* Industries */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">業種</label>
                    <div className="flex flex-wrap gap-2">
                        {INDUSTRIES.map(ind => (
                            <button
                                key={ind}
                                onClick={() => toggleFilter('industry', ind)}
                                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${filters.industry.includes(ind)
                                    ? 'bg-lime-50 text-lime-700 border-2 border-lime-500 font-bold'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                    }`}
                            >
                                {ind}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Regions */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">地域</label>
                    <div className="flex flex-wrap gap-2">
                        {REGIONS.map(reg => (
                            <button
                                key={reg}
                                onClick={() => toggleFilter('region', reg)}
                                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${filters.region.includes(reg)
                                    ? 'bg-lime-50 text-lime-700 border-2 border-lime-500 font-bold'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                    }`}
                            >
                                {reg}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Minimum Followers */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">最低フォロワー/登録者数</label>
                    <input
                        type="number"
                        placeholder="例: 1000"
                        min="0"
                        className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lime-200 focus:border-lime-400 outline-none transition-all"
                        onChange={(e) => setFilters(prev => ({
                            ...prev,
                            minFollowers: e.target.value ? parseInt(e.target.value) : undefined
                        }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">選択したSNSそれぞれに対して適用されます</p>
                </div>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    disabled={filters.sns.length === 0}
                    className={`w-full font-bold py-3 rounded-xl shadow-md transition-all text-lg flex items-center justify-center gap-2 ${filters.sns.length > 0
                        ? 'bg-gradient-to-r from-lime-500 to-emerald-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    <Search className="w-5 h-5" />
                    この条件で検索する
                </button>
            </div>
        </div>
    );
}
