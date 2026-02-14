import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        // Protect seller routes
        if (path.startsWith("/seller") && token?.role !== "SELLER" && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }

        // Protect admin routes
        if (path.startsWith("/admin") && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
)

export const config = {
    matcher: ["/seller/:path*", "/admin/:path*", "/cart", "/checkout", "/orders"],
}
