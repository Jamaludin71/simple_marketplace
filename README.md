# Marketplace - Elegant E-Commerce Platform

Marketplace aplikasi e-commerce modern dengan desain klasik dan elegan menggunakan Next.js, TypeScript, Prisma, dan PostgreSQL.

## ✨ Features

### 🎨 Design System

- **Typography**: Playfair Display (serif) untuk heading, Inter untuk body text
- **Color Palette**: Rich black, warm taupe, gold accents pada warm white background
- **Aesthetic**: Classic, sophisticated, dengan smooth transitions dan hover effects

### 👥 User Roles

- **Buyer**: Dapat browse produk, add to cart, checkout
- **Seller**: Dapat manage produk, orders, dan inventory
- **Admin**: Full access ke semua fitur termasuk user management

### 📦 Product Management

- Upload gambar produk (local atau Cloudinary)
- Kategori produk
- Stock management
- Product status (Active/Inactive)

### 🛒 Shopping Features

- Product browsing dengan filter
- Add to cart
- Checkout dengan shipping address
- Order tracking
- Payment proof upload

### 🔐 Authentication

- Email/password authentication dengan NextAuth.js
- Elegant split-screen login/register pages
- Role-based access control

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL dengan Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand
- **Image Upload**: Local storage + Cloudinary support

## 📁 Project Structure

```
marketplace/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   ├── api/                 # API routes
│   ├── admin/               # Admin dashboard
│   ├── seller/              # Seller dashboard
│   ├── products/            # Product pages
│   └── categories/          # Category pages
├── components/              # React components
├── lib/                     # Utilities
├── prisma/                  # Database schema
├── public/                  # Static assets
│   └── images/products/     # Product images
├── scripts/                 # Utility scripts
└── docs/                    # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm atau yarn

### Installation

1. Clone repository

```bash
git clone <repository-url>
cd marketplace
```

2. Install dependencies

```bash
npm install
```

3. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` dan isi dengan kredensial Anda:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/marketplace"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3007"
```

4. Setup database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. Run development server

```bash
npm run dev
```

Buka [http://localhost:3007](http://localhost:3007) di browser.

## 📸 Image Upload

Aplikasi mendukung 2 metode upload gambar:

### Local Upload (Default)

Gambar disimpan di `public/images/products/`

### Bulk Update Gambar

```bash
npx ts-node scripts/update-product-images-local.ts
```

Lihat [IMAGE_UPLOAD_GUIDE.md](docs/IMAGE_UPLOAD_GUIDE.md) untuk detail lengkap.

## 🗄️ Database Schema

- **User**: User accounts dengan roles (BUYER/SELLER/ADMIN)
- **Product**: Product listings dengan kategori dan gambar
- **Category**: Product categories
- **CartItem**: Shopping cart items
- **Order**: Order records
- **OrderItem**: Individual items dalam order

## 🎯 Default Credentials

Setelah seed database:

**Admin**

- Email: admin@marketplace.com
- Password: admin123

**Seller**

- Email: seller@marketplace.com
- Password: seller123

**Buyer**

- Email: buyer@marketplace.com
- Password: buyer123

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server

# Database
npx prisma studio    # Open Prisma Studio GUI
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema to database

# Image management
npx ts-node scripts/update-product-images-local.ts

# Build
npm run build        # Build production
npm start            # Start production server
```

## 🌟 Key Features Implemented

- ✅ Elegant authentication pages dengan split-screen design
- ✅ Product image upload (local & Cloudinary support)
- ✅ Bulk image update script
- ✅ Role-based dashboards (Admin, Seller, Buyer)
- ✅ Shopping cart dengan Zustand
- ✅ Order management system
- ✅ Responsive design untuk mobile
- ✅ Classic, sophisticated UI design

## 📄 License

MIT

## 👨‍💻 Developer

Developed as part of PKK assignment
