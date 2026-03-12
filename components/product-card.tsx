import Link from "next/link"
import Image from "next/image"
import { ShoppingBag } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatRupiah } from "@/lib/utils"

interface ProductCardProps {
    name: string
    slug: string
    price: number
    image?: string | null
    stock: number
    sellerName: string
}

export function ProductCard({
    name,
    slug,
    price,
    image,
    stock,
    sellerName,
}: ProductCardProps) {
    return (
        <Link href={`/products/${slug}`} className="group">
            <Card className="overflow-hidden border border-border/60 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30 h-full flex flex-col">
                {/* Image - 3:4 aspect ratio untuk kesan portrait yang elegant */}
                <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                    {(() => {
                        let imageUrl = image;
                        if (image && image.startsWith('[') && image.endsWith(']')) {
                            try {
                                const parsed = JSON.parse(image);
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                    imageUrl = parsed[0];
                                }
                            } catch {
                                // Ignore
                            }
                        }

                        return imageUrl ? (
                            <>
                                <Image
                                    src={imageUrl}
                                    alt={name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                {/* Subtle overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <ShoppingBag className="h-16 w-16" />
                            </div>
                        );
                    })()}
                    
                    {/* Stock Badge */}
                    <div className="absolute top-3 right-3">
                        <Badge
                            variant={stock > 0 ? "secondary" : "destructive"}
                            className="bg-card/95 backdrop-blur-sm shadow-sm border-0 text-xs font-medium px-2.5 py-1"
                        >
                            {stock > 0 ? "Tersedia" : "Habis"}
                        </Badge>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    {/* Seller Name */}
                    <p className="text-xs text-muted-foreground mb-2 truncate">{sellerName}</p>
                    
                    {/* Product Name */}
                    <h3 className="font-medium text-base line-clamp-2 min-h-[3rem] leading-snug mb-3" title={name}>
                        {name}
                    </h3>
                    
                    {/* Price */}
                    <div className="mt-auto">
                        <p className="font-semibold text-xl text-accent tracking-tight">
                            {formatRupiah(price)}
                        </p>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
