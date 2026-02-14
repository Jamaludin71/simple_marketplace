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
            where: { orderNumber: params.orderNumber }
        })

        if (!order) {
            return new NextResponse("Order not found", { status: 404 })
        }

        if (order.buyerId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (order.status !== "SHIPPED") {
            return new NextResponse("Order status is not SHIPPED", { status: 400 })
        }

        const updatedOrder = await prisma.order.update({
            where: { orderNumber: params.orderNumber },
            data: {
                status: "DELIVERED",
                updatedAt: new Date()
            }
        })

        return NextResponse.json(updatedOrder)

    } catch (error) {
        console.error("[ORDER_CONFIRM]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
