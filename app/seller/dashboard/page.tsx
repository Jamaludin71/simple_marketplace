import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingBag, TrendingUp, DollarSign } from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function getSellerStats(userId: string) {
    const [
        totalProducts,
        totalOrders,
        pendingOrders,
        deliveredOrders
    ] = await Promise.all([
        prisma.product.count({ where: { sellerId: userId } }),
        prisma.order.count({ where: { sellerId: userId } }),
        prisma.order.count({ where: { sellerId: userId, status: "PAID" } }),
        prisma.order.findMany({ 
            where: { sellerId: userId, status: "DELIVERED" },
            include: { orderItems: true }
        })
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalRevenue = deliveredOrders.reduce((acc: number, order: any) => {
        return acc + Number(order.totalPrice)
    }, 0)

    return {
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue
    }
}

async function getRecentOrders(userId: string) {
    return await prisma.order.findMany({
        where: { sellerId: userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { buyer: { select: { name: true } } }
    })
}

export default async function SellerDashboardPage() {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SELLER") {
        redirect("/")
    }

    const { totalProducts, totalOrders, pendingOrders, totalRevenue } = await getSellerStats(session.user.id)
    const recentOrders = await getRecentOrders(session.user.id)

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Beranda</h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatRupiah(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Dari pesanan selesai</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">Semua pesanan</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Produk</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                        <p className="text-xs text-muted-foreground">Produk aktif</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pesanan Baru</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{pendingOrders}</div>
                        <p className="text-xs text-muted-foreground">Menunggu diproses</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Pesanan Terbaru</h3>
                 <div className="rounded-md border">
                    <div className="p-4">
                        {recentOrders.length > 0 ? (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm text-left">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">No Pesanan</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Pembeli</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Total</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {recentOrders.map((order: any) => (
                                            <tr key={order.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <td className="p-4 align-middle font-medium">{order.orderNumber}</td>
                                                <td className="p-4 align-middle">{order.buyer.name}</td>
                                                <td className="p-4 align-middle">{order.status}</td>
                                                <td className="p-4 align-middle">{formatRupiah(Number(order.totalPrice))}</td>
                                                <td className="p-4 align-middle">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                             <p className="text-muted-foreground text-center py-8">Tidak ada pesanan.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
