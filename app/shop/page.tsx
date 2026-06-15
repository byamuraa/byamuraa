'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ProductCard, { Product } from '@/components/ProductCard';
import { Search, Filter, X } from 'lucide-react';

const categories = [
  'Puffer Tote Bags',
  'Heart Print Mini Bags',
  'Striped Ruffle-Strap Shoulder Bags',
  'AirPod Bags / Small Pouches',
  'Makeup Pouches',
  'Indigo Block-Print Organizer Pouches'
];

const fabrics = [
  'Pink Leopard Print',
  'Mauve Check',
  'Pink Polka Dot',
  'Pink Gingham',
  'Sweetheart Print',
  'Blue & White Stripes',
  'Heart Print',
  'Leopard Print',
  'Floral Grey',
  'Leaf Print',
  'Blue Gingham',
  'Traditional Indigo Block-Print'
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter and Search states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFabric, setSelectedFabric] = useState('');
  const [priceRange, setPriceRange] = useState<number>(100);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory) queryParams.append('category', selectedCategory);
        if (selectedFabric) queryParams.append('fabric', selectedFabric);
        if (search) queryParams.append('search', search);
        if (sortBy) queryParams.append('sort', sortBy);

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await res.json();
        if (data.products) {
          // Client-side filter for price range limit
          let filtered = data.products as Product[];
          filtered = filtered.filter(p => p.price <= priceRange);
          setProducts(filtered);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [selectedCategory, selectedFabric, search, sortBy, priceRange]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedFabric('');
    setPriceRange(100);
    setSortBy('newest');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Page header */}
      <div className="border-b border-brand-pink/40 pb-8 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-brand-terracotta/20 shadow-xs mx-auto sm:mx-0">
            <Image
              src="/logo.jpg"
              alt="Amuraa Logo"
              fill
              className="object-cover"
            />
          </div>
          <span className="font-script text-2xl text-brand-terracotta">Amuraa Collection</span>
        </div>
        <h1 className="font-serif text-4xl font-semibold text-brand-dark mt-2">Shop Quilted Drops</h1>
        <p className="mt-2 text-xs sm:text-sm text-brand-dark/85">
          Hand-stitched slow-craft accessories. Once a drop sells out, it is gone!
        </p>
      </div>

      {/* Control panel (Search & Sort) */}
      <div className="mt-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-white border border-brand-pink/30 rounded-2xl p-4 shadow-xs">
        
        {/* Search Input bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/60" />
          <input
            type="text"
            placeholder="Search by product name or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-cream/70 border border-brand-pink/80 rounded-full pl-10 pr-4 py-2.5 text-xs text-brand-dark placeholder-brand-dark/65 focus:outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta"
          />
        </div>

        {/* Sorting Dropdown selector */}
        <div className="flex gap-3 w-full md:w-auto items-center justify-end">
          <span className="text-xs font-semibold text-brand-dark/85 uppercase tracking-wider">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-brand-cream/70 border border-brand-pink/80 rounded-full px-4 py-2 text-xs text-brand-dark font-medium focus:outline-none focus:border-brand-terracotta cursor-pointer"
          >
            <option value="newest">Newest Drop</option>
            <option value="popularity">Popularity (Rating)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

      </div>

      {/* Grid containing Filters sidebar and Product Listing */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* FILTERS SIDEBAR */}
        <aside className="col-span-1 bg-white border border-brand-pink/30 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
          
          <div className="flex justify-between items-center border-b border-brand-pink/20 pb-4">
            <h3 className="font-serif text-lg font-semibold text-brand-dark flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-terracotta" /> Filters
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[10px] uppercase font-bold text-brand-terracotta hover:underline focus:outline-none"
            >
              Clear All
            </button>
          </div>

          {/* Category Filters */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-dark/95 mb-3">Category</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`text-left text-xs py-1.5 px-3 rounded-lg font-medium transition-all ${
                  selectedCategory === '' 
                    ? 'bg-brand-pink text-brand-terracotta font-semibold' 
                    : 'text-brand-dark/85 hover:bg-brand-cream'
                }`}
              >
                All Accessories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left text-xs py-1.5 px-3 rounded-lg font-medium transition-all ${
                    selectedCategory === cat 
                      ? 'bg-brand-pink text-brand-terracotta font-semibold' 
                      : 'text-brand-dark/85 hover:bg-brand-cream'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider Filter */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-dark/95">Max Price</h4>
              <span className="text-xs font-bold text-brand-terracotta">${priceRange}</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1 bg-brand-pink rounded-lg appearance-none cursor-pointer accent-brand-terracotta"
            />
            <div className="flex justify-between text-[10px] text-brand-dark/65 font-semibold mt-1">
              <span>$20</span>
              <span>$100</span>
            </div>
          </div>

          {/* Fabric Print Filters */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-dark/95 mb-3">Fabric / Print</h4>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedFabric('')}
                className={`text-xs px-2.5 py-1.5 rounded-full border transition-all ${
                  selectedFabric === ''
                    ? 'bg-brand-dark text-white border-brand-dark font-medium'
                    : 'bg-white border-brand-pink/85 text-brand-dark/85 hover:border-brand-terracotta/60'
                }`}
              >
                All Prints
              </button>
              {fabrics.map((fab) => (
                <button
                  key={fab}
                  onClick={() => setSelectedFabric(fab)}
                  className={`text-xs px-2.5 py-1.5 rounded-full border transition-all ${
                    selectedFabric === fab
                      ? 'bg-brand-dark text-white border-brand-dark font-medium'
                      : 'bg-white border-brand-pink/85 text-brand-dark/85 hover:border-brand-terracotta/60'
                  }`}
                >
                  {fab}
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* PRODUCTS LIST GRID */}
        <main className="col-span-1 lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-brand-pink/40 p-5 rounded-2xl h-[340px] animate-pulse flex flex-col justify-end gap-3">
                  <div className="h-4 w-1/4 bg-slate-200 rounded" />
                  <div className="h-6 w-3/4 bg-slate-200 rounded" />
                  <div className="h-4 w-1/2 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-brand-pink/30 rounded-2xl py-16 px-4 text-center flex flex-col items-center shadow-xs">
              <p className="font-serif text-lg text-brand-dark/95">No products match your current filters.</p>
              <p className="text-xs text-brand-dark/75 mt-1 mb-6">Try resetting filters or checking spelling.</p>
              <button
                onClick={handleResetFilters}
                className="btn btn-primary"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
