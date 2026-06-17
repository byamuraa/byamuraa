# Amuraa Admin Portal & Product Management Guide

Welcome to the Amuraa Admin Portal! This guide contains everything you need to know about logging in, managing products, tracking orders, and configuring external integrations like Cloudinary.

---

## 🔑 Authentication & Access

### Accessing the Portal
- **Login URL**: `/admin/login` (e.g., `http://localhost:3000/admin/login` when running locally).
- **Dashboard URL**: `/admin` (accessible only after successful login).

### Environment Configuration (`.env`)
To log in, define the following variables in your `.env` or `.env.local` file:
```env
ADMIN_EMAIL=admin@amuraa.com
ADMIN_PASSWORD=adminpassword123
JWT_SECRET=your_jwt_secret_key_here
```

### Route Protection
All `/admin/*` routes (except `/admin/login`) are protected by a secure cookie-based middleware guard (`middleware.ts`). Attempting to access the admin pages without a valid JWT token will automatically redirect you to the storefront homepage.

---

## 📊 Admin Dashboard Overview

Once logged in, the admin homepage provides a high-level overview of your e-commerce operations:
- **Metrics Grid**: Displays total products, total orders, out of stock count, and total revenue.
- **Recent Orders**: Lists the latest customer orders with full details (fulfillment status, transaction details, and items).
- **Low Stock Alerts**: Displays badge indicators in the sidebar highlighting items with stock levels $\le$ 3.

---

## 📦 Product Catalog Management

Manage your slow-craft inventory from the **All Products** view (`/admin/products`):
1. **Search & Filter**: Search products by name, filter by status (`Active` or `Draft`), and sort by price, date, or stock level.
2. **Inline Stock Updates**: Double-click or click the edit icon on the stock cell in the table to modify inventory values instantly. Press **Enter** or click the checkmark to save the new stock level, which will immediately update the database and storefront.
3. **Delete Products**: Remove products with a double-confirmation modal. Order history is preserved via static snapshot caching in the database.

---

## 📝 Add/Edit Product Workflows

The product form (`/admin/products/new` and `/admin/products/edit/[id]`) supports advanced, creator-friendly workflows:

### 1. Media Upload (Cloudinary)
- **Drag-and-Drop Uploader**: Drop multiple images directly into the upload box or browse files.
- **Reordering**: Drag and drop uploaded image previews to adjust their ordering.
- **Cloudinary Integration**: Images are uploaded directly to Cloudinary.
- **Local Development Fallback**: If Cloudinary API credentials are not set in `.env`, the system automatically falls back to generating local mock placeholders so you can test the form layout without any setup.

To enable production uploads, configure these in `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Rich Text Description
- Powered by a custom **React-Quill** editor for formatting fabric details, sizing recommendations, and craft narratives.

### 3. SEO Settings (Collapsible)
- Configure custom meta titles, description tags, and URLs.
- A clean URL slug is automatically generated from the product name if left blank.

### 4. Data Loss Prevention
- **Auto-Save Drafts**: The form automatically saves your progress locally every 30 seconds.
- **Unsaved Changes Warning**: If you attempt to navigate away from the form with unsaved changes, the browser will prompt you to confirm before losing data.

---

## 🔄 Storefront Synchronization Rules

- **Draft Status**: Products marked as `Draft` are hidden from all storefront collections, searches, and recommendations.
- **Out of Stock**: When stock levels reach `0`, storefront calls to action automatically change from "Pre-Order" to "Sold Out".
- **Badges**: Flagging products with `isNewDrop` or `isBestseller` displays corresponding badges on the shop page.
