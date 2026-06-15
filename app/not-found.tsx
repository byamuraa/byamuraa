import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Home, ShoppingBag } from 'lucide-react';

export const metadata: Metadata = {
  title: '404 | Page Not Found — Amuraa',
  description: 'The page you are looking for does not exist. Browse our handmade quilted bags or return home.',
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative flex min-h-[60vh] items-center justify-center overflow-hidden py-16">

        {/* Decorative quilted dot overlay */}
        <div className="quilt-bg pointer-events-none absolute inset-0" />

        {/* Decorative stitched border card */}
        <div className="relative z-10 flex flex-col items-center text-center">

          <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-brand-pink shadow-sm mb-4">
            <Image
              src="/logo.jpg"
              alt="Amuraa Logo"
              fill
              className="object-cover"
            />
          </div>

          {/* Large 404 number */}
          <span className="font-serif text-[10rem] font-bold leading-none text-brand-terracotta/20 sm:text-[12rem]">
            404
          </span>

          {/* Script tagline */}
          <span className="mt-2 font-script text-2xl text-brand-terracotta sm:text-3xl">
            Oops, this stitch went astray!
          </span>

          {/* Divider */}
          <div className="mt-4 h-0.5 w-16 bg-brand-terracotta/40" />

          {/* Heading */}
          <h1 className="mt-5 font-serif text-3xl font-semibold text-brand-dark sm:text-4xl">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-brand-dark/60 sm:text-sm">
            It seems this thread doesn&apos;t lead anywhere. The page you&apos;re looking for may have
            been moved, unstitched, or never existed in our fabric collection.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/shop"
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Back to Shop
            </Link>
            <Link
              href="/"
              className="btn btn-outline inline-flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </div>

          {/* Decorative floating thread dots */}
          <div className="pointer-events-none absolute -left-16 top-8 h-24 w-24 rounded-full bg-brand-pink/50 blur-2xl" />
          <div className="pointer-events-none absolute -right-12 bottom-16 h-32 w-32 rounded-full bg-brand-blue/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-4 left-1/4 h-16 w-16 rounded-full bg-brand-terracotta/10 blur-xl" />

        </div>
      </div>
    </div>
  );
}
