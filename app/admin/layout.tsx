"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-current-user"
import { LayoutDashboard, Users, Tag, Package, ShoppingBag, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const user = useCurrentUser()

    const routes = [
        {
            href: "/admin/dashboard",
            label: "Beranda",
            icon: LayoutDashboard,
            active: pathname === "/admin/dashboard",
        },
        {
            href: "/admin/users",
            label: "Pengguna",
            icon: Users,
            active: pathname.includes("/admin/users"),
        },
        {
            href: "/admin/categories",
            label: "Kategori",
            icon: Tag,
            active: pathname.includes("/admin/categories"),
        },
        {
            href: "/admin/products",
            label: "Produk",
            icon: Package,
            active: pathname.includes("/admin/products"),
        },
        {
            href: "/admin/orders",
            label: "Semua Pesanan",
            icon: ShoppingBag,
            active: pathname.includes("/admin/orders"),
        },
    ]

    const onLogout = async () => {
        await signOut({ callbackUrl: "/" })
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-slate-50">
            {/* Mobile Sidebar */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="md:hidden fixed top-4 left-4 z-50 p-2">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-slate-900 text-slate-100 border-slate-800">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold">Admin Panel</h2>
                        <p className="text-sm text-slate-400">{user?.name}</p>
                    </div>
                    <nav className="flex flex-col gap-2 p-4">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                                    route.active
                                        ? "bg-slate-800 text-white"
                                        : "hover:bg-slate-800/50 text-slate-300"
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
            <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-slate-900 text-slate-100 min-h-screen">
                <div className="p-6 border-b border-slate-800 h-16 flex items-center">
                    <Link href="/" className="font-bold text-lg flex items-center gap-2">
                        <LayoutDashboard className="h-6 w-6" />
                        MiniShop Admin
                    </Link>
                </div>
                <nav className="flex-1 flex flex-col gap-2 p-4">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                                route.active
                                    ? "bg-slate-800 text-white"
                                    : "hover:bg-slate-800/50 text-slate-300"
                            }`}
                        >
                            <route.icon className="h-5 w-5" />
                            {route.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800">
                     <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={onLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Keluar
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm">
                    <h1 className="text-lg font-semibold md:ml-0 ml-10 text-slate-800">
                        {routes.find((r) => r.active)?.label || "Dashboard"}
                    </h1>
                    <div className="flex items-center gap-4">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9 border">
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
