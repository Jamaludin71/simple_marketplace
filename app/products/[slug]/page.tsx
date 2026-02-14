import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Store } from "lucide-react"

import { prisma } from "@/lib/prisma"
import { formatRupiah } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AddToCartButton } from "@/components/add-to-cart-button"

async function getProduct(slug: string) {
    const product = await prisma.product.findFirst({
        where: { slug },
        include: {
            category: true,
            seller: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    address: true,
                },
            },
        },
    })

    if (!product) {
        return null
    }

    return product
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const product = await getProduct(params.slug)

        if (!product) {
        return {
            title: "Produk Tidak Ditemukan",
        }
    }

    return {
        title: `${product.name} - MiniShop`,
        description: product.description,
    }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
    const product = await getProduct(params.slug)

    if (!product) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Product Image */}
                <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden border">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ShoppingBag className="h-24 w-24" />
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col space-y-6">
                    <div>
                        <div className="mb-4">
                            <Badge variant="secondary" className="mb-2">
                                {product.category.name}
                            </Badge>
                            <h1 className="text-3xl font-bold">{product.name}</h1>
                        </div>

                        <p className="text-3xl font-bold text-blue-600">
                            {formatRupiah(product.price.toString())}
                        </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-sm">
                            <span className={product.stock > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                {product.stock > 0 ? `Stok tersedia: ${product.stock} unit` : "Stok Habis"}
                            </span>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <AddToCartButton productId={product.id} stock={product.stock} />
                            <Button size="lg" variant="secondary" className="flex-1" disabled={product.stock === 0}>
                                Beli Langsung
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="font-semibold mb-2">Deskripsi Produk</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                            {product.description || "Tidak ada deskripsi."}
                        </p>
                    </div>

                    <Separator />

                    {/* Seller Info */}
                    <div className="flex items-center space-x-4 p-4 border rounded-lg bg-slate-50">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={product.seller.avatar || ""} />
                            <AvatarFallback>{product.seller.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-medium">{product.seller.name}</p>
                            <p className="text-sm text-muted-foreground">{product.seller.address || "Lokasi tidak tersedia"}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/products?seller=${product.seller.id}`}>
                                <Store className="mr-2 h-4 w-4" /> Kunjungi Toko
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
