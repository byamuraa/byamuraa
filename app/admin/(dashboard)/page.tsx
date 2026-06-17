'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart, BarChart3, AlertTriangle, Users, ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  stock: number;
}

interface Order {
  _id: string;
  email: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: Array<{
    name: string;
    fabric: string;
    quantity: number;
  }>;
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        // 1. Fetch Products
        const prodRes = await fetch('/api/admin/products?limit=100');
        const prodData = await prodRes.json();
        if (prodData.products) setProducts(prodData.products);

        // 2. Fetch Orders
        const orderRes = await fetch('/api/orders');
        const orderData = await orderRes.json();
        if (orderData.orders) setOrders(orderData.orders);

        // 3. Fetch Subscribers
        const subRes = await fetch('/api/newsletter');
        const subData = await subRes.json();
        setSubscribersCount(subData.subscribers?.length || 0);
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Aggregates
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <p className="font-serif text-lg text-brand-dark/50 animate-pulse">
          Loading metrics and overview details...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* Page Header */}
      <div>
        <h2 className="font-serif text-3xl font-semibold text-brand-dark">Overview</h2>
        <p className="text-xs text-brand-dark/50 mt-1">Real-time metrics on sales, drops, and customer activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Orders Card */}
        <div className="bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="bg-brand-pink/60 p-4 rounded-2xl text-brand-terracotta">
            <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-brand-dark/50 tracking-wider">Total Orders</p>
            <p className="text-2xl font-bold text-brand-dark mt-0.5">{totalOrders}</p>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-600">
            <BarChart3 className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-brand-dark/50 tracking-wider">Total Revenue</p>
            <p className="text-2xl font-bold text-brand-dark mt-0.5">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Out of Stock Card */}
        <div className="bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="bg-[#FFF5F5] border border-red-100 p-4 rounded-2xl text-red-500">
            <AlertTriangle className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-brand-dark/50 tracking-wider">Out of Stock</p>
            <p className="text-2xl font-bold text-brand-dark mt-0.5">{outOfStockCount}</p>
          </div>
        </div>

        {/* Subscribers Card */}
        <div className="bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="bg-brand-blue p-4 rounded-2xl text-brand-accent">
            <Users className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-brand-dark/50 tracking-wider">Drop Subscribers</p>
            <p className="text-2xl font-bold text-brand-dark mt-0.5">{subscribersCount}</p>
          </div>
        </div>

      </div>

      {/* Grid: Recent Orders & Catalog Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle: Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-lg font-semibold text-brand-dark">Recent Activity</h3>
            <Link 
              href="/admin/orders" 
              className="text-[10px] uppercase font-bold text-brand-terracotta hover:underline inline-flex items-center gap-1"
            >
              All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-brand-dark/50 italic py-8 text-center">No orders received yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-pink/20 text-[9px] uppercase font-bold tracking-widest text-brand-dark/50 border-b border-brand-pink/10">
                  <tr>
                    <th className="py-3 px-4">Order Code</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-pink/10">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-brand-cream/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold uppercase text-brand-dark/80">
                        #{order._id.slice(-6)}
                      </td>
                      <td className="py-3 px-4 truncate max-w-[150px] font-semibold">
                        {order.email}
                      </td>
                      <td className="py-3 px-4 font-semibold text-brand-terracotta">
                        ${order.totalAmount}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : order.orderStatus === 'Shipped'
                            ? 'bg-blue-50 border-blue-100 text-blue-600'
                            : 'bg-brand-pink border-brand-pink/60 text-brand-terracotta'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Quick Inventory Status */}
        <div className="bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-semibold text-brand-dark mb-4">Inventory Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-dark/70 font-semibold">Total Catalog Items</span>
                <span className="font-bold text-brand-dark">{totalProducts} published</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-dark/70 font-semibold">Low Stock Items</span>
                <span className="font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                  {products.filter(p => p.stock > 0 && p.stock <= 3).length} warnings
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-dark/70 font-semibold">Sold Out / Closed</span>
                <span className="font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                  {outOfStockCount} items
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-brand-pink/20 mt-6">
            <Link
              href="/admin/products/new"
              className="btn btn-primary w-full inline-flex items-center justify-center gap-2"
            >
              Add New Design
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
