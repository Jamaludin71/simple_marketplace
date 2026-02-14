# 📝 Langkah-langkah Push ke GitHub

Ikuti panduan step-by-step ini untuk push code Anda ke GitHub.

---

## ✅ Status Saat Ini

- ✅ Git repository sudah initialized
- ✅ Semua files sudah di-commit
- ✅ Total: 110 files, 19,229 baris code
- ✅ File `.env` sudah di-ignore (tidak akan ke-upload)

**Commit terakhir:**

```
bb6cbe0 - Initial commit: Marketplace Next.js application with authentication, product management, and seller dashboard
```

---

## 🚀 Langkah Selanjutnya

### Step 1: Create GitHub Repository

1. **Buka GitHub** di browser: https://github.com/new

2. **Isi form repository:**
   - **Repository name:** `tugas-pkk-marketplace` (atau nama lain yang Anda inginkan)
   - **Description:** `E-commerce marketplace built with Next.js, Prisma, and NextAuth`
   - **Visibility:** Pilih **Public** atau **Private** (terserah Anda)
   - ⚠️ **JANGAN centang:** "Add a README file"
   - ⚠️ **JANGAN centang:** "Add .gitignore"
   - ⚠️ **JANGAN pilih:** License

3. **Klik** tombol **"Create repository"**

4. **COPY** URL repository yang muncul:
   - Format HTTPS: `https://github.com/USERNAME/tugas-pkk-marketplace.git`
   - Replace `USERNAME` dengan username GitHub Anda

---

### Step 2: Connect Local Repo ke GitHub

Setelah repository GitHub dibuat, jalankan command berikut di terminal:

#### 2.1 Add Remote Origin

```bash
git remote add origin https://github.com/USERNAME/REPO_NAME.git
```

**Contoh (ganti dengan URL Anda):**

```bash
git remote add origin https://github.com/dzaky/tugas-pkk-marketplace.git
```

#### 2.2 Rename Branch ke "main"

```bash
git branch -M main
```

#### 2.3 Push ke GitHub

```bash
git push -u origin main
```

**Output yang diharapkan:**

```
Enumerating objects: 125, done.
Counting objects: 100% (125/125), done.
Delta compression using up to 8 threads
Compressing objects: 100% (115/115), done.
Writing objects: 100% (125/125), 1.23 MiB | 450.00 KiB/s, done.
Total 125 (delta 15), reused 0 (delta 0), pack-reused 0
To https://github.com/USERNAME/REPO_NAME.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

### Step 3: Verify di GitHub

1. **Buka** repository di browser: `https://github.com/USERNAME/REPO_NAME`

2. **Check apakah semua files sudah ada:**
   - ✅ `app/` folder
   - ✅ `components/` folder
   - ✅ `README.md`
   - ✅ `package.json`
   - ✅ `vercel.json`
   - ✅ `docs/DEPLOYMENT_GUIDE.md`
   - ❌ `.env` (harus TIDAK ada - ini rahasia!)

3. **Verify:** Klik beberapa files untuk pastikan contents-nya benar

---

## 🔐 Security Check

**PENTING! Verify bahwa file `.env` TIDAK ada di GitHub:**

1. Di repository GitHub, coba search file `.env`
2. Harusnya **NOT FOUND** ✅
3. Yang seharusnya ada: `.env.example` ✅

> **Mengapa?** File `.env` berisi secrets (database password, API keys) yang tidak boleh di-share publicly!

---

## 🎯 Next Steps: Deploy ke Vercel

Setelah code berhasil di-push ke GitHub, Anda bisa deploy ke Vercel:

1. **Buka panduan deployment:**
   - File: `docs/DEPLOYMENT_GUIDE.md`
   - Sudah ada di repository Anda

2. **Ikuti step-by-step guide** di sana untuk:
   - Setup Supabase database (gratis)
   - Setup Cloudinary (gratis)
   - Deploy ke Vercel (gratis)
   - Configure environment variables
   - Test production deployment

---

## 🆘 Troubleshooting

### Error: "failed to push some refs"

**Cause:** Biasanya karena repository GitHub tidak kosong

**Fix:**

```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

### Error: "remote origin already exists"

**Cause:** Sudah pernah run `git remote add origin` sebelumnya

**Fix:**

```bash
# Hapus origin lama
git remote remove origin

# Add origin baru
git remote add origin https://github.com/USERNAME/REPO_NAME.git
```

---

### Error: "Authentication failed"

**Cause:** GitHub sekarang tidak support password authentication

**Fix:** Gunakan GitHub Personal Access Token

1. Buka: https://github.com/settings/tokens
2. Klik **"Generate new token"** → **"Generate new token (classic)"**
3. Beri nama: `marketplace-deployment`
4. Check: `repo` (full control)
5. Klik **"Generate token"**
6. **COPY** token (hanya muncul 1x!)
7. Saat git push minta password, paste **token** (bukan password GitHub Anda)

---

## ✨ Selamat!

Jika push berhasil, code Anda sudah aman di GitHub! 🎉

**Selanjutnya:** Deploy ke Vercel menggunakan `docs/DEPLOYMENT_GUIDE.md`
