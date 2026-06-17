'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';
import { 
  BarChart3, 
  Package, 
  Plus, 
  ShoppingCart, 
  AlertTriangle, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);

  // Load low stock alerts count periodically
  useEffect(() => {
    async function fetchLowStock() {
      try {
        const res = await fetch('/api/admin/products?limit=100');
        const data = await res.json();
        if (data.products) {
          const low = data.products.filter((p: any) => p.stock <= 3).length;
          setLowStockCount(low);
        }
      } catch (err) {
        console.error('Failed to load stock count for layout:', err);
      }
    }
    fetchLowStock();
    // Poll every 60 seconds
    const interval = setInterval(fetchLowStock, 60000);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/auth/logout', { method: 'POST' });
      if (res.ok) {
        showToast('Logged out of admin panel.', 'success');
        // Force reload and redirect
        window.location.href = '/admin/login';
      } else {
        showToast('Logout failed.', 'error');
      }
    } catch (err) {
      showToast('Logout error occurred.', 'error');
    }
  };

  const navItems = [
    { name: 'Overview', href: '/admin', icon: BarChart3 },
    { name: 'All Products', href: '/admin/products', icon: Package },
    { name: 'Add Product', href: '/admin/products/new', icon: Plus },
    { name: 'Orders List', href: '/admin/orders', icon: ShoppingCart },
    { 
      name: 'Stock Alerts', 
      href: '/admin/alerts', 
      icon: AlertTriangle,
      badge: lowStockCount > 0 ? lowStockCount : undefined
    },
  ];

  // While checking credentials
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream/30">
        <p className="font-serif text-lg text-brand-dark/50 animate-pulse">
          Validating admin authentication session...
        </p>
      </div>
    );
  }

  // Double check client role safety (fallback to prevent flashing)
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-cream/20 flex flex-col md:flex-row">
      <div className="quilt-bg absolute inset-0 pointer-events-none opacity-5 z-0" />
      
      {/* Mobile Header Bar */}
      <header className="md:hidden bg-white border-b border-brand-pink/50 px-4 py-4 flex items-center justify-between z-30 shadow-xs relative">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="relative h-7 w-7 overflow-hidden rounded-full border border-brand-pink">
            <Image src="/logo.jpg" alt="Amuraa Logo" fill className="object-cover" />
          </div>
          <span className="font-serif text-lg font-semibold text-brand-dark">Amuraa Admin</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-brand-dark hover:text-brand-terracotta focus:outline-none p-1"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar (Desktop / Mobile overlay) */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-brand-pink/40 z-20 transform transition-transform duration-300 ease-in-out flex flex-col justify-between shadow-xs
        md:relative md:transform-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Upper Sidebar */}
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-brand-pink/20 flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-brand-pink shadow-xs">
              <Image src="/logo.jpg" alt="Amuraa Logo" fill className="object-cover" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-brand-dark leading-tight">Amuraa</h1>
              <span className="text-[9px] uppercase tracking-widest font-bold text-brand-terracotta">
                Seller Studio
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                    active
                      ? 'bg-brand-pink text-brand-terracotta font-bold'
                      : 'text-brand-dark/70 hover:text-brand-dark hover:bg-brand-cream/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${active ? 'text-brand-terracotta' : 'text-brand-dark/40'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-red-500 text-white text-[9px] font-black rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Lower Sidebar Profile / Logout */}
        <div className="p-4 border-t border-brand-pink/20">
          <div className="flex items-center gap-3 px-4 py-2 mb-3">
            <div className="bg-brand-pink text-brand-terracotta p-2 rounded-full">
              <User className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-[10px] font-bold text-brand-dark leading-tight truncate">Amuraa Admin</p>
              <p className="text-[8px] text-brand-dark/50 truncate">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors focus:outline-none"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-10 z-10 relative overflow-y-auto min-h-screen flex flex-col">
        {children}
      </main>

      {/* Background Dim Backdrop for Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-[#3A3232]/30 backdrop-blur-xs z-10 md:hidden"
        />
      )}
    </div>
  );
}
