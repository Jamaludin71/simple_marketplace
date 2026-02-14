import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateCartSchema = z.object({
    quantity: z.number().min(1),
})

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { quantity } = updateCartSchema.parse(body)

        const cartItem = await prisma.cartItem.findUnique({
            where: { id: params.id },
            include: { product: true }
        })

        if (!cartItem) {
            return new NextResponse("Cart item not found", { status: 404 })
        }

        if (cartItem.product.stock < quantity) {
            return NextResponse.json({ message: "Stock not sufficient" }, { status: 400 })
        }

        const updatedItem = await prisma.cartItem.update({
            where: { id: params.id },
            data: { quantity }
        })

        return NextResponse.json(updatedItem)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 })
        }
        console.error("[CART_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        await prisma.cartItem.delete({
            where: { id: params.id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("[CART_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
