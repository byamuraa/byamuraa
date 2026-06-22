'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard, { Product } from '@/components/ProductCard';
import { Star, ChevronLeft, Minus, Plus, Heart, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';

interface Review {
  _id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail Page states
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'dimensions' | 'care'>('description');

  // Review form states
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      setLoading(true);
      try {
        // 1. Fetch Product
        const prodRes = await fetch(`/api/products/${id}`);
        const prodData = await prodRes.json();
        if (prodData.product) {
          const p = prodData.product as Product;
          setProduct(p);
          setSelectedImage(p.images[0]);

          // 2. Fetch Related Products
          const allRes = await fetch(`/api/products?category=${encodeURIComponent(p.category)}`);
          const allData = await allRes.json();
          if (allData.products) {
            const related = (allData.products as Product[]).filter(item => item._id !== p._id).slice(0, 4);
            setRelatedProducts(related);
          }
        }

        // 3. Fetch Reviews
        const revRes = await fetch(`/api/reviews?productId=${id}`);
        const revData = await revRes.json();
        if (revData.reviews) {
          setReviews(revData.reviews);
        }
      } catch (err) {
        console.error('Failed to load detail page data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center animate-pulse">
        <p className="font-serif text-lg text-brand-dark/75">Fetching quilted craftsmanship details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center">
        <h2 className="font-serif text-2xl font-bold text-brand-dark">Craft product not found</h2>
        <p className="text-xs text-brand-dark/75 mt-1 mb-6">The item you are looking for might have been archived from this drop.</p>
        <button
          onClick={() => router.push('/shop')}
          className="btn btn-primary"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const isSoldOut = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart({
      product: product._id,
      name: product.name,
      fabric: product.fabric,
      image: product.images[0],
      price: product.price,
      stock: product.stock,
    }, quantity);
    showToast(`Added ${quantity} x ${product.name} to bag!`, 'success');
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    addToCart({
      product: product._id,
      name: product.name,
      fabric: product.fabric,
      image: product.images[0],
      price: product.price,
      stock: product.stock,
    }, quantity);
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast('Please type a comment for your review.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          rating: reviewRating,
          comment: reviewComment,
          reviewerName: user ? user.name : reviewName
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Review submitted successfully!', 'success');
        setReviews(prev => [data.review, ...prev]);
        setReviewComment('');
        setReviewName('');
        // Recalculate average rating locally to reflect update
        const updatedReviews = [data.review, ...reviews];
        const avg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
        setProduct(prev => prev ? { ...prev, averageRating: parseFloat(avg.toFixed(1)), numReviews: updatedReviews.length } : null);
      } else {
        showToast(data.error || 'Failed to submit review.', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Back to Shop Link */}
      <button
        onClick={() => router.push('/shop')}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-dark/85 hover:text-brand-terracotta mb-8 focus:outline-none"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Drops
      </button>

      {/* Main product details block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: Product Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-square w-full bg-white rounded-3xl overflow-hidden border border-brand-pink/40 shadow-xs">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {isSoldOut ? (
              <div className="absolute top-4 right-4 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                Sold Out
              </div>
            ) : isLowStock ? (
              <div className="absolute top-4 right-4 bg-brand-terracotta text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full animate-pulse">
                Only {product.stock} left!
              </div>
            ) : null}
          </div>

          {/* Gallery Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 aspect-square rounded-xl overflow-hidden bg-white border-2 flex-shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-brand-terracotta shadow-xs'
                      : 'border-brand-pink/40 hover:border-brand-terracotta/40'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} View ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div>
            <span className="font-script text-2xl text-brand-terracotta">{product.category}</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-brand-dark mt-1">
              {product.name}
            </h1>
            <p className="text-sm font-semibold text-brand-dark/90 mt-1 italic">
              Fabric Print: {product.fabric}
            </p>

            {/* Ratings aggregate */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.averageRating || 0)
                        ? 'fill-current'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-brand-dark/85">
                {product.averageRating > 0 ? `${product.averageRating} (${reviews.length} reviews)` : 'No reviews'}
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-brand-pink/30 border border-brand-pink/50 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-terracotta">
                {quantity > 1 ? 'Total Prepaid Price' : 'Prepaid Order Price'}
              </span>
              <p className="font-serif text-3xl font-bold text-brand-terracotta mt-0.5">
                ${product.price * quantity}
                {quantity > 1 && (
                  <span className="text-xs text-brand-dark/50 ml-2 font-sans font-normal">
                    (${product.price} each)
                  </span>
                )}
              </p>
            </div>
            <span className="text-[10px] bg-brand-terracotta/10 text-brand-terracotta border border-brand-terracotta/20 rounded-full px-3 py-1 font-bold uppercase tracking-wider">
              Free Shipping
            </span>
          </div>

          {/* Quantity Selector and Purchase CTA buttons */}
          {!isSoldOut ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-brand-dark/85 uppercase tracking-widest">Qty:</span>
                <div className="flex items-center border border-brand-pink/80 bg-white rounded-full">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="p-2 text-brand-dark/85 hover:text-brand-terracotta px-3"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-sm min-w-[24px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className="p-2 text-brand-dark/85 hover:text-brand-terracotta px-3"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[10px] text-brand-dark/75 font-semibold italic">({product.stock} available)</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  onClick={handleAddToCart}
                  className="btn btn-outline btn-lg flex-1"
                >
                  Add to Bag
                </button>
                <button
                  onClick={handleBuyNow}
                  className="btn btn-primary btn-lg flex-1"
                >
                  Buy It Now
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl p-4 text-center font-serif text-sm">
              We've closed orders for this print as our artisan capacity is currently full. Subscribe below or stay tuned for our next fabric drop!
            </div>
          )}

          {/* Small Guarantee badges */}
          <div className="border-t border-brand-pink/30 pt-6 grid grid-cols-3 gap-4 text-center text-[10px] text-brand-dark/85 font-semibold">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-5 h-5 text-brand-terracotta stroke-[1.5]" />
              <span>100% Hand-Quilted</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Sparkles className="w-5 h-5 text-brand-terracotta stroke-[1.5]" />
              <span>Exclusive Prints</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RefreshCw className="w-5 h-5 text-brand-terracotta stroke-[1.5]" />
              <span>Zero-Waste Model</span>
            </div>
          </div>

          {/* Details Tabs Section */}
          <div className="border border-brand-pink/30 rounded-2xl overflow-hidden bg-white mt-4">
            <div className="flex border-b border-brand-pink/20 bg-brand-pink/10">
              {(['description', 'dimensions', 'care'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors focus:outline-none ${
                    activeTab === tab 
                      ? 'bg-white text-brand-terracotta border-b-2 border-brand-terracotta font-extrabold' 
                      : 'text-brand-dark/70 hover:text-brand-dark'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-6 text-xs text-brand-dark/90 leading-relaxed min-h-[100px]">
              {activeTab === 'description' && <p>{product.description}</p>}
              {activeTab === 'dimensions' && (
                <p>{product.dimensions || 'Dimensions not specified. Handcrafted items may vary slightly.'}</p>
              )}
              {activeTab === 'care' && (
                <p>{product.careInstructions || 'Hand wash cold. Lay flat to dry.'}</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* REVIEWS SECTION */}
      <section className="mt-16 border-t border-brand-pink/30 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* List of customer reviews */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h3 className="font-serif text-2xl font-semibold text-brand-dark mb-2">Customer Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-xs text-brand-dark/75 italic py-6">Be the first to review this quilted item!</p>
            ) : (
              <div className="flex flex-col gap-6 divide-y divide-brand-pink/20">
                {reviews.map((rev) => (
                  <div key={rev._id} className="pt-6 first:pt-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-brand-dark">{rev.reviewerName}</span>
                      <span className="text-[10px] text-brand-dark/65 font-semibold">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex text-amber-400 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-brand-dark/90 leading-relaxed mt-2 italic bg-brand-pink/10 p-3.5 rounded-xl border border-brand-pink/20">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a review form */}
          <div className="lg:col-span-5 bg-white border border-brand-pink/30 p-6 rounded-2xl shadow-xs">
            <h4 className="font-serif text-lg font-semibold text-brand-dark mb-4">Share Your Feedback</h4>
            
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              
              {/* Rating Selector */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-amber-400 hover:scale-110 focus:outline-none"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-current' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name (for guest users) */}
              {!user && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah M."
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full bg-brand-cream/60 border border-brand-pink/80 rounded-full px-4 py-2.5 text-xs text-brand-dark placeholder-brand-dark/65 focus:outline-none focus:border-brand-terracotta"
                  />
                </div>
              )}

              {/* Comment text area */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Review Comment</label>
                <textarea
                  required
                  rows={4}
                  placeholder="What do you think about the quilt, texture, print fabric, and size?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-brand-cream/60 border border-brand-pink/80 rounded-2xl px-4 py-3 text-xs text-brand-dark placeholder-brand-dark/65 focus:outline-none focus:border-brand-terracotta resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="btn btn-secondary w-full mt-2"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>

            </form>
          </div>

        </div>
      </section>

      {/* RELATED PRODUCTS SECTION */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-brand-pink/30 pt-16">
          <span className="font-script text-2xl text-brand-terracotta">Aesthetic Matches</span>
          <h3 className="font-serif text-2xl font-semibold text-brand-dark mt-1 mb-8">Related Quilted Accessories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
