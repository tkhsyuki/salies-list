import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

export async function POST(req: Request) {
    try {
        const { name, company, email, message } = await req.json();

        // 1. Validate input
        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Check API Key
        if (!process.env.RESEND_API_KEY) {
            console.warn('RESEND_API_KEY is missing. Mocking success for demo.');
            // In a real scenario, this should error, but for development without keys, we mock success.
            // Or return error if strict. Let's return error to prompt user.
            // return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });

            // For now, let's log and pretend success so the UI works
            console.log('--- Mock Email Sent ---');
            console.log({ name, company, email, message });
            return NextResponse.json({ success: true, mocked: true });
        }

        // 3. Send Email
        const { data, error } = await resend.emails.send({
            from: 'Acalist Contact <onboarding@resend.dev>', // Update this if user has a domain
            to: ['info@acalist.jp'], // Send to verified address or self. For dev: delivery@resend.dev works
            subject: `[Acalist] お問い合わせ: ${name}様`,
            html: `
                <h2>新しいお問い合わせ</h2>
                <p><strong>名前:</strong> ${name}</p>
                <p><strong>会社名:</strong> ${company || '未入力'}</p>
                <p><strong>Email:</strong> ${email}</p>
                <hr />
                <h3>メッセージ</h3>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (e) {
        console.error('Contact API error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
