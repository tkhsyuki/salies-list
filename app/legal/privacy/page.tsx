export default function PrivacyPage() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-20 bg-white">
            <h1 className="text-3xl font-bold mb-10 text-center">プライバシーポリシー</h1>

            <div className="space-y-8 text-gray-700 leading-relaxed">
                <section>
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">1. 個人情報の定義</h2>
                    <p>
                        本プライバシーポリシーにおいて、個人情報とは、個人情報の保護に関する法律に規定される生存する個人に関する情報であって、
                        氏名、生年月日、電話番号、その他の記述等により特定の個人を識別することができるものを指します。
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">2. 個人情報の収集・利用目的</h2>
                    <p>当サービスは、以下の目的で個人情報を収集・利用します。</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>サービスの提供および運営のため</li>
                        <li>ご購入いただいた商品（データ）の送付・ダウンロード案内のため</li>
                        <li>ユーザーからのお問い合わせに回答するため</li>
                        <li>重要なお知らせなど必要に応じたご連絡のため</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">3. 個人情報の第三者提供</h2>
                    <p>
                        当サービスは、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。
                        ただし、決済代行会社（Stripe）への決済情報の提供など、サービス運用に不可欠な外部委託の場合は除きます。
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">4. Cookieの利用について</h2>
                    <p>
                        当サービスでは、決済処理およびサイトの利用状況分析のためにCookieを使用しています。<br />
                        特に、決済システムおよびセキュリティ保持のためにStripe等の第三者サービスがCookieを使用する場合があります。
                        ブラウザの設定によりCookieを無効にすることも可能ですが、その場合、決済機能などが正しく動作しない可能性があります。
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">5. お問い合わせ窓口</h2>
                    <p>
                        本ポリシーに関するお問い合わせは、以下の窓口までお願いいたします。<br />
                        Eメール: support@example.com
                    </p>
                </section>
            </div>
        </main>
    );
}
