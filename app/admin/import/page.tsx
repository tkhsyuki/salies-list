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
                // Handle headers - assuming simple CSV for headers or same logic
                // Better to use the same logic for headers too if they might be quoted
                const parseLine = (line: string) => {
                    const result = [];
                    let start = 0;
                    let inQuotes = false;
                    for (let i = 0; i < line.length; i++) {
                        if (line[i] === '"') {
                            inQuotes = !inQuotes;
                        } else if (line[i] === ',' && !inQuotes) {
                            let val = line.substring(start, i).trim();
                            // Remove surrounding quotes if present
                            if (val.startsWith('"') && val.endsWith('"')) {
                                val = val.substring(1, val.length - 1).replace(/""/g, '"');
                            }
                            result.push(val);
                            start = i + 1;
                        }
                    }
                    // Add last field
                    let val = line.substring(start).trim();
                    if (val.startsWith('"') && val.endsWith('"')) {
                        val = val.substring(1, val.length - 1).replace(/""/g, '"');
                    }
                    result.push(val);
                    return result;
                };

                const headers = parseLine(lines[0]);
                const result = [];

                for (let i = 1; i < lines.length; i++) {
                    if (!lines[i].trim()) continue;

                    const currentline = parseLine(lines[i]);
                    const obj: any = {};

                    for (let j = 0; j < headers.length; j++) {
                        if (j < currentline.length) {
                            let val: string | null = currentline[j];
                            // Convert empty strings to null to ensure DB compatibility for non-string types
                            if (val === '') {
                                val = null;
                            }

                            const header = headers[j];
                            // Skip 'id' column to let DB generate UUIDs, and skip 'Unnamed' columns
                            if (header && !header.startsWith('Unnamed') && header.toLowerCase() !== 'id') {
                                // Fix integer columns having "0.0" or "100.0"
                                if (val && val.endsWith('.0') && !isNaN(parseFloat(val))) {
                                    val = val.slice(0, -2);
                                }

                                // Strict integer sanitization for numeric columns
                                if (['employee_count', 'x_followers', 'insta_followers', 'tiktok_followers', 'youtube_subscribers', 'facebook_followers', 'line_friends'].includes(header)) {
                                    if (val) {
                                        // Remove non-numeric chars (except dot if we want to handle floats again, but we just want int)
                                        // Actually some might be "1,000" -> "1000"
                                        const numStr = val.toString().replace(/[^0-9.]/g, '');
                                        let num = parseInt(numStr, 10);

                                        // Handle NaN
                                        if (isNaN(num)) {
                                            num = 0;
                                        }

                                        // Clamp to Postgres Integer Max (2,147,483,647) to avoid "out of range" errors
                                        const MAX_INT = 2147483647;
                                        if (num > MAX_INT) {
                                            num = MAX_INT;
                                        }

                                        val = num.toString();
                                    } else {
                                        val = '0';
                                    }
                                }

                                // Handle required fields (NOT NULL in DB)
                                // If empty, populate with dummy value to avoid constraint error
                                if (val === null && ['company_name', 'industry', 'region'].includes(header)) {
                                    val = '-';
                                }

                                obj[header] = val;
                            }
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
            const BATCH_SIZE = 500;
            const totalBatches = Math.ceil(data.length / BATCH_SIZE);
            let successCount = 0;

            for (let i = 0; i < totalBatches; i++) {
                const start = i * BATCH_SIZE;
                const end = start + BATCH_SIZE;
                const batch = data.slice(start, end);

                setStatus({
                    type: 'success', // using success style for progress
                    message: `Importing batch ${i + 1}/${totalBatches} (${Math.round((i / totalBatches) * 100)}%)...`
                });

                const response = await fetch('/api/admin/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ companies: batch }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    console.error(`Batch ${i + 1} failed:`, errorData);
                    throw new Error(`Batch ${i + 1} failed: ${errorData.error || response.statusText}`);
                }

                const result = await response.json();
                successCount += (result.count || 0);
            }

            setStatus({ type: 'success', message: `Completed! ${successCount} items imported successfully.` });
            setFile(null);
        } catch (error: any) {
            console.error(error);
            setStatus({ type: 'error', message: error.message || 'Failed to import data.' });
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
