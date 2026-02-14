"use client"

import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pencil, Plus, MoreHorizontal, Trash } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
})

interface Category {
    id: number
    name: string
    slug: string
    _count: {
        products: number
    }
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

    const form = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
        },
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const response = await fetch("/api/admin/categories")
            if (!response.ok) throw new Error("Failed to fetch categories")
            const data = await response.json()
            setCategories(data)
        } catch {
            toast({
                title: "Gagal",
                description: "Gagal memuat kategori",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const onSubmit = async (values: z.infer<typeof categorySchema>) => {
        try {
            const url = editingCategory
                ? `/api/admin/categories/${editingCategory.id}`
                : "/api/admin/categories"
            
            const method = editingCategory ? "PATCH" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                const error = await response.text()
                throw new Error(error)
            }

            toast({
                title: "Berhasil",
                description: `Kategori berhasil ${editingCategory ? "diperbarui" : "dibuat"}`,
            })

            fetchCategories()
            handleCloseDialog()
        } catch (error) {
            toast({
                title: "Gagal",
                description: error instanceof Error ? error.message : "Terjadi kesalahan",
                variant: "destructive",
            })
        }
    }

    const handleDelete = async () => {
        if (!deletingCategory) return

        try {
            const response = await fetch(`/api/admin/categories/${deletingCategory.id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const error = await response.text()
                throw new Error(error)
            }

            toast({
                title: "Berhasil",
                description: "Kategori berhasil dihapus",
            })

            fetchCategories()
            setDeletingCategory(null)
        } catch (error) {
            toast({
                title: "Gagal",
                description: error instanceof Error ? error.message : "Gagal menghapus kategori",
                variant: "destructive",
            })
        }
    }

    const handleCloseDialog = () => {
        setIsCreateOpen(false)
        setEditingCategory(null)
        form.reset()
    }

    const handleEdit = (category: Category) => {
        setEditingCategory(category)
        form.setValue("name", category.name)
        setIsCreateOpen(true)
    }

    if (isLoading) {
        return <div className="p-8 text-center">Loading categories...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Kategori</h2>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kategori
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Produk</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell>{category.slug}</TableCell>
                                <TableCell>{category._count.products}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Buka menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Ubah
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                className="text-red-600"
                                                onClick={() => setDeletingCategory(category)}
                                            >
                                                <Trash className="mr-2 h-4 w-4" />
                                                Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {categories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Tidak ada kategori ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? "Ubah Kategori" : "Buat Kategori"}</DialogTitle>
                        <DialogDescription>
                            {editingCategory ? "Perbarui nama kategori." : "Tambahkan kategori baru ke platform."}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Elektronik" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                    Batal
                                </Button>
                                <Button type="submit">
                                    {editingCategory ? "Simpan Perubahan" : "Buat"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Kategori</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus <strong>{deletingCategory?.name}</strong>?
                            Tindakan ini tidak dapat dibatalkan. Anda tidak dapat menghapus kategori yang digunakan oleh produk.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingCategory(null)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
