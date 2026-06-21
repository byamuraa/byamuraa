import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProductById, updateProduct } from '@/lib/dataService';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Auth Guard
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== 'byamuraa@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { stock } = await req.json();

    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
      return NextResponse.json(
        { error: 'Valid non-negative stock count is required' },
        { status: 400 }
      );
    }

    // Determine status automatically if stock becomes 0
    const updateObj: any = { stock: Number(stock) };
    const existingProduct = await getProductById(id);

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (Number(stock) === 0) {
      updateObj.status = 'soldout';
    } else {
      // If was soldout, default back to active (unless it was draft)
      if (existingProduct.status === 'soldout') {
        updateObj.status = 'active';
      }
    }

    const updatedProduct = await updateProduct(id, updateObj);

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error('Admin Stock Update Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
