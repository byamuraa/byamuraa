import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    category: { type: String, required: true },
    fabric: { type: String, required: true }, // e.g., Pink Leopard Print, Mauve Check
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, enum: ['active', 'draft', 'soldout'], default: 'active' },
    isNewDrop: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    images: { type: [Schema.Types.Mixed], required: true }, // Supports legacy string[] and newer [{url, publicId}][]
    description: { type: String, required: true },
    dimensions: { type: String, default: '' },
    careInstructions: { type: String, default: '' },
    liningColor: { type: String, default: '' },
    zipperType: { type: String, default: '' },
    strapType: { type: String, default: '' },
    variants: [{
      name: { type: String },
      options: [{
        label: { type: String },
        stock: { type: Number, default: 0 }
      }]
    }],
    seo: {
      metaTitle: { type: String, default: '' },
      metaDesc: { type: String, default: '' }
    },
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false }, // Legacy storefront support
  },
  { timestamps: true }
);

// Pre-save hook to auto-generate slug
ProductSchema.pre('save', function () {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
