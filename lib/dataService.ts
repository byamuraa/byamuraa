import { createClient, createAdminClient } from '@/lib/supabase/server';

// -------------------------------------------------------------
// DATABASE FIELD MAPPING HELPERS
// -------------------------------------------------------------

function mapProductFromDb(p: any) {
  if (!p) return null;
  return {
    _id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    fabric: p.fabric,
    price: Number(p.price),
    compareAtPrice: Number(p.compare_at_price || 0),
    stock: p.stock,
    status: p.status,
    isNewDrop: p.is_new_drop,
    isBestseller: p.is_bestseller,
    images: (p.images || []).map((img: any) => {
      if (typeof img === 'string') {
        try {
          const parsed = JSON.parse(img);
          return parsed.url || img;
        } catch {
          return img;
        }
      }
      return img?.url || img;
    }),
    description: p.description,
    dimensions: p.dimensions,
    careInstructions: p.care_instructions,
    liningColor: p.lining_color,
    zipperType: p.zipper_type,
    strapType: p.strap_type,
    variants: p.variants || [],
    seo: p.seo || { metaTitle: '', metaDesc: '' },
    averageRating: Number(p.average_rating || 0),
    numReviews: p.num_reviews || 0,
    isFeatured: p.is_featured,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

function mapProductToDb(p: any): any {
  if (!p) return {};
  const dbData: any = {};

  if (p.name !== undefined) dbData.name = p.name;
  if (p.slug !== undefined) {
    dbData.slug = p.slug;
  } else if (p.name !== undefined) {
    dbData.slug = p.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  if (p.category !== undefined) dbData.category = p.category;
  if (p.fabric !== undefined) dbData.fabric = p.fabric;
  if (p.price !== undefined) dbData.price = p.price;
  if (p.compareAtPrice !== undefined) dbData.compare_at_price = p.compareAtPrice;
  if (p.stock !== undefined) dbData.stock = p.stock;
  if (p.status !== undefined) dbData.status = p.status;
  if (p.isNewDrop !== undefined) dbData.is_new_drop = p.isNewDrop;
  if (p.isBestseller !== undefined) dbData.is_bestseller = p.isBestseller;
  
  if (p.images !== undefined) {
    dbData.images = p.images.map((img: any) => {
      if (typeof img === 'string') {
        try {
          const parsed = JSON.parse(img);
          return parsed.url || img;
        } catch {
          return img;
        }
      }
      return img?.url || '';
    }).filter(Boolean);
  }
  
  if (p.description !== undefined) dbData.description = p.description;
  if (p.dimensions !== undefined) dbData.dimensions = p.dimensions;
  if (p.careInstructions !== undefined) dbData.care_instructions = p.careInstructions;
  if (p.liningColor !== undefined) dbData.lining_color = p.liningColor;
  if (p.zipperType !== undefined) dbData.zipper_type = p.zipperType;
  if (p.strapType !== undefined) dbData.strap_type = p.strapType;
  if (p.variants !== undefined) dbData.variants = p.variants;
  if (p.seo !== undefined) dbData.seo = p.seo;
  if (p.averageRating !== undefined) dbData.average_rating = p.averageRating;
  if (p.numReviews !== undefined) dbData.num_reviews = p.numReviews;
  if (p.isFeatured !== undefined) dbData.is_featured = p.isFeatured;

  return dbData;
}

function mapOrderFromDb(o: any) {
  if (!o) return null;
  return {
    _id: o.id,
    user: o.user_id,
    email: o.email,
    items: o.items,
    shippingAddress: o.shipping_address,
    totalAmount: Number(o.total_amount),
    paymentStatus: o.payment_status,
    paymentMethod: o.payment_method,
    paymentIntentId: o.payment_intent_id,
    orderStatus: o.order_status,
    trackingNumber: o.tracking_number,
    carrier: o.carrier,
    createdAt: o.created_at,
  };
}

function mapReviewFromDb(r: any) {
  if (!r) return null;
  return {
    _id: r.id,
    product: r.product_id,
    user: r.user_id,
    reviewerName: r.reviewer_name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  };
}

// -------------------------------------------------------------
// PRODUCT OPERATIONS
// -------------------------------------------------------------

export async function getProducts(filters: {
  category?: string;
  fabric?: string;
  isFeatured?: boolean;
  search?: string;
  sort?: string;
  status?: string;
} = {}) {
  const supabase = await createClient();
  let query = supabase.from('products').select('*');

  if (filters.category) {
    query = query.ilike('category', filters.category);
  }
  if (filters.fabric) {
    query = query.ilike('fabric', filters.fabric);
  }
  if (filters.isFeatured !== undefined) {
    query = query.eq('is_featured', filters.isFeatured);
  }
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  } else if (!filters.status) {
    query = query.eq('status', 'active');
  }

  if (filters.sort) {
    if (filters.sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (filters.sort === 'price_desc') query = query.order('price', { ascending: false });
    else if (filters.sort === 'newest') query = query.order('created_at', { ascending: false });
    else if (filters.sort === 'popularity') query = query.order('average_rating', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error('Supabase getProducts error:', error);
    return [];
  }

  return (data || []).map(mapProductFromDb);
}

export async function getProductById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Supabase getProductById error:', error);
    return null;
  }
  return mapProductFromDb(data);
}

export async function createProduct(data: any) {
  const supabase = await createClient();
  const dbData = mapProductToDb(data);
  const { data: inserted, error } = await supabase
    .from('products')
    .insert([dbData])
    .select()
    .single();

  if (error) {
    console.error('Supabase createProduct error:', error);
    throw error;
  }
  return mapProductFromDb(inserted);
}

export async function updateProduct(id: string, data: any) {
  const supabase = await createClient();
  const dbData = mapProductToDb(data);
  
  // Exclude values that shouldn't be overridden directly on update
  delete (dbData as any).average_rating;
  delete (dbData as any).num_reviews;

  const { data: updated, error } = await supabase
    .from('products')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase updateProduct error:', error);
    throw error;
  }
  return mapProductFromDb(updated);
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { data: deleted, error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Supabase deleteProduct error:', error);
    throw error;
  }
  return mapProductFromDb(deleted);
}

// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------

export async function getUserByEmail(email: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function getUserById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function createUser(data: any) {
  const supabase = await createClient();
  const { data: inserted, error } = await supabase
    .from('profiles')
    .insert([{
      id: data.id,
      email: data.email,
      full_name: data.name,
      is_admin: data.email === 'byamuraa@gmail.com',
      addresses: [],
    }])
    .select()
    .single();

  if (error) throw error;
  return inserted;
}

export async function updateUserAddresses(userId: string, addresses: any[]) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({ addresses })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// -------------------------------------------------------------
// ORDER OPERATIONS
// -------------------------------------------------------------

export async function getOrders(userId?: string) {
  const supabase = await createClient();
  let query = supabase.from('orders').select('*');
  
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    console.error('Supabase getOrders error:', error);
    return [];
  }
  return (data || []).map(mapOrderFromDb);
}

export async function getOrderById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Supabase getOrderById error:', error);
    return null;
  }
  return mapOrderFromDb(data);
}

export async function createOrder(data: {
  user?: string | null;
  email: string;
  items: Array<{
    product: string;
    name: string;
    fabric: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentIntentId?: string;
}) {
  const supabase = await createAdminClient();

  // 1. Check stock levels for all products
  for (const item of data.items) {
    const { data: prod, error } = await supabase
      .from('products')
      .select('stock, name')
      .eq('id', item.product)
      .single();

    if (error || !prod) {
      throw new Error(`Product ${item.name} not found`);
    }
    if (prod.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.name}`);
    }
  }

  // 2. Decrement stock levels
  for (const item of data.items) {
    const { data: prod } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.product)
      .single();

    const newStock = (prod?.stock || 0) - item.quantity;
    const { error: updateErr } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', item.product);

    if (updateErr) {
      throw new Error(`Failed to update stock for product ID: ${item.product}`);
    }
  }

  // 3. Create the order
  const { data: inserted, error: orderErr } = await supabase
    .from('orders')
    .insert([{
      user_id: data.user || null,
      email: data.email,
      items: data.items, // JSONB structure
      total_amount: data.totalAmount,
      shipping_address: data.shippingAddress, // JSONB structure
      payment_status: data.paymentStatus || 'Pending',
      payment_method: data.paymentMethod || 'Stripe',
      payment_intent_id: data.paymentIntentId || '',
      order_status: 'Processing',
    }])
    .select()
    .single();

  if (orderErr) {
    console.error('Supabase createOrder error:', orderErr);
    throw orderErr;
  }

  return mapOrderFromDb(inserted);
}

export async function updateOrderStatus(id: string, updates: {
  orderStatus?: 'Processing' | 'Shipped' | 'Delivered';
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
  trackingNumber?: string;
  carrier?: string;
  paymentIntentId?: string;
}) {
  const supabase = await createAdminClient();
  const dbUpdates: any = {};
  if (updates.orderStatus) dbUpdates.order_status = updates.orderStatus;
  if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
  if (updates.trackingNumber !== undefined) dbUpdates.tracking_number = updates.trackingNumber;
  if (updates.carrier !== undefined) dbUpdates.carrier = updates.carrier;
  if (updates.paymentIntentId !== undefined) dbUpdates.payment_intent_id = updates.paymentIntentId;

  const { data, error } = await supabase
    .from('orders')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Supabase updateOrderStatus error:', error);
    throw error;
  }
  return mapOrderFromDb(data);
}

// -------------------------------------------------------------
// REVIEW OPERATIONS
// -------------------------------------------------------------

export async function getReviews(productId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase getReviews error:', error);
    return [];
  }
  return (data || []).map(mapReviewFromDb);
}

export async function createReview(data: {
  user?: string | null;
  reviewerName: string;
  product: string;
  rating: number;
  comment: string;
}) {
  const supabase = await createAdminClient();
  
  // Insert the review
  const { data: inserted, error: reviewErr } = await supabase
    .from('reviews')
    .insert([{
      product_id: data.product,
      user_id: data.user || null,
      reviewer_name: data.reviewerName,
      rating: data.rating,
      comment: data.comment,
    }])
    .select()
    .single();

  if (reviewErr) {
    console.error('Supabase createReview error:', reviewErr);
    throw reviewErr;
  }

  // Recalculate average rating and review count
  const { data: reviews, error: fetchErr } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', data.product);

  if (!fetchErr && reviews && reviews.length > 0) {
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = Number((totalRating / reviews.length).toFixed(1));
    const count = reviews.length;

    await supabase
      .from('products')
      .update({ average_rating: avg, num_reviews: count })
      .eq('id', data.product);
  }

  return mapReviewFromDb(inserted);
}

// -------------------------------------------------------------
// NEWSLETTER OPERATIONS
// -------------------------------------------------------------

export async function addSubscriber(email: string) {
  const supabase = await createClient();
  
  // Check if exists
  const { data: existing } = await supabase
    .from('subscribers')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (existing) return existing;

  const { data: inserted, error } = await supabase
    .from('subscribers')
    .insert([{ email: email.toLowerCase() }])
    .select()
    .single();

  if (error) {
    console.error('Supabase addSubscriber error:', error);
    throw error;
  }
  return inserted;
}

export async function getSubscribers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase getSubscribers error:', error);
    return [];
  }
  return data || [];
}

export async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const supabase = await createClient();
  let slug = baseSlug;
  let counter = 1;
  let exists = true;

  while (exists) {
    let query = supabase
      .from('products')
      .select('id')
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.maybeSingle();

    if (!data || error) {
      exists = false;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return slug;
}
