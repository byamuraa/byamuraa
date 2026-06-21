import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/dataService';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const isAdmin = authUser.email === 'byamuraa@gmail.com';
    let orders;

    if (isAdmin) {
      // Admin sees all orders
      orders = await getOrders();
    } else {
      // Normal user sees their own orders
      orders = await getOrders(authUser.id);
    }

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shippingAddress, totalAmount, email, paymentIntentId, paymentMethod } = body;

    if (!items || !shippingAddress || !totalAmount || !email) {
      return NextResponse.json(
        { error: 'Missing required order details' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    // Create the order. Decrementing stock is handled atomically in dataService.
    const newOrder = await createOrder({
      user: authUser ? authUser.id : null, // Null for guest checkout
      email,
      items,
      shippingAddress,
      totalAmount: Number(totalAmount),
      paymentMethod: paymentMethod || 'Stripe',
      paymentStatus: paymentMethod === 'Mock' ? 'Paid' : 'Pending', // Mark paid immediately if testing mock payment
      paymentIntentId: paymentIntentId || '',
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 400 }
    );
  }
}
