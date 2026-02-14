import { create } from 'zustand'
import { toast } from '@/hooks/use-toast'

export interface CartItem {
    id: string
    productId: string
    quantity: number
    product: {
        name: string
        price: number
        image: string | null
        slug: string
        seller: {
            name: string
        }
    }
}

interface CartStore {
    items: CartItem[]
    isLoading: boolean
    fetchCart: () => Promise<void>
    addToCart: (productId: string, quantity?: number) => Promise<void>
    updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
    removeItem: (cartItemId: string) => Promise<void>
    clearCart: () => void
    totalItems: () => number
    totalPrice: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    isLoading: false,

    fetchCart: async () => {
        set({ isLoading: true })
        try {
            const response = await fetch('/api/cart')
            if (!response.ok) throw new Error('Failed to fetch cart')
            const data = await response.json()
            set({ items: data })
        } catch (error) {
            console.error(error)
        } finally {
            set({ isLoading: false })
        }
    },

    addToCart: async (productId: string, quantity = 1) => {
        set({ isLoading: true })
        try {
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to add to cart')
            }

            await get().fetchCart()
            toast({
                title: "Berhasil",
                description: "Produk ditambahkan ke keranjang",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Gagal",
                description: error instanceof Error ? error.message : "Gagal menambahkan ke keranjang",
            })
        } finally {
            set({ isLoading: false })
        }
    },

    updateQuantity: async (cartItemId: string, quantity: number) => {
        // Optimistic update
        const oldItems = get().items
        set({
            items: oldItems.map(item =>
                item.id === cartItemId ? { ...item, quantity } : item
            )
        })

        try {
            const response = await fetch(`/api/cart/${cartItemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity }),
            })

            if (!response.ok) throw new Error('Failed to update quantity')

            // No need to refetch if successful, as we did optimistic update
        } catch {
            // Revert on error
            set({ items: oldItems })
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Gagal memperbarui jumlah",
            })
        }
    },

    removeItem: async (cartItemId: string) => {
        // Optimistic update
        const oldItems = get().items
        set({ items: oldItems.filter(item => item.id !== cartItemId) })

        try {
            const response = await fetch(`/api/cart/${cartItemId}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Failed to remove item')
        } catch {
            // Revert
            set({ items: oldItems })
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Gagal menghapus item",
            })
        }
    },

    clearCart: () => set({ items: [] }),

    totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
    },

    totalPrice: () => {
        return get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
    },
}))
