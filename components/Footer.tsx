'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/context/ToastContext';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Subscribed! We will keep you updated on new drops.', 'success');
        setEmail('');
      } else {
        showToast(data.error || 'Subscription failed.', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-brand-dark text-[#FAF8F5]/90 border-t border-brand-pink/10">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Footer Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Tagline Widget */}
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-brand-pink/20 shadow-xs">
                <Image
                  src="/logo.jpg"
                  alt="Amuraa Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-white">Amuraa</h3>
            </div>
            <p className="font-script text-lg text-brand-pink italic leading-tight">
              "Crafted with Soul, Worn with Pride"
            </p>
            <p className="text-xs text-[#FAF8F5]/75 leading-relaxed mt-2">
              Quilted, premium, slow-made accessories. Every drop is crafted in limited numbers from playful custom prints.
            </p>
          </div>

          {/* Customer Support Links Widget */}
          <div className="col-span-1 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-pink mb-1">Explore</h4>
            <Link href="/shop" className="text-xs text-[#FAF8F5]/80 hover:text-white hover:underline transition-all">Shop Drops</Link>
            <Link href="/how-it-works" className="text-xs text-[#FAF8F5]/80 hover:text-white hover:underline transition-all">Pre-Order Details</Link>
            <Link href="/about" className="text-xs text-[#FAF8F5]/80 hover:text-white hover:underline transition-all">Our Craft</Link>
            <Link href="/contact" className="text-xs text-[#FAF8F5]/80 hover:text-white hover:underline transition-all">Contact Us</Link>
          </div>

          {/* Legal / Policy Links Widget */}
          <div className="col-span-1 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-pink mb-1">Care & Policy</h4>
            <Link href="/faq" className="text-xs text-[#FAF8F5]/80 hover:text-white hover:underline transition-all">FAQs</Link>
            <Link href="/policy" className="text-xs text-[#FAF8F5]/80 hover:text-white hover:underline transition-all">Returns & Refunds</Link>
            <Link href="/admin" className="text-xs text-[#FAF8F5]/80 hover:text-brand-pink transition-all font-semibold mt-2">Admin Portal</Link>
          </div>

          {/* Newsletter Subscription Widget */}
          <div className="col-span-1 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-pink mb-1">Stay in the Loop</h4>
            <p className="text-xs text-[#FAF8F5]/85 leading-relaxed">
              Drop schedules are private! Subscribe to get early access password updates before standard drops release.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-2">
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="w-full bg-[#FAF8F5]/15 border border-[#FAF8F5]/35 rounded-full px-4 py-2.5 text-xs text-white placeholder-[#FAF8F5]/60 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full"
              >
                {submitting ? 'Subscribing...' : 'Notify Me'}
              </button>
            </form>
          </div>

        </div>

        {/* Footer Lower Section (Badges, Copy) */}
        <div className="mt-12 border-t border-[#FAF8F5]/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-[#FAF8F5]/70">
            &copy; {new Date().getFullYear()} Amuraa. Handmade with love. All rights reserved.
          </p>
          
          {/* Payment Partner Icons */}
          <div className="flex gap-3 items-center opacity-70">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#FAF8F5]/60 mr-1">Prepaid Orders Only</span>
            {/* Mock Credit cards */}
            <div className="border border-[#FAF8F5]/40 rounded px-1.5 py-0.5 text-[8px] font-bold text-white tracking-widest">VISA</div>
            <div className="border border-[#FAF8F5]/40 rounded px-1.5 py-0.5 text-[8px] font-bold text-white tracking-widest">MC</div>
            <div className="border border-[#FAF8F5]/40 rounded px-1.5 py-0.5 text-[8px] font-bold text-white tracking-widest">STRIPE</div>
            <div className="border border-[#FAF8F5]/40 rounded px-1.5 py-0.5 text-[8px] font-bold text-white tracking-widest">UPI</div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
