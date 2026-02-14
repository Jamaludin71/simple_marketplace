# Product Image Management - Quick Start Guide

## 📁 1. Folder Structure (✅ Sudah Dibuat)

Lokasi folder untuk menyimpan gambar produk:

```
marketplace/
└── public/
    └── images/
        └── products/
            └── (taruh gambar produk di sini)
```

Anda bisa langsung copy-paste gambar produk ke folder `public/images/products/`.

---

## 🔄 2. Update Gambar Produk yang Sudah Ada

### Cara 1: Gunakan Script Otomatis

File: [`scripts/update-product-images.ts`](file:///c:/Users/dzaky/OneDrive/Dokumen/tugas-PKK/marketplace/scripts/update-product-images.ts)

1. Edit file script, sesuaikan array `productImages` dengan data produk Anda:

   ```typescript
   const productImages = [
     {
       productName: "Nama Produk",
       imageUrl: "https://example.com/image.jpg", // atau '/images/products/image.jpg'
     },
     // tambahkan produk lainnya...
   ];
   ```

2. Jalankan script:
   ```bash
   npx ts-node scripts/update-product-images.ts
   ```

### Cara 2: Manual via Prisma Studio

1. Buka Prisma Studio:

   ```bash
   npx prisma studio
   ```

2. Pilih tabel `Product`
3. Edit field `image` dengan URL atau path gambar

---

## 📤 3. Upload Gambar di Seller Dashboard

Component `ImageUpload` sudah terintegrasi di:

- ✅ **Create Product**: `/seller/products/new`
- ✅ **Edit Product**: `/seller/products/[id]/edit`

### Cara Menggunakan:

1. Buka halaman Create/Edit Product di seller dashboard
2. Klik tombol "Upload Gambar"
3. Pilih file gambar (JPG, PNG, atau WebP max 5MB)
4. Gambar akan diupload dan preview otomatis muncul
5. Submit form untuk menyimpan produk dengan gambar

### Metode Upload:

Component mendukung 2 metode:

- **Local Upload** (default): Gambar disimpan di `public/images/products/`
- **Cloudinary**: Jika tersedia dan dikonfigurasi

Untuk mengubah metode, edit component `ImageUpload` dengan prop `useLocal`:

```tsx
<ImageUpload useLocal={true} /> // Local
<ImageUpload useLocal={false} /> // Cloudinary
```

---

## 🖼️ Format Gambar yang Direkomendasikan

- **Ukuran**: 800x1200px (ratio 3:4 untuk tampilan portrait)
- **Format**: JPG, PNG, atau WebP
- **Ukuran File**: Maksimal 5MB
- **Nama File**: Akan di-generate otomatis dengan UUID

---

## 🔍 Troubleshooting

**Q: Gambar tidak muncul setelah upload?**

- Pastikan path gambar benar dimulai dengan `/images/products/`
- Cek folder `public/images/products/` apakah file ada
- Refresh halaman browser

**Q: Upload gagal?**

- Pastikan ukuran file tidak lebih dari 5MB
- Pastikan format file adalah JPG, PNG, atau WebP
- Cek console browser untuk error detail

**Q: Mau ganti dari local ke Cloudinary?**

- Edit component ImageUpload, ubah `useLocal={false}`
- Pastikan Cloudinary sudah dikonfigurasi dengan upload preset

---

## 📝 File-file yang Dibuat

1. ✅ `public/images/products/` - Folder untuk gambar
2. ✅ `scripts/update-product-images.ts` - Script update bulk
3. ✅ `app/api/upload/route.ts` - API endpoint upload
4. ✅ `components/image-upload.tsx` - Component upload (updated)
