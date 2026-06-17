import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Product from '@/lib/models/Product';
import { getAuthUser } from '@/lib/auth';

// Helper to check authentication
function checkAuth(req: NextRequest) {
  const admin = getAuthUser(req);
  return admin && admin.role === 'admin';
}

// 1. GET - Fetch single product
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Admin Fetch Single Product API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 2. PUT - Update product
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Auto-update slug if name changes
    if (body.name && body.name !== existingProduct.name) {
      let newSlug = body.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Check slug uniqueness
      const existingSlug = await Product.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existingSlug) {
        newSlug = `${newSlug}-${Math.random().toString(36).substring(2, 6)}`;
      }
      body.slug = newSlug;
    }

    // Explicit conversions for numbers
    if (body.price !== undefined) body.price = Number(body.price);
    if (body.compareAtPrice !== undefined) body.compareAtPrice = Number(body.compareAtPrice);
    if (body.stock !== undefined) body.stock = Number(body.stock);

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error('Admin Update Product API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// 3. DELETE - Remove product
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product successfully deleted' });
  } catch (error: any) {
    console.error('Admin Delete Product API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
