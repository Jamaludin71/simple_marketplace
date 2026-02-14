import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { ArrowRight } from "lucide-react"

async function getCategories() {
  return await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  })
}

type Category = Awaited<ReturnType<typeof getCategories>>[number]

export const revalidate = 0

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-serif font-semibold tracking-tight mb-4">
          Semua Kategori
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Jelajahi berbagai kategori produk yang tersedia di MiniShop
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {categories.map((category: Category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group"
          >
            <Card className="hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 hover:border-accent/30 h-full border-border/60">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300 group-hover:scale-110">
                  <span className="text-3xl font-serif font-bold">
                    {category.name.charAt(0)}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-base group-hover:text-accent transition-colors">
                    {category.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  Lihat Produk
                  <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-24">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
            <span className="text-3xl font-serif text-muted-foreground">?</span>
          </div>
          <h2 className="text-2xl font-serif font-semibold mb-2">
            Belum Ada Kategori
          </h2>
          <p className="text-muted-foreground">
            Kategori produk akan ditampilkan di sini
          </p>
        </div>
      )}
    </div>
  )
}
