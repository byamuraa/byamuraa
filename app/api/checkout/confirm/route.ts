import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOrderById, updateOrderStatus } from '@/lib/dataService';
import { sendOrderConfirmation, sendAdminOrderNotification } from '@/lib/email';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;
if (STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.startsWith('sk_test_mock')) {
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-01-27.accredited' as any,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, sessionId, isMock } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 1. Process Stripe confirmation if sessionId is provided
    if (stripe && sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid' && order.paymentStatus !== 'Paid') {
          // Update order status
          const updatedOrder = await updateOrderStatus(orderId, {
            paymentStatus: 'Paid',
            paymentIntentId: session.payment_intent as string || sessionId,
          });
          
          if (updatedOrder) {
            // Trigger email confirmation
            await sendOrderConfirmation(updatedOrder.email, updatedOrder);
            await sendAdminOrderNotification(updatedOrder);
            return NextResponse.json({ success: true, order: updatedOrder });
          }
        }
      } catch (stripeError) {
        console.error('Stripe session retrieve failed:', stripeError);
        return NextResponse.json({ error: 'Failed to verify Stripe payment' }, { status: 400 });
      }
    }

    // 2. Process Mock confirmation
    if (isMock || order.paymentMethod === 'Mock') {
      if (order.paymentStatus !== 'Paid') {
        const updatedOrder = await updateOrderStatus(orderId, {
          paymentStatus: 'Paid',
        });
        
        if (updatedOrder) {
          await sendOrderConfirmation(updatedOrder.email, updatedOrder);
          await sendAdminOrderNotification(updatedOrder);
          return NextResponse.json({ success: true, order: updatedOrder });
        }
      }
    }

    // Return current order details if already processed
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Confirm checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
