import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Store, Package, ShoppingBag, DollarSign } from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

async function getAdminStats() {
    const [
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        deliveredOrders
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "SELLER" } }),
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.findMany({ 
            where: { status: "DELIVERED" },
            select: { totalPrice: true }
        })
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalRevenue = deliveredOrders.reduce((acc: number, order: any) => {
        return acc + Number(order.totalPrice)
    }, 0)

    return {
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        totalRevenue
    }
}

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
        redirect("/")
    }

    const { 
        totalUsers, 
        totalSellers, 
        totalProducts, 
        totalOrders, 
        totalRevenue 
    } = await getAdminStats()

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatRupiah(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Dari semua pesanan selesai</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Akun terdaftar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Penjual</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSellers}</div>
                        <p className="text-xs text-muted-foreground">Penjual aktif</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                        <p className="text-xs text-muted-foreground">Semua produk terdaftar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">Semua transaksi</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
