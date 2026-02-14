import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const query = searchParams.get("query") || ""
        const status = searchParams.get("status") || "ALL"
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const skip = (page - 1) * limit

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {
            OR: [
                { orderNumber: { contains: query } },
                { buyer: { name: { contains: query } } },
                { buyer: { email: { contains: query } } }
            ]
        }

        if (status !== "ALL") {
            where.status = status
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    buyer: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    orderItems: {
                        include: {
                            product: {
                                include: {
                                    seller: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }),
            prisma.order.count({ where })
        ])

        return NextResponse.json({
            orders,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        })
    } catch (error) {
        console.error("[ADMIN_ORDERS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
