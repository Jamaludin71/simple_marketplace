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

        const product = await prisma.product.findUnique({
            where: {
                id: params.id,
                sellerId: session.user.id
            }
        })

        if (!product) {
            return new NextResponse("Not Found", { status: 404 })
        }

        const updatedProduct = await prisma.product.update({
            where: {
                id: params.id
            },
            data: {
                status: product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
            }
        })

        return NextResponse.json(updatedProduct)
    } catch (error) {
        console.error("[SELLER_PRODUCT_TOGGLE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
