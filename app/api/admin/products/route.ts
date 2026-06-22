import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProducts, createProduct, generateUniqueSlug } from '@/lib/dataService';

// Helper to check authentication
async function checkAuth() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user && user.email === 'byamuraa@gmail.com';
  } catch {
    return false;
  }
}

// 1. GET - Fetch products list with filters & pagination
export async function GET(req: NextRequest) {
  try {
    // Auth Guard
    if (!(await checkAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'newest';

    const skip = (page - 1) * limit;

    const allProducts = await getProducts({ category, search, sort, status: 'all' });
    const total = allProducts.length;
    const products = allProducts.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Admin Fetch Products API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// 2. POST - Create new product
export async function POST(req: NextRequest) {
  try {
    // Auth Guard
    if (!(await checkAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      category,
      fabric,
      price,
      compareAtPrice,
      stock,
      status,
      isNewDrop,
      isBestseller,
      images,
      description,
      dimensions,
      careInstructions,
      liningColor,
      zipperType,
      strapType,
      variants,
      seo,
    } = body;

    // Basic Validation
    if (!name || !category || !fabric || !price || !images || images.length === 0 || !description) {
      return NextResponse.json(
        { error: 'Required fields: name, category, fabric, price, images, description' },
        { status: 400 }
      );
    }

    // Create unique slug
    const generatedSlug = await generateUniqueSlug(name);

    const payload = {
      name,
      slug: generatedSlug,
      category,
      fabric,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : 0,
      stock: stock ? Number(stock) : 0,
      status: status || 'active',
      isNewDrop: !!isNewDrop,
      isBestseller: !!isBestseller,
      images,
      description,
      dimensions: dimensions || '',
      careInstructions: careInstructions || '',
      liningColor: liningColor || '',
      zipperType: zipperType || '',
      strapType: strapType || '',
      variants: variants || [],
      seo: seo || { metaTitle: name, metaDesc: description.substring(0, 150) },
    };

    const newProduct = await createProduct(payload);

    return NextResponse.json({
      success: true,
      product: newProduct,
    });
  } catch (error: any) {
    console.error('Admin Create Product API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
