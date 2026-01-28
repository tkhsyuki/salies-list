'use client';

import Script from 'next/script';

export default function Analytics() {
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
    const ADS_ID = 'AW-17913025594';

    const MAIN_ID = GA_ID || ADS_ID;

    if (!MAIN_ID) {
        return null;
    }

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${MAIN_ID}`}
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        ${GA_ID ? `gtag('config', '${GA_ID}', { page_path: window.location.pathname });` : ''}
                        ${ADS_ID ? `gtag('config', '${ADS_ID}');` : ''}
                    `,
                }}
            />
        </>
    );
}
