"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-current-user"
import { LayoutDashboard, Package, ShoppingBag, Settings, Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const user = useCurrentUser()

    const routes = [
        {
            href: "/seller/dashboard",
            label: "Beranda",
            icon: LayoutDashboard,
            active: pathname === "/seller/dashboard",
        },
        {
            href: "/seller/products",
            label: "Produk",
            icon: Package,
            active: pathname.includes("/seller/products"),
        },
        {
            href: "/seller/orders",
            label: "Pesanan",
            icon: ShoppingBag,
            active: pathname.includes("/seller/orders"),
        },
        {
            href: "/seller/settings",
            label: "Pengaturan",
            icon: Settings,
            active: pathname === "/seller/settings",
        },
    ]

    const onLogout = async () => {
        await signOut({ callbackUrl: "/" })
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Mobile Sidebar */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="md:hidden fixed top-4 left-4 z-50 p-2">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold">Seller Center</h2>
                        <p className="text-sm text-muted-foreground">{user?.name}&apos;s Store</p>
                    </div>
                    <nav className="flex flex-col gap-2 p-4">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                                    route.active
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                }`}
                            >
                                <route.icon className="h-5 w-5" />
                                {route.label}
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40 min-h-screen">
                <div className="p-6 border-b h-16 flex items-center">
                    <Link href="/" className="font-bold text-lg flex items-center gap-2">
                        <Package className="h-6 w-6" />
                        MiniShop Seller
                    </Link>
                </div>
                <nav className="flex-1 flex flex-col gap-2 p-4">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                                route.active
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                            }`}
                        >
                            <route.icon className="h-5 w-5" />
                            {route.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t">
                     <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={onLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Keluar
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="h-16 border-b flex items-center justify-between px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <h1 className="text-lg font-semibold md:ml-0 ml-10">
                        {routes.find((r) => r.active)?.label || "Seller Center"}
                    </h1>
                    <div className="flex items-center gap-4">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href="/">Kembali ke Marketplace</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onLogout}>
                                    Keluar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <div className="flex-1 p-6 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
