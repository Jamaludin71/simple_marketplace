import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { generateSlug } from "@/lib/utils"

const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
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
        const { name } = categorySchema.parse(body)

        const slug = generateSlug(name)

        // Check if other category has same slug
        const existingCategory = await prisma.category.findFirst({
            where: {
                slug,
                NOT: {
                    id: parseInt(params.id)
                }
            }
        })

        if (existingCategory) {
            return new NextResponse("Category name already taken", { status: 400 })
        }

        const category = await prisma.category.update({
            where: {
                id: parseInt(params.id)
            },
            data: {
                name,
                slug
            }
        })

        return NextResponse.json(category)
    } catch (error) {
        console.error("[ADMIN_CATEGORY_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const categoryId = parseInt(params.id)

        // Check if category has products
        const productsCount = await prisma.product.count({
            where: {
                categoryId
            }
        })

        if (productsCount > 0) {
            return new NextResponse("Cannot delete category with existing products", { status: 400 })
        }

        await prisma.category.delete({
            where: {
                id: categoryId
            }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("[ADMIN_CATEGORY_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
