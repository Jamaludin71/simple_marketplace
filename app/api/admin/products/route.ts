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
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const skip = (page - 1) * limit

        const where = {
            OR: [
                { name: { contains: query } }, // Case-insensitive handled by Prisma default for some providers, but standard contains here
                { description: { contains: query } },
                { seller: { name: { contains: query } } }
            ]
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    category: true,
                    seller: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            }),
            prisma.product.count({ where })
        ])

        return NextResponse.json({
            products,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        })
    } catch (error) {
        console.error("[ADMIN_PRODUCTS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
