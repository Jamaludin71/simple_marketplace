import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const addToCartSchema = z.object({
    productId: z.string(),
    quantity: z.number().min(1),
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized", message: "Silakan login terlebih dahulu" }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                cartItems: {
                    include: {
                        product: {
                            include: {
                                seller: {
                                    select: { name: true }
                                }
                            }
                        }
                    },

                }
            }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        return NextResponse.json(user.cartItems)
    } catch (error) {
        console.error("[CART_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized", message: "Silakan login terlebih dahulu" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { productId, quantity } = addToCartSchema.parse(body)

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        // Check product stock
        const product = await prisma.product.findUnique({
            where: { id: productId }
        })

        if (!product) {
            return new NextResponse("Product not found", { status: 404 })
        }

        if (product.stock < quantity) {
            return NextResponse.json({ message: "Stock not sufficient" }, { status: 400 })
        }

        // Check if item already exists in cart
        const existingCartItem = await prisma.cartItem.findFirst({
            where: {
                userId: user.id,
                productId: productId
            }
        })

        if (existingCartItem) {
            // Update quantity
            const newQuantity = existingCartItem.quantity + quantity

            if (product.stock < newQuantity) {
                return NextResponse.json({ message: "Stock not sufficient for requested quantity" }, { status: 400 })
            }

            const updatedItem = await prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: newQuantity }
            })
            return NextResponse.json(updatedItem)
        }

        // Create new cart item
        const cartItem = await prisma.cartItem.create({
            data: {
                userId: user.id,
                productId,
                quantity
            }
        })

        return NextResponse.json(cartItem)

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 })
        }
        console.error("[CART_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
