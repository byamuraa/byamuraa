'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, MessageCircle } from 'lucide-react';

/* ─── FAQ Data ─────────────────────────────────────────────── */

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  label: string;
  items: FaqItem[];
}

const faqCategories: FaqCategory[] = [
  {
    title: 'Ordering & Drops',
    label: 'How Our Prepaid Drops Work',
    items: [
      {
        question: 'What is a "prepaid drop" and how does it work?',
        answer:
          'A prepaid drop is our signature ordering model. Instead of keeping stock on hand, we open a limited ordering window (called a "drop") where you place and pay for your order upfront. Once the drop closes, we purchase the exact fabric yardage needed and begin hand-quilting every bag from scratch. This zero-waste approach means we never overproduce and every piece is made just for you.',
      },
      {
        question: 'How often do drops happen?',
        answer:
          'We typically release new drops every 3 to 4 weeks, though timing may vary depending on fabric sourcing and seasonal collections. Each drop is usually open for 48 to 72 hours or until all slots are filled — whichever comes first.',
      },
      {
        question: 'How do I know when a new drop is live?',
        answer:
          'The best way to stay in the loop is to follow us on Instagram and join our mailing list. We send a reminder email 24 hours before each drop goes live, and announce the exact opening time on our social channels. Some drops also include a password that is shared exclusively with our mailing list subscribers.',
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept all major credit and debit cards (Visa, Mastercard, American Express), UPI, net banking, and popular wallets. All payments are processed securely at checkout. Since we operate on a prepaid model, full payment is required at the time of order.',
      },
      {
        question: 'Can I cancel my order after placing it?',
        answer:
          'Because fabric is purchased immediately after a drop closes, cancellations are only possible within 12 hours of placing your order and before the drop window has closed. Once the drop closes and production begins, cancellations are no longer possible. Please reach out to us via the Contact page if you need to request a cancellation.',
      },
    ],
  },
  {
    title: 'Products & Sizing',
    label: 'Bags, Prints & Dimensions',
    items: [
      {
        question: 'What types of bags does Amuraa offer?',
        answer:
          'Our current collection includes quilted puffer tote bags, mini pouches, makeup bags, crossbody bags, and AirPod cases. Each style is available in a rotating selection of prints that change with every drop.',
      },
      {
        question: 'What materials are your bags made from?',
        answer:
          'All Amuraa bags are crafted from 100% organic cotton with custom-printed fabrics. We use breathable batting sandwiched between fabric layers to achieve the signature quilted puff. Our prints include gingham, polka dot, hearts, leopard, stripes, florals, and more — each sourced in limited yardage.',
      },
      {
        question: 'What are the approximate sizing details?',
        answer:
          'Sizing varies by style. Our puffer tote bags are approximately 38 × 35 × 12 cm — roomy enough for everyday essentials. Mini pouches are around 18 × 14 cm, perfect for cards and keys. Makeup bags measure roughly 22 × 14 × 8 cm. Crossbody bags are about 24 × 18 cm with an adjustable strap. AirPod cases are compact at approximately 8 × 7 cm. Exact measurements are listed on each product page during a drop.',
      },
      {
        question: 'Are the prints and patterns always the same?',
        answer:
          "No — that's part of the magic! We source our fabrics in very small, finite runs. Once a particular leopard print, gingham colourway, or floral pattern is used up, it may never come back. Each drop features a unique combination of prints, making every piece a limited-edition collectible.",
      },
    ],
  },
  {
    title: 'Shipping & Delivery',
    label: 'Timelines & Tracking',
    items: [
      {
        question: 'How long does it take to receive my order?',
        answer:
          'Because every bag is hand-quilted from scratch after the drop closes, the crafting process takes approximately 7 to 14 business days. Once your bag is complete and quality-checked, shipping takes an additional 2 to 4 business days. In total, expect your order within 2 to 3 weeks from when the drop closes.',
      },
      {
        question: 'Do you provide order tracking?',
        answer:
          "Yes! Once your bag is dispatched from our workshop, you will receive an automated email with a tracking number and a link to follow your package in real time. If you don't receive a tracking email, please check your spam folder or reach out to us.",
      },
      {
        question: 'Where do you ship?',
        answer:
          'We currently ship across India. International shipping is something we are actively working on — follow us on Instagram or subscribe to our mailing list for updates on when we expand to global destinations.',
      },
      {
        question: 'Are shipping charges included in the price?',
        answer:
          'Standard domestic shipping is included in the listed price for most orders. For remote pin codes or expedited delivery requests, a small additional shipping fee may apply and will be shown at checkout.',
      },
    ],
  },
  {
    title: 'Returns & Exchanges',
    label: 'Handmade Order Policies',
    items: [
      {
        question: 'Can I return my bag if I change my mind?',
        answer:
          'Since every Amuraa bag is a handmade, made-to-order item produced specifically for you after a prepaid drop, we are unable to accept returns for change of mind, colour preference, or sizing. We encourage you to review all product photos, dimensions, and descriptions carefully before ordering.',
      },
      {
        question: 'What if my bag arrives damaged or defective?',
        answer:
          'Your satisfaction matters to us. If your bag arrives with a manufacturing defect — such as a broken stitch, torn fabric, or misaligned quilting — please contact us within 7 days of delivery with clear photos of the issue. We will arrange a free exchange or repair at no additional cost to you.',
      },
      {
        question: 'How do I request an exchange for a defective item?',
        answer:
          'Email us at hello@amuraa.com or use our Contact page with your order number and photos of the defect. Our team will review the case within 48 hours and guide you through the exchange process, including a prepaid return label if applicable.',
      },
      {
        question: 'Do you offer refunds?',
        answer:
          'Refunds are issued only in rare cases where a replacement or repair is not possible. If your item has a verified manufacturing defect and we cannot provide a suitable exchange, we will process a full refund to your original payment method within 7 to 10 business days.',
      },
    ],
  },
  {
    title: 'Care Instructions',
    label: 'Keeping Your Bag Beautiful',
    items: [
      {
        question: 'How should I wash my quilted bag?',
        answer:
          'We recommend gentle hand washing in cold water with a mild detergent. Submerge the bag, gently press and squeeze — avoid wringing or twisting, as this can distort the quilted padding. Rinse thoroughly and reshape the bag while damp.',
      },
      {
        question: 'Can I machine wash my Amuraa bag?',
        answer:
          'We do not recommend machine washing as the agitation can damage the quilted structure and cause the batting to bunch. If you must use a machine, place the bag in a mesh laundry bag, use a delicate/cold cycle, and skip the spin dry.',
      },
      {
        question: 'How should I dry my bag?',
        answer:
          'Lay your bag flat on a clean towel in a well-ventilated area, away from direct sunlight. Reshape it gently while damp to maintain the puffed quilted look. Avoid using a tumble dryer or hanging the bag, as this can stretch the straps and distort the shape.',
      },
      {
        question: 'How do I store my quilted bag when not in use?',
        answer:
          'Store your bag in the dust bag provided (or a clean cotton pillowcase) in a cool, dry place. Avoid compressing it under heavy items — the quilted padding needs room to breathe to retain its fluffy structure. Stuffing the bag lightly with tissue paper helps it hold its shape.',
      },
      {
        question: 'How do I handle stains on my bag?',
        answer:
          'For spot cleaning, dab the stained area gently with a damp cloth and a tiny amount of mild soap. Avoid rubbing aggressively as this can spread the stain or pill the cotton fabric. For stubborn stains, soak the affected area in cold water for 15 minutes before gently dabbing again.',
      },
    ],
  },
];

/* ─── Accordion Item Component ─────────────────────────────── */

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full text-left bg-white border border-brand-pink/30 rounded-2xl px-5 py-4 shadow-xs transition-all hover:border-brand-terracotta/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-terracotta/40"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-serif text-sm sm:text-base font-semibold text-brand-dark leading-snug">
          {item.question}
        </h3>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-brand-terracotta transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-xs sm:text-sm text-brand-dark/70 leading-relaxed pr-8">
            {item.answer}
          </p>
        </div>
      </div>
    </button>
  );
}

/* ─── Main FAQ Page ────────────────────────────────────────── */

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col gap-12 sm:gap-16">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="text-center flex flex-col items-center">
        <div className="relative h-14 w-14 overflow-hidden rounded-full border border-brand-terracotta/20 shadow-xs mb-3">
          <Image
            src="/logo.jpg"
            alt="Amuraa Logo"
            fill
            className="object-cover"
          />
        </div>
        <span className="font-script text-3xl text-brand-terracotta">
          Got Questions?
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-brand-dark mt-2">
          Frequently Asked Questions
        </h1>
        <div className="h-0.5 w-16 bg-brand-terracotta/40 mx-auto mt-4" />
        <p className="mt-4 text-xs sm:text-sm text-brand-dark/70 max-w-md mx-auto leading-relaxed">
          Everything you need to know about our handmade quilted bags, prepaid
          drops, shipping timelines, and care tips — all in one place.
        </p>
      </div>

      {/* ── FAQ Categories ───────────────────────────────────── */}
      {faqCategories.map((category, catIdx) => (
        <section key={catIdx} className="flex flex-col gap-4">
          {/* Category header */}
          <div className="mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-terracotta">
              {category.label}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-brand-dark mt-1 leading-tight">
              {category.title}
            </h2>
          </div>

          {/* FAQ items */}
          {category.items.map((item, itemIdx) => {
            const key = `${catIdx}-${itemIdx}`;
            return (
              <AccordionItem
                key={key}
                item={item}
                isOpen={!!openItems[key]}
                onToggle={() => toggleItem(key)}
              />
            );
          })}
        </section>
      ))}

      {/* ── Bottom CTA Section ───────────────────────────────── */}
      <section className="text-center bg-brand-pink/35 border border-brand-pink/60 rounded-3xl p-8 max-w-xl mx-auto w-full">
        <div className="flex items-center justify-center gap-2 mb-3">
          <MessageCircle className="w-5 h-5 text-brand-terracotta" />
          <h3 className="font-serif text-xl font-semibold text-brand-dark">
            Still Have Questions?
          </h3>
        </div>
        <p className="text-xs text-brand-dark/60 mb-6">
          Our studio team responds to every inquiry within 24 hours. We&apos;re
          happy to help with sizing, custom requests, or anything else.
        </p>
        <Link
          href="/contact"
          className="rounded-full bg-brand-terracotta px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-xs hover:bg-brand-terracotta/90 transition-all"
        >
          Contact Our Studio
        </Link>
      </section>
    </div>
  );
}
