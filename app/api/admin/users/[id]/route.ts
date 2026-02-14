import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateRoleSchema = z.object({
    role: z.enum(["BUYER", "SELLER", "ADMIN"])
})

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { role } = updateRoleSchema.parse(body)

        // Prevent modifying own role
        if (params.id === session.user.id) {
            return new NextResponse("Cannot modify your own role", { status: 400 })
        }

        const user = await prisma.user.update({
            where: {
                id: params.id
            },
            data: {
                role
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error("[ADMIN_USER_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Prevent deleting self
        if (params.id === session.user.id) {
            return new NextResponse("Cannot delete your own account", { status: 400 })
        }

        await prisma.user.delete({
            where: {
                id: params.id
            }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("[ADMIN_USER_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
