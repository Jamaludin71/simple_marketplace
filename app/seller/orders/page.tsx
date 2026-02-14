"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Eye } from "lucide-react"
import { formatDate, formatRupiah } from "@/lib/utils"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

interface Order {
    id: string
    orderNumber: string
    status: string
    totalAmount: number
    createdAt: string
    user: {
        name: string
        email: string
    }
}

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("ALL")

    const fetchOrders = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (statusFilter !== "ALL") params.set("status", statusFilter)
            
            const response = await fetch(`/api/seller/orders?${params}`)
            if (!response.ok) throw new Error("Failed to fetch orders")
            const data = await response.json()
            setOrders(data)
        } catch {
            toast({
                title: "Gagal",
                description: "Gagal memuat pesanan",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [statusFilter])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            case "PAID": return "bg-blue-100 text-blue-800 hover:bg-blue-100"
            case "PROCESSING": return "bg-orange-100 text-orange-800 hover:bg-orange-100"
            case "SHIPPED": return "bg-purple-100 text-purple-800 hover:bg-purple-100"
            case "DELIVERED": return "bg-green-100 text-green-800 hover:bg-green-100"
            case "CANCELLED": return "bg-red-100 text-red-800 hover:bg-red-100"
            default: return "bg-gray-100 text-gray-800 hover:bg-gray-100"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Pesanan</h2>
                    <p className="text-muted-foreground">Kelola pesanan pelanggan Anda</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter berdasarkan status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Semua Status</SelectItem>
                        <SelectItem value="PENDING">Menunggu</SelectItem>
                        <SelectItem value="PAID">Dibayar</SelectItem>
                        <SelectItem value="PROCESSING">Diproses</SelectItem>
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
                            <TableHead>No Pesanan</TableHead>
                            <TableHead>Pelanggan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total (Item Anda)</TableHead>
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
                                            <span className="font-medium">{order.user.name}</span>
                                            <span className="text-xs text-muted-foreground">{order.user.email}</span>
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
                                            <Link href={`/seller/orders/${order.orderNumber}`}>
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
        </div>
    )
}
