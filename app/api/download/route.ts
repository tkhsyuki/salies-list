import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';
import { SearchFilters } from '@/lib/types';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-01-27.acacia' as any,
});

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
        }

        // 1. Retrieve Session from Stripe to get metadata
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not completed' }, { status: 403 });
        }

        const filtersStr = session.metadata?.filters;
        if (!filtersStr) {
            return NextResponse.json({ error: 'No filters found' }, { status: 400 });
        }

        const filters: SearchFilters = JSON.parse(filtersStr);

        // 2. Fetch Companies based on Filters
        let query = supabase.from('companies').select('*');

        if (filters.keyword) {
            const kw = filters.keyword;
            query = query.or(`company_name.ilike.%${kw}%,description.ilike.%${kw}%,keyword1.ilike.%${kw}%,keyword2.ilike.%${kw}%,keyword3.ilike.%${kw}%,keyword4.ilike.%${kw}%,keyword5.ilike.%${kw}%`);
        }
        if (filters.industry && filters.industry.length > 0) {
            query = query.in('industry', filters.industry);
        }
        if (filters.region && filters.region.length > 0) {
            const orClause = filters.region.map(r => `address.ilike.%${r}%`).join(',');
            query = query.or(orClause);
        }
        if (filters.sns && filters.sns.length > 0) {
            filters.sns.forEach(sns => {
                if (sns === 'instagram') {
                    query = query.not('insta_url', 'is', null);
                    query = query.gte('insta_followers', filters.minFollowers || 1);
                }
                if (sns === 'tiktok') {
                    query = query.not('tiktok_url', 'is', null);
                    query = query.gte('tiktok_followers', filters.minFollowers || 1);
                }
                if (sns === 'youtube') {
                    query = query.not('youtube_url', 'is', null);
                    query = query.gte('youtube_subscribers', filters.minFollowers || 1);
                }
            });
        }

        const { data: companies, error } = await query.limit(50000);

        if (error || !companies) {
            console.error('Database error:', error);
            return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
        }

        // 3. Generate CSV
        // Define dynamic columns
        const snsColumns = [
            { id: 'instagram', headers: ['Insta URL', 'Instaフォロワー'], getters: [(c: any) => c.insta_url || '', (c: any) => c.insta_followers || ''] },
            { id: 'tiktok', headers: ['TikTok URL', 'TikTokフォロワー'], getters: [(c: any) => c.tiktok_url || '', (c: any) => c.tiktok_followers || ''] },
            { id: 'youtube', headers: ['Youtube URL', 'Youtube登録者数'], getters: [(c: any) => c.youtube_url || '', (c: any) => c.youtube_subscribers || ''] },
        ];

        // Determine which SNS columns to include
        // If filters.sns is empty, include ALL. If not, include only selected.
        const activeSns = (filters.sns && filters.sns.length > 0)
            ? snsColumns.filter(col => filters.sns.includes(col.id))
            : snsColumns;

        const headers = [
            '企業名', '業種', '地域', '住所', '従業員数', '会社HP', '企業概要',
            ...activeSns.flatMap(col => col.headers)
        ].join(',');

        const rows = companies.map(c => {
            const snsValues = activeSns.flatMap(col => col.getters.map(g => g(c)));

            return [
                c.company_name,
                c.industry,
                c.region,
                c.address || '',
                c.employee_count || '',
                c.website_url || '',
                `"${(c.description || '').replace(/"/g, '""')}"`, // escape quotes
                ...snsValues
            ].join(',');
        });

        const csvContent = '\uFEFF' + [headers, ...rows].join('\n'); // Add BOM for Excel

        // 4. Return CSV Response
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="companies_list_${new Date().toISOString().slice(0, 10)}.csv"`,
            },
        });

    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
