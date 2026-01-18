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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
            <div className="space-y-6">
                {/* Keywords */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">フリーワード検索</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="企業概要などから検索..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
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
                                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
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
                                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                    }`}
                            >
                                {reg}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SNS Channels */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SNSアカウント保有</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {SOCIALS.map(sns => (
                            <label key={sns.id} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={filters.sns.includes(sns.id)}
                                    onChange={() => toggleFilter('sns', sns.id)}
                                    className="rounded text-orange-500 focus:ring-orange-200 border-gray-300"
                                />
                                <span className="text-sm text-gray-700">{sns.label}</span>
                            </label>
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
                        className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
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
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center gap-2"
                >
                    <Search className="w-5 h-5" />
                    この条件で検索する
                </button>
            </div>
        </div>
    );
}
