import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/dataService';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Fetch product by ID route error:', error);
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== 'byamuraa@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await updateProduct(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: 'Product not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Update product route error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== 'byamuraa@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const deleted = await deleteProduct(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Product not found or delete failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully', product: deleted });
  } catch (error) {
    console.error('Delete product route error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
