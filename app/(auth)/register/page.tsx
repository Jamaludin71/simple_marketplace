"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const registerSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Alamat email tidak valid"),
    password: z.string().min(6, "Kata sandi minimal 6 karakter"),
    confirmPassword: z.string(),
    role: z.enum(["BUYER", "SELLER"]),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Kata sandi tidak cocok",
    path: ["confirmPassword"],
})

type RegisterValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "BUYER",
        },
    })

    async function onSubmit(data: RegisterValues) {
        setIsLoading(true)

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    role: data.role,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || "Pendaftaran gagal")
            }

            toast({
                title: "Pendaftaran berhasil",
                description: "Anda sekarang dapat masuk dengan akun Anda",
            })

            router.push("/login")
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Pendaftaran gagal",
                description: error instanceof Error ? error.message : "Terjadi kesalahan",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="border-border/60 shadow-lg">
            <CardHeader className="space-y-3 pb-6">
                <CardTitle className="text-3xl font-serif font-semibold tracking-tight">
                    Daftar
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                    Buat akun baru untuk mulai membeli atau menjual produk
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Nama Lengkap
                        </Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            disabled={isLoading}
                            className="h-11 border-border/60 focus-visible:ring-accent/50"
                            {...register("name")}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="nama@example.com"
                            disabled={isLoading}
                            className="h-11 border-border/60 focus-visible:ring-accent/50"
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium">
                            Saya ingin...
                        </Label>
                        <Select
                            defaultValue="BUYER"
                            onValueChange={(value) => setValue("role", value as "BUYER" | "SELLER")}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="h-11 border-border/60 focus:ring-accent/50">
                                <SelectValue placeholder="Pilih peran" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BUYER">Membeli Produk</SelectItem>
                                <SelectItem value="SELLER">Menjual Produk</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.role && (
                            <p className="text-sm text-destructive">{errors.role.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                            Kata Sandi
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                disabled={isLoading}
                                className="h-11 border-border/60 focus-visible:ring-accent/50 pr-10"
                                {...register("password")}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="sr-only">
                                    {showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                                </span>
                            </Button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-destructive">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                            Konfirmasi Kata Sandi
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                disabled={isLoading}
                                className="h-11 border-border/60 focus-visible:ring-accent/50"
                                {...register("confirmPassword")}
                            />
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-destructive">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-sm mt-6" 
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Daftar Sekarang
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
                <p className="text-sm text-muted-foreground">
                    Sudah punya akun?{" "}
                    <Link
                        href="/login"
                        className="text-accent font-medium hover:text-accent/80 underline-offset-4 hover:underline transition-colors"
                    >
                        Masuk
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
