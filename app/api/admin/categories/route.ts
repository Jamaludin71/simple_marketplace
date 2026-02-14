import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { generateSlug } from "@/lib/utils"

const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
})

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                name: 'asc'
            },
            include: {
                _count: {
                    select: {
                        products: true
                    }
                }
            }
        })

        return NextResponse.json(categories)
    } catch (error) {
        console.error("[ADMIN_CATEGORIES_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { name } = categorySchema.parse(body)

        const slug = generateSlug(name)

        // Check if slug exists
        const existingCategory = await prisma.category.findUnique({
            where: {
                slug
            }
        })

        if (existingCategory) {
            return new NextResponse("Category already exists", { status: 400 })
        }

        const category = await prisma.category.create({
            data: {
                name,
                slug
            }
        })

        return NextResponse.json(category)
    } catch (error) {
        console.error("[ADMIN_CATEGORIES_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
