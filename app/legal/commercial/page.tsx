export default function CommercialPage() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-20 bg-white">
            <h1 className="text-3xl font-bold mb-10 text-center">特定商取引法に基づく表記</h1>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <tbody className="divide-y divide-gray-200">
                        <tr>
                            <th className="bg-gray-50 px-6 py-4 font-medium w-1/3">サービス名</th>
                            <td className="px-6 py-4">アカリスト</td>
                        </tr>
                        <tr>
                            <th className="bg-gray-50 px-6 py-4 font-medium w-1/3">販売事業者名</th>
                            <td className="px-6 py-4">アカリスト運営事務局</td>
                        </tr>
                        <tr>
                            <th className="bg-gray-50 px-6 py-4 font-medium">運営統括責任者</th>
                            <td className="px-6 py-4">山田 太郎（代表）</td>
                        </tr>
                        <tr>
                            <th className="bg-gray-50 px-6 py-4 font-medium">所在地</th>
                            <td className="px-6 py-4">特定商取引法に基づき、消費者からの請求がある場合、遅滞なく開示いたします。</td>
                        </tr>
                        <tr>
                            <th className="bg-gray-50 px-6 py-4 font-medium">お問い合わせ</th>
                            <td className="px-6 py-4">
                                support@example.com<br />
                                <span className="text-xs text-gray-500">※電話番号については、特定商取引法に基づき、消費者からの請求がある場合、遅滞なく開示いたします。</span>
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-gray-50 px-6 py-4 font-medium">販売価格</th>
                            <td className="px-6 py-4">サイト内の各購入ページに記載（1件10円〜）</td>
                        </tr>
                        <tr>
                            <th className="bg-gray-50 px-6 py-4 font-medium">商品代金以外の必要料金</th>
                            <td className="px-6 py-4">なし（インターネット接続料金はお客様負担となります）</td>
                        </tr>
                        <tr>
                            <th className="bg-gray-50 px-6 py-4 font-medium">お支払い方法</th>
                            <td className="px-6 py-4">クレジットカード決済（Stripe）</td>
                        </tr>
                        <tr>
                            <th className="bg-gray-50 px-6 py-4 font-medium">商品の引き渡し時期</th>
                            <td className="px-6 py-4">決済完了後、即時にダウンロード可能です。</td>
                        </tr>
                        <tr>
                            <th className="bg-gray-50 px-6 py-4 font-medium">返品・キャンセルについて</th>
                            <td className="px-6 py-4">
                                デジタルコンテンツの性質上、決済完了後の返品・キャンセルはお受けできません。<br />
                                データの不具合等につきましては、お問い合わせ窓口までご連絡ください。
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    );
}
