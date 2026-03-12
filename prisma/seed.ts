import { PrismaClient, Role, Status } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create Admin
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@marketplace.com' },
    update: {},
    create: {
      name: 'Admin Marketplace',
      email: 'admin@marketplace.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  })
  console.log({ admin })

  // Create Categories
  const categories = [
    { name: 'Elektronik', slug: 'elektronik' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Makanan', slug: 'makanan' },
    { name: 'Buku', slug: 'buku' },
    { name: 'Lainnya', slug: 'lainnya' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  // Create Sellers
  const sellerPassword = await hash('seller123', 12)
  
  const seller1 = await prisma.user.upsert({
    where: { email: 'seller1@example.com' },
    update: {},
    create: {
      name: 'Toko Maju Jaya',
      email: 'seller1@example.com',
      password: sellerPassword,
      role: Role.SELLER,
      phone: '081234567890',
      address: 'Jl. Merdeka No. 1',
    },
  })

  const seller2 = await prisma.user.upsert({
    where: { email: 'seller2@example.com' },
    update: {},
    create: {
      name: 'Berkah Abadi',
      email: 'seller2@example.com',
      password: sellerPassword,
      role: Role.SELLER,
      phone: '089876543210',
      address: 'Jl. Sudirman No. 10',
    },
  })

  // Create Products for Seller 1
  const elecCat = await prisma.category.findUnique({ where: { slug: 'elektronik' } })
  if (elecCat) {
    const products1 = [
        {
            name: 'Laptop Gaming',
            slug: 'laptop-gaming-xyz',
            description: 'Laptop gaming murah specs tinggi',
            price: 15000000,
            stock: 5,
            status: Status.ACTIVE,
            image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500'
        },
        {
            name: 'Mouse Wireless',
            slug: 'mouse-wireless-rgb',
            description: 'Mouse tanpa kabel dengan lampu RGB',
            price: 150000,
            stock: 50,
            status: Status.ACTIVE,
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'
        },
        {
            name: 'Keyboard Mechanical',
            slug: 'keyboard-mechanical-blue',
            description: 'Keyboard switch blue clicky',
            price: 500000,
            stock: 20,
            status: Status.ACTIVE,
            image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500'
        }
    ]

    for (const p of products1) {
        await prisma.product.create({
            data: {
                ...p,
                sellerId: seller1.id,
                categoryId: elecCat.id
            }
        })
    }
  }

  // Create Products for Seller 2
  const fashionCat = await prisma.category.findUnique({ where: { slug: 'fashion' } })
  if (fashionCat) {
      const products2 = [
          {
              name: 'Kemeja Flanel',
              slug: 'kemeja-flanel-kotak',
              description: 'Kemeja bahan adem motif kotak',
              price: 120000,
              stock: 100,
              status: Status.ACTIVE,
              image: '/kemeja_flanel_hd.png'
          },
             {
              name: 'Celana Chino',
              slug: 'celana-chino-cream',
              description: 'Celana panjang bahan katun twill',
              price: 150000,
              stock: 80,
              status: Status.ACTIVE,
              image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500'
          },
             {
              name: 'Jaket Bomber',
              slug: 'jaket-bomber-navy',
              description: 'Jaket bomber warna navy',
              price: 250000,
              stock: 30,
              status: Status.ACTIVE,
              image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'
          }
      ]

      for (const p of products2) {
          await prisma.product.create({
              data: {
                  ...p,
                  sellerId: seller2.id,
                  categoryId: fashionCat.id
              }
          })
      }
  }

  console.log('Seed completed')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
