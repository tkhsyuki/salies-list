import { Construction } from 'lucide-react';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Construction className="w-8 h-8 text-orange-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    ただいまメンテナンス中です
                </h1>

                <p className="text-gray-500 mb-6">
                    現在、サービスの品質向上のためシステムメンテナンスを行っております。<br />
                    ご不便をおかけしますが、再開まで今しばらくお待ちください。
                </p>

                <div className="text-sm text-gray-400">
                    &copy; Sales List Platform
                </div>
            </div>
        </div>
    );
}
