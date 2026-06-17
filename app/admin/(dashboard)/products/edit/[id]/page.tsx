'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import dynamic from 'next/dynamic';
import { 
  Upload, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowLeft,
  X,
  FileText,
  Clock,
  MoveLeft,
  MoveRight
} from 'lucide-react';
import Image from 'next/image';

// Dynamically import ReactQuill to prevent SSR window reference crashes
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Schema validation
const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters long'),
  category: z.string().min(1, 'Please select a category'),
  fabric: z.string().min(3, 'Fabric print details are required'),
  price: z.number().min(1, 'Price must be greater than 0'),
  compareAtPrice: z.number().optional().default(0),
  stock: z.number().min(0, 'Stock cannot be negative'),
  status: z.enum(['active', 'draft', 'soldout']),
  isNewDrop: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  dimensions: z.string().optional().default(''),
  careInstructions: z.string().optional().default(''),
  liningColor: z.string().optional().default(''),
  zipperType: z.string().optional().default(''),
  strapType: z.string().min(1, 'Please select a strap configuration'),
  seo: z.object({
    metaTitle: z.string().optional().default(''),
    metaDesc: z.string().optional().default('')
  })
});

type ProductFormInput = z.infer<typeof productSchema>;

const categories = [
  'Puffer Tote Bags',
  'Heart Print Mini Bags',
  'Striped Ruffle-Strap Shoulder Bags',
  'AirPod Bags / Small Pouches',
  'Makeup Pouches',
  'Indigo Block-Print Organizer Pouches',
  'Other'
];

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const { showToast } = useToast();
  
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; publicId: string }>>([]);
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [timestamps, setTimestamps] = useState<{ createdAt?: string; updatedAt?: string }>({});

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<z.input<typeof productSchema>, any, z.output<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: 'Puffer Tote Bags',
      fabric: '',
      price: 0,
      compareAtPrice: 0,
      stock: 0,
      status: 'active',
      isNewDrop: false,
      isBestseller: false,
      description: '',
      dimensions: '',
      careInstructions: '',
      liningColor: '',
      zipperType: '',
      strapType: 'Top Handle',
      seo: { metaTitle: '', metaDesc: '' }
    }
  });

  const watchName = watch('name');
  const watchDescription = watch('description');

  // Load product on mount
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoadingProduct(true);
        const res = await fetch(`/api/admin/products/${id}`);
        const data = await res.json();
        
        if (res.ok && data.product) {
          const prod = data.product;
          
          // Map to images array safely (supporting legacy string strings)
          const formattedImages = prod.images.map((img: any, idx: number) => {
            if (typeof img === 'string') {
              return { url: img, publicId: `legacy_${idx}` };
            }
            return img;
          });

          setUploadedImages(formattedImages);
          setTimestamps({
            createdAt: prod.createdAt,
            updatedAt: prod.updatedAt
          });

          reset({
            name: prod.name,
            category: prod.category,
            fabric: prod.fabric,
            price: prod.price,
            compareAtPrice: prod.compareAtPrice || 0,
            stock: prod.stock,
            status: prod.status || 'active',
            isNewDrop: !!prod.isNewDrop,
            isBestseller: !!prod.isBestseller,
            description: prod.description,
            dimensions: prod.dimensions || '',
            careInstructions: prod.careInstructions || '',
            liningColor: prod.liningColor || '',
            zipperType: prod.zipperType || '',
            strapType: prod.strapType || 'Top Handle',
            seo: {
              metaTitle: prod.seo?.metaTitle || '',
              metaDesc: prod.seo?.metaDesc || ''
            }
          });
        } else {
          showToast('Product data not found.', 'error');
          router.push('/admin/products');
        }
      } catch (err) {
        showToast('Failed to load product details.', 'error');
      } finally {
        setLoadingProduct(false);
      }
    }
    loadProduct();
  }, [id, reset]);

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Image upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingFiles(true);
    const limit = 8;
    const currentCount = uploadedImages.length;
    const remaining = limit - currentCount;

    if (files.length > remaining) {
      showToast(`You can only upload a maximum of ${limit} images.`, 'error');
    }

    const filesToUpload = Array.from(files).slice(0, remaining);

    for (const file of filesToUpload) {
      const fd = new FormData();
      fd.append('file', file);
      
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: fd
        });
        const data = await res.json();
        
        if (res.ok) {
          if (data.warning) {
            showToast(data.warning, 'info');
          }
          setUploadedImages(prev => [...prev, { url: data.url, publicId: data.publicId }]);
        } else {
          showToast(data.error || 'Failed to upload image.', 'error');
        }
      } catch (err) {
        showToast('Image upload failed.', 'error');
      }
    }
    setUploadingFiles(false);
  };

  // Delete uploaded image
  const handleDeleteUploadedImage = async (publicId: string, idx: number) => {
    // If it is legacy string path, just delete local state
    if (publicId.startsWith('legacy_')) {
      setUploadedImages(prev => prev.filter((_, i) => i !== idx));
      showToast('Legacy image removed from catalog.', 'success');
      return;
    }

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId })
      });
      if (res.ok) {
        setUploadedImages(prev => prev.filter((_, i) => i !== idx));
        showToast('Image removed.', 'success');
      } else {
        showToast('Failed to delete image.', 'error');
      }
    } catch (err) {
      showToast('Image deletion failed.', 'error');
    }
  };

  // Reordering images left/right
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const nextIndex = direction === 'left' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= uploadedImages.length) return;

    const list = [...uploadedImages];
    const temp = list[index];
    list[index] = list[nextIndex];
    list[nextIndex] = temp;
    setUploadedImages(list);
  };

  const onSubmit = async (data: ProductFormInput) => {
    if (uploadedImages.length === 0) {
      showToast('At least one product photo is required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...data,
        images: uploadedImages
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();

      if (res.ok && result.success) {
        showToast('Product updated successfully!', 'success');
        router.push('/admin/products');
      } else {
        showToast(result.error || 'Failed to update product.', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <p className="font-serif text-lg text-brand-dark/50 animate-pulse">
          Loading product editor data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* Header breadcrumb */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-brand-pink/50 rounded-full text-brand-dark/50 hover:text-brand-dark transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-serif text-3xl font-semibold text-brand-dark">Edit Product</h2>
          <p className="text-xs text-brand-dark/50 mt-1">Modify pricing, specifications, and update active stock collections.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Inputs) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Basic Info */}
          <div className="bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-semibold text-brand-dark border-b border-brand-pink/20 pb-2">Basic Info</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Product Name</label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="e.g. Lavender Check Puffer Tote"
                  className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none focus:border-brand-terracotta"
                />
                {errors.name && <p className="text-[10px] text-red-500 font-semibold mt-1 ml-3">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Category</label>
                <select
                  {...register('category')}
                  className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <p className="text-[10px] text-red-500 font-semibold mt-1 ml-3">{errors.category.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Fabric Print Name</label>
                <input
                  {...register('fabric')}
                  type="text"
                  placeholder="e.g. Pink Polka Dot"
                  className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none focus:border-brand-terracotta"
                />
                {errors.fabric && <p className="text-[10px] text-red-500 font-semibold mt-1 ml-3">{errors.fabric.message}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Price ($)</label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  placeholder="Price"
                  className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none focus:border-brand-terracotta"
                />
                {errors.price && <p className="text-[10px] text-red-500 font-semibold mt-1 ml-3">{errors.price.message}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Compare-at Price ($)</label>
                <input
                  {...register('compareAtPrice', { valueAsNumber: true })}
                  type="number"
                  placeholder="Original price"
                  className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none focus:border-brand-terracotta"
                />
              </div>
            </div>
          </div>

          {/* Card: Product Description */}
          <div className="bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-semibold text-brand-dark border-b border-brand-pink/20 pb-2">Description</h3>
            
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-2">Description Content</label>
              <div className="text-xs text-brand-dark">
                <ReactQuill 
                  value={watchDescription} 
                  onChange={(val) => setValue('description', val, { shouldDirty: true })}
                  placeholder="Describe the plush details, zipper styles, inner compartments, and organic cotton craft..."
                  className="bg-brand-cream/10 border border-brand-pink/30 rounded-2xl overflow-hidden min-h-[150px] focus-within:border-brand-terracotta"
                />
              </div>
              {errors.description && <p className="text-[10px] text-red-500 font-semibold mt-1 ml-3">{errors.description.message}</p>}
            </div>
          </div>

          {/* Card: Specifications */}
          <div className="bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-semibold text-brand-dark border-b border-brand-pink/20 pb-2">Specifications</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Dimensions (W x H x D)</label>
                <input
                  {...register('dimensions')}
                  type="text"
                  placeholder='e.g. 14" H x 12" W x 4" D'
                  className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none focus:border-brand-terracotta"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Lining Cotton Color</label>
                <input
                  {...register('liningColor')}
                  type="text"
                  placeholder="e.g. Solid Soft Pink"
                  className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none focus:border-brand-terracotta"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Zipper Setup</label>
                <input
                  {...register('zipperType')}
                  type="text"
                  placeholder="e.g. YKK Brass Zipper"
                  className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none focus:border-brand-terracotta"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Strap Configuration</label>
                <select
                  {...register('strapType')}
                  className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none cursor-pointer"
                >
                  <option value="Top Handle">Top Handle</option>
                  <option value="Shoulder Strap">Shoulder Strap</option>
                  <option value="Both">Both (Handle + Strap)</option>
                  <option value="None">None</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Care Instructions</label>
                <input
                  {...register('careInstructions')}
                  type="text"
                  placeholder="e.g. Hand wash, dry flat"
                  className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none focus:border-brand-terracotta"
                />
              </div>
            </div>
          </div>

          {/* Collapsible SEO */}
          <div className="bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoOpen(!seoOpen)}
              className="w-full flex justify-between items-center text-left focus:outline-none"
            >
              <h3 className="font-serif text-lg font-semibold text-brand-dark flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-terracotta" /> Search Engine Optimization (SEO)
              </h3>
              {seoOpen ? <ChevronUp className="w-5 h-5 text-brand-dark/40" /> : <ChevronDown className="w-5 h-5 text-brand-dark/40" />}
            </button>

            {seoOpen && (
              <div className="mt-6 space-y-4 pt-4 border-t border-brand-pink/20 animate-slide-in-up">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Meta Title</label>
                  <input
                    {...register('seo.metaTitle')}
                    type="text"
                    placeholder={watchName || 'Auto-generated Title'}
                    className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Meta Description</label>
                  <textarea
                    {...register('seo.metaDesc')}
                    rows={3}
                    placeholder="Provide a search snippet summarizing the quilted drop fabric and accessories..."
                    className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-2xl px-4 py-3 text-xs text-brand-dark focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Change log timestamps */}
          <div className="bg-brand-cream/50 rounded-2xl p-4 flex gap-4 text-[10px] text-brand-dark/60 font-semibold border border-brand-pink/20">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-terracotta" />
              <span>Created: {timestamps.createdAt ? new Date(timestamps.createdAt).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-terracotta" />
              <span>Last Modified: {timestamps.updatedAt ? new Date(timestamps.updatedAt).toLocaleString() : 'N/A'}</span>
            </div>
          </div>

        </div>

        {/* Right Column (Images & Actions) */}
        <div className="space-y-6">
          
          {/* Card: Images Upload */}
          <div className="bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-semibold text-brand-dark border-b border-brand-pink/20 pb-2">Product Photos</h3>
            
            {/* Drag Drop Zone */}
            <div className="border-2 border-dashed border-brand-pink hover:border-brand-terracotta rounded-2xl p-6 text-center cursor-pointer relative group transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploadingFiles}
              />
              <Upload className="w-8 h-8 text-brand-terracotta/60 group-hover:text-brand-terracotta mx-auto mb-2 transition-colors" />
              <p className="text-xs font-semibold text-brand-dark/85">Drag files or click to upload</p>
              <p className="text-[9px] text-brand-dark/50 mt-1 font-medium">PNG, JPG, JPEG up to 5MB (Max 8 photos)</p>
            </div>

            {/* Uploading states */}
            {uploadingFiles && (
              <div className="flex items-center justify-center gap-2 py-3 bg-brand-cream/50 rounded-xl animate-pulse">
                <span className="text-[10px] uppercase font-bold text-brand-terracotta">Syncing images to Cloudinary...</span>
              </div>
            )}

            {/* Images list display */}
            {uploadedImages.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block">Manage Uploads</label>
                <div className="grid grid-cols-2 gap-3">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-brand-pink group shadow-xs">
                      <Image
                        src={img.url}
                        alt={`Preview ${idx + 1}`}
                        fill
                        sizes="150px"
                        className="object-cover"
                      />
                      {/* Delete action overlay */}
                      <button
                        type="button"
                        onClick={() => handleDeleteUploadedImage(img.publicId, idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 focus:outline-none transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Cover label */}
                      {idx === 0 && (
                        <span className="absolute bottom-2 left-2 bg-brand-dark text-white text-[8px] font-bold uppercase px-2 py-0.5 rounded-full">
                          Cover
                        </span>
                      )}

                      {/* Reorder controls */}
                      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveImage(idx, 'left')}
                          className="bg-white/80 p-1 rounded hover:bg-white text-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Move left"
                        >
                          <MoveLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === uploadedImages.length - 1}
                          onClick={() => moveImage(idx, 'right')}
                          className="bg-white/80 p-1 rounded hover:bg-white text-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Move right"
                        >
                          <MoveRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card: Status & Stock */}
          <div className="bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-semibold text-brand-dark border-b border-brand-pink/20 pb-2">Status & Badges</h3>
            
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Stock Quantity</label>
              <input
                {...register('stock', { valueAsNumber: true })}
                type="number"
                placeholder="Available items"
                className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none focus:border-brand-terracotta"
              />
              {errors.stock && <p className="text-[10px] text-red-500 font-semibold mt-1 ml-3">{errors.stock.message}</p>}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/85 block mb-1.5">Publish Status</label>
              <select
                {...register('status')}
                className="w-full bg-brand-cream/40 border border-brand-pink/60 rounded-full px-4 py-2.5 text-xs text-brand-dark focus:outline-none cursor-pointer"
              >
                <option value="active">Active (Visible immediately)</option>
                <option value="draft">Draft (Hidden in admin)</option>
                <option value="soldout">Sold Out (Closed orders)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-brand-dark cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isNewDrop')}
                  className="rounded border-brand-pink text-brand-terracotta focus:ring-brand-terracotta"
                />
                <span>Mark as New Drop</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-brand-dark cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isBestseller')}
                  className="rounded border-brand-pink text-brand-terracotta focus:ring-brand-terracotta"
                />
                <span>Mark as Bestseller</span>
              </label>
            </div>
          </div>

          {/* Form Actions Card */}
          <div className="bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-xs space-y-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full"
            >
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setValue('status', 'draft');
                handleSubmit(onSubmit)();
              }}
              className="btn btn-outline w-full"
            >
              Unpublish & Draft
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
