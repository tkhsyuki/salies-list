'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            company: formData.get('company'),
            email: formData.get('email'),
            message: formData.get('message'),
        };

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Send failed');

            setStatus('success');
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <header className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <a href="/" className="font-bold text-xl text-gray-900">アカリスト</a>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">お問い合わせ</h1>
                <p className="text-gray-600 mb-8">サービスに関するご質問やご要望、法人プランについてなど、お気軽にお問い合わせください。</p>

                {status === 'success' ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-green-800 mb-2">送信完了</h3>
                        <p className="text-green-700">お問合せありがとうございます。内容を確認次第、担当者よりご連絡させていただきます。</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-6 text-green-700 hover:text-green-900 underline"
                        >
                            新しい問い合わせを送る
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="name">
                                    お名前 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    name="name"
                                    id="name"
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all"
                                    placeholder="山田 太郎"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="company">
                                    会社名
                                </label>
                                <input
                                    name="company"
                                    id="company"
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all"
                                    placeholder="株式会社アカリスト"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="email">
                                メールアドレス <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                name="email"
                                id="email"
                                type="email"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="message">
                                お問い合わせ内容 <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                name="message"
                                id="message"
                                rows={6}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all"
                                placeholder="具体的な内容をご記入ください。"
                            />
                        </div>

                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm">送信に失敗しました。時間をおいて再度お試しください。</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-lime-600 to-emerald-600 hover:shadow-xl hover:-translate-y-0.5'
                                }`}
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    送信する
                                </>
                            )}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}
