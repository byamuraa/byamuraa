import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/lib/dataService';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const isAdmin = authUser.email === 'byamuraa@gmail.com';

    // Access control: User can only see their own order; Admin can see all
    if (!isAdmin && order.user?.toString() !== authUser.id) {
      return NextResponse.json(
        { error: 'Forbidden. You do not have access to this order.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Fetch order by ID error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    const isAdmin = authUser?.email === 'byamuraa@gmail.com';
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { orderStatus, paymentStatus, trackingNumber, carrier } = body;

    const updated = await updateOrderStatus(id, {
      orderStatus,
      paymentStatus,
      trackingNumber,
      carrier,
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Order not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
