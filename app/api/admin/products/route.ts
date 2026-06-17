import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Product from '@/lib/models/Product';
import { getAuthUser } from '@/lib/auth';
import { isMongoActive, getProducts, createProduct } from '@/lib/dataService';

// 1. GET - Fetch products list with filters & pagination
export async function GET(req: NextRequest) {
  try {
    // Auth Guard
    const admin = getAuthUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isMongo = await isMongoActive();
    if (isMongo) {
      await dbConnect();
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'newest';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fabric: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    // Sort mapping
    let sortObj: any = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'stock_asc') sortObj = { stock: 1 };
    else if (sort === 'stock_desc') sortObj = { stock: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };

    let total = 0;
    let products = [];

    if (isMongo) {
      total = await Product.countDocuments(query);
      products = await Product.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit);
    } else {
      const allProducts = await getProducts({ category, search, sort, status: 'all' });
      total = allProducts.length;
      products = allProducts.slice(skip, skip + limit);
    }

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
    const admin = getAuthUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isMongo = await isMongoActive();
    if (isMongo) {
      await dbConnect();
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
    let generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (isMongo) {
      // Check slug uniqueness and append random string if duplicate
      const existingSlug = await Product.findOne({ slug: generatedSlug });
      if (existingSlug) {
        generatedSlug = `${generatedSlug}-${Math.random().toString(36).substring(2, 6)}`;
      }
    }

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
