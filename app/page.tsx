'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard, { Product } from '@/components/ProductCard';
import { ArrowRight, Sparkles, Heart, RefreshCw, Scissors, Truck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const testimonials = [
  {
    quote: "I carry my Lavender Check tote everywhere. It is like holding a soft, puffy cloud under my arm. Truly slow fashion at its finest!",
    author: "Elena R.",
    product: "Mauve Check Puffer Tote"
  },
  {
    quote: "The ruffle strap and gingham pattern are absolutely adorable. Excellent craftsmanship and the packaging felt like opening a warm gift.",
    author: "Maya Patel",
    product: "Striped Ruffle Shoulder Bag"
  },
  {
    quote: "Prepaid drops are the only way I buy bags now. You can feel the care and soul that goes into hand-stitching these pieces.",
    author: "Claire W.",
    product: "Indigo Organizer Pouch"
  }
];

const instagramPosts = [
  { id: 1, image: '/images/products/tote_pink_leopard_1.jpg', tag: '@amuraa.shop' },
  { id: 2, image: '/images/products/mini_heart_1.jpg', tag: '#quiltedbag' },
  { id: 3, image: '/images/products/tote_mauve_check_1.jpg', tag: '#cutecrafts' },
  { id: 4, image: '/images/products/shoulder_striped_1.jpg', tag: '@amuraa.shop' },
  { id: 5, image: '/images/products/tote_pink_polka_1.jpg', tag: '#slowmade' },
  { id: 6, image: '/images/products/organizer_indigo_1.jpg', tag: '#blockprint' }
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const featuredProducts = products.filter(p => p.isFeatured);
  
  // Auto-scroll hero slide
  useEffect(() => {
    if (featuredProducts.length === 0) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-16">
      
      {/* 1. HERO CAROUSEL SECTION */}
      <section className="relative bg-brand-pink/40 border-b border-brand-pink/50 overflow-hidden min-h-[600px] py-12 lg:py-20 flex items-center">
        <div className="quilt-bg absolute inset-0 pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 flex flex-col-reverse lg:flex-row items-center justify-between gap-12 z-10">
          
          {/* Hero text branding */}
          <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-terracotta/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-brand-terracotta">
              <Sparkles className="w-3.5 h-3.5" /> Handmade Drop Is Live
            </span>
            
            <h1 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-brand-dark leading-[1.1]">
              Crafted with Soul, <br />
              <span className="font-script text-brand-terracotta text-6xl sm:text-7xl lg:text-8xl normal-case font-normal -rotate-2 inline-block mt-2">
                Worn with Pride
              </span>
            </h1>
            
            <p className="mt-6 text-sm sm:text-base text-brand-dark/85 font-medium max-w-md leading-relaxed">
              Limited-run, cloud-soft quilted puffer bags and mini organizer pouches hand-stitched with love from playful patterns. Secure your pre-order today.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                href="/shop"
                className="btn btn-lg btn-primary"
              >
                Pre-Order the Drop
              </Link>
              <Link
                href="/how-it-works"
                className="btn btn-lg btn-outline bg-white/50 backdrop-blur-xs hover:bg-white"
              >
                How Drop Ordering Works
              </Link>
            </div>
          </div>

          {/* Featured items display */}
          <div className="flex-1 w-full max-w-md lg:max-w-xl aspect-square relative flex items-center justify-center">
            {loading ? (
              <div className="w-full aspect-square bg-white/50 rounded-3xl animate-pulse flex items-center justify-center text-xs font-medium text-brand-dark/40">
                Loading featured craft...
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="w-full aspect-square bg-white rounded-3xl overflow-hidden border border-brand-pink relative flex items-center justify-center shadow-lg">
                <Image
                  src="/images/products/tote_pink_leopard_1.jpg"
                  alt="Amuraa Bag"
                  fill
                  priority
                  className="object-cover opacity-80"
                />
              </div>
            ) : (
              featuredProducts.map((prod, idx) => (
                <div
                  key={prod._id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out transform flex flex-col items-center ${
                    idx === currentHeroSlide
                      ? 'opacity-100 scale-100 pointer-events-auto rotate-0'
                      : 'opacity-0 scale-95 pointer-events-none rotate-2'
                  }`}
                >
                  <Link href={`/shop/${prod._id}`} className="w-full aspect-square bg-white rounded-3xl overflow-hidden border border-brand-pink/50 shadow-xl relative group">
                    <Image
                      src={prod.images[0]}
                      alt={prod.name}
                      fill
                      priority
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Floating Info card */}
                    <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-brand-pink/30 flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-brand-terracotta">{prod.fabric}</span>
                        <h3 className="font-serif text-sm font-semibold text-brand-dark line-clamp-1">{prod.name}</h3>
                      </div>
                      <div className="bg-brand-pink text-brand-terracotta font-serif font-bold text-sm px-3.5 py-1.5 rounded-full border border-brand-terracotta/20">
                        ${prod.price}
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* 2. HOW PREPAID ORDERING WORKS INFOGRAPHIC */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-xl mx-auto flex flex-col items-center">
          <span className="font-script text-2xl text-brand-terracotta">Handmade & Slow Fashion</span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-dark leading-tight">How Drop Pre-Ordering Works</h2>
          <div className="h-0.5 w-16 bg-brand-terracotta/40 mt-4" />
          <p className="mt-4 text-xs sm:text-sm text-brand-dark/85 font-medium leading-relaxed">
            Because each accessory is individually hand-quilted, we release items in limited pre-order batches to prevent fabric waste and maintain premium quality.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              title: 'Secure Drop',
              desc: 'Select your favorite print and complete prepaid checkout. Orders are full payment upfront to secure custom fabrics.',
              icon: Heart,
            },
            {
              step: '02',
              title: 'Fabric Allocation',
              desc: 'We purchase organic gingham, leopard, and floral cotton based exactly on secured pre-orders to prevent excess waste.',
              icon: Scissors,
            },
            {
              step: '03',
              title: 'Hand-Stitching',
              desc: 'Our local artisans cut, stuff, and quilt each tote, crossbody bag, and makeup pouch. Every stitch holds soul.',
              icon: RefreshCw,
            },
            {
              step: '04',
              title: 'Delivered to You',
              desc: 'Once completed and passed through strict quality checks, your custom accessory is lovingly packaged and shipped directly.',
              icon: Truck,
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-brand-pink/30 rounded-2xl p-6 relative flex flex-col items-start shadow-xs hover:border-brand-terracotta/30 transition-all duration-300">
              <span className="absolute top-4 right-6 font-serif text-4xl font-extrabold text-brand-pink">{item.step}</span>
              <div className="bg-brand-pink/60 text-brand-terracotta p-3 rounded-xl mb-4">
                <item.icon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-dark">{item.title}</h3>
              <p className="mt-2 text-xs text-brand-dark/85 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CURRENT DROP PRODUCT GRID */}
      <section id="drop" className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 border-b border-brand-pink/40 pb-6">
          <div>
            <span className="font-script text-2xl text-brand-terracotta">Current Drop</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-dark mt-2">Available Quilted Accessories</h2>
          </div>
          <Link
            href="/shop"
            className="btn btn-sm btn-outline"
          >
            Shop All Items <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-white rounded-2xl border border-brand-pink/40 p-5 animate-pulse flex flex-col justify-end gap-3 h-[320px]">
                <div className="h-4 w-1/3 bg-slate-200 rounded" />
                <div className="h-6 w-3/4 bg-slate-200 rounded" />
                <div className="h-4 w-1/2 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-serif text-lg text-brand-dark/60">No items available in this drop.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 4. BRAND STORY SECTION */}
      <section className="bg-brand-pink/20 border-y border-brand-pink/30 py-20 sm:py-28 relative overflow-hidden">
        <div className="quilt-bg absolute inset-0 pointer-events-none" />
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12 sm:gap-16">
          <div className="flex-1 aspect-4/3 relative rounded-3xl overflow-hidden border border-brand-pink shadow-lg w-full max-w-lg">
            <Image
              src="/images/products/mini_heart_1.jpg"
              alt="Crafting a bag"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 flex flex-col items-start max-w-xl">
            <span className="font-script text-2xl text-brand-terracotta">Amuraa Story</span>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-dark">Handcrafted In Small Batches</h2>
            <div className="h-0.5 w-16 bg-brand-terracotta/40 mt-4 mb-6" />
            <p className="text-sm text-brand-dark/85 font-medium leading-relaxed mb-4">
              Amuraa was founded on a simple belief: accessories should tell a story. In a world of mass production, we slow down. Every puffer tote, makeup pouch, and AirPod bag is individually designed and stitched.
            </p>
            <p className="text-sm text-brand-dark/85 font-medium leading-relaxed mb-6">
              We select playful fabrics like gingham check, sweet hearts, and retro polka dots on organic cotton. Our process is transparent, zero-waste, and directly supports the local craft community.
            </p>
            <Link
              href="/about"
              className="btn btn-secondary"
            >
              Read Full Story
            </Link>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-8 text-center">
        <span className="font-script text-2xl text-brand-terracotta">Testimonials</span>
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-dark">Loved by Our Community</h2>
        <div className="h-0.5 w-16 bg-brand-terracotta/40 mx-auto mt-4 mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white border border-brand-pink/30 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
              <p className="text-xs sm:text-sm text-brand-dark/90 font-medium italic leading-relaxed">
                "{t.quote}"
              </p>
              <div className="mt-6 pt-4 border-t border-brand-pink/20 flex justify-between items-center text-xs">
                <span className="font-bold text-brand-dark">{t.author}</span>
                <span className="text-brand-terracotta font-semibold bg-brand-pink/50 px-2 py-0.5 rounded-full text-[10px]">
                  {t.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. INSTAGRAM-STYLE GALLERY GRID */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <span className="font-script text-2xl text-brand-terracotta">Gallery</span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-dark">Worn With Pride</h2>
          <p className="mt-2 text-xs text-brand-dark/75 font-semibold">Tag us on Instagram to be featured! @amuraa.shop</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post) => (
            <div key={post.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-brand-pink/30 bg-white shadow-xs">
              <Image
                src={post.image}
                alt="Styled accessory"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <span className="text-white text-xs font-semibold tracking-wider">{post.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
