import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Authentication - MiniShop',
    description: 'Login or Register to MiniShop',
}

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding Section */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-elegant-black via-secondary/20 to-elegant-black text-white overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(201,166,107,0.1),transparent_50%)]" />
                
                <div className="relative z-10 flex flex-col justify-center px-16 py-24 max-w-xl">
                    <Link href="/" className="mb-12 inline-block">
                        <span className="font-serif text-4xl font-bold tracking-tight hover:text-accent transition-colors">
                            MiniShop
                        </span>
                    </Link>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 backdrop-blur-sm mb-8 w-fit">
                        <Sparkles className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium text-accent">Marketplace Terpercaya</span>
                    </div>
                    
                    <h1 className="text-5xl font-serif font-bold tracking-tight mb-6 leading-tight">
                        Belanja dengan
                        <span className="block text-accent mt-2">Gaya & Elegance</span>
                    </h1>
                    
                    <p className="text-lg text-gray-300 leading-relaxed">
                        Bergabunglah dengan ribuan pengguna yang telah mempercayai MiniShop untuk kebutuhan belanja online mereka.
                    </p>

                    <div className="mt-12 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                                <span className="text-2xl">✓</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">Produk Berkualitas</h3>
                                <p className="text-sm text-gray-400">Terjamin kualitas terbaik</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                                <span className="text-2xl">✓</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">Transaksi Aman</h3>
                                <p className="text-sm text-gray-400">Pembayaran terpercaya</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                                <span className="text-2xl">✓</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">Pengiriman Cepat</h3>
                                <p className="text-sm text-gray-400">Sampai tepat waktu</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <Link href="/" className="lg:hidden mb-8 inline-block">
                        <span className="font-serif text-3xl font-bold tracking-tight text-foreground hover:text-accent transition-colors">
                            MiniShop
                        </span>
                    </Link>
                    
                    {children}
                </div>
            </div>
        </div>
    )
}
