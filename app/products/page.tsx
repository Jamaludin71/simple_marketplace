/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface ProductsPageProps {
    searchParams: {
        search?: string
        category?: string
        sort?: string
        minPrice?: string
        maxPrice?: string
        page?: string
    }
}

async function getProducts(params: ProductsPageProps["searchParams"]) {
    const { search, category, sort, page = "1" } = params
    const limit = 12
    const offset = (parseInt(page) - 1) * limit

    const where: any = {
        status: "ACTIVE",
        stock: {
            gt: 0
        }
    }

    if (search) {
        where.name = {
            contains: search,
            mode: "insensitive",
        }
    }

    if (category) {
        where.category = {
            slug: category,
        }
    }

    const orderBy: any = {}
    if (sort === "price_asc") {
        orderBy.price = "asc"
    } else if (sort === "price_desc") {
        orderBy.price = "desc"
    } else {
        orderBy.createdAt = "desc"
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy,
            include: {
                seller: {
                    select: {
                        name: true,
                    },
                },
            },
        }),
        prisma.product.count({ where }),
    ])

    return { products, total, totalPages: Math.ceil(total / limit) }
}

async function getCategories() {
    return await prisma.category.findMany()
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const { products, total, totalPages } = await getProducts(searchParams)
    const categories = await getCategories()

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filter */}
                <aside className="w-full md:w-64 space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Cari</h3>
                        <form className="flex gap-2">
                            <Input
                                name="search"
                                placeholder="Cari produk..."
                                defaultValue={searchParams.search}
                            />
                            <Button type="submit" size="icon">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Kategori</h3>
                        <div className="flex flex-col space-y-2">
                            <Link
                                href="/products"
                                className={`text-sm hover:underline ${!searchParams.category ? 'font-bold' : ''}`}
                            >
                                Semua Kategori
                            </Link>
                            {categories.map((cat: any) => (
                                <Link
                                    key={cat.id}
                                    href={`/products?category=${cat.slug}`}
                                    className={`text-sm hover:underline ${searchParams.category === cat.slug ? 'font-bold' : ''}`}
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Urutkan Berdasarkan</h3>
                        <div className="flex flex-col space-y-2">
                            <Link href={{ query: { ...searchParams, sort: 'newest' } }} className={`text-sm hover:underline ${!searchParams.sort || searchParams.sort === 'newest' ? 'font-bold' : ''}`}>Terbaru</Link>
                            <Link href={{ query: { ...searchParams, sort: 'price_asc' } }} className={`text-sm hover:underline ${searchParams.sort === 'price_asc' ? 'font-bold' : ''}`}>Harga: Terendah ke Tertinggi</Link>
                            <Link href={{ query: { ...searchParams, sort: 'price_desc' } }} className={`text-sm hover:underline ${searchParams.sort === 'price_desc' ? 'font-bold' : ''}`}>Harga: Tertinggi ke Terendah</Link>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <main className="flex-1">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold">
                            {searchParams.search ? `Hasil pencarian untuk "${searchParams.search}"` :
                                searchParams.category ? `Kategori: ${categories.find((c: any) => c.slug === searchParams.category)?.name}` :
                                    "Semua Produk"}
                        </h1>
                        <span className="text-muted-foreground">{total} produk ditemukan</span>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product: any) => (
                                <div key={product.id} className="h-full">
                                    <ProductCard
                                        name={product.name}
                                        slug={product.slug}
                                        price={Number(product.price)}
                                        image={product.image}
                                        stock={product.stock}
                                        sellerName={product.seller.name}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <p className="text-lg">No products found.</p>
                            <p>Try adjusting your search or filters.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <Button
                                    key={p}
                                    variant={p.toString() === (searchParams.page || "1") ? "default" : "outline"}
                                    asChild
                                >
                                    <Link href={{ query: { ...searchParams, page: p } }}>
                                        {p}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
