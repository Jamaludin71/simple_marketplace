"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { MoreHorizontal, Search, Trash, ExternalLink } from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface Product {
    id: string
    name: string
    description: string
    price: number
    stock: number
    image: string | null
    slug: string
    isActive: boolean
    createdAt: string
    category: {
        name: string
    }
    seller: {
        name: string
        email: string
    }
}

interface Pagination {
    total: number
    pages: number
    page: number
    limit: number
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [page, setPage] = useState(1)
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

    const fetchProducts = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                query: debouncedQuery
            })
            const response = await fetch(`/api/admin/products?${params}`)
            if (!response.ok) throw new Error("Failed to fetch products")
            const data = await response.json()
            setProducts(data.products)
            setPagination(data.pagination)
        } catch {
            toast({
                title: "Gagal",
                description: "Gagal memuat produk",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [page, debouncedQuery])

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery)
            setPage(1) // Reset to first page on new search
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const handleDelete = async () => {
        if (!deletingProduct) return

        try {
            const response = await fetch(`/api/admin/products/${deletingProduct.id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const error = await response.text()
                throw new Error(error)
            }

            toast({
                title: "Berhasil",
                description: "Produk berhasil dihapus",
            })

            fetchProducts()
            setDeletingProduct(null)
        } catch (error) {
            toast({
                title: "Gagal",
                description: error instanceof Error ? error.message : "Gagal menghapus produk",
                variant: "destructive",
            })
        }
    }

    const getStockStatus = (stock: number) => {
        if (stock === 0) return <Badge variant="destructive">Stok Habis</Badge>
        if (stock < 5) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Stok Menipis</Badge>
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Tersedia</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Manajemen Produk</h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari produk..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produk</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Penjual</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead>Stok</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Memuat...</TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Tidak ada produk ditemukan.</TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-12 w-12 rounded overflow-hidden bg-gray-100">
                                                {product.image ? (
                                                    <Image 
                                                        src={product.image} 
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                        No Img
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium truncate max-w-[200px]" title={product.name}>
                                                    {product.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground line-clamp-1">
                                                    {product.slug}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{product.category.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{product.seller.name}</span>
                                            <span className="text-xs text-muted-foreground">{product.seller.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatRupiah(product.price)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {getStockStatus(product.stock)}
                                            <span className="text-xs text-muted-foreground">{product.stock} unit</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Buka menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/products/${product.slug}`} target="_blank">
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        Lihat Langsung
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="text-red-600"
                                                    onClick={() => setDeletingProduct(product)}
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Sebelumnya
                    </Button>
                    <div className="flex items-center gap-2">
                         <span className="text-sm">Halaman {page} dari {pagination.pages}</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                    >
                        Selanjutnya
                    </Button>
                </div>
            )}

            <Dialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Produk</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus <strong>{deletingProduct?.name}</strong>?
                            Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingProduct(null)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
