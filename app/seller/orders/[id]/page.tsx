"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatRupiah, formatDate } from "@/lib/utils"
import Image from "next/image"
import { ArrowLeft, Package, Truck, CheckCircle } from "lucide-react"

interface OrderItem {
    id: string
    quantity: number
    price: number
    product: {
        name: string
        image: string | null
    }
}

interface Order {
    id: string
    orderNumber: string
    status: string
    totalAmount: number
    createdAt: string
    shippingAddress: string
    paymentProof: string | null
    user: {
        name: string
        email: string
    }
    orderItems: OrderItem[]
}

export default function SellerOrderDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [order, setOrder] = useState<Order | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/seller/orders/${params.id}`)
                if (!response.ok) throw new Error("Failed to fetch order")
                const data = await response.json()
                setOrder(data)
            } catch {
                toast({
                    title: "Error",
                    description: "Failed to load order details",
                    variant: "destructive",
                })
                router.push("/seller/orders")
            } finally {
                setIsLoading(false)
            }
        }
        fetchOrder()
    }, [params.id, router])

    const handleProcess = async () => {
        setIsProcessing(true)
        try {
            const response = await fetch(`/api/seller/orders/${params.id}/process`, {
                method: "PATCH",
            })
            if (!response.ok) throw new Error("Failed to process order")
            
            toast({ title: "Success", description: "Order marked as Processing" })
            setOrder(prev => prev ? { ...prev, status: "PROCESSING" } : null)
        } catch {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
        } finally {
            setIsProcessing(false)
        }
    }

    const handleShip = async () => {
        setIsProcessing(true)
        try {
            const response = await fetch(`/api/seller/orders/${params.id}/ship`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiptNumber: "123456" }) // Mock receipt number for now
            })
            if (!response.ok) throw new Error("Failed to ship order")
            
            toast({ title: "Success", description: "Order marked as Shipped" })
            setOrder(prev => prev ? { ...prev, status: "SHIPPED" } : null)
        } catch {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
        } finally {
            setIsProcessing(false)
        }
    }

    if (isLoading) return <div className="p-8 text-center">Loading...</div>
    if (!order) return <div className="p-8 text-center">Order not found</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
                <Badge>{order.status}</Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Date Placed</span>
                            <span>{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Customer</span>
                            <span>{order.user.name} ({order.user.email})</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Shipping Address</span>
                            <span className="text-right max-w-[200px]">{order.shippingAddress}</span>
                        </div>
                         {order.paymentProof && (
                             <div className="mt-4">
                                 <span className="text-muted-foreground block mb-2">Payment Proof</span>
                                 <div className="relative h-40 w-full rounded-md overflow-hidden border">
                                     <Image 
                                        src={order.paymentProof} 
                                        alt="Payment Proof" 
                                        fill 
                                        className="object-contain"
                                    />
                                 </div>
                             </div>
                         )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Actions</CardTitle>
                         <CardDescription>Manage the status of this order</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.status === "PAID" && (
                            <Button className="w-full" onClick={handleProcess} disabled={isProcessing}>
                                <Package className="mr-2 h-4 w-4" />
                                Process Order (Prepare)
                            </Button>
                        )}
                        {order.status === "PROCESSING" && (
                            <Button className="w-full" onClick={handleShip} disabled={isProcessing}>
                                <Truck className="mr-2 h-4 w-4" />
                                Ship Order
                            </Button>
                        )}
                        {order.status === "SHIPPED" && (
                            <div className="text-center p-4 bg-green-50 text-green-700 rounded-md flex items-center justify-center gap-2">
                                <Truck className="h-5 w-5" />
                                Order Shipped - Waiting for Customer Confirmation
                            </div>
                        )}
                         {order.status === "DELIVERED" && (
                            <div className="text-center p-4 bg-green-50 text-green-700 rounded-md flex items-center justify-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                Order Completed
                            </div>
                        )}
                        {order.status === "PENDING" && (
                             <div className="text-center p-4 bg-yellow-50 text-yellow-700 rounded-md">
                                 Waiting for Payment
                             </div>
                        )}
                        {order.status === "CANCELLED" && (
                             <div className="text-center p-4 bg-red-50 text-red-700 rounded-md">
                                 Order Cancelled
                             </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ordered Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {order.orderItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                     <div className="relative h-16 w-16 rounded overflow-hidden bg-gray-100">
                                        {item.product.image ? (
                                            <Image 
                                                src={item.product.image} 
                                                alt={item.product.name} 
                                                fill 
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-400 text-xs">No Img</div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{item.product.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.quantity} x {formatRupiah(item.price)}
                                        </p>
                                    </div>
                                </div>
                                <p className="font-medium">
                                    {formatRupiah(item.quantity * item.price)}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                    <span className="font-semibold">Total Amount (Your Items)</span>
                    <span className="text-xl font-bold">{formatRupiah(order.totalAmount)}</span>
                </CardFooter>
            </Card>
        </div>
    )
}
