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
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { MoreHorizontal, Search, Plus, Edit, Trash, Eye, Power } from "lucide-react"
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
}

export default function SellerProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

    const fetchProducts = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (debouncedQuery) params.set("query", debouncedQuery)
            
            const response = await fetch(`/api/seller/products?${params}`)
            if (!response.ok) throw new Error("Failed to fetch products")
            const data = await response.json()
            setProducts(data)
        } catch {
            toast({
                title: "Gagal",
                description: "Gagal memuat produk",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [debouncedQuery])

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const handleDelete = async () => {
        if (!deletingProduct) return

        try {
            const response = await fetch(`/api/seller/products/${deletingProduct.id}`, {
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

    const handleToggleStatus = async (product: Product) => {
        try {
            const response = await fetch(`/api/seller/products/${product.id}/toggle`, {
                method: "PATCH",
            })

            if (!response.ok) throw new Error("Failed to update status")

            toast({
                title: "Berhasil",
                description: `Produk berhasil ${product.isActive ? 'dinonaktifkan' : 'diaktifkan'}`,
            })

            fetchProducts()
        } catch {
            toast({
                title: "Gagal",
                description: "Gagal memperbarui status produk",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Produk</h2>
                    <p className="text-muted-foreground">Kelola inventaris produk Anda</p>
                </div>
                <Button asChild>
                    <Link href="/seller/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Produk
                    </Link>
                </Button>
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
                            <TableHead>Harga</TableHead>
                            <TableHead>Stok</TableHead>
                            <TableHead>Status</TableHead>
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
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{product.category.name}</TableCell>
                                    <TableCell>{formatRupiah(product.price)}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.isActive ? "default" : "secondary"}>
                                            {product.isActive ? "Aktif" : "Tidak Aktif"}
                                        </Badge>
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
                                                    <Link href={`/seller/products/${product.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Ubah
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/products/${product.slug}`} target="_blank">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Lihat Langsung
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggleStatus(product)}>
                                                    <Power className="mr-2 h-4 w-4" />
                                                    {product.isActive ? "Nonaktifkan" : "Aktifkan"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
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
