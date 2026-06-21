import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createOrder, updateOrderStatus } from '@/lib/dataService';
import { createClient } from '@/lib/supabase/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Initialize Stripe if valid key exists
let stripe: Stripe | null = null;
if (STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.startsWith('sk_test_mock')) {
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-01-27.accredited' as any, // standard api version fallback
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shippingAddress, totalAmount, email } = body;

    if (!items || !shippingAddress || !totalAmount || !email) {
      return NextResponse.json(
        { error: 'Missing required order elements' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    // 1. Create the order in "Pending" state (this also checks stock and decrements it)
    let order;
    try {
      order = await createOrder({
        user: authUser ? authUser.id : null,
        email,
        items,
        shippingAddress,
        totalAmount: Number(totalAmount),
        paymentMethod: stripe ? 'Stripe' : 'Mock',
        paymentStatus: 'Pending',
        paymentIntentId: '',
      });
    } catch (stockError: any) {
      return NextResponse.json(
        { error: stockError.message || 'Stock allocation failed' },
        { status: 400 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order creation failed' },
        { status: 500 }
      );
    }

    const orderId = order._id.toString();

    // 2. If Stripe is not configured, redirect to local mock payment gateway
    if (!stripe) {
      return NextResponse.json({
        success: true,
        gateway: 'mock',
        redirectUrl: `${APP_URL}/checkout/mock-payment-gateway?orderId=${orderId}`,
      });
    }

    // 3. Create Stripe Checkout Session
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image.startsWith('/') ? `${APP_URL}${item.image}` : item.image],
          description: `Fabric: ${item.fabric}`,
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${APP_URL}/checkout/success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/cart`,
      customer_email: email,
      metadata: {
        orderId: orderId,
      },
    });

    // Update order with the Stripe checkout session ID as the temporary payment intent tracking ID
    await updateOrderStatus(orderId, {
      paymentIntentId: session.id,
    });

    return NextResponse.json({
      success: true,
      gateway: 'stripe',
      redirectUrl: session.url,
    });
  } catch (error: any) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
