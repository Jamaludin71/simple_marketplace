"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useCartStore } from "@/store/cart-store"
import { signOut } from "next-auth/react"
import { ShoppingCart, User, LogOut, Search, Menu, Package, LayoutDashboard } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

export function Navbar() {
    const user = useCurrentUser()
    const pathname = usePathname()
    const { fetchCart, totalItems } = useCartStore()

    useEffect(() => {
        if (user) {
            fetchCart()
        }
    }, [user, fetchCart])

    const onLogout = async () => {
        await signOut({ callbackUrl: "/" })
    }

    const isSeller = user?.role === "SELLER"
    const isAdmin = user?.role === "ADMIN"

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
            <div className="container flex h-20 items-center px-6">
                {/* Desktop Logo & Nav */}
                <div className="mr-8 hidden md:flex">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <span className="font-serif text-2xl font-semibold tracking-tight text-foreground group-hover:text-accent transition-colors">
                            MiniShop
                        </span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center space-x-8">
                    <Link
                        href="/products"
                        className={`text-base font-medium transition-colors hover:text-accent ${
                            pathname === "/products" ? "text-foreground" : "text-muted-foreground"
                        }`}
                    >
                        Produk
                    </Link>
                    <Link
                        href="/categories"
                        className={`text-base font-medium transition-colors hover:text-accent ${
                            pathname === "/categories" ? "text-foreground" : "text-muted-foreground"
                        }`}
                    >
                        Kategori
                    </Link>
                </nav>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                        >
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Buka Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="pr-0 w-80">
                        <Link href="/" className="flex items-center mb-8">
                            <span className="font-serif text-2xl font-semibold">MiniShop</span>
                        </Link>
                        <div className="flex flex-col space-y-4 text-lg">
                            <Link href="/products" className="font-medium hover:text-accent transition-colors">Produk</Link>
                            <Link href="/categories" className="font-medium hover:text-accent transition-colors">Kategori</Link>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Search & Actions */}
                <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none md:min-w-[300px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari produk..."
                                className="pl-10 h-11 bg-background border-border/60 focus-visible:ring-accent/50"
                            />
                        </div>
                    </div>

                    <nav className="flex items-center space-x-3">
                        {user ? (
                            <>
                                <Button variant="ghost" size="icon" className="relative hover:bg-accent/10 hover:text-accent" asChild>
                                    <Link href="/cart">
                                        <ShoppingCart className="h-5 w-5" />
                                        {totalItems() > 0 && (
                                            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-accent text-accent-foreground border-0">
                                                {totalItems()}
                                            </Badge>
                                        )}
                                        <span className="sr-only">Keranjang</span>
                                    </Link>
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-1 ring-border hover:ring-accent/50 transition-all">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                                                <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                                                    {user.name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-60" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal py-3">
                                            <div className="flex flex-col space-y-1.5">
                                                <p className="text-sm font-semibold leading-none">{user.name}</p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                                            <Link href="/profile">
                                                <User className="mr-3 h-4 w-4" />
                                                <span>Profil</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                                            <Link href="/orders">
                                                <Package className="mr-3 h-4 w-4" />
                                                <span>Pesanan Saya</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        {(isSeller || isAdmin) && (
                                            <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                                                <Link href={isAdmin ? "/admin/dashboard" : "/seller/dashboard"}>
                                                    <LayoutDashboard className="mr-3 h-4 w-4" />
                                                    <span>Dashboard</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={onLogout} className="cursor-pointer py-2.5 text-destructive focus:text-destructive">
                                            <LogOut className="mr-3 h-4 w-4" />
                                            <span>Keluar</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="default" className="hover:bg-accent/10 hover:text-accent font-medium" asChild>
                                    <Link href="/login">Masuk</Link>
                                </Button>
                                <Button size="default" className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium shadow-sm" asChild>
                                    <Link href="/register">Daftar</Link>
                                </Button>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}
