'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  Plus, 
  Check, 
  X,
  Sparkles,
  Award
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  category: string;
  fabric: string;
  price: number;
  stock: number;
  status: string;
  images: any[];
  isNewDrop?: boolean;
  isBestseller?: boolean;
}

const categories = [
  'Puffer Tote Bags',
  'Heart Print Mini Bags',
  'Striped Ruffle-Strap Shoulder Bags',
  'AirPod Bags / Small Pouches',
  'Makeup Pouches',
  'Indigo Block-Print Organizer Pouches',
  'Other'
];

export default function AdminProductsPage() {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');

  // Inline Stock Edit
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingStockVal, setEditingStockVal] = useState<number>(0);
  const [updatingStock, setUpdatingStock] = useState(false);

  // Delete product confirmation
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  async function fetchProducts() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        category,
        sort,
      });

      const res = await fetch(`/api/admin/products?${queryParams.toString()}`);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        setTotal(data.pagination.total);
        setPages(data.pagination.pages);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to fetch products.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [page, category, sort]);

  // Handle filter submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  // Quick Inline Stock Update
  const handleQuickStockUpdate = async (productId: string) => {
    if (editingStockVal < 0 || isNaN(editingStockVal)) {
      showToast('Please enter a valid stock number', 'error');
      return;
    }
    
    setUpdatingStock(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: Number(editingStockVal) }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        showToast('Stock level updated successfully!', 'success');
        setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: data.product.stock, status: data.product.status } : p));
        setEditingProductId(null);
      } else {
        showToast(data.error || 'Failed to update stock.', 'error');
      }
    } catch (e) {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setUpdatingStock(false);
    }
  };

  // Full product deletion
  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Product successfully deleted.', 'success');
        setProducts(prev => prev.filter(p => p._id !== productId));
        setDeletingProductId(null);
      } else {
        showToast('Failed to delete product.', 'error');
      }
    } catch (e) {
      showToast('An unexpected error occurred.', 'error');
    }
  };

  // Helper to extract image URL safely
  const getProductImageUrl = (images: any[]): string => {
    if (!images || images.length === 0) return '/images/products/tote_pink_leopard_1.jpg';
    const first = images[0];
    return typeof first === 'string' ? first : first.url;
  };

  return (
    <div className="space-y-10 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-brand-dark">Catalog</h2>
          <p className="text-xs text-brand-dark/50 mt-1">Manage designs, configure pricing parameters, and track inventory.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="btn btn-primary inline-flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#3A3232]/40 backdrop-blur-xs" onClick={() => setDeletingProductId(null)} />
          <div className="bg-white border border-brand-pink/40 p-6 rounded-3xl max-w-sm w-full relative z-10 animate-scale-in text-center flex flex-col items-center">
            <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg font-semibold text-brand-dark">Delete this product?</h4>
            <p className="text-xs text-brand-dark/60 mt-2 mb-6">
              This action cannot be undone. It will remove this product completely from the active catalog drops.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setDeletingProductId(null)}
                className="btn btn-outline flex-1 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deletingProductId)}
                className="btn btn-primary flex-1 py-2 bg-red-500 hover:bg-red-600 border-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and search controllers */}
      <div className="bg-white border border-brand-pink/30 rounded-3xl p-5 shadow-xs flex flex-col lg:flex-row justify-between items-center gap-4">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
          <input
            type="text"
            placeholder="Search by product title or fabric..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full pl-10 pr-4 py-2.5 text-xs text-brand-dark placeholder-brand-dark/40 focus:outline-none focus:border-brand-terracotta"
          />
        </form>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto justify-end">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2 text-xs text-brand-dark focus:outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2 text-xs text-brand-dark focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="stock_asc">Stock: Low to High</option>
            <option value="stock_desc">Stock: High to Low</option>
          </select>
        </div>

      </div>

      {/* Catalog Table */}
      <div className="bg-white border border-brand-pink/30 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-dark">
            <thead className="bg-brand-pink/20 text-[10px] uppercase font-bold tracking-wider text-brand-dark/50 border-b border-brand-pink/10">
              <tr>
                <th className="py-4 px-6">Image</th>
                <th className="py-4 px-6">Product Title</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock Level</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-pink/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 px-6 text-center text-xs text-brand-dark/40 italic">
                    Fetching products data...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 px-6 text-center text-xs text-brand-dark/40 italic">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-brand-cream/10 transition-colors">
                    
                    {/* Image */}
                    <td className="py-4 px-6">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-brand-cream border border-brand-pink/35 shadow-xs">
                        <Image 
                          src={getProductImageUrl(p.images)} 
                          alt={p.name} 
                          fill 
                          sizes="48px"
                          className="object-cover" 
                        />
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1 max-w-xs">
                        <span className="font-semibold text-brand-dark leading-tight flex items-center gap-1.5">
                          {p.name}
                          {p.isNewDrop && <span className="bg-brand-pink text-brand-terracotta text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-brand-pink/60 uppercase">Drop</span>}
                          {p.isBestseller && <span className="bg-emerald-50 text-emerald-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-100 uppercase">Best</span>}
                        </span>
                        <span className="text-[10px] text-brand-dark/50 font-medium italic">Print: {p.fabric}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6 font-medium text-brand-dark/70">{p.category}</td>

                    {/* Price */}
                    <td className="py-4 px-6 font-bold text-brand-terracotta">${p.price}</td>

                    {/* Stock level cell (click-to-edit) */}
                    <td className="py-4 px-6">
                      {editingProductId === p._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editingStockVal}
                            onChange={(e) => setEditingStockVal(Number(e.target.value))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleQuickStockUpdate(p._id);
                              else if (e.key === 'Escape') setEditingProductId(null);
                            }}
                            className="w-16 bg-brand-cream border border-brand-pink/80 rounded-full px-2.5 py-1 text-center font-bold text-xs focus:outline-none focus:border-brand-terracotta"
                            autoFocus
                          />
                          <button
                            onClick={() => handleQuickStockUpdate(p._id)}
                            disabled={updatingStock}
                            className="p-1.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 focus:outline-none"
                            aria-label="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingProductId(null)}
                            className="p-1.5 bg-slate-300 text-slate-700 rounded-full hover:bg-slate-400 focus:outline-none"
                            aria-label="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] border ${
                            p.stock === 0 
                              ? 'bg-red-50 border-red-100 text-red-500' 
                              : p.stock <= 5 
                              ? 'bg-amber-50 border-amber-100 text-amber-600'
                              : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          }`}>
                            {p.stock} units
                          </span>
                          <button
                            onClick={() => {
                              setEditingProductId(p._id);
                              setEditingStockVal(p.stock);
                            }}
                            className="text-brand-dark/40 hover:text-brand-terracotta opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                            aria-label="Edit stock quantity"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        p.status === 'active'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          : p.status === 'soldout'
                          ? 'bg-red-50 border-red-100 text-red-500'
                          : 'bg-slate-50 border-slate-100 text-slate-500'
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/products/edit/${p._id}`}
                          className="p-1.5 bg-brand-pink/50 text-brand-terracotta hover:bg-brand-pink rounded-full transition-colors"
                          aria-label="Edit product details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeletingProductId(p._id)}
                          className="p-1.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors focus:outline-none"
                          aria-label="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controllers */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-brand-pink/10 flex items-center justify-between">
            <span className="text-[10px] text-brand-dark/50 font-semibold uppercase tracking-wider">
              Showing {products.length} of {total} products
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="btn btn-outline btn-sm py-1.5 px-3 inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <span className="flex items-center justify-center text-xs font-bold px-3">
                {page} / {pages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(pages, prev + 1))}
                disabled={page === pages}
                className="btn btn-outline btn-sm py-1.5 px-3 inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
