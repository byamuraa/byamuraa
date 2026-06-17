import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { dbConnect } from './db';
import User from './models/User';
import Product from './models/Product';
import Order from './models/Order';
import Review from './models/Review';
import Subscriber from './models/Subscriber';
import bcrypt from 'bcryptjs';

// Configuration
const MOCK_DB_PATH = path.join(process.cwd(), 'lib', 'mockDb.json');

// Memory cache for mock database in production serverless environments
let mockDbCache: any = null;

function readMockDb() {
  if (mockDbCache) return mockDbCache;
  try {
    if (fs.existsSync(MOCK_DB_PATH)) {
      const data = fs.readFileSync(MOCK_DB_PATH, 'utf-8');
      mockDbCache = JSON.parse(data);
      return mockDbCache;
    }
  } catch (error) {
    console.error('Error reading mock DB:', error);
  }
  // Default structure if file read fails
  return { products: [], users: [], orders: [], reviews: [], subscribers: [] };
}

function writeMockDb(data: any) {
  try {
    mockDbCache = data;
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing mock DB:', error);
  }
}

let mongoStatusCache: { active: boolean; lastChecked: number } | null = null;

// Check if MongoDB URI is valid and MongoDB server is up
export async function isMongoActive(): Promise<boolean> {
  if (!process.env.MONGODB_URI) return false;
  
  const now = Date.now();
  // Return cached status if checked within the last 30 seconds
  if (mongoStatusCache && (now - mongoStatusCache.lastChecked < 30000)) {
    return mongoStatusCache.active;
  }
  
  try {
    // Attempt database connection with a fast timeout race
    const connectionPromise = dbConnect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 1500)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    
    mongoStatusCache = { active: true, lastChecked: now };
    return true;
  } catch (e) {
    // Cache failure status to avoid repeatedly blocking requests
    mongoStatusCache = { active: false, lastChecked: now };
    return false;
  }
}

// -------------------------------------------------------------
// PRODUCT OPERATIONS
// -------------------------------------------------------------
// Helper to normalize product images for storefront compatibility
const normalizeProduct = (p: any) => {
  if (!p) return null;
  return {
    ...p,
    images: p.images ? p.images.map((img: any) => typeof img === 'string' ? img : img.url) : []
  };
};

export async function getProducts(filters: {
  category?: string;
  fabric?: string;
  isFeatured?: boolean;
  search?: string;
  sort?: string;
  status?: string;
} = {}) {
  const isMongo = await isMongoActive();

  if (isMongo) {
    try {
      const query: any = {};
      if (filters.category) query.category = filters.category;
      if (filters.fabric) query.fabric = filters.fabric;
      if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
      if (filters.search) {
        query.name = { $regex: filters.search, $options: 'i' };
      }
      
      // Filter out drafts by default for storefront calls
      if (filters.status && filters.status !== 'all') {
        query.status = filters.status;
      } else if (!filters.status) {
        query.status = 'active';
      }

      let queryBuilder = Product.find(query);
      if (filters.sort) {
        if (filters.sort === 'price_asc') queryBuilder = queryBuilder.sort({ price: 1 });
        else if (filters.sort === 'price_desc') queryBuilder = queryBuilder.sort({ price: -1 });
        else if (filters.sort === 'newest') queryBuilder = queryBuilder.sort({ createdAt: -1 });
        else if (filters.sort === 'popularity') queryBuilder = queryBuilder.sort({ averageRating: -1 });
      }

      const list = await queryBuilder.lean();
      return list.map(normalizeProduct);
    } catch (error) {
      console.error('Mongoose product fetch failed, falling back to mock:', error);
    }
  }

  // Fallback to JSON Mock DB
  const db = readMockDb();
  let list = [...db.products];

  if (filters.category) {
    list = list.filter((p: any) => p.category.toLowerCase() === filters.category!.toLowerCase());
  }
  if (filters.fabric) {
    list = list.filter((p: any) => p.fabric.toLowerCase() === filters.fabric!.toLowerCase());
  }
  if (filters.isFeatured !== undefined) {
    list = list.filter((p: any) => p.isFeatured === filters.isFeatured);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    list = list.filter((p: any) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
  }
  
  // Status filter for Mock DB
  if (filters.status && filters.status !== 'all') {
    list = list.filter((p: any) => p.status === filters.status);
  } else if (!filters.status) {
    list = list.filter((p: any) => p.status === undefined || p.status === 'active');
  }

  if (filters.sort) {
    if (filters.sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (filters.sort === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (filters.sort === 'popularity') list.sort((a, b) => b.averageRating - a.averageRating);
  }

  return list.map(normalizeProduct);
}

export async function getProductById(id: string) {
  const isMongo = await isMongoActive();

  if (isMongo) {
    try {
      const prod = await Product.findById(id).lean();
      return normalizeProduct(prod);
    } catch (e) {
      // If invalid ObjectId is passed, fallback
    }
  }

  const db = readMockDb();
  const prod = db.products.find((p: any) => p._id === id) || null;
  return normalizeProduct(prod);
}

export async function createProduct(data: any) {
  const isMongo = await isMongoActive();

  if (isMongo) {
    try {
      const prod = new Product(data);
      return await prod.save();
    } catch (error) {
      console.error('Mongoose product create failed:', error);
    }
  }

  const db = readMockDb();
  const newProduct = {
    _id: 'prod_' + Math.random().toString(36).substr(2, 9),
    ...data,
    createdAt: new Date().toISOString(),
    averageRating: 0,
    numReviews: 0,
  };
  db.products.push(newProduct);
  writeMockDb(db);
  return newProduct;
}

export async function updateProduct(id: string, data: any) {
  const isMongo = await isMongoActive();

  if (isMongo) {
    try {
      return await Product.findByIdAndUpdate(id, data, { new: true }).lean();
    } catch (error) {
      console.error('Mongoose product update failed:', error);
    }
  }

  const db = readMockDb();
  const idx = db.products.findIndex((p: any) => p._id === id);
  if (idx !== -1) {
    db.products[idx] = { ...db.products[idx], ...data, updatedAt: new Date().toISOString() };
    writeMockDb(db);
    return db.products[idx];
  }
  return null;
}

export async function deleteProduct(id: string) {
  const isMongo = await isMongoActive();

  if (isMongo) {
    try {
      return await Product.findByIdAndDelete(id).lean();
    } catch (error) {
      console.error('Mongoose product delete failed:', error);
    }
  }

  const db = readMockDb();
  const idx = db.products.findIndex((p: any) => p._id === id);
  if (idx !== -1) {
    const deleted = db.products.splice(idx, 1)[0];
    writeMockDb(db);
    return deleted;
  }
  return null;
}

// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------
export async function getUserByEmail(email: string) {
  const isMongo = await isMongoActive();

  if (isMongo) {
    try {
      return await User.findOne({ email }).lean();
    } catch (error) {
      console.error('Mongoose user fetch failed:', error);
    }
  }

  const db = readMockDb();
  return db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getUserById(id: string) {
  const isMongo = await isMongoActive();

  if (isMongo) {
    try {
      return await User.findById(id).lean();
    } catch (error) {
      console.error('Mongoose user fetch failed:', error);
    }
  }

  const db = readMockDb();
  return db.users.find((u: any) => u._id === id) || null;
}

export async function createUser(data: any) {
  const isMongo = await isMongoActive();

  if (isMongo) {
    try {
      const userObj = new User(data);
      return await userObj.save();
    } catch (error) {
      console.error('Mongoose user creation failed:', error);
    }
  }

  const db = readMockDb();
  const newUser = {
    _id: 'user_' + Math.random().toString(36).substr(2, 9),
    role: 'user',
    addresses: [],
    ...data,
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  writeMockDb(db);
  return newUser;
}

export async function updateUserAddresses(userId: string, addresses: any[]) {
  const isMongo = await isMongoActive();

  if (isMongo) {
    try {
      return await User.findByIdAndUpdate(userId, { addresses }, { new: true }).lean();
    } catch (error) {
      console.error('Mongoose address update failed:', error);
    }
  }

  const db = readMockDb();
  const idx = db.users.findIndex((u: any) => u._id === userId);
  if (idx !== -1) {
    const formattedAddresses = addresses.map((addr: any, index: number) => ({
      _id: addr._id || 'addr_' + Math.random().toString(36).substr(2, 9),
      ...addr,
    }));
    db.users[idx].addresses = formattedAddresses;
    writeMockDb(db);
    return db.users[idx];
  }
  return null;
}

// -------------------------------------------------------------
// ORDER OPERATIONS
// -------------------------------------------------------------
export async function getOrders(userId?: string) {
  const isMongo = await isMongoActive();

  if (isMongo) {
    try {
      const query = userId ? { user: userId } : {};
      return await Order.find(query).sort({ createdAt: -1 }).lean();
    } catch (error) {
      console.error('Mongoose order fetch failed:', error);
    }
  }

  const db = readMockDb();
  let list = [...db.orders];
  if (userId) {
    list = list.filter((o: any) => o.user === userId);
  }
  // Sort descending
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}

export async function getOrderById(id: string) {
  const isMongo = await isMongoActive();

  if (isMongo) {
    try {
      return await Order.findById(id).lean();
    } catch (error) {
      console.error('Mongoose order by ID failed:', error);
    }
  }

  const db = readMockDb();
  return db.orders.find((o: any) => o._id === id) || null;
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
  const isMongo = await isMongoActive();

  // 1. Check stock levels and decrement
  if (isMongo) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      
      // Check stock for all items
      for (const item of data.items) {
        const prod = await Product.findById(item.product).session(session);
        if (!prod || prod.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name} (${item.fabric})`);
        }
      }

      // Decrement stock
      for (const item of data.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }

      // Save order
      const newOrder = new Order({
        ...data,
        paymentStatus: data.paymentStatus || 'Pending',
        orderStatus: 'Processing',
      });
      await newOrder.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      return newOrder;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Mongoose checkout transaction aborted:', error);
      throw error;
    }
  }

  // In-memory fallback
  const db = readMockDb();
  
  // Verify stock
  for (const item of data.items) {
    const prod = db.products.find((p: any) => p._id === item.product);
    if (!prod || prod.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.name} (${item.fabric})`);
    }
  }

  // Decrement stock
  for (const item of data.items) {
    const idx = db.products.findIndex((p: any) => p._id === item.product);
    if (idx !== -1) {
      db.products[idx].stock -= item.quantity;
    }
  }

  // Create order
  const newOrder = {
    _id: 'ord_' + Math.random().toString(36).substr(2, 9),
    ...data,
    paymentStatus: data.paymentStatus || 'Pending',
    orderStatus: 'Processing',
    trackingNumber: '',
    carrier: '',
    createdAt: new Date().toISOString(),
  };

  db.orders.push(newOrder);
  writeMockDb(db);
  return newOrder;
}

export async function updateOrderStatus(id: string, updates: {
  orderStatus?: 'Processing' | 'Shipped' | 'Delivered';
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
  trackingNumber?: string;
  carrier?: string;
  paymentIntentId?: string;
}) {
  const isMongo = await isMongoActive();

  if (isMongo) {
    try {
      return await Order.findByIdAndUpdate(id, updates, { new: true }).lean();
    } catch (error) {
      console.error('Mongoose order status update failed:', error);
    }
  }

  const db = readMockDb();
  const idx = db.orders.findIndex((o: any) => o._id === id);
  if (idx !== -1) {
    db.orders[idx] = { ...db.orders[idx], ...updates, updatedAt: new Date().toISOString() };
    writeMockDb(db);
    return db.orders[idx];
  }
  return null;
}

// -------------------------------------------------------------
// REVIEW OPERATIONS
// -------------------------------------------------------------
export async function getReviews(productId: string) {
  const isMongo = await isMongoActive();

  if (isMongo) {
    try {
      return await Review.find({ product: productId }).sort({ createdAt: -1 }).lean();
    } catch (error) {
      console.error('Mongoose reviews fetch failed:', error);
    }
  }

  const db = readMockDb();
  return db.reviews.filter((r: any) => r.product === productId)
                   .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createReview(data: {
  user?: string | null;
  reviewerName: string;
  product: string;
  rating: number;
  comment: string;
}) {
  const isMongo = await isMongoActive();

  if (isMongo) {
    try {
      const reviewObj = new Review(data);
      const savedReview = await reviewObj.save();

      // Recalculate averageRating for product
      const reviews = await Review.find({ product: data.product });
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(data.product, {
        averageRating: parseFloat(avg.toFixed(1)),
        numReviews: reviews.length
      });

      return savedReview;
    } catch (error) {
      console.error('Mongoose review save failed:', error);
    }
  }

  const db = readMockDb();
  const newReview = {
    _id: 'rev_' + Math.random().toString(36).substr(2, 9),
    ...data,
    createdAt: new Date().toISOString(),
  };

  db.reviews.push(newReview);

  // Recalculate product rating
  const prodIdx = db.products.findIndex((p: any) => p._id === data.product);
  if (prodIdx !== -1) {
    const productReviews = db.reviews.filter((r: any) => r.product === data.product);
    const avg = productReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / productReviews.length;
    db.products[prodIdx].averageRating = parseFloat(avg.toFixed(1));
    db.products[prodIdx].numReviews = productReviews.length;
  }

  writeMockDb(db);
  return newReview;
}

// -------------------------------------------------------------
// NEWSLETTER OPERATIONS
// -------------------------------------------------------------
export async function addSubscriber(email: string) {
  const isMongo = await isMongoActive();

  if (isMongo) {
    try {
      const existing = await Subscriber.findOne({ email });
      if (existing) return existing;
      const sub = new Subscriber({ email });
      return await sub.save();
    } catch (error) {
      console.error('Mongoose subscriber save failed:', error);
    }
  }

  const db = readMockDb();
  const exists = db.subscribers.find((s: any) => s.email.toLowerCase() === email.toLowerCase());
  if (exists) return exists;

  const newSub = {
    _id: 'sub_' + Math.random().toString(36).substr(2, 9),
    email,
    createdAt: new Date().toISOString()
  };
  db.subscribers.push(newSub);
  writeMockDb(db);
  return newSub;
}

export async function getSubscribers() {
  const isMongo = await isMongoActive();
  if (isMongo) {
    try {
      return await Subscriber.find().lean();
    } catch (e) {
      console.error(e);
    }
  }
  const db = readMockDb();
  return db.subscribers;
}
