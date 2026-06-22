import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Shield, RotateCcw, CreditCard, Clock, Package, Mail, AlertTriangle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Returns & Refund Policy | Amuraa',
  description:
    'Learn about Amuraa\'s returns, refunds, exchanges, and cancellation policies for our handmade quilted accessories. Prepaid drop model with artisan-crafted quality.',
  openGraph: {
    title: 'Returns & Refund Policy | Amuraa',
    description:
      'Amuraa\'s policy on returns, refunds, exchanges, cancellations, and shipping damage for handmade quilted bags and accessories.',
  },
};

const policies = [
  {
    number: '01',
    icon: Shield,
    title: 'Returns Policy',
    paragraphs: [
      'Because every Amuraa piece is handmade to your order using custom-printed organic cotton, we are unable to accept returns for change of mind, incorrect sizing preference, or colour variation seen on-screen versus in person.',
      'Returns are accepted only for confirmed manufacturing defects — such as broken stitching, misaligned quilting, or hardware faults — reported within 7 days of delivery. To initiate a return, please email us with your order number and clear photographs showing the defect.',
    ],
  },
  {
    number: '02',
    icon: RotateCcw,
    title: 'Exchange Policy',
    paragraphs: [
      'We offer exchanges exclusively for items that arrive with a verified manufacturing defect. Unfortunately, we cannot exchange items based on personal preference, as each bag is cut and stitched individually for your order.',
      'To request an exchange, email byamuraa@gmail.com within 7 days of receiving your order. Please include your order number along with clear photographs of the defect. Our team will review your request and respond within 48 hours with next steps.',
    ],
  },
  {
    number: '03',
    icon: CreditCard,
    title: 'Refund Policy',
    paragraphs: [
      'Once we receive and inspect your returned item, a full refund will be issued for confirmed manufacturing defects. The inspection process typically takes 3–5 business days after we receive the item back at our studio.',
      'Approved refunds are processed to your original payment method within 5–7 business days. Please note that your bank or payment provider may take additional time to reflect the credit in your account. Shipping costs for defective returns are covered by Amuraa.',
    ],
  },
  {
    number: '04',
    icon: Clock,
    title: 'Cancellation Policy',
    paragraphs: [
      'You may cancel your order within 24 hours of placing it for a full refund, no questions asked. Simply email us at byamuraa@gmail.com with your order number and we will process the cancellation promptly.',
      'After the 24-hour window, your custom fabric may already be cut and quilting may have begun. At that stage, cancellations are unfortunately not possible, as the materials have been committed exclusively to your order. This is a core part of our zero-waste, made-to-order model.',
    ],
  },
  {
    number: '05',
    icon: Package,
    title: 'Shipping Damage',
    paragraphs: [
      'If your Amuraa bag arrives damaged due to shipping or courier mishandling, please contact us within 48 hours of delivery. We require unboxing photographs or a short video clearly showing the packaging condition and the damage to the product.',
      'Once verified, we will arrange a replacement or full refund at no additional cost to you. We recommend filming the unboxing of your parcel so that any transit damage can be documented immediately if needed.',
    ],
  },
  {
    number: '06',
    icon: Mail,
    title: 'Contact for Issues',
    paragraphs: [
      'For any questions, concerns, or policy-related requests, our studio team is here to help. Please reach out to us at byamuraa@gmail.com — we aim to respond to every inquiry within 24 hours on business days.',
      'You can also visit our Contact page to submit a detailed inquiry through our form, or browse our FAQ section for quick answers to common questions about sizing, care instructions, and delivery timelines.',
    ],
  },
];

export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col gap-12 sm:gap-16">

      {/* Page Header */}
      <div className="text-center flex flex-col items-center">
        <div className="relative h-14 w-14 overflow-hidden rounded-full border border-brand-terracotta/20 shadow-xs mb-3">
          <Image
            src="/logo.jpg"
            alt="Amuraa Logo"
            fill
            className="object-cover"
          />
        </div>
        <span className="font-script text-3xl text-brand-terracotta">Your Peace of Mind</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-brand-dark mt-2">
          Returns &amp; Refund Policy
        </h1>
        <div className="h-0.5 w-16 bg-brand-terracotta/40 mx-auto mt-4" />
        <p className="mt-4 text-xs sm:text-sm text-brand-dark/70 max-w-lg mx-auto leading-relaxed">
          We stand behind every stitch. Read our full policy on returns, exchanges, refunds, cancellations, and shipping issues below.
        </p>
      </div>

      {/* Important Notice Box */}
      <section className="bg-brand-pink/20 border border-brand-pink/60 rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="bg-brand-pink text-brand-terracotta p-3 rounded-2xl flex-shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-brand-dark">
              Important — Prepaid, Made-to-Order Model
            </h3>
            <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed mt-2">
              Amuraa operates on a <span className="font-semibold text-brand-dark">prepaid drop model</span>. Every quilted bag is handcrafted from scratch only after your order is placed — we purchase the exact fabric yardage, cut each panel, and quilt it specifically for you. This zero-waste, artisan approach means our policies differ from mass-produced retail. We kindly ask that you review these terms carefully before placing your order.
            </p>
            <p className="text-xs text-brand-dark/60 italic mt-2">
              Last updated: June 2026
            </p>
          </div>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="flex flex-col gap-8">
        {policies.map((policy) => (
          <div
            key={policy.number}
            className="bg-white border border-brand-pink/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start shadow-xs"
          >
            <div className="bg-brand-pink text-brand-terracotta p-4 rounded-2xl flex-shrink-0 flex items-center justify-center">
              <policy.icon className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="flex-grow">
              <span className="font-serif text-xs font-bold uppercase tracking-widest text-brand-terracotta">
                Section {policy.number}
              </span>
              <h3 className="font-serif text-xl font-semibold text-brand-dark mt-1">
                {policy.title}
              </h3>
              {policy.paragraphs.map((text, i) => (
                <p
                  key={i}
                  className="text-xs sm:text-sm text-brand-dark/70 mt-2.5 leading-relaxed"
                >
                  {text}
                </p>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Quick Reference Summary */}
      <section className="bg-white border border-brand-pink/30 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h3 className="font-serif text-lg font-semibold text-brand-dark border-b border-brand-pink/20 pb-3">
          Quick Reference
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {[
            { label: 'Return Window', value: '7 days from delivery' },
            { label: 'Exchange Eligibility', value: 'Manufacturing defects only' },
            { label: 'Refund Processing', value: '5–7 business days' },
            { label: 'Cancellation Window', value: 'Within 24 hours of order' },
            { label: 'Shipping Damage Report', value: 'Within 48 hours' },
            { label: 'Contact Email', value: 'byamuraa@gmail.com' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-terracotta">
                {item.label}
              </span>
              <span className="text-xs text-brand-dark/70">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center bg-brand-pink/35 border border-brand-pink/60 rounded-3xl p-8 max-w-xl mx-auto w-full">
        <h3 className="font-serif text-xl font-semibold text-brand-dark">
          Still Have Questions?
        </h3>
        <p className="text-xs text-brand-dark/60 mt-1 mb-6">
          Our studio team is happy to help with any concerns about your order.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/contact"
            className="rounded-full bg-brand-terracotta px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-xs hover:bg-brand-terracotta/90 transition-all inline-flex items-center gap-1.5"
          >
            Contact Us <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/faq"
            className="rounded-full border border-brand-terracotta px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-brand-terracotta hover:bg-brand-terracotta/5 transition-all"
          >
            Visit FAQ
          </Link>
        </div>
      </section>

    </div>
  );
}
