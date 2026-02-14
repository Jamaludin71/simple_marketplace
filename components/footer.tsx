import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-card mt-24">
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand Section */}
                    <div className="md:col-span-1">
                        <Link href="/" className="inline-block mb-4">
                            <span className="font-serif text-2xl font-semibold text-foreground">
                                MiniShop
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Platform marketplace terpercaya untuk semua kebutuhan belanja Anda.
                        </p>
                    </div>

                    {/* Shop Section */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Belanja</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/products" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                                    Semua Produk
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                                    Kategori
                                </Link>
                            </li>
                            <li>
                                <Link href="/cart" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                                    Keranjang
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Account Section */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Akun</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/profile" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                                    Profil Saya
                                </Link>
                            </li>
                            <li>
                                <Link href="/orders" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                                    Pesanan Saya
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                                    Masuk / Daftar
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social Section */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Ikuti Kami</h4>
                        <div className="flex gap-3">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noreferrer"
                                className="h-9 w-9 rounded-full border border-border hover:border-accent hover:bg-accent/10 flex items-center justify-center transition-all group"
                            >
                                <Facebook className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noreferrer"
                                className="h-9 w-9 rounded-full border border-border hover:border-accent hover:bg-accent/10 flex items-center justify-center transition-all group"
                            >
                                <Instagram className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noreferrer"
                                className="h-9 w-9 rounded-full border border-border hover:border-accent hover:bg-accent/10 flex items-center justify-center transition-all group"
                            >
                                <Twitter className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                            </a>
                            <a
                                href="mailto:contact@minishop.com"
                                className="h-9 w-9 rounded-full border border-border hover:border-accent hover:bg-accent/10 flex items-center justify-center transition-all group"
                            >
                                <Mail className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border/40 mt-12 pt-8">
                    <p className="text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} MiniShop. Tugas PKK - SMK. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
