'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { AlertTriangle, Check, X, PackageOpen } from 'lucide-react';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  category: string;
  fabric: string;
  stock: number;
  price: number;
  images: any[];
}

export default function AdminAlertsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Restock Edit state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingStockVal, setEditingStockVal] = useState<number>(0);
  const [savingStock, setSavingStock] = useState(false);

  async function loadAlerts() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products?limit=100');
      const data = await res.json();
      if (data.products) {
        // Filter local stock level <= 3
        const alerts = data.products.filter((p: Product) => p.stock <= 3);
        setProducts(alerts);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load low stock listings.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleRestockSave = async (productId: string) => {
    if (editingStockVal < 0 || isNaN(editingStockVal)) {
      showToast('Please enter a valid stock level.', 'error');
      return;
    }

    setSavingStock(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: Number(editingStockVal) }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast('Inventory replenished successfully!', 'success');
        
        // If the new stock is > 3, it should be removed from the alerts list!
        if (Number(editingStockVal) > 3) {
          setProducts(prev => prev.filter(p => p._id !== productId));
        } else {
          setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: Number(editingStockVal) } : p));
        }
        
        setEditingProductId(null);
      } else {
        showToast(data.error || 'Failed to update inventory.', 'error');
      }
    } catch (e) {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setSavingStock(false);
    }
  };

  const getProductImageUrl = (images: any[]): string => {
    if (!images || images.length === 0) return '/images/products/tote_pink_leopard_1.jpg';
    const first = images[0];
    return typeof first === 'string' ? first : first.url;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <p className="font-serif text-lg text-brand-dark/50 animate-pulse">
          Analyzing inventory levels...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-semibold text-brand-dark">Stock Alerts</h2>
        <p className="text-xs text-brand-dark/50 mt-1">Refill quilted items with stock quantity of 3 or less.</p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-brand-pink/30 rounded-3xl p-12 text-center flex flex-col items-center shadow-xs">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full mb-4">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-brand-dark">Inventory Healthy</h3>
          <p className="text-xs text-brand-dark/50 mt-2 max-w-xs">
            Excellent! All items in the drop catalog are fully stocked with more than 3 units available.
          </p>
        </div>
      ) : (
        <div className="bg-[#FFF5F5] border border-red-100 rounded-3xl p-6 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="font-serif text-lg font-semibold">Critical Stock Warnings ({products.length})</h3>
          </div>

          <div className="bg-white border border-red-100/30 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-dark">
                <thead className="bg-red-50/50 text-[10px] uppercase font-bold tracking-wider text-red-700/60 border-b border-red-100/30">
                  <tr>
                    <th className="py-4 px-6">Image</th>
                    <th className="py-4 px-6">Accessory</th>
                    <th className="py-4 px-6">Current Stock</th>
                    <th className="py-4 px-6 text-right">Replenish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-50/20">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-red-50/10 transition-colors">
                      
                      {/* Image */}
                      <td className="py-4 px-6">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-brand-pink/35 shadow-xs bg-white">
                          <Image 
                            src={getProductImageUrl(p.images)} 
                            alt={p.name} 
                            fill 
                            sizes="48px"
                            className="object-cover" 
                          />
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 max-w-xs">
                          <span className="font-semibold text-brand-dark leading-tight">{p.name}</span>
                          <span className="text-[10px] text-brand-dark/50 font-medium italic">Print: {p.fabric}</span>
                        </div>
                      </td>

                      {/* Stock level tag */}
                      <td className="py-4 px-6">
                        <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] border ${
                          p.stock === 0 
                            ? 'bg-red-50 border-red-100 text-red-500' 
                            : 'bg-amber-50 border-amber-100 text-amber-600 animate-pulse'
                        }`}>
                          {p.stock === 0 ? 'Sold Out' : `Only ${p.stock} left!`}
                        </span>
                      </td>

                      {/* Replenish inline edit */}
                      <td className="py-4 px-6 text-right">
                        {editingProductId === p._id ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              min="0"
                              value={editingStockVal}
                              onChange={(e) => setEditingStockVal(Number(e.target.value))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRestockSave(p._id);
                                else if (e.key === 'Escape') setEditingProductId(null);
                              }}
                              className="w-16 bg-brand-cream border border-brand-pink/80 rounded-full px-2.5 py-1 text-center font-bold text-xs focus:outline-none focus:border-brand-terracotta"
                              autoFocus
                            />
                            <button
                              onClick={() => handleRestockSave(p._id)}
                              disabled={savingStock}
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
                          <button
                            onClick={() => {
                              setEditingProductId(p._id);
                              setEditingStockVal(p.stock + 10); // Default restock recommendation (+10)
                            }}
                            className="btn btn-outline btn-sm py-1.5 px-4 font-bold"
                          >
                            Quick Restock
                          </button>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
