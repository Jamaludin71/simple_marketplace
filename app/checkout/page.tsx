"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cart-store"
import { formatRupiah } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function CheckoutPage() {
    const router = useRouter()
    const user = useCurrentUser()
    const { items, totalPrice, fetchCart, clearCart } = useCartStore()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        shippingAddress: "",
        shippingCost: 20000, // Hardcoded for simplicity as per request
        paymentMethod: "BCA",
        notes: ""
    })

    useEffect(() => {
        fetchCart()
    }, [fetchCart])

    // Pre-fill address if user has one (assuming user object has address, but our hook might not return it fully or type is different)
    // For now, we leave it empty or default.

    if (items.length === 0) {
        // Redirect or show empty
        // Better to check loading state too, but for simplicity:
        // router.push('/cart')
        // return null
    }

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shippingAddress: formData.shippingAddress,
                    shippingCost: formData.shippingCost,
                    paymentMethod: formData.paymentMethod,
                    notes: formData.notes
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Failed to create order")
            }

            toast({
                title: "Pesanan berhasil dibuat!",
                description: "Silakan lakukan pembayaran.",
            })

            clearCart()

            // Redirect to order detail. Since we might have multiple orders (one per seller), 
            // strictly we should show a list or redirect to the first one.
            // API returns { message, orders: [...] }
            if (data.orders && data.orders.length > 0) {
                router.push(`/orders/${data.orders[0].orderNumber}`)
            } else {
                router.push("/orders")
            }

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Gagal membuat pesanan",
                description: error instanceof Error ? error.message : "Terjadi kesalahan",
            })
        } finally {
            setLoading(false)
        }
    }

    const subtotal = totalPrice()
    const total = subtotal + formData.shippingCost

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Checkout</h1>

            <form onSubmit={handleCreateOrder}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Alamat Pengiriman</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="name">Nama Penerima</Label>
                                    <Input id="name" value={user?.name || ""} disabled />
                                </div>
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="address">Alamat Lengkap</Label>
                                    <Textarea
                                        id="address"
                                        placeholder="Jalan, Nomor Rumah, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos"
                                        value={formData.shippingAddress}
                                        onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                                        required
                                        minLength={10}
                                    />
                                </div>
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Pesan untuk penjual..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Metode Pembayaran</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid w-full gap-1.5">
                                    <Label>Pilih Metode Pembayaran</Label>
                                    <Select
                                        value={formData.paymentMethod}
                                        onValueChange={(val) => setFormData({ ...formData, paymentMethod: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih metode pembayaran" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BCA">Transfer Bank BCA (1234567890 a/n MiniShop)</SelectItem>
                                            <SelectItem value="MANDIRI">Transfer Bank Mandiri (0987654321 a/n MiniShop)</SelectItem>
                                            <SelectItem value="COD">COD (Bayar di Tempat)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="shipping">Ongkos Kirim</Label>
                                    <Input
                                        id="shipping"
                                        type="number"
                                        value={formData.shippingCost}
                                        onChange={(e) => setFormData({ ...formData, shippingCost: Number(e.target.value) })}
                                    />
                                    <p className="text-xs text-muted-foreground">Input manual untuk simulasi ongkir</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ringkasan Pesanan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="truncate max-w-[180px]">{item.product.name} (x{item.quantity})</span>
                                            <span>{formatRupiah(item.product.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span>Subtotal Produk</span>
                                    <span className="font-semibold">{formatRupiah(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Ongkos Kirim</span>
                                    <span>{formatRupiah(formData.shippingCost)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total Pembayaran</span>
                                    <span>{formatRupiah(total)}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" size="lg" type="submit" disabled={loading || items.length === 0}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Buat Pesanan
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    )
}
