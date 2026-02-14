import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const product = await prisma.product.delete({
            where: {
                id: params.id
            }
        })

        return NextResponse.json(product)

    } catch (error) {
        console.error("[ADMIN_PRODUCT_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
