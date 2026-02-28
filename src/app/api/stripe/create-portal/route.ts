import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = verifyToken(token);
        if (!user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Get user's Stripe customer ID from database
        const userResult = await query(
            'SELECT stripe_customer_id, tier FROM users WHERE id = $1',
            [user.id]
        );

        const stripeCustomerId = userResult.rows[0]?.stripe_customer_id;
        const tier = userResult.rows[0]?.tier;

        // If user is on free tier or has no Stripe customer ID, redirect to pricing
        if (!stripeCustomerId || tier === 'free') {
            return NextResponse.json({
                url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pricing`,
                redirect: true,
                message: 'No active subscription. Choose a plan to get started.',
            });
        }

        // Initialize Stripe
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2026-02-25.clover',
        });

        // Create a billing portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/account`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error('Stripe portal error:', error);
        return NextResponse.json(
            { error: 'Failed to create billing portal session' },
            { status: 500 }
        );
    }
}
