import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "SELLER") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get("status")

        // Find orders that have items from this seller
        const orders = await prisma.order.findMany({
            where: {
                orderItems: {
                    some: {
                        product: {
                            sellerId: session.user.id
                        }
                    }
                },
                ...(status && status !== "ALL" ? { status: status as OrderStatus } : {})
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
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Calculate total for seller's items only
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedOrders = orders.map((order: any) => ({
            ...order,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            totalAmount: order.orderItems.reduce((acc: number, item: any) => acc + (Number(item.price) * item.quantity), 0)
        }))

        return NextResponse.json(formattedOrders)
    } catch (error) {
        console.error("[SELLER_ORDERS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
