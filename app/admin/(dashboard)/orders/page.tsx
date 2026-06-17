'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { ShoppingCart, Send, X, ShieldCheck } from 'lucide-react';

interface Order {
  _id: string;
  email: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  items: Array<{
    name: string;
    fabric: string;
    quantity: number;
  }>;
}

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fulfillment edit states
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState('Processing');
  const [newCarrier, setNewCarrier] = useState('');
  const [newTracking, setNewTracking] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadOrders() {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
      showToast('Failed to load orders catalog.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOrderStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingOrderId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${updatingOrderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: newOrderStatus,
          trackingNumber: newOrderStatus === 'Shipped' ? newTracking : '',
          carrier: newOrderStatus === 'Shipped' ? newCarrier : '',
        }),
      });
      
      if (res.ok) {
        showToast('Order fulfillment updated successfully!', 'success');
        setOrders(prev => prev.map(o => o._id === updatingOrderId ? { 
          ...o, 
          orderStatus: newOrderStatus, 
          trackingNumber: newOrderStatus === 'Shipped' ? newTracking : '', 
          carrier: newOrderStatus === 'Shipped' ? newCarrier : '' 
        } : o));
        setUpdatingOrderId(null);
        setNewTracking('');
        setNewCarrier('');
      } else {
        showToast('Failed to update order details.', 'error');
      }
    } catch (e) {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <p className="font-serif text-lg text-brand-dark/50 animate-pulse">
          Loading order database...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* Header title */}
      <div>
        <h2 className="font-serif text-3xl font-semibold text-brand-dark">Fulfillment</h2>
        <p className="text-xs text-brand-dark/50 mt-1">Manage drop orders, update shipping statuses, and input tracking numbers.</p>
      </div>

      {/* Fulfillment Status Update Form popup modal */}
      {updatingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#3A3232]/40 backdrop-blur-xs" onClick={() => setUpdatingOrderId(null)} />
          
          <form 
            onSubmit={handleOrderStatusUpdate} 
            className="bg-white border border-brand-pink/40 p-6 rounded-3xl flex flex-col gap-4 shadow-xl max-w-md w-full relative z-10 animate-scale-in"
          >
            <div className="flex justify-between items-center border-b border-brand-pink/20 pb-3">
              <h4 className="font-serif text-base font-semibold text-brand-dark">Update Shipping Status</h4>
              <button type="button" onClick={() => setUpdatingOrderId(null)} className="text-brand-dark/40 hover:text-brand-dark p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-[10px] text-brand-dark/50 font-mono">Order Reference: #{updatingOrderId.toUpperCase()}</p>
            
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Status</label>
              <select
                value={newOrderStatus}
                onChange={(e) => setNewOrderStatus(e.target.value)}
                className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none cursor-pointer"
              >
                <option value="Processing">Processing (Pre-ordering)</option>
                <option value="Shipped">Shipped (On Way)</option>
                <option value="Delivered">Delivered (Arrived)</option>
              </select>
            </div>

            {newOrderStatus === 'Shipped' && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Delivery Carrier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FedEx, BlueDart, Delhivery"
                    value={newCarrier}
                    onChange={(e) => setNewCarrier(e.target.value)}
                    className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Shipment Tracking Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TRAK987654321"
                    value={newTracking}
                    onChange={(e) => setNewTracking(e.target.value)}
                    className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs font-mono text-brand-dark focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setUpdatingOrderId(null)}
                className="btn btn-outline flex-1 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary flex-1 py-2"
              >
                {saving ? 'Saving...' : 'Save Dispatch'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders list table */}
      <div className="bg-white border border-brand-pink/30 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-dark">
            <thead className="bg-brand-pink/20 text-[10px] uppercase font-bold tracking-wider text-brand-dark/50 border-b border-brand-pink/10">
              <tr>
                <th className="py-4 px-6">Code ID</th>
                <th className="py-4 px-6">Buyer Email</th>
                <th className="py-4 px-6">Items Secured</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Fulfillment</th>
                <th className="py-4 px-6 text-right">Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-pink/10">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-6 text-center text-xs text-brand-dark/40 italic">
                    No client orders found in the database.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-brand-cream/10 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold uppercase text-brand-dark/80">
                      #{ord._id.slice(-6)}
                    </td>
                    <td className="py-4 px-6 font-semibold">{ord.email}</td>
                    <td className="py-4 px-6 max-w-xs">
                      {ord.items.map((i, idx) => (
                        <span key={idx} className="block text-[10px] leading-tight font-medium">
                          {i.name} ({i.fabric}) x{i.quantity}
                        </span>
                      ))}
                    </td>
                    <td className="py-4 px-6 font-bold text-brand-terracotta">${ord.totalAmount}</td>
                    
                    {/* Payment & Fulfillment statuses */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 w-fit text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          ord.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : 'bg-amber-50 border-amber-100 text-amber-600 animate-pulse'
                        }`}>
                          {ord.paymentStatus === 'Paid' && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                          Paid: {ord.paymentStatus}
                        </span>
                        <span className={`inline-block w-fit text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : ord.orderStatus === 'Shipped'
                            ? 'bg-blue-50 border-blue-100 text-blue-600'
                            : 'bg-brand-pink border-brand-pink/60 text-brand-terracotta'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </div>
                    </td>

                    {/* Dispatch Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          setUpdatingOrderId(ord._id);
                          setNewOrderStatus(ord.orderStatus);
                          setNewCarrier(ord.carrier || '');
                          setNewTracking(ord.trackingNumber || '');
                        }}
                        className="btn btn-outline btn-sm py-1.5 px-3 inline-flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3" /> Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
