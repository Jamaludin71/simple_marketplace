import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "SELLER") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const order = await prisma.order.findUnique({
            where: {
                orderNumber: params.id
            },
            include: {
                buyer: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                orderItems: {
                    where: {
                        product: {
                            sellerId: session.user.id
                        }
                    },
                    include: {
                        product: true
                    }
                }
            }
        })

        if (!order) {
            return new NextResponse("Order not found", { status: 404 })
        }

        // Verify seller has items in this order
        if (order.orderItems.length === 0) {
             return new NextResponse("Unauthorized", { status: 401 })
        }

        // Recalculate total for this seller
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalAmount = order.orderItems.reduce((acc: number, item: any) => acc + (Number(item.price) * item.quantity), 0)

        return NextResponse.json({ ...order, totalAmount })
    } catch (error) {
        console.error("[SELLER_ORDER_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
