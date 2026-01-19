export default function JsonLd() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "name": "Acalist（アカリスト）",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "offers": {
                    "@type": "Offer",
                    "price": "15",
                    "priceCurrency": "JPY",
                    "priceValidUntil": "2026-12-31",
                    "availability": "https://schema.org/InStock",
                },
                "description": "企業SNSのリスト作成を好きな条件で好きなだけ。会員登録不要で即購入可能な営業リスト作成ツールです。",
            },
            {
                "@type": "Organization",
                "name": "Acalist（アカリスト）",
                "url": "https://acalist.jp",
                "logo": "https://acalist.jp/logo.png",
                "image": "https://acalist.jp/logo.png"
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "領収書は発行されますか？",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "クレジットカード決済完了後にStripeより送信されるメールを領収書代わりとしてご利用いただけます。インボイス制度対応の領収書が必要な場合は、お問い合わせフォームよりご連絡ください。"
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "どのような企業データが含まれていますか？",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "独自のクローリング技術により収集した、公開されている企業情報です。特にSNSアカウント（X, Instagram, TikTok等）の有無やフォロワー数の情報に特化しています。"
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "最低購入件数はありますか？",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "はい、システム利用料の関係上、最低100件（1,500円）からのご購入とさせていただいております。"
                        }
                    }
                ]
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
