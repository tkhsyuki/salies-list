import { Share2, Zap, UserX, Search, CheckCircle, CreditCard, Download, HelpCircle } from 'lucide-react';

export default function LpSections() {
    return (
        <div className="space-y-24 py-20">
            {/* Features Section */}
            <section>
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        J-Corp DB が選ばれる<br className="sm:hidden" />
                        <span className="text-orange-500">3つの理由</span>
                    </h2>
                    <p className="mt-4 text-xl text-gray-500">
                        マーケティングリスト作成の手間をゼロに。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 text-center hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Share2 className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">SNS活用企業に特化</h3>
                        <p className="text-gray-500">
                            X, Instagram, TikTokなど、SNSアカウントを持つ企業のみを厳選。
                            インフルエンサーマーケティングやSNS広告の営業先に最適です。
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 text-center hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Zap className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">1件10円の低価格</h3>
                        <p className="text-gray-500">
                            月額費用は一切不要。必要なリストを必要な分だけ、
                            業界最安値水準の1件10円で購入できます。
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 text-center hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <UserX className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">会員登録不要</h3>
                        <p className="text-gray-500">
                            面倒な会員登録や審査は一切ありません。
                            検索からダウンロードまで最短5分で完了します。
                        </p>
                    </div>
                </div>
            </section>

            {/* How it works Section */}
            <section className="bg-gray-900 text-white py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold sm:text-4xl">
                            ご利用の流れ
                        </h2>
                        <p className="mt-4 text-xl text-gray-400">
                            4ステップで即座にリストを入手できます。
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="relative">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700">
                                    <Search className="w-8 h-8 text-blue-400" />
                                </div>
                                <div className="text-sm font-bold text-blue-400 mb-2">STEP 01</div>
                                <h3 className="text-xl font-bold mb-2">条件で検索</h3>
                                <p className="text-gray-400 text-sm">
                                    業種、地域、SNSの種類などで<br />ターゲット企業を検索
                                </p>
                            </div>
                            <div className="hidden md:block absolute top-8 -right-4 text-gray-600">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                                <div className="text-sm font-bold text-green-400 mb-2">STEP 02</div>
                                <h3 className="text-xl font-bold mb-2">件数・金額確認</h3>
                                <p className="text-gray-400 text-sm">
                                    抽出された件数と金額を確認<br />（5件までプレビュー可能）
                                </p>
                            </div>
                            <div className="hidden md:block absolute top-8 -right-4 text-gray-600">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700">
                                    <CreditCard className="w-8 h-8 text-yellow-400" />
                                </div>
                                <div className="text-sm font-bold text-yellow-400 mb-2">STEP 03</div>
                                <h3 className="text-xl font-bold mb-2">お支払い</h3>
                                <p className="text-gray-400 text-sm">
                                    クレジットカードで<br />安全に決済（Stripe連携）
                                </p>
                            </div>
                            <div className="hidden md:block absolute top-8 -right-4 text-gray-600">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700">
                                    <Download className="w-8 h-8 text-pink-400" />
                                </div>
                                <div className="text-sm font-bold text-pink-400 mb-2">STEP 04</div>
                                <h3 className="text-xl font-bold mb-2">ダウンロード</h3>
                                <p className="text-gray-400 text-sm">
                                    決済完了後、すぐに<br />CSVファイルをダウンロード
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        よくある質問
                    </h2>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-orange-500" />
                            領収書は発行されますか？
                        </h3>
                        <p className="text-gray-600 ml-7">
                            クレジットカード決済完了後にStripeより送信されるメールを領収書代わりとしてご利用いただけます。
                            インボイス制度対応の領収書が必要な場合は、お問い合わせフォームよりご連絡ください。
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-orange-500" />
                            どのような企業データが含まれていますか？
                        </h3>
                        <p className="text-gray-600 ml-7">
                            独自のクローリング技術により収集した、公開されている企業情報です。
                            特にSNSアカウント（X, Instagram, TikTok等）の有無やフォロワー数の情報に特化しています。
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-orange-500" />
                            最低購入件数はありますか？
                        </h3>
                        <p className="text-gray-600 ml-7">
                            はい、システム利用料の関係上、最低100件（1,000円）からのご購入とさせていただいております。
                            検索結果が100件未満の場合は条件を緩和して再検索してください。
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
