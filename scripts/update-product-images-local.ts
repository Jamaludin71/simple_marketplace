import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script untuk update gambar produk dengan foto yang sudah ada di public/images/
 * 
 * Cara menggunakan:
 * 1. Foto sudah ditaruh di public/images/
 * 2. Jalankan: npx ts-node scripts/update-product-images-local.ts
 */

async function updateProductImages() {
  console.log('🔄 Memulai update gambar produk dari public/images/...\n')
  
  try {
    // Ambil semua produk dari database
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        image: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    if (products.length === 0) {
      console.log('❌ Tidak ada produk di database')
      return
    }

    console.log(`📦 Ditemukan ${products.length} produk\n`)
    console.log('Produk yang ada:')
    products.forEach((p: { id: string; name: string; image: string | null }, i: number) => {
      console.log(`${i + 1}. ${p.name} ${p.image ? '(sudah ada foto)' : '(belum ada foto)'}`)
    })

    console.log('\n' + '='.repeat(60))
    console.log('📸 Foto yang tersedia di public/images/:')
    console.log('='.repeat(60))
    console.log('1. celana cino.webp')
    console.log('2. jaket_bomber.jpg')
    console.log('3. kemeja_flanel.jpg')
    console.log('4. keyboard-mechanical.png')
    console.log('5. laptop_gaming.png')
    console.log('6. mouse wireless.webp')
    console.log('='.repeat(60))

    // Mapping nama produk ke nama file foto (case-insensitive matching)
    const imageMapping: { [key: string]: string } = {
      // Format: 'keywords dalam nama produk': 'nama file'
      'celana': '/images/celana cino.webp',
      'cino': '/images/celana cino.webp',
      'jaket': '/images/jaket_bomber.jpg',
      'bomber': '/images/jaket_bomber.jpg',
      'kemeja': '/images/kemeja_flanel.jpg',
      'flanel': '/images/kemeja_flanel.jpg',
      'keyboard': '/images/keyboard-mechanical.png',
      'mechanical': '/images/keyboard-mechanical.png',
      'laptop': '/images/laptop_gaming.png',
      'gaming': '/images/laptop_gaming.png',
      'mouse': '/images/mouse wireless.webp',
      'wireless': '/images/mouse wireless.webp',
    }

    let successCount = 0
    let skipCount = 0

    console.log('\n🔄 Memulai update...\n')

    for (const product of products) {
      // Cari foto yang cocok berdasarkan nama produk
      const productNameLower = product.name.toLowerCase()
      let matchedImage: string | null = null

      for (const [keyword, imagePath] of Object.entries(imageMapping)) {
        if (productNameLower.includes(keyword.toLowerCase())) {
          matchedImage = imagePath
          break
        }
      }

      if (matchedImage) {
        await prisma.product.update({
          where: { id: product.id },
          data: { image: matchedImage }
        })
        console.log(`✅ ${product.name} → ${matchedImage}`)
        successCount++
      } else {
        console.log(`⏭️  ${product.name} → Tidak ada foto yang cocok`)
        skipCount++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 Ringkasan:')
    console.log('='.repeat(60))
    console.log(`✅ Berhasil diupdate: ${successCount}`)
    console.log(`⏭️  Dilewati: ${skipCount}`)
    console.log(`📦 Total produk: ${products.length}`)
    console.log('='.repeat(60))

    if (skipCount > 0) {
      console.log('\n💡 Tips: Untuk produk yang dilewati, Anda bisa:')
      console.log('   1. Update manual lewat Prisma Studio (npx prisma studio)')
      console.log('   2. Upload foto baru lewat Seller Dashboard')
      console.log('   3. Edit mapping di script ini untuk menambahkan keyword')
    }

  } catch (error) {
    console.error('💥 Error:', error)
    throw error
  }
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
