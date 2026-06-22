'use client';

import React, { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { Mail, MapPin, Send, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Please fill in all form fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Message sent! Our studio team will write back soon.', 'success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        showToast(data.error || 'Failed to send message.', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="border-b border-brand-pink/40 pb-6 mb-10 text-center sm:text-left">
        <span className="font-script text-2xl text-brand-terracotta">Say Hello</span>
        <h1 className="font-serif text-4xl font-semibold text-brand-dark mt-1">Contact Our Studio</h1>
        <p className="text-xs text-brand-dark/50 mt-1">We respond to all handmade drops inquiries within 24 hours.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT CARD COLUMN: Form */}
        <div className="lg:col-span-7 bg-white border border-brand-pink/30 rounded-3xl p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 block mb-1">Your Name</label>
              <input
                type="text"
                required
                placeholder="Sarah Miller"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-brand-cream/30 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none focus:border-brand-terracotta"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 block mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-cream/30 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none focus:border-brand-terracotta"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 block mb-1">Message</label>
              <textarea
                required
                rows={5}
                placeholder="Tell us about order details, custom print availability, sizing questions..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-brand-cream/30 border border-brand-pink/60 rounded-2xl px-4 py-3 text-xs text-brand-dark focus:outline-none focus:border-brand-terracotta resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-terracotta py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-brand-terracotta/95 transition-all mt-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Sending Message...' : 'Submit Inquiry'}
            </button>

          </form>
        </div>

        {/* RIGHT CARD COLUMN: Coordinates */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
            <h3 className="font-serif text-lg font-semibold text-brand-dark border-b border-brand-pink/20 pb-3">
              Studio Details
            </h3>

            <div className="flex flex-col gap-4 text-xs text-brand-dark/70">
              <div className="flex gap-3 items-start">
                <Mail className="w-5 h-5 text-brand-terracotta flex-shrink-0" />
                <div>
                  <p className="font-bold text-brand-dark">Write to Us</p>
                  <p className="mt-0.5">byamuraa@gmail.com</p>
                  <p className="text-[10px] text-brand-dark/50">For bulk custom bridal party quilted pouches inquiry</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <MapPin className="w-5 h-5 text-brand-terracotta flex-shrink-0" />
                <div>
                  <p className="font-bold text-brand-dark">Our Workshop</p>
                  <p className="mt-0.5">12b/6 Gangai Street</p>
                  <p>Anna Nagar, Kallakurichi</p>
                  <p>606213</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ banner */}
          <div className="bg-brand-pink/20 border border-brand-pink/55 rounded-3xl p-6 text-xs text-brand-dark/70 leading-relaxed flex flex-col gap-2">
            <h4 className="font-bold text-brand-dark flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-brand-terracotta" /> Sizing or custom ruffles?
            </h4>
            <p>
              Check out our interactive FAQ list page for detail updates on fabric care, delivery periods, and drop rules.
            </p>
            <Link href="/faq" className="text-brand-terracotta font-bold hover:underline mt-1">
              Visit FAQ Guide &rarr;
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
