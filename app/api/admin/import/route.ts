import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const { companies } = await req.json();

        if (!Array.isArray(companies) || companies.length === 0) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        // Use Service Role Key to bypass RLS for Admin Import
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseServiceKey) {
            console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
            return NextResponse.json({ error: 'Server misconfiguration: Missing Service Key' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Insert into Supabase
        const { data, error } = await supabase
            .from('companies')
            .upsert(companies, { onConflict: 'id' })
            .select();

        if (error) {
            console.error('Import error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ count: companies.length, success: true });
    } catch (error: any) {
        console.error('Server error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
