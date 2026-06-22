import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/dataService';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const fabric = searchParams.get('fabric') || undefined;
    const isFeaturedStr = searchParams.get('isFeatured');
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || undefined;

    const isFeatured = isFeaturedStr === 'true' ? true : isFeaturedStr === 'false' ? false : undefined;

    const products = await getProducts({ category, fabric, isFeatured, search, sort });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Fetch products route error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== 'byamuraa@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, category, fabric, price, stock, images, description, dimensions, careInstructions, isFeatured } = body;

    if (!name || !category || !fabric || price === undefined || stock === undefined || !images || !description) {
      return NextResponse.json(
        { error: 'Missing required product fields' },
        { status: 400 }
      );
    }

    const newProduct = await createProduct({
      name,
      category,
      fabric,
      price: Number(price),
      stock: Number(stock),
      images: Array.isArray(images) ? images : [images],
      description,
      dimensions: dimensions || '',
      careInstructions: careInstructions || '',
      isFeatured: !!isFeatured,
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Create product route error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
