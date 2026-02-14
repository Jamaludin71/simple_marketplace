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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, Eye } from "lucide-react"
import { formatDate, formatRupiah } from "@/lib/utils"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface Order {
    id: string
    orderNumber: string
    status: string
    totalAmount: number
    createdAt: string
    buyer: {
        name: string
        email: string
    }
    orderItems: {
        product: {
            name: string
            seller: {
                name: string
            }
        }
    }[]
}

interface Pagination {
    total: number
    pages: number
    page: number
    limit: number
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [page, setPage] = useState(1)

    const fetchOrders = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                query: debouncedQuery,
                status: statusFilter
            })
            const response = await fetch(`/api/admin/orders?${params}`)
            if (!response.ok) throw new Error("Failed to fetch orders")
            const data = await response.json()
            setOrders(data.orders)
            setPagination(data.pagination)
        } catch {
            toast({
                title: "Gagal",
                description: "Gagal memuat pesanan",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [page, debouncedQuery, statusFilter])

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery)
            setPage(1) // Reset to first page on new search
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    useEffect(() => {
        setPage(1)
    }, [statusFilter])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            case "PAID": return "bg-blue-100 text-blue-800 hover:bg-blue-100"
            case "SHIPPED": return "bg-purple-100 text-purple-800 hover:bg-purple-100"
            case "DELIVERED": return "bg-green-100 text-green-800 hover:bg-green-100"
            case "CANCELLED": return "bg-red-100 text-red-800 hover:bg-red-100"
            default: return "bg-gray-100 text-gray-800 hover:bg-gray-100"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Manajemen Pesanan</h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari pesanan..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter berdasarkan status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Semua Status</SelectItem>
                        <SelectItem value="PENDING">Menunggu</SelectItem>
                        <SelectItem value="PAID">Dibayar</SelectItem>
                        <SelectItem value="SHIPPED">Dikirim</SelectItem>
                        <SelectItem value="DELIVERED">Diterima</SelectItem>
                        <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No. Pesanan</TableHead>
                            <TableHead>Pelanggan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Memuat...</TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Tidak ada pesanan ditemukan.</TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.buyer.name}</span>
                                            <span className="text-xs text-muted-foreground">{order.buyer.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={getStatusColor(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{formatRupiah(order.totalAmount)}</TableCell>
                                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/orders/${order.orderNumber}`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Lihat
                                            </Link>
                                        </Button>
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
        </div>
    )
}
