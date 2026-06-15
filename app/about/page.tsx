import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Heart, RefreshCw } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story | Amuraa — Handmade Quilted Accessories',
  description: 'Learn about Amuraa\'s slow-craft ethos, artisan quilting process, and zero-waste prepaid drop model. Every bag is hand-stitched from organic cotton.',
  openGraph: {
    title: 'Our Story | Amuraa',
    description: 'Handmade, slow-crafted quilted accessories built with soul.',
  },
};


export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col gap-16 md:gap-24">
      
      {/* Hero Brand Header */}
      <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
        <div className="relative h-14 w-14 overflow-hidden rounded-full border border-brand-terracotta/20 shadow-xs mb-3">
          <Image
            src="/logo.jpg"
            alt="Amuraa Logo"
            fill
            className="object-cover"
          />
        </div>
        <span className="font-script text-3xl text-brand-terracotta">Our Story</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-brand-dark mt-2 leading-tight">
          Handmade, Slow-Crafted, Built with Soul
        </h1>
        <div className="h-0.5 w-16 bg-brand-terracotta/40 mt-4" />
        <p className="mt-4 text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
          Amuraa is an independent studio dedicated to slowest fashion. We construct quilted accessories that make you smile, sourced from organic custom-printed cotton and padded for premium softness.
        </p>
      </div>

      {/* Row 1: The Artisan Studio */}
      <section className="flex flex-col md:flex-row items-center gap-12 lg:gap-16">
        <div className="flex-1 w-full aspect-square md:aspect-4/3 relative rounded-3xl overflow-hidden border border-brand-pink/50 shadow-md">
          <Image
            src="/images/products/tote_pink_leopard_1.jpg"
            alt="Studio Quilt fabric"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col gap-4 max-w-xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-terracotta">How We Stitch</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-dark leading-tight">
            Individually Padded & Quilted
          </h2>
          <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
            Unlike major retail puffer totes that use cheap polyester materials, Amuraa bags are built starting with 100% organic cotton layers. We sandwich local breathable batting between custom printed fabrics and double-stitch the quilt lines.
          </p>
          <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
            Every strap, inner pocket, and ruffle lining is hemmed, sewn, and quality-tested in our small workshop. This artisan labor ensures your bag retains its plush structure and carries your pride for years.
          </p>
        </div>
      </section>

      {/* Row 2: Sustainable Values */}
      <section className="bg-brand-pink/20 border-y border-brand-pink/30 py-16 relative overflow-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="quilt-bg absolute inset-0 pointer-events-none" />
        
        <div className="mx-auto max-w-7xl relative z-10 flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-16">
          <div className="flex-1 w-full aspect-square md:aspect-4/3 relative rounded-3xl overflow-hidden border border-brand-pink shadow-md">
            <Image
              src="/images/products/mini_heart_1.jpg"
              alt="Sustainable slow fashion bags"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 flex flex-col gap-4 max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-terracotta">Our Ethos</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-dark leading-tight">
              Prepaid Drop & Zero-Waste Model
            </h2>
            <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
              Standard commercial fashion manufactures thousands of bags upfront, leading to massive fabric landfill burnoffs. We do it differently.
            </p>
            <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed">
              We operate strictly on a **prepaid drop schedule**. By collecting orders upfront, we buy exactly the amount of gingham, floral, and polka dot cotton fabric required. Zero excess fabric, zero waste. By pre-ordering, you become an active partner in ethical craft consumption!
            </p>
          </div>
        </div>
      </section>

      {/* Grid: Studio details */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          {
            title: 'Crafted with Soul',
            desc: 'Each stitch carries the warmth of slow artisan labor. We believe you can feel the energy of hand-quilting when carrying our bags.',
            icon: Heart
          },
          {
            title: 'Limited Drop Exclusives',
            desc: 'Our fabrics are bought in small, finite yards. Once a particular check or leopard pattern is fully sewn, it will never return.',
            icon: Sparkles
          },
          {
            title: 'Circular & Organic',
            desc: 'We use natural cotton fibers, wood buttons, and recycled thread where possible to protect the environment and maintain cute quality.',
            icon: RefreshCw
          }
        ].map((item, idx) => (
          <div key={idx} className="bg-white border border-brand-pink/30 p-6 rounded-2xl flex flex-col items-center text-center shadow-xs">
            <div className="bg-brand-pink/60 text-brand-terracotta p-3 rounded-xl mb-4">
              <item.icon className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-brand-dark">{item.title}</h3>
            <p className="mt-2 text-xs text-brand-dark/70 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA section */}
      <section className="text-center bg-brand-pink/35 border border-brand-pink/60 rounded-3xl p-8 max-w-xl mx-auto">
        <h3 className="font-serif text-xl font-semibold text-brand-dark">Claim Your Piece Today</h3>
        <p className="text-xs text-brand-dark/60 mt-1 mb-6">Explore the current Drop list and support slow craft.</p>
        <Link href="/shop" className="btn btn-primary">
          Shop Current Drop
        </Link>
      </section>

    </div>
  );
}
