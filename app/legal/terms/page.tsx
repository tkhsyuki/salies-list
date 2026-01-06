export default function TermsPage() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-20 bg-white">
            <h1 className="text-3xl font-bold mb-10 text-center">利用規約</h1>

            <div className="space-y-8 text-gray-700 leading-relaxed">
                <section>
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">第1条（総則）</h2>
                    <p>この利用規約（以下「本規約」）は、J-Corp DB（以下「当サービス」）が提供する企業リスト販売サービス（以下「本サービス」）のご利用条件を定めるものです。</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">第2条（利用データの権利）</h2>
                    <p>購入されたデータの著作権等の権利は当サービスに帰属しますが、購入者様は以下の範囲で自由にデータを利用することができます。</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>自社のマーケティング活動（DM発送、電話営業、メール配信等）</li>
                        <li>自社の顧客管理システムへの登録</li>
                        <li>社内での分析・資料作成</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2 text-red-600">第3条（禁止事項）</h2>
                    <p>利用者は、本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 font-bold text-gray-800">
                        <li>購入したデータを第三者へ転売・再配布・貸与する行為</li>
                        <li>購入したデータをWebサイト等で不特定多数へ公開する行為</li>
                        <li>公序良俗に反する目的でのデータ利用</li>
                        <li>当サービスのシステムへ不正にアクセスする行為</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">第4条（免責事項）</h2>
                    <p>
                        当サービスは、提供するデータの正確性について最大限努力しますが、その完全性を保証するものではありません。<br />
                        データの内容に基づいて利用者が被った損害について、当サービスは一切の責任を負わないものとします。
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">第5条（規約の変更）</h2>
                    <p>当サービスは、必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができるものとします。</p>
                </section>
            </div>
        </main>
    );
}
