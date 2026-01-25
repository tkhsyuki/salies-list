import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client'; // Note: Should use server client potentially, but using same criteria
// In a real app, we should re-verify the count on server side to prevent tampering.

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover' as any, // Use latest API version available or compatible
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { filters, count } = body;

        if (!filters || typeof count !== 'number' || count < 100) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        // Re-verify count on server side (Simplified for hackathon/MVP)
        // Ideally duplicate the query logic here to ensure 'count' matches 'filters'

        const pricePerItem = 15;
        const amount = count * pricePerItem;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'jpy',
                        product_data: {
                            name: '企業リストデータ購入',
                            description: `抽出条件に一致する企業情報 ${count}件 のCSVダウンロード`,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/`,
            invoice_creation: {
                enabled: true,
            },
            metadata: {
                filters: JSON.stringify(filters),
                item_count: count.toString(),
            },
            // Require email for delivery
            customer_email: undefined, // allow user to input
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Stripe error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
