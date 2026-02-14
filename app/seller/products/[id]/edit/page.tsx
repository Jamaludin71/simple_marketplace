"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import ImageUpload from "@/components/image-upload"

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    stock: z.coerce.number().int().min(0, "Stock must be non-negative"),
    categoryId: z.coerce.number().min(1, "Category is required"),
    image: z.string().min(1, "Image is required"),
})

interface Category {
    id: number
    name: string
}

export default function EditProductPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            stock: 0,
            categoryId: 0,
            image: "",
        },
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, productRes] = await Promise.all([
                    fetch("/api/categories"),
                    fetch(`/api/seller/products/${params.id}`)
                ])

                if (!categoriesRes.ok || !productRes.ok) throw new Error("Failed to fetch data")

                const categoriesData = await categoriesRes.json()
                const productData = await productRes.json()

                setCategories(categoriesData)
                form.reset({
                    name: productData.name,
                    description: productData.description || "",
                    price: Number(productData.price),
                    stock: productData.stock,
                    categoryId: productData.categoryId,
                    image: productData.image || "",
                })
            } catch {
                toast({
                    title: "Error",
                    description: "Failed to load product data",
                    variant: "destructive",
                })
                router.push("/seller/products")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [params.id, form, router])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/seller/products/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                throw new Error("Failed to update product")
            }

            toast({
                title: "Success",
                description: "Product updated successfully",
            })
            router.push("/seller/products")
            router.refresh()
        } catch {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="flex justify-center p-8">Loading...</div>
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Image</FormLabel>
                                    <FormControl>
                                        <ImageUpload
                                            value={field.value ? [field.value] : []}
                                            onChange={(url) => field.onChange(url)}
                                            onRemove={() => field.onChange("")}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Product name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                            defaultValue={field.value ? field.value.toString() : undefined}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Product description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} value={field.value as number ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} value={field.value as number ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                Update Product
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}
