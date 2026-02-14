import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { generateSlug } from "@/lib/utils"

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be positive"),
    stock: z.coerce.number().int().min(0, "Stock must be non-negative"),
    categoryId: z.coerce.number().int().positive("Category is required"),
    image: z.string().optional(),
})

// ... GET function

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "SELLER") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const validatedData = productSchema.parse(body)

        const product = await prisma.product.findUnique({
            where: {
                id: params.id,
                sellerId: session.user.id
            }
        })

        if (!product) {
            return new NextResponse("Not Found", { status: 404 })
        }
        
        // Update slug if name changes
        let slug = product.slug
        if (validatedData.name !== product.name) {
             slug = generateSlug(validatedData.name) + '-' + Date.now()
        }

        const updatedProduct = await prisma.product.update({
            where: {
                id: params.id
            },
            data: {
                ...validatedData,
                slug
            }
        })

        return NextResponse.json(updatedProduct)
    } catch (error) {
         if (error instanceof z.ZodError) {
            return new NextResponse("Invalid data", { status: 400 })
        }
        console.error("[SELLER_PRODUCT_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
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

        await prisma.product.delete({
            where: {
                id: params.id
            }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("[SELLER_PRODUCT_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
