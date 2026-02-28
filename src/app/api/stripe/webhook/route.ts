import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

// Map Stripe price IDs to tiers
const PRICE_TO_TIER: Record<string, string> = {
  'price_1T5FC5QyB02WZhhMEg8fFmYe': 'personal',     // €9 Personal
  'price_1T5FCJQyB02WZhhMlMXvSDYb': 'pro',           // €29 Pro
  'price_1T5FCTQyB02WZhhMufeyyHwh': 'enterprise',   // €99 Enterprise
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Get customer email
        let customerEmail = session.customer_email;

        if (!customerEmail && session.customer) {
          const customer = await stripe.customers.retrieve(session.customer as string);
          if ('email' in customer) {
            customerEmail = customer.email;
          }
        }

        if (!customerEmail) {
          console.error('No customer email found');
          break;
        }

        // Get price ID from line items
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;

        if (!priceId) {
          console.error('No price ID found');
          break;
        }

        // Determine tier from price ID
        const tier = PRICE_TO_TIER[priceId];
        if (!tier) {
          console.error('Unknown price ID:', priceId);
          break;
        }

        // Update user in database
        await query(
          `UPDATE users 
           SET tier = $1,
               subscription_status = 'active',
               stripe_customer_id = $2,
               stripe_subscription_id = $3,
               subscription_current_period_end = to_timestamp($4),
               updated_at = CURRENT_TIMESTAMP
           WHERE email = $5`,
          [
            tier,
            session.customer as string,
            session.subscription as string,
            session.expires_at || Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
            customerEmail,
          ]
        );

        console.log(`✅ Updated user ${customerEmail} to ${tier} tier`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Get customer
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const email = 'email' in customer ? customer.email : null;

        if (!email) break;

        // Get price ID
        const priceId = subscription.items.data[0]?.price?.id;
        const tier = PRICE_TO_TIER[priceId];

        if (!tier) break;

        // Update user
        await query(
          `UPDATE users 
           SET tier = $1,
               subscription_status = $2,
               subscription_current_period_end = to_timestamp($3),
               updated_at = CURRENT_TIMESTAMP
           WHERE email = $4`,
          [
            tier,
            subscription.status,
            (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end || Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
            email,
          ]
        );

        console.log(`✅ Updated subscription for ${email} to ${tier} (${subscription.status})`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Get customer
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const email = 'email' in customer ? customer.email : null;

        if (!email) break;

        // Downgrade to free
        await query(
          `UPDATE users 
           SET tier = 'free',
               subscription_status = 'canceled',
               updated_at = CURRENT_TIMESTAMP
           WHERE email = $1`,
          [email]
        );

        console.log(`✅ Canceled subscription for ${email}, downgraded to free`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
