import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderStatus } from '@/lib/dataService';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;
if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-01-27.accredited' as any,
  });
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !webhookSecret || !stripe) {
    console.error('Webhook verification error: Missing signature, webhook secret, or stripe configuration');
    return NextResponse.json({ error: 'Webhook configuration missing or signature missing' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const paymentIntentId = session.payment_intent as string;

      if (orderId) {
        // Mark order as Paid
        await updateOrderStatus(orderId, {
          paymentStatus: 'Paid',
          paymentIntentId: paymentIntentId || session.id,
        });
        console.log(`Order ${orderId} successfully marked as PAID via Stripe Webhook`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe Webhook Handler Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
