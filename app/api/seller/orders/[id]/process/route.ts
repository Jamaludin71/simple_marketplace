import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "SELLER") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const order = await prisma.order.findUnique({
            where: { orderNumber: params.id },
            include: {
                orderItems: {
                    where: { product: { sellerId: session.user.id } }
                }
            }
        })

        if (!order || order.orderItems.length === 0) {
            return new NextResponse("Order not found or unauthorized", { status: 404 })
        }

        if (order.status !== "PAID") {
            return new NextResponse("Order must be PAID to process", { status: 400 })
        }

        const updatedOrder = await prisma.order.update({
            where: { orderNumber: params.id },
            data: { status: "PROCESSING" }
        })

        return NextResponse.json(updatedOrder)
    } catch (error) {
        console.error("[SELLER_ORDER_PROCESS]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
