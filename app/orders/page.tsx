/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatRupiah, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Package } from "lucide-react"
import Link from "next/link"

export default async function OrderListPage({ searchParams }: { searchParams: { status?: string } }) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    const statusFilter = searchParams?.status
    const whereClause: any = { buyerId: session.user.id }
    
    if (statusFilter && statusFilter !== 'ALL') {
        whereClause.status = statusFilter
    }

    const orders = await prisma.order.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
            seller: {
                select: { name: true }
            },
            orderItems: {
                take: 1,
                select: { productName: true }
            }
        }
    })

    const tabs = [
        { value: "ALL", label: "Semua" },
        { value: "PENDING", label: "Menunggu Pembayaran" },
        { value: "PAID", label: "Sudah Dibayar" },
        { value: "PROCESSING", label: "Diproses" },
        { value: "SHIPPED", label: "Dikirim" },
        { value: "DELIVERED", label: "Selesai" },
        { value: "CANCELLED", label: "Dibatalkan" },
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Pesanan Saya</h1>

            <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
                {tabs.map((tab) => (
                     <Button
                        key={tab.value}
                        variant={(!statusFilter && tab.value === "ALL") || statusFilter === tab.value ? "default" : "outline"}
                        size="sm"
                        asChild
                        className="whitespace-nowrap"
                    >
                        <Link href={tab.value === "ALL" ? "/orders" : `/orders?status=${tab.value}`}>
                            {tab.label}
                        </Link>
                    </Button>
                ))}
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed">
                    <Package className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Tidak ada pesanan</h2>
                    <p className="text-muted-foreground mb-6">
                        {statusFilter && statusFilter !== "ALL" 
                            ? `Tidak ada pesanan dengan status ${statusFilter.toLowerCase()}` 
                            : "Kamu belum pernah belanja, yuk cari produk menarik!"}
                    </p>
                    <Button asChild>
                        <Link href="/products">Mulai Belanja</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order: any) => (
                        <Card key={order.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2 text-sm text-muted-foreground">
                                        <span>{formatDate(order.createdAt)}</span>
                                        <span>•</span>
                                        <span>{order.orderNumber}</span>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={`capitalize ${
                                            order.status === "PENDING" ? "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100" :
                                            order.status === "PAID" ? "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100" :
                                            order.status === "PROCESSING" ? "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100" :
                                            order.status === "SHIPPED" ? "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100" :
                                            order.status === "DELIVERED" ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100" :
                                            order.status === "CANCELLED" ? "bg-red-100 text-red-800 border-red-200 hover:bg-red-100" :
                                            ""
                                        }`}
                                    >
                                        {order.status === "PENDING" ? "Menunggu Pembayaran" :
                                         order.status === "PAID" ? "Sudah Dibayar" :
                                         order.status === "PROCESSING" ? "Sedang Diproses" :
                                         order.status === "SHIPPED" ? "Sedang Dikirim" :
                                         order.status === "DELIVERED" ? "Selesai" :
                                         order.status === "CANCELLED" ? "Dibatalkan" :
                                         order.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold">{order.seller.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {order.orderItems[0]?.productName}
                                            {order.orderItems.length > 0 && " dan lainnya..."}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Total Belanja</p>
                                        <p className="font-bold">{formatRupiah(Number(order.totalPrice.toString()) + Number(order.shippingCost.toString()))}</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                                    <Link href={`/orders/${order.orderNumber}`}>
                                        Lihat Detail Pesanan
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
