import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true,
                _count: {
                    select: {
                        orders: true,
                    }
                }
            }
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error("[ADMIN_USERS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
