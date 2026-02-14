/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
    req: Request,
    { params }: { params: { orderNumber: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const order = await prisma.order.findUnique({
            where: { orderNumber: params.orderNumber },
            include: { orderItems: true }
        })

        if (!order) {
            return new NextResponse("Order not found", { status: 404 })
        }

        if (order.buyerId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (order.status !== "PENDING") {
            return new NextResponse("Order status is not PENDING", { status: 400 })
        }

        // Transaction: Update status to CANCELLED and restore stock
        await prisma.$transaction(async (tx: any) => {
            await tx.order.update({
                where: { orderNumber: params.orderNumber },
                data: {
                    status: "CANCELLED",
                    updatedAt: new Date()
                }
            })

            // Restore stock
            for (const item of order.orderItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } }
                })
            }
        })

        return NextResponse.json({ message: "Order cancelled successfully" })

    } catch (error) {
        console.error("[ORDER_CANCEL]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
