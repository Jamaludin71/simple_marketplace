# 🚀 Panduan Deployment - Marketplace Application

Panduan lengkap untuk deploy aplikasi marketplace Next.js ke production menggunakan Vercel.

## 📋 Prerequisites

- [x] Akun GitHub
- [ ] Akun Vercel (gratis) - [Daftar di sini](https://vercel.com/signup)
- [ ] Akun Supabase (gratis) - [Daftar di sini](https://supabase.com)
- [ ] Akun Cloudinary (gratis) - [Daftar di sini](https://cloudinary.com/users/register/free)

---

## 🗄️ Step 1: Setup Database (Supabase)

### 1.1 Create PostgreSQL Database

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Klik **"New Project"**
3. Isi detail project:
   - **Name:** `marketplace-db` (atau nama lain)
   - **Database Password:** Buat password yang kuat (SAVE INI!)
   - **Region:** Singapore (atau terdekat)
4. Klik **"Create new project"** dan tunggu ~2 menit

### 1.2 Get Database Connection String

1. Di Supabase project, klik **Settings** → **Database**
2. Scroll ke **Connection string** → pilih **"URI"**
3. Copy connection string (format: `postgresql://postgres:[YOUR-PASSWORD]@...`)
4. Replace `[YOUR-PASSWORD]` dengan password yang Anda buat tadi
5. **SAVE** connection string ini untuk nanti

> **Connection string format:**
>
> ```
> postgresql://postgres.xxxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
> ```

---

## 🖼️ Step 2: Setup Cloudinary (Image Upload)

### 2.1 Get Cloudinary Credentials

1. Login ke [Cloudinary Console](https://console.cloudinary.com)
2. Di Dashboard, Anda akan lihat:
   - **Cloud Name**
   - **API Key**
   - **API Secret** (klik icon "eye" untuk show)
3. **SAVE** ketiga credential ini

---

## 🔐 Step 3: Generate NextAuth Secret

Buka terminal dan jalankan:

```bash
# Generate random secret
openssl rand -base64 32
```

Atau gunakan online generator: https://generate-secret.vercel.app/32

**SAVE** secret yang dihasilkan.

---

## 📦 Step 4: Deploy ke Vercel

### 4.1 Import GitHub Repository

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **"Add New..."** → **"Project"**
3. Klik **"Import Git Repository"**
4. Pilih repository `tugas-pkk-marketplace` (atau nama repo Anda)
5. Klik **"Import"**

### 4.2 Configure Project

Di halaman "Configure Project":

1. **Framework Preset:** Terdeteksi otomatis sebagai "Next.js" ✅
2. **Root Directory:** `.` (biarkan default)
3. **Build Command:** `prisma generate && next build` (otomatis dari `vercel.json`)
4. **Install Command:** `npm install` (otomatis dari `vercel.json`)

### 4.3 Set Environment Variables

Klik **"Environment Variables"** dan tambahkan:

| Name                                | Value                      | Source                       |
| ----------------------------------- | -------------------------- | ---------------------------- |
| `DATABASE_URL`                      | `postgresql://postgres...` | Dari Supabase Step 1.2       |
| `NEXTAUTH_URL`                      | _Kosongkan dulu_           | Will update after deployment |
| `NEXTAUTH_SECRET`                   | `xxx...`                   | Dari Step 3                  |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `your-cloud-name`          | Dari Cloudinary Step 2.1     |
| `CLOUDINARY_API_KEY`                | `123456789`                | Dari Cloudinary Step 2.1     |
| `CLOUDINARY_API_SECRET`             | `xxx...`                   | Dari Cloudinary Step 2.1     |

> **Tips:** Copy-paste dengan hati-hati, jangan ada space di awal/akhir!

### 4.4 Deploy!

1. Klik **"Deploy"** button
2. Tunggu ~2-3 menit
3. Jika sukses, Anda akan lihat 🎉 celebration animation
4. Klik **"Visit"** untuk lihat deployed site
5. **COPY** URL deployment (contoh: `https://tugas-pkk-marketplace.vercel.app`)

---

## 🔧 Step 5: Update Environment Variables

### 5.1 Set NEXTAUTH_URL

1. Di Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Find `NEXTAUTH_URL` variable
3. Klik **Edit**
4. Set value = URL deployment Anda (contoh: `https://tugas-pkk-marketplace.vercel.app`)
5. Klik **Save**

### 5.2 Redeploy

Setelah update env var, trigger redeploy:

1. Go to **Deployments** tab
2. Klik menu **"..."** pada latest deployment
3. Klik **"Redeploy"**
4. Tunggu selesai

---

## 🗃️ Step 6: Setup Database Schema & Seed Data

### 6.1 Run Database Migration

Kita perlu setup schema di production database:

**Option A: Via Vercel CLI (Recommended)**

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Login:

   ```bash
   vercel login
   ```

3. Link project:

   ```bash
   cd c:\Users\dzaky\OneDrive\Dokumen\tugas-PKK\marketplace
   vercel link
   ```

4. Pull environment variables:

   ```bash
   vercel env pull .env.production
   ```

5. Run migration dengan production DATABASE_URL:

   ```bash
   # Set env var sementara
   $env:DATABASE_URL = (Get-Content .env.production | Select-String "DATABASE_URL" | ForEach-Object { $_.ToString().Split('=')[1] })

   # Run migration
   npx prisma migrate deploy

   # Run seeding
   npx prisma db seed
   ```

**Option B: Manual via Supabase SQL Editor**

1. Buka Supabase Dashboard → **SQL Editor**
2. Jalankan migration SQL dari file `prisma/schema.prisma`
3. Manual insert seed data

### 6.2 Verify Database

Di Supabase Dashboard → **Table Editor**, check apakah table sudah ada:

- User
- Product
- Category
- Order
- OrderItem
- CartItem

---

## ✅ Step 7: Testing Production

### 7.1 Visit Homepage

1. Buka deployment URL: `https://your-app.vercel.app`
2. **Expected:** Homepage muncul dengan produk listing

### 7.2 Test Authentication

1. Klik **"Login"**
2. Test login dengan default admin account:
   - Email: `admin@marketplace.com`
   - Password: `admin123`
3. **Expected:** Berhasil login, redirect ke homepage

### 7.3 Test Image Upload

1. Login sebagai seller atau admin
2. Go to **Seller Dashboard** → **Products** → **Add Product**
3. Upload test image
4. **Expected:** Image berhasil upload ke Cloudinary

### 7.4 Test Database

1. Go to **Products** page
2. **Expected:** Produk dari seed data muncul
3. Click salah satu produk
4. **Expected:** Product detail page muncul

---

## 🐛 Troubleshooting

### Error: "PrismaClient is unable to connect to database"

**Cause:** DATABASE_URL salah atau database belum setup

**Fix:**

1. Verify DATABASE_URL di Vercel env vars
2. Test connection di Supabase: Settings → Database → Connection pooler (enabled?)
3. Re-run migration: `npx prisma migrate deploy`

---

### Error: "Failed to upload image"

**Cause:** Cloudinary credentials salah

**Fix:**

1. Verify credentials di Vercel env vars
2. Check Cloudinary console: Settings → Upload → Unsigned uploading (enabled?)
3. Redeploy after fixing env vars

---

### Error: "NextAuth callback error"

**Cause:** NEXTAUTH_URL tidak match dengan deployment URL

**Fix:**

1. Ensure NEXTAUTH_URL = exact deployment URL
2. No trailing slash di URL
3. Redeploy after update

---

### Build Error: "Cannot find module '@prisma/client'"

**Cause:** Prisma generate belum jalan sebelum build

**Fix:**

1. Verify `vercel.json` ada di root project
2. Check buildCommand = `prisma generate && next build`
3. Redeploy

---

## 🎯 Custom Domain (Optional)

Jika Anda punya domain sendiri:

1. Vercel Dashboard → Project → **Settings** → **Domains**
2. Klik **"Add"**
3. Input domain Anda (contoh: `marketplace.yourdomain.com`)
4. Follow DNS configuration instructions
5. Update `NEXTAUTH_URL` ke domain baru
6. Redeploy

---

## 📊 Monitoring

### Vercel Analytics (Free)

1. Vercel Dashboard → Project → **Analytics**
2. Lihat page views, response times, errors

### Supabase Database Logs

1. Supabase Dashboard → **Logs**
2. Monitor queries, errors, slow queries

---

## 🔒 Security Checklist

- [x] `.env` file **TIDAK** masuk ke GitHub (sudah ada di `.gitignore`)
- [x] All secrets stored di Vercel Environment Variables
- [x] Database password yang kuat
- [x] NEXTAUTH_SECRET random & secure
- [ ] **Recommendation:** Enable 2FA di GitHub, Vercel, Supabase

---

## 📚 Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Production Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🆘 Need Help?

Jika ada masalah deployment:

1. Check Vercel deployment logs: **Deployments** → Click deployment → **Logs**
2. Check browser console (F12) untuk frontend errors
3. Check Supabase logs untuk database issues
4. Contact support atau ask di komunitas:
   - [Vercel Discord](https://vercel.com/discord)
   - [Next.js Discussions](https://github.com/vercel/next.js/discussions)

---

**Good luck with your deployment! 🚀**
