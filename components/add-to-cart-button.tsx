"use client"

import { useState } from "react"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Minus, Plus, Loader2 } from "lucide-react"

interface AddToCartButtonProps {
    productId: string
    stock: number
}

export function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
    const [quantity, setQuantity] = useState(1)
    const { addToCart, isLoading } = useCartStore()

    const handleAddToCart = async () => {
        await addToCart(productId, quantity)
    }

    const increment = () => {
        if (quantity < stock) setQuantity(q => q + 1)
    }

    const decrement = () => {
        if (quantity > 1) setQuantity(q => q - 1)
    }

    return (
        <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-md">
                    <Button variant="ghost" size="icon" onClick={decrement} disabled={quantity <= 1 || isLoading}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button variant="ghost" size="icon" onClick={increment} disabled={quantity >= stock || isLoading}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                    Atur jumlah (Max {stock})
                </span>
            </div>

            <Button
                size="lg"
                className="w-full"
                disabled={stock === 0 || isLoading}
                onClick={handleAddToCart}
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <ShoppingBag className="mr-2 h-5 w-5" />
                )}
                Tambah ke Keranjang
            </Button>
        </div>
    )
}
