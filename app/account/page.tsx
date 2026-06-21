'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, Address } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { ShoppingBag, MapPin, LogOut, Lock, User as UserIcon, Plus, CheckCircle, Package, Truck, Home } from 'lucide-react';

export default function AccountPage() {
  const { user, loading, loginWithGoogle, logout, updateAddresses } = useAuth();
  const { showToast } = useToast();

  const [authLoading, setAuthLoading] = useState(false);

  // Form inputs: Address
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [isDefault, setIsDefault] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  // Orders list
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Load orders if user logged in
  useEffect(() => {
    if (user) {
      setOrdersLoading(true);
      async function loadOrders() {
        try {
          const res = await fetch('/api/orders');
          const data = await res.json();
          if (data.orders) {
            setOrders(data.orders);
          }
        } catch (err) {
          console.error('Failed to load orders:', err);
        } finally {
          setOrdersLoading(false);
        }
      }
      loadOrders();
    }
  }, [user]);



  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !state || !postalCode) {
      showToast('Please complete all address fields.', 'error');
      return;
    }

    setAddressLoading(true);
    
    const newAddress: Address = {
      street,
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault || (user?.addresses?.length === 0), // Default if first address
    };

    // Prepare updated address list
    let updatedList = [...(user?.addresses || [])];
    if (newAddress.isDefault) {
      // Set all other addresses isDefault to false
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }
    updatedList.push(newAddress);

    const res = await updateAddresses(updatedList);
    setAddressLoading(false);

    if (res.success) {
      showToast('Address added successfully!', 'success');
      // Reset form
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
      setIsDefault(false);
      setShowAddressForm(false);
    } else {
      showToast(res.error || 'Failed to add address.', 'error');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
    const updatedList = user.addresses.filter((a) => a._id !== addressId);
    
    // If we deleted the default, set first remaining as default
    if (updatedList.length > 0 && !updatedList.some((a) => a.isDefault)) {
      updatedList[0].isDefault = true;
    }

    const res = await updateAddresses(updatedList);
    if (res.success) {
      showToast('Address deleted successfully.', 'success');
    } else {
      showToast(res.error || 'Failed to delete address.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center animate-pulse">
        <p className="font-serif text-lg text-brand-dark/50 font-medium">Validating account token...</p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: GUEST SIGNUP/LOGIN SCREEN
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 flex flex-col items-center">
        <div className="text-center mb-8 flex flex-col items-center">
          <span className="font-script text-2xl text-brand-terracotta">Amuraa Drops</span>
          <h2 className="font-serif text-3xl font-bold text-brand-dark mt-2">Sign In to Your Account</h2>
          <p className="text-xs text-brand-dark/60 mt-2 max-w-xs text-center">
            Log in to view early drop passwords, track your handmade orders, and manage shipping addresses.
          </p>
        </div>

        <div className="w-full bg-white border border-brand-pink/40 rounded-3xl p-8 shadow-xs flex flex-col gap-4">
          <GoogleSignInButton
            onClick={async () => {
              setAuthLoading(true);
              try {
                await loginWithGoogle();
              } catch (e) {
                showToast('Authentication failed.', 'error');
                setAuthLoading(false);
              }
            }}
            loading={authLoading}
            text="Continue with Google"
          />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: LOGGED-IN ACCOUNT DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Dashboard Welcome Header */}
      <div className="border-b border-brand-pink/40 pb-6 mb-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
        <div>
          <span className="font-script text-2xl text-brand-terracotta">Welcome Back,</span>
          <h1 className="font-serif text-3xl font-semibold text-brand-dark mt-0.5">{user.name}</h1>
          <p className="text-xs text-brand-dark/50 mt-1">{user.email}</p>
        </div>
        
        <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
          {user.role === 'admin' && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-terracotta hover:bg-brand-terracotta/90 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-terracotta/20 bg-white hover:bg-brand-pink/30 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-brand-terracotta transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT CARD COLUMN: Order History */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h2 className="font-serif text-2xl font-semibold text-brand-dark flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-terracotta" /> Order History
          </h2>

          {ordersLoading ? (
            <p className="text-xs text-brand-dark/50 animate-pulse">Retrieving drop history logs...</p>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-brand-pink/30 rounded-3xl py-12 px-4 text-center shadow-xs flex flex-col items-center">
              <ShoppingBag className="h-10 w-10 text-brand-terracotta/20 stroke-[1.5] mb-2" />
              <p className="font-serif text-sm font-semibold text-brand-dark">No orders placed yet.</p>
              <p className="text-[10px] text-brand-dark/50 mt-0.5 mb-4">Your handmade orders will show up here.</p>
              <Link href="/shop" className="rounded-full bg-brand-pink border border-brand-terracotta/30 px-4 py-2 text-[10px] font-bold text-brand-terracotta uppercase">
                Explore Current Drop
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {orders.map((ord) => (
                <div key={ord._id} className="bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
                  
                  {/* Order Top Banner details */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-brand-pink/15 pb-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-dark/40">Order Code</span>
                      <p className="font-mono font-bold text-brand-dark">#{ord._id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-dark/40">Date Placed</span>
                      <p className="font-semibold text-brand-dark">
                        {new Date(ord.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-dark/40">Total Amount</span>
                      <p className="font-bold text-brand-terracotta">${ord.totalAmount}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-dark/40">Payment</span>
                      <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ml-1 border ${
                        ord.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          : 'bg-amber-50 border-amber-100 text-amber-600 animate-pulse'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order items lists */}
                  <div className="flex flex-col gap-3">
                    {ord.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <div className="relative h-10 w-10 overflow-hidden rounded bg-brand-cream border border-brand-pink/30">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <h4 className="font-semibold text-brand-dark truncate">{item.name}</h4>
                          <p className="text-[10px] text-brand-dark/50">Print: {item.fabric} x{item.quantity}</p>
                        </div>
                        <span className="text-xs font-semibold text-brand-dark">${item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Shipment Tracking Status Timeline Tracker */}
                  <div className="border-t border-brand-pink/15 pt-5 mt-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/45 block mb-4">
                      Craft Shipment Status
                    </span>
                    
                    <div className="flex justify-between items-center max-w-md relative">
                      
                      {/* Timeline Line indicator */}
                      <div className="absolute left-0 right-0 h-0.5 bg-brand-pink z-0" />
                      
                      {/* Progress line color overlay */}
                      <div className={`absolute left-0 h-0.5 bg-brand-terracotta z-0 transition-all duration-300 ${
                        ord.orderStatus === 'Shipped' ? 'w-1/2' : ord.orderStatus === 'Delivered' ? 'w-full' : 'w-0'
                      }`} />

                      {/* Step 1: Processing */}
                      <div className="flex flex-col items-center gap-1.5 relative z-10 text-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border transition-colors ${
                          ['Processing', 'Shipped', 'Delivered'].includes(ord.orderStatus)
                            ? 'bg-brand-terracotta text-white border-brand-terracotta'
                            : 'bg-white text-brand-dark/40 border-brand-pink'
                        }`}>
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold uppercase text-brand-dark/80">Quilted</span>
                      </div>

                      {/* Step 2: Shipped */}
                      <div className="flex flex-col items-center gap-1.5 relative z-10 text-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border transition-colors ${
                          ['Shipped', 'Delivered'].includes(ord.orderStatus)
                            ? 'bg-brand-terracotta text-white border-brand-terracotta'
                            : 'bg-white text-brand-dark/40 border-brand-pink'
                        }`}>
                          <Truck className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold uppercase text-brand-dark/80">Shipped</span>
                      </div>

                      {/* Step 3: Delivered */}
                      <div className="flex flex-col items-center gap-1.5 relative z-10 text-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border transition-colors ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-brand-terracotta text-white border-brand-terracotta'
                            : 'bg-white text-brand-dark/40 border-brand-pink'
                        }`}>
                          <Home className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold uppercase text-brand-dark/80">Arrived</span>
                      </div>

                    </div>

                    {/* Tracking details */}
                    {ord.orderStatus === 'Shipped' && ord.trackingNumber && (
                      <div className="mt-5 p-3 rounded-xl bg-brand-pink/20 border border-brand-pink/30 text-[10px] text-brand-dark/70">
                        <p className="font-semibold text-brand-dark">Carrier: <span className="font-bold text-brand-terracotta">{ord.carrier}</span></p>
                        <p className="mt-0.5">Tracking Code: <span className="font-mono font-bold text-brand-dark select-all">{ord.trackingNumber}</span></p>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN CARD: Address Manager */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-xl font-semibold text-brand-dark flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-terracotta" /> Saved Addresses
            </h2>
            
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="p-1 text-brand-terracotta hover:bg-brand-pink/40 rounded-full transition-colors focus:outline-none"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Add Address Form popup */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="bg-white border border-brand-pink/45 p-5 rounded-3xl flex flex-col gap-3 shadow-md">
              <h4 className="font-serif text-sm font-semibold text-brand-dark mb-1">New Shipping Address</h4>

              <div>
                <label className="text-[9px] font-bold uppercase text-brand-dark/60 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street details"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-brand-cream/30 border border-brand-pink/60 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-brand-terracotta"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold uppercase text-brand-dark/60 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-brand-cream/30 border border-brand-pink/60 rounded-full px-4 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-brand-dark/60 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-brand-cream/30 border border-brand-pink/60 rounded-full px-4 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold uppercase text-brand-dark/60 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    placeholder="Pin code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-brand-cream/30 border border-brand-pink/60 rounded-full px-4 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-brand-dark/60 block mb-1">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-brand-cream/30 border border-brand-pink/60 rounded-full px-4 py-2 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="default_addr"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-brand-terracotta focus:ring-brand-pink"
                />
                <label htmlFor="default_addr" className="text-[10px] font-semibold text-brand-dark/70">
                  Set as default address
                </label>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full py-2 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressLoading}
                  className="flex-1 bg-brand-terracotta text-white rounded-full py-2 text-xs font-bold uppercase tracking-wider hover:bg-brand-terracotta/95 transition-colors"
                >
                  {addressLoading ? 'Saving...' : 'Add Address'}
                </button>
              </div>

            </form>
          )}

          {/* Saved addresses list */}
          <div className="flex flex-col gap-4">
            {user.addresses?.length === 0 ? (
              <p className="text-[10px] text-brand-dark/50 italic">No addresses saved yet.</p>
            ) : (
              user.addresses?.map((addr) => (
                <div key={addr._id} className="bg-white border border-brand-pink/30 p-4 rounded-2xl flex justify-between items-start shadow-xs relative">
                  <div className="text-xs text-brand-dark/70">
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 text-[8px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 mb-2">
                        <CheckCircle className="w-2.5 h-2.5" /> Default Address
                      </span>
                    )}
                    <p className="font-semibold text-brand-dark">{addr.street}</p>
                    <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p>{addr.country}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(addr._id!)}
                    className="text-slate-400 hover:text-red-500 text-[10px] font-bold uppercase tracking-wider focus:outline-none transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
