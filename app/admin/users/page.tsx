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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search, Shield, Trash } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface User {
    id: string
    name: string
    email: string
    role: "BUYER" | "SELLER" | "ADMIN"
    avatar: string | null
    createdAt: string
    _count: {
        orders: number
    }
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("ALL")
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
    const [newRole, setNewRole] = useState<string>("")

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/admin/users")
            if (!response.ok) throw new Error("Failed to fetch users")
            const data = await response.json()
            setUsers(data)
        } catch {
            toast({
                title: "Gagal",
                description: "Gagal memuat pengguna",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteUser = async () => {
        if (!selectedUser) return

        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const error = await response.text()
                throw new Error(error)
            }

            toast({
                title: "Berhasil",
                description: "Pengguna berhasil dihapus",
            })
            fetchUsers()
            setIsDeleteDialogOpen(false)
        } catch (error) {
            toast({
                title: "Gagal",
                description: error instanceof Error ? error.message : "Gagal menghapus pengguna",
                variant: "destructive",
            })
        }
    }

    const handleUpdateRole = async () => {
        if (!selectedUser || !newRole) return

        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role: newRole }),
            })

            if (!response.ok) {
                const error = await response.text()
                throw new Error(error)
            }

            toast({
                title: "Berhasil",
                description: "Peran pengguna berhasil diperbarui",
            })
            fetchUsers()
            setIsRoleDialogOpen(false)
        } catch (error) {
            toast({
                title: "Gagal",
                description: error instanceof Error ? error.message : "Gagal memperbarui peran",
                variant: "destructive",
            })
        }
    }

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter
        return matchesSearch && matchesRole
    })

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-red-100 text-red-800 hover:bg-red-100"
            case "SELLER":
                return "bg-blue-100 text-blue-800 hover:bg-blue-100"
            default:
                return "bg-green-100 text-green-800 hover:bg-green-100"
        }
    }

    if (isLoading) {
        return <div className="p-8 text-center">Memuat pengguna...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari pengguna..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter berdasarkan peran" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Semua Peran</SelectItem>
                        <SelectItem value="BUYER">Pembeli</SelectItem>
                        <SelectItem value="SELLER">Penjual</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pengguna</TableHead>
                            <TableHead>Peran</TableHead>
                            <TableHead>Tanggal Bergabung</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={user.avatar || ""} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>{formatDate(user.createdAt)}</TableCell>
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
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setSelectedUser(user)
                                                    setNewRole(user.role)
                                                    setIsRoleDialogOpen(true)
                                                }}
                                            >
                                                <Shield className="mr-2 h-4 w-4" />
                                                Ubah Peran
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => {
                                                    setSelectedUser(user)
                                                    setIsDeleteDialogOpen(true)
                                                }}
                                            >
                                                <Trash className="mr-2 h-4 w-4" />
                                                Hapus Pengguna
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Tidak ada pengguna ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Pengguna</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus <strong>{selectedUser?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteUser}>
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Role Change Dialog */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Peran Pengguna</DialogTitle>
                        <DialogDescription>
                            Perbarui peran untuk <strong>{selectedUser?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={newRole} onValueChange={setNewRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih peran" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BUYER">Pembeli</SelectItem>
                                <SelectItem value="SELLER">Penjual</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleUpdateRole}>Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}


