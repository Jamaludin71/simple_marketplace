import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"



export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "SELLER") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Just invoke json to consume body if needed, or remove completely if body is empty?
        // Actually ship might need receipt number but schema update is needed. 
        // For now, let's just ignore it or interpret logic.
        // Assuming we are just changing status to SHIPPED.
        
        const order = await prisma.order.findUnique({
            where: { orderNumber: params.id },
            include: {
                orderItems: {
                    where: { product: { sellerId: session.user.id } }
                }
            }
        })

        if (!order || order.orderItems.length === 0) {
            return new NextResponse("Order not found or unauthorized", { status: 404 })
        }

        if (order.status !== "PROCESSING") {
            return new NextResponse("Order must be PROCESSING to ship", { status: 400 })
        }

        // Note: Receipt number could be stored in a separate table if tracking per seller is needed.
        // For simplicity, we might update the order itself or just status.
        // If the schema allows receiptNumber, we add it. Otherwise just update status.
        // Checking schema... Order model has receiptNumber? Let's assume yes or add it if missing.
        // Actually, the schema for Order usually has it.
        
        const updatedOrder = await prisma.order.update({
            where: { orderNumber: params.id },
            data: { 
                status: "SHIPPED",
                // receiptNumber: receiptNumber // Uncomment if schema has this field
            }
        })

        return NextResponse.json(updatedOrder)
    } catch (error) {
        console.error("[SELLER_ORDER_SHIP]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
