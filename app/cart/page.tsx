"use client"

import Link from "next/link"
import Image from "next/image"
import { useCartStore } from "@/store/cart-store"
import { formatRupiah } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react"
import { useEffect } from "react"

export default function CartPage() {
    const { items, isLoading, updateQuantity, removeItem, totalPrice, fetchCart } = useCartStore()

    useEffect(() => {
        fetchCart()
    }, [fetchCart])

    if (items.length === 0 && !isLoading) {
        return (
            <div className="container mx-auto flex flex-col items-center justify-center py-20 space-y-4">
                <div className="bg-slate-100 p-6 rounded-full">
                    <ShoppingBag className="h-12 w-12 text-slate-400" />
                </div>
                <h1 className="text-2xl font-bold">Keranjang Belanja Kosong</h1>
                <p className="text-muted-foreground">Yuk mulai belanja dan penuhi kebutuhanmu!</p>
                <Button asChild size="lg" className="mt-4">
                    <Link href="/products">
                        Mulai Belanja
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Keranjang Belanja</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="flex-1 space-y-4">
                    {items.map((item) => (
                        <Card key={item.id}>
                            <CardContent className="p-4 flex gap-4">
                                <div className="relative h-24 w-24 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                                    {item.product.image ? (
                                        <Image
                                            src={item.product.image}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <ShoppingBag className="h-8 w-8" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between">
                                        <div>
                                            <h3 className="font-semibold">{item.product.name}</h3>
                                            <p className="text-sm text-muted-foreground">{item.product.seller?.name}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <p className="font-bold text-blue-600">
                                            {formatRupiah(item.product.price)}
                                        </p>
                                        <div className="flex items-center border rounded-md">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Summary */}
                <div className="w-full lg:w-80">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-semibold text-lg">Ringkasan Belanja</h3>
                            <Separator />
                            <div className="flex justify-between text-sm">
                                <span>Total Harga ({items.length} barang)</span>
                                <span className="font-bold">{formatRupiah(totalPrice())}</span>
                            </div>
                            <Separator />
                            <Button asChild className="w-full" size="lg">
                                <Link href="/checkout">
                                    Checkout <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
