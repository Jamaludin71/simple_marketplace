/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link"
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProductCard } from "@/components/product-card"
import { prisma } from "@/lib/prisma"

async function getCategories() {
  return await prisma.category.findMany({
    take: 6,
  })
}

async function getFeaturedProducts() {
  return await prisma.product.findMany({
    where: {
      status: "ACTIVE",
    },
    take: 8,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      seller: {
        select: {
          name: true,
        },
      },
    },
  })
}

export const revalidate = 0 // Disable caching for now to see updates

export default async function Home() {
  const categories = await getCategories()
  const products = await getFeaturedProducts()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Elegant & Dramatic */}
      <section className="relative bg-gradient-to-br from-elegant-black via-secondary/20 to-elegant-black text-white py-24 px-4 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(201,166,107,0.1),transparent_50%)]" />
        <div className="container mx-auto flex flex-col items-center text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Marketplace Terpercaya</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight max-w-4xl leading-tight">
            Belanja dengan
            <span className="block text-accent mt-2">Gaya & Elegance</span>
          </h1>
          
          <p className="text-lg md:text-xl max-w-2xl text-gray-300 leading-relaxed">
            Temukan produk pilihan berkualitas tinggi untuk memenuhi kebutuhan sehari-hari Anda dengan harga terbaik.
          </p>
          
          <div className="flex gap-4 pt-4">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-lg shadow-accent/20 h-12 px-8">
              <Link href="/products">
                Mulai Belanja <ShoppingBag className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-8 font-semibold">
              <Link href="/categories">
                Jelajahi Kategori <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-serif font-semibold tracking-tight mb-2">Kategori Pilihan</h2>
              <p className="text-muted-foreground">Temukan produk berdasarkan kategori favorit Anda</p>
            </div>
            <Link
              href="/categories"
              className="text-accent hover:text-accent/80 flex items-center gap-2 font-medium transition-colors group"
            >
              Lihat Semua Kategori
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category: any) => (
              <Link key={category.id} href={`/products?category=${category.slug}`} className="group">
                <Card className="hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 hover:border-accent/30 h-full border-border/60">
                  <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                      <span className="text-2xl font-serif font-bold">{category.name.charAt(0)}</span>
                    </div>
                    <span className="font-medium text-sm group-hover:text-accent transition-colors">{category.name}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-serif font-semibold tracking-tight mb-2">Produk Unggulan</h2>
              <p className="text-muted-foreground">Koleksi produk terbaru dan terpopuler</p>
            </div>
            <Link
              href="/products"
              className="text-accent hover:text-accent/80 flex items-center gap-2 font-medium transition-colors group"
            >
              Lihat Semua Produk
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                name={product.name}
                slug={product.slug}
                price={Number(product.price)}
                image={product.image}
                stock={product.stock}
                sellerName={product.seller.name}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
