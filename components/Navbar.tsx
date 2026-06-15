'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, User, Menu, X, Plus, Minus, Trash2 } from 'lucide-react';
import Image from 'next/image';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { cartItems, cartCount, cartSubtotal, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Sticky Header Nav */}
      <header className="sticky top-0 z-50 w-full border-b border-brand-pink/60 bg-brand-cream/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo Section */}
          <div className="flex flex-1 items-center justify-start lg:w-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-brand-pink shadow-xs">
                <Image
                  src="/logo.jpg"
                  alt="Amuraa Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-semibold tracking-wide text-brand-dark group-hover:text-brand-terracotta transition-colors duration-200">
                  Amuraa
                </span>
                <span className="font-script text-xl text-brand-terracotta translate-y-0.5 block leading-none">
                  drops
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden space-x-8 lg:flex">
            <Link
              href="/shop"
              className={`text-sm font-medium tracking-wide uppercase transition-colors duration-200 ${
                isActive('/shop')
                  ? 'text-brand-terracotta underline underline-offset-8 decoration-2'
                  : 'text-brand-dark hover:text-brand-terracotta'
              }`}
            >
              Shop All
            </Link>
            <Link
              href="/how-it-works"
              className={`text-sm font-medium tracking-wide uppercase transition-colors duration-200 ${
                isActive('/how-it-works')
                  ? 'text-brand-terracotta underline underline-offset-8 decoration-2'
                  : 'text-brand-dark hover:text-brand-terracotta'
              }`}
            >
              How It Works
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium tracking-wide uppercase transition-colors duration-200 ${
                isActive('/about')
                  ? 'text-brand-terracotta underline underline-offset-8 decoration-2'
                  : 'text-brand-dark hover:text-brand-terracotta'
              }`}
            >
              Our Story
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium tracking-wide uppercase transition-colors duration-200 ${
                isActive('/contact')
                  ? 'text-brand-terracotta underline underline-offset-8 decoration-2'
                  : 'text-brand-dark hover:text-brand-terracotta'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Header Action Controls */}
          <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6">
            
            {/* Account Profile Access */}
            <Link
              href={user ? '/account' : '/account'} // Always maps to account page (login/dashboard)
              className="text-brand-dark hover:text-brand-terracotta transition-colors duration-200 relative p-1"
              aria-label="Account"
            >
              <User className="h-6 w-6" />
              {user && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-brand-terracotta ring-2 ring-brand-cream animate-pulse" />
              )}
            </Link>

            {/* Shopping Cart Drawer Toggle */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="text-brand-dark hover:text-brand-terracotta transition-colors duration-200 relative p-1 focus:outline-none"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-dark text-[10px] font-bold text-white ring-2 ring-brand-cream">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Pre-Order Now Call to Action (Desktop) */}
            <Link
              href="/shop"
              className="hidden sm:inline-flex btn btn-primary btn-sm"
            >
              Pre-Order Now
            </Link>

            {/* Hamburger Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-brand-dark hover:text-brand-terracotta p-1 focus:outline-none"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-brand-pink/40 bg-brand-cream/95 backdrop-blur-md transition-all duration-300 animate-slide-in-up">
            <nav className="flex flex-col space-y-4 px-6 py-6 font-medium">
              <Link
                href="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-brand-dark hover:text-brand-terracotta text-sm uppercase tracking-wider"
              >
                Shop All
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-brand-dark hover:text-brand-terracotta text-sm uppercase tracking-wider"
              >
                How It Works
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-brand-dark hover:text-brand-terracotta text-sm uppercase tracking-wider"
              >
                Our Story
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-brand-dark hover:text-brand-terracotta text-sm uppercase tracking-wider"
              >
                Contact
              </Link>
              <Link
                href="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn btn-primary w-full"
              >
                Pre-Order Now
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Cart Drawer Slide-out Container */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop Blur overlay */}
            <div
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-[#3A3232]/50 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md bg-brand-cream border-l border-brand-pink/50 shadow-2xl transition-transform duration-300 transform translate-x-0 animate-slide-in-right flex flex-col">
                
                {/* Drawer Header */}
                <div className="px-6 py-6 border-b border-brand-pink/30 flex justify-between items-center">
                  <h2 className="text-xl font-serif font-semibold text-brand-dark">Your Bag ({cartCount})</h2>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 hover:bg-brand-pink/40 rounded-full text-brand-dark hover:text-brand-terracotta transition-colors focus:outline-none"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-brand-pink/20">
                  {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <ShoppingBag className="h-16 w-16 text-brand-terracotta/40 stroke-[1.5] mb-4" />
                      <p className="font-serif text-lg text-brand-dark/95">Your bag is empty!</p>
                      <p className="text-xs text-brand-dark/85 mt-1 mb-6">Let's find some quilted goodies to fill it.</p>
                      <button
                        onClick={() => {
                          setIsDrawerOpen(false);
                          window.location.href = '/shop';
                        }}
                        className="btn btn-primary"
                      >
                        Explore Drop
                      </button>
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item.product} className="flex py-4 gap-4 items-center">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-white border border-brand-pink/30 relative">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-brand-dark line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-brand-dark/85 mt-0.5">Print: {item.fabric}</p>
                          <p className="text-sm font-semibold text-brand-terracotta mt-1">${item.price}</p>
                          
                          {/* Item Quantity Controller */}
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center border border-brand-pink/60 rounded-full bg-white">
                              <button
                                onClick={() => updateQuantity(item.product, item.quantity - 1)}
                                className="p-1 hover:text-brand-terracotta px-2 text-xs"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-semibold px-1 min-w-[16px] text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product, item.quantity + 1)}
                                className="p-1 hover:text-brand-terracotta px-2 text-xs"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.product)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Drawer Footer summary */}
                {cartItems.length > 0 && (
                  <div className="border-t border-brand-pink/30 bg-brand-pink/10 px-6 py-6">
                    <div className="flex justify-between text-base font-medium text-brand-dark mb-1">
                      <span>Subtotal</span>
                      <span className="font-semibold text-brand-terracotta">${cartSubtotal}</span>
                    </div>
                    <p className="text-xs text-brand-dark/85 mb-6">Prepaid orders only. Taxes and shipping calculated at checkout.</p>
                    
                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        window.location.href = '/cart';
                      }}
                      className="btn btn-secondary w-full mb-2.5"
                    >
                      View Cart Details
                    </button>
                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        window.location.href = '/checkout';
                      }}
                      className="btn btn-primary w-full"
                    >
                      Instant checkout
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
