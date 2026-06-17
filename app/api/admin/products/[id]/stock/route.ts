import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Product from '@/lib/models/Product';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getAuthUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
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
    if (Number(stock) === 0) {
      updateObj.status = 'soldout';
    } else {
      // If was soldout, default back to active (unless it was draft)
      const existingProduct = await Product.findById(id);
      if (existingProduct && existingProduct.status === 'soldout') {
        updateObj.status = 'active';
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateObj },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

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
