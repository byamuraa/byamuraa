'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Star } from 'lucide-react';

export interface Product {
  _id: string;
  name: string;
  category: string;
  fabric: string;
  price: number;
  stock: number;
  images: string[];
  description: string;
  dimensions?: string;
  careInstructions?: string;
  averageRating: number;
  numReviews: number;
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const isSoldOut = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handlePreOrder = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page when clicking button
    if (isSoldOut) return;
    
    addToCart({
      product: product._id,
      name: product.name,
      fabric: product.fabric,
      image: product.images[0],
      price: product.price,
      stock: product.stock,
    }, 1);

    showToast(`Added ${product.name} (${product.fabric}) to your bag!`, 'success');
  };

  return (
    <Link 
      href={`/shop/${product._id}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-brand-pink/40 shadow-xs hover:shadow-md hover:border-brand-terracotta/40 transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Product Image Panel */}
      <div className="relative aspect-square w-full overflow-hidden bg-brand-cream relative">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={product.isFeatured}
        />
        
        {/* Status badges */}
        {isSoldOut ? (
          <div className="absolute top-3 right-3 bg-brand-dark text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
            Sold Out
          </div>
        ) : isLowStock ? (
          <div className="absolute top-3 right-3 bg-brand-terracotta text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-xs animate-pulse">
            Only {product.stock} left!
          </div>
        ) : null}

        {/* Fabric description overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-dark/50 to-transparent p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-[10px] uppercase font-bold tracking-wider text-brand-pink">Print Fabric</p>
          <p className="text-xs text-white font-medium">{product.fabric}</p>
        </div>
      </div>

      {/* Product Information details */}
      <div className="flex flex-1 flex-col p-5 bg-white">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-terracotta">
          {product.category}
        </span>
        
        <h3 className="mt-1 font-serif text-lg font-bold text-brand-dark line-clamp-1 group-hover:text-brand-terracotta transition-colors duration-200">
          {product.name}
        </h3>
        
        <p className="text-xs text-brand-dark/85 mt-0.5 font-medium">
          Fabric: {product.fabric}
        </p>

        {/* Rating stars */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.round(product.averageRating || 0)
                    ? 'fill-current'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          {product.numReviews > 0 ? (
            <span className="text-[10px] text-brand-dark/75 font-semibold">({product.numReviews})</span>
          ) : (
            <span className="text-[10px] text-brand-dark/60 italic font-medium">No reviews yet</span>
          )}
        </div>

        {/* Price & Action button row */}
        <div className="mt-4 pt-4 border-t border-brand-pink/20 flex items-center justify-between gap-4">
          <span className="font-serif text-lg font-bold text-brand-terracotta">
            ${product.price}
          </span>

          <button
            onClick={handlePreOrder}
            disabled={isSoldOut}
            className={`btn btn-sm ${isSoldOut ? '' : 'btn-outline'}`}
          >
            {isSoldOut ? 'Sold Out' : 'Pre-Order'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
