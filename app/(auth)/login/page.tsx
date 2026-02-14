"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
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
import { useToast } from "@/hooks/use-toast"

const loginSchema = z.object({
    email: z.string().email("Alamat email tidak valid"),
    password: z.string().min(1, "Kata sandi diperlukan"),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(data: LoginValues) {
        setIsLoading(true)

        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            })

            if (result?.error) {
                toast({
                    variant: "destructive",
                    title: "Gagal masuk",
                    description: "Email atau kata sandi salah",
                })
                return
            }

            router.refresh()
            router.push("/")
            toast({
                title: "Berhasil masuk",
                description: "Selamat datang kembali!",
            })
        } catch {
            toast({
                variant: "destructive",
                title: "Terjadi kesalahan",
                description: "Silakan coba lagi nanti",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="border-border/60 shadow-lg">
            <CardHeader className="space-y-3 pb-6">
                <CardTitle className="text-3xl font-serif font-semibold tracking-tight">
                    Masuk
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                    Masukkan email dan kata sandi Anda untuk mengakses akun
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    <Button 
                        type="submit" 
                        className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-sm mt-6" 
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Masuk
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
                <p className="text-sm text-muted-foreground">
                    Belum punya akun?{" "}
                    <Link
                        href="/register"
                        className="text-accent font-medium hover:text-accent/80 underline-offset-4 hover:underline transition-colors"
                    >
                        Daftar sekarang
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
