/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatRupiah, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, Truck, CreditCard, Calendar } from "lucide-react"
import Link from "next/link"
import { OrderActions } from "@/components/order-actions"

export default async function OrderDetailPage({ params }: { params: { orderNumber: string } }) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    const order = await prisma.order.findUnique({
        where: { orderNumber: params.orderNumber },
        include: {
            orderItems: {
                include: {
                    product: true
                }
            },
            seller: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    })

    if (!order) {
        notFound()
    }

    // Ensure user is authorized to view this order (either buyer or admin)
    // For now, only buyer or seller involved can view? 
    // Schema says: buyerId, sellerId.
    // We need to check if session.user.id matches buyerId (or sellerId if we were supporting seller view here)

    if (order.buyerId !== session.user.id && session.user.role !== "ADMIN" && order.sellerId !== session.user.id) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold text-red-600">Tidak Diizinkan</h1>
                <p>Anda tidak memiliki izin untuk melihat pesanan ini.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href="/orders">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Pesanan Saya
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Detail Pesanan</h1>
                    <p className="text-muted-foreground">Order ID: {order.orderNumber}</p>
                </div>
                <Badge
                    variant={
                        order.status === "PENDING" ? "secondary" :
                            order.status === "PAID" ? "default" :
                                order.status === "CANCELLED" ? "destructive" : "outline"
                    }
                    className="text-lg px-4 py-1 capitalize"
                >
                    {order.status.toLowerCase()}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="mr-2 h-5 w-5" /> Daftar Produk
                            </CardTitle>
                            <CardDescription>
                                Penjual: <span className="font-semibold text-foreground">{order.seller.name}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.orderItems.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                    <div className="flex-1">
                                        <h3 className="font-medium">{item.productName}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {item.quantity} x {formatRupiah(Number(item.price))}
                                        </p>
                                    </div>
                                    <div className="font-semibold">
                                        {formatRupiah(Number(item.subtotal))}
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 flex justify-between items-center font-bold text-lg">
                                <span>Total Belanja</span>
                                <span>{formatRupiah(order.totalPrice.toString())}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Truck className="mr-2 h-5 w-5" /> Informasi Pengiriman
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="font-semibold">Alamat</p>
                                <p className="text-muted-foreground whitespace-pre-line">{order.shippingAddress}</p>
                            </div>
                            {order.notes && (
                                <div>
                                    <p className="font-semibold">Catatan</p>
                                    <p className="text-muted-foreground">{order.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <CreditCard className="mr-2 h-5 w-5" /> Pembayaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Metode</span>
                                <span className="font-medium">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ongkos Kirim</span>
                                <span className="font-medium">{formatRupiah(order.shippingCost.toString())}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total Bayar</span>
                                <span>{formatRupiah(Number(order.totalPrice.toString()) + Number(order.shippingCost.toString()))}</span>
                            </div>

                            {order.status === 'PENDING' || order.status === 'SHIPPED' ? (
                                <div className="mt-6">
                                    <OrderActions order={order} />
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4" />
                                Tanggal Pesanan
                            </div>
                            <span>{formatDate(order.createdAt)}</span>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
