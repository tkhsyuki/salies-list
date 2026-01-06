'use client';

import { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus(null);
        }
    };

    const parseCSV = async (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                if (!text) return resolve([]);

                const lines = text.split(/\r\n|\n/);
                const headers = lines[0].split(',').map(h => h.trim());
                const result = [];

                for (let i = 1; i < lines.length; i++) {
                    if (!lines[i].trim()) continue;
                    const obj: any = {};
                    // Handle simple CSV (no quoted commas support for this MVP)
                    const currentline = lines[i].split(',');

                    // Mapping headers to DB columns (assumes CSV headers match or we map them)
                    // Ideally should be robust mapping. For MVP we assume CSV strictly follows schema
                    // company_name,industry,region,address,employee_count,website_url,description,...

                    // Or easier: Just use column names in CSV
                    for (let j = 0; j < headers.length; j++) {
                        if (currentline[j] !== undefined) {
                            obj[headers[j]] = currentline[j].trim();
                        }
                    }
                    result.push(obj);
                }
                resolve(result);
            };
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setStatus(null);

        try {
            const data = await parseCSV(file);

            const response = await fetch('/api/admin/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companies: data }),
            });

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();
            setStatus({ type: 'success', message: `${result.count} items imported successfully!` });
            setFile(null);
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Failed to import data. Check CSV format.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-10 font-sans">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Data Management (Admin)</h1>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition-colors">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer block">
                        {file ? (
                            <div className="text-gray-700 font-medium flex flex-col items-center">
                                <FileText className="w-12 h-12 text-blue-500 mb-2" />
                                {file.name}
                                <span className="text-sm text-gray-400 mt-1 block">Click to change</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                <span className="text-lg font-medium text-gray-600">Click to upload CSV</span>
                                <span className="text-sm text-gray-400 mt-2">company_name, industry, region...</span>
                            </div>
                        )}
                    </label>
                </div>

                {status && (
                    <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {status.message}
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`w-full mt-6 py-3 rounded-lg font-bold text-white transition-all ${!file || uploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
                        }`}
                >
                    {uploading ? 'Importing...' : 'Start Import'}
                </button>
            </div>
        </div>
    );
}
