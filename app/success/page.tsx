'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Download, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            return;
        }

        // Verify session and prepare download (or just show button that triggers download)
        // For now we just assume success if session_id is present, 
        // real app would verify against backend.
        setStatus('success');
    }, [sessionId]);

    const handleDownload = async () => {
        if (!sessionId) return;

        // Trigger download
        // We can open the download API directly in new tab or fetch blob
        window.location.href = `/api/download?session_id=${sessionId}`;
    };

    if (status === 'loading') {
        return <div className="text-center">確認中...</div>;
    }

    if (status === 'error') {
        return (
            <div className="text-center text-red-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">エラーが発生しました</h2>
                <p>決済情報の確認ができませんでした。</p>
                <Link href="/" className="mt-6 inline-block text-blue-500 underline">トップへ戻る</Link>
            </div>
        );
    }

    return (
        <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">ご購入ありがとうございます！</h1>
            <p className="text-gray-600 mb-8">
                決済が完了しました。<br />
                以下のボタンから企業リストをダウンロードしてください。
            </p>

            <button
                onClick={handleDownload}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg flex items-center gap-3 mx-auto transition-all transform hover:-translate-y-1"
            >
                <Download className="w-6 h-6" />
                CSVデータをダウンロード
            </button>

            <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-400">
                <Link href="/" className="hover:text-gray-600">トップページに戻る</Link>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-2xl shadow-sm max-w-lg w-full">
                <Suspense fallback={<div>Loading...</div>}>
                    <SuccessContent />
                </Suspense>
            </div>
        </div>
    );
}
