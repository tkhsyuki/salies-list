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
            query = query.or(`company_name.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%`);
        }
        if (filters.industry && filters.industry.length > 0) {
            query = query.in('industry', filters.industry);
        }
        if (filters.region && filters.region.length > 0) {
            query = query.in('region', filters.region);
        }
        if (filters.sns && filters.sns.length > 0) {
            filters.sns.forEach(sns => {
                if (sns === 'x') query = query.not('x_url', 'is', null);
                if (sns === 'instagram') query = query.not('insta_url', 'is', null);
                if (sns === 'tiktok') query = query.not('tiktok_url', 'is', null);
                if (sns === 'youtube') query = query.not('youtube_url', 'is', null);
                if (sns === 'facebook') query = query.not('facebook_url', 'is', null);
                if (sns === 'line') query = query.not('line_url', 'is', null);
            });
        }

        const { data: companies, error } = await query;

        if (error || !companies) {
            console.error('Database error:', error);
            return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
        }

        // 3. Generate CSV
        const headers = [
            '企業名', '業種', '地域', '住所', '従業員数', '会社HP', '企業概要',
            'X URL', 'Xフォロワー', 'Insta URL', 'Instaフォロワー',
            'TikTok URL', 'Youtube URL', 'Facebook URL', 'LINE URL'
        ].join(',');

        const rows = companies.map(c => {
            return [
                c.company_name,
                c.industry,
                c.region,
                c.address || '',
                c.employee_count || '',
                c.website_url || '',
                `"${(c.description || '').replace(/"/g, '""')}"`, // escape quotes
                c.x_url || '', c.x_followers || '',
                c.insta_url || '', c.insta_followers || '',
                c.tiktok_url || '',
                c.youtube_url || '',
                c.facebook_url || '',
                c.line_url || ''
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
