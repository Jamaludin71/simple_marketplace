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

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "SELLER") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const validatedData = productSchema.parse(body)

        // Generate slug from name
        const slug = generateSlug(validatedData.name) + '-' + Date.now()

        const product = await prisma.product.create({
            data: {
                ...validatedData,
                slug,
                sellerId: session.user.id,
                status: "ACTIVE"
            }
        })

        return NextResponse.json(product)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid data", { status: 400 })
        }
        console.error("[SELLER_PRODUCTS_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "SELLER") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const query = searchParams.get("query") || ""

        const products = await prisma.product.findMany({
            where: {
                sellerId: session.user.id,
                name: {
                    contains: query,
                    mode: 'insensitive' // Ensure case-insensitive search
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                category: {
                    select: {
                        name: true
                    }
                }
            }
        })

        return NextResponse.json(products)
    } catch (error) {
        console.error("[SELLER_PRODUCTS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
