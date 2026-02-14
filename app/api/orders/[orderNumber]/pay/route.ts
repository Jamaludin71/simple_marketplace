import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const paymentSchema = z.object({
    paymentProof: z.string().min(1, "Payment proof is required")
})

export async function PATCH(
    req: Request,
    { params }: { params: { orderNumber: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { paymentProof } = paymentSchema.parse(body)

        const order = await prisma.order.findUnique({
            where: { orderNumber: params.orderNumber }
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

        const updatedOrder = await prisma.order.update({
            where: { orderNumber: params.orderNumber },
            data: {
                status: "PAID",
                paymentProof,
                updatedAt: new Date()
            }
        })

        return NextResponse.json(updatedOrder)

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 })
        }
        console.error("[ORDER_PAY]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
