import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script untuk update gambar produk yang sudah ada
 * 
 * Cara menggunakan:
 * 1. Edit array `productImages` di bawah dengan data produk Anda
 * 2. Jalankan: npx ts-node scripts/update-product-images.ts
 */

// Sample product images - edit sesuai kebutuhan
const productImages = [
  {
    productName: 'Laptop Gaming ROG',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=1200&fit=crop'
  },
  {
    productName: 'iPhone 13 Pro',
    imageUrl: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&h=1200&fit=crop'
  },
  {
    productName: 'Samsung Galaxy S22',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=1200&fit=crop'
  },
  {
    productName: 'MacBook Pro M1',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=1200&fit=crop'
  },
  {
    productName: 'Sony WH-1000XM4',
    imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&h=1200&fit=crop'
  },
  {
    productName: 'iPad Pro 2021',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=1200&fit=crop'
  },
  // Tambahkan produk lainnya di sini
]

async function updateProductImages() {
  console.log('🔄 Memulai update gambar produk...\n')
  
  let successCount = 0
  let failCount = 0

  for (const item of productImages) {
    try {
      // Cari produk berdasarkan nama (case insensitive)
      const product = await prisma.product.findFirst({
        where: {
          name: {
            contains: item.productName,
            mode: 'insensitive'
          }
        }
      })

      if (!product) {
        console.log(`❌ Produk tidak ditemukan: ${item.productName}`)
        failCount++
        continue
      }

      // Update gambar produk
      await prisma.product.update({
        where: { id: product.id },
        data: { image: item.imageUrl }
      })

      console.log(`✅ Berhasil update: ${product.name}`)
      successCount++
    } catch (error) {
      console.error(`❌ Gagal update ${item.productName}:`, error)
      failCount++
    }
  }

  console.log(`\n📊 Ringkasan:`)
  console.log(`   ✅ Berhasil: ${successCount}`)
  console.log(`   ❌ Gagal: ${failCount}`)
  console.log(`   📦 Total: ${productImages.length}`)
}

// Jalankan script
updateProductImages()
  .then(() => {
    console.log('\n✨ Selesai!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
