import { Share2, Zap, UserX, Search, CheckCircle, CreditCard, Download, HelpCircle } from 'lucide-react';

export default function LpSections() {
    return (
        <div className="space-y-32 py-24">
            {/* Features Section - Bento/Grid Style */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                        Why Acalist?
                    </h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
                        マーケティングを加速させる、最適なリスト作成体験。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 flex flex-col items-start group">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 mb-8 group-hover:bg-[#06C167] group-hover:text-white transition-colors duration-300">
                            <Share2 className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">SNS活用企業に特化</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Instagram, TikTok, YouTubeなど、SNSをアクティブに運用している企業のみを厳選。
                            従来の企業データベースにはない「発信力のある企業」にリーチできます。
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-gray-900 p-10 rounded-3xl border border-gray-800 shadow-xl flex flex-col items-start text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-[#06C167]/20 transition-colors duration-500"></div>
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8 relative z-10">
                            <Zap className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 relative z-10">圧倒的な低コスト</h3>
                        <p className="text-gray-400 leading-relaxed relative z-10">
                            月額費用・初期費用は一切不要。<br />
                            必要なリストを、必要な時に、<br />
                            <span className="text-[#06C167] font-bold">1件15円</span> という業界最安水準で購入可能です。
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 flex flex-col items-start group">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 mb-8 group-hover:bg-[#06C167] group-hover:text-white transition-colors duration-300">
                            <UserX className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">会員登録不要</h3>
                        <p className="text-gray-600 leading-relaxed">
                            面倒な商談や審査、会員登録は一切ありません。
                            検索から決済、ダウンロードまでWeb上で完結。
                            今すぐリストが必要なその瞬間に応えます。
                        </p>
                    </div>
                </div>
            </section>

            {/* How it works Section */}
            <section className="bg-gray-50 py-24 border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
                        <div>
                            <span className="text-[#06C167] font-bold tracking-wider uppercase text-sm">How it works</span>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3 tracking-tight">
                                4ステップで、手元に。
                            </h2>
                        </div>
                        <p className="text-xl text-gray-500 font-medium md:max-w-md">
                            複雑な手続きは一切不要。<br />
                            今すぐに営業活動を開始できます。
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Hidden on mobile) */}
                        <div className="hidden md:block absolute top-[2.5rem] left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>

                        {[
                            { step: '01', title: '検索', desc: '業種・地域・SNSでターゲットを絞り込み', icon: Search },
                            { step: '02', title: '確認', desc: '件数と見積もり金額を即座にプレビュー', icon: CheckCircle },
                            { step: '03', title: '決済', desc: 'クレジットカードで安全に決済完了', icon: CreditCard },
                            { step: '04', title: 'DL', desc: 'CSVファイルを即座にダウンロード', icon: Download },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative group hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-20 h-20 bg-white border-4 border-gray-50 rounded-full flex items-center justify-center text-gray-900 mb-6 mx-auto md:mx-0 shadow-sm group-hover:border-[#06C167] transition-colors duration-300">
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <div className="text-xs font-black text-gray-300 mb-2">STEP {item.step}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="max-w-3xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900">
                        よくある質問
                    </h2>
                </div>

                <div className="space-y-4">
                    {[
                        { q: '領収書は発行されますか？', a: '決済完了後にStripeより送信されるメールを領収書としてご利用いただけます。適格請求書が必要な場合はお問い合わせください。' },
                        { q: 'どのような企業データが含まれていますか？', a: '公式サイト等から収集した公開情報です。特にSNSアカウント（Instagram, TikTok, YouTube）の有無に特化しています。' },
                        { q: '最低購入件数はありますか？', a: 'システムの都合上、最低100件（1,500円）からのご購入とさせていただいております。' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
                            <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-start gap-3">
                                <HelpCircle className="w-6 h-6 text-[#06C167] flex-shrink-0 mt-0.5" />
                                {item.q}
                            </h3>
                            <p className="text-gray-600 ml-9 leading-relaxed">
                                {item.a}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
