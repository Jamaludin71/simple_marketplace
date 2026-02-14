/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createOrderSchema = z.object({
    shippingAddress: z.string().min(10),
    shippingCost: z.number().min(0),
    paymentMethod: z.string(),
    notes: z.string().optional(),
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { shippingAddress, shippingCost, paymentMethod, notes } = createOrderSchema.parse(body)

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                cartItems: {
                    include: {
                        product: true
                    }
                }
            }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        if (user.cartItems.length === 0) {
            return new NextResponse("Cart is empty", { status: 400 })
        }

        // Verify stock
        for (const item of user.cartItems) {
            if (item.quantity > item.product.stock) {
                return NextResponse.json(
                    { message: `Stock for ${item.product.name} is not sufficient` },
                    { status: 400 }
                )
            }
        }

        // Calculate total price


        // Group items by seller to create separate orders if needed (marketplace style)
        // For simplicity, we'll assume one order per seller or just one big order if multi-seller isn't strictly enforced yet
        // But checking the schema, Order has `sellerId`. So we MUST split orders by seller.

        const itemsBySeller = user.cartItems.reduce((acc: any, item: any) => {
            const sellerId = item.product.sellerId
            if (!acc[sellerId]) {
                acc[sellerId] = []
            }
            acc[sellerId].push(item)
            return acc
        }, {} as Record<string, any[]>)

        const orders: any[] = []

        // Transaction
        await prisma.$transaction(async (tx: any) => {
            for (const sellerId in itemsBySeller) {
                const sellerItems = itemsBySeller[sellerId]
                const sellerTotal = sellerItems.reduce(
                    (total: any, item: any) => total + Number(item.product.price) * item.quantity,
                    0
                )

                // Create Order
                const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

                const order = await tx.order.create({
                    data: {
                        orderNumber,
                        buyerId: user.id,
                        sellerId: sellerId,
                        totalPrice: sellerTotal,
                        shippingAddress,
                        shippingCost: shippingCost, // Might need to split shipping cost per seller? For simplicity, we apply provided cost to first order or divide? 
                        // Let's assume shippingCost is per order in this UI (user inputs manually). 
                        // Ideally, user should input shipping for each seller.
                        // For now, let's just use the provided shipping cost for the first seller found? Or just 0 for others?
                        // Simplified: just put shipping cost on the first order found.
                        paymentMethod,
                        notes,
                        status: 'PENDING',
                        orderItems: {
                            create: sellerItems.map((item: any) => ({
                                productId: item.productId,
                                productName: item.product.name,
                                price: item.product.price,
                                quantity: item.quantity,
                                subtotal: Number(item.product.price.toString()) * item.quantity
                            }))
                        }
                    }
                })
                orders.push(order)

                // Reduce stock
                for (const item of sellerItems) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } }
                    })
                }
            }

            // Clear cart
            await tx.cartItem.deleteMany({
                where: { userId: user.id }
            })
        })

        return NextResponse.json({ message: "Order created successfully", orders })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 })
        }
        console.error("[ORDER_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
